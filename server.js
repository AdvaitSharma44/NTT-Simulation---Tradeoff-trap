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
    theme: "Finance (Month-End Close)",
    crisis: "A manufacturing company operating multiple plants closes its books 12 days after month-end. The CFO wants faster reporting and more confidence in numbers without adding more manual reconciliation work. What is the most effective approach?",
    options: [
      { letter: 'A', pts: 25,  text: "Set stricter deadlines for each plant's finance team and assign a dedicated person to chase submissions." },
      { letter: 'B', pts: 50,  text: "Standardize reporting formats across all plants and require plant finance heads to sign off before submitting." },
      { letter: 'C', pts: 75,  text: "Create a structured month-end calendar with fixed milestones, task owners, and a mid-close review." },
      { letter: 'D', pts: 100, text: "Establish a dedicated close coordination team running parallel close tracks with a hard cut-off policy." }
    ],
    sapReveal: {
      taxTitle: "⚠ Traditional Trade-off — The Hidden Execution Cost",
      taxBody: "Data lives in disconnected systems across plants. Every close cycle requires the same manual effort — there is no structural fix, only a better-managed workaround.",
      solutionTitle: "💡 SAP & NDBS Solution",
      solutionBody: "SAP S/4HANA Public Cloud records all plant transactions into one unified ledger in real time, reducing close cycles to 1–2 days with no manual consolidation. NDBS deploys this through GROW with SAP with proven finance templates and change management support."
    }
  },
  {
    round: 2,
    theme: "Supply Chain (Demand Swings)",
    crisis: "An automotive supplier is struggling with sudden swings in customer demand. Some components run out while others pile up in warehouses. What is the best response?",
    options: [
      { letter: 'A', pts: 100, text: "Establish a formal S&OP process where sales forecasts directly drive procurement and production planning on a rolling monthly basis." },
      { letter: 'B', pts: 50,  text: "Set fixed minimum and maximum stock levels and instruct procurement to reorder when components hit the minimum threshold." },
      { letter: 'C', pts: 75,  text: "Hold regular cross-functional meetings between sales, production, and procurement to share signals and adjust plans collaboratively." },
      { letter: 'D', pts: 25,  text: "Have the warehouse team do weekly stock counts and manually adjust purchase orders based on what they find." }
    ],
    sapReveal: {
      taxTitle: "⚠ Traditional Trade-off — The Hidden Execution Cost",
      taxBody: "Demand signals, inventory positions, and supply constraints live in separate systems. Without a connected planning backbone, the business structurally cannot react fast enough.",
      solutionTitle: "💡 SAP & NDBS Solution",
      solutionBody: "SAP IBP connects demand, inventory, and supply into one live model — automatically adjusting plans as demand shifts. NDBS implements with automotive-specific templates calibrated to the industry's volatility patterns from day one."
    }
  },
  {
    round: 3,
    theme: "Operations (Machine Downtime)",
    crisis: "A plant head is under pressure because repeated machine downtime is hurting on-time delivery and profitability. Which approach would create the greatest long-term value?",
    options: [
      { letter: 'A', pts: 100, text: "Implement a reliability-centered maintenance program assessing machines by failure risk and criticality, with operator training and weekly KPI reviews." },
      { letter: 'B', pts: 25,  text: "Keep a dedicated repair crew on standby and stock commonly replaced spare parts to reduce repair turnaround time." },
      { letter: 'C', pts: 50,  text: "Require operators to log every breakdown with cause and duration, reviewed monthly by the maintenance supervisor." },
      { letter: 'D', pts: 75,  text: "Develop a preventive maintenance schedule based on manufacturer guidelines and historical data, with dedicated windows in the production calendar." }
    ],
    sapReveal: {
      taxTitle: "⚠ Traditional Trade-off — The Hidden Execution Cost",
      taxBody: "Traditional maintenance is built on averages and observation, not live machine data. Without real-time signals from equipment, failures that could have been predicted still cause unplanned downtime.",
      solutionTitle: "💡 SAP & NDBS Solution",
      solutionBody: "SAP S/4HANA with SAP Business AI and SAP BTP automatically triggers work orders based on live machine data before failures occur. NDBS connects plant floor systems to SAP, turning real-time signals into actionable predictive maintenance intelligence."
    }
  },
  {
    round: 4,
    theme: "Procurement (Supplier Risk)",
    crisis: "A consumer products company relies on hundreds of suppliers across regions. The procurement head wants to control costs while reducing the risk of supplier disruption. What is the most effective strategy?",
    options: [
      { letter: 'A', pts: 50,  text: "Renegotiate contracts annually and push for lower prices from the top 20 suppliers." },
      { letter: 'B', pts: 100, text: "Build a structured supplier performance scorecard reviewed quarterly with clear improvement targets." },
      { letter: 'C', pts: 25,  text: "Award more volume to whichever supplier offers the lowest price at each procurement cycle." },
      { letter: 'D', pts: 75,  text: "Dual-source all critical materials to reduce dependency on any single supplier." }
    ],
    sapReveal: {
      taxTitle: "⚠ Traditional Trade-off — The Hidden Execution Cost",
      taxBody: "Even a well-run scorecard is reactive — it captures what already happened. Without real-time visibility into supplier performance and risk, procurement is always a step behind the disruption it's trying to prevent.",
      solutionTitle: "💡 SAP & NDBS Solution",
      solutionBody: "SAP Ariba digitizes the full supplier lifecycle — from onboarding and risk monitoring to sourcing and contract compliance — with real-time visibility across all suppliers. NDBS configures Ariba to match existing sourcing workflows for fast adoption and immediate value."
    }
  },
  {
    round: 5,
    theme: "Commercial (Profit Margin)",
    crisis: "A pharmaceutical company is growing revenue but the CEO is concerned that profit is not improving at the same pace. What should leadership prioritize first?",
    options: [
      { letter: 'A', pts: 25,  text: "Expand the sales team in high-growth territories to drive more revenue volume." },
      { letter: 'B', pts: 100, text: "Conduct a detailed manual profitability analysis by product, customer, and sales channel." },
      { letter: 'C', pts: 50,  text: "Increase list prices across all product categories to improve overall margin." },
      { letter: 'D', pts: 75,  text: "Standardize discount approval processes and set stricter limits for the sales team." }
    ],
    sapReveal: {
      taxTitle: "⚠ Traditional Trade-off — The Hidden Execution Cost",
      taxBody: "Even a thorough manual analysis is a snapshot in time. Without a connected view of sales, pricing, and costs in one place, commercial decisions are always based on information that is already stale.",
      solutionTitle: "💡 SAP & NDBS Solution",
      solutionBody: "SAP S/4HANA with SAP Analytics Cloud delivers a live view of profitability by customer, product, and channel — with no manual compilation. NDBS structures the implementation around the company's commercial model so the right margin dimensions are visible from day one."
    }
  },
  {
    round: 6,
    theme: "Cross-Functional Collaboration",
    crisis: "A life sciences company finds that operations, finance, and procurement teams work with different data and disconnected workflows, delaying decisions during supply disruptions. What is the best solution?",
    options: [
      { letter: 'A', pts: 25,  text: "Use email and messaging tools to escalate urgent decisions faster across functions." },
      { letter: 'B', pts: 75,  text: "Hold a daily cross-functional standup to align operations, finance, and procurement on priorities." },
      { letter: 'C', pts: 100, text: "Appoint a cross-functional integration team responsible for aligning data and coordinating decisions across departments." },
      { letter: 'D', pts: 50,  text: "Implement a shared master data policy so all teams agree on common definitions and reporting formats." }
    ],
    sapReveal: {
      taxTitle: "⚠ Traditional Trade-off — The Hidden Execution Cost",
      taxBody: "A coordination team can't fix a systems problem. As long as operations, finance, and procurement run on separate data sources, every cross-functional decision requires manual effort — and during a disruption, that delay has real business consequences.",
      solutionTitle: "💡 SAP & NDBS Solution",
      solutionBody: "SAP S/4HANA creates a single data backbone across all three functions so decisions are based on one live source — no manual bridging needed. NDBS implements through GROW with SAP, bringing life sciences process expertise to reduce disruption response time significantly."
    }
  }
];

// ─── Game State ────────────────────────────────────────────────────────────────
let gameState = {
  currentRound: 1,         // 1 to 6
  phase: 'IDLE',           // IDLE | VOTING | GRAPH_REVEAL | SCORE_REVEAL | SAP_REVEAL | LEADERBOARD
  votes: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  voterIds: new Set(),     // track who already voted
  timerStart: null,        // server timestamp when voting began
  timerDuration: 120,      // seconds (2 minutes)
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
  if (gameState.currentRound >= 6) {
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
  const opts = ['A', 'B', 'C', 'D'];
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
  if (!['A','B','C','D'].includes(option)) return res.status(400).json({ error: 'Bad option' });
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
