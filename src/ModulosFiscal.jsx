import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const GOLD = "#C9A84C";
const MUSGO = "#4A5C45";
const GRAY = "#7A9070";
const BORDER = "#DDE4D8";
const TEXT_DARK = "#1E2B1A";
const WHITE = "#FAFCF8";

function Spinner(){return <div style={{textAlign:"center",padding:"2rem",color:GRAY,fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;}

function SectionTitle({children}){
  return <div style={{fontSize:10,letterSpacing:".15em",textTransform:"uppercase",color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:10,marginTop:4,fontWeight:600}}>{children}</div>;
}

function InfoBox({color="#FFF7ED",border="#FED7AA",children}){
  return <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,padding:"12px 14px",background:color,borderRadius:4,marginBottom:12,border:"1px solid "+border,lineHeight:1.6}}>{children}</div>;
}

const s={
  card:{background:"#FAFCF8",border:"1px solid "+BORDER,borderRadius:4,padding:"1rem 1.25rem",marginBottom:8},
  row:{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:"1px solid "+BORDER},
  muted:{fontSize:12,color:GRAY,fontFamily:"system-ui,sans-serif"},
  label:{fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:6,display:"block"},
  input:{fontSize:12,padding:"7px 10px",border:"1px solid "+BORDER,borderRadius:3,fontFamily:"system-ui,sans-serif",background:WHITE,color:TEXT_DARK,width:"100%",boxSizing:"border-box"},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  textarea:{minHeight:70,resize:"vertical"},
};

function useModData(client,mod){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  const socId = client._sociedad?.id || null;
  useEffect(()=>{
    const q = socId
      ? supabase.from("modulos_data").select("data").eq("client_id",client.id).eq("modulo",mod).eq("sociedad_id",socId).single()
      : supabase.from("modulos_data").select("data").eq("client_id",client.id).eq("modulo",mod).is("sociedad_id",null).single();
    q.then(({data:d})=>{ if(d?.data) setData(d.data); else setData({}); });
  },[client.id,mod,socId]);
  async function save(field,val){
    setSaving(true);
    const updated={...data,[field]:val};
    setData(updated);
    const qEx=socId
      ?supabase.from("modulos_data").select("id").eq("client_id",client.id).eq("modulo",mod).eq("sociedad_id",socId).maybeSingle()
      :supabase.from("modulos_data").select("id").eq("client_id",client.id).eq("modulo",mod).is("sociedad_id",null).maybeSingle();
    const {data:ex}=await qEx;
    if(ex?.id){
      await supabase.from("modulos_data").update({data:updated,updated_at:new Date().toISOString()}).eq("id",ex.id);
    } else {
      await supabase.from("modulos_data").insert({client_id:client.id,modulo:mod,sociedad_id:socId,data:updated,updated_at:new Date().toISOString()});
    }
    setSaving(false);
  }
  return {data,save,saving};
}

