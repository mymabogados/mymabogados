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
    const { email, nombre } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Email requerido" }), { status: 400, headers: corsHeaders });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Generar código OTP de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos

    // Invalidar OTPs anteriores del mismo email
    await supabase.from("otp_codes").update({ used: true }).eq("email", email).eq("used", false);

    // Guardar nuevo OTP
    await supabase.from("otp_codes").insert({ email, code, expires_at });

    // Enviar email
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "M&M Abogados <noreply@mymabogados.mx>",
        to: [email],
        subject: "Tu código de acceso — Panel M&M Abogados",
        html: `
          <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:2rem;">
            <div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px">Millán & Martínez Abogados</div>
            <h2 style="font-size:22px;color:#1E2B1A;margin:0 0 16px">Tu código de verificación</h2>
            <p style="font-size:14px;color:#7A9070;margin-bottom:24px">Hola${nombre ? " " + nombre : ""}, usa este código para acceder a tu panel corporativo:</p>
            <div style="background:#F5F2ED;border:1px solid #DDE4D8;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
              <div style="font-size:42px;font-family:Georgia,serif;color:#1E2B1A;letter-spacing:.3em;font-weight:400">${code}</div>
            </div>
            <p style="font-size:12px;color:#7A9070">Este código expira en <strong>10 minutos</strong>. Si no solicitaste este código, ignora este mensaje.</p>
            <hr style="border:none;border-top:1px solid #DDE4D8;margin:24px 0"/>
            <p style="font-size:11px;color:#7A9070">panel.mymabogados.mx · Millán & Martínez Abogados</p>
          </div>
        `,
      }),
    });

    const emailData = await emailRes.json();
    if (emailData.error) throw new Error(emailData.error.message || "Error enviando email");

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
