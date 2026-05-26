const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));
app.use(express.json());

// ─── Game Rounds Configuration ──────────────────────────────────────────────────
const ROUNDS = [
  {
    round: 1,
    theme: "Supply Chain (The Component Squeeze)",
    crisis: "An embargo has halted Taiwan microchip shipments. We have 14 days of inventory. B2B contracts carry massive penalties for delays, and B2C holiday demand is peaking.",
    options: [
      { letter: 'A', pts: 75,  text: 'Pay a 400% premium for grey-market chips and chartered air-freight to bypass the embargo.' },
      { letter: 'B', pts: 25,  text: 'Run stock to zero while executives fly to Taiwan to manually negotiate an exemption.' },
      { letter: 'C', pts: 100, text: 'Pivot B2C manufacturing to low-chip models, and manually scramble procurement to execute spot-buys for B2B chips globally.' },
      { letter: 'D', pts: 0,   text: 'Issue preemptive Force Majeure notices to B2B clients and cancel Q3 deliveries.' },
      { letter: 'E', pts: 50,  text: 'Halt B2C production completely. Hoard all remaining chips for B2B contracts to avoid legal penalties.' }
    ],
    sapReveal: {
      taxTitle: "⚠ Execution Tax — The Hidden Cost of Option C",
      taxBody: "Manual spot-buys take 72 hours of exhausting labor.",
      solutionTitle: "💡 SAP Solution",
      solutionBody: "SAP IBP & Ariba automates spot-buys globally in minutes."
    }
  },
  {
    round: 2,
    theme: "Finance (The Margin Collapse)",
    crisis: "Rupee depreciation has spiked imported material costs by 18%. Gross margins have collapsed from 46% to 31%. If this holds, we miss our breakeven target and breach debt covenants.",
    options: [
      { letter: 'A', pts: 50,  text: 'Institute a total freeze on Q3 Marketing, R&D, and Hiring budgets to artificially protect cash flow.' },
      { letter: 'B', pts: 75,  text: 'Implement an immediate, flat 15% price hike across all channels to pass costs to the market.' },
      { letter: 'C', pts: 0,   text: 'Secretly downgrade to cheaper, unvetted domestic components to instantly cut manufacturing costs.' },
      { letter: 'D', pts: 100, text: 'Task the finance team to run profitability models to dynamically adjust B2C pricing, and aggressively renegotiate local supplier terms.' },
      { letter: 'E', pts: 25,  text: 'Draw down on high-interest corporate debt to absorb the cost and keep market prices flat.' }
    ],
    sapReveal: {
      taxTitle: "⚠ Execution Tax — The Hidden Cost of Option D",
      taxBody: "Pulling data from siloed systems takes 5 days, bleeding ₹20 Cr in lost margin.",
      solutionTitle: "💡 SAP Solution",
      solutionBody: "SAP S/4HANA & Analytics Cloud run instant profitability simulations, pushing pricing updates live identically."
    }
  },
  {
    round: 3,
    theme: "HR (The Factory Rebellion)",
    crisis: "Legacy payroll systems failed to track 24/7 factory overtime accurately. Attrition among specialized engineers has hit 28%. The union threatens a massive walkout in 72 hours if discrepancies aren't fixed.",
    options: [
      { letter: 'A', pts: 75,  text: 'Bypass the audit and approve a blanket 15% wage increase for all factory staff to appease the union.' },
      { letter: 'B', pts: 100, text: 'Deploy an HR strike-team to manually audit timesheets, issue unbudgeted retention bonuses, and reorganize shifts.' },
      { letter: 'C', pts: 0,   text: 'Enter union negotiations using fragmented spreadsheets to dispute claims line-by-line.' },
      { letter: 'D', pts: 50,  text: 'Hire temporary agency workers at a massive premium to maintain production while HR audits data manually over the next month.' },
      { letter: 'E', pts: 25,  text: 'Refuse demands, force mandatory overtime for non-union staff, and deploy legal counsel.' }
    ],
    sapReveal: {
      taxTitle: "⚠ Execution Tax — The Hidden Cost of Option B",
      taxBody: "Manual audits pause all HR functions, and reactive bonuses cost unbudgeted millions.",
      solutionTitle: "💡 SAP Solution",
      solutionBody: "SAP SuccessFactors natively unifies time-tracking and payroll, preventing the error and avoiding the strike entirely."
    }
  },
  {
    round: 4,
    theme: "Customer Experience (The Server Crash)",
    crisis: "A luxury hotel chain attempts to order 10,000 units via our B2B portal. Simultaneously, a viral campaign drives 500,000 users to our B2C site. Our siloed CRM and inventory servers crash, losing order visibility.",
    options: [
      { letter: 'A', pts: 50,  text: 'Take the B2B hotel order manually via phone, leaving the website unstable for the consumers.' },
      { letter: 'B', pts: 0,   text: 'Cancel the marketing campaign and reject the B2B order to completely reset the system load.' },
      { letter: 'C', pts: 75,  text: 'Shut down the B2C website entirely to preserve all bandwidth for the massive B2B hotel order.' },
      { letter: 'D', pts: 25,  text: 'Reboot servers and let users buy blindly; capture cash now and sort out oversold inventory with manual refunds later.' },
      { letter: 'E', pts: 100, text: 'IT manually partitions servers, routing VIP B2B traffic to a secure portal and throwing up a static \"Out of Stock\" page for B2C.' }
    ],
    sapReveal: {
      taxTitle: "⚠ Execution Tax — The Hidden Cost of Option E",
      taxBody: "The static page cannot capture consumer payments or gauge demand, leading to a massive loss of viral revenue.",
      solutionTitle: "💡 SAP Solution",
      solutionBody: "SAP CX Suite offers unified commerce that processes the B2B order while auto-switching the B2C site to \"Pre-Order\" with active payment capture."
    }
  },
  {
    round: 5,
    theme: "IT & Infrastructure (The Integration Nightmare)",
    crisis: "We just acquired a European competitor. Their legacy ERP cannot communicate with ours. End-of-quarter financial reporting is due to the board in 5 days.",
    options: [
      { letter: 'A', pts: 25,  text: 'Delay the global earnings report to the board until the two systems are manually merged.' },
      { letter: 'B', pts: 100, text: 'Form an emergency IT & Finance task force to manually export, map, and consolidate core financial data using master spreadsheets.' },
      { letter: 'C', pts: 50,  text: 'Force the subsidiary\'s finance team to work overnight to manually re-enter their entire quarter\'s data into our system.' },
      { letter: 'D', pts: 0,   text: 'Operate as two completely separate companies financially and submit un-consolidated, estimated reports.' },
      { letter: 'E', pts: 75,  text: 'Hire an IT contracting firm at a heavy premium to build a custom, temporary API bridge in 4 days.' }
    ],
    sapReveal: {
      taxTitle: "⚠ Execution Tax — The Hidden Cost of Option B",
      taxBody: "The numbers are manual estimates, posing massive compliance risks while your team works 100-hour weeks.",
      solutionTitle: "💡 SAP Solution",
      solutionBody: "SAP BTP and Business ByDesign enable rapid two-tier ERP integration, mapping the subsidiary\'s data instantly and closing the quarter on time."
    }
  }
];

