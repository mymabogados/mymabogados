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
    const nb = enc.encode(f.name);
    const crc = crc32(f.data);
    const sz = f.data.length;
    const local = new Uint8Array([0x50,0x4b,0x03,0x04,0x14,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,...uint32LE(crc),...uint32LE(sz),...uint32LE(sz),...uint16LE(nb.length),0x00,0x00,...nb,...f.data]);
    locals.push(local);
    const central = new Uint8Array([0x50,0x4b,0x01,0x02,0x14,0x00,0x14,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,...uint32LE(crc),...uint32LE(sz),...uint32LE(sz),...uint16LE(nb.length),0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,...uint32LE(offset),...nb]);
    centrals.push(central);
    offset += local.length;
  }
  const cdSize = centrals.reduce((a,b)=>a+b.length,0);
  const eocd = new Uint8Array([0x50,0x4b,0x05,0x06,0x00,0x00,0x00,0x00,...uint16LE(files.length),...uint16LE(files.length),...uint32LE(cdSize),...uint32LE(offset),0x00,0x00]);
  const total = offset + cdSize + eocd.length;
  const out = new Uint8Array(total);
  let pos = 0;
  for(const l of locals){out.set(l,pos);pos+=l.length;}
  for(const c of centrals){out.set(c,pos);pos+=c.length;}
  out.set(eocd,pos);
  return out;
}

