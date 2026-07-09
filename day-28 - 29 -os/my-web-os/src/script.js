window.lucide.createIcons();
let zIndexCounter = 100;

const notesArea = document.getElementById("quick-notes");
notesArea.value = localStorage.getItem("aura_notes") || "";
notesArea.addEventListener("input", (e) =>
  localStorage.setItem("aura_notes", e.target.value),
);

function updateTimeWidget() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("live-time").innerText = timeString;
  document.getElementById("live-date").innerText = now.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const taskbarClock = document.getElementById("taskbar-clock");
  if (taskbarClock) taskbarClock.innerText = timeString;
}
setInterval(updateTimeWidget, 1000);
updateTimeWidget();

async function fetchWeather() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=28.45&longitude=77.02&current=temperature_2m",
    );
    const data = await res.json();
    document.getElementById("weather-temp").innerText =
      `${Math.round(data.current.temperature_2m)}°C`;
    document.getElementById("weather-desc").innerText = "Gurugram, IN";
  } catch {
    document.getElementById("weather-desc").innerText = "Offline";
  }
}

document.getElementById("boot-btn").addEventListener("click", async () => {
  try {
    if (document.documentElement.requestFullscreen)
      await document.documentElement.requestFullscreen();
  } catch {
    //
  }
  fetchWeather();

  const btn = document.getElementById("boot-btn");
  const textEl = document.getElementById("boot-text");
  btn.style.pointerEvents = "none";
  btn.style.opacity = "0.5";

  const sequence = [
    "Initializing Aura Kernel...",
    "Mounting File System...",
    "Loading GUI Modules...",
    "Welcome.",
  ];
  let delay = 0;
  sequence.forEach((msg) => {
    setTimeout(() => {
      textEl.innerText = msg;
    }, delay);
    delay += 600;
  });

  setTimeout(() => {
    window.gsap.to(document.getElementById("boot-screen"), {
      opacity: 0,
      duration: 0.8,
      onComplete: () => document.getElementById("boot-screen").remove(),
    });
    const osRoot = document.getElementById("os-root");
    window.gsap.to(osRoot, {
      opacity: 1,
      duration: 1,
      delay: 0.2,
      onStart: () => {
        osRoot.style.pointerEvents = "all";
        window.gsap.from(".app-icon", {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        });
        window.gsap.from(".widget", {
          x: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
        });
        window.gsap.from("#taskbar", {
          y: 100,
          opacity: 0,
          duration: 1,
          ease: "back.out(1.5)",
          delay: 0.3,
        });
      },
    });
  }, delay + 200);
});

// --- FIXED CONTEXT MENU WITH SOLID COLOR THEMES ---
const ctxMenu = document.getElementById("context-menu");
document.getElementById("desktop").addEventListener("contextmenu", (e) => {
  e.preventDefault();

  // Prevent menu from opening off-screen
  let x = e.clientX,
    y = e.clientY;
  if (x + 240 > window.innerWidth) x = window.innerWidth - 250;
  if (y + 150 > window.innerHeight) y = window.innerHeight - 160;

  ctxMenu.style.left = `${x}px`;
  ctxMenu.style.top = `${y}px`;
  window.gsap.to(ctxMenu, {
    opacity: 1,
    scale: 1,
    duration: 0.2,
    ease: "back.out(1.5)",
    onStart: () => (ctxMenu.style.pointerEvents = "all"),
  });
});
document.addEventListener("click", () => {
  window.gsap.to(ctxMenu, {
    opacity: 0,
    scale: 0.95,
    duration: 0.15,
    onComplete: () => (ctxMenu.style.pointerEvents = "none"),
  });
});

// Solid, high-contrast colors (No cheap gradients)
const wallpapers = ["#111111", "#2A2624", "#E8E4D9"];
let wpIndex = 0;
document.getElementById("ctx-wallpaper").addEventListener("click", () => {
  wpIndex = (wpIndex + 1) % wallpapers.length;
  document.querySelector(".ambient-bg").style.background = wallpapers[wpIndex];
});

