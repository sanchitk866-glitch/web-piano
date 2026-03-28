# 🎹 Virtual Piano

A beautiful, beginner-friendly Virtual Piano project built with raw HTML, CSS, and JavaScript. This project is interactive, playable via mouse touches or keyboard, and uses Python to synthesize offline sound files.

## Features
- Interactive piano with one full octave (C4 to B4).
- Both **White** and **Black** keys realistically positioned using Flexbox & absolute positioning.
- Modern CSS styling including shadows, beautiful gradients, and micro-animations.
- Polyphonic sounds handling (multiple keys can be pressed).
- Fully mapped computer keyboard controls.
- Clean, thoroughly commented, framework-free code snippet collection.
- A Python sound-synthesizer module included to auto-generate the piano offline notes.

## File Structure
- `index.html`: The HTML structure of the piano.
- `style.css`: All the aesthetics and layout rules making the app look great.
- `script.js`: DOM manipulation & event listeners for interactivity and sound routing.
- `generate_sounds.py`: A Python script which synthesizes the audio files using pure math. 
- `sounds/`: Contains the generated `.wav` audio files.

## Local Setup

### 1. Generating the Audio Files
In order for the project to play sounds right away, we have synthesized placeholder `.wav` wavefiles via python. 
To build the sound files, open your terminal in this directory and run:

```bash
python generate_sounds.py
```

It will create a folder called `sounds/` and build `C.wav`, `Cs.wav`, `D.wav`, and so forth.

### 2. View the App
Simply drag and drop `index.html` into any web browser!
Alternatively, you can run a local development server via Python (optional):

```bash
python -m http.server 8000
```
Then go to `http://localhost:8000` in your web browser.

## Keyboard Shortcuts

| Keyboard Key | Piano Note | Key Type |
|---|---|---|
| A | C (Do) | White |
| W | C# (Do Sharp) | Black |
| S | D (Re) | White |
| E | D# (Re Sharp) | Black |
| D | E (Mi) | White |
| F | F (Fa) | White |
| T | F# (Fa Sharp) | Black |
| G | G (Sol) | White |
| Y | G# (Sol Sharp) | Black |
| H | A (La) | White |
| U | A# (La Sharp) | Black |
| J | B (Ti) | White |

---
Enjoy making music!
