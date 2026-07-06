const bookMenu = document.getElementById("book-menu");
const backBtn = document.getElementById("back-btn");
const calendarContainer = document.getElementById("calendarContainer");
// Use a more specific selector for the title
const titleElement = document.querySelector(".navigation-panel .title");
// Or if you prefer, you can use this alternative:
// const titleElement = document.querySelector("h1.title");
const prevBtn = document.querySelector(".previous-btn");
const nextBtn = document.querySelector(".next-btn");

const canonG7X_btn = document.getElementById("canonG7X");
const djiPocket4_btn = document.getElementById("djiPocket4");
const kodakPIXPRO_btn = document.getElementById("kodakPIXPRO");

// Camera data
const cameras = [
  {
    id: "canon",
    name: "G7X - Mark III",
    iframe:
      "https://calendar.google.com/calendar/embed?height=450&wkst=1&ctz=UTC&showPrint=0&showTz=0&src=YWY3N2FiZGQxOGRhYTlmNjNhNWZjNjcyOTkxZTE0M2RmZTUzYTIwNjdiZmY1MmRmMTY5ODliMGRjNDkxNDA1OUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23d50000",
    width: "600",
    height: "450",
    scrolling: "yes",
  },
  {
    id: "dji",
    name: "DJI Pocket 4",
    iframe:
      "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=UTC&showPrint=0&showTz=0&src=MTJmMWMwM2E5OThmYjEwMzAzZWM1NjhlZTUxYTBmOTJiOTgzZTI2NzAwNjQ1ZTNlM2QzOTA3N2JjYTNmZjM0OUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%234285f4",
    width: "800",
    height: "600",
    scrolling: "no",
  },
  {
    id: "kodak",
    name: "Kodak PIXPRO",
    iframe:
      "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=UTC&showPrint=0&showTz=0&src=NDgzOTU2Mjc2YWVkZmUxZDFhZTgwMDY3M2MxYzUxZThlMzk0YmZiMmI2MTBmM2ExNWQyOTJlY2UwOTI4NzQ5MUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23e67c73",
    width: "800",
    height: "600",
    scrolling: "no",
  },
];

let currentCameraIndex = 0;

// Function to open the dialog
function openBookMenu() {
  bookMenu.setAttribute("open", "");
  bookMenu.showModal();
  history.pushState({ dialog: "book-menu" }, "", "#book-menu");
}

// Function to close the dialog
function closeBookMenu() {
  bookMenu.removeAttribute("open");
  bookMenu.close();
  if (window.location.hash === "#book-menu") {
    history.replaceState({}, "", window.location.pathname);
  }
}

// Function to update iframe
function updateIframe(src, width = "600", height = "450", scrolling = "yes") {
  const iframe = document.querySelector(".calendar-view");
  if (iframe) {
    iframe.src = src;
    iframe.width = width;
    iframe.height = height;
    iframe.scrolling = scrolling;
  } else {
    calendarContainer.innerHTML = `
      <iframe
        src="${src}"
        width="${width}"
        height="${height}"
        frameborder="0"
        scrolling="${scrolling}"
        class="calendar-view"
      >
    </iframe>
    <button class="back-btn" id="back-btn">back</button>`;
    // Re-bind back button after recreating it
    const newBackBtn = document.getElementById("back-btn");
    if (newBackBtn) {
      newBackBtn.addEventListener("click", (e) => {
        if (e.target === newBackBtn) {
          closeBookMenu();
        }
      });
    }
  }
}

// Function to update camera display
function updateCamera(index) {
  const camera = cameras[index];

  // Debug: Check if titleElement exists
  console.log("Title element found:", titleElement);
  console.log("Updating title to:", camera.name);

  // Update the title
  if (titleElement) {
    titleElement.textContent = camera.name;
    console.log("Title successfully updated to:", titleElement.textContent);
  } else {
    console.error("Title element not found! Check your HTML selector.");
  }

  updateIframe(camera.iframe, camera.width, camera.height, camera.scrolling);
}

// Function to go to next camera
function nextCamera() {
  currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
  updateCamera(currentCameraIndex);
}

// Function to go to previous camera
function prevCamera() {
  currentCameraIndex =
    (currentCameraIndex - 1 + cameras.length) % cameras.length;
  updateCamera(currentCameraIndex);
}

// Close when clicking on backdrop
bookMenu.addEventListener("click", (e) => {
  if (e.target === bookMenu) {
    closeBookMenu();
  }
});

// Close when clicking back button
backBtn.addEventListener("click", (e) => {
  if (e.target === backBtn) {
    closeBookMenu();
  }
});

// Next and Previous buttons
nextBtn.addEventListener("click", nextCamera);
prevBtn.addEventListener("click", prevCamera);

// Handle browser back button
window.addEventListener("popstate", function (event) {
  if (bookMenu.open) {
    closeBookMenu();
  }
});

// Handle ESC key
bookMenu.addEventListener("close", function () {
  if (window.location.hash === "#book-menu") {
    history.replaceState({}, "", window.location.pathname);
  }
});

// Canon G7X button
canonG7X_btn.addEventListener("click", () => {
  currentCameraIndex = 0;
  updateCamera(currentCameraIndex);
  openBookMenu();
});

// DJI Pocket 4 button
djiPocket4_btn.addEventListener("click", () => {
  currentCameraIndex = 1;
  updateCamera(currentCameraIndex);
  openBookMenu();
});

// Kodak PIXPRO button
kodakPIXPRO_btn.addEventListener("click", () => {
  currentCameraIndex = 2;
  updateCamera(currentCameraIndex);
  openBookMenu();
});
