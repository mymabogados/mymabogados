const fs = require('fs');
let c = fs.readFileSync('src/App.jsx','utf8');
const old = '      </div>\n      </div>\n    </div>\n    </div>\n  );\n}\n\nexport default';
const nw = '      </div>\n      </div>\n    </div>\n  );\n}\n\nexport default';
if(c.includes(old)){ c=c.replace(old,nw); console.log('fixed'); }
else console.log('not found');
fs.writeFileSync('src/App.jsx',c);
