"""
 This script simulates the time-evolution of the wave packet for a 
 particle trapped in a confining potential. The initial state is fixed by
 randomly selecting the coefficients in a linear combination of the 
 eigenstates of the Hamiltonian.

 The evolution of the wave function is plotted until some final time at
 which an energy mesurement is done. After this, the wave function is
 collapsed to one of the eigenstates. The state is picked at random
 according to the probability distribution given by the initial
 coefficients.

 Numerical input parameters: 
 Tmeasure  - the duration of the simulation - until the measurement
 dt        - numerical time step, here it serves to tune the speed of the
 simulation
 N         - number of grid points, should be 2^n
 L         - the size of the numerical domain it extends from -L/2 to L/2
 
 Physical input parameters:
 V0        - the depth of the confining potential (must be negative)
 s         - smoothness parameter for the potential
 w         - the width of the smoothly rectangular potential
 
 All these inputs are hard coded initially.
"""

# Libraries
import numpy as np
from matplotlib import pyplot as plt
import matplotlib.gridspec as gridspec
from matplotlib.widgets import Button
import time
import os
import csv

# Running boolean
running = True
alive = True
outcomes = []

# Numerical time parameters:
Tmeasure = 10
dt = 0.05

# Grid parameters
L = 30
N = 512              # For FFT's sake, we should have N=2^n

# Physical parameters:
V0 = -4
s = 5
w = 6

# Potential
def Vpot(x):
    return V0/(np.exp(s*(np.abs(x)-w/2))+1) - V0
    # return V0/(np.exp(s*(np.abs(x)-w/2))+1)


# Set up the grid.
x = np.linspace(-L/2, L/2, N)
h = L/(N+1)

# Set up Hamiltonian
# Kinetic energy:
k_max = np.pi/h
dk = 2*k_max/N
k = np.append(np.linspace(0, k_max-dk, int(N/2)), 
              np.linspace(-k_max, -dk, int(N/2)))
# Transform identity matrix
Tmat = np.fft.fft(np.identity(N, dtype=complex), axis = 0)
# Multiply by (ik)^2
Tmat = np.matmul(np.diag(-k**2), Tmat)
# Transform back to x-representation. 
Tmat = np.fft.ifft(Tmat, axis = 0)
# Correct pre-factor
Tmat = -1/2*Tmat    

# Add kinetic and potential energy:
Ham = Tmat + np.diag(Vpot(x))

# Diagaonalize Hamiltonian (Hermitian matrix)
EigValues, EigVectors = np.linalg.eigh(Ham)
# Normalize eigenstates
EigVectors = EigVectors/np.sqrt(h)

# Number of bound states
Nbound = sum(EigValues < -V0)
# print(EigValues[:Nbound])

    # Remove unbound states
EigValues = EigValues[0:Nbound]
EigVectors = EigVectors[:, 0:Nbound]


potential = Vpot(x)
potentialArray = []
for p in potential:
    potentialArray.append([p])
print(potential)

# skriv til csv fil, xListe, yListe
csvPath = f'./Eigvalues.csv'


EigValuesArray = []

for value in EigValues:
    valueArray = [value]
    EigValuesArray.append(valueArray)

if os.path.isfile(csvPath):
    os.remove(csvPath)

with open(csvPath, 'w') as file:
    writer = csv.writer(file)
    fields = ['Eigvalue']

    writer.writerow(fields)
    writer.writerows(EigValuesArray)

print(np.real(EigVectors[0][0]))
print(np.imag(EigVectors[0][0]))

csvPath = f'./EigvectorsReal.csv'

if os.path.isfile(csvPath):
    os.remove(csvPath)

with open(csvPath, 'w') as file:
    writer = csv.writer(file)
    fields = ['e0','e1','e2','e3','e4','e5']

    writer.writerow(fields)
    writer.writerows(np.real(EigVectors))

csvPath = f'./EigvectorsImaginary.csv'

if os.path.isfile(csvPath):
    os.remove(csvPath)

with open(csvPath, 'w') as file:
    writer = csv.writer(file)
    fields = ['e0','e1','e2','e3','e4','e5']

    writer.writerow(fields)
    writer.writerows(np.imag(EigVectors))

csvPath = f'./Vpot.csv'

if os.path.isfile(csvPath):
    os.remove(csvPath)

with open(csvPath, 'w') as file:
    writer = csv.writer(file)
    fields = ['potential']

    writer.writerow(fields)
    writer.writerows(potentialArray)