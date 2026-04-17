import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const config = { api: { bodyParser: { sizeLimit: "20mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { pdfBase64, clientId, clientName, industria, fileName } = req.body;
  if (!pdfBase64 || !clientId) return res.status(400).json({ error: "Missing required fields" });

  try {
    // Get checklist
    const { data: checklist } = await supabase.from("clausulas_checklist").select("*").order("orden");
    const checklistText = (checklist || []).map((c, i) =>
      `${i + 1}. [${c.obligatoria ? "OBLIGATORIA" : "RECOMENDADA"}] ${c.titulo}: ${c.descripcion}`
    ).join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
          { type: "text", text: `Eres un experto en derecho corporativo mexicano analizando los estatutos de una empresa.

Tu análisis debe ser PRÁCTICO y orientado al EMPRESARIO, no al abogado. Habla como si le explicaras a un dueño de empresa qué tiene y qué le falta, con consecuencias reales de negocio. Sin citas legales, sin tecnicismos innecesarios.

CHECKLIST DE CLÁUSULAS A VERIFICAR:
${checklistText}

EMPRESA: ${clientName}
INDUSTRIA: ${industria || "general"}

Analiza el documento y responde ÚNICAMENTE en JSON con este formato exacto, sin texto adicional ni backticks:
{
  "objeto_social": {
    "texto": "descripción breve del objeto social actual en lenguaje simple",
    "vigente": true,
    "observacion": "¿está actualizado para lo que hace la empresa hoy? ¿hay algo que limite su operación?"
  },
  "clausulas": [
    {
      "id": "id_de_clausula_del_checklist",
      "titulo": "título de la cláusula",
      "presente": true,
      "actualizada": true,
      "texto_encontrado": "fragmento breve del estatuto donde aparece (máx 100 caracteres)",
      "observacion_practica": "qué significa esto para el negocio en 1-2 oraciones simples",
      "riesgo_si_falta": "qué puede pasar en la práctica si no tiene esta cláusula"
    }
  ],
  "resumen_ejecutivo": "2-3 oraciones en lenguaje empresarial: qué tan protegidos están los socios, qué es lo más urgente",
  "prioridad_actualizacion": ["los 3 cambios más urgentes en orden de prioridad, en lenguaje simple"],
  "nivel_riesgo": "bajo|medio|alto",
  "fecha_probable_constitucion": "año aproximado si se puede determinar del documento"
}` }
        ]
      }]
    });

    const text = response.content?.find(b => b.type === "text")?.text || "";
    let resultado;
    try {
      resultado = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (e) {
      resultado = { error: "No se pudo interpretar el análisis", raw: text.slice(0, 500) };
    }

    // Save to Supabase
    const newAnalisis = {
      id: "est" + Date.now(),
      client_id: clientId,
      nombre_documento: fileName || "estatutos.pdf",
      resultado,
      resumen: resultado.resumen_ejecutivo || "Análisis completado",
      created_at: new Date().toISOString(),
    };
    await supabase.from("analisis_estatutos").insert(newAnalisis);

    return res.json({ ok: true, analisis: newAnalisis });
  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({ error: error.message });
  }
}
