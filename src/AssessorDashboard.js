const searchInput = document.getElementById('dashboardSearch');
const dashPills = document.querySelectorAll('.dash-pill[data-label]');

searchInput.addEventListener('input', function () {
    const query = searchInput.value.trim().toLowerCase();
    dashPills.forEach((pill) => {
        const label = pill.dataset.label.toLowerCase();
        pill.classList.toggle('hidden', query !== '' && !label.includes(query));
    });
});
