import math
import struct
import wave
import os

if not os.path.exists("sounds"):
    os.makedirs("sounds")

# Define piano notes and their frequencies (2 octaves from C3 to B4)
notes_freq = {
    # Octave 3 (Lower)
    "C3": 130.81, "Cs3": 138.59, "D3": 146.83, "Ds3": 155.56, 
    "E3": 164.81, "F3": 174.61, "Fs3": 185.00, "G3": 196.00, 
    "Gs3": 207.65, "A3": 220.00, "As3": 233.08, "B3": 246.94,
    # Octave 4 (Upper)
    "C4": 261.63, "Cs4": 277.18, "D4": 293.66, "Ds4": 311.13, 
    "E4": 329.63, "F4": 349.23, "Fs4": 369.99, "G4": 392.00, 
    "Gs4": 415.30, "A4": 440.00, "As4": 466.16, "B4": 493.88
}

sample_rate = 44100.0
duration = 2.0 # Increased duration slightly for better web audio fade-out

def generate_tone(file_name, freq):
    obj = wave.open(file_name, 'w')
    obj.setnchannels(1) # mono
    obj.setsampwidth(2) # 16-bit
    obj.setframerate(int(sample_rate))
    
    for i in range(int(sample_rate * duration)):
        # Generate decay
        decay = math.exp(-i / (sample_rate / 2.5)) 
        
        # Richer harmonics for realism
        base = math.sin(2.0 * math.pi * freq * (i / sample_rate))
        harmonic_1 = 0.5 * math.sin(2.0 * math.pi * (freq * 2) * (i / sample_rate))
        harmonic_2 = 0.25 * math.sin(2.0 * math.pi * (freq * 3) * (i / sample_rate))
        harmonic_3 = 0.125 * math.sin(2.0 * math.pi * (freq * 4) * (i / sample_rate))
        
        combined_wave = base + harmonic_1 + harmonic_2 + harmonic_3
        value = int(decay * (32767.0 / 1.875) * combined_wave)
        
        data = struct.pack('<h', value)
        obj.writeframesraw(data)
    
    obj.close()

# Remove old files first (optional, but good for cleanup)
for f in os.listdir("sounds"):
    if f.endswith(".wav"):
        os.remove(os.path.join("sounds", f))

for note, freq in notes_freq.items():
    file_path = os.path.join("sounds", "{}.wav".format(note))
    print("Generating {} (Frequency: {} Hz)...".format(file_path, freq))
    generate_tone(file_path, freq)

print("All sounds generated successfully.")
