const fs = require('fs');
let c = fs.readFileSync('src/App.jsx','utf8');

// Remove the extra closes - need exactly 4 after content div
const old1 = '      </>}\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  </div>\n  </div>\n  );\n}\n\nfunction Login({onLogin}){';
const new1 = '      </>}\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}\n\nfunction Login({onLogin}){';

if(c.includes(old1)) { c=c.replace(old1,new1); console.log('AV fixed'); }
else {
  const idx = c.indexOf('function Login({onLogin}){');
  console.log('Not found. Context:');
  console.log(JSON.stringify(c.slice(idx-200,idx)));
}

fs.writeFileSync('src/App.jsx',c);
console.log('Done');
