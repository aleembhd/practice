function recordCall(number, status, notes, duration) {
    const call = {
        dateTime: new Date().toLocaleString(),
        number: number,
        status: status,
        notes: notes,
        duration: duration
    };

    // Save to localStorage
    let calls = JSON.parse(localStorage.getItem('calls') || '[]');
    calls.push(call);
    localStorage.setItem('calls', JSON.stringify(calls));

    // Send message to parent window (dashboard)
    if (window.opener && !window.opener.closed) {
        console.log('Sending call to parent window:', call);
        window.opener.postMessage({ type: 'newCall', call: call }, '*');
    } else {
        console.error('Parent window not available');
    }

    console.log('Call recorded:', call);
}

// Function to handle call back button click
function handleCallBack() {
    const number = document.getElementById('phoneNumber').value;
    recordCall(number, 'Call Back', 'Call back requested', '0:00');
}

// Function to handle call answer
function handleCallAnswer(wasAnswered) {
    const number = document.getElementById('phoneNumber').value;
    const status = wasAnswered ? 'Answered' : 'Unanswered';
    const notes = wasAnswered ? 'Call was answered' : 'Call was not answered';
    const duration = document.getElementById('timer').textContent;
    recordCall(number, status, notes, duration);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    const callBackBtn = document.getElementById('callBackBtn');
    if (callBackBtn) {
        callBackBtn.addEventListener('click', handleCallBack);
    }

    // Add other event listeners for your dialpad buttons here
});

// Listen for messages from the parent window
window.addEventListener('message', function(event) {
    if (event.data === 'requestLatestCall') {
        const calls = JSON.parse(localStorage.getItem('calls') || '[]');
        if (calls.length > 0) {
            const latestCall = calls[calls.length - 1];
            window.opener.postMessage({ type: 'newCall', call: latestCall }, '*');
        }
    }
});