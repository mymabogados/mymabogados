const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx','utf8').split('\n');
for(let i=3465; i<=3495; i++) {
  console.log((i+1)+': '+lines[i]);
}