window.openApp = function (appId, title) {
  if (document.getElementById(`win-${appId}`)) {
    const winEl = document.getElementById(`win-${appId}`);
    if (winEl.dataset.minimized === "true") restoreApp(`win-${appId}`);
    else focusWindow(`win-${appId}`);
    return;
  }
  if (isStartOpen) toggleStartMenu();

  const winId = `win-${appId}`;
  const winEl = document.createElement("div");
  winEl.className = "os-window active-window";
  winEl.id = winId;
  winEl.dataset.minimized = "false";
  winEl.dataset.maximized = "false";
  winEl.dataset.snapped = "";

  const isMobile = window.innerWidth <= 768;
  const w = isMobile ? window.innerWidth : 850;
  const h = isMobile ? window.innerHeight - 80 : 550;

  winEl.style.width = `${w}px`;
  winEl.style.height = `${h}px`;
  winEl.style.left = isMobile
    ? "0px"
    : `${(window.innerWidth - w) / 2 + (Math.random() * 40 - 20)}px`;
  winEl.style.top = isMobile
    ? "0px"
    : `${(window.innerHeight - h) / 2 + (Math.random() * 40 - 20)}px`;
  winEl.style.zIndex = ++zIndexCounter;

  let appContent;
  if (appId === "terminal") {
    appContent = `<div class="terminal-ui"><div class="terminal-output" id="out-${winId}">
        <div><span style="color:var(--accent);font-weight:bold;">SYSTEM READY.</span> Welcome to Aura Command Center.</div>
        <div style="color: #fff; margin: 10px 0; padding: 10px; border: 1px solid var(--accent); display:inline-block;">
            💡 <b>Try these commands:</b> neofetch, ls, whoami, date, clear
        </div>
        </div><div class="terminal-input-line"><span class="accent-text">admin@aura:~$</span><input type="text" id="in-${winId}" autocomplete="off" spellcheck="false" autofocus></div></div>`;
  } else if (appId === "browser") {
    // Working Custom Browser Logic
    let defaultBrowserHTML = `
            <style>
                body { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0; font-family:sans-serif; background:#f4f4f4; color:#333; text-align:center; padding: 20px;}
                h1 { font-size: 2.5rem; color:#FF6B01; margin-bottom:10px;}
                p { color: #666; font-size: 14px; }
            </style>
            <h1>Aura Network</h1>
            <p>Enter a URL in the address bar above to begin browsing.</p>
            <p><i>Note: Some major sites block external embedding. Try <b>https://bing.com</b> or <b>https://example.com</b></i></p>
        `;

    let iframeSrc =
      title === "Live Web Preview"
        ? `srcdoc="${(localStorage.getItem("saved_html") || "<h1>Empty</h1>").replace(/"/g, "&quot;")}"`
        : `srcdoc="${defaultBrowserHTML.replace(/"/g, "&quot;")}"`;
    let urlBar =
      title === "Live Web Preview" ? "localhost:3000/index.html" : "";

    appContent = `<div class="browser-ui">
            <div class="browser-toolbar">
                <button><i data-lucide="arrow-left" style="width:16px;"></i></button>
                <button><i data-lucide="rotate-cw" style="width:16px;"></i></button>
                <input type="text" id="url-${winId}" value="${urlBar}" placeholder="Search or enter web address...">
            </div>
            <iframe id="frame-${winId}" ${iframeSrc}></iframe>
        </div>`;
  } else if (appId === "editor") {
    const savedCode =
      localStorage.getItem("saved_html") ||
      `<style>\n  body { background: #111; color: #fff; text-align: center; font-family: sans-serif; padding-top: 20%;}\n  h1 { color: #FF6B01; font-size: 3rem;}\n</style>\n\n<h1>Aura OS</h1>\n<p>Build something beautiful.</p>`;
    appContent = `
            <div class="editor-ui">
                <div class="editor-pane">
                    <div class="editor-header">
                        <span><i data-lucide="file-code" style="width:14px; margin-right:5px; vertical-align:middle;"></i> index.html</span>
                        <button id="save-code-${winId}" class="save-btn">Save to Archive</button>
                    </div>
                    <textarea class="editor-textarea" id="code-${winId}" spellcheck="false">${savedCode}</textarea>
                </div>
                <div class="preview-pane">
                    <div class="preview-header"><i data-lucide="monitor" style="width:14px; margin-right:5px; vertical-align:middle;"></i> Real-Time Render</div>
                    <iframe class="preview-iframe" id="preview-${winId}" srcdoc="${savedCode.replace(/"/g, "&quot;")}"></iframe>
                </div>
            </div>`;
  } else if (appId === "profile") {
    // Replaced Resume PDF with the awesome LinkedIn/GitHub integration UI
    appContent = `
        <div style="background:var(--color-bg-base); color:var(--color-text-main); height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px;">
            <div style="width:100px; height:100px; background:var(--accent); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px; box-shadow:0 10px 30px rgba(255,107,1,0.4);">
                <i data-lucide="user" style="width:50px; height:50px; color:#fff;"></i>
            </div>
            <h1 style="color:var(--accent); font-family:var(--font-ui); font-weight:bold; font-size:36px; margin-bottom:10px;">MOHAMMAD HUZAIFA</h1>
            <p style="font-size:16px; color:var(--color-text-muted); margin-bottom:40px; font-weight:bold;">Computer Science Student | Frontend Developer</p>
            <div style="display:flex; gap:20px;">
                <a href="https://github.com/mohammad43268" target="_blank" style="text-decoration:none; background:#222; border:2px solid #000; padding:15px 30px; border-radius:12px; color:#fff; display:flex; align-items:center; gap:10px; font-weight:bold; font-size:16px; transition:0.3s; box-shadow:0 10px 20px rgba(0,0,0,0.5);" onmouseover="this.style.borderColor='var(--accent)'; this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='#000'; this.style.transform='translateY(0)'">
                    <i data-lucide="github"></i> GitHub
                </a>
                <a href="https://www.linkedin.com/in/mohammad-huzaifa-359673344/" target="_blank" style="text-decoration:none; background:#0077b5; border:2px solid #0077b5; padding:15px 30px; border-radius:12px; color:#fff; display:flex; align-items:center; gap:10px; font-weight:bold; font-size:16px; transition:0.3s; box-shadow:0 10px 20px rgba(0,0,0,0.5);" onmouseover="this.style.filter='brightness(1.1)'; this.style.transform='translateY(-3px)'" onmouseout="this.style.filter='brightness(1)'; this.style.transform='translateY(0)'">
                    <i data-lucide="linkedin"></i> LinkedIn
                </a>
            </div>
        </div>`;
  } else if (appId === "imageviewer") {
    appContent = `<div style="width:100%; height:100%; background:#111; display:flex; align-items:center; justify-content:center;">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop" style="max-width:100%; max-height:100%; object-fit:contain;">
        </div>`;
  } else {
    appContent = `<div class="files-sidebar"><p class="sidebar-tab active" onclick="window.loadFiles('${winId}', 'docs', this)">Documents</p><p class="sidebar-tab" onclick="window.loadFiles('${winId}', 'down', this)">Downloads</p></div><div class="files-content" id="files-content-${winId}"></div>`;
  }

  winEl.innerHTML = `<div class="window-header" id="header-${winId}"><div class="window-controls"><button class="control-btn close"></button><button class="control-btn min"></button><button class="control-btn max"></button></div><span class="window-title">${title}</span><div style="width: 50px;"></div></div><div class="window-body">${appContent}</div>`;
  document.getElementById("window-manager").appendChild(winEl);
  window.lucide.createIcons();

  winEl
    .querySelector(".close")
    .addEventListener("click", () => closeApp(winId));
  winEl
    .querySelector(".min")
    .addEventListener("click", () => minimizeApp(winId));
  winEl
    .querySelector(".max")
    .addEventListener("click", () => maximizeApp(winId));
  winEl.addEventListener("mousedown", () => focusWindow(winId));

  if (!isMobile)
    makeDraggable(winEl, document.getElementById(`header-${winId}`));
  updateTaskbar(appId, title, true);

  if (appId === "terminal") initTerminal(winId);
  if (appId === "editor") initEditor(winId);
  if (appId === "browser") initBrowser(winId);
  if (appId === "files") window.loadFiles(winId, "docs", null);

  if (!isMobile) {
    window.gsap.fromTo(
      winEl,
      { scale: 0.9, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    );
  } else {
    window.gsap.fromTo(
      winEl,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.3 },
    );
  }
};

