const {buildSync} = require('./node_modules/esbuild');
const lines = require('fs').readFileSync('src/App.jsx','utf8').split('\n');

let lo=1, hi=3167;
while(lo<hi) {
  const mid=Math.floor((lo+hi)/2);
  // Complete the file so truncation doesn't cause false positives
  const src=lines.slice(0,mid).join('\n')+'\nfunction X(){return null;}export default X;';
  try { 
    buildSync({stdin:{contents:src,loader:'jsx'},write:false,logLevel:'silent'}); 
    lo=mid+1; 
  } catch(e) { 
    hi=mid; 
  }
}
console.log('First error at line '+lo+':');
console.log(lines[lo-1]);
