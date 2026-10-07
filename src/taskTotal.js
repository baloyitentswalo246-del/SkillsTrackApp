const subjects = [
    { name: 'JavaScript', score: 70, total: 100 },
    { name: 'HTML', score: 90, total: 100 },
    { name: 'CSS', score: 100, total: 100 },
];

const taskRows = document.getElementById('taskRows');
const taskSearch = document.getElementById('taskSearch');
const refreshBtn = document.getElementById('refreshBtn');

function renderRows() {
    taskRows.innerHTML = subjects.map((subject) => `
        <div class="task-row" data-subject="${subject.name.toLowerCase()}">
            <span class="tag-pill">Subject</span>
            <span class="task-subject-name">${subject.name}</span>
            <span class="tag-pill total">Total</span>
            <span class="task-score">${subject.score}/${subject.total}</span>
        </div>
    `).join('');
}

taskSearch.addEventListener('input', function () {
    const query = taskSearch.value.trim().toLowerCase();
    taskRows.querySelectorAll('.task-row').forEach((row) => {
        row.classList.toggle('hidden', query !== '' && !row.dataset.subject.includes(query));
    });
});

refreshBtn.addEventListener('click', function () {
    renderRows();
    taskSearch.value = '';
    console.log('Task totals refreshed:', subjects);
});

renderRows();

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggleBtn) return;

    const isCollapsed = sidebar.classList.toggle('is-collapsed');
    toggleBtn.classList.toggle('is-collapsed', isCollapsed);
    toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
}

