# The Trade-Off Trap — Setup Guide

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run the server
npm start
```

Server starts at **http://localhost:3000**

---

## The Three Screens

| Screen | URL | Purpose |
|---|---|---|
| **Host Panel** | http://localhost:3000/host.html | Host's control dashboard + live preview of both screens |
| **Display** | http://localhost:3000/display.html | Open on projector / main screen |
| **Player** | http://localhost:3000/player.html | Open on each player's phone (share the URL on your network) |

---

## How to Run the Full Simulation

### Testing on One Monitor
Open `http://localhost:3000/host.html` — it embeds both Display and Player screens in iframes so you can see everything in one window.

### Real Event Setup
1. Connect laptop to projector → open `display.html` fullscreen
2. On your phone (same WiFi) → open `http://YOUR_LAN_IP:3000/player.html`
3. Keep `host.html` on your laptop

**Find your LAN IP:**
- Mac/Linux: `ifconfig | grep inet`  
- Windows: `ipconfig | findstr IPv4`

---

## Host Control Flow

```
IDLE → VOTING → GRAPH_REVEAL → SCORE_REVEAL → SAP_REVEAL → LEADERBOARD
```

1. **Start Timer** — begins 5-minute countdown, unlocks player voting
2. **Show Vote Graph** — reveals bar chart of votes (use "Simulate 5 Random Votes" first if testing alone)
3. **Reveal Scores** — shows point values next to each option
4. **Show SAP Solution** — reveals the execution tax + SAP answer
5. **Show Leaderboard** — displays table standings
6. **Reset Round** — wipes all state back to IDLE

---

## File Structure

```
tradeoff-trap/
├── server.js          ← Node.js + Express + WebSocket server
├── package.json
└── public/
    ├── styles.css     ← Shared dark-mode design system
    ├── index.html     ← Redirects to host.html
    ├── host.html      ← Host control panel
    ├── display.html   ← Projector screen
    └── player.html    ← Player mobile screen
```
