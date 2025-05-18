const express = require('express');
const path    = require('path');
const app     = express();

// serve public/ first
app.use(express.static(path.join(__dirname, 'public')));

// explicit routes…
app.get('/about', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/about.html'))
);
// …etc.

// catch-all
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.listen(process.env.PORT || 3000, () =>
  console.log('Listening on port ' + (process.env.PORT||3000))
);
