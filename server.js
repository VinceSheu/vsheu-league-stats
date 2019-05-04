const express = require('express');
const path = require('path');

const app = express();


app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/matchHistory', (req, res) => {

  const testArray = Array.from(Array(5).keys()).map(i =>i);

  res.json(testArray);

});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`listening on ${port}`);