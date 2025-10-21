window.addEventListener("DOMContentLoaded", () => {

    // Pre-Created Accounts
    const accounts = {
        "Ella": { password: "Secret123", role: "admin" },
        "John": { password: "Password456", role: "hr" }
    };

    // Sections
    const landing = document.getElementById("landing");
    const loginSection = document.getElementById("login");
    const portal = document.getElementById("portal");
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");

    // Utility: show section
    function showSection(section) {
        [landing, loginSection, portal].forEach(sec => { if(sec) sec.style.display = "none"; });
        if(section) section.style.display = "block";
    }

    // Show landing initially
    showSection(landing);

    // Landing button
    const enterBtn = document.getElementById("enterPortalBtn");
    if(enterBtn) enterBtn.addEventListener("click", () => showSection(loginSection));

    // Login
    if(loginForm){
        loginForm.addEventListener("submit", e => {
            e.preventDefault();
            const username = loginForm.username.value.trim();
            const password = loginForm.password.value.trim();
            if(accounts[username] && accounts[username].password === password){
                localStorage.setItem("loggedInUser", username);
                showSection(portal);
                alert(`Welcome ${username}!`);
            } else if(loginError){
                loginError.textContent = "Invalid username or password!";
            }
        });
    }

    // Auto-login
    const user = localStorage.getItem("loggedInUser");
    if(user) showSection(portal);

    // Logout
    window.logout = function(){
        localStorage.removeItem("loggedInUser");
        showSection(landing);
    }

    // Tabs
    window.showTab = function(tabId){
        document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active-tab"));
        const t = document.getElementById(tabId);
        if(t) t.classList.add("active-tab");
    }

    window.showForm = function(formId){
        document.querySelectorAll("#formContainer form").forEach(f => f.classList.remove("active-form"));
        const f = document.getElementById(formId);
        if(f) f.classList.add("active-form");
        document.querySelectorAll(".tabBtn").forEach(btn => btn.classList.remove("active-tab-btn"));
        const btn = document.querySelector(`[onclick="showForm('${formId}')"]`);
        if(btn) btn.classList.add("active-tab-btn");
    }

    // Submissions
    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];

    function logSubmission(type, data){
        submissions.push({type, data, timestamp: new Date().toLocaleString(), status:"Pending"});
        localStorage.setItem("submissions", JSON.stringify(submissions));
        updateDashboard();
        updateAdminLog();
        updateChart();
    }

    // Dashboard
    function updateDashboard(){
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
        ["Applications","Activity","Mentorship","Incidents","Suggestions"].forEach(id => {
            const el = document.getElementById("count"+id);
            if(el) el.textContent = counts[id] || 0;
        });
    }

    // Admin
    function updateAdminLog(){
        const logDiv = document.getElementById("submissionsLog");
        if(!logDiv) return;
        const query = document.getElementById("adminSearch")?.value.toLowerCase() || "";
        logDiv.innerHTML = "";
        submissions.filter(sub => JSON.stringify(sub.data).toLowerCase().includes(query) || sub.type.toLowerCase().includes(query))
            .forEach(sub => {
                const card = document.createElement("div");
                card.className = "submission-card";
                card.innerHTML = `<h3>${sub.type} - ${sub.timestamp}</h3><pre>${JSON.stringify(sub.data,null,2)}</pre><p>Status: ${sub.status}</p>`;
                logDiv.appendChild(card);
            });
    }

    document.getElementById("adminSearch")?.addEventListener("input", updateAdminLog);

    // Forms
    ["applicationsForm","activityForm","mentorshipForm","incidentsForm","suggestionsForm"].forEach(id => {
        const form = document.getElementById(id);
        if(form){
            form.addEventListener("submit", e => {
                e.preventDefault();
                logSubmission(id.replace("Form",""), Object.fromEntries(new FormData(form).entries()));
                form.reset();
                alert("Form submitted!");
            });
        }
    });

    // Chart.js
    let submissionsChart;
    function initializeChart(){
        const ctx = document.getElementById("submissionsChart")?.getContext("2d");
        if(!ctx) return;
        submissionsChart = new Chart(ctx, {
            type: 'line',
            data: { labels: submissions.map(s=>s.timestamp), datasets:[{label:'Submissions', data:submissions.map((_,i)=>i+1), backgroundColor:'rgba(79,172,254,0.3)', borderColor:'rgba(79,172,254,1)', fill:true, tension:0.3}] },
            options:{ responsive:true, plugins:{legend:{display:false}}, scales:{ x:{title:{display:true,text:'Time'}}, y:{title:{display:true,text:'Total Submissions'}} } }
        });
    }

    function updateChart(){
        if(!submissionsChart) return;
        submissionsChart.data.labels = submissions.map(s=>s.timestamp);
        submissionsChart.data.datasets[0].data = submissions.map((_,i)=>i+1);
        submissionsChart.update();
    }

    initializeChart();
    updateDashboard();
    updateAdminLog();
});
