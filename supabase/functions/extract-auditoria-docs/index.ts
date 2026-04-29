import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";

function getFileId(url: string): string | null {
  const m = url.match(/[-\w]{25,}/);
  return m ? m[0] : null;
}

async function fetchPDF(fileId: string): Promise<string | null> {
  try {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    const r = await fetch(url, { redirect: "follow" });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    if (ct.includes("text/html")) return null;
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let b64 = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      b64 += String.fromCharCode(...bytes.slice(i, i + chunk));
    }
    return btoa(b64);
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { client_name, docs } = await req.json();
    const LOTE_SIZE = 4;
    const resultadosLotes: any[] = [];

    for (let i = 0; i < docs.length; i += LOTE_SIZE) {
      const lote = docs.slice(i, i + LOTE_SIZE);
      const pdfContents: any[] = [];
      for (const doc of lote) {
        if (doc.base64) {
          pdfContents.push({ type:"document", source:{ type:"base64", media_type:"application/pdf", data:doc.base64 }, title:doc.nombre });
        } else if (doc.drive_url) {
          const fileId = getFileId(doc.drive_url);
          if (fileId) { const b64 = await fetchPDF(fileId); if (b64) pdfContents.push({ type:"document", source:{ type:"base64", media_type:"application/pdf", data:b64 }, title:doc.nombre }); }
        }
      }

      const instruccion = { type:"text", text:`Eres un abogado corporativo mexicano experto en auditorías legales. Lee TODOS los documentos adjuntos de ${client_name} y extrae la información completa.

Responde SOLO con este JSON (sin backticks, sin texto adicional):
{
  "empresa":{"nombre":"","abreviatura":"","domicilio":"","duracion":"","objeto":"","capital_original":"","series_acciones":"","extranjeria":""},
  "constitucion":{"escritura_num":"","fecha":"","notario":"","num_notario":"","ciudad":"","folio_mercantil":"","organo_administracion_original":"","administrador_original":"","comisario_original":"","capital_inicial":[{"accionista":"","acciones":"","valor":""}]},
  "asambleas":[{"tipo":"","fecha":"","titulo":"","registro":"","protocolizacion":"","texto":"","tabla_capital":[{"accionista":"","fijo":"","variable":"","total":""}],"observaciones":[],"recomendaciones":[]}],
  "variaciones_capital":[{"fecha":"","tipo":"","monto":"","descripcion":"","tabla_capital":[{"accionista":"","fijo":"","variable":"","total":""}]}],
  "sesiones_consejo":[{"fecha":"","descripcion":"","observaciones":[],"recomendaciones":[]}],
  "transmision_acciones":[{"fecha":"","descripcion":"","tabla_capital":[{"accionista":"","fijo":"","variable":"","total":""}]}],
  "poderes":[{"escritura":"","fecha":"","notario":"","otorgante":"","apoderado":"","tipo_poder":"","facultades":"","observaciones":[],"recomendaciones":[]}],
  "estructura_actual":{"fecha_referencia":"","organo_administracion":"","accionistas":[{"accionista":"","fijo":"","variable":"","total":""}],"consejo":[{"nombre":"","cargo":""}],"comisario":""},
  "abreviaturas":[{"abreviatura":"","significado":""}],
  "comentarios_generales":{"libros":"","titulos":"","asambleas":"","recomendaciones":[]}
}

Extrae TODO el texto narrativo completo. Para asambleas incluye acuerdos completos. Para tablas incluye todos los accionistas con montos exactos.` };

      const content = pdfContents.length > 0 ? [...pdfContents, instruccion] : [{ type:"text", text:instruccion.text+`\n\nDocumentos: ${lote.map((d:any)=>d.nombre).join(", ")}` }];

      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01"},
        body:JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:8000, messages:[{ role:"user", content }] }),
      });

      const d = await r.json();
      const text = d.content?.[0]?.text || "{}";
      console.log("Preview:", text.slice(0,200));
      const clean = text.replace(/```json|```/g,"").trim();
      try { resultadosLotes.push(JSON.parse(clean)); } catch { resultadosLotes.push({}); }
    }

    const base: any = { empresa:{}, constitucion:{}, asambleas:[], variaciones_capital:[], sesiones_consejo:[], transmision_acciones:[], poderes:[], estructura_actual:{accionistas:[],consejo:[]}, abreviaturas:[], comentarios_generales:{} };
    for (const lote of resultadosLotes) {
      for (const key of ["empresa","constitucion","estructura_actual","comentarios_generales"]) {
        if (lote[key]) for (const [k,v] of Object.entries(lote[key] as any)) { if (v && !(base[key] as any)[k]) (base[key] as any)[k]=v; }
      }
      for (const key of ["asambleas","variaciones_capital","sesiones_consejo","transmision_acciones","poderes","abreviaturas"]) {
        if (lote[key]?.length) base[key].push(...lote[key]);
      }
    }

    return new Response(JSON.stringify({ datos:base, lotes_procesados:resultadosLotes.length }), { headers:{...CORS,"Content-Type":"application/json"} });
  } catch(err) {
    return new Response(JSON.stringify({ error:(err as Error).message }), { status:500, headers:CORS });
  }
});
