const {buildSync} = require('./node_modules/esbuild');
const lines = require('fs').readFileSync('src/App.jsx','utf8').split('\n');
let lo=1, hi=lines.length;
while(lo<hi) {
  const mid=Math.floor((lo+hi)/2);
  const src=lines.slice(0,mid).join('\n')+'function X(){}';
  try { buildSync({stdin:{contents:src,loader:'jsx'},write:false,logLevel:'silent'}); lo=mid+1; }
  catch(e) { hi=mid; }
}
console.log('Line '+lo+': '+lines[lo-1].slice(0,100));
