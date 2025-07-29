// Simple Express server
const express = require('express');
const app = express();
const PORUT = process.env.PORUT || 3000;

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORUT, () => {
  console.log(`Server listening on port ${PORUT}`);
});
