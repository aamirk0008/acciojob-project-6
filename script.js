let timers = [];
let timerIdCounter = 0;

// Audio for timer completion
function createBeepSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Format time display
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
}

// Validate user input
function validateInput(hours, minutes, seconds) {
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    if (seconds < 0 || seconds > 59) return false;
    if (hours === 0 && minutes === 0 && seconds === 0) return false;
    return true;
}

// Start new timer
function startNewTimer() {
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');

    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;

    // Validate input
    if (!validateInput(hours, minutes, seconds)) {
        alert('Please enter a valid time (hours: 0-23, minutes: 0-59, seconds: 0-59, and total time > 0)');
        return;
    }

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const timerId = timerIdCounter++;

    const timer = {
        id: timerId,
        totalSeconds: totalSeconds,
        remainingSeconds: totalSeconds,
        isCompleted: false,
        interval: null
    };

    timers.push(timer);

    // Start the interval
    timer.interval = setInterval(() => {
        updateTimer(timerId);
    }, 1000);

    // Reset input fields
    hoursInput.value = 0;
    minutesInput.value = 0;
    secondsInput.value = 0;

    // Update display
    updateTimersDisplay();
}

// Update individual timer
function updateTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;

    timer.remainingSeconds--;

    if (timer.remainingSeconds <= 0) {
        timer.remainingSeconds = 0;
        timer.isCompleted = true;
        clearInterval(timer.interval);

        // Play audio alert
        try {
            createBeepSound();
        } catch (e) {
            console.log('Audio not supported or blocked');
        }
    }

    updateTimersDisplay();
}

// Stop timer
function stopTimer(timerId) {
    const timerIndex = timers.findIndex(t => t.id === timerId);
    if (timerIndex === -1) return;

    const timer = timers[timerIndex];
    if (timer.interval) {
        clearInterval(timer.interval);
    }

    timers.splice(timerIndex, 1);
    updateTimersDisplay();
}

// Dismiss completed timer
function dismissTimer(timerId) {
    stopTimer(timerId);
}

// Update timers display
function updateTimersDisplay() {
    const container = document.getElementById('timersContainer');
    const noTimersMessage = document.getElementById('noTimersMessage');

    if (timers.length === 0) {
        container.innerHTML = '';
        noTimersMessage.style.display = 'block';
        return;
    }

    noTimersMessage.style.display = 'none';

    container.innerHTML = timers.map(timer => {
        const labelText = timer.isCompleted ? 'Timer Completed' : 'Time Left';
        const displayTime = formatTime(timer.remainingSeconds);
        const completedClass = timer.isCompleted ? 'completed' : '';

        if (timer.isCompleted) {
            return `
                        <div class="timer-item ${completedClass}" data-timer-id="${timer.id}">
                            <div class="timer-info">
                                <div class="timer-label">${labelText}</div>
                                <div class="timer-display">${displayTime}</div>
                            </div>
                            <div class="timer-actions">
                                <div class="completed-message">Timer Is Up !</div>
                                <button class="dismiss-button" onclick="dismissTimer(${timer.id})">Done</button>
                            </div>
                        </div>
                    `;
        } else {
            return `
                        <div class="timer-item ${completedClass}" data-timer-id="${timer.id}">
                            <div class="timer-info">
                                <div class="timer-label">${labelText}</div>
                                <div class="timer-display">${displayTime}</div>
                            </div>
                            <div class="timer-actions">
                                <button class="stop-button" onclick="stopTimer(${timer.id})">Stop</button>
                            </div>
                        </div>
                    `;
        }
    }).join('');
}

// Input validation and formatting
document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.time-input');

    inputs.forEach(input => {
        input.addEventListener('input', function () {
            let value = parseInt(this.value);
            const max = parseInt(this.max);

            if (value > max) {
                this.value = max;
            } else if (value < 0) {
                this.value = 0;
            }
        });

        input.addEventListener('blur', function () {
            if (this.value === '' || isNaN(this.value)) {
                this.value = 0;
            }
        });
    });
});

// Initialize display
updateTimersDisplay();