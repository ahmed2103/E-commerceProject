let views = document.querySelectorAll(".view");
let links = document.querySelectorAll(".dashboard-nav a");

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    //1- delete all active from links
    links.forEach((l) => l.classList.remove("active"));
    //2- add active to target link
    link.classList.add("active");
    //3- remove active from all views
    views.forEach((view) => view.classList.remove("active"));
    //4- add active to target view
    let targetView = link.textContent.trim().toLowerCase() + "-view";
    document.getElementById(targetView).classList.add("active");
  });
});
