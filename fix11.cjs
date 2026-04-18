const fs = require('fs');
let c = fs.readFileSync('src/App.jsx','utf8');
const old = 'import { useState, useEffect, useRef } from "react";';
const nw = 'import React, { useState, useEffect, useRef } from "react";';
c = c.replace(old, nw);
fs.writeFileSync('src/App.jsx',c);
console.log('Done');
