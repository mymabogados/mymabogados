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

async function procesarLote(docs: any[], client_name: string, esConsolidacion = false): Promise<any> {
  const pdfContents: any[] = [];
  for (const doc of docs) {
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

  const instruccion = esConsolidacion
    ? {
        type: "text",
        text: `Consolida estos datos parciales de auditoría legal de ${client_name} en un solo JSON completo y coherente. Elimina duplicados, completa información faltante y genera las observaciones y recomendaciones finales. Responde SOLO con JSON.`,
      }
    : {
        type: "text",
        text: `Eres un abogado corporativo mexicano. Lee estos documentos de ${client_name} y extrae toda la información relevante para una auditoría legal corporativa.

Responde SOLO con este JSON (sin texto adicional):
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
}`,
      };

  const content = pdfContents.length > 0
    ? [...pdfContents, instruccion]
    : [{ type: "text", text: instruccion.text + `\n\nDocumentos: ${docs.map((d: any) => d.nombre).join(", ")}` }];

  const r = await fetch("https://api.anthropic.com/v1/messages", {
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

  const d = await r.json();
  const text = d.content?.[0]?.text || "{}";
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); }
  catch { return {}; }
}

function consolidarDatos(lotes: any[]): any {
  const base = {
    empresa: {},
    constitucion: {},
    asambleas: [] as any[],
    variaciones_capital: [] as any[],
    poderes: [] as any[],
    estructura_actual: { accionistas: [] as any[] },
    abreviaturas: [] as any[],
    observaciones_generales: "",
    recomendaciones: "",
  };

  for (const lote of lotes) {
    // Merge empresa y constitucion — tomar valores no vacíos
    for (const key of ["empresa", "constitucion"]) {
      if (lote[key]) {
        for (const [k, v] of Object.entries(lote[key] as any)) {
          if (v && !(base as any)[key][k]) (base as any)[key][k] = v;
        }
      }
    }
    // Concatenar arrays
    if (lote.asambleas?.length) base.asambleas.push(...lote.asambleas);
    if (lote.variaciones_capital?.length) base.variaciones_capital.push(...lote.variaciones_capital);
    if (lote.poderes?.length) base.poderes.push(...lote.poderes);
    if (lote.abreviaturas?.length) base.abreviaturas.push(...lote.abreviaturas);
    if (lote.estructura_actual?.accionistas?.length) base.estructura_actual.accionistas.push(...lote.estructura_actual.accionistas);
    if (lote.estructura_actual?.administrador && !(base.estructura_actual as any).administrador) {
      Object.assign(base.estructura_actual, lote.estructura_actual);
    }
    if (lote.observaciones_generales) base.observaciones_generales += (base.observaciones_generales ? "\n" : "") + lote.observaciones_generales;
    if (lote.recomendaciones) base.recomendaciones += (base.recomendaciones ? "\n" : "") + lote.recomendaciones;
  }

  // Deduplicar asambleas por fecha
  const fechasVistas = new Set();
  base.asambleas = base.asambleas.filter((a: any) => {
    const key = a.fecha + a.tipo;
    if (fechasVistas.has(key)) return false;
    fechasVistas.add(key);
    return true;
  });

  return base;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { client_name, docs } = await req.json();
    const LOTE_SIZE = 4;
    const resultadosLotes: any[] = [];

    // Procesar en lotes de 4
    for (let i = 0; i < docs.length; i += LOTE_SIZE) {
      const lote = docs.slice(i, i + LOTE_SIZE);
      const resultado = await procesarLote(lote, client_name);
      resultadosLotes.push(resultado);
    }

    // Consolidar si hay más de un lote
    let datosFinales;
    if (resultadosLotes.length === 1) {
      datosFinales = resultadosLotes[0];
    } else {
      datosFinales = consolidarDatos(resultadosLotes);
    }

    return new Response(JSON.stringify({
      datos: datosFinales,
      lotes_procesados: resultadosLotes.length,
      docs_procesados: docs.length,
    }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: CORS });
  }
});
