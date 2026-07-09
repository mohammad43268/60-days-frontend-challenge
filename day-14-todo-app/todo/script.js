/**
 * TaskFlow - Premium Task Management System

 */
class TaskFlow {
  constructor() {
    // State
    this.tasks = [];
    this.filters = {
      search: "",
      status: "all", // all, active, completed
      sort: "newest", // newest, oldest, priority
    };

    this.priorityWeights = { high: 3, medium: 2, low: 1 };

    this.elements = {
      form: document.getElementById("task-form"),
      titleInput: document.getElementById("task-title"),
      descInput: document.getElementById("task-desc"),
      dateInput: document.getElementById("task-date"),
      priorityInput: document.getElementById("task-priority"),
      taskList: document.getElementById("task-list"),
      emptyState: document.getElementById("empty-state"),
      searchInput: document.getElementById("search-input"),
      filterStatus: document.getElementById("filter-status"),
      sortTasks: document.getElementById("sort-tasks"),
      toastContainer: document.getElementById("toast-container"),
      stats: {
        total: document.getElementById("stat-total"),
        completed: document.getElementById("stat-completed"),
        pending: document.getElementById("stat-pending"),
        progressFill: document.getElementById("progress-fill"),
        progressText: document.getElementById("progress-text"),
      },
    };

    this.init();
  }

  init() {
    this.loadTasks();
    this.addEventListeners();
    this.render();
  }

  loadTasks() {
    try {
      const saved = localStorage.getItem("taskflow_data");
      this.tasks = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading tasks:", error);
      this.showToast("Failed to load tasks from storage.", "error");
      this.tasks = [];
    }
  }

  saveTasks() {
    try {
      localStorage.setItem("taskflow_data", JSON.stringify(this.tasks));
      this.renderStats();
    } catch (error) {
      console.error("Error saving tasks:", error);
      this.showToast(
        "Failed to save tasks. LocalStorage might be full.",
        "error",
      );
    }
  }

  addEventListeners() {

    this.elements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.addTask();
    });

    this.elements.taskList.addEventListener("click", (e) => {
      const card = e.target.closest(".task-card");
      if (!card) return;

      const taskId = card.dataset.id;

      if (e.target.closest(".custom-checkbox")) {
        this.toggleTaskStatus(taskId);
      } else if (e.target.closest(".delete-btn")) {
        this.deleteTask(taskId);
      }
    });

    // Search & Filters
    this.elements.searchInput.addEventListener("input", (e) => {
      this.filters.search = e.target.value.toLowerCase();
      this.render();
    });

    this.elements.filterStatus.addEventListener("change", (e) => {
      this.filters.status = e.target.value;
      this.render();
    });

    this.elements.sortTasks.addEventListener("change", (e) => {
      this.filters.sort = e.target.value;
      this.render();
    });
  }

  // --- CRUD Operations ---
  addTask() {
    const title = this.elements.titleInput.value.trim();
    const desc = this.elements.descInput.value.trim();
    const date = this.elements.dateInput.value;
    const priority = this.elements.priorityInput.value;

    if (!title) return;

    const newTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: this.escapeHTML(title),
      desc: this.escapeHTML(desc),
      date,
      priority,
      completed: false,
      createdAt: Date.now(),
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    this.render();

    this.elements.form.reset();
    this.elements.priorityInput.value = "medium"; // Reset default
    this.showToast("Task added successfully!");
  }

  toggleTaskStatus(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
      if (task.completed) this.showToast("Task completed! 🎉");
    }
  }

  deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.saveTasks();
      this.render();
      this.showToast("Task deleted.");
    }
  }

  // --- Processing & Filtering ---
  getProcessedTasks() {
    // 1. Filter
    let processed = this.tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(this.filters.search) ||
        task.desc.toLowerCase().includes(this.filters.search);
      const matchesStatus =
        this.filters.status === "all" ||
        (this.filters.status === "completed" && task.completed) ||
        (this.filters.status === "active" && !task.completed);
      return matchesSearch && matchesStatus;
    });

    // 2. Sort
    processed.sort((a, b) => {
      switch (this.filters.sort) {
        case "oldest":
          return a.createdAt - b.createdAt;
        case "priority":
          return (
            this.priorityWeights[b.priority] - this.priorityWeights[a.priority]
          );
        case "newest":
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return processed;
  }

  // --- Rendering ---
  render() {
    const filteredTasks = this.getProcessedTasks();
    this.elements.taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
      this.elements.emptyState.classList.remove("hidden");
    } else {
      this.elements.emptyState.classList.add("hidden");

      const fragment = document.createDocumentFragment();
      filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        li.innerHTML = this.generateTaskHTML(task);
        fragment.appendChild(li);
      });
      this.elements.taskList.appendChild(fragment);
    }

    this.renderStats();
  }

  generateTaskHTML(task) {
    const dateStr = task.date
      ? new Date(task.date).toLocaleDateString()
      : "No date";

    return `
            <div class="task-card ${task.completed ? "completed" : ""}" data-id="${task.id}">
                <div class="custom-checkbox" role="checkbox" aria-checked="${task.completed}" tabindex="0">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="task-content">
                    <h3 class="task-title">${task.title}</h3>
                    ${task.desc ? `<p class="task-desc">${task.desc}</p>` : ""}
                    <div class="task-meta">
                        <span class="badge priority-${task.priority}">${task.priority}</span>
                        <span class="date-badge">📅 ${dateStr}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon delete-btn" aria-label="Delete task" title="Delete">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
  }

  renderStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    this.elements.stats.total.textContent = total;
    this.elements.stats.completed.textContent = completed;
    this.elements.stats.pending.textContent = pending;

    this.elements.stats.progressFill.style.width = `${percentage}%`;
    this.elements.stats.progressText.textContent = `${percentage}%`;
  }

  // --- Utilities ---
  showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideInRight 0.3s reverse forwards";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TaskFlow();
});
