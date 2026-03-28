# 🎹 Virtual Piano V2

A professional-grade, beginner-friendly Virtual Piano project built with raw HTML, CSS, and modern JavaScript. This project uses the **Web Audio API** to deliver zero-latency playback, true polyphony, and an authentic piano feel across two full octaves—no frameworks required!

## 🚀 Version 2 Features
- **Web Audio API Engine:** Preloads audio buffers into memory for mathematically zero-latency sound triggering.
- **Two Full Octaves:** Play notes from `C3` (Lower octave) all the way to `B4` (Upper octave).
- **True Polyphony:** Play unlimited keys simultaneously; the engine manages active `AudioBufferSourceNode` objects dynamically.
- **ADSR Sustain Envelope:** Enjoy natural, instrument-like volume fade-outs. Use the 'Sustain' toggle (Spacebar) to let notes ring out or fade rapidly.
- **Recording Loop:** Record your own symphonies! Click 'Record', play your notes, and hit 'Play' to watch the keys automatically trigger the audio engine at your exact playback timestamps.
- **Master Volume:** Fully adjustable master output.
- **Python Synthesizer:** Includes `generate_sounds.py` to recursively synthesize raw `.wav` files perfectly tuned for the piano.

## 📁 File Structure
- `index.html`: The HTML structure of the piano (controls, wrappers, keys).
- `style.css`: A dynamic layout utilizing modern CSS variables, Neon Box-Shadows, and responsive horizontal scrolling.
- `script.js`: State-of-the-Art ES6 Javascript Engine handling Audio Contexts and the Event Loop.
- `generate_sounds.py`: The Python sound synthesis script.
- `sounds/`: Contains the generated 24 `.wav` audio files.

## 🛠 Local Setup

### 1. Generating the Audio Files
In order for the project to play sounds right away, we have synthesized placeholder `.wav` wavefiles via python. 
To build the 2-octave set, open your terminal in this directory and run:

```bash
python generate_sounds.py
```
*(This creates `C3.wav` through `B4.wav` in the `sounds/` directory)*

### 2. View the App
Because this project utilizes the advanced `Web Audio API` (`fetch()` array buffers), you must run it over a local web server (Browser security prevents fetching local files over `file:///`).

Run a local development server via Python:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then visit **`http://localhost:8000`** in your web browser.

## 🎹 Keyboard Shortcuts

The keyboard layout is intuitively mapped across two octaves for maximum reachability.

| Note Range | Piano Keys | Mapped Keyboard |
|---|---|---|
| **Octave 1 (Lower)** | White Keys (C3 - B3) | `Z`, `X`, `C`, `V`, `B`, `N`, `M` |
| | Black Keys (Cs3 - As3) | `S`, `D`, `G`, `H`, `J` |
| **Octave 2 (Upper)** | White Keys (C4 - B4) | `Q`, `W`, `E`, `R`, `T`, `Y`, `U` |
| | Black Keys (Cs4 - As4) | `2`, `3`, `5`, `6`, `7` |

### Controls
| Control | Action |
|---|---|
| **Spacebar** | Toggle Sustain Pedal ON / OFF |
| **Record Button** | Starts recording your keystrokes |
| **Play Button** | Plays back the recorded sequence perfectly |
| **Volume Slider**| Adjusts the `GainNode` output |

---
Enjoy making music!
