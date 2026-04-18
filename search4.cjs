const {buildSync} = require('./node_modules/esbuild');
const lines = require('fs').readFileSync('src/App.jsx','utf8').split('\n');

let lo=26, hi=80;
while(lo<hi) {
  const mid=Math.floor((lo+hi)/2);
  const src=lines.slice(0,mid).join('\n')+'\nconst X=1;export default function App(){return null;}';
  try { 
    buildSync({stdin:{contents:src,loader:'jsx'},write:false,logLevel:'silent'}); 
    lo=mid+1; 
  } catch(e) { 
    hi=mid; 
  }
}
console.log('First error at line '+lo+':');
console.log(JSON.stringify(lines[lo-1]));
