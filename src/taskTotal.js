import { 
    ref,
    get 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";


async function fetchTaskTotals() {
    const taskTotalsElement = document.getElementById('taskTotals');

    try {
        const taskRef = ref(database, 'tasks');
        const snapshot = await get(taskRef);
        let total = 0;
        if (snapshot.exists()) {
            total = Object.keys(snapshot.val()).length;
        }
        taskTotalsElement.textContent = total;
    } catch (error) {
        console.error('Error fetching task totals:', error);
        taskTotalsElement.textContent = 'Unable to load task totals';
    }
}

fetchTaskTotals();


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

