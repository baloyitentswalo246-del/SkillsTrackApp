const message = document.getElementById('bookingMessage');

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggleBtn) return;

    const isCollapsed = sidebar.classList.toggle('is-collapsed');
    toggleBtn.classList.toggle('is-collapsed', isCollapsed);
    toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
}

function showMessage(text, type) {
    message.textContent = text;
    message.classList.remove('success', 'error');
    message.classList.add(type);
}

function wireSingleSelectChips(containerId) {
    const container = document.getElementById(containerId);
    container.querySelectorAll('.chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            container.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
            chip.classList.add('selected');
        });
    });
}

function wireMultiSelectChips(containerId) {
    const container = document.getElementById(containerId);
    container.querySelectorAll('.chip').forEach((chip) => {
        chip.addEventListener('click', () => chip.classList.toggle('selected'));
    });
}