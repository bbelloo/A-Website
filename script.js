// Show/Hide Sections with sliding animation
function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const activeSection = document.getElementById(sectionId);
    activeSection.style.display = 'block';
    setTimeout(() => activeSection.classList.add('active'), 50);
}
showSection('dashboard');

// Submission Storage
let submissions = [];

// Log submission and update views
function logSubmission(type, data) {
    submissions.push({ type, data, timestamp: new Date().toLocaleString() });
    updateAdminLog();
    updateDashboard();
}

// Update Admin Panel
function updateAdminLog() {
    const logDiv = document.getElementById('submissionsLog');
    const searchQuery = document.getElementById('adminSearch')?.value.toLowerCase() || '';
    logDiv.innerHTML = '';
    submissions
        .filter(sub => JSON.stringify(sub.data).toLowerCase().includes(searchQuery) || sub.type.toLowerCase().includes(searchQuery))
        .forEach(sub => {
        const card = document.createElement('div');
        card.classList.add('submission-card');
        switch(sub.type){
            case 'Application': card.classList.add('submission-application'); break;
            case 'Activity': card.classList.add('submission-activity'); break;
            case 'Mentorship': card.classList.add('submission-mentorship'); break;
            case 'Incident': card.classList.add('submission-incident'); break;
            case 'Suggestion': card.classList.add('submission-suggestion'); break;
        }
        card.innerHTML = `<h3>${sub.type} - ${sub.timestamp}</h3><pre>${JSON.stringify(sub.data, null, 2)}</pre>`;
        logDiv.appendChild(card);
    });
}

// Dashboard counts
function updateDashboard() {
    const counts = { Application:0, Activity:0, Mentorship:0, Incident:0, Suggestion:0 };
    submissions.forEach(sub => { counts[sub.type]++; });
    document.getElementById('countApplications').textContent = counts.Application;
    document.getElementById('countActivity').textContent = counts.Activity;
    document.getElementById('countMentorship').textContent = counts.Mentorship;
    document.getElementById('countIncidents').textContent = counts.Incident;
    document.getElementById('countSuggestions').textContent = counts.Suggestion;
}

// Admin Search
document.getElementById('adminSearch')?.addEventListener('input', updateAdminLog);

// Form Submissions
const forms = ['applicationsForm','activityForm','mentorshipForm','incidentForm','suggestionsForm'];
forms.forEach(id => {
    document.getElementById(id).addEventListener('submit', function(e){
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this).entries());
        const type = id.replace('Form','').replace(/^\w/, c => c.toUpperCase());
        logSubmission(type, data);
        this.reset();
        alert(`${type} submitted successfully!`);
    });
});
