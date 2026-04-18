const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx','utf8').split('\n');
for(let i=3150; i<=3180; i++) {
  console.log((i+1)+': '+lines[i]);
}
