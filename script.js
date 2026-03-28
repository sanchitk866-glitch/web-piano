/**
 * Virtual Piano V2 Engine
 * Uses Web Audio API for zero-latency, polyphonic playback with ADSR envelopes
 */

class PianoEngine {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.connect(this.audioCtx.destination);
        this.masterGain.gain.value = 0.8; // Default volume
        
        this.buffers = {};
        this.activeNodes = {}; // Tracks currently playing audio nodes per key
        
        this.isSustainOn = false;
        this.isRecording = false;
        this.isPlaying = false;
        this.recordingData = [];
        this.recordStartTime = 0;
        this.playbackTimeouts = [];

        this.notes = [
            "C3", "Cs3", "D3", "Ds3", "E3", "F3", "Fs3", "G3", "Gs3", "A3", "As3", "B3",
            "C4", "Cs4", "D4", "Ds4", "E4", "F4", "Fs4", "G4", "Gs4", "A4", "As4", "B4"
        ];
    }

    async init() {
        this.showStatus("Loading audio buffers...");
        let loaded = 0;
        
        const loadPromises = this.notes.map(async (note) => {
            try {
                const response = await fetch(`sounds/${note}.wav`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
                this.buffers[note] = audioBuffer;
                loaded++;
            } catch (error) {
                console.error(`Failed to load ${note}.wav`, error);
            }
        });

        await Promise.all(loadPromises);
        this.showStatus(`Loaded ${loaded}/${this.notes.length} sounds`, 2000);
    }

    showStatus(msg, timeout = 0) {
        const el = document.getElementById('status-message');
        el.textContent = msg;
        el.classList.add('show');
        if (timeout > 0) {
            setTimeout(() => el.classList.remove('show'), timeout);
        }
    }

    setVolume(value) {
        // value between 0 and 1
        this.masterGain.gain.setTargetAtTime(value, this.audioCtx.currentTime, 0.05);
    }

    setSustain(isOn) {
        this.isSustainOn = isOn;
    }

    playNote(note) {
        // Need to resume context if it's suspended (browser auto-play policy)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        if (!this.buffers[note]) return;

        // If recording, save the event
        if (this.isRecording) {
            this.recordingData.push({
                note: note,
                type: 'down',
                time: this.audioCtx.currentTime - this.recordStartTime
            });
        }

        // Stop any old node for this exact key to prevent unbounded overlapping
        if (this.activeNodes[note]) {
            this.stopNoteInternal(note, 0.05); 
        }

        const source = this.audioCtx.createBufferSource();
        source.buffer = this.buffers[note];

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(1, this.audioCtx.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        source.start(0);

        this.activeNodes[note] = { source, gainNode };
    }

    releaseNote(note) {
        if (this.isRecording) {
            this.recordingData.push({
                note: note,
                type: 'up',
                time: this.audioCtx.currentTime - this.recordStartTime
            });
        }

        if (!this.activeNodes[note]) return;

        // Fade out depending on sustain
        const fadeOutTime = this.isSustainOn ? 2.5 : 0.15;
        this.stopNoteInternal(note, fadeOutTime);
    }

    stopNoteInternal(note, fadeOutDuration) {
        const nodeObj = this.activeNodes[note];
        if (!nodeObj) return;

        const { source, gainNode } = nodeObj;
        const now = this.audioCtx.currentTime;
        
        // Exponential fade out sounds natural
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + fadeOutDuration);
        
        source.stop(now + fadeOutDuration + 0.1);
        delete this.activeNodes[note];
    }

    toggleRecord(btnElement) {
        if (this.isRecording) {
            // Stop recording
            this.isRecording = false;
            btnElement.classList.remove('recording');
            btnElement.textContent = "🔴 Record";
            this.showStatus(`Recorded ${this.recordingData.length} events!`, 2000);
            
            if (this.recordingData.length > 0) {
                document.getElementById('btn-play').disabled = false;
            }
        } else {
            // Start recording
            this.recordingData = [];
            this.recordStartTime = this.audioCtx.state === 'suspended' ? 0 : this.audioCtx.currentTime;
            this.isRecording = true;
            btnElement.classList.add('recording');
            btnElement.textContent = "⏹ Stop Record";
            document.getElementById('btn-play').disabled = true;
            this.showStatus("Recording started...", 2000);
            
            // Auto resume context if needed
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        }
    }

    playRecording(btnElement) {
        if (this.recordingData.length === 0 || this.isPlaying) return;

        this.isPlaying = true;
        btnElement.classList.add('playing');
        btnElement.textContent = "⏹ Stop Playback";
        
        // Ensure UI stays in sync during playback
        const keyElements = Array.from(document.querySelectorAll('.key'));
        const findKey = (note) => keyElements.find(k => k.getAttribute('data-note') === note);

        const endTime = this.recordingData[this.recordingData.length - 1].time + 1.0;

        this.recordingData.forEach(event => {
            const timeout = setTimeout(() => {
                const el = findKey(event.note);
                if (event.type === 'down') {
                    if (el) el.classList.add('active');
                    this.playNote(event.note);
                } else {
                    if (el) el.classList.remove('active');
                    this.releaseNote(event.note);
                }
            }, event.time * 1000);
            this.playbackTimeouts.push(timeout);
        });

        // Reset button after playback ends
        const resetTimeout = setTimeout(() => {
            this.stopPlayback(btnElement);
        }, endTime * 1000);
        this.playbackTimeouts.push(resetTimeout);
    }

    stopPlayback(btnElement) {
        this.playbackTimeouts.forEach(t => clearTimeout(t));
        this.playbackTimeouts = [];
        this.isPlaying = false;
        btnElement.classList.remove('playing');
        btnElement.textContent = "▶ Play";
        
        // Remove active visual states and release sounds playing
        document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
        this.notes.forEach(note => this.releaseNote(note));
    }
}

