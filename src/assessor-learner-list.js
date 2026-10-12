window.toggleSidebar = function () {

    const sidebar =
        document.querySelector(".sidebar");

    const button =
        document.getElementById("sidebar-toggle");

    sidebar.classList.toggle("is-collapsed");

    button.classList.toggle("is-collapsed");
};