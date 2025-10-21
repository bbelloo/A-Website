// --------------------
// Pre-Created Accounts
// --------------------
const accounts = {
    "Ella": { password: "Secret123", role: "admin" },
    "John": { password: "Password456", role: "hr" }
};

// --------------------
// Section Navigation
// --------------------
function showSection(sectionId) {
    document.querySelectorAll("section").forEach(sec => sec.classList.remove("active-section"));
    document.getElementById(sectionId).classList.add("active-section");
}

// --------------------
// Portal Tabs
// --------------------
function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active-tab"));
    document.getElementById(tabId).classList.add("active-tab");
}

function showForm(formId) {
    document.querySelectorAll("#formContainer form").forEach(f => f.classList.remove("active-form"));
    document.getElementById(formId).classList.add("active-form");
    document.querySelectorAll(".tabBtn").forEach(btn => btn.classList.remove("active-tab-btn"));
    document.querySelector(`[onclick="showForm('${formId}')"]`).classList.add("active-tab-btn");
}

// --------------------
// Login Handling
// --------------------
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const username = this.username.value.trim();
    const password = this.password.value.trim();

    if(accounts[username] && accounts[username].password === password){
        localStorage.setItem("loggedInUser", username);
        showSection("portal");
        updateDashboard();
        updateAdminLog();
        initializeChart();
    } else {
        document.getElementById("loginError").textContent = "Invalid username or password!";
    }
});

// --------------------
// Logout
// --------------------
function logout() {
    localStorage.removeItem("loggedInUser");
    showSection("landing");
}

// --------------------
// Submissions Storage
// --------------------
let submissions = JSON.parse(localStorage.getItem("submissions")) || [];

// --------------------
// Log Submission
// --------------------
function logSubmission(type, data) {
    const submission = {
        type,
        data,
        timestamp: new Date().toLocaleString(),
        status: "Pending"
    };
    submissions.push(submission);
    localStorage.setItem("submissions", JSON.stringify(submissions));
    updateDashboard();
    updateAdminLog();
    updateChart();
}

// --------------------
// Dashboard Metrics
// --------------------
function updateDashboard() {
    const counts = { Application:0, Activity:0, Mentorship:0, Incident:0, Suggestion:0 };
    submissions.forEach(sub => {
        switch(sub.type){
            case "Application": counts.Application++; break;
            case "Activity": counts.Activity++; break;
            case "Mentorship": counts.Mentorship++; break;
            case "Incident": counts.Incident++; break;
            case "Suggestion": counts.Suggestion++; break;
        }
    });
    document.getElementById("countApplications").textContent = counts.Application;
    document.getElementById("countActivity").textContent = counts.Activity;
    document.getElementById("countMentorship").textContent = counts.Mentorship;
    document.getElementById("countIncidents").textContent = counts.Incident;
    document.getElementById("countSuggestions").textContent = counts.Suggestion;
}

// --------------------
// Admin Panel
// --------------------
function updateAdminLog() {
    const logDiv = document.getElementById("submissionsLog");
    const searchQuery = document.getElementById("adminSearch")?.value.toLowerCase() || "";
    logDiv.innerHTML = "";

    submissions
        .filter(sub => JSON.stringify(sub.data).toLowerCase().includes(searchQuery) || sub.type.toLowerCase().includes(searchQuery))
        .forEach(sub => {
            const card = document.createElement("div");
            card.classList.add("submission-card");
            switch(sub.type){
                case "Application": card.classList.add("submission-application"); break;
                case "Activity": card.classList.add("submission-activity"); break;
                case "Mentorship": card.classList.add("submission-mentorship"); break;
                case "Incident": card.classList.add("submission-incident"); break;
                case "Suggestion": card.classList.add("submission-suggestion"); break;
            }
            card.innerHTML = `<h3>${sub.type} - ${sub.timestamp}</h3>
                              <pre>${JSON.stringify(sub.data, null, 2)}</pre>
                              <p>Status: ${sub.status}</p>`;
            logDiv.appendChild(card);
        });
}

document.getElementById("adminSearch")?.addEventListener("input", updateAdminLog);

// --------------------
// Form Submissions
// --------------------
const forms = ["applicationsForm","activityForm","mentorshipForm","incidentsForm","suggestionsForm"];
forms.forEach(id => {
    document.getElementById(id).addEventListener("submit", function(e){
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this).entries());
        const type = id.replace("Form","");
        logSubmission(type, data);
        this.reset();
        alert(`${type} submitted successfully!`);
    });
});

// --------------------
// Chart.js - Submissions Over Time
// --------------------
let submissionsChart;
function initializeChart() {
    const ctx = document.getElementById("submissionsChart").getContext("2d");
    submissionsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: submissions.map(s => s.timestamp),
            datasets: [{
                label: 'Submissions',
                data: submissions.map((_, i) => i+1),
                backgroundColor: 'rgba(79, 172, 254, 0.3)',
                borderColor: 'rgba(79, 172, 254,1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { title: { display: true, text: 'Time' } }, y: { title: { display: true, text: 'Total Submissions' } } }
        }
    });
}

function updateChart() {
    if(!submissionsChart) return;
    submissionsChart.data.labels = submissions.map(s => s.timestamp);
    submissionsChart.data.datasets[0].data = submissions.map((_, i) => i+1);
    submissionsChart.update();
}

// --------------------
// On Page Load - Auto Login if Session Exists
// --------------------
window.addEventListener("load", () => {
    const user = localStorage.getItem("loggedInUser");
    if(user){
        showSection("portal");
        updateDashboard();
        updateAdminLog();
        initializeChart();
    } else {
        showSection("landing");
    }
});
