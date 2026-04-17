import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Ask Claude to identify recent regulatory changes in Mexico
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Busca en el DOF (Diario Oficial de la Federación), SAT, IMSS, INFONAVIT, STPS y Secretaría de Economía de México cualquier cambio regulatorio relevante de las últimas 2 semanas que afecte obligaciones corporativas de empresas mexicanas.

Específicamente busca cambios en:
1. SAT - nuevas obligaciones fiscales, cambios en e.firma, CSD, buzón tributario, declaraciones
2. IMSS - cambios en cuotas patronales, nuevas obligaciones de registro
3. INFONAVIT - cambios en aportaciones o registros
4. STPS - nuevas obligaciones laborales
5. SE/RPPyC - cambios en registro mercantil

Responde ÚNICAMENTE en JSON con este formato exacto, sin texto adicional:
{
  "cambios": [
    {
      "autoridad": "SAT",
      "titulo": "Título corto del cambio",
      "descripcion": "Descripción de la nueva obligación o cambio",
      "campo": "nombre_campo_afectado",
      "condicion": "ausente|vencido|por_vencer_30|negativa|adeudo|desactualizado|inactivo",
      "nivel": "red|amber",
      "fuente": "URL o nombre de la fuente",
      "fecha_vigencia": "YYYY-MM-DD"
    }
  ],
  "fecha_consulta": "YYYY-MM-DD",
  "sin_cambios": false
}`
      }]
    });

    const textContent = response.content.find(b => b.type === "text");
    if (!textContent) return res.json({ ok: true, cambios: 0, msg: "Sin respuesta de texto" });

    let parsed;
    try {
      const clean = textContent.text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      return res.json({ ok: true, cambios: 0, msg: "No se detectaron cambios estructurados" });
    }

    if (parsed.sin_cambios || !parsed.cambios?.length) {
      return res.json({ ok: true, cambios: 0, msg: "Sin cambios regulatorios esta semana" });
    }

    // Upsert new rules
    let inserted = 0;
    for (const cambio of parsed.cambios) {
      const id = "auto_" + cambio.autoridad + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      const { error } = await supabase.from("reglas_compliance").upsert({
        id,
        autoridad: cambio.autoridad,
        titulo: cambio.titulo,
        descripcion: cambio.descripcion,
        campo: cambio.campo || "general",
        condicion: cambio.condicion || "ausente",
        nivel: cambio.nivel || "amber",
        activa: true,
        fuente: cambio.fuente || "Sync automático",
        fecha_vigencia: cambio.fecha_vigencia || new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (!error) inserted++;
    }

    return res.json({ ok: true, cambios: inserted, fecha: parsed.fecha_consulta });
  } catch (error) {
    console.error("Sync error:", error);
    return res.status(500).json({ error: error.message });
  }
}
