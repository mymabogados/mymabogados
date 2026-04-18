const fs = require('fs');
const c = fs.readFileSync('src/App.jsx','utf8');

const start = c.indexOf('function AdminView({onLogout,admin})');
const end = c.indexOf('function Login({onLogin}){');
const body = c.slice(start, end);
const ri = body.indexOf('  return(\n');
const ret = body.slice(ri);

// Find opening div styles to understand structure
const divMatches = ret.match(/<div style=\{\{[^}]{0,80}/g) || [];
console.log('First 15 div opens:');
divMatches.slice(0,15).forEach((m,i) => console.log(i+': '+m.slice(0,80)));

console.log('\nOpens='+( ret.match(/<div/g)||[]).length);
console.log('Closes='+(ret.match(/<\/div>/g)||[]).length);

// Show closing lines
const lines = ret.split('\n');
const lastLines = lines.slice(-15);
console.log('\nLast 15 lines of return:');
lastLines.forEach((l,i) => console.log(lines.length-15+i+': '+l));
