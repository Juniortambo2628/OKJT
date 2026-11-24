# Original 30 s seamless music loops for the product promos (96 BPM, 12 bars of 2.5 s).
# Usage: python3 music2.py <preset> <out.wav>   presets: tenafi, tfe, najenga, reel
import sys, wave
import numpy as np
from scipy.signal import lfilter

preset, out = sys.argv[1], sys.argv[2]
SR = 44100; BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT; NB = 12
L = int(round(NB * BAR * SR)); TAIL = int(3 * SR); N = L + TAIL
rng = np.random.default_rng({'tenafi': 3, 'tfe': 5, 'najenga': 9, 'reel': 11}[preset])
Lc = np.zeros(N); Rc = np.zeros(N)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

def add(sig, start, pan=0.0, gain=1.0):
    s = int(start * SR)
    if s >= N: return
    e = min(N, s + len(sig)); sig = sig[:e - s] * gain
    Lc[s:e] += sig * np.cos((pan + 1) * np.pi / 4); Rc[s:e] += sig * np.sin((pan + 1) * np.pi / 4)

def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - a], [1, -a], x)

def hp(x, fc):
    return x - lp(x, fc)

def env(n, a, r):
    e = np.ones(n); a = int(a * SR); r = int(r * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[-r:] *= np.linspace(1, 0, r)
    return e

def saw(f, t, det=0.1):
    return sum((2 * ((f * 2 ** (d / 12) * t + rng.random()) % 1) - 1) for d in (-det, det)) / 2

def kick(dec=9, pitch=90):
    t = np.arange(int(.4 * SR)) / SR; f = 48 + pitch * np.exp(-t * 32); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * dec)

def noise_hit(dur, color, dec):
    n = rng.standard_normal(int(dur * SR)); n = hp(n, color) if color > 0 else lp(n, -color)
    t = np.arange(len(n)) / SR; return n * np.exp(-t * dec)

def clap():
    s = np.zeros(int(.25 * SR))
    for o in (0, .011, .022): h = noise_hit(.2, 1200, 28); s[int(o * SR):int(o * SR) + len(h)] += h[:len(s) - int(o * SR)]
    return lp(s, 6000)

def tom(f):
    t = np.arange(int(.5 * SR)) / SR; ff = f * (1 + .5 * np.exp(-t * 20)); return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 7)

def pluck(f, dur=1.0, bright=1.0):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + .3 * bright * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 12) + .15 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 8))

def piano(f, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.2 + k * 1.3)) for k, a in ((1, 1), (2, .5), (3, .25), (4, .12)))
    s[:80] *= np.linspace(0, 1, 80); return s

def pad(chord, dur, cutoff, gain, oct_=12):
    t = np.arange(int((dur + 1) * SR)) / SR
    s = sum(saw(mtof(m + oct_), t) for m in chord) / len(chord)
    return lp(s, cutoff) * env(len(t), .5, 1.0) * gain

def chime(f):
    t = np.arange(int(1.8 * SR)) / SR
    return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.5 + k)) for k, a in ((1, 1), (2.76, .4), (5.4, .2)))

