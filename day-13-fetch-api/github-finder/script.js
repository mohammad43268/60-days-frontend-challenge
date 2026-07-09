class APIError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

const showToast = (message, type = "info") => {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast glass ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

class Store {
  constructor() {
    this.state = {
      users: [],
      posts: [],
      quotes: [],
      loading: false,
      errors: [],
      theme: localStorage.getItem("theme") || "light",
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

const appState = new Store();

const BASE_URLS = {
  users: "https://randomuser.me/api/?results=10&nat=IN",
  posts: "https://jsonplaceholder.typicode.com/posts",
  quotes: "https://api.quotable.io/quotes/random?limit=5",
};

const fetchWithRetry = async (url, options = {}, retries = 3) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new APIError(
        `HTTP error! status: ${response.status}`,
        response.status,
        url,
      );
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying... (${retries} left) for ${url}`);
      await new Promise((res) => setTimeout(res, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

const fetchDashboardData = async () => {
  try {
    const [userData, posts] = await Promise.all([
      fetchWithRetry(BASE_URLS.users),
      fetchWithRetry(BASE_URLS.posts),
    ]);

    return { users: userData.results, posts };
  } catch (error) {
    console.error("Dashboard Data Fetch Failed:", error);
    throw error;
  }
};

const contentArea = document.getElementById("content-area");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("global-search");
const themeBtn = document.getElementById("theme-btn");

const initApp = async () => {
  applyTheme(appState.getState().theme);
  setupEventListeners();
  await loadDashboard();
};

const loadDashboard = async () => {
  appState.setState({ loading: true });
  toggleLoader(true);

  try {
    const data = await fetchDashboardData();
    appState.setState({
      users: data.users,
      posts: data.posts,
      loading: false,
    });
    renderDashboard();
    showToast("Data loaded successfully", "success");
  } catch (error) {
    appState.setState({
      loading: false,
      errors: [...appState.getState().errors, error],
    });
    renderErrorState(error);
    showToast("Failed to load dashboard", "error");
  } finally {
    toggleLoader(false);
  }
};

const renderDashboard = () => {
  const { users, posts } = appState.getState();

  const totalUsers = users?.length ?? 0;
  const totalPosts = posts?.length ?? 0;

  const html = `
    <div class="fade-in">
        <h1 style="margin-bottom: 24px; font-size: 40px;">System Overview</h1>
        <div class="stats-grid">
            <div class="card glass stat-card">
                <h3>Total Users</h3>
                <span class="stat-value">${totalUsers}</span>
            </div>
            <div class="card glass stat-card">
                <h3>Total Posts</h3>
                <span class="stat-value">${totalPosts}</span>
            </div>
        </div>
        
        <h2>Recent Users</h2>
        <div class="users-grid" style="display: grid; gap: 16px; margin-top: 16px;">
            ${users
              .slice(0, 5)
              .map(
                (user) => `
                <div class="card glass fade-in">
                    <h3>${user.name.first} ${user.name.last}</h3>
                    <p>${user.email}</p>
                    <small>📍 ${user.location.city}, ${user.location.state}</small> 
                </div>
            `,
              )
              .join("")}
        </div>
    </div>
  `;

  if (contentArea) contentArea.innerHTML = html;
};

const renderErrorState = (error) => {
  if (contentArea) {
    contentArea.innerHTML = `
        <div class="card glass fade-in" style="border-color: var(--clr-error);">
            <h2 style="color: var(--clr-error);">System Error</h2>
            <p>${error.message}</p>
            <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: var(--clr-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">Retry Request</button>
        </div>
    `;
  }
};

const setupEventListeners = () => {
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = appState.getState().theme;
      const newTheme = currentTheme === "light" ? "dark" : "light";
      appState.setState({ theme: newTheme });
      applyTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });

  const handleSearch = debounce((e) => {
    const query = e.target.value.toLowerCase();
    const { users } = appState.getState();

    const filteredUsers = users.filter((user) => {
      const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
      return (
        fullName.includes(query) || user.email.toLowerCase().includes(query)
      );
    });

    const usersGrid = document.querySelector(".users-grid");

    if (usersGrid) {
      if (filteredUsers.length === 0) {
        usersGrid.innerHTML = `<p style="padding: 20px; color: var(--clr-primary);">No users found matching "${query}"</p>`;
        return;
      }

      usersGrid.innerHTML = filteredUsers
        .slice(0, 5)
        .map(
          (user) => `
            <div class="card glass fade-in">
                <h3>${user.name.first} ${user.name.last}</h3>
                <p>${user.email}</p>
                <small>📍 ${user.location.city}, ${user.location.state}</small> 
            </div>
        `,
        )
        .join("");
    }
  }, 400);

  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }
};

const toggleLoader = (show) => {
  if (!loader) return;
  show ? loader.classList.remove("hidden") : loader.classList.add("hidden");
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

document.addEventListener("DOMContentLoaded", initApp);
