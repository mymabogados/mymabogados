import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";

function uint16LE(n: number) { return new Uint8Array([n&0xff,(n>>8)&0xff]); }
function uint32LE(n: number) { return new Uint8Array([n&0xff,(n>>8)&0xff,(n>>16)&0xff,(n>>24)&0xff]); }
function crc32(buf: Uint8Array): number {
  const t = new Uint32Array(256);
  for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[i]=c;}
  let crc=0xffffffff;
  for(const b of buf)crc=t[(crc^b)&0xff]^(crc>>>8);
  return (crc^0xffffffff)>>>0;
}
function buildZip(files:{name:string;data:Uint8Array}[]): Uint8Array {
  const enc = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for(const f of files){
    const nb=enc.encode(f.name); const crc=crc32(f.data); const sz=f.data.length;
    const local=new Uint8Array([0x50,0x4b,0x03,0x04,0x14,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,...uint32LE(crc),...uint32LE(sz),...uint32LE(sz),...uint16LE(nb.length),0x00,0x00,...nb,...f.data]);
    locals.push(local);
    const central=new Uint8Array([0x50,0x4b,0x01,0x02,0x14,0x00,0x14,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,...uint32LE(crc),...uint32LE(sz),...uint32LE(sz),...uint16LE(nb.length),0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,...uint32LE(offset),...nb]);
    centrals.push(central); offset+=local.length;
  }
  const cdSize=centrals.reduce((a,b)=>a+b.length,0);
  const eocd=new Uint8Array([0x50,0x4b,0x05,0x06,0x00,0x00,0x00,0x00,...uint16LE(files.length),...uint16LE(files.length),...uint32LE(cdSize),...uint32LE(offset),0x00,0x00]);
  const total=offset+cdSize+eocd.length;
  const out=new Uint8Array(total); let pos=0;
  for(const l of locals){out.set(l,pos);pos+=l.length;}
  for(const c of centrals){out.set(c,pos);pos+=c.length;}
  out.set(eocd,pos); return out;
}

