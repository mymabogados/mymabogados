const fs = require('fs');
let c = fs.readFileSync('src/App.jsx','utf8');

// Fix ClientView - 4 closes -> 3
const old1 = '      {showReq&&<RequestModal client={client} onClose={()=>setShowReq(false)} onSubmit={submitRequest}/>}\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}\n\nfunction UsersTab(';
const new1 = '      {showReq&&<RequestModal client={client} onClose={()=>setShowReq(false)} onSubmit={submitRequest}/>}\n          </div>\n        </div>\n      </div>\n  );\n}\n\nfunction UsersTab(';

if(c.includes(old1)) { c=c.replace(old1,new1); console.log('CV fixed'); }
else console.log('CV not found - checking context...');

fs.writeFileSync('src/App.jsx',c);
console.log('Done');
