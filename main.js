const bookMenu = document.getElementById("book-menu");
const buttons = document.getElementsByClassName("book-appointment_btn");

for (const button of buttons) {
  button.addEventListener("click", () => {
    if (typeof bookMenu.showModal === "function") {
      bookMenu.showModal();
    } else {
      bookMenu.classList.add("show");
    }
  });
}

bookMenu.addEventListener("click", (e) => {
  if (e.target === bookMenu) bookMenu.close();
});
