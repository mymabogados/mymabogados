import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { storagePath, clientId, clientName, industria, fileName } = req.body;
  if (!storagePath || !clientId) return res.status(400).json({ error: "Missing required fields" });

  try {
    // Download PDF from Supabase Storage
    const { data: fileData, error: dlError } = await supabase.storage
      .from("Estatutos")
      .download(storagePath);

    if (dlError) return res.status(400).json({ error: "No se pudo descargar el archivo: " + dlError.message });

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Get checklist
    const { data: checklist } = await supabase.from("clausulas_checklist").select("*").order("orden");
    const checklistText = (checklist || []).map((c, i) =>
      `${i + 1}. [${c.obligatoria ? "OBLIGATORIA" : "RECOMENDADA"}] ${c.titulo}: ${c.descripcion}`
    ).join("\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 }
          },
          {
            type: "text",
            text: `Eres un experto en derecho corporativo mexicano analizando los estatutos de una empresa.

Tu análisis debe ser PRÁCTICO y orientado al EMPRESARIO. Habla como si le explicaras a un dueño de empresa qué tiene y qué le falta, con consecuencias reales de negocio. Sin tecnicismos innecesarios.

CHECKLIST DE CLÁUSULAS A VERIFICAR:
${checklistText}

EMPRESA: ${clientName}
INDUSTRIA: ${industria || "general"}

Responde ÚNICAMENTE en JSON sin texto adicional ni backticks markdown:
{
  "objeto_social": {
    "texto": "descripción breve del objeto social en lenguaje simple",
    "vigente": true,
    "observacion": "¿está actualizado para lo que hace la empresa hoy?"
  },
  "clausulas": [
    {
      "id": "id_clausula",
      "titulo": "título",
      "presente": true,
      "actualizada": true,
      "texto_encontrado": "fragmento breve del estatuto (máx 80 caracteres)",
      "observacion_practica": "qué significa para el negocio en 1-2 oraciones simples",
      "riesgo_si_falta": "qué puede pasar en la práctica"
    }
  ],
  "resumen_ejecutivo": "2-3 oraciones en lenguaje empresarial",
  "prioridad_actualizacion": ["cambio urgente 1", "cambio urgente 2", "cambio urgente 3"],
  "nivel_riesgo": "bajo|medio|alto",
  "fecha_probable_constitucion": "año aproximado"
}`
          }
        ]
      }]
    });

    const text = response.content?.find(b => b.type === "text")?.text || "";
    let resultado;
    try {
      resultado = JSON.parse(text.trim());
    } catch (e) {
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      try { resultado = JSON.parse(cleaned); }
      catch (e2) { resultado = { error: "No se pudo interpretar el análisis." }; }
    }

    // Save analysis
    const newAnalisis = {
      id: "est" + Date.now(),
      client_id: clientId,
      nombre_documento: fileName || "estatutos.pdf",
      resultado,
      resumen: resultado.resumen_ejecutivo || "Análisis completado",
      created_at: new Date().toISOString(),
    };
    await supabase.from("analisis_estatutos").insert(newAnalisis);

    // Clean up storage
    await supabase.storage.from("Estatutos").remove([storagePath]);

    return res.status(200).json({ ok: true, analisis: newAnalisis });
  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({ error: error.message });
  }
}
