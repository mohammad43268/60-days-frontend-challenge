const developers = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Frontend Developer",
    skills: ["React", "JavaScript", "Tailwind", "Next.js"],
    location: "Bengaluru, India",
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "UI/UX Designer",
    skills: ["Figma", "CSS", "Prototyping", "Adobe XD"],
    location: "Pune, India",
  },
  {
    id: 3,
    name: "Rohan Desai",
    role: "Backend Developer",
    skills: ["Node.js", "Express", "MongoDB", "Python"],
    location: "Hyderabad, India",
  },
  {
    id: 4,
    name: "Ananya Singh",
    role: "Full Stack Engineer",
    skills: ["Vue.js", "Django", "PostgreSQL", "AWS"],
    location: "Noida, India",
  },
  {
    id: 5,
    name: "Vikram Reddy",
    role: "DevOps Specialist",
    skills: ["Kubernetes", "Docker", "Terraform", "CI/CD"],
    location: "Chennai, India",
  },
  {
    id: 6,
    name: "Neha Gupta",
    role: "Data Scientist",
    skills: ["Python", "TensorFlow", "SQL", "Pandas"],
    location: "Gurugram, India",
  },
];

const container = document.getElementById("cards-container");
const searchInput = document.getElementById("search-input");
const countDisplay = document.getElementById("dev-count");
const filterContainer = document.getElementById("filter-container");
const toastContainer = document.getElementById("toast-container");

let currentFilter = "All";

const extractUniqueSkills = () => {
  const allSkills = developers.flatMap((dev) => dev.skills);
  const uniqueSkills = [...new Set(allSkills)];
  return ["All", ...uniqueSkills.sort().slice(0, 7)];
};

const setupFilters = () => {
  const skillsToFilter = extractUniqueSkills();
  filterContainer.innerHTML = skillsToFilter
    .map(
      (skill) =>
        `<button class="filter-btn ${skill === currentFilter ? "active" : ""}" data-skill="${skill}">${skill}</button>`,
    )
    .join("");

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      currentFilter = e.target.getAttribute("data-skill");
      filterAndRender();
    });
  });
};

const showToast = (name) => {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    Connection request sent to ${name}
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideIn 0.3s ease reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

const createCard = (dev) => {
  const initials = dev.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card__avatar">${initials}</div>
    <h2 class="card__name">${dev.name}</h2>
    <p class="card__role">${dev.role}</p>
    <div class="card__skills">
      ${dev.skills.map((skill) => `<span class="card__skill">${skill}</span>`).join("")}
    </div>
    <div class="card__footer">
      <div class="card__location">
        <svg viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        ${dev.location}
      </div>
      <button class="connect-btn" data-name="${dev.name}">Connect</button>
    </div>
  `;

  const connectBtn = card.querySelector(".connect-btn");
  connectBtn.addEventListener("click", () => showToast(dev.name));

  return card;
};

const renderCards = (data) => {
  container.innerHTML = "";
  countDisplay.textContent = data.length;

  if (data.length === 0) {
    container.innerHTML = `<h2 style="color: var(--accent-light); text-align: center; grid-column: 1 / -1; margin-top: 40px;">No developers found matching your criteria</h2>`;
    return;
  }

  data.forEach((dev, index) => {
    const cardElement = createCard(dev);
    container.appendChild(cardElement);

    setTimeout(() => {
      cardElement.classList.add("show");
    }, index * 100);
  });
};

const filterAndRender = () => {
  const searchTerm = searchInput.value.toLowerCase().trim();

  const filteredData = developers.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchTerm) ||
      dev.role.toLowerCase().includes(searchTerm) ||
      dev.skills.some((s) => s.toLowerCase().includes(searchTerm));

    const matchesFilter =
      currentFilter === "All" || dev.skills.includes(currentFilter);

    return matchesSearch && matchesFilter;
  });

  renderCards(filteredData);
};

searchInput.addEventListener("input", filterAndRender);

setupFilters();
renderCards(developers);
