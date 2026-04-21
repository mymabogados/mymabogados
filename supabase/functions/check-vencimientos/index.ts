import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_EMAIL = "jmartinez@mymabogados.mx";

serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Traer todos los docs con fecha_vencimiento
    const { data: docs } = await supabase
      .from("documents")
      .select("*, clients(name, email)")
      .not("fecha_vencimiento", "is", null);

    if (!docs || docs.length === 0) return new Response("sin docs", { status: 200 });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let enviados = 0;

    for (const doc of docs) {
      const vence = new Date(doc.fecha_vencimiento + "T12:00:00");
      const diasRestantes = Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      const diasAlerta = doc.dias_alerta || 30;

      // Solo manda si faltan exactamente diasAlerta días o 1 día
      if (diasRestantes !== diasAlerta && diasRestantes !== 1) continue;

      const clientName = doc.clients?.name || "Cliente";
      const clientEmail = doc.clients?.email;
      const modNombre = doc.modulo || "";
      const docLabel = doc.tipo || "documento";

      const alerta = diasRestantes === 1
        ? "⚠️ Vence MAÑANA"
        : `⏰ Vence en ${diasRestantes} días`;

      const htmlEmail = `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px;background:#F2F4F0;">
          <div style="background:#4A5C45;padding:24px 32px;border-radius:4px 4px 0 0;">
            <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(240,244,238,.6);margin-bottom:8px;">Millán & Martínez Abogados</div>
            <div style="font-size:22px;color:#F0F4EE;font-weight:400;">Alerta de vencimiento</div>
          </div>
          <div style="background:#FAFCF8;padding:32px;border-radius:0 0 4px 4px;border:1px solid #DDE4D8;border-top:none;">
            <div style="font-size:13px;color:#1E2B1A;margin-bottom:16px;">Estimado <strong>${clientName}</strong>:</div>
            <div style="background:#FFF7ED;border-left:3px solid #C9A84C;padding:16px;border-radius:2px;font-size:13px;color:#1E2B1A;margin-bottom:16px;">
              <strong>${alerta}</strong><br/>
              Documento: <strong>${docLabel}</strong><br/>
              Módulo: ${modNombre}<br/>
              Fecha de vencimiento: <strong>${new Date(doc.fecha_vencimiento+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}</strong>
            </div>
            <div style="font-size:12px;color:#7A9070;margin-bottom:24px;">Por favor tome las acciones necesarias antes de la fecha de vencimiento.</div>
            <a href="https://panel.mymabogados.mx" style="background:#4A5C45;color:#F0F4EE;padding:10px 20px;text-decoration:none;border-radius:4px;font-size:12px;letter-spacing:.1em;font-family:system-ui,sans-serif;">Ver panel →</a>
          </div>
        </div>
      `;

      const to = [ADMIN_EMAIL];
      if (clientEmail && clientEmail !== ADMIN_EMAIL) to.push(clientEmail);

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "M&M Abogados <notificaciones@mymabogados.mx>",
          to,
          subject: `${alerta} — ${docLabel} · ${clientName}`,
          html: htmlEmail,
        }),
      });

      enviados++;
      console.log(`Email enviado: ${docLabel} — ${clientName} — ${diasRestantes} días`);
    }

    return new Response(`OK — ${enviados} emails enviados`, { status: 200 });
  } catch (err) {
    console.error("Error:", err);
    return new Response("error", { status: 500 });
  }
});
