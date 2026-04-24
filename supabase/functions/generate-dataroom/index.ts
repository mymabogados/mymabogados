import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function sanitize(s: string) {
  return (s||"").replace(/[^a-zA-Z0-9_\-\.]/g, "_").trim().slice(0, 50);
}

function getFileId(url: string): string | null {
  const m = url.match(/[-\w]{25,}/);
  return m ? m[0] : null;
}

async function fetchDriveFile(fileId: string): Promise<Uint8Array | null> {
  // Intento 1: descarga directa
  const url1 = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
  const r1 = await fetch(url1, { redirect: "follow" });
  if (r1.ok) {
    const ct = r1.headers.get("content-type") || "";
    if (!ct.includes("text/html")) {
      return new Uint8Array(await r1.arrayBuffer());
    }
    // Drive devolvió página de confirmación — extraer cookie y reintentar
    const html = await r1.text();
    const tokenMatch = html.match(/confirm=([0-9A-Za-z_\-]+)/);
    if (tokenMatch) {
      const url2 = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${tokenMatch[1]}`;
      const r2 = await fetch(url2, { redirect: "follow" });
      if (r2.ok && !((r2.headers.get("content-type")||"").includes("text/html"))) {
        return new Uint8Array(await r2.arrayBuffer());
      }
    }
  }
  // Intento 2: thumbnail/export URL
  const url3 = `https://drive.google.com/uc?id=${fileId}&export=download`;
  const r3 = await fetch(url3, { redirect: "follow" });
  if (r3.ok && !((r3.headers.get("content-type")||"").includes("text/html"))) {
    return new Uint8Array(await r3.arrayBuffer());
  }
  return null;
}

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
    const local = new Uint8Array([
      0x50,0x4b,0x03,0x04,0x14,0x00,0x00,0x00,0x00,0x00,
      0x00,0x00,0x00,0x00,
      ...uint32LE(crc),...uint32LE(sz),...uint32LE(sz),
      ...uint16LE(nb.length),0x00,0x00,...nb,...f.data
    ]);
    locals.push(local);
    const central = new Uint8Array([
      0x50,0x4b,0x01,0x02,0x14,0x00,0x14,0x00,0x00,0x00,0x00,0x00,
      0x00,0x00,0x00,0x00,
      ...uint32LE(crc),...uint32LE(sz),...uint32LE(sz),
      ...uint16LE(nb.length),0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
      ...uint32LE(offset),...nb
    ]);
    centrals.push(central);
    offset += local.length;
  }
  const cdSize = centrals.reduce((a,b)=>a+b.length,0);
  const eocd = new Uint8Array([
    0x50,0x4b,0x05,0x06,0x00,0x00,0x00,0x00,
    ...uint16LE(files.length),...uint16LE(files.length),
    ...uint32LE(cdSize),...uint32LE(offset),0x00,0x00
  ]);
  const total = offset + cdSize + eocd.length;
  const out = new Uint8Array(total);
  let pos = 0;
  for(const l of locals){out.set(l,pos);pos+=l.length;}
  for(const c of centrals){out.set(c,pos);pos+=c.length;}
  out.set(eocd,pos);
  return out;
}

