const localtunnel = require('localtunnel');

async function start() {
  console.log('Establishing localtunnel connection to port 3000...');
  try {
    const tunnel = await localtunnel({ port: 3000 });
    console.log('your url is: ' + tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed on remote server. Reconnecting in 5 seconds...');
      setTimeout(start, 5000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel encountered error:', err);
      tunnel.close();
    });

  } catch (err) {
    console.error('Failed to establish tunnel:', err);
    console.log('Retrying in 5 seconds...');
    setTimeout(start, 5000);
  }
}

// Keep the process alive indefinitely
setInterval(() => {}, 1000 * 60 * 60);

start();
