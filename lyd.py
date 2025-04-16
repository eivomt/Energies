import time

import matplotlib.pyplot as plt
import numpy as np
import pyaudio
from scipy.io.wavfile import write
import os
# from perlin_noise import PerlinNoise

# noise = PerlinNoise(octaves=1, seed=1)
# noiseLength = 220500
# noiseArray = []
# for i in range(noiseLength):
#     noiseValue = noise([i /(noiseLength)])
#     # noiseValue = noiseValue/5000000000000000
#     # noiseValue = noiseValue/5000000000000000
#     noiseArray.append(noiseValue)
# # sine frequency, Hz, may be float
# print(noiseArray)

p = pyaudio.PyAudio()

volume = 1.0  # range [0.0, 1.0]
fs = 48000  # sampling rate, Hz, must be integer
# fs = 44100  # sampling rate, Hz, must be integer
duration = 2.0  # in seconds, may be float

f1 = 65.41  # C2
f2 = 130.81  # C3
f3 = 261.63  # C4
f4 = 329.63  # E4
f5 = 392.00  # G4
f6 = 493.88  # B4

t = np.linspace(0, fs * duration, 240000)

# generate samples, note conversion to float32 array
samples1 = (np.sin(2 * np.pi * np.arange(fs * duration) * f1 / fs)).astype(np.float32)
samples2 = (np.sin(2 * np.pi * np.arange(fs * duration) * f2 / fs)).astype(np.float32)
samples3 = (np.sin(2 * np.pi * np.arange(fs * duration) * f3 / fs)).astype(np.float32)
samples4 = (np.sin(2 * np.pi * np.arange(fs * duration) * f4 / fs)).astype(np.float32)
samples5 = (np.sin(2 * np.pi * np.arange(fs * duration) * f5 / fs)).astype(np.float32)
samples6 = (np.sin(2 * np.pi * np.arange(fs * duration) * f6 / fs)).astype(np.float32)

# print(len(samples1))

noise = (0.0025 * np.sin(2* np.pi * np.arange(fs * duration) * f6 / fs)).astype(np.float32)
noise2 = (0.03125 * np.sin(2* np.pi * np.arange(fs * duration) * f5 / fs)).astype(np.float32)
noise3 = (0.25 * np.sin(2* np.pi * np.arange(fs * duration) * f4 / fs)).astype(np.float32)


# Cmaj7 =
# samples = samples1 + samples2 + samples3 + samples4 + samples5 + samples6 + noise + noise2
# samples = samples1 + samples2 + samples3 + samples4 + samples5 + samples6
# samples = samples1 + samples2 + samples3
# samples = samples1 + noise + noise2 + noise3
# samples = samples1 + noise + noise2
# samples = samples1 + noise
sampleArray = [samples1, samples2, samples3, samples4, samples5, samples6]

# per @yahweh comment explicitly convert to bytes sequence
# output_bytes = (volume * samples).tobytes()

def playSound():
    # for paFloat32 sample values must be in range [-1.0, 1.0]
    stream = p.open(format=pyaudio.paFloat32,
                    channels=1,
                    rate=fs,
                    output=True,
                    frames_per_buffer=2048)

    # play. May repeat with different volume values (if done interactively)
    start_time = time.time()
    stream.write(output_bytes)
    print("Played sound for {:.2f} seconds".format(time.time() - start_time))

    stream.stop_stream()
    stream.close()
    # print(p.get_default_output_device_info())

    p.terminate()

# plt.plot(t, samples)
# plt.show()

def writeFile(wavPath, sampleNum):
    samples = sampleArray[sampleNum]
    if os.path.isfile(wavPath):
        os.remove(wavPath)
    write(wavPath, fs, samples)
# xpix, ypix = 100, 100
# pic = [[noise([i/xpix, j/ypix]) for j in range(xpix)] for i in range(ypix)]

# plt.imshow(pic, cmap='gray')
# plt.show()

# playSound()
# wavPath = 'test.wav'
for i in range(6):
    path = 'samples' + str(i) + '.wav'
    writeFile(path, i)
# writeFile('test.wav')