window.loadFiles = function (winId, folder, el) {
  if (el) {
    document
      .querySelectorAll(`#${winId} .sidebar-tab`)
      .forEach((t) => t.classList.remove("active"));
    el.classList.add("active");
  }
  const content = document.getElementById(`files-content-${winId}`);
  let html = `<h1 style="font-weight: bold; font-family: var(--font-ui); font-size: 28px; margin-bottom: 5px; color:#fff;">${folder === "docs" ? "Documents" : "Downloads"}</h1>`;

  if (folder === "docs") {
    html += `<div class="file-grid">
            <div class="file-item" onclick="window.openApp('profile', 'Developer Profile')"><i data-lucide="user"></i><span>Profile.exe</span></div>
            <div class="file-item" onclick="window.openApp('browser', 'Live Web Preview')"><i data-lucide="code-2"></i><span>index.html</span></div>
            <div class="file-item" onclick="window.openApp('imageviewer', 'UI Design Preview')"><i data-lucide="image"></i><span>design_v2.png</span></div>
        </div>`;
  } else {
    html += `<div class="file-grid">
            <div class="file-item"><i data-lucide="archive"></i><span>assets.zip</span></div>
        </div>`;
  }
  content.innerHTML = html;
  window.lucide.createIcons();
};

function initEditor(winId) {
  const textarea = document.getElementById(`code-${winId}`);
  const iframe = document.getElementById(`preview-${winId}`);
  const saveBtn = document.getElementById(`save-code-${winId}`);

  textarea.addEventListener("input", (e) => {
    iframe.srcdoc = e.target.value;
  });

  saveBtn.addEventListener("click", () => {
    localStorage.setItem("saved_html", textarea.value);
    const toast = document.getElementById("toast");
    window.gsap.to(toast, {
      y: 70,
      opacity: 1,
      duration: 0.4,
      ease: "back.out(2)",
    });
    setTimeout(() => {
      window.gsap.to(toast, {
        y: -50,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }, 2500);
  });
}

function initBrowser(winId) {
  const input = document.getElementById(`url-${winId}`);
  const frame = document.getElementById(`frame-${winId}`);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      let url = input.value.trim();
      if (url !== "") {
        if (!url.startsWith("http")) url = "https://" + url;
        frame.removeAttribute("srcdoc"); // Remove the custom start page
        frame.src = url; // Load the actual URL
      }
    }
  });
}