// ─── Game State ────────────────────────────────────────────────────────────────
let gameState = {
  currentRound: 1,         // 1 to 5
  phase: 'IDLE',           // IDLE | VOTING | GRAPH_REVEAL | SCORE_REVEAL | SAP_REVEAL | LEADERBOARD
  votes: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  voterIds: new Set(),     // track who already voted
  timerStart: null,        // server timestamp when voting began
  timerDuration: 300,      // seconds
  leaderboard: [
    { name: 'Table 1', score: 0 },
    { name: 'Table 2', score: 0 },
    { name: 'Table 3', score: 0 },
    { name: 'Table 4', score: 0 },
    { name: 'Table 5', score: 0 },
  ],
  roundContent: ROUNDS[0],  // Embed dynamic content
  tableAssignments: {}     // tableId -> voterId
};

// ─── Broadcast helpers ─────────────────────────────────────────────────────────
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}

function broadcastState() {
  const payload = {
    ...gameState,
    voterIds: Array.from(gameState.voterIds),
  };
  broadcast({ type: 'STATE_UPDATE', state: payload });
}

// ─── REST – Host control endpoints ─────────────────────────────────────────────
app.post('/api/advance', (req, res) => {
  const { phase } = req.body;
  const validPhases = ['IDLE', 'VOTING', 'GRAPH_REVEAL', 'SCORE_REVEAL', 'SAP_REVEAL', 'LEADERBOARD'];
  if (!validPhases.includes(phase)) return res.status(400).json({ error: 'Invalid phase' });

  gameState.phase = phase;

  if (phase === 'VOTING') {
    gameState.votes    = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    gameState.voterIds = new Set();
    gameState.timerStart = Date.now();
  }

  broadcastState();
  res.json({ ok: true, phase });
});

