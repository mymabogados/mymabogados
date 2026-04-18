const {buildSync} = require('./node_modules/esbuild');
const lines = require('fs').readFileSync('src/App.jsx','utf8').split('\n');

// Test full file first
try {
  buildSync({stdin:{contents:lines.join('\n'),loader:'jsx'},write:false,logLevel:'silent'});
  console.log('Full file OK');
  process.exit(0);
} catch(e) {
  const msg = e.message;
  const match = msg.match(/:(\d+):\d+:/);
  if(match) console.log('Full file error at line '+match[1]+': '+lines[parseInt(match[1])-1]);
  else console.log('Full file error: '+msg.slice(0,200));
}
