document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageEl = document.getElementById("message");

  async function fetchActivities() {
    try {
      const res = await fetch("/activities");
      if (!res.ok) throw new Error("Fehler beim Laden der Aktivitäten");
      const data = await res.json();
      renderActivities(data);
      populateSelect(Object.keys(data));
      return data;
    } catch (err) {
      showMessage(err.message, "error");
      activitiesList.innerHTML = "<p class='error'>Aktivitäten konnten nicht geladen werden.</p>";
      return {};
    }
  }

  function renderActivities(data) {
    activitiesList.innerHTML = "";
    const keys = Object.keys(data);
    if (keys.length === 0) {
      activitiesList.innerHTML = "<p>Keine Aktivitäten verfügbar.</p>";
      return;
    }

    keys.forEach((name) => {
      const a = data[name];
      const card = document.createElement("div");
      card.className = "activity-card";

      // Titel + Beschreibung
      const title = document.createElement("h4");
      title.textContent = name;
      card.appendChild(title);

      const desc = document.createElement("p");
      desc.textContent = a.description;
      card.appendChild(desc);

      const sched = document.createElement("p");
      sched.innerHTML = `<strong>Schedule:</strong> ${a.schedule}`;
      card.appendChild(sched);

      const cap = document.createElement("p");
      cap.innerHTML = `<strong>Capacity:</strong> ${a.participants.length} / ${a.max_participants}`;
      card.appendChild(cap);

      // Teilnehmer-Sektion
      const participantsSection = document.createElement("div");
      participantsSection.className = "participants-section";

      const participantsHeader = document.createElement("h5");
      participantsHeader.textContent = `Teilnehmer (${a.participants.length})`;
      participantsSection.appendChild(participantsHeader);

      if (a.participants && a.participants.length > 0) {
        const ul = document.createElement("ul");
        ul.className = "participants-list";
        a.participants.forEach((p) => {
          const li = document.createElement("li");
          li.textContent = p;
          ul.appendChild(li);
        });
        participantsSection.appendChild(ul);
      } else {
        const empty = document.createElement("p");
        empty.className = "participants-empty";
        empty.textContent = "Noch keine Teilnehmer.";
        participantsSection.appendChild(empty);
      }

      card.appendChild(participantsSection);
      activitiesList.appendChild(card);
    });
  }

  function populateSelect(names) {
    // Entferne bestehende Optionen (außer Placeholder)
    const current = activitySelect.querySelectorAll("option");
    // Behalte das Placeholder-Option (value === "")
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
    names.forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      activitySelect.appendChild(opt);
    });
  }

  function showMessage(text, type = "info") {
    messageEl.className = `message ${type}`;
    messageEl.textContent = text;
    messageEl.classList.remove("hidden");
    // Automatisch ausblenden nach 4s
    setTimeout(() => {
      messageEl.classList.add("hidden");
    }, 4000);
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const activity = document.getElementById("activity").value;

    if (!email || !activity) {
      showMessage("Bitte E-Mail und Aktivität auswählen.", "error");
      return;
    }

    try {
      const url = `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`;
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Signup fehlgeschlagen");
      }
      showMessage(data.message || "Erfolgreich angemeldet!", "success");
      // Aktualisiere Aktivitätenliste (und damit Teilnehmer)
      await fetchActivities();
      signupForm.reset();
    } catch (err) {
      showMessage(err.message, "error");
    }
  });

  // Initial laden
  fetchActivities();
});
