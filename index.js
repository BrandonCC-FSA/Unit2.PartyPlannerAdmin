// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2505-ftb-et-web-ft"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Add Party ===
const addParty = async (party) => {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(party),
    });
    if (!response.ok) throw new Error("Failed to add party");
    await getParties();
  } catch (e) {
    console.error(e);
  }
};

// === Delete Party ===
const deleteParty = async (id) => {
  try {
    const response = await fetch(API + "/events/" + id, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete party");
    selectedParty = null;
    await getParties();
  } catch (e) {
    console.error(e);
  }
};

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button id="delete-party">Delete Party</button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  $party.querySelector("#delete-party").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this party?")) {
      deleteParty(selectedParty.id);
    }
  });

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
    <form id="party-form">
      <label>
        Name
        <input id="party-name" required>
      </label>
      <label>
        Date
        <input id="date" type="date" required>
      </label>
      <label>
        Address
        <input id="address" required>
      </label>
      <label>
        Description
        <input id="description" required>
      </label>
      <button type="submit">Add Party</button>
    </form>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());

  // Handle form submission
  const $form = $app.querySelector("#party-form");
  $form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $form.querySelector("#party-name").value.trim();
    const dateInput = $form.querySelector("#date").value;
    const location = $form.querySelector("#address").value.trim();
    const description = $form.querySelector("#description").value.trim();
    if (!name || !dateInput || !location || !description) return;

    const isoDate = new Date(dateInput).toISOString();
    await addParty({ name, date: isoDate, location, description });
    $form.reset();
  });
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
