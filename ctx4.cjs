const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx','utf8').split('\n');
for(let i=3468; i<=3498; i++) {
  console.log((i+1)+': '+lines[i]);
}
