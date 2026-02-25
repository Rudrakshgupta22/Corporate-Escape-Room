'use strict';

/* ── Visitor ID ────────────────────────────────────────────────────────────── */
function getOrCreateVisitorId() {
    let id = localStorage.getItem('visitorId');
    if (!id) {
        try {
            const arr = new Uint8Array(16);
            crypto.getRandomValues(arr);
            arr[6] = (arr[6] & 0x0f) | 0x40;
            arr[8] = (arr[8] & 0x3f) | 0x80;
            id = [...arr].map((b, i) =>
                ([4, 6, 8, 10].includes(i) ? '-' : '') + b.toString(16).padStart(2, '0')
            ).join('');
        } catch (_) {
            id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        }
        localStorage.setItem('visitorId', id);
    }
    return id;
}

/* ── Device / Browser Detection ─────────────────────────────────────────────── */
function detectDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
}

function detectBrowser() {
    const ua = navigator.userAgent;
    if (/Edg\//i.test(ua)) return 'Microsoft Edge';
    if (/Firefox\//i.test(ua)) return 'Mozilla Firefox';
    if (/OPR\//i.test(ua)) return 'Opera';
    if (/Chrome\//i.test(ua)) return 'Google Chrome';
    if (/Safari\//i.test(ua)) return 'Apple Safari';
    return 'Unknown Browser';
}

function getTimeString() {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2, '0'))
        .join(':');
}

/* ── Typewriter ─────────────────────────────────────────────────────────────── */
function typewrite(el, text, delayPerChar = 28) {
    return new Promise(resolve => {
        el.textContent = '';
        let i = 0;
        function next() {
            if (i < text.length) {
                el.textContent += text[i++];
                setTimeout(next, delayPerChar + Math.random() * 12);
            } else {
                resolve();
            }
        }
        next();
    });
}

/* ── Append Boot Line ───────────────────────────────────────────────────────── */
function appendLine(container, text, cls = '', delayMs = 0) {
    return new Promise(resolve => {
        setTimeout(async () => {
            const div = document.createElement('div');
            div.className = 'boot-line' + (cls ? ' ' + cls : '');
            container.appendChild(div);
            await typewrite(div, text, 22);
            resolve();
        }, delayMs);
    });
}

/* ── Wait Helper ─────────────────────────────────────────────────────────────── */
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ── Phase Transitions ───────────────────────────────────────────────────────── */
function showPhase(id) {
    document.querySelectorAll('.phase').forEach(p => {
        if (p.id === id) {
            p.classList.add('active');
            p.classList.remove('fade-out');
        } else {
            p.classList.remove('active');
        }
    });
}

function fadeOutPhase(id) {
    const p = document.getElementById(id);
    if (p) { p.classList.add('fade-out'); p.classList.remove('active'); }
}

/* ── Audio ────────────────────────────────────────────────────────────────────── */
let audioStarted = false;
const ambientAudio = document.getElementById('ambientAudio');

function startAmbient() {
    if (audioStarted) return;
    audioStarted = true;
    ambientAudio.volume = 0.18;
    ambientAudio.play().catch(() => { });
}

let _audioCtx = null;
function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
}

function playGlitchSound() {
    try {
        const ctx = getAudioCtx();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.3;
        }
        const source = ctx.createBufferSource();
        source.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = 0.25;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    } catch (_) { }
}

/* ── Glitch overlay controls ────────────────────────────────────────────────── */
const glitchOverlay = document.getElementById('glitchOverlay');

function glitchOn(mode = 'active') {
    glitchOverlay.classList.remove('active', 'intense');
    glitchOverlay.classList.add(mode);
}
function glitchOff() {
    glitchOverlay.classList.remove('active', 'intense');
}

/* ── State ───────────────────────────────────────────────────────────────────── */
const state = {
    visitorId: getOrCreateVisitorId(),
    device: detectDevice(),
    browser: detectBrowser(),
    gateSelected: null,
    switched: false,
    firstReactionTime: null,
    secondReactionTime: null,
    pageLoadTime: Date.now(),
};

/* ══════════════════════════════════════════════════════════════════════════════
   PHASE 1 — SYSTEM INITIALIZATION
══════════════════════════════════════════════════════════════════════════════ */
async function runPhase1() {
    const container = document.getElementById('bootLines');
    showPhase('phase1');

    const lines = [
        { text: 'Establishing Secure Channel...', cls: '' },
        { text: 'Encryption Layer Active.', cls: 'dim' },
        { text: 'Device Identified.', cls: 'dim' },
        { text: 'Session Logged.', cls: 'dim' },
        { text: '─────────────────────────────────', cls: 'sep' },
        { text: `Access Time: ${getTimeString()}`, cls: '' },
        { text: `Device: ${state.device}`, cls: '' },
        { text: `Browser: ${state.browser}`, cls: '' },
        { text: '─────────────────────────────────', cls: 'sep' },
        { text: 'Behavioral Analysis Initiated.', cls: 'red' },
        { text: 'This interface is not public.', cls: 'warn' },
        { text: 'This is a screening protocol.', cls: 'warn' },
    ];

    for (const { text, cls } of lines) {
        await appendLine(container, text, cls);
        await wait(120);
    }

    await wait(900);
    fadeOutPhase('phase1');
    await wait(600);
    await runPhase2();
}

/* ══════════════════════════════════════════════════════════════════════════════
   PHASE 2 — GATE SELECTION
══════════════════════════════════════════════════════════════════════════════ */
async function runPhase2() {
    showPhase('phase2');
    startAmbient();

    // Type directive
    const directiveEl = document.getElementById('directiveText');
    await typewrite(directiveEl, 'You must now choose a gate.', 30);
    await wait(400);

    // Expose gates
    const gates = document.querySelectorAll('.gate');
    gates.forEach(g => {
        g.style.opacity = '0';
        g.style.transition = 'opacity 0.35s ease';
    });
    await wait(200);
    for (let i = 0; i < gates.length; i++) {
        await wait(i * 200);
        gates[i].style.opacity = '1';
    }

    // Gate click
    const gateClickTime = await new Promise(resolve => {
        gates.forEach(gate => {
            gate.addEventListener('click', function handler() {
                gates.forEach(g => g.removeEventListener('click', handler));
                gates.forEach(g => g.disabled = true);
                state.gateSelected = this.dataset.gate;
                state.firstReactionTime = parseFloat(((Date.now() - state.pageLoadTime) / 1000).toFixed(2));
                this.classList.add('selected');
                playGlitchSound();
                glitchOn('active');
                setTimeout(glitchOff, 400);
                resolve(Date.now());
            });
        });
    });

    await wait(600);

    // Decision panel
    const decisionPanel = document.getElementById('decisionPanel');
    const decisionMsg = document.getElementById('decisionMsg');
    const decisionSub = document.getElementById('decisionSub');
    decisionPanel.classList.remove('hidden');

    const msgLines = [
        'Selection Registered.',
        'Interesting.',
        `62% of candidates select this gate.`,
        'But it was not your first instinct.',
    ];
    for (const line of msgLines) {
        decisionMsg.textContent += (decisionMsg.textContent ? '\n' : '') + line;
        await wait(420);
    }

    await wait(500);
    await typewrite(decisionSub, 'Do you wish to alter your decision?', 28);

    const decisionStart = Date.now();

    await new Promise(resolve => {
        document.getElementById('btnStay').addEventListener('click', async () => {
            state.switched = false;
            state.secondReactionTime = parseFloat(((Date.now() - decisionStart) / 1000).toFixed(2));
            await typewrite(decisionSub, 'Commitment Pattern Detected.', 30);
            resolve();
        }, { once: true });

        document.getElementById('btnSwitch').addEventListener('click', async () => {
            state.switched = true;
            state.secondReactionTime = parseFloat(((Date.now() - decisionStart) / 1000).toFixed(2));
            await typewrite(decisionSub, 'Volatility Pattern Detected.', 30);
            resolve();
        }, { once: true });
    });

    // POST to backend
    postLog();

    await wait(700);
    glitchOn('active');
    await wait(350);
    glitchOff();
    fadeOutPhase('phase2');
    await wait(600);
    await runPhase3();
}

/* ══════════════════════════════════════════════════════════════════════════════
   PHASE 3 — PSYCHOLOGICAL REVEAL
══════════════════════════════════════════════════════════════════════════════ */
async function runPhase3() {
    showPhase('phase3');
    glitchOn('active');
    await wait(300);
    glitchOff();

    const container = document.getElementById('revealLines');

    const lines = [
        { text: 'You believe this was about the correct gate.', cls: '' },
        { text: '', cls: 'blank' },
        { text: 'It was not.', cls: 'accent' },
        { text: '', cls: 'blank' },
        { text: 'There is no correct gate.', cls: '' },
        { text: '', cls: 'blank' },
        { text: 'We were measuring hesitation.', cls: '' },
        { text: 'Decision volatility.', cls: '' },
        { text: 'Compliance under ambiguity.', cls: '' },
    ];

    for (const { text, cls } of lines) {
        const div = document.createElement('div');
        div.className = 'reveal-line' + (cls ? ' ' + cls : '');
        container.appendChild(div);
        if (text) await typewrite(div, text, 24);
        await wait(180);
    }

    await wait(600);

    // Show stats
    const stability = state.switched ? 'Volatile' : 'Stable';
    const profile = state.firstReactionTime < 4
        ? 'Impulsive'
        : state.firstReactionTime < 9
            ? 'Calculated'
            : 'Predictable';

    document.getElementById('statFirst').textContent = `${state.firstReactionTime}s`;
    document.getElementById('statStability').textContent = stability;
    document.getElementById('statProfile').textContent = profile;
    document.getElementById('statsPanel').classList.remove('hidden');

    await wait(2400);
    glitchOn('active');
    await wait(350);
    glitchOff();
    fadeOutPhase('phase3');
    await wait(600);
    await runPhase4();
}

/* ══════════════════════════════════════════════════════════════════════════════
   PHASE 4 — FINAL REVEAL
══════════════════════════════════════════════════════════════════════════════ */
async function runPhase4() {
    showPhase('phase4');
    glitchOn('intense');
    await wait(250);
    glitchOff();

    const container = document.getElementById('finalText');

    const lines = [
        { text: 'If this interface unsettled you...', cls: 'final-line' },
        { text: 'CORPORATE ESCAPE ROOM', cls: 'final-line big' },
    ];

    for (const { text, cls } of lines) {
        const div = document.createElement('div');
        div.className = cls;
        container.appendChild(div);
        await typewrite(div, text, 30);
        await wait(500);
    }

    await wait(1200);

    // Intense glitch burst
    glitchOn('intense');
    await wait(420);
    glitchOff();
    await wait(150);
    glitchOn('intense');
    await wait(200);
    glitchOff();

    // Fade in poster
    const posterWrap = document.getElementById('posterWrap');
    posterWrap.classList.remove('hidden');
    await wait(50);
    posterWrap.classList.add('show');
}

/* ── Backend POST ─────────────────────────────────────────────────────────── */
async function postLog() {
    const body = {
        visitorId: state.visitorId,
        timestamp: new Date().toISOString(),
        device: state.device,
        browser: state.browser,
        gateSelected: state.gateSelected,
        switched: state.switched,
        firstReactionTime: state.firstReactionTime,
        secondReactionTime: state.secondReactionTime,
    };

    try {
        const API_BASE = 'https://three-gates-protocol.onrender.com';
        await fetch(`${API_BASE}/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    } catch (_) {
        // Fail silently — user experience must not be interrupted
    }
}

/* ── Boot ─────────────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
    runPhase1();
});
