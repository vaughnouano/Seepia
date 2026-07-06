const bookMenu = document.getElementById("book-menu");
const buttons = document.getElementsByClassName("book-appointment_btn");

for (const button of buttons) {
  button.addEventListener("click", () => {
    bookMenu.classList.add("show");
  });
}