function maximizeApp(winId) {
  if (window.innerWidth <= 768) return;
  const win = document.getElementById(winId);
  if (win.dataset.maximized === "true") {
    window.gsap.to(win, {
      width: win.dataset.prevW,
      height: win.dataset.prevH,
      top: win.dataset.prevY,
      left: win.dataset.prevX,
      borderRadius: 16,
      duration: 0.3,
      ease: "power2.out",
    });
    win.dataset.maximized = "false";
  } else {
    win.dataset.prevW = win.style.width;
    win.dataset.prevH = win.style.height;
    win.dataset.prevX = win.style.left;
    win.dataset.prevY = win.style.top;
    window.gsap.to(win, {
      width: "100vw",
      height: "calc(100vh - 84px)",
      top: 0,
      left: 0,
      borderRadius: 0,
      duration: 0.3,
      ease: "power2.out",
    });
    win.dataset.maximized = "true";
  }
}
function minimizeApp(winId) {
  const win = document.getElementById(winId);
  win.dataset.minimized = "true";
  window.gsap.to(win, {
    scale: 0.8,
    opacity: 0,
    y: 100,
    duration: 0.2,
    onComplete: () => (win.style.pointerEvents = "none"),
  });
}
function restoreApp(winId) {
  const win = document.getElementById(winId);
  win.dataset.minimized = "false";
  focusWindow(winId);
  window.gsap.to(win, {
    scale: 1,
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: "back.out(1.2)",
    onStart: () => (win.style.pointerEvents = "all"),
  });
}

