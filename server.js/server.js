const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('test test kali');
});

app.listen(process.env.PORT||3000);
