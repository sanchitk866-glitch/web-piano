import math
import struct
import wave
import os

if not os.path.exists("sounds"):
    os.makedirs("sounds")

# Define piano notes and their frequencies (1 octave from C4 to B4)
notes_freq = {
    "C": 261.63,
    "Cs": 277.18, # C#
    "D": 293.66,
    "Ds": 311.13, # D#
    "E": 329.63,
    "F": 349.23,
    "Fs": 369.99, # F#
    "G": 392.00,
    "Gs": 415.30, # G#
    "A": 440.00,
    "As": 466.16, # A#
    "B": 493.88
}

sample_rate = 44100
duration = 1.5 # seconds

def generate_tone(file_name, freq):
    # Setup wave file
    obj = wave.open(file_name, 'w')
    obj.setnchannels(1) # mono
    obj.setsampwidth(2) # 2 bytes per sample (16-bit)
    obj.setframerate(sample_rate)
    
    # Generate audio curve with decay (exponential decay to mimic a hit sound like piano)
    for i in range(int(sample_rate * duration)):
        # Calculate amplitude. Decay envelope to simulate instrument hit
        decay = math.exp(-i / (sample_rate / 3)) 
        
        # Add a mix of harmonics to make it sound richer like an electric organ/piano
        base = math.sin(2.0 * math.pi * freq * (i / sample_rate))
        harmonic_1 = 0.5 * math.sin(2.0 * math.pi * (freq * 2) * (i / sample_rate))
        harmonic_2 = 0.25 * math.sin(2.0 * math.pi * (freq * 3) * (i / sample_rate))
        
        combined_wave = base + harmonic_1 + harmonic_2
        # Normalize slightly to prevent clipping
        value = int(decay * (32767.0 / 1.75) * combined_wave)
        
        # Package into binary
        data = struct.pack('<h', value)
        obj.writeframesraw(data)
    
    obj.close()

for note, freq in notes_freq.items():
    file_path = os.path.join("sounds", "{}.wav".format(note))
    print("Generating {} (Frequency: {} Hz)...".format(file_path, freq))
    generate_tone(file_path, freq)

print("All sounds generated successfully.")
