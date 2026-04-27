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

    // Descargar PDFs
    const pdfContents: any[] = [];
    for (const doc of (docs || []).slice(0, 8)) {
      if (!doc.drive_url) continue;
      const fileId = getFileId(doc.drive_url);
      if (!fileId) continue;
      const b64 = await fetchPDF(fileId);
      if (b64) {
        pdfContents.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: b64 },
          title: doc.nombre,
        });
      }
    }

    const instruccion = {
      type: "text",
      text: `Eres un abogado corporativo mexicano experto en auditorías legales. 
Lee todos los documentos adjuntos de ${client_name} y extrae TODA la información relevante.

Genera un JSON con esta estructura exacta (sin texto adicional, solo JSON):
{
  "empresa": {"nombre":"","abreviatura":"","domicilio":"","duracion":"","objeto":"","capital_original":"","series_acciones":""},
  "constitucion": {"escritura_num":"","fecha":"","notario":"","num_notario":"","ciudad":"","folio_mercantil":"","administrador_original":"","comisario_original":""},
  "asambleas": [{"tipo":"","fecha":"","descripcion":"","acuerdos":"","observacion":"","recomendacion":""}],
  "variaciones_capital": [{"fecha":"","tipo":"","monto":"","descripcion":""}],
  "poderes": [{"titular":"","tipo":"","fecha":"","facultades":""}],
  "estructura_actual": {"organo_administracion":"","administrador":"","comisario":"","accionistas":[{"nombre":"","acciones":"","valor":""}]},
  "abreviaturas": [{"abreviatura":"","significado":""}],
  "observaciones_generales": "",
  "recomendaciones": ""
}

Extrae TODOS los datos que encuentres en los documentos. Responde SOLO con el JSON.`,
    };

    const content = pdfContents.length > 0
      ? [...pdfContents, instruccion]
      : [{ type: "text", text: `${instruccion.text}\n\nDocumentos disponibles: ${docs.map((d: any) => d.nombre).join(", ")}` }];

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content }],
      }),
    });

    const claudeData = await claudeRes.json();
    const text = claudeData.content?.[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    
    let datos;
    try { datos = JSON.parse(clean); }
    catch { datos = { empresa: { nombre: client_name }, constitucion: {}, asambleas: [], poderes: [], estructura_actual: {}, observaciones_generales: "No se pudo extraer automáticamente.", recomendaciones: "" }; }

    return new Response(JSON.stringify({ datos, pdfs_leidos: pdfContents.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: CORS });
  }
});
