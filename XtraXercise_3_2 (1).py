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
print(f'The potential supports {Nbound} bound states.')
# print(EigValues[:Nbound])
print(EigValues[:10])

    # Remove unbound states
EigValues = EigValues[0:Nbound]
EigVectors = EigVectors[:, 0:Nbound]

#
# Construct initial condition
Avector = np.random.rand(1, Nbound) - 0.5 + \
    1j*(np.random.rand(1, Nbound) - 0.5)
# Normalize:
Norm = np.sqrt(np.sum(np.abs(Avector)**2))    
Avector = Avector/Norm
print(Norm)
print('Avector squared')
print(np.abs(Avector))

#
# Wave function, linear combination of eigenstates with coefficients given
# in Avector
Psi = np.matmul(EigVectors, Avector.T)

# Initiate time
t=0

# Initiate plot
plt.ion()
fig = plt.figure(1)
plt.clf()
MaxVal = np.max(np.abs(Psi)**2)

# Initiate gridspecs
gs0 = gridspec.GridSpec(7,1,figure=fig)
gs00 = gs0[6].subgridspec(3,3)

# Initiate ax
ax = fig.add_subplot(gs0[:5])

# Plot potential
ax.plot(x, Vpot(x), '-', color = 'blue', linewidth = 2)
ax.hlines(EigValues, -1.5*w, 1.5*w, linestyles = 'dashed', color = 'red')    
line1, = ax.plot(x, np.abs(Psi)**2/MaxVal*abs(V0), '-', color='black', 
                 linewidth = 2)

# Label axes
plt.xlabel('Position, x', fontsize = 12)
plt.ylabel(r'$|\Psi(x; t)|^2$', fontsize = 12)

# Fix window
ax.set(xlim = (-1.5*w, 1.5*w), ylim=(-.25 * abs(V0), 2*abs(V0)))
# ax.set(xlim = (-1.5*w, 1.5*w))

# Initiate ax2
ax2 = fig.add_subplot(gs00[2,1])
measureButton = Button(ax2, 'Measure', hovercolor='0.975')

# Initiate ax3
ax3 = fig.add_subplot(gs00[2,0])
stopButton = Button(ax3, 'Stop', hovercolor='0.975')

def decide(event):
    if running:
        measure(event)
    else:
        restart(event)

def restart(event):
    global running
    ax2.clear()
    measureButton = Button(ax2, 'Measure', hovercolor='0.975')
    measureButton.on_clicked(decide)
    running = True

def measure(event):
    global running, EigValues, Ndraw, EigVectors, line1, MaxVal, measureButton, outcomes

    # Measurement
    RandomNumber = np.random.rand()
    DecisionVector = np.cumsum(np.abs(Avector)**2)

    # Select eigenstate according to probability distribution
    Ndraw = np.argmax(RandomNumber < DecisionVector)

    # Write outcome to screen:
    print(f'Outcome: State no. {Ndraw+1}, Energy: {EigValues[Ndraw]:.3f}.')
    outcomes.append(Ndraw+1)

    # Re-assign amplitudes and collapse wave function
    #Avector = np.zeros(1, Nbound)
    #Avector[Ndraw] = 1
    Psi = EigVectors[:, Ndraw]
    # Update plots
    # Update data for plots
    line1.set_ydata(np.abs(Psi)**2/MaxVal*abs(V0) + EigValues[Ndraw])

    ax2.clear()
    measureButton = Button(ax2, 'Restart', hovercolor='0.975')
    measureButton.on_clicked(decide)
    running = False

def stop(event):
    global outcomes, alive
    stats = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0 }
    for outcome in outcomes:
        stats[str(outcome)] += 1
    print('+----+----+----+----+----+----+')
    print('| s1 | s2 | s3 | s4 | s5 | s6 |')
    print('+----+----+----+----+----+----+')
    print('| ' + str(stats['1']) +'  | '+ str(stats['2'])+'  | '+ str(stats['3']) +'  | '+ str(stats['6'])+'  | '+ str(stats['5'])+'  | '+ str(stats['6'])+'  |')
    print('+----+----+----+----+----+----+')
    alive = False

measureButton.on_clicked(decide)
stopButton.on_clicked(stop)

# Evolve in time
while alive:

    if running:
        # Update time
        t = t + dt

        # Propagation
        AwithPhase = Avector*np.exp(-1j*EigValues*t)
        Psi = np.matmul(EigVectors, AwithPhase.T)

        # Update data for plots
        line1.set_ydata(np.abs(Psi)**2/MaxVal*abs(V0))

    # Update plots
    fig.canvas.draw()
    fig.canvas.flush_events()
    time.sleep(.005)

# Update plots

# subplot(1, 3, 1)
# bar(1:Nbound, abs(Avector).^2, 'r')  
# set(gca, 'fontsize', 15)
# xlabel('n')
# ylabel('Probability')
# axis([0, Nbound+1, 0 1.1])