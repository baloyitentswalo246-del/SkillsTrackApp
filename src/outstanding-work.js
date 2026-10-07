const subjects = [
    { name: 'JavaScript', dueDate: '12 Oct 2026', status: 'Not Started' },
    { name: 'HTML', dueDate: '15 Oct 2026', status: 'In Progress' },
];

const outstandingCards = document.getElementById('outstandingCards');
const outstandingSearch = document.getElementById('outstandingSearch');
const refreshBtn = document.getElementById('refreshBtn');

function renderCards() {
    outstandingCards.innerHTML = subjects.map((subject) => `
        <div class="subject-card" data-subject="${subject.name.toLowerCase()}">
            <div class="subject-card-header">${subject.name.toUpperCase()}</div>
            <div class="subject-row">
                <span class="subject-row-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Due Date
                </span>
                <button type="button" class="subject-action-btn" onclick="viewSubject('${subject.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View
                </button>
            </div>
            <div class="subject-row">
                <span class="subject-row-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Status
                </span>
                <button type="button" class="subject-action-btn" onclick="editSubject('${subject.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                </button>
            </div>
        </div>
    `).join('');
}

function viewSubject(name) {
    console.log(`Viewing due date details for ${name}`);
}

function editSubject(name) {
    console.log(`Editing status for ${name}`);
}

outstandingSearch.addEventListener('input', function () {
    const query = outstandingSearch.value.trim().toLowerCase();
    outstandingCards.querySelectorAll('.subject-card').forEach((card) => {
        card.classList.toggle('hidden', query !== '' && !card.dataset.subject.includes(query));
    });
});

refreshBtn.addEventListener('click', function () {
    renderCards();
    outstandingSearch.value = '';
    console.log('Outstanding work refreshed:', subjects);
});

renderCards();

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (!sidebar || !toggleBtn) return;

    const isCollapsed = sidebar.classList.toggle('is-collapsed');
    toggleBtn.classList.toggle('is-collapsed', isCollapsed);
    toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
}