P = {
    'tenafi': dict(chords=[[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64]], roots=[45, 41, 36, 43]),
    'tfe': dict(chords=[[50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64]], roots=[38, 34, 41, 36]),
    'najenga': dict(chords=[[52, 55, 59, 62], [48, 52, 55, 59], [55, 59, 62, 66], [50, 54, 57, 62]], roots=[40, 36, 43, 38]),
    'reel': dict(chords=[[50, 57, 61, 64], [47, 54, 57, 62], [43, 50, 54, 57], [45, 52, 57, 61]], roots=[38, 35, 31, 33]),
}[preset]
ch = lambda b: P['chords'][(b // 2) % 4]
rt = lambda b: P['roots'][(b // 2) % 4]

for b in range(0, NB, 2):
    add(pad(ch(b), 2 * BAR, {'tenafi': 1600, 'tfe': 2400, 'najenga': 1300, 'reel': 1800}[preset], {'tenafi': .09, 'tfe': .07, 'najenga': .08, 'reel': .09}[preset]), b * BAR)

for b in range(NB):
    last = b == NB - 1; intro = b == 0
    c = ch(b); r = rt(b)
    # --- drums
    if not intro:
        if preset == 'tenafi':                      # soft four-on-the-floor, off-beat hats, log drum
            for q in range(4 if not last else 1): add(kick(10, 70), b * BAR + q * BEAT, gain=.36)
            for q in range(4 if not last else 2): add(noise_hit(.12, 7000, 30), b * BAR + q * BEAT + BEAT / 2, pan=.3, gain=.05)
            for s16 in range(16 if not last else 8): add(noise_hit(.05, 9000, 70), b * BAR + s16 * BEAT / 4 + (.012 if s16 % 2 else 0), pan=-.3, gain=.018)
            if not last:
                for pos in (1.75, 3.5):
                    t = np.arange(int(.45 * SR)) / SR; ff = mtof(r + 12) * (1 + .5 * np.exp(-t * 35))
                    add(np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(ff) / SR)) * np.exp(-t * 6), b * BAR + pos * BEAT, gain=.11)
        elif preset == 'tfe':                       # stadium: big kick, claps on 2 & 4, toms, driving hats
            for q in (0, 2) if not last else (0,): add(kick(7, 110), b * BAR + q * BEAT, gain=.45)
            if not last: add(kick(9, 90), b * BAR + 2.5 * BEAT, gain=.25)
            for q in (1, 3) if not last else (1,): add(clap(), b * BAR + q * BEAT, gain=.16)
            for s16 in range(16 if not last else 6): add(noise_hit(.04, 8000, 80), b * BAR + s16 * BEAT / 4, pan=.25, gain=.03 * (1.4 if s16 % 4 == 2 else 1))
            if b % 2 == 1 and not last:
                for i, f in enumerate((180, 150, 120, 96)): add(tom(f), b * BAR + 3 * BEAT + i * BEAT / 4, pan=-.4 + i * .25, gain=.16)
        elif preset == 'najenga':                   # steady build: kick, rim and wood-block "hammer" accents
            for q in (0, 2) if not last else (0,): add(kick(9, 85), b * BAR + q * BEAT, gain=.4)
            if not last: add(kick(10, 80), b * BAR + 1.75 * BEAT, gain=.18)
            for q in (1, 3) if not last else (1,): add(noise_hit(.09, 2500, 45), b * BAR + q * BEAT, pan=-.2, gain=.09)
            for s8 in range(8 if not last else 4):
                t = np.arange(int(.08 * SR)) / SR; add(np.sin(2 * np.pi * (1300 if s8 % 2 else 900) * t) * np.exp(-t * 60), b * BAR + s8 * BEAT / 2, pan=.35, gain=.035)
            for s16 in range(16 if not last else 8): add(noise_hit(.04, 8500, 75), b * BAR + s16 * BEAT / 4 + (.01 if s16 % 2 else 0), pan=.2, gain=.016)
        else:                                       # reel: soft afro groove
            for q in (0, 2) if not last else (0,): add(kick(9, 85), b * BAR + q * BEAT, gain=.4)
            for s16 in range(16 if not last else 8): add(noise_hit(.06, 7000, 60), b * BAR + s16 * BEAT / 4 + (.01 if s16 % 2 else 0), pan=.3, gain=.03 * (1.6 if s16 % 4 == 2 else 1))
            for q in (1, 3) if not last else (): add(clap(), b * BAR + q * BEAT, gain=.07)
    # --- bass
    if not intro and not last:
        pat = {'tenafi': [(0, .4), (.75, .25), (2, .4), (2.75, .25), (3.5, .4)], 'tfe': [(0, .5), (1.5, .4), (2, .5), (3, .3), (3.5, .4)],
               'najenga': [(0, .9), (2, .6), (3, .4)], 'reel': [(0, .75), (1.5, .4), (2.5, .4), (3.25, .5)]}[preset]
        for pos, d in pat:
            t = np.arange(int((d + .2) * SR)) / SR; f = mtof(r)
            s = np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t) + (.25 * saw(f, t, .05) if preset == 'tfe' else 0)
            e = np.minimum(1, t / .008) * np.exp(-t * 2.4); e[int(d * SR):] *= np.linspace(1, 0, len(e) - int(d * SR))
            add(lp(s, 900) * e, b * BAR + pos * BEAT, gain=.22)
    # --- lead / arps
    vel = .6 if intro else .85
    if preset == 'tenafi':
        for i, step in enumerate([0, 2, 3, 1, 2, 3, 0, 3]):
            if last and i >= 6: continue
            add(pluck(mtof(c[step] + 24), .9), b * BAR + i * BEAT / 2 + (.01 if i % 2 else 0), pan=(.4 if i % 2 else -.4), gain=.09 * vel)
    elif preset == 'tfe':
        for i in range(4 if not last else 2):     # bright saw stabs on the off-beats
            t = np.arange(int(.22 * SR)) / SR
            s = sum(saw(mtof(m + 12), t, .15) for m in c) / 4 * np.exp(-t * 9)
            add(lp(s, 3500), b * BAR + i * BEAT + BEAT / 2, pan=(.3 if i % 2 else -.3), gain=.12 * vel)
        if b % 2 == 0:
            for i, step in enumerate([3, 2, 1, 2]):
                add(pluck(mtof(c[step] + 24), .6, 1.5), b * BAR + i * BEAT * .75, pan=.2, gain=.06 * vel)
    elif preset == 'najenga':
        for i, pos in enumerate([0, 1.5, 2, 3.5] if not last else [0, 1.5]):
            for m in c: add(piano(mtof(m + 12)), b * BAR + pos * BEAT, pan=-.15 + .1 * (m % 3), gain=.045 * vel)
        for i, step in enumerate([3, 1, 2, 0]):
            if not last: add(pluck(mtof(c[step] + 24), .8, .6), b * BAR + i * BEAT + BEAT / 2, pan=.4, gain=.05 * vel)
    else:
        for i, step in enumerate([0, 2, 3, 1, 3, 2, 1, 3]):
            if last and i >= 6: continue
            add(pluck(mtof(c[step] + 24), 1.1), b * BAR + i * BEAT / 2 + (.012 if i % 2 else 0), pan=(-.45 if i % 2 else .45), gain=.1 * vel)
    # --- downbeat sparkle and riser into each bar (scene cuts)
    if b > 0:
        add(chime(mtof(c[-1] + 24)), b * BAR - .02, pan=(.5 if b % 2 else -.5), gain=.03)
        n = rng.standard_normal(int(.45 * SR)); n = lfilter([.05], [1, -.95], n) * np.linspace(0, 1, len(n)) ** 2
        add(n, b * BAR - .45, gain=.05 if preset != 'tfe' else .08)

def rev(x, seed):
    r = np.random.default_rng(seed); n = int(2.0 * SR); t = np.arange(n) / SR
    ir = lp(r.standard_normal(n) * np.exp(-t * 3), 5000); ir /= np.sqrt((ir ** 2).sum())
    M = len(x) + n; F = 1 << int(np.ceil(np.log2(M)))
    return np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]

wet = {'tenafi': .22, 'tfe': .18, 'najenga': .2, 'reel': .24}[preset]
oL = Lc + wet * rev(Lc, 1); oR = Rc + wet * rev(Rc, 2)
lp_ = np.zeros((L, 2)); lp_[:, 0] = oL[:L]; lp_[:, 1] = oR[:L]
lp_[:TAIL, 0] += oL[L:L + TAIL]; lp_[:TAIL, 1] += oR[L:L + TAIL]
lp_ /= np.max(np.abs(lp_)) * 1.1
lp_ = np.tanh(lp_ * 1.15) / np.tanh(1.15) * .89
d = (np.clip(lp_, -1, 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())
print(preset, L / SR, 's')
