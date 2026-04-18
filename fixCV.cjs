const fs = require('fs');
let c = fs.readFileSync('src/App.jsx','utf8');
const old = '      {showReq&&<RequestModal client={client} onClose={()=>setShowReq(false)} onSubmit={submitRequest}/>}\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}\n\n\nfunction AdminModulosTab(';
const nw = '      {showReq&&<RequestModal client={client} onClose={()=>setShowReq(false)} onSubmit={submitRequest}/>}\n          </div>\n        </div>\n      </div>\n  );\n}\n\n\nfunction AdminModulosTab(';
if(c.includes(old)){ c=c.replace(old,nw); console.log('fixed'); }
else console.log('not found');
fs.writeFileSync('src/App.jsx',c);