app.post('/api/next-round', (req, res) => {
  if (gameState.currentRound >= 5) {
    return res.status(400).json({ error: 'Already at final round' });
  }

  gameState.currentRound++;
  gameState.phase = 'IDLE';
  gameState.votes = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  gameState.voterIds = new Set();
  gameState.timerStart = null;
  gameState.roundContent = ROUNDS[gameState.currentRound - 1];

  broadcastState();
  res.json({ ok: true, round: gameState.currentRound });
});

app.post('/api/simulate-votes', (req, res) => {
  const opts = ['A', 'B', 'C', 'D', 'E'];
  const currentRoundData = ROUNDS[gameState.currentRound - 1];

  gameState.votes = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  gameState.voterIds = new Set(); // Reset simulated voters

  gameState.leaderboard.forEach((table) => {
    const pick = opts[Math.floor(Math.random() * opts.length)];
    gameState.votes[pick]++;
    const pts = currentRoundData.options.find(o => o.letter === pick).pts;
    table.score += pts;
  });
  
  broadcastState();
  res.json({ ok: true, votes: gameState.votes });
});

app.post('/api/update-teams', (req, res) => {
  const { count } = req.body;
  const num = parseInt(count);
  if (isNaN(num) || num < 1 || num > 100) {
    return res.status(400).json({ error: 'Invalid team count (must be between 1 and 100)' });
  }

  // Generate new leaderboard state with `num` tables
  const currentScores = {};

  // Preserve existing scores for matching tables if possible, otherwise start at 0
  gameState.leaderboard.forEach((t, i) => {
    currentScores[i + 1] = t.score;
  });

  gameState.leaderboard = [];
  for (let i = 1; i <= num; i++) {
    const score = currentScores[i] || 0;
    gameState.leaderboard.push({
      name: `Table ${i}`,
      score: score
    });
  }

  // Clean up table assignments that are now out of bounds
  for (const tableId of Object.keys(gameState.tableAssignments)) {
    const tId = parseInt(tableId);
    if (tId > num) {
      delete gameState.tableAssignments[tableId];
    }
  }

  broadcastState();
  res.json({ ok: true, count: num });
});

app.post('/api/reset', (req, res) => {
  gameState.currentRound = 1;
  gameState.phase    = 'IDLE';
  gameState.votes    = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  gameState.voterIds = new Set();
  gameState.timerStart = null;
  gameState.leaderboard = gameState.leaderboard.map(t => ({ ...t, score: 0 }));
  gameState.roundContent = ROUNDS[0];
  gameState.tableAssignments = {};
  
  broadcastState();
  res.json({ ok: true });
});

