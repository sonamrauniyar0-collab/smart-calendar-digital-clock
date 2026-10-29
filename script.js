
const clock = document.getElementById("clock");
const todayDate = document.getElementById("today-date");
const monthYear = document.getElementById("month-year");
const calendarGrid = document.getElementById("calendar-grid");
const selectedDateText = document.getElementById("selected-date");
const eventList = document.getElementById("event-list");

const today = new Date();
today.setHours(0, 0, 0, 0);

let currentMonth = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

let selectedDate = new Date(today);
let events = [];

try {
  events = JSON.parse(
    localStorage.getItem("calendarEvents") || "[]"
  );

  if (!Array.isArray(events)) events = [];
} catch {
  events = [];
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function updateClock() {
  const now = new Date();

  clock.textContent = now.toLocaleTimeString();
  todayDate.textContent = now.toLocaleDateString(
    undefined,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  monthYear.textContent = currentMonth.toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  weekdays.forEach(name => {
    const cell = document.createElement("div");
    cell.className = "weekday";
    cell.textContent = name;
    calendarGrid.appendChild(cell);
  });

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const start = new Date(firstDay);
  start.setDate(1 - firstDay.getDay());

  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = date.getDate();

    if (date.getMonth() !== currentMonth.getMonth()) {
      cell.style.opacity = "0.35";
    }

    if (dateKey(date) === dateKey(today)) {
      cell.classList.add("today");
    }

    if (dateKey(date) === dateKey(selectedDate)) {
      cell.classList.add("selected");
    }

    if (events.some(event => event.date === dateKey(date))) {
      cell.classList.add("has-event");
    }

    cell.title = "Click to view events. Double-click to add.";

    cell.addEventListener("click", () => {
      selectedDate = new Date(date);
      currentMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );

      renderCalendar();
      renderEvents();
    });

    cell.addEventListener("dblclick", () => {
      selectedDate = new Date(date);
      currentMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );

      renderCalendar();
      renderEvents();
      addEvent();
    });

    calendarGrid.appendChild(cell);
  }
}

function renderEvents() {
  selectedDateText.textContent = selectedDate.toLocaleDateString(
    undefined,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

  eventList.innerHTML = "";

  const dayEvents = events.filter(
    event => event.date === dateKey(selectedDate)
  );

  if (dayEvents.length === 0) {
    const message = document.createElement("p");
    message.className = "empty";
    message.textContent = "No events for this date. Add a reminder!";
    eventList.appendChild(message);
    return;
  }

  dayEvents.forEach(event => {
    const item = document.createElement("div");
    item.className = "event-item";

    const title = document.createElement("strong");
    title.textContent = event.title;

    const details = document.createElement("p");
    details.textContent =
      (event.time || "Any time") +
      (event.notes ? " — " + event.notes : "");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      if (confirm("Delete this event?")) {
        events = events.filter(
          savedEvent => savedEvent.id !== event.id
        );

        saveEvents();
        renderCalendar();
        renderEvents();
      }
    });

    item.append(title, details, deleteButton);
    eventList.appendChild(item);
  });
}

function saveEvents() {
  localStorage.setItem(
    "calendarEvents",
    JSON.stringify(events)
  );
}

function addEvent() {
  const title = prompt("Enter your event or reminder:");

  if (title === null || !title.trim()) return;

  const time = prompt("Enter time (e.g. 10:30 AM), or leave blank:");

  const notes = prompt("Enter optional notes, or leave blank:");

  events.push({
    id: Date.now().toString(),
    date: dateKey(selectedDate),
    title: title.trim(),
    time: time ? time.trim() : "",
    notes: notes ? notes.trim() : ""
  });

  saveEvents();
  renderCalendar();
  renderEvents();
}

document.getElementById("prev").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
});

document.getElementById("next").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
});

document.getElementById("add-event").addEventListener("click", addEvent);

updateClock();
setInterval(updateClock, 1000);

renderCalendar();
renderEvents();
