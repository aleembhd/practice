let callData = {
    details: []
};

// Update dashboard with data
function updateDashboard(data) {
    document.getElementById('totalCallsSummary').textContent = data.details.length.toLocaleString();
    document.getElementById('interestedCallsSummary').textContent = data.details.filter(call => call.status.toLowerCase() === 'interested').length.toLocaleString();
    document.getElementById('answeredCallsSummary').textContent = data.details.filter(call => call.status.toLowerCase() === 'answered').length.toLocaleString();
    document.getElementById('unansweredCallsSummary').textContent = data.details.filter(call => call.status.toLowerCase() === 'unanswered').length.toLocaleString();
    document.getElementById('callBackCallsSummary').textContent = data.details.filter(call => call.status.toLowerCase() === 'call back').length.toLocaleString();

    const callDetailsBody = document.getElementById('callDetailsBody');
    callDetailsBody.innerHTML = '';
    data.details.forEach(call => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${call.number}</td>
            <td><span class="status status-${call.status.toLowerCase().replace(' ', '-')}">${call.status}</span></td>
            <td>${call.notes}</td>
            <td>${call.duration}</td>
            <td>${call.dateTime}</td>
        `;
        callDetailsBody.appendChild(row);
    });
}

// Function to add a new call to the dashboard
function addCallToDashboard(call) {
    const tbody = document.getElementById('callDetailsBody');
    if (!tbody) {
        console.error('Call details table body not found');
        return;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${call.number}</td>
        <td>${call.status}</td>
        <td>${call.notes}</td>
        <td>${call.duration}</td>
        <td>${call.dateTime}</td>
    `;
    tbody.insertBefore(row, tbody.firstChild); // Add the new call at the top of the list

    // Update callData
    if (!callData.details) {
        callData.details = [];
    }
    callData.details.unshift(call);

    // Update summary numbers
    updateSummaryNumbers();

    console.log('Call added to dashboard:', call);
}

// Function to update summary numbers
function updateSummaryNumbers() {
    const calls = callData.details || [];
    
    document.getElementById('totalCallsSummary').textContent = calls.length;
    document.getElementById('answeredCallsSummary').textContent = calls.filter(call => call.status === 'Answered').length;
    document.getElementById('unansweredCallsSummary').textContent = calls.filter(call => call.status === 'Unanswered').length;
    document.getElementById('callBackCallsSummary').textContent = calls.filter(call => call.status === 'Call Back').length;
    document.getElementById('interestedCallsSummary').textContent = calls.filter(call => call.status === 'Interested').length;
}

// Load existing calls from localStorage
function loadExistingCalls() {
    const calls = JSON.parse(localStorage.getItem('calls') || '[]');
    callData.details = calls;
    updateDashboard(callData);
}

// Listen for messages from the dialpad
window.addEventListener('message', function(event) {
    console.log('Received message:', event.data);
    if (event.data.type === 'newCallRecord' || event.data.type === 'newCall') {
        const newCall = event.data.type === 'newCallRecord' ? event.data.data : event.data.call;
        console.log('Received new call:', newCall);
        addCallToDashboard(newCall);
        updateDashboard(callData); // Update the entire dashboard
    }
});

// Function to open dialpad
window.openDialpad = function() {
    window.open('dialpad.html', 'dialpad', 'width=300,height=400');
}

// Function to open Today's dashboard
function openTodayDashboard() {
    const today = new Date().toLocaleDateString();
    const todayCalls = callData.details.filter(call => new Date(call.dateTime).toLocaleDateString() === today);
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
            <head>
                <title>Today's Calls</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
                <div class="container">
                    <h1>Today's Calls (${today})</h1>
                    <table class="call-details-table">
                        <thead>
                            <tr>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>Duration</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${todayCalls.map(call => `
                                <tr>
                                    <td>${call.number}</td>
                                    <td>${call.status}</td>
                                    <td>${call.notes}</td>
                                    <td>${call.duration}</td>
                                    <td>${new Date(call.dateTime).toLocaleTimeString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </body>
        </html>
    `);
    newWindow.document.close();
}

// Function to open Weekly Report
function openWeeklyReport() {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCalls = callData.details.filter(call => new Date(call.dateTime) >= oneWeekAgo);

    const totalCalls = weeklyCalls.length;
    const answeredCalls = weeklyCalls.filter(call => call.status === 'Answered').length;
    const unansweredCalls = weeklyCalls.filter(call => call.status === 'Unanswered').length;
    const callBackCalls = weeklyCalls.filter(call => call.status === 'Call Back').length;
    const interestedCalls = weeklyCalls.filter(call => call.status === 'Interested').length;

    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
            <head>
                <title>Weekly Performance Report</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 1000px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #333;
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .stats-container {
                        display: flex;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        margin-bottom: 30px;
                    }
                    .stat-card {
                        width: 18%;
                        background-color: #fff;
                        border-radius: 8px;
                        padding: 15px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        text-align: center;
                    }
                    .stat-card i {
                        font-size: 24px;
                        margin-bottom: 10px;
                    }
                    .stat-card .number {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .stat-card .label {
                        font-size: 14px;
                        color: #666;
                    }
                    #weeklyChart {
                        margin-top: 30px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Weekly Performance Report</h1>
                    <div class="stats-container">
                        <div class="stat-card">
                            <i class="fas fa-phone"></i>
                            <div class="number">${totalCalls}</div>
                            <div class="label">Total Calls</div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-check-circle"></i>
                            <div class="number">${answeredCalls}</div>
                            <div class="label">Answered</div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-times-circle"></i>
                            <div class="number">${unansweredCalls}</div>
                            <div class="label">Unanswered</div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-redo"></i>
                            <div class="number">${callBackCalls}</div>
                            <div class="label">Call Back</div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-star"></i>
                            <div class="number">${interestedCalls}</div>
                            <div class="label">Interested</div>
                        </div>
                    </div>
                    <canvas id="weeklyChart"></canvas>
                </div>
                <script>
                    const ctx = document.getElementById('weeklyChart').getContext('2d');
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Total Calls', 'Answered', 'Unanswered', 'Call Back', 'Interested'],
                            datasets: [{
                                label: 'Weekly Call Statistics',
                                data: [${totalCalls}, ${answeredCalls}, ${unansweredCalls}, ${callBackCalls}, ${interestedCalls}],
                                backgroundColor: [
                                    'rgba(54, 162, 235, 0.6)',
                                    'rgba(75, 192, 192, 0.6)',
                                    'rgba(255, 99, 132, 0.6)',
                                    'rgba(255, 206, 86, 0.6)',
                                    'rgba(153, 102, 255, 0.6)'
                                ],
                                borderColor: [
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(153, 102, 255, 1)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                },
                                title: {
                                    display: true,
                                    text: 'Weekly Call Performance',
                                    font: {
                                        size: 18
                                    }
                                }
                            }
                        }
                    });
                </script>
            </body>
        </html>
    `);
    newWindow.document.close();
}

// Function to open Answered Calls tab
function openAnsweredCallsTab() {
    openCallsTab('Answered');
}

// Function to open Unanswered Calls tab
function openUnansweredCallsTab() {
    openCallsTab('Unanswered');
}

// Function to open Call Back Calls tab
function openCallBackCallsTab() {
    openCallsTab('Call Back');
}

// Function to open Interested Calls tab
function openInterestedCallsTab() {
    openCallsTab('Interested');
}

// Generic function to open calls tab
function openCallsTab(status) {
    const filteredCalls = callData.details.filter(call => call.status === status);
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
            <head>
                <title>${status} Calls</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
                <div class="container">
                    <h1>${status} Calls</h1>
                    <table class="call-details-table">
                        <thead>
                            <tr>
                                <th>Contact</th>
                                <th>Notes</th>
                                <th>Duration</th>
                                <th>Date/Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredCalls.map(call => `
                                <tr>
                                    <td>${call.number}</td>
                                    <td>${call.notes}</td>
                                    <td>${call.duration}</td>
                                    <td>${call.dateTime}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </body>
        </html>
    `);
    newWindow.document.close();
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Clear localStorage to remove any existing dummy data
    localStorage.removeItem('calls');
    
    loadExistingCalls();
    updateSummaryNumbers();

    // Event listeners for buttons
    document.getElementById('todayBtn').addEventListener('click', openTodayDashboard);
    document.getElementById('weekReportBtn').addEventListener('click', openWeeklyReport);
    document.getElementById('settingsBtn').addEventListener('click', function() {
        alert('Settings clicked');
    });

    const dialpadTrigger = document.getElementById('dialpadTrigger');
    if (dialpadTrigger) {
        dialpadTrigger.addEventListener('click', window.openDialpad);
    }

    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', showClearDataConfirmation);
    }

    // Add event listeners for summary cards
    const answeredCard = document.querySelector('.summary-card.answredcalls');
    if (answeredCard) {
        answeredCard.addEventListener('click', openAnsweredCallsTab);
    }

    const unansweredCard = document.querySelector('.summary-card.unanswredcalls');
    if (unansweredCard) {
        unansweredCard.addEventListener('click', openUnansweredCallsTab);
    }

    const callBackCard = document.querySelector('.summary-card.callbackcalls');
    if (callBackCard) {
        callBackCard.addEventListener('click', openCallBackCallsTab);
    }

    const interestedCard = document.querySelector('.summary-card.intreastedcalls');
    if (interestedCard) {
        interestedCard.addEventListener('click', openInterestedCallsTab);
    } else {
        console.error("Interested calls card not found");
    }

    const weekReportBtn = document.getElementById('weekReportBtn');
    if (weekReportBtn) {
        weekReportBtn.addEventListener('click', openWeeklyReport);
    } else {
        console.error("Week Report button not found");
    }

    document.getElementById('callBackBtn').addEventListener('click', function() {
        // Increment the call back count
        let callBackCount = parseInt(document.getElementById('callBackCallsSummary').innerText) || 0;
        callBackCount++;
        document.getElementById('callBackCallsSummary').innerText = callBackCount;
    });
});

// ... rest of your existing code ...

function clearData() {
    // Clear the table data
    const callDetailsBody = document.getElementById('callDetailsBody');
    callDetailsBody.innerHTML = '';

    // Reset the call data
    callData.details = [];

    // Clear localStorage
    localStorage.removeItem('calls');

    // Update the dashboard with the cleared data
    updateDashboard(callData);
}

// ... rest of your existing code ...

// Remove any stray closing brackets or parentheses