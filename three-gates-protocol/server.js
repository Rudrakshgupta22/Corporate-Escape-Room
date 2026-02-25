'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET_KEY = 'GATE-PROTOCOL-2026';          // Change this before deploying
const DATA_DIR = path.join(__dirname, 'data');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// ─── Bootstrap ────────────────────────────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, '[]', 'utf8');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readLogs() {
    try {
        const raw = fs.readFileSync(LOGS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (_) {
        return [];
    }
}

function writeLogs(logs) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
}

function appendLog(entry) {
    const logs = readLogs();
    logs.push(entry);
    writeLogs(logs);
}

function sanitizeString(val, maxLength = 256) {
    if (typeof val !== 'string') return '';
    return val.trim().slice(0, maxLength);
}

function sanitizeNumber(val) {
    const n = parseFloat(val);
    return isNaN(n) ? null : parseFloat(n.toFixed(4));
}

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /log — accept session data from client
app.post('/log', (req, res) => {
    try {
        const body = req.body;

        const entry = {
            visitorId: sanitizeString(body.visitorId, 64),
            timestamp: sanitizeString(body.timestamp, 64),
            device: sanitizeString(body.device, 64),
            browser: sanitizeString(body.browser, 128),
            gateSelected: sanitizeString(body.gateSelected, 16),
            switched: body.switched === true || body.switched === 'true',
            firstReactionTime: sanitizeNumber(body.firstReactionTime),
            secondReactionTime: sanitizeNumber(body.secondReactionTime),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
            userAgent: sanitizeString(req.headers['user-agent'], 256),
            serverTimestamp: new Date().toISOString(),
        };

        // Validate required fields
        if (!entry.visitorId || !entry.gateSelected) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        appendLog(entry);
        return res.status(200).json({ status: 'Logged.' });
    } catch (err) {
        console.error('[POST /log] Error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /poster.png — serve poster from parent directory
app.get('/poster.png', (req, res) => {
    const posterPath = path.join(__dirname, '..', 'poster.png');
    if (!fs.existsSync(posterPath)) {
        return res.status(404).send('Poster not found.');
    }
    res.sendFile(posterPath);
});

// GET /admin — serve admin dashboard (key-protected)
app.get('/admin', (req, res) => {
    const key = req.query.key || '';
    if (key !== ADMIN_SECRET_KEY) {
        return res.status(403).send('403 FORBIDDEN — Invalid access key.');
    }
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// GET /admin-data — return aggregated analytics (key-protected)
app.get('/admin-data', (req, res) => {
    const key = req.query.key || '';
    if (key !== ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Forbidden.' });
    }

    try {
        const logs = readLogs();
        const total = logs.length;

        const uniqueVisitors = new Set(logs.map(l => l.visitorId)).size;

        let gateI = 0, gateII = 0, gateIII = 0;
        let switched = 0;
        let sumFirst = 0, countFirst = 0;
        let sumSecond = 0, countSecond = 0;

        for (const log of logs) {
            if (log.gateSelected === 'I') gateI++;
            if (log.gateSelected === 'II') gateII++;
            if (log.gateSelected === 'III') gateIII++;

            if (log.switched) switched++;

            if (log.firstReactionTime !== null && log.firstReactionTime !== undefined) {
                sumFirst += log.firstReactionTime;
                countFirst++;
            }
            if (log.secondReactionTime !== null && log.secondReactionTime !== undefined) {
                sumSecond += log.secondReactionTime;
                countSecond++;
            }
        }

        const switchPercent = total > 0 ? parseFloat(((switched / total) * 100).toFixed(1)) : 0;
        const stayPercent = total > 0 ? parseFloat((100 - switchPercent).toFixed(1)) : 100;
        const avgFirst = countFirst > 0 ? parseFloat((sumFirst / countFirst).toFixed(2)) : 0;
        const avgSecond = countSecond > 0 ? parseFloat((sumSecond / countSecond).toFixed(2)) : 0;

        const recentLogs = [...logs].reverse().slice(0, 20);

        return res.json({
            totalVisits: total,
            uniqueVisitors,
            gateI,
            gateII,
            gateIII,
            switchPercent,
            stayPercent,
            avgFirstReactionTime: avgFirst,
            avgSecondReactionTime: avgSecond,
            recentLogs,
        });
    } catch (err) {
        console.error('[GET /admin-data] Error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[THREE GATES PROTOCOL] Server online → http://localhost:${PORT}`);
    console.log(`[THREE GATES PROTOCOL] Admin dashboard → http://localhost:${PORT}/admin?key=${ADMIN_SECRET_KEY}`);
});