function Field({label,children,fullWidth=false}){
  return(
    <div style={fullWidth?{gridColumn:"1/-1"}:{}}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function Select({value,onChange,options}){
  return(
    <select value={value||""} onChange={e=>onChange(e.target.value)} style={{...s.input,cursor:"pointer"}}>
      <option value="">Seleccionar...</option>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export const FISCAL_DOCS = {
  "F-01": {
    docs:[
      {id:"cedula_fiscal",label:"Cédula de Identificación Fiscal",desc:"RFC y datos del contribuyente",requerido:true},
      {id:"constancia_situacion_fiscal",label:"Constancia de Situación Fiscal",desc:"Actualizada — no mayor a 3 meses",requerido:true},
      {id:"opinion_cumplimiento",label:"Opinión de Cumplimiento 32-D",desc:"Positiva vigente",requerido:true},
      {id:"certificado_efirma",label:"Certificado e.firma vigente",desc:"Archivo .cer y .key",requerido:true},
      {id:"csd_activo",label:"CSD activos (sellos digitales)",desc:"Certificados de sello digital",requerido:true},
      {id:"declaracion_anual",label:"Declaración Anual último ejercicio",desc:"ISR personas morales",requerido:true},
    ],
    checklist:[
      {id:"rfc_activo",label:"RFC activo y sin restricciones",riesgo:"critico"},
      {id:"opinion_positiva",label:"Opinión de cumplimiento positiva (32-D)",riesgo:"critico"},
      {id:"buzon_activo",label:"Buzón tributario activo con correo vigente",riesgo:"alto"},
      {id:"efirma_vigente",label:"e.firma vigente (no vencida)",riesgo:"critico"},
      {id:"csd_vigentes",label:"CSD (sellos digitales) vigentes",riesgo:"critico"},
      {id:"declaraciones_corriente",label:"Declaraciones mensuales al corriente",riesgo:"alto"},
      {id:"declaracion_anual_presentada",label:"Declaración anual presentada en tiempo",riesgo:"alto"},
      {id:"domicilio_fiscal_localizado",label:"Domicilio fiscal localizado y actualizado",riesgo:"medio"},
    ],
    riesgos:[
      {label:"Cancelación de CSD por incumplimiento",impacto:"Imposibilidad de timbrar facturas — paralización de operaciones",nivel:"critico"},
      {label:"Restricción temporal del RFC",impacto:"Sin comprobantes fiscales válidos mientras dure la restricción",nivel:"critico"},
      {label:"Pérdida de contratos con gobierno",impacto:"Opinión negativa impide participar en licitaciones y contratos",nivel:"alto"},
      {label:"Multa por buzón tributario inactivo",impacto:"$3,390 a $9,380 pesos — notificaciones no recibidas tienen efectos legales",nivel:"alto"},
    ]
  },
  "F-02": {
    docs:[
      {id:"pac_contrato",label:"Contrato con PAC vigente",desc:"Proveedor Autorizado de Certificación",requerido:true},
      {id:"csd_vigente_facturacion",label:"CSD vigentes para facturación",desc:"Certificados de sello digital activos",requerido:true},
      {id:"cfdi_modelo",label:"CFDI modelo versión 4.0",desc:"Plantilla de factura actualizada",requerido:false},
      {id:"complemento_nomina",label:"Complemento de nómina 1.2",desc:"Recibo de nómina modelo actualizado",requerido:false},
    ],
    checklist:[
      {id:"csd_30_dias",label:"CSD vigentes con más de 30 días antes de vencer",riesgo:"critico"},
      {id:"pac_activo",label:"PAC activo y con servicio vigente",riesgo:"alto"},
      {id:"cfdi_v4",label:"CFDI versión 4.0 (obligatoria desde 2023)",riesgo:"critico"},
      {id:"datos_receptor",label:"Datos del receptor validados (RFC, nombre, domicilio)",riesgo:"alto"},
      {id:"complemento_nomina_correcto",label:"Complemento de nómina 1.2 en recibos de pago",riesgo:"alto"},
      {id:"cancelaciones_correctas",label:"Cancelaciones con motivo correcto y aceptación del receptor",riesgo:"medio"},
      {id:"carta_porte_vigente",label:"Carta porte en traslados de mercancías si aplica",riesgo:"alto"},
    ],
    riesgos:[
      {label:"CSD vencido — facturas sin validez fiscal",impacto:"CFDI rechazados — clientes no pueden deducir",nivel:"critico"},
      {label:"Multa por CFDI con datos incorrectos",impacto:"$1,130 a $3,390 por comprobante",nivel:"alto"},
      {label:"Infracción por falta de carta porte",impacto:"$23,000 a $76,000 por operación — retención de mercancía",nivel:"critico"},
    ]
  },
  "F-03": {
    docs:[
      {id:"poder_fiscal",label:"Poder notarial para representación fiscal",desc:"Abogado o contador designado",requerido:true},
      {id:"documentacion_soporte",label:"Documentación soporte organizada",desc:"Por ejercicio fiscal",requerido:true},
      {id:"contabilidad_electronica_envio",label:"Acuse contabilidad electrónica",desc:"Enviada al SAT — últimos 2 años",requerido:true},
    ],
    checklist:[
      {id:"abogado_poder",label:"Abogado fiscal designado con poder vigente",riesgo:"critico"},
      {id:"plazos_controlados",label:"Plazos de respuesta controlados y en calendario",riesgo:"critico"},
      {id:"documentacion_soporte_organizada",label:"Documentación soporte organizada por ejercicio",riesgo:"alto"},
      {id:"contabilidad_enviada",label:"Contabilidad electrónica enviada al SAT",riesgo:"alto"},
      {id:"provision_contingente",label:"Provisión contable del contingente registrada",riesgo:"medio"},
      {id:"prodecon_notificado",label:"PRODECON notificado si hay irregularidades",riesgo:"alto"},
    ],
    riesgos:[
      {label:"Determinación firme por no contestar en tiempo",impacto:"Crédito fiscal exigible — embargo inmediato de cuentas",nivel:"critico"},
      {label:"Embargo de cuentas bancarias",impacto:"Paralización operativa — hasta que se garantice o pague",nivel:"critico"},
      {label:"Publicación en lista negra 69-B",impacto:"Socios y clientes no pueden deducir operaciones",nivel:"critico"},
    ]
  },
  "F-04": {
    docs:[
      {id:"estudio_precios_transferencia",label:"Estudio de precios de transferencia",desc:"Ejercicio vigente — art. 76 LISR",requerido:true},
      {id:"contratos_intercompany",label:"Contratos intercompany vigentes",desc:"Todos los servicios entre partes relacionadas",requerido:true},
      {id:"declaracion_informativa_operaciones",label:"Declaración informativa operaciones con relacionadas",desc:"Anexo 9 DIM",requerido:true},
    ],
    checklist:[
      {id:"estudio_pt_vigente",label:"Estudio de precios de transferencia vigente",riesgo:"critico"},
      {id:"contratos_intercompany_firmados",label:"Contratos intercompany firmados y vigentes",riesgo:"alto"},
      {id:"operaciones_a_valor_mercado",label:"Operaciones a valor de mercado documentadas",riesgo:"critico"},
      {id:"declaracion_informativa_presentada",label:"Declaración informativa presentada en tiempo",riesgo:"alto"},
      {id:"cbcr_presentado",label:"Reporte país por país (CbCR) si aplica",riesgo:"medio"},
    ],
    riesgos:[
      {label:"Ajuste de precios de transferencia por SAT",impacto:"Crédito fiscal + recargos + multas — hasta 100% del ajuste",nivel:"critico"},
      {label:"No deducibilidad de pagos a partes relacionadas",impacto:"Rechazo de deducciones — mayor base gravable",nivel:"critico"},
      {label:"Sanción por falta de estudio",impacto:"$1,550,080 a $2,326,520 pesos (multa fija)",nivel:"alto"},
    ]
  },
  "F-05": {
    docs:[
      {id:"cufin_registro",label:"Registro CUFIN/CUCA",desc:"Cuenta de Utilidad Fiscal Neta actualizada",requerido:true},
      {id:"comprobantes_distribucion",label:"Comprobantes de distribución de dividendos",desc:"CFDI de dividendos emitidos",requerido:false},
    ],
    checklist:[
      {id:"cufin_actualizada",label:"CUFIN actualizada al cierre del ejercicio",riesgo:"alto"},
      {id:"cuca_actualizada",label:"CUCA actualizada al cierre del ejercicio",riesgo:"alto"},
      {id:"dividendos_cfdi",label:"Dividendos pagados con CFDI correcto",riesgo:"critico"},
      {id:"retencion_dividendos",label:"Retención 10% ISR dividendos pagados a PF",riesgo:"critico"},
      {id:"no_distribucion_exceso",label:"Sin distribuciones en exceso de CUFIN",riesgo:"critico"},
    ],
    riesgos:[
      {label:"ISR adicional por distribución en exceso de CUFIN",impacto:"30% sobre el excedente + recargos — crédito fiscal inmediato",nivel:"critico"},
      {label:"Retención incorrecta de dividendos",impacto:"Responsabilidad solidaria de la empresa — crédito fiscal",nivel:"critico"},
    ]
  },
  "F-06": {
    docs:[
      {id:"nomina_deducible",label:"Nómina timbrada deducible",desc:"CFDI nómina últimos 3 meses",requerido:true},
      {id:"ptu_calculo",label:"Cálculo PTU del ejercicio",desc:"Declaración informativa trabajadores",requerido:true},
    ],
    checklist:[
      {id:"deducciones_soportadas",label:"Todas las deducciones con CFDI soporte",riesgo:"alto"},
      {id:"nomina_timbrada_completa",label:"100% nómina timbrada con complemento correcto",riesgo:"critico"},
      {id:"ptu_calculada_pagada",label:"PTU calculada y pagada en tiempo",riesgo:"alto"},
      {id:"gastos_indispensabilidad",label:"Gastos cumplen estricta indispensabilidad",riesgo:"alto"},
      {id:"depreciaciones_correctas",label:"Depreciaciones calculadas correctamente",riesgo:"medio"},
    ],
    riesgos:[
      {label:"Rechazo de deducciones por falta de CFDI",impacto:"Mayor ISR a pagar + recargos + multas",nivel:"alto"},
      {label:"Nómina no deducible por CFDI incorrecto",impacto:"Rechazo total de la deducción de sueldos",nivel:"critico"},
      {label:"Multa por PTU no pagada",impacto:"PTU + 20% anual de recargos más multa del 20% al 25%",nivel:"alto"},
    ]
  },
  "F-07": {
    docs:[
      {id:"declaraciones_iva",label:"Declaraciones IVA mensuales",desc:"Últimos 6 meses",requerido:true},
      {id:"diot_presentada",label:"DIOT presentada",desc:"Declaración informativa de operaciones con terceros",requerido:true},
    ],
    checklist:[
      {id:"iva_declarado_correcto",label:"IVA declarado y pagado en tiempo",riesgo:"alto"},
      {id:"diot_presentada_check",label:"DIOT presentada mensualmente",riesgo:"alto"},
      {id:"iva_acreditable_documentado",label:"IVA acreditable con CFDI soporte",riesgo:"critico"},
      {id:"iva_retenido_enterado",label:"IVA retenido a terceros enterado",riesgo:"critico"},
      {id:"tasa_correcta",label:"Tasa de IVA correcta según actividad y zona",riesgo:"alto"},
    ],
    riesgos:[
      {label:"IVA acreditable rechazado",impacto:"Devolución del IVA acreditado + recargos + multas",nivel:"critico"},
      {label:"IVA retenido no enterado",impacto:"Crédito fiscal + responsabilidad solidaria",nivel:"critico"},
      {label:"Multa por DIOT no presentada",impacto:"$9,540 a $19,080 pesos por mes no presentado",nivel:"alto"},
    ]
  },
  "F-08": {
    docs:[
      {id:"declaracion_isr_retenido",label:"Declaraciones ISR retenciones",desc:"Salarios, honorarios, arrendamiento",requerido:true},
      {id:"constancias_retencion",label:"Constancias de retención emitidas",desc:"A proveedores y empleados",requerido:true},
      {id:"declaracion_informativa_sueldos",label:"Declaración informativa sueldos y salarios",desc:"Anual",requerido:true},
    ],
    checklist:[
      {id:"retenciones_enteradas",label:"Retenciones ISR enteradas en tiempo",riesgo:"critico"},
      {id:"constancias_emitidas",label:"Constancias de retención emitidas a todos los receptores",riesgo:"alto"},
      {id:"subsidio_empleo_correcto",label:"Subsidio al empleo calculado correctamente",riesgo:"alto"},
      {id:"declaracion_informativa_presentada_f08",label:"Declaración informativa anual presentada",riesgo:"alto"},
      {id:"honorarios_retencion_10",label:"Retención 10% honorarios a personas físicas",riesgo:"critico"},
    ],
    riesgos:[
      {label:"Retenciones no enteradas",impacto:"Crédito fiscal + recargos del 20% anual + multa del 20% al 25%",nivel:"critico"},
      {label:"Responsabilidad solidaria por retenciones",impacto:"La empresa responde por el ISR no retenido al trabajador",nivel:"critico"},
      {label:"Multa por constancias no emitidas",impacto:"$1,550 a $3,840 pesos por constancia no emitida",nivel:"alto"},
    ]
  },
};

export function ModF01({client}){
  const {data,save,saving}=useModData(client,"F-01");
  return(
    <div>
      <InfoBox>Monitoreo del estatus fiscal básico ante el SAT. RFC, buzón tributario, e.firma, CSD y cumplimiento de obligaciones periódicas.</InfoBox>
      <SectionTitle>Datos del contribuyente</SectionTitle>
      <div style={s.grid2}>
        <Field label="RFC de la empresa"><input style={s.input} value={data.rfc||""} onChange={e=>save("rfc",e.target.value)} placeholder="ABC010101XXX"/></Field>
        <Field label="Régimen fiscal">
          <select value={data.regimen||""} onChange={e=>save("regimen",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="601">601 — General de Ley PM</option>
            <option value="612">612 — Personas Físicas con Actividades Empresariales</option>
            <option value="626">626 — Régimen Simplificado de Confianza</option>
            <option value="621">621 — Incorporación Fiscal</option>
          </select>
        </Field>
        <Field label="Actividad económica principal"><input style={s.input} value={data.actividad_economica||""} onChange={e=>save("actividad_economica",e.target.value)} placeholder="Descripción de la actividad"/></Field>
        <Field label="Fecha inicio de operaciones"><input style={s.input} type="date" value={data.fecha_inicio||""} onChange={e=>save("fecha_inicio",e.target.value)}/></Field>
      </div>
      <SectionTitle>Estatus fiscal</SectionTitle>
      <div style={s.grid2}>
        <Field label="Estatus RFC">
          <select value={data.estatus_rfc||""} onChange={e=>save("estatus_rfc",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="activo">Activo — sin restricciones</option>
            <option value="suspendido">Suspendido temporalmente</option>
            <option value="restringido">Restringido — revisar</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </Field>
        <Field label="Opinión de cumplimiento 32-D">
          <select value={data.opinion_32d||""} onChange={e=>save("opinion_32d",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="positiva">Positiva — al corriente</option>
            <option value="negativa">Negativa — adeudos</option>
            <option value="no_verificada">No verificada</option>
          </select>
        </Field>
        <Field label="Buzón tributario">
          <select value={data.buzon_tributario||""} onChange={e=>save("buzon_tributario",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="activo">Activo — correo vigente</option>
            <option value="inactivo">Inactivo</option>
            <option value="sin_correo">Sin correo registrado</option>
          </select>
        </Field>
        <Field label="Correo registrado en SAT"><input style={s.input} value={data.correo_sat||""} onChange={e=>save("correo_sat",e.target.value)} placeholder="correo@empresa.com"/></Field>
        <Field label="Vencimiento e.firma"><input style={s.input} type="date" value={data.vencimiento_efirma||""} onChange={e=>save("vencimiento_efirma",e.target.value)}/></Field>
        <Field label="Vencimiento CSD principal"><input style={s.input} type="date" value={data.vencimiento_csd||""} onChange={e=>save("vencimiento_csd",e.target.value)}/></Field>
        <Field label="Declaraciones mensuales">
          <select value={data.declaraciones_mensuales||""} onChange={e=>save("declaraciones_mensuales",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="corriente">Al corriente</option>
            <option value="1_mes">1 mes de retraso</option>
            <option value="varios_meses">Varios meses de retraso</option>
          </select>
        </Field>
        <Field label="Declaración anual último ejercicio">
          <select value={data.declaracion_anual||""} onChange={e=>save("declaracion_anual",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="presentada">Presentada en tiempo</option>
            <option value="extemporanea">Presentada extemporáneamente</option>
            <option value="no_presentada">No presentada</option>
            <option value="en_proceso">En proceso</option>
          </select>
        </Field>
      </div>
      <Field label="Observaciones fiscales" fullWidth>
        <textarea style={{...s.input,...s.textarea}} value={data.observaciones||""} onChange={e=>save("observaciones",e.target.value)} placeholder="Situaciones especiales, notificaciones del SAT..."/>
      </Field>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}

export function ModF02({client}){
  const {data,save,saving}=useModData(client,"F-02");
  return(
    <div>
      <InfoBox>Control de facturación electrónica — CFDI 4.0, complementos, cancelaciones y carta porte.</InfoBox>
      <SectionTitle>Facturación</SectionTitle>
      <div style={s.grid2}>
        <Field label="Facturas emitidas mensual (promedio)"><input style={s.input} type="number" value={data.facturas_mensuales||""} onChange={e=>save("facturas_mensuales",e.target.value)} placeholder="0"/></Field>
        <Field label="Monto facturado anual (MXN)"><input style={s.input} type="number" value={data.monto_anual||""} onChange={e=>save("monto_anual",e.target.value)} placeholder="0"/></Field>
        <Field label="Versión CFDI">
          <select value={data.version_cfdi||""} onChange={e=>save("version_cfdi",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="4.0">4.0 — obligatoria</option>
            <option value="mixto">Mixto — en transición</option>
            <option value="anterior">Versión anterior — irregular</option>
          </select>
        </Field>
        <Field label="PAC utilizado"><input style={s.input} value={data.pac||""} onChange={e=>save("pac",e.target.value)} placeholder="Nombre del PAC"/></Field>
        <Field label="Complemento de nómina">
          <select value={data.complemento_nomina||""} onChange={e=>save("complemento_nomina",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="1.2_correcto">1.2 — correcto y vigente</option>
            <option value="incorrecto">Incorrecto</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </Field>
        <Field label="Carta porte">
          <select value={data.carta_porte||""} onChange={e=>save("carta_porte",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="implementada">Implementada correctamente</option>
            <option value="no_aplica">No aplica — sin traslados</option>
            <option value="requerida_no_implementada">Requerida pero no implementada</option>
          </select>
        </Field>
      </div>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}

export function ModF03({client}){
  const {data,save,saving}=useModData(client,"F-03");
  const [auditorias,setAuditorias]=useState([]);
  useEffect(()=>{if(data.auditorias)setAuditorias(data.auditorias);},[data.auditorias]);
  function addAuditoria(){
    const nueva={id:Date.now(),tipo:"",ejercicio:"",estatus:"activa",monto_contingente:"",fecha_notificacion:"",descripcion:""};
    const updated=[...auditorias,nueva];setAuditorias(updated);save("auditorias",updated);
  }
  function updateAuditoria(id,field,val){
    const updated=auditorias.map(a=>a.id===id?{...a,[field]:val}:a);setAuditorias(updated);save("auditorias",updated);
  }
  function removeAuditoria(id){
    const updated=auditorias.filter(a=>a.id!==id);setAuditorias(updated);save("auditorias",updated);
  }
  return(
    <div>
      <InfoBox>Control de auditorías, revisiones del SAT, créditos fiscales y estrategia de defensa fiscal.</InfoBox>
      <SectionTitle>Representación fiscal</SectionTitle>
      <div style={s.grid2}>
        <Field label="Asesor fiscal designado"><input style={s.input} value={data.asesor_fiscal||""} onChange={e=>save("asesor_fiscal",e.target.value)} placeholder="Nombre o firma"/></Field>
        <Field label="Poder notarial vigente">
          <select value={data.poder_representacion||""} onChange={e=>save("poder_representacion",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — vigente</option>
            <option value="no">No</option>
            <option value="vencido">Vencido</option>
          </select>
        </Field>
        <Field label="Provisión contable del contingente">
          <select value={data.provision_contable||""} onChange={e=>save("provision_contable",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="registrada">Registrada correctamente</option>
            <option value="parcial">Parcialmente registrada</option>
            <option value="no_registrada">No registrada</option>
            <option value="na">Sin contingente activo</option>
          </select>
        </Field>
        <Field label="PRODECON notificado">
          <select value={data.prodecon||""} onChange={e=>save("prodecon",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — activo</option>
            <option value="no">No</option>
            <option value="na">No aplica</option>
          </select>
        </Field>
      </div>
      <SectionTitle>Auditorías y revisiones activas</SectionTitle>
      {auditorias.map((a,i)=>(
        <div key={a.id} style={{...s.card,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:12,fontFamily:"Georgia,serif",color:TEXT_DARK}}>Proceso #{i+1}</span>
            <button onClick={()=>removeAuditoria(a.id)} style={{fontSize:11,padding:"2px 8px",border:"1px solid #fecaca",borderRadius:2,background:"none",cursor:"pointer",color:"#dc2626",fontFamily:"system-ui,sans-serif"}}>× Eliminar</button>
          </div>
          <div style={s.grid2}>
            <Field label="Tipo">
              <select value={a.tipo||""} onChange={e=>updateAuditoria(a.id,"tipo",e.target.value)} style={{...s.input,cursor:"pointer"}}>
                <option value="">Seleccionar...</option>
                <option value="auditoria">Auditoría fiscal</option>
                <option value="revision_electronica">Revisión electrónica</option>
                <option value="requerimiento">Requerimiento de información</option>
                <option value="credito_fiscal">Crédito fiscal determinado</option>
                <option value="recurso_revocacion">Recurso de revocación</option>
                <option value="juicio_nulidad">Juicio de nulidad TFJA</option>
                <option value="amparo">Amparo</option>
              </select>
            </Field>
            <Field label="Ejercicio revisado"><input style={s.input} value={a.ejercicio||""} onChange={e=>updateAuditoria(a.id,"ejercicio",e.target.value)} placeholder="ej. 2023"/></Field>
            <Field label="Estatus">
              <select value={a.estatus||""} onChange={e=>updateAuditoria(a.id,"estatus",e.target.value)} style={{...s.input,cursor:"pointer"}}>
                <option value="">Seleccionar...</option>
                <option value="activa">Activa — en proceso</option>
                <option value="contestada">Contestada — esperando resolución</option>
                <option value="resuelta_favorable">Resuelta — favorable</option>
                <option value="resuelta_adversa">Resuelta — adversa</option>
                <option value="pagada">Pagada</option>
              </select>
            </Field>
            <Field label="Monto contingente (MXN)"><input style={s.input} type="number" value={a.monto_contingente||""} onChange={e=>updateAuditoria(a.id,"monto_contingente",e.target.value)} placeholder="0"/></Field>
            <Field label="Fecha notificación"><input style={s.input} type="date" value={a.fecha_notificacion||""} onChange={e=>updateAuditoria(a.id,"fecha_notificacion",e.target.value)}/></Field>
            <Field label="Próximo plazo crítico"><input style={s.input} type="date" value={a.proximo_plazo||""} onChange={e=>updateAuditoria(a.id,"proximo_plazo",e.target.value)}/></Field>
            <Field label="Descripción" fullWidth><textarea style={{...s.input,...s.textarea}} value={a.descripcion||""} onChange={e=>updateAuditoria(a.id,"descripcion",e.target.value)} placeholder="Concepto revisado, argumentos, estado actual..."/></Field>
          </div>
        </div>
      ))}
      <button onClick={addAuditoria} style={{fontSize:12,padding:"7px 14px",border:"1px dashed "+BORDER,borderRadius:3,background:"none",cursor:"pointer",color:MUSGO,fontFamily:"system-ui,sans-serif",marginBottom:16,width:"100%"}}>+ Agregar proceso fiscal</button>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}

export function ModF04({client}){
  const {data,save,saving}=useModData(client,"F-04");
  return(
    <div>
      <InfoBox>Documentación de operaciones con partes relacionadas. Obligatorio para grupos con operaciones intercompany.</InfoBox>
      <SectionTitle>Partes relacionadas</SectionTitle>
      <div style={s.grid2}>
        <Field label="Tiene partes relacionadas">
          <select value={data.tiene_partes_relacionadas||""} onChange={e=>save("tiene_partes_relacionadas",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si_nacionales">Sí — nacionales</option>
            <option value="si_extranjeras">Sí — extranjeras</option>
            <option value="si_ambas">Sí — nacionales y extranjeras</option>
            <option value="no">No aplica</option>
          </select>
        </Field>
        <Field label="Número de partes relacionadas"><input style={s.input} type="number" value={data.num_partes_relacionadas||""} onChange={e=>save("num_partes_relacionadas",e.target.value)} placeholder="0"/></Field>
        <Field label="Monto total operaciones intercompany (MXN)"><input style={s.input} type="number" value={data.monto_intercompany||""} onChange={e=>save("monto_intercompany",e.target.value)} placeholder="0"/></Field>
        <Field label="Estudio de PT vigente">
          <select value={data.estudio_pt||""} onChange={e=>save("estudio_pt",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="vigente">Vigente — ejercicio actual</option>
            <option value="año_anterior">Año anterior — pendiente actualizar</option>
            <option value="no_tiene">No tiene</option>
          </select>
        </Field>
        <Field label="Contratos intercompany firmados">
          <select value={data.contratos_intercompany||""} onChange={e=>save("contratos_intercompany",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="todos">Todos firmados y vigentes</option>
            <option value="parcial">Parcialmente firmados</option>
            <option value="ninguno">Sin contratos formalizados</option>
          </select>
        </Field>
        <Field label="DIM Anexo 9 presentado">
          <select value={data.dim_anexo9||""} onChange={e=>save("dim_anexo9",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — en tiempo</option>
            <option value="extemporanea">Extemporánea</option>
            <option value="no">No presentada</option>
            <option value="na">No aplica</option>
          </select>
        </Field>
      </div>
      <Field label="Tipos de operaciones intercompany">
        <textarea style={{...s.input,...s.textarea}} value={data.tipos_operaciones||""} onChange={e=>save("tipos_operaciones",e.target.value)} placeholder="Servicios administrativos, préstamos, regalías, compraventa de bienes..."/>
      </Field>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}

export function ModF05({client}){
  const {data,save,saving}=useModData(client,"F-05");
  return(
    <div>
      <InfoBox>Control de CUFIN, CUCA y distribuciones a socios. Una distribución en exceso de la CUFIN genera ISR adicional del 30%.</InfoBox>
      <SectionTitle>CUFIN y CUCA</SectionTitle>
      <div style={s.grid2}>
        <Field label="Saldo CUFIN al cierre último ejercicio (MXN)"><input style={s.input} type="number" value={data.saldo_cufin||""} onChange={e=>save("saldo_cufin",e.target.value)} placeholder="0"/></Field>
        <Field label="CUFIN actualizada">
          <select value={data.cufin_actualizada||""} onChange={e=>save("cufin_actualizada",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — actualizada</option>
            <option value="no">No actualizada</option>
            <option value="no_aplica">No aplica — empresa nueva</option>
          </select>
        </Field>
        <Field label="Capital social actual (MXN)"><input style={s.input} type="number" value={data.capital_social||""} onChange={e=>save("capital_social",e.target.value)} placeholder="0"/></Field>
        <Field label="Dividendos distribuidos en el año">
          <select value={data.dividendos_distribuidos||""} onChange={e=>save("dividendos_distribuidos",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — distribuidos</option>
            <option value="no">No — no se distribuyó</option>
          </select>
        </Field>
        <Field label="Monto distribuido (MXN)"><input style={s.input} type="number" value={data.monto_distribuido||""} onChange={e=>save("monto_distribuido",e.target.value)} placeholder="0"/></Field>
        <Field label="Distribución dentro de CUFIN">
          <select value={data.dentro_cufin||""} onChange={e=>save("dentro_cufin",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — dentro de CUFIN</option>
            <option value="exceso">En exceso de CUFIN — riesgo</option>
            <option value="no_verificado">No verificado</option>
          </select>
        </Field>
        <Field label="Retención 10% ISR a PF">
          <select value={data.retencion_10||""} onChange={e=>save("retencion_10",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="aplicada">Aplicada correctamente</option>
            <option value="no_aplicada">No aplicada — riesgo</option>
            <option value="na">No aplica — solo socios PM</option>
          </select>
        </Field>
        <Field label="CFDI de dividendos emitidos">
          <select value={data.cfdi_dividendos||""} onChange={e=>save("cfdi_dividendos",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — emitidos correctamente</option>
            <option value="no">No emitidos</option>
            <option value="na">No aplica</option>
          </select>
        </Field>
      </div>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}

export function ModF06({client}){
  const {data,save,saving}=useModData(client,"F-06");
  return(
    <div>
      <InfoBox>Documentación y control de deducciones autorizadas. El SAT rechaza deducciones sin CFDI correcto o sin estricta indispensabilidad.</InfoBox>
      <SectionTitle>Nómina y PTU</SectionTitle>
      <div style={s.grid2}>
        <Field label="Nómina timbrada al corriente">
          <select value={data.nomina_timbrada||""} onChange={e=>save("nomina_timbrada",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="100">100% — todos los trabajadores</option>
            <option value="parcial">Parcialmente timbrada</option>
            <option value="no">No timbrada — irregular</option>
          </select>
        </Field>
        <Field label="PTU del último ejercicio pagada">
          <select value={data.ptu_pagada||""} onChange={e=>save("ptu_pagada",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — pagada en tiempo (mayo)</option>
            <option value="extemporanea">Pagada extemporáneamente</option>
            <option value="no">No pagada</option>
            <option value="na">No aplica — sin utilidades</option>
          </select>
        </Field>
        <Field label="Monto PTU último ejercicio (MXN)"><input style={s.input} type="number" value={data.monto_ptu||""} onChange={e=>save("monto_ptu",e.target.value)} placeholder="0"/></Field>
        <Field label="Política de gastos deducibles">
          <select value={data.politica_gastos||""} onChange={e=>save("politica_gastos",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — documentada y aplicada</option>
            <option value="informal">Informal — sin política escrita</option>
            <option value="no">No existe</option>
          </select>
        </Field>
        <Field label="Depreciaciones — método">
          <select value={data.metodo_depreciacion||""} onChange={e=>save("metodo_depreciacion",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="linea_recta">Línea recta — estándar</option>
            <option value="tasas_especiales">Tasas especiales LISR</option>
            <option value="deduccion_inmediata">Deducción inmediata</option>
            <option value="no_aplica">Sin activos fijos significativos</option>
          </select>
        </Field>
        <Field label="Donativos a donatarias autorizadas">
          <select value={data.donativos||""} onChange={e=>save("donativos",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — con comprobantes</option>
            <option value="no">No se realizan donativos</option>
            <option value="sin_comprobante">Sí — sin comprobante fiscal</option>
          </select>
        </Field>
      </div>
      <Field label="Observaciones deducciones">
        <textarea style={{...s.input,...s.textarea}} value={data.obs_deducciones||""} onChange={e=>save("obs_deducciones",e.target.value)} placeholder="Gastos no deducibles relevantes, ajustes pendientes..."/>
      </Field>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}

export function ModF07({client}){
  const {data,save,saving}=useModData(client,"F-07");
  return(
    <div>
      <InfoBox>Control del IVA — declaraciones, acreditamiento, DIOT y operaciones especiales como exportaciones y zona fronteriza.</InfoBox>
      <SectionTitle>Perfil IVA</SectionTitle>
      <div style={s.grid2}>
        <Field label="Tasa IVA aplicable">
          <select value={data.tasa_iva||""} onChange={e=>save("tasa_iva",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="16">16% — tasa general</option>
            <option value="0">0% — exportaciones</option>
            <option value="exento">Exento de IVA</option>
            <option value="mixto">Mixto — varias tasas</option>
          </select>
        </Field>
        <Field label="Zona fronteriza (8%)">
          <select value={data.zona_fronteriza||""} onChange={e=>save("zona_fronteriza",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — aplica tasa reducida</option>
            <option value="no">No aplica</option>
          </select>
        </Field>
        <Field label="IVA mensual promedio pagado (MXN)"><input style={s.input} type="number" value={data.iva_promedio||""} onChange={e=>save("iva_promedio",e.target.value)} placeholder="0"/></Field>
        <Field label="Saldo a favor IVA (MXN)"><input style={s.input} type="number" value={data.saldo_favor_iva||""} onChange={e=>save("saldo_favor_iva",e.target.value)} placeholder="0"/></Field>
        <Field label="Declaraciones IVA al corriente">
          <select value={data.declaraciones_iva||""} onChange={e=>save("declaraciones_iva",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="corriente">Al corriente</option>
            <option value="retraso">Con retraso</option>
            <option value="pendientes">Varios meses pendientes</option>
          </select>
        </Field>
        <Field label="DIOT presentada mensualmente">
          <select value={data.diot||""} onChange={e=>save("diot",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="corriente">Al corriente</option>
            <option value="retraso">Con retraso</option>
            <option value="no_presenta">No se presenta</option>
          </select>
        </Field>
        <Field label="IVA retenido enterado">
          <select value={data.iva_retenido||""} onChange={e=>save("iva_retenido",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — enterado en tiempo</option>
            <option value="no">No enterado</option>
            <option value="na">No aplica</option>
          </select>
        </Field>
        <Field label="% actividades exentas del total"><input style={s.input} type="number" value={data.pct_exentas||""} onChange={e=>save("pct_exentas",e.target.value)} placeholder="0-100"/></Field>
      </div>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}

export function ModF08({client}){
  const {data,save,saving}=useModData(client,"F-08");
  return(
    <div>
      <InfoBox>Control de retenciones de ISR a trabajadores, honorarios y arrendamiento. La empresa es responsable solidaria por retenciones no enteradas.</InfoBox>
      <SectionTitle>Retenciones por tipo</SectionTitle>
      <div style={s.grid2}>
        <Field label="ISR sueldos y salarios">
          <select value={data.retencion_salarios||""} onChange={e=>save("retencion_salarios",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="correcto">Calculado y enterado correctamente</option>
            <option value="error_calculo">Error en cálculo</option>
            <option value="no_enterado">No enterado</option>
          </select>
        </Field>
        <Field label="ISR honorarios (personas físicas)">
          <select value={data.retencion_honorarios||""} onChange={e=>save("retencion_honorarios",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="10_correcto">10% — aplicado correctamente</option>
            <option value="no_retiene">No se retiene — riesgo</option>
            <option value="na">No aplica</option>
          </select>
        </Field>
        <Field label="ISR arrendamiento">
          <select value={data.retencion_arrendamiento||""} onChange={e=>save("retencion_arrendamiento",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="10_correcto">10% — aplicado correctamente</option>
            <option value="no_retiene">No se retiene</option>
            <option value="na">No aplica</option>
          </select>
        </Field>
        <Field label="Declaraciones retenciones al corriente">
          <select value={data.declaraciones_retenciones||""} onChange={e=>save("declaraciones_retenciones",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="corriente">Al corriente</option>
            <option value="retraso">Con retraso</option>
            <option value="pendientes">Varios meses pendientes</option>
          </select>
        </Field>
        <Field label="Constancias de retención emitidas">
          <select value={data.constancias_emitidas||""} onChange={e=>save("constancias_emitidas",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — emitidas a todos</option>
            <option value="parcial">Parcialmente</option>
            <option value="no">No emitidas</option>
          </select>
        </Field>
        <Field label="Número de trabajadores en nómina"><input style={s.input} type="number" value={data.num_trabajadores||""} onChange={e=>save("num_trabajadores",e.target.value)} placeholder="0"/></Field>
      </div>
      <Field label="Observaciones retenciones">
        <textarea style={{...s.input,...s.textarea}} value={data.obs_retenciones||""} onChange={e=>save("obs_retenciones",e.target.value)} placeholder="Situaciones especiales, trabajadores extranjeros, retenciones en disputa..."/>
      </Field>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}