function xmlEsc(s: string) { return (s||"").replace(/&/g,"&").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

function para(text: string, bold=false, size=24, color="000000", italic=false): string {
  const b = bold ? "<w:b/><w:bCs/>" : "";
  const i = italic ? "<w:i/><w:iCs/>" : "";
  return `<w:p><w:r><w:rPr>${b}${i}<w:sz w:val="${size}"/><w:color w:val="${color}"/></w:rPr><w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r></w:p>`;
}

function heading(text: string, level=1): string {
  const size = level===1?32:level===2?28:24;
  const color = level===1?"1E2B1A":"4A5C45";
  return `<w:p><w:pPr><w:pStyle w:val="Heading${level}"/><w:spacing w:before="${level===1?400:280}" w:after="${level===1?200:140}"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="${size}"/><w:color w:val="${color}"/></w:rPr><w:t>${xmlEsc(text)}</w:t></w:r></w:p>`;
}

function tableRow(cells: string[], header=false): string {
  const cellXml = cells.map(c=>`<w:tc><w:tcPr><w:tcBorders><w:top w:val="single" w:sz="4" w:color="DDE4D8"/><w:bottom w:val="single" w:sz="4" w:color="DDE4D8"/><w:left w:val="single" w:sz="4" w:color="DDE4D8"/><w:right w:val="single" w:sz="4" w:color="DDE4D8"/></w:tcBorders>${header?'<w:shd w:val="clear" w:color="auto" w:fill="1E2B1A"/>':''}</w:tcPr><w:p><w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr><w:r><w:rPr>${header?"<w:b/><w:color w:val='F0F4EE'/>":"<w:color w:val='333333'/>"}</w:rPr><w:t xml:space="preserve">${xmlEsc(c)}</w:t></w:r></w:p></w:tc>`).join("");
  return `<w:tr>${cellXml}</w:tr>`;
}

function pageBreak(): string {
  return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
}

async function generarTextos(datos: any, cliente: string): Promise<any> {
  if (!ANTHROPIC_KEY) return {};
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `Eres un abogado corporativo mexicano senior. Con base en estos datos de auditoría legal de ${cliente}, genera el texto jurídico completo y formal para cada sección del reporte. Usa lenguaje jurídico mexicano preciso. Datos: ${JSON.stringify(datos)}. Responde SOLO con JSON con estos campos: introduccion, texto_constitucion, texto_asambleas, texto_variaciones, texto_poderes, texto_estructura_actual, texto_observaciones, texto_recomendaciones.`
      }]
    }),
  });
  const d = await r.json();
  const text = d.content?.[0]?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g,"").trim()); }
  catch { return {}; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { cliente, fecha, datos, generar_textos } = await req.json();

    const d = datos || {};
    const empresa = d.empresa || {};
    const constitucion = d.constitucion || {};
    const asambleas = d.asambleas || [];
    const variaciones = d.variaciones_capital || [];
    const poderes = d.poderes || [];
    const estructura = d.estructura_actual || {};

    // Generar textos con Claude si se solicita
    const t = generar_textos ? await generarTextos(datos, cliente) : {};

    const enc = new TextEncoder();
    let body = "";

    // Portada
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="1440" w:after="0"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="1E2B1A"/></w:rPr><w:t>${xmlEsc(empresa.nombre||cliente)}</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="200" w:after="200"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="4A5C45"/></w:rPr><w:t>Auditoría Legal</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="200"/></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:color w:val="7A9070"/></w:rPr><w:t>${xmlEsc(fecha||"")}</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:color w:val="C9A84C"/></w:rPr><w:t>Millán & Martínez Abogados</w:t></w:r></w:p>`;
    body += pageBreak();

    // Índice
    body += heading("Índice", 1);
    ["i) Abreviaturas","ii) Constitución","iii) Asambleas de Accionistas","iv) Variaciones de Capital","v) Poderes y facultades","vi) Estructura accionaria y gobierno corporativo actual","vii) Comentarios Generales y Recomendaciones"].forEach(s=>{
      body += `<w:p><w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>${s}</w:t></w:r></w:p>`;
    });
    body += pageBreak();

    // Introducción
    body += heading("Introducción", 1);
    body += para(t.introduccion || `El presente Reporte de Auditoría Legal de la sociedad ${empresa.nombre||cliente} ("${empresa.abreviatura||"la Sociedad"}") presenta un panorama general del estado corporativo que actualmente guarda la Sociedad. El reporte se elaboró tomando en consideración la información proporcionada a Millán & Martínez Abogados, por lo que en caso de existir información adicional, será necesario emitir un reporte en alcance al presente.`, false, 22);
    body += `<w:p/>`;

    // Abreviaturas
    body += heading("i) Abreviaturas", 2);
    if ((d.abreviaturas||[]).length > 0) {
      body += `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders><w:insideH w:val="single" w:sz="4" w:color="DDE4D8"/><w:insideV w:val="single" w:sz="4" w:color="DDE4D8"/></w:tblBorders></w:tblPr>`;
      body += tableRow(["Abreviatura","Significado"], true);
      (d.abreviaturas||[]).forEach((a:any)=>{ body += tableRow([a.abreviatura||"",a.significado||""]); });
      body += `</w:tbl>`;
    } else {
      body += para(`${empresa.abreviatura||"La Sociedad"} — ${empresa.nombre||cliente}`, false, 22);
    }
    body += `<w:p/>`;

    // Constitución
    body += heading("ii) Constitución", 2);
    body += para(t.texto_constitucion || `Escritura número ${constitucion.escritura_num||"[número]"} de fecha ${constitucion.fecha||"[fecha]"}, otorgada ante la fe del ${constitucion.notario||"[notario]"}, Notario Público número ${constitucion.num_notario||"[número]"} de ${constitucion.ciudad||"[ciudad]"}, inscrito en el RPPC en el FM ${constitucion.folio_mercantil||"[folio]"}.`, false, 22);
    body += `<w:p/>`;
    body += `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/></w:tblPr>`;
    [
      ["Denominación:", empresa.nombre||cliente],
      ["Domicilio Social:", empresa.domicilio||""],
      ["Duración:", empresa.duracion||""],
      ["Objeto:", empresa.objeto||""],
      ["Capital social original:", empresa.capital_original||""],
      ["Series de Acciones:", empresa.series_acciones||""],
      ["Administrador original:", constitucion.administrador_original||""],
      ["Comisario:", constitucion.comisario_original||""],
    ].filter(([_,v])=>v).forEach(([k,v])=>{ body += tableRow([k as string, v as string]); });
    body += `</w:tbl>`;
    body += `<w:p/>`;

    // Asambleas
    body += heading("iii) Asambleas de Accionistas", 2);
    if (asambleas.length > 0) {
      asambleas.forEach((a:any, idx:number)=>{
        body += `<w:p><w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr><w:r><w:rPr><w:b/><w:i/><w:sz w:val="22"/></w:rPr><w:t>${xmlEsc((a.tipo||"Asamblea")+" "+(a.fecha||"")+(a.descripcion?". "+a.descripcion:""))}</w:t></w:r></w:p>`;
        if (a.acuerdos) body += para(a.acuerdos, false, 22);
        if (a.observacion) {
          body += `<w:p><w:pPr><w:spacing w:before="80" w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="C0392B"/></w:rPr><w:t xml:space="preserve">Observación: </w:t></w:r><w:r><w:rPr><w:sz w:val="22"/><w:color w:val="C0392B"/></w:rPr><w:t>${xmlEsc(a.observacion)}</w:t></w:r></w:p>`;
        }
        if (a.recomendacion) {
          body += `<w:p><w:pPr><w:spacing w:before="40" w:after="80"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="185FA5"/></w:rPr><w:t xml:space="preserve">Recomendación: </w:t></w:r><w:r><w:rPr><w:sz w:val="22"/><w:color w:val="185FA5"/></w:rPr><w:t>${xmlEsc(a.recomendacion)}</w:t></w:r></w:p>`;
        }
      });
    } else {
      body += para(t.texto_asambleas || "Se adjunta el detalle de las asambleas de accionistas celebradas.", false, 22);
    }
    body += `<w:p/>`;

    // Variaciones de Capital
    body += heading("iv) Variaciones de Capital", 2);
    if (variaciones.length > 0) {
      variaciones.forEach((v:any)=>{
        body += para(`${v.fecha||""} — ${v.tipo||"Variación"}: ${v.monto||""} ${v.descripcion||""}`, false, 22);
      });
    } else {
      body += para(t.texto_variaciones || "No se detectaron variaciones de capital en el periodo revisado.", false, 22);
    }
    body += `<w:p/>`;

    // Poderes
    body += heading("v) Poderes y facultades", 2);
    if (poderes.length > 0) {
      poderes.forEach((p:any)=>{
        body += `<w:p><w:pPr><w:spacing w:before="120" w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>${xmlEsc((p.titular||"[titular]")+" — "+(p.tipo||"Poder")+(p.fecha?" ("+p.fecha+")":""))}</w:t></w:r></w:p>`;
        if (p.facultades) body += para(p.facultades, false, 22);
      });
    } else {
      body += para(t.texto_poderes || "Se adjunta el detalle de los poderes otorgados.", false, 22);
    }
    body += `<w:p/>`;

    // Estructura actual
    body += heading("vi) Estructura accionaria y gobierno corporativo actual", 2);
    body += para(t.texto_estructura_actual || `Órgano de administración: ${estructura.organo_administracion||""}. Administrador: ${estructura.administrador||""}. Comisario: ${estructura.comisario||""}.`, false, 22);
    if ((estructura.accionistas||[]).length > 0) {
      body += `<w:p/>`;
      body += `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/></w:tblPr>`;
      body += tableRow(["Accionista","Acciones","Valor"], true);
      estructura.accionistas.forEach((a:any)=>{ body += tableRow([a.nombre||"",String(a.acciones||""),String(a.valor||"")]); });
      body += `</w:tbl>`;
    }
    body += `<w:p/>`;

    // Observaciones y recomendaciones
    body += heading("vii) Comentarios Generales y Recomendaciones", 2);
    if (t.texto_observaciones || d.observaciones_generales) {
      body += para("Observaciones:", true, 22);
      body += para(t.texto_observaciones || d.observaciones_generales, false, 22);
      body += `<w:p/>`;
    }
    if (t.texto_recomendaciones || d.recomendaciones) {
      body += para("Recomendaciones:", true, 22);
      body += para(t.texto_recomendaciones || d.recomendaciones, false, 22);
    }
    body += pageBreak();
    body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="4A5C45"/></w:rPr><w:t>Millán & Martínez Abogados</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="7A9070"/></w:rPr><w:t>panel.mymabogados.mx</w:t></w:r></w:p>`;

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="1E2B1A"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:pPr><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="4A5C45"/></w:rPr></w:style></w:styles>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

    const files = [
      {name:"[Content_Types].xml",data:enc.encode(contentTypesXml)},
      {name:"_rels/.rels",data:enc.encode(rootRelsXml)},
      {name:"word/document.xml",data:enc.encode(documentXml)},
      {name:"word/styles.xml",data:enc.encode(stylesXml)},
      {name:"word/_rels/document.xml.rels",data:enc.encode(relsXml)},
    ];

    const docx = buildZip(files);
    const nombre = (empresa.nombre||cliente||"cliente").replace(/[^a-zA-Z0-9_\s]/g,"_").replace(/\s+/g,"_").slice(0,40);

    return new Response(docx, {
      headers: {
        ...CORS,
        "Content-Type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":`attachment; filename="Auditoria_Legal_${nombre}.docx"`,
      }
    });
  } catch(err){
    return new Response(JSON.stringify({error:(err as Error).message}),{status:500,headers:CORS});
  }
});