function x(s: string): string {
  return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function p(text: string, opts: {bold?:boolean,italic?:boolean,size?:number,color?:string,indent?:number,before?:number,after?:number} = {}): string {
  const {bold=false,italic=false,size=22,color="000000",indent=0,before=80,after=80} = opts;
  const b=bold?"<w:b/><w:bCs/>":""; const i=italic?"<w:i/><w:iCs/>":"";
  const ind=indent?`<w:ind w:left="${indent}"/>`:"";
  return `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}"/>${ind}</w:pPr><w:r><w:rPr>${b}${i}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/><w:color w:val="${color}"/></w:rPr><w:t xml:space="preserve">${x(text)}</w:t></w:r></w:p>`;
}

function h1(text: string): string {
  return `<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:before="400" w:after="200"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E2B1A"/></w:rPr><w:t>${x(text)}</w:t></w:r></w:p>`;
}

function h2(text: string): string {
  return `<w:p><w:pPr><w:pStyle w:val="Heading2"/><w:spacing w:before="300" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:i/><w:sz w:val="24"/><w:color w:val="1E2B1A"/></w:rPr><w:t>${x(text)}</w:t></w:r></w:p>`;
}

function asamblea_titulo(tipo: string, fecha: string, titulo: string, registro: string, prot: string): string {
  const full = `${tipo} ${fecha}. ${titulo}. ${registro}. ${prot}.`;
  return `<w:p><w:pPr><w:spacing w:before="200" w:after="80"/></w:pPr><w:r><w:rPr><w:b/><w:i/><w:sz w:val="22"/></w:rPr><w:t>${x(full)}</w:t></w:r></w:p>`;
}

function tabla_capital(rows: any[], cols: string[]): string {
  if(!rows?.length) return "";
  const colW = Math.floor(9000/cols.length);
  const border = `<w:top w:val="single" w:sz="4" w:color="AAAAAA"/><w:bottom w:val="single" w:sz="4" w:color="AAAAAA"/><w:left w:val="single" w:sz="4" w:color="AAAAAA"/><w:right w:val="single" w:sz="4" w:color="AAAAAA"/>`;
  
  let t = `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>${border}</w:tblBorders></w:tblPr><w:tblGrid>${cols.map(()=>`<w:gridCol w:w="${colW}"/>`).join("")}</w:tblGrid>`;
  
  // Header
  t += `<w:tr><w:trPr><w:trHeight w:val="400"/></w:trPr>`;
  const headers: Record<string,string> = {accionista:"ACCIONISTA",fijo:"CAPITAL FIJO",variable:"CAPITAL VARIABLE",total:"TOTAL",acciones:"ACCIONES",valor:"VALOR ($)",nombre:"NOMBRE",cargo:"CARGO"};
  cols.forEach(col=>{
    t += `<w:tc><w:tcPr><w:tcW w:w="${colW}" w:type="dxa"/><w:shd w:val="clear" w:fill="1E2B1A"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="F0F4EE"/></w:rPr><w:t>${x(headers[col]||col.toUpperCase())}</w:t></w:r></w:p></w:tc>`;
  });
  t += `</w:tr>`;
  
  // Rows
  rows.forEach(row=>{
    const isTotal = (row.accionista||row.nombre||"").toUpperCase().includes("TOTAL");
    t += `<w:tr>`;
    cols.forEach(col=>{
      const val = String(row[col]||"");
      t += `<w:tc><w:tcPr><w:tcW w:w="${colW}" w:type="dxa"/>${isTotal?'<w:shd w:val="clear" w:fill="E8F0E8"/>':""}<w:p><w:pPr><w:jc w:val="${col==="accionista"||col==="nombre"||col==="cargo"?"left":"center"}"/></w:pPr><w:r><w:rPr>${isTotal?"<w:b/>":""}<w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${x(val)}</w:t></w:r></w:p></w:tc>`;
    });
    t += `</w:tr>`;
  });
  t += `</w:tbl><w:p><w:pPr><w:spacing w:before="80" w:after="80"/></w:pPr></w:p>`;
  return t;
}

function obs_rec(items: string[], tipo: "Observación"|"Recomendación", startNum: number): string {
  let out = "";
  items.forEach((txt, i)=>{
    const color = tipo==="Observación" ? "C0392B" : "185FA5";
    out += `<w:p><w:pPr><w:spacing w:before="80" w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:i/><w:sz w:val="22"/><w:color w:val="${color}"/></w:rPr><w:t xml:space="preserve">${tipo}: </w:t></w:r><w:r><w:rPr><w:i/><w:sz w:val="22"/><w:color w:val="${color}"/></w:rPr><w:t xml:space="preserve">(${startNum+i}) ${x(txt)}</w:t></w:r></w:p>`;
  });
  return out;
}

function pageBreak(): string {
  return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { cliente, fecha, datos } = await req.json();
    const d = datos || {};
    const emp = d.empresa || {};
    const con = d.constitucion || {};
    const enc = new TextEncoder();
    let body = "";

    // ── PORTADA ──
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="1440" w:after="0"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>${x(emp.nombre||cliente)}</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="200" w:after="200"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="4A5C45"/></w:rPr><w:t>Auditoría Legal</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:color w:val="7A9070"/></w:rPr><w:t>${x(fecha||"")}</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:color w:val="C9A84C"/></w:rPr><w:t>Millán &amp; Martínez Abogados</w:t></w:r></w:p>`;
    body += pageBreak();

    // ── ÍNDICE ──
    body += h1("Índice");
    const secciones = [
      ["","Introducción"],["i)","Abreviaturas"],["ii)","Constitución"],
      ["iii)","Asambleas de Accionistas"],["iv)","Variaciones de Capital"],
      ["v)","Sesiones del Consejo de Administración"],["vi)","Transmisión de Acciones"],
      ["vii)","Poderes y facultades"],["viii)","Estructura accionaria y gobierno corporativo actual"],
      ["ix)","Comentarios Generales y Recomendaciones"],
    ];
    body += `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="DDE4D8"/><w:bottom w:val="single" w:sz="4" w:color="DDE4D8"/><w:left w:val="single" w:sz="4" w:color="DDE4D8"/><w:right w:val="single" w:sz="4" w:color="DDE4D8"/><w:insideH w:val="single" w:sz="4" w:color="DDE4D8"/><w:insideV w:val="single" w:sz="4" w:color="DDE4D8"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="1000"/><w:gridCol w:w="6500"/><w:gridCol w:w="1500"/></w:tblGrid>`;
    secciones.forEach(([num,titulo])=>{
      body += `<w:tr><w:tc><w:tcPr><w:tcW w:w="1000" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${x(num)}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="6500" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>${x(titulo)}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t></w:t></w:r></w:p></w:tc></w:tr>`;
    });
    body += `</w:tbl>`;
    body += pageBreak();

    // ── INTRODUCCIÓN ──
    body += `<w:p><w:pPr><w:spacing w:before="200" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:i/><w:sz w:val="24"/></w:rPr><w:t>Introducción</w:t></w:r></w:p>`;
    const abrev = emp.abreviatura || (emp.nombre||cliente).split(" ").map((w:string)=>w[0]).join("").toUpperCase();
    body += p(`El presente Reporte de Auditoría Legal de la sociedad ${emp.nombre||cliente}, ("${abrev}" o la Sociedad) presenta un panorama general del estado corporativo que actualmente guarda ${abrev}, considerando como punto de partida su constitución y la última asamblea de accionistas celebrada.`);
    body += p(`El reporte se elaboró tomando en consideración la información proporcionada a Millán & Martínez Abogados, por lo que en caso de existir información adicional, será necesario emitir un reporte en alcance al presente.`);
    body += p(`El objetivo del presente reporte es detectar y señalar las posibles deficiencias jurídicas de la documentación corporativa de ${abrev} y sugerir la forma de corregir las mismas. Asimismo, señalar la información que pudiera faltar para que ${abrev} esté corporativamente actualizada, así como en su caso, presentar una propuesta para modernizar a ${abrev} y hacer que opere de una manera eficiente.`);
    body += p(`Para una mejor comprensión del presente documento, se ha dividido en los siguientes apartados: i) Abreviaturas; ii) Constitución; iii) Asambleas de Accionistas; iv) Variaciones de Capital; v) Sesiones del Consejo de Administración; vi) Transmisión de Acciones; vii) Poderes y facultades; viii) Estructura accionaria y gobierno corporativo actual; y ix) Comentarios Generales y Recomendaciones.`);

    // ── ABREVIATURAS ──
    body += h2("Abreviaturas");
    if ((d.abreviaturas||[]).length > 0) {
      body += tabla_capital(d.abreviaturas, ["abreviatura","significado"]);
    }

    // ── CONSTITUCIÓN ──
    body += h2("Constitución");
    body += p(`Escritura número ${con.escritura_num||"[número]"} de ${con.fecha||"[fecha]"}, otorgada ante la fe del ${con.notario||"[notario]"}, Notario Público número ${con.num_notario||"[número]"} de ${con.ciudad||"[ciudad]"}, inscrito en el RPPC en el FM ${con.folio_mercantil||"[folio]"} del Distrito Federal.`);
    body += p(``, {after:40});
    const datosConst = [
      {k:"Denominación:", v:emp.nombre||cliente},
      {k:"Domicilio Social:", v:emp.domicilio||""},
      {k:"Duración:", v:emp.duracion||""},
      {k:"Extranjería:", v:emp.extranjeria||""},
      {k:"Objeto:", v:emp.objeto||""},
      {k:"Órgano de Administración original:", v:con.organo_administracion_original||""},
    ].filter(r=>r.v);
    body += `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/></w:tblPr><w:tblGrid><w:gridCol w:w="3000"/><w:gridCol w:w="6000"/></w:tblGrid>`;
    datosConst.forEach(r=>{
      body += `<w:tr><w:tc><w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:i/><w:sz w:val="20"/></w:rPr><w:t>${x(r.k)}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="6000" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:i/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${x(r.v)}</w:t></w:r></w:p></w:tc></w:tr>`;
    });
    body += `</w:tbl>`;
    if ((con.capital_inicial||[]).length > 0) {
      body += p(``, {after:120});
      body += p(`CAPITAL SOCIAL ${abrev}`, {bold:true, size:22});
      body += tabla_capital(con.capital_inicial, ["accionista","acciones","valor"]);
    }

    // ── ASAMBLEAS ──
    body += h2("Asambleas de Accionistas");
    body += p(`La presente sección fue elaborada con base en: (a) las actas originales y en copia firmadas que nos fueron proporcionadas; (b) el Libro de Registro de Asambleas; y (c) las copias certificadas y fotostáticas de diversas actas protocolizadas ante Notario Público.`);
    let obsCounter = 1;
    (d.asambleas||[]).forEach((a:any)=>{
      body += asamblea_titulo(a.tipo||"AGOA", a.fecha||"", a.titulo||"", a.registro||"", a.protocolizacion||"");
      if (a.texto) body += p(a.texto, {size:22});
      if ((a.tabla_capital||[]).length > 0) {
        body += p(`CAPITAL SOCIAL ${abrev}`, {bold:true, size:22, before:120});
        body += tabla_capital(a.tabla_capital, ["accionista","fijo","variable","total"]);
      }
      if ((a.observaciones||[]).length > 0) {
        body += obs_rec(a.observaciones, "Observación", obsCounter);
        obsCounter += a.observaciones.length;
      }
      if ((a.recomendaciones||[]).length > 0) {
        body += obs_rec(a.recomendaciones, "Recomendación", obsCounter);
        obsCounter += a.recomendaciones.length;
      }
    });

    // ── VARIACIONES DE CAPITAL ──
    body += h2("Variaciones de Capital");
    body += p(`El presente apartado hace referencia a las variaciones de capital social en ${abrev}, desde la fecha de su constitución y hasta la última asamblea de la cual tenemos conocimiento.`);
    (d.variaciones_capital||[]).forEach((v:any)=>{
      if (v.descripcion) body += p(v.descripcion, {italic:true, bold:true, size:22, before:160});
      if (v.texto) body += p(v.texto, {size:22});
      if ((v.tabla_capital||[]).length > 0) {
        body += p(`CAPITAL SOCIAL ${abrev}`, {bold:true, size:22, before:100});
        body += tabla_capital(v.tabla_capital, ["accionista","fijo","variable","total"]);
      }
    });

    // ── SESIONES CONSEJO ──
    body += h2("Sesiones del Consejo de Administración");
    if ((d.sesiones_consejo||[]).length > 0) {
      (d.sesiones_consejo||[]).forEach((s:any)=>{
        if (s.fecha) body += p(s.fecha, {bold:true, italic:true, size:22, before:160});
        if (s.descripcion) body += p(s.descripcion, {size:22});
        if ((s.observaciones||[]).length > 0) body += obs_rec(s.observaciones, "Observación", obsCounter);
        if ((s.recomendaciones||[]).length > 0) body += obs_rec(s.recomendaciones, "Recomendación", obsCounter);
      });
    } else {
      body += p(`Conforme a la información y documentación que nos fue proporcionada, no tenemos conocimiento o registro alguno de sesiones del Consejo de Administración de ${abrev}, así como de la existencia del Libro de Registro de Sesiones del Consejo de Administración.`, {size:22});
    }

    // ── TRANSMISIÓN ACCIONES ──
    body += h2("Transmisión de Acciones");
    body += p(`El presente apartado hace referencia a las transmisiones de acciones de ${abrev}.`);
    (d.transmision_acciones||[]).forEach((t:any)=>{
      if (t.descripcion) body += p(t.descripcion, {italic:true, bold:true, size:22, before:160});
      if (t.texto) body += p(t.texto, {size:22});
      if ((t.tabla_capital||[]).length > 0) {
        body += p(`CAPITAL SOCIAL ${abrev}`, {bold:true, size:22, before:100});
        body += tabla_capital(t.tabla_capital, ["accionista","fijo","variable","total"]);
      }
    });

    // ── PODERES ──
    body += h2("Poderes y facultades");
    body += p(`El presente apartado hace referencia a los poderes otorgados por ${abrev}, su Asamblea General de Accionistas, Órgano de Administración y representantes y apoderados con facultades de sustitución y para otorgar poderes y facultades.`);
    (d.poderes||[]).forEach((pod:any)=>{
      const titulo = `${pod.otorgante||""}${pod.escritura?" — Escritura "+pod.escritura:""}${pod.fecha?", "+pod.fecha:""}`;
      if (titulo.trim()) body += p(titulo, {italic:true, bold:true, size:22, before:160});
      if (pod.facultades) body += p(pod.facultades, {size:22});
      if ((pod.observaciones||[]).length > 0) body += obs_rec(pod.observaciones, "Observación", obsCounter);
      if ((pod.recomendaciones||[]).length > 0) body += obs_rec(pod.recomendaciones, "Recomendación", obsCounter);
    });

    // ── ESTRUCTURA ACTUAL ──
    body += h2("Estructura accionaria y gobierno corporativo actual");
    const est = d.estructura_actual || {};
    if (est.fecha_referencia) body += p(`Según la asamblea de fecha ${est.fecha_referencia}, fecha de la última asamblea de la que tenemos conocimiento, la estructura accionaria de ${abrev} se encuentra integrada de la siguiente manera:`, {size:22});
    if ((est.accionistas||[]).length > 0) {
      body += p(`Estructura accionaria:`, {italic:true, size:22, before:160});
      body += p(`CAPITAL SOCIAL ${abrev}`, {bold:true, size:22});
      body += tabla_capital(est.accionistas, ["accionista","fijo","variable","total"]);
    }
    if ((est.consejo||[]).length > 0) {
      body += p(`Gobierno Corporativo:`, {italic:true, size:22, before:160});
      body += p(`ÓRGANO DE ADMINISTRACIÓN ${abrev}`, {bold:true, size:22});
      body += tabla_capital(est.consejo, ["nombre","cargo"]);
    }
    if (est.comisario) {
      body += p(`Comisario`, {bold:true, size:22, before:120});
      body += tabla_capital([{nombre:est.comisario,cargo:"Comisario"}], ["nombre","cargo"]);
    }

    // ── COMENTARIOS GENERALES ──
    body += h2("Comentarios Generales y Recomendaciones");
    const cg = d.comentarios_generales || {};
    if (cg.libros) { body += p(`Libros.`, {bold:true, italic:true, size:22, before:160}); body += p(cg.libros, {size:22}); }
    if (cg.titulos) { body += p(`Títulos.`, {bold:true, italic:true, size:22, before:160}); body += p(cg.titulos, {size:22}); }
    if (cg.asambleas) { body += p(`Asambleas.`, {bold:true, italic:true, size:22, before:160}); body += p(cg.asambleas, {size:22}); }
    if ((cg.recomendaciones||[]).length > 0) {
      body += p(`Recomendaciones`, {bold:true, size:22, before:160});
      (cg.recomendaciones||[]).forEach((r:string)=>{ body += p(`• ${r}`, {size:22, indent:360}); });
    }

    body += pageBreak();
    body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="4A5C45"/></w:rPr><w:t>Millán &amp; Martínez Abogados</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="7A9070"/></w:rPr><w:t>panel.mymabogados.mx</w:t></w:r></w:p>`;

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E2B1A"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:pPr><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:i/><w:sz w:val="24"/><w:color w:val="1E2B1A"/></w:rPr></w:style></w:styles>`;
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

    const files = [
      {name:"[Content_Types].xml",data:enc.encode(contentTypesXml)},
      {name:"_rels/.rels",data:enc.encode(rootRelsXml)},
      {name:"word/document.xml",data:enc.encode(documentXml)},
      {name:"word/styles.xml",data:enc.encode(stylesXml)},
      {name:"word/_rels/document.xml.rels",data:enc.encode(relsXml)},
    ];

    const docx = buildZip(files);
    const nombre = (emp.nombre||cliente||"cliente").replace(/[^a-zA-Z0-9_\s]/g,"_").replace(/\s+/g,"_").slice(0,40);

    return new Response(docx, {
      headers:{...CORS,"Content-Type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","Content-Disposition":`attachment; filename="Auditoria_Legal_${nombre}.docx"`}
    });
  } catch(err){
    return new Response(JSON.stringify({error:(err as Error).message}),{status:500,headers:CORS});
  }
});
