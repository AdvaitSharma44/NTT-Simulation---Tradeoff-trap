const http = require('http');
const WebSocket = require('ws');

const voterA = 'test_voter_A_' + Math.random().toString(36).slice(2, 8);
const voterB = 'test_voter_B_' + Math.random().toString(36).slice(2, 8);

function makePost(path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

function makeGet(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    }).on('error', reject);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('🧪 Starting Table Locking Automated Test Suite...');

  // Reset the server first to clean slate
  console.log('Resetting game state...');
  await makePost('/api/reset', {});

  // 1. Establish Voter A WebSocket Connection
  console.log('Voter A connecting WebSocket...');
  const wsA = new WebSocket('ws://localhost:3000');
  let stateA = null;

  wsA.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.type === 'STATE_UPDATE') {
      stateA = msg.state;
    }
  });

  await new Promise(resolve => wsA.on('open', resolve));
  wsA.send(JSON.stringify({ type: 'REGISTER', voterId: voterA }));
  await delay(100); // Wait for registration to process

  // 2. Voter A selects Table 1
  console.log('Voter A selecting Table 1...');
  const res1 = await makePost('/api/select-table', { voterId: voterA, tableId: '1' });
  if (res1.status !== 200 || !res1.body.ok) {
    throw new Error('Voter A failed to select Table 1: ' + JSON.stringify(res1));
  }
  console.log('✅ Voter A successfully selected Table 1');

  // Verify server state
  const stateRes1 = await makeGet('/api/state');
  if (stateRes1.body.tableAssignments['1'] !== voterA) {
    throw new Error('Table 1 is not assigned to Voter A in server state!');
  }
  console.log('✅ Server state updated with Table 1 assignment');

  // 3. Voter B tries to select Table 1 (should fail)
  console.log('Voter B trying to select occupied Table 1...');
  const res2 = await makePost('/api/select-table', { voterId: voterB, tableId: '1' });
  if (res2.status !== 409) {
    throw new Error('Voter B select Table 1 did not return 409 conflict: ' + JSON.stringify(res2));
  }
  console.log('✅ Server correctly rejected double-occupancy with 409 Conflict');

  // 4. Voter B selects Table 2 (should succeed)
  console.log('Voter B selecting free Table 2...');
  const res3 = await makePost('/api/select-table', { voterId: voterB, tableId: '2' });
  if (res3.status !== 200 || !res3.body.ok) {
    throw new Error('Voter B failed to select Table 2: ' + JSON.stringify(res3));
  }
  console.log('✅ Voter B successfully selected Table 2');

  // 5. Voter A manually deselects Table 1
  console.log('Voter A manually deselecting Table 1...');
  const res4 = await makePost('/api/deselect-table', { voterId: voterA });
  if (res4.status !== 200 || !res4.body.ok) {
    throw new Error('Voter A failed to deselect: ' + JSON.stringify(res4));
  }
  
  const stateRes2 = await makeGet('/api/state');
  if (stateRes2.body.tableAssignments['1']) {
    throw new Error('Table 1 is still occupied after manual deselect!');
  }
  console.log('✅ Table 1 successfully released after manual deselect');

  // 6. Voter B WebSocket Connection & register
  console.log('Voter B connecting WebSocket...');
  const wsB = new WebSocket('ws://localhost:3000');
  await new Promise(resolve => wsB.on('open', resolve));
  wsB.send(JSON.stringify({ type: 'REGISTER', voterId: voterB }));
  await delay(100);

  // 7. Verify disconnect auto-release: Voter B disconnects, Table 2 must be released
  console.log('Voter B disconnecting (closing WebSocket)...');
  wsB.close();
  await delay(200); // Wait for socket close event handling

  const stateRes3 = await makeGet('/api/state');
  if (stateRes3.body.tableAssignments['2']) {
    throw new Error('Table 2 is still occupied after Voter B disconnected!');
  }
  console.log('✅ Table 2 automatically released upon WebSocket connection close');

  // Clean up Voter A connection
  wsA.close();

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Table selection locking logic is perfectly correct. 🎉');
}

runTests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:');
  console.error(err);
  process.exit(1);
});
