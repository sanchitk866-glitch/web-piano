const keys = document.querySelectorAll('.key');
const sustainToggle = document.getElementById('sustain');

// Function to play sound and add active class to UI
function playSound(note) {
    if (!note) return;

    // We create a new Audio object for polyphony (playing multiple notes at once)
    const audio = new Audio(`sounds/${note}.wav`);
    
    // Play the audio
    audio.currentTime = 0;
    audio.play().catch(e => {
        console.log("Audio not pre-loaded or generated yet. Check sounds folder.", e);
    });

    // If sustain is not active, sound will fade out faster, else it plays fully
    // We can simulate sustain by stopping audio on keyup, but since the synthesized
    // waves are short anyway, we will let it play through for now. 
    // Implementing realistic sustain requires the Web Audio API or precise audio cutting.
}

// Function to handle pressing a key down (visually and audibly)
function playKey(keyElement) {
    if (!keyElement) return;
    const note = keyElement.getAttribute('data-note');
    
    // Add active animation class
    keyElement.classList.add('active');
    
    playSound(note);
}

// Function to handle releasing a key (visually)
function releaseKey(keyElement) {
    if (!keyElement) return;
    keyElement.classList.remove('active');
}

// --- MOUSE EVENTS ---
keys.forEach(key => {
    // Mouse down
    key.addEventListener('mousedown', () => playKey(key));
    // Mouse up / leave
    key.addEventListener('mouseup', () => releaseKey(key));
    key.addEventListener('mouseleave', () => releaseKey(key));
    
    // Touch events for mobile
    key.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        playKey(key);
    });
    key.addEventListener('touchend', (e) => {
        e.preventDefault();
        releaseKey(key);
    });
});

// --- KEYBOARD EVENTS ---
// Keep track of keys that are currently pressed down to prevent re-triggering audio on holding down
const pressedKeys = new Set();

document.addEventListener('keydown', (e) => {
    if (e.repeat) return; // Ignore keys held down
    const keyStr = e.key.toLowerCase();
    
    // Check for sustain pedal
    if (e.code === 'Space') {
        sustainToggle.checked = !sustainToggle.checked;
        return;
    }

    const keyElement = document.querySelector(`.key[data-key="${keyStr}"]`);
    if (keyElement && !pressedKeys.has(keyStr)) {
        pressedKeys.add(keyStr);
        playKey(keyElement);
    }
});

document.addEventListener('keyup', (e) => {
    const keyStr = e.key.toLowerCase();
    const keyElement = document.querySelector(`.key[data-key="${keyStr}"]`);
    if (keyElement && pressedKeys.has(keyStr)) {
        pressedKeys.delete(keyStr);
        releaseKey(keyElement);
    }
});