function initTerminal(winId) {
  const input = document.getElementById(`in-${winId}`);
  const output = document.getElementById(`out-${winId}`);

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const val = input.value.trim();
      if (val === "") return;

      output.innerHTML += `<div><span class="accent-text">admin@aura:~$</span> ${val}</div>`;
      input.value = "";
      output.parentElement.scrollTop = output.parentElement.scrollHeight;

      // Send prompt to your Python backend (running on port 8000)
      try {
        // Change it back to local
        const res = await fetch("http://localhost:8000/api/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: val }),
        });
        const data = await res.json();

        if (data.type === "action") {
          // Handle Tool Calls (Open App, Wallpaper, etc.)
          data.commands.forEach((cmd) => {
            if (cmd.action === "open_app") {
              window.openApp(cmd.args.appId, cmd.args.title);
            } else if (cmd.action === "change_wallpaper") {
              document.getElementById("ctx-wallpaper").click();
            } else if (cmd.action === "write_code_to_editor") {
              window.openApp("editor", "Code Editor");
              setTimeout(() => {
                const editors = document.querySelectorAll(".editor-textarea");
                const codeInput = editors[editors.length - 1];
                if (codeInput) {
                  codeInput.value = cmd.args.code;
                  codeInput.dispatchEvent(new Event("input"));
                }
              }, 500);
            }
          });
          output.innerHTML += `<div style="color: #FF6B01;">🤖 <b>Aura Agent:</b> Task executed.</div>`;
        } else {
          // Handle Text Replies
          const formatted = data.message.replace(/\n/g, "<br>");
          output.innerHTML += `<div style="color: #FF6B01; margin-bottom: 10px;">🤖 <b>Aura Agent:</b><br>${formatted}</div>`;
        }
      } catch (err) {
        // This now uses the 'err' variable by printing it to the console
        console.error(err);
        output.innerHTML += `<div style="color: #FF5F56;">[ERROR] Kernel unreachable.</div>`;
      }
      output.parentElement.scrollTop = output.parentElement.scrollHeight;
    }
  });
}

function closeApp(winId) {
  const winEl = document.getElementById(winId);
  if (winEl)
    window.gsap.to(winEl, {
      scale: 0.9,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        winEl.remove();
        updateTaskbar(winId.replace("win-", ""), "", false);
      },
    });
}

function focusWindow(winId) {
  document
    .querySelectorAll(".os-window")
    .forEach((w) => w.classList.remove("active-window"));
  const winEl = document.getElementById(winId);
  if (winEl) {
    winEl.classList.add("active-window");
    if (parseInt(winEl.style.zIndex) !== zIndexCounter)
      winEl.style.zIndex = ++zIndexCounter;
  }
}

function makeDraggable(winEl, headerEl) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  headerEl.onmousedown = (e) => {
    if (winEl.dataset.maximized === "true") return;
    e.preventDefault();
    focusWindow(winEl.id);
    pos3 = e.clientX;
    pos4 = e.clientY;

    if (winEl.dataset.snapped) {
      winEl.dataset.snapped = "";
      winEl.style.width = winEl.dataset.prevW;
      winEl.style.height = winEl.dataset.prevH;
    }

    document.onmouseup = (ev) => {
      document.onmouseup = null;
      document.onmousemove = null;
      if (ev.clientX < 30) {
        winEl.dataset.prevW = winEl.style.width;
        winEl.dataset.prevH = winEl.style.height;
        window.gsap.to(winEl, {
          left: 0,
          top: 0,
          width: "50vw",
          height: "calc(100vh - 84px)",
          borderRadius: 0,
          duration: 0.2,
          ease: "power2.out",
        });
        winEl.dataset.snapped = "left";
      } else if (ev.clientX > window.innerWidth - 30) {
        winEl.dataset.prevW = winEl.style.width;
        winEl.dataset.prevH = winEl.style.height;
        window.gsap.to(winEl, {
          left: "50vw",
          top: 0,
          width: "50vw",
          height: "calc(100vh - 84px)",
          borderRadius: 0,
          duration: 0.2,
          ease: "power2.out",
        });
        winEl.dataset.snapped = "right";
      }
    };

    document.onmousemove = (ev) => {
      ev.preventDefault();
      pos1 = pos3 - ev.clientX;
      pos2 = pos4 - ev.clientY;
      pos3 = ev.clientX;
      pos4 = ev.clientY;
      winEl.style.top = winEl.offsetTop - pos2 + "px";
      winEl.style.left = winEl.offsetLeft - pos1 + "px";
    };
  };
}

function updateTaskbar(appId, title, isOpening) {
  const taskbarContainer = document.getElementById("running-apps");
  if (isOpening) {
    if (!document.getElementById(`dock-${appId}`)) {
      const dockItem = document.createElement("button");
      dockItem.className = "dock-item active";
      dockItem.id = `dock-${appId}`;
      const icons = {
        browser: "globe",
        files: "folder-open",
        terminal: "terminal-square",
        editor: "code-2",
        profile: "user",
        imageviewer: "image",
      };
      dockItem.innerHTML = `<i data-lucide="${icons[appId] || "app-window"}"></i>`;
      dockItem.onclick = () => window.openApp(appId, title);
      taskbarContainer.appendChild(dockItem);
      window.lucide.createIcons();
      window.gsap.from(dockItem, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(2)",
      });
    }
  } else {
    const dockItem = document.getElementById(`dock-${appId}`);
    if (dockItem) dockItem.remove();
  }
}

let isStartOpen = false;
const startMenu = document.getElementById("start-menu");
function toggleStartMenu() {
  isStartOpen = !isStartOpen;
  if (isStartOpen) {
    startMenu.style.pointerEvents = "all";
    window.gsap.fromTo(
      startMenu,
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
    );
  } else {
    window.gsap.to(startMenu, {
      y: 15,
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      onComplete: () => (startMenu.style.pointerEvents = "none"),
    });
  }
}
document.getElementById("start-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  toggleStartMenu();
});
document.getElementById("os-root").addEventListener("click", (e) => {
  if (
    isStartOpen &&
    !startMenu.contains(e.target) &&
    e.target.id !== "start-btn"
  )
    toggleStartMenu();
});
document.querySelectorAll(".app-icon").forEach((icon) => {
  icon.addEventListener("dblclick", () =>
    window.openApp(icon.dataset.app, icon.dataset.title),
  );
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("User left the site, simplifying UI...");
  } else {
    console.log("User returned, restoring normal UI...");
    restoreUI();
  }
});

function restoreUI() {
  document.getElementById("taskbar").style.display = "flex";
  document.querySelectorAll(".window").forEach((win) => {
    win.style.width = "auto";
    win.style.height = "auto";
  });
}
