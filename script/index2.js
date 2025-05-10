window.addEventListener("load", function () {
  // make the account default to log in if the user is anonymous
  //select all items
  let anchorInLis = this.document.querySelectorAll(".main-nav >  ul > li > a");
  //add event click
  anchorInLis.forEach(function (a) {
    if (a.getAttribute("id") != "cart-icon") {
      a.addEventListener("click", function () {
        a.nextElementSibling.classList.toggle("active");
      });
      document.addEventListener("click", (e) => {
        if (e.target != a) {
          a.nextElementSibling.classList.remove("active");
        }
      });
    }
  });
  //if click i
});