serve(async (req) => {
  if(req.method==="OPTIONS") return new Response("ok",{headers:CORS});
  try {
    const {client_id,sociedad_id,modulos} = await req.json();
    if(!client_id) return new Response(JSON.stringify({error:"client_id requerido"}),{status:400,headers:CORS});

    const supabase = createClient(SUPABASE_URL,SUPABASE_SERVICE_KEY);
    const [{data:client},{data:docs},{data:contratos},{data:personas},{data:kyc}] = await Promise.all([
      supabase.from("clients").select("name").eq("id",client_id).single(),
      sociedad_id
        ? supabase.from("documents").select("*").eq("client_id",client_id).eq("sociedad_id",sociedad_id).not("drive_url","is",null)
        : supabase.from("documents").select("*").eq("client_id",client_id).is("sociedad_id",null).not("drive_url","is",null),
      sociedad_id
        ? supabase.from("contratos").select("*").eq("client_id",client_id).eq("sociedad_id",sociedad_id).not("drive_url","is",null)
        : supabase.from("contratos").select("*").eq("client_id",client_id).is("sociedad_id",null).not("drive_url","is",null),
      supabase.from("personas").select("*").eq("client_id",client_id),
      supabase.from("kyc_docs").select("*").eq("client_id",client_id).not("drive_url","is",null),
    ]);

    const clientName = sanitize(client?.name||client_id);
    const filesList:{name:string;data:Uint8Array}[] = [];
    const errors:string[] = [];

    const docsFiltered = modulos?.length ? (docs||[]).filter((d:any)=>modulos.includes(d.modulo)) : (docs||[]);
    const incluirContratos = !modulos?.length || modulos.includes("contratos");
    const incluirKYC = !modulos?.length || modulos.includes("kyc");

    const tasks:Promise<void>[] = [];

    for(const doc of docsFiltered){
      if(!doc.drive_url) continue;
      const mod = sanitize(doc.modulo||"General");
      const nombre = sanitize(doc.name||doc.type||"archivo");
      tasks.push((async()=>{
        const fileId = getFileId(doc.drive_url);
        if(!fileId){errors.push(nombre);return;}
        const data = await fetchDriveFile(fileId);
        if(data) filesList.push({name:`${clientName}/Documentos/${mod}/${nombre}.pdf`,data});
        else errors.push(`${mod}/${nombre}`);
      })());
    }

    if(incluirContratos){
      for(const ctr of contratos||[]){
        if(!ctr.drive_url) continue;
        const tipo = sanitize(ctr.tipo||"Contrato");
        const nombre = sanitize(ctr.nombre||"contrato");
        tasks.push((async()=>{
          const fileId = getFileId(ctr.drive_url);
          if(!fileId){errors.push(nombre);return;}
          const data = await fetchDriveFile(fileId);
          if(data) filesList.push({name:`${clientName}/Contratos/${tipo}/${nombre}.pdf`,data});
          else errors.push(`Contratos/${nombre}`);
        })());
      }
    }

    if(incluirKYC){
      for(const k of kyc||[]){
        if(!k.drive_url) continue;
        const persona = (personas||[]).find((p:any)=>p.id===k.persona_id);
        const np = sanitize(persona?.nombre||"persona");
        const td = sanitize(k.tipo||"documento");
        tasks.push((async()=>{
          const fileId = getFileId(k.drive_url);
          if(!fileId) return;
          const data = await fetchDriveFile(fileId);
          if(data) filesList.push({name:`${clientName}/KYC/${np}/${td}.pdf`,data});
          else errors.push(`KYC/${np}/${td}`);
        })());
      }
    }

    await Promise.all(tasks);

    const enc = new TextEncoder();
    const indice = [`DATA ROOM — ${client?.name||client_id}`,`Generado: ${new Date().toLocaleDateString("es-MX")}`,`Archivos: ${filesList.length}`,`Errores: ${errors.length}`,errors.length?"\nNo descargados:\n"+errors.join("\n"):""].join("\n");
    filesList.push({name:`${clientName}/INDICE.txt`,data:enc.encode(indice)});

    if(filesList.length<=1) return new Response(JSON.stringify({error:"Sin documentos para descargar"}),{status:404,headers:CORS});

    const zip = buildZip(filesList);
    return new Response(zip,{
      headers:{...CORS,"Content-Type":"application/zip","Content-Disposition":`attachment; filename="DataRoom_${clientName}_${new Date().toISOString().slice(0,10)}.zip"`}
    });
  } catch(err){
    return new Response(JSON.stringify({error:(err as Error).message}),{status:500,headers:CORS});
  }
});
