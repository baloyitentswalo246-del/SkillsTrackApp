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

// The Session Type dropdown is the only way to pick a type: selecting an
// option shows just that matching chip (marked selected) and hides the rest.
function wireSessionTypeFilter() {
    const select = document.getElementById('sessionTypeFilter');
    const chips = document.querySelectorAll('#sessionTypeChips .chip');

    select.addEventListener('change', () => {
        const selectedText = select.options[select.selectedIndex].text;
        const hasFilter = select.value !== '';

        chips.forEach((chip) => {
            const matches = chip.dataset.value === selectedText;
            chip.classList.toggle('hidden', hasFilter && !matches);
            chip.classList.toggle('selected', hasFilter && matches);
        });
    });
}

wireSingleSelectChips('dateChips');
wireSingleSelectChips('timeChips');
wireSingleSelectChips('modeChips');
wireSessionTypeFilter();

document.getElementById('confirmBtn').addEventListener('click', () => {
    const date = document.querySelector('#dateChips .selected');
    const time = document.querySelector('#timeChips .selected');
    const mode = document.querySelector('#modeChips .selected');
    const assessor = document.getElementById('assessorSelect').value;

    if (!assessor || !date || !time || !mode) {
        showMessage('Please choose an assessor, date, time slot and session mode.', 'error');
        return;
    }

    showMessage(`Booking confirmed with ${assessor} on ${date.dataset.value} at ${time.dataset.value} (${mode.dataset.value}).`, 'success');
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('assessorSelect').value = '';
    document.getElementById('sessionTypeFilter').value = '';
    document.getElementById('bookingDescription').value = '';
    document.querySelectorAll('.chip.selected').forEach((chip) => chip.classList.remove('selected'));
    document.querySelectorAll('.chip.hidden').forEach((chip) => chip.classList.remove('hidden'));
    showMessage('Booking cancelled.', 'error');
});
