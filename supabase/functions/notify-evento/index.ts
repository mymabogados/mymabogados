import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { client_id, tipo, descripcion, modulo } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Obtener destinatarios con este tipo activado
    const { data: prefs } = await supabase
      .from("notif_preferencias")
      .select("*")
      .eq("client_id", client_id)
      .eq("activo", true);

    const destinatarios = (prefs || []).filter(p => p.tipos?.[tipo] === true);
    if (destinatarios.length === 0) return new Response(JSON.stringify({ ok: true, sent: 0 }), { headers: corsHeaders });

    // Obtener nombre del cliente
    const { data: cl } = await supabase.from("clients").select("name").eq("id", client_id).single();
    const clientNombre = cl?.name || client_id;

    const TIPO_LABELS: Record<string, string> = {
      checklist: "Alerta de cumplimiento",
      documento: "Documento nuevo",
      nota: "Nota del despacho",
      accion: "Próximo paso actualizado",
      solicitud: "Solicitud respondida",
      vencimiento: "Vencimiento próximo",
    };

    const TIPO_COLORS: Record<string, string> = {
      checklist: "#C0392B",
      documento: "#185FA5",
      nota: "#4A5C45",
      accion: "#C9A84C",
      solicitud: "#4A5C45",
      vencimiento: "#E67E22",
    };

    const color = TIPO_COLORS[tipo] || "#4A5C45";
    const tipoLabel = TIPO_LABELS[tipo] || tipo;

    let sent = 0;
    for (const pref of destinatarios) {
      const html = `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:2rem;">
          <div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px">Millán & Martínez Abogados</div>
          <h2 style="font-size:20px;color:#1E2B1A;margin:0 0 4px">${tipoLabel}</h2>
          <div style="font-size:12px;color:#7A9070;margin-bottom:20px">${clientNombre}${modulo ? " · " + modulo : ""}</div>
          <div style="background:#F5F2ED;border-left:3px solid ${color};border-radius:4px;padding:16px 18px;margin-bottom:20px">
            <div style="font-size:14px;color:#1E2B1A;line-height:1.6">${descripcion}</div>
          </div>
          <a href="https://panel.mymabogados.mx" style="display:inline-block;background:#4A5C45;color:#F0F4EE;text-decoration:none;padding:10px 20px;border-radius:4px;font-size:13px;font-family:system-ui,sans-serif">Ver en el panel →</a>
          <hr style="border:none;border-top:1px solid #DDE4D8;margin:24px 0"/>
          <p style="font-size:11px;color:#7A9070;font-family:system-ui,sans-serif">Para modificar tus preferencias de notificación, ingresa a tu panel en panel.mymabogados.mx</p>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "M&M Abogados <noreply@mymabogados.mx>",
          to: [pref.user_email],
          subject: `${tipoLabel} — ${clientNombre}`,
          html,
        }),
      });
      sent++;
    }

    return new Response(JSON.stringify({ ok: true, sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