// ------ UI AND EVENT BINDING ------
document.addEventListener("DOMContentLoaded", () => {
    const engine = new PianoEngine();
    const keys = document.querySelectorAll('.key');
    const sustainToggle = document.getElementById('sustain');
    const volumeSlider = document.getElementById('master-volume');
    const btnRecord = document.getElementById('btn-record');
    const btnPlay = document.getElementById('btn-play');

    const pressedKeys = new Set();
    let engineInitialized = false;

    // Initialize engine on first interaction to respect autoplay policies
    const initEngineOnce = () => {
        if (!engineInitialized) {
            engine.init();
            engineInitialized = true;
        }
    };

    // Note Triggers
    const triggerNoteDown = (keyElement) => {
        if (!keyElement) return;
        initEngineOnce();
        const note = keyElement.getAttribute('data-note');
        keyElement.classList.add('active');
        engine.playNote(note);
    };

    const triggerNoteUp = (keyElement) => {
        if (!keyElement) return;
        const note = keyElement.getAttribute('data-note');
        keyElement.classList.remove('active');
        engine.releaseNote(note);
    };

    // Mouse & Touch Events
    keys.forEach(key => {
        key.addEventListener('mousedown', () => triggerNoteDown(key));
        key.addEventListener('mouseup', () => triggerNoteUp(key));
        key.addEventListener('mouseleave', () => triggerNoteUp(key));
        
        key.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            triggerNoteDown(key);
        });
        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            triggerNoteUp(key);
        });
        // Handle sliding off the key on touch
        key.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            triggerNoteUp(key);
        });
    });

    // Keyboard Events
    document.addEventListener('keydown', (e) => {
        // Prevent default spacebar scroll down
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
        }

        if (e.repeat) return; // Ignore hold repeating
        const keyStr = e.key.toLowerCase();

        if (e.code === 'Space') {
            sustainToggle.checked = !sustainToggle.checked;
            engine.setSustain(sustainToggle.checked);
            return;
        }

        const keyElement = document.querySelector(`.key[data-key="${keyStr}"]`);
        if (keyElement && !pressedKeys.has(keyStr)) {
            pressedKeys.add(keyStr);
            triggerNoteDown(keyElement);
        }
    });

    document.addEventListener('keyup', (e) => {
        const keyStr = e.key.toLowerCase();
        const keyElement = document.querySelector(`.key[data-key="${keyStr}"]`);
        if (keyElement && pressedKeys.has(keyStr)) {
            pressedKeys.delete(keyStr);
            triggerNoteUp(keyElement);
        }
    });

    // Control Panel Events
    volumeSlider.addEventListener('input', (e) => {
        engine.setVolume(parseFloat(e.target.value));
    });

    sustainToggle.addEventListener('change', (e) => {
        engine.setSustain(e.target.checked);
    });

    btnRecord.addEventListener('click', () => {
        initEngineOnce();
        engine.toggleRecord(btnRecord);
    });

    btnPlay.addEventListener('click', () => {
        if (engine.isPlaying) {
            engine.stopPlayback(btnPlay);
        } else {
            engine.playRecording(btnPlay);
        }
    });
});
