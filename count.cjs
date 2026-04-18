const fs = require('fs');
const c = fs.readFileSync('src/App.jsx','utf8');

const start = c.indexOf('function AdminView({onLogout,admin})');
const end = c.indexOf('function Login({onLogin}){');
const body = c.slice(start, end);
const ri = body.indexOf('  return(\n');
const ret = body.slice(ri);

const opens = (ret.match(/<div/g)||[]).length;
const closes = (ret.match(/<\/div>/g)||[]).length;
console.log('AdminView: opens='+opens+' closes='+closes+' diff='+(opens-closes));

// Show last 10 lines
const lines = body.split('\n');
console.log('\nLast 10 lines:');
lines.slice(-12).forEach((l,i) => console.log(lines.length-12+i+': '+l));