app.post('/api/vote', (req, res) => {
  const { voterId, tableId, option } = req.body;
  if (!['A','B','C','D','E'].includes(option)) return res.status(400).json({ error: 'Bad option' });
  if (gameState.phase !== 'VOTING') return res.status(400).json({ error: 'Not in voting phase' });
  if (gameState.voterIds.has(voterId)) return res.status(400).json({ error: 'Already voted' });

  gameState.votes[option]++;
  gameState.voterIds.add(voterId);

  // Add points to table in leaderboard
  if (tableId) {
    const tableIndex = parseInt(tableId) - 1; // "1" -> 0
    if (tableIndex >= 0 && tableIndex < gameState.leaderboard.length) {
      const currentRoundData = ROUNDS[gameState.currentRound - 1];
      const pts = currentRoundData.options.find(o => o.letter === option).pts;
      gameState.leaderboard[tableIndex].score += pts;
    }
  }

  broadcastState();
  res.json({ ok: true });
});

app.post('/api/select-table', (req, res) => {
  const { voterId, tableId } = req.body;
  if (!voterId || !tableId) {
    return res.status(400).json({ error: 'Missing voterId or tableId' });
  }

  // Ensure tableId is in bounds
  const tableIdx = parseInt(tableId) - 1;
  if (isNaN(tableIdx) || tableIdx < 0 || tableIdx >= gameState.leaderboard.length) {
    return res.status(400).json({ error: 'Invalid tableId' });
  }

  // Check if this table is already assigned to a different voter
  const currentAssignee = gameState.tableAssignments[tableId];
  if (currentAssignee && currentAssignee !== voterId) {
    return res.status(409).json({ error: 'Table is already selected by another player.' });
  }

  // Release any tables previously occupied by this voterId
  for (const [tid, vid] of Object.entries(gameState.tableAssignments)) {
    if (vid === voterId) {
      delete gameState.tableAssignments[tid];
    }
  }

  // Assign the new table
  gameState.tableAssignments[tableId] = voterId;
  console.log(`Table ${tableId} assigned to voter ${voterId}`);

  broadcastState();
  res.json({ ok: true });
});

app.post('/api/deselect-table', (req, res) => {
  const { voterId } = req.body;
  if (!voterId) {
    return res.status(400).json({ error: 'Missing voterId' });
  }

  let released = false;
  for (const [tid, vid] of Object.entries(gameState.tableAssignments)) {
    if (vid === voterId) {
      delete gameState.tableAssignments[tid];
      released = true;
      console.log(`Table ${tid} manually deselected by voter ${voterId}`);
    }
  }

  if (released) {
    broadcastState();
  }
  res.json({ ok: true });
});

app.get('/api/state', (req, res) => {
  res.json({ ...gameState, voterIds: Array.from(gameState.voterIds) });
});

// ─── WebSocket – push state on connect ─────────────────────────────────────────
wss.on('connection', (ws) => {
  const payload = { ...gameState, voterIds: Array.from(gameState.voterIds) };
  ws.send(JSON.stringify({ type: 'STATE_UPDATE', state: payload }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'REGISTER') {
        ws.voterId = data.voterId;
        console.log(`Voter registered: ${ws.voterId}`);
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  });

  ws.on('close', () => {
    if (ws.voterId) {
      console.log(`Voter connection closed: ${ws.voterId}`);
      // Count open connections remaining for this voterId
      let openConnections = 0;
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN && client.voterId === ws.voterId) {
          openConnections++;
        }
      });

      if (openConnections === 0) {
        let changed = false;
        for (const [tableId, assignedVoterId] of Object.entries(gameState.tableAssignments)) {
          if (assignedVoterId === ws.voterId) {
            delete gameState.tableAssignments[tableId];
            console.log(`Released Table ${tableId} because voter ${ws.voterId} disconnected`);
            changed = true;
          }
        }
        if (changed) {
          broadcastState();
        }
      }
    }
  });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎮  Trade-Off Trap running at http://localhost:${PORT}`);
  console.log(`   Host panel  → http://localhost:${PORT}/host.html`);
  console.log(`   Display     → http://localhost:${PORT}/display.html`);
  console.log(`   Player      → http://localhost:${PORT}/player.html\n`);
});
