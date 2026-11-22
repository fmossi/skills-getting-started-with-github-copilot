document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const activityCount = document.getElementById("activity-count");
  const openSpots = document.getElementById("open-spots");
  const activityIcons = ["♟", "⌘", "⚡", "✦", "◆", "♫"];

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      if (!response.ok) throw new Error("Unable to load activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">Choose an activity</option>';

      const activityEntries = Object.entries(activities);
      activityCount.textContent = activityEntries.length;
      openSpots.textContent = activityEntries.reduce(
        (total, [, details]) =>
          total + Math.max(details.max_participants - details.participants.length, 0),
        0
      );

      // Populate activities list
      activityEntries.forEach(([name, details], index) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = Math.max(
          details.max_participants - details.participants.length,
          0
        );

        activityCard.innerHTML = `
          <span class="activity-icon" aria-hidden="true">${activityIcons[index % activityIcons.length]}</span>
          <h4>${name}</h4>
          <p class="description">${details.description}</p>
          <div class="activity-meta">
            <span>${details.schedule}</span>
            <span class="availability ${spotsLeft <= 3 ? "low" : ""}">${spotsLeft} spots</span>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML =
        '<p class="empty-state">We could not load the activities. Please try again later.</p>';
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
