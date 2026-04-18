const fs = require('fs');
let c = fs.readFileSync('src/App.jsx','utf8');
const old = '      </>}\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  </div>\n  </div>\n  );\n}\n\nfunction Login({onLogin}){';
const nw = '      </>}\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  );\n}\n\nfunction Login({onLogin}){';
if(c.includes(old)){ c=c.replace(old,nw); console.log('fixed'); }
else console.log('not found');
fs.writeFileSync('src/App.jsx',c);
