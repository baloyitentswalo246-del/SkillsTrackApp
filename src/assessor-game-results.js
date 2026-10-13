
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggleBtn) return;

    const isCollapsed = sidebar.classList.toggle('is-collapsed');
    toggleBtn.classList.toggle('is-collapsed', isCollapsed);
    toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
}

