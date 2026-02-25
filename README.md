🛡️ The Three Gates Protocol

A psychological pre-screening web experience designed as the digital entry layer for a Corporate Escape Room event.

🧠 Overview

The Three Gates Protocol is not a traditional promotional website. It is an immersive behavioral interface that simulates a secure evaluation system. When users scan a QR code, they enter what appears to be a classified corporate screening environment.

Participants must choose between three gates, make decisions under ambiguity, and react within subtle time constraints. The system logs reaction time, decision stability, and interaction patterns to create the illusion of behavioral profiling.

After the psychological reveal, the Escape Room event is introduced.

This transforms a simple QR scan into the first layer of the escape experience.

🎯 Purpose

The goal of this project is to:

Create anticipation before the actual escape room

Simulate corporate-style evaluation and analysis

Introduce pressure-based decision making

Collect anonymous interaction analytics

Enhance immersion before participants even enter the room

The website mirrors the core themes of a Corporate Escape Room:

Observation

Performance tracking

Decision under uncertainty

Structured systems

Controlled environments

🚀 Features
🎭 Immersive Screening Experience

Typewriter-based cinematic text flow

Three-gate decision mechanism

Psychological twist and reveal

Hacker-inspired visual theme

📊 Behavioral Analytics

Unique visitor tracking using UUID

Reaction time measurement

Gate selection logging

Switch vs stay tracking

Aggregated analytics dashboard

🔐 Admin Dashboard

Password-protected route

Total visits and unique visitors

Gate distribution statistics

Switch percentage

Average reaction time

Recent interaction logs

🎨 Design

Dark hacker aesthetic

Neon green accents

Subtle glitch effects

Fully responsive layout

Mobile-first design

🧱 Tech Stack

Frontend

HTML5

CSS3

Vanilla JavaScript

Backend

Node.js

Express

JSON file storage

No database required.

📁 Project Structure
three-gates-protocol/
│
├── server.js
├── package.json
├── /public
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── admin.html
│   ├── poster.jpg
│   └── ambient.mp3
│
└── /data
    └── logs.json
⚙️ Installation

Clone the repository

git clone <your-repo-link>

Navigate into the project folder

cd three-gates-protocol

Install dependencies

npm install

Start the server

node server.js

Open in browser

http://localhost:3000
🔐 Admin Access

Access the analytics dashboard using:

http://localhost:3000/admin?key=YOUR_SECRET_KEY

The secret key can be configured inside server.js.

📈 Data Collected

This system logs anonymous interaction data including:

Visitor ID (UUID stored locally)

Timestamp

Device type

Browser

Gate selected

Whether user switched

Reaction times

No personal or sensitive data is collected.

🏢 Relation to Corporate Escape Room

This project acts as the digital gateway to the Corporate Escape Room. Instead of simply promoting the event, it places users inside a simulated corporate evaluation environment. The system observes, measures, and analyzes their behavior before revealing the actual event.

It sets the tone.

By the time participants see the poster, they already feel like they have been assessed.

The escape room does not begin at the door.

It begins at the scan.

🧩 Future Improvements

Real-time analytics dashboard

IP-based geo statistics

Leaderboard integration

Multi-layer puzzle version

Cloud deployment

📜 License

This project is built for event use and educational purposes.
