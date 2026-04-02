const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple GET endpoint
app.get('/', (req, res) => {
  res.send('Hello from the Node.js API!');
});

// Example POST endpoint
app.post('/data', (req, res) => {
  const receivedData = req.body;
  console.log('Received data:', receivedData);
  res.json({ message: 'Data received successfully!', data: receivedData });
});

// Start the server
app.listen(port, () => {
  console.log(`Node.js API server listening at http://localhost:${port}`);
});
