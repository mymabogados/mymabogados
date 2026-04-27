import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const GOLD = "#C9A84C";
const MUSGO = "#4A5C45";
const GRAY = "#7A9070";
const BORDER = "#DDE4D8";
const TEXT_DARK = "#1E2B1A";
const WHITE = "#FAFCF8";
const RED = "#C0392B";
const GREEN = "#5A8A3C";

function useModData(client, mod){
  const [data, setData] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const socId = client._sociedad?.id || null;
  React.useEffect(()=>{
    const q = socId
      ? supabase.from("modulos_data").select("datos").eq("client_id", client.id).eq("modulo", mod).eq("sociedad_id", socId).single()
      : supabase.from("modulos_data").select("datos").eq("client_id", client.id).eq("modulo", mod).is("sociedad_id", null).single();
    q.then(({data:d})=>{ if(d?.datos) setData(d.datos); });
  }, [client.id, mod, socId]);
  async function save(key, val){
    const newData = {...data, [key]: val};
    setData(newData);
    setSaving(true);
    const socVal = socId || null;
    const {data:existing} = socVal
      ? await supabase.from("modulos_data").select("id").eq("client_id", client.id).eq("modulo", mod).eq("sociedad_id", socVal).single()
      : await supabase.from("modulos_data").select("id").eq("client_id", client.id).eq("modulo", mod).is("sociedad_id", null).single();
    if(existing?.id){
      await supabase.from("modulos_data").update({datos: newData}).eq("id", existing.id);
    } else {
      await supabase.from("modulos_data").insert({client_id: client.id, modulo: mod, sociedad_id: socVal, datos: newData});
    }
    setSaving(false);
  }
  return {data, save, saving};
}


function Spinner(){return <div style={{textAlign:"center",padding:"2rem",color:GRAY,fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;}

function Badge({status,label}){
  const map={
    vigente:["#f0fdf4","#166534"],vencido:["#fef2f2","#991b1b"],
    "por renovar":["#fffbeb","#92400e"],pendiente:["#fffbeb","#92400e"],
    green:["#f0fdf4","#166534"],red:["#fef2f2","#991b1b"],amber:["#fffbeb","#92400e"],
    critico:["#fef2f2","#991b1b"],alto:["#fff7ed","#9a3412"],
    medio:["#fffbeb","#92400e"],bajo:["#f0fdf4","#166534"],
  };
  const [bg,color]=map[status]||["#f3f4f6","#374151"];
  return <span style={{fontSize:10,padding:"2px 8px",borderRadius:2,background:bg,color,whiteSpace:"nowrap",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>{label||status}</span>;
}

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
  scoreCard:{background:"#FAFCF8",border:"1px solid "+BORDER,borderRadius:4,padding:".75rem .8rem",textAlign:"center",flex:1},
  label:{fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:6,display:"block"},
  input:{fontSize:12,padding:"7px 10px",border:"1px solid "+BORDER,borderRadius:3,fontFamily:"system-ui,sans-serif",background:WHITE,color:TEXT_DARK,width:"100%",boxSizing:"border-box"},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  dot:st=>({width:8,height:8,borderRadius:"50%",background:st==="vigente"?GREEN:st==="vencido"?RED:GOLD,flexShrink:0,display:"inline-block",marginRight:6}),
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCS CATALOG
// ─────────────────────────────────────────────────────────────────────────────
export const MIGRATORIO_DOCS = {
  "M-01": {
    docs: [
      {id:"registro_empleador_inm",label:"Constancia de Registro como Empleador ante el INM",requerido:true,desc:"Número de registro de empleador habitual — trámite previo a contratar extranjeros"},
      {id:"fm3_residente_temporal",label:"Tarjeta de Residente Temporal con permiso de trabajo",requerido:true,desc:"Por cada trabajador extranjero — vigencia 1 a 4 años renovable"},
      {id:"oferta_trabajo_validada",label:"Oferta de trabajo validada por INM",requerido:true,desc:"Documento previo al trámite de visa — firmado por representante legal"},
      {id:"contrato_laboral_extranjero",label:"Contrato individual de trabajo del extranjero",requerido:true,desc:"En español — con todas las prestaciones de LFT — firmado y apostillado"},
      {id:"apostilla_documentos",label:"Documentos personales del extranjero apostillados",requerido:true,desc:"Título, acta de nacimiento, antecedentes penales, pasaporte vigente"},
      {id:"aviso_contratacion_inm",label:"Acuse de aviso de contratación ante el INM",requerido:true,desc:"Dentro de los 15 días hábiles de inicio de relación laboral"},
      {id:"aviso_baja_inm",label:"Acuse de aviso de baja ante el INM",requerido:false,desc:"Al término de la relación laboral — 15 días hábiles — con acuse"},
      {id:"curp_extranjero",label:"CURP del trabajador extranjero",requerido:true,desc:"Trámite ante RENAPO — requerido para IMSS y nómina"},
      {id:"alta_imss_extranjero",label:"Aviso de alta en el IMSS del trabajador extranjero",requerido:true,desc:"Dentro de los 5 días de inicio — con número de afiliación IMSS"},
      {id:"rfc_extranjero_fisico",label:"RFC del trabajador extranjero",requerido:true,desc:"Trámite ante el SAT — requerido para timbrar nómina"},
      {id:"descripcion_puesto_inm",label:"Descripción detallada del puesto para el INM",requerido:true,desc:"Justifica la necesidad del trabajador extranjero — con organigrama"},
      {id:"comprobante_actividad",label:"Comprobante de que la actividad corresponde al permiso",requerido:true,desc:"Descripción del puesto vs. permiso migratorio — deben coincidir exactamente"},
    ],
    checklist: [
      {id:"registro_empleador_vigente",label:"Empresa registrada como empleador habitual ante el INM",riesgo:"critico"},
      {id:"documentos_migratorios_vigentes",label:"Documentos migratorios vigentes para todos los extranjeros activos",riesgo:"critico"},
      {id:"aviso_contratacion_15dias",label:"Aviso de contratación presentado al INM dentro de 15 días hábiles",riesgo:"critico"},
      {id:"actividad_corresponde_permiso",label:"Actividad laboral corresponde exactamente al permiso migratorio",riesgo:"critico"},
      {id:"imss_alta_todos",label:"100% de extranjeros dados de alta en IMSS",riesgo:"critico"},
      {id:"curp_todos",label:"CURP tramitado para todos los trabajadores extranjeros",riesgo:"alto"},
      {id:"rfc_todos",label:"RFC tramitado para todos los trabajadores extranjeros",riesgo:"alto"},
      {id:"nomina_timbrada_extranjeros",label:"Nómina timbrada con CFDI para extranjeros",riesgo:"alto"},
      {id:"renovaciones_90dias",label:"Renovaciones iniciadas con 90 días de anticipación al vencimiento",riesgo:"critico"},
      {id:"expedientes_actualizados",label:"Expediente migratorio individualizado por cada extranjero actualizado",riesgo:"alto"},
      {id:"bajas_notificadas",label:"Bajas notificadas al INM dentro de 15 días del término",riesgo:"alto"},
      {id:"cambios_notificados",label:"Cambios de domicilio, empleador o condición notificados al INM",riesgo:"alto"},
      {id:"protocolo_verificacion",label:"Protocolo de acción ante verificación migratoria documentado",riesgo:"alto"},
      {id:"contrato_ley_completo",label:"Contratos laborales con todas las prestaciones de LFT",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Extranjero trabajando con documento migratorio vencido",impacto:"Multa al empleador de $2,000 a $5,000 UMAs (~$200,000 a $500,000 MXN) + deportación del trabajador + inhabilitación del empleador",nivel:"critico"},
      {label:"Actividad diferente al permiso migratorio autorizado",impacto:"Cancelación del permiso migratorio + aseguramiento del extranjero + multa al empleador",nivel:"critico"},
      {label:"Sin registro como empleador habitual ante INM",impacto:"Imposibilidad de tramitar visas + multa por cada extranjero contratado sin el registro",nivel:"critico"},
      {label:"Omisión del aviso de contratación al INM",impacto:"Multa de $500 a $1,000 UMAs por trabajador + responsabilidad solidaria del empleador",nivel:"alto"},
      {label:"Extranjero sin alta en IMSS",impacto:"Crédito IMSS por cuotas omitidas + recargos + multas — responsabilidad solidaria del empleador",nivel:"critico"},
      {label:"RFC sin tramitar — nómina no timbrada",impacto:"CFDI de nómina inválido + multa SAT por no timbrar + ISR no retenido ni enterado",nivel:"alto"},
    ]
  },
  "M-02": {
    docs: [
      {id:"carta_asignacion_intracompany",label:"Carta de asignación intracompañía",requerido:true,desc:"Emitida por la empresa origen — con duración, puesto, condiciones y retorno"},
      {id:"visa_intracompany",label:"Tarjeta de Residente Temporal — transferencia intracompañía",requerido:true,desc:"Categoría específica: directivo, gerente o personal con conocimiento especializado"},
      {id:"comprobante_relacion_corporativa",label:"Documentos que acreditan relación corporativa entre empresas",requerido:true,desc:"Escrituras, actas de asamblea, estados financieros consolidados — grupo corporativo"},
      {id:"historial_laboral_origen",label:"Constancia de antigüedad mínima de 1 año en empresa origen",requerido:true,desc:"Carta firmada por RH de la empresa origen — con fechas, puesto y funciones"},
      {id:"descripcion_puesto_especializado",label:"Descripción detallada del puesto especializado o directivo",requerido:true,desc:"Justifica por qué el cargo califica como transferencia intracompañía — debe ser técnico o directivo"},
      {id:"organigramas_ambas_empresas",label:"Organigramas de empresa origen y destino",requerido:true,desc:"Mostrando la posición del trabajador en ambas estructuras"},
      {id:"analisis_split_payroll",label:"Análisis de split payroll y estructuración",requerido:true,desc:"Proporción de salario pagado en origen vs. México — con fundamento en CDT aplicable"},
      {id:"convenio_seguridad_social",label:"Análisis de convenio de seguridad social bilateral",requerido:false,desc:"Si existe CDT con el país de origen — determina si hay exención de IMSS"},
      {id:"certificado_cobertura_ss",label:"Certificado de cobertura de seguridad social en país origen",requerido:false,desc:"Acredita que el trabajador sigue cubierto por el sistema de origen"},
      {id:"contrato_servicio_intercompany",label:"Contrato de servicios o préstamo de personal intercompany",requerido:true,desc:"Entre la empresa origen y la empresa mexicana — justifica el pago del salario"},
      {id:"analisis_pe_riesgo",label:"Análisis de riesgo de establecimiento permanente",requerido:true,desc:"Dictamen legal sobre si la asignación genera PE en México para la empresa extranjera"},
    ],
    checklist: [
      {id:"relacion_corporativa_documentada",label:"Relación corporativa entre empresa origen y México formalmente documentada",riesgo:"critico"},
      {id:"cargo_califica_transferencia",label:"Cargo califica como directivo, gerente o conocimiento especializado",riesgo:"critico"},
      {id:"un_ano_empresa_origen",label:"Trabajador con mínimo 1 año continuo en empresa del grupo",riesgo:"critico"},
      {id:"carta_asignacion_condiciones_claras",label:"Carta de asignación con duración, condiciones salariales y retorno definidos",riesgo:"alto"},
      {id:"split_payroll_estructurado",label:"Split payroll estructurado conforme a CDT aplicable",riesgo:"critico"},
      {id:"isr_ambos_paises_analizado",label:"Obligaciones ISR en ambos países analizadas y cubiertas",riesgo:"critico"},
      {id:"imss_o_exencion_documentada",label:"IMSS pagado o exención documentada con certificado de cobertura",riesgo:"critico"},
      {id:"pe_riesgo_analizado",label:"Riesgo de establecimiento permanente analizado y mitigado",riesgo:"critico"},
      {id:"contrato_intercompany_mercado",label:"Contrato intercompany de servicios a precio de mercado",riesgo:"alto"},
      {id:"retorno_documentado",label:"Condiciones de retorno al país de origen documentadas",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Split payroll sin estructurar — doble tributación",impacto:"ISR en México + ISR en país de origen + recargos — sin acreditamiento por falta de documentación",nivel:"critico"},
      {label:"Cargo no califica para transferencia intracompañía",impacto:"Rechazo de visa INM + trabajador sin autorización migratoria + sanción al empleador",nivel:"critico"},
      {label:"IMSS no pagado asumiendo cobertura del país origen",impacto:"Crédito IMSS por toda la antigüedad en México + recargos + responsabilidad solidaria",nivel:"critico"},
      {label:"Establecimiento permanente no declarado",impacto:"ISR sobre utilidades atribuibles + multa 55-75% del impuesto + posible responsabilidad penal fiscal",nivel:"critico"},
      {label:"Contrato intercompany sin precio de mercado",impacto:"Ajuste SAT por precios de transferencia + ISR omitido + multas",nivel:"alto"},
    ]
  },
  "M-03": {
    docs: [
      {id:"visa_actividades_lucrativas",label:"Tarjeta de Residente Temporal — actividades lucrativas",requerido:true,desc:"Para representantes de empresa extranjera percibiendo ingresos de fuente mexicana"},
      {id:"poder_notarial_apostillado",label:"Poder notarial apostillado de la empresa extranjera",requerido:true,desc:"Apostillado en el país de origen — acredita facultades del representante en México"},
      {id:"inscripcion_rppyc",label:"Inscripción de empresa extranjera en RPPyC",requerido:false,desc:"Art. 250 LGSM — obligatorio si opera habitualmente en México con establecimiento"},
      {id:"rfc_persona_fisica_ext",label:"RFC de la persona física extranjera",requerido:true,desc:"SAT — requerido si percibe ingresos de fuente de riqueza ubicada en México"},
      {id:"contrato_representacion_agencia",label:"Contrato de representación o agencia mercantil",requerido:false,desc:"Con empresa mexicana — define el alcance de la representación y comisiones"},
      {id:"analisis_cdt_representante",label:"Análisis del CDT aplicable al representante",requerido:true,desc:"Convenio para evitar doble tributación entre México y país de origen — artículo aplicable"},
      {id:"analisis_pe_representante",label:"Dictamen de riesgo de establecimiento permanente",requerido:true,desc:"Análisis específico sobre si el representante genera PE para la empresa extranjera"},
      {id:"retencion_isr_no_residente",label:"Análisis de retención ISR para no residentes",requerido:true,desc:"Tasa aplicable según CDT o LISR — art. 153-175 LISR — según tipo de ingreso"},
      {id:"forma_13_sat",label:"Forma 13 SAT — constancia de retenciones",requerido:false,desc:"Si la empresa mexicana retiene ISR al representante extranjero"},
    ],
    checklist: [
      {id:"visa_correcta_actividad",label:"Visa corresponde exactamente a la actividad de representación",riesgo:"critico"},
      {id:"poder_vigente_apostillado",label:"Poder notarial vigente, apostillado y con facultades suficientes",riesgo:"critico"},
      {id:"rfc_tramitado_representante",label:"RFC tramitado si percibe ingresos de fuente mexicana",riesgo:"alto"},
      {id:"pe_analizado_mitigado",label:"Riesgo de establecimiento permanente analizado y mitigado contractualmente",riesgo:"critico"},
      {id:"cdt_aplicado",label:"CDT aplicado correctamente — tasa reducida o exención documentada",riesgo:"alto"},
      {id:"isr_retenido_correcto",label:"ISR retenido y enterado correctamente según tipo de ingreso",riesgo:"critico"},
      {id:"inscripcion_rppyc_analizada",label:"Necesidad de inscripción en RPPyC analizada y documentada",riesgo:"alto"},
      {id:"actividad_no_excede_permiso",label:"Actividad del representante no excede el permiso migratorio",riesgo:"critico"},
      {id:"tiempo_permanencia_controlado",label:"Tiempo de permanencia en México controlado — regla 183 días",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Establecimiento permanente no declarado por empresa extranjera",impacto:"ISR sobre 100% de utilidades atribuibles + multa 55-75% + responsabilidad penal fiscal del representante",nivel:"critico"},
      {label:"Representante sin visa de actividades lucrativas",impacto:"Deportación + sanción al empleador o empresa receptora + clausura temporal de actividades",nivel:"critico"},
      {label:"ISR no retenido a no residente",impacto:"Empresa mexicana responsable solidaria del ISR omitido + actualización + recargos + multas",nivel:"critico"},
      {label:"Empresa extranjera operando sin inscripción RPPyC",impacto:"Contratos celebrados por el representante impugnables + imposibilidad de litigar en México",nivel:"alto"},
      {label:"CDT no aplicado — pago doble de impuestos",impacto:"Sobrecosto fiscal significativo — recuperación compleja vía devolución",nivel:"alto"},
    ]
  },
  "M-04": {
    docs: [
      {id:"registro_empleador_constancia",label:"Constancia de registro como empleador habitual de extranjeros",requerido:true,desc:"INM — registro previo obligatorio para contratar extranjeros de forma habitual"},
      {id:"padron_extranjeros",label:"Padrón actualizado de trabajadores extranjeros",requerido:true,desc:"Nombre, nacionalidad, número de expediente INM, tipo de permiso, vencimiento"},
      {id:"avisos_contratacion_acuse",label:"Acuses de avisos de contratación presentados al INM",requerido:true,desc:"Archivo cronológico — por cada extranjero contratado — con sello INM"},
      {id:"avisos_baja_acuse",label:"Acuses de avisos de baja presentados al INM",requerido:true,desc:"Al término de cada relación laboral — archivo histórico"},
      {id:"avisos_cambio_acuse",label:"Acuses de avisos de cambio de condición",requerido:false,desc:"Cambio de domicilio, empleador, cargo o salario — 15 días hábiles"},
      {id:"calendario_vencimientos",label:"Calendario de vencimientos migratorios",requerido:true,desc:"Por cada extranjero — con alertas a 90, 60 y 30 días"},
      {id:"expedientes_individuales",label:"Expedientes migratorios individuales completos",requerido:true,desc:"Por cada extranjero activo — copia de todos los documentos migratorios"},
      {id:"protocolo_verificacion_migratoria",label:"Protocolo escrito ante verificación migratoria del INM",requerido:true,desc:"Quién recibe al inspector, qué documentos presentar, a quién llamar — incluyendo al despacho"},
      {id:"manuales_extranjeros",label:"Manual de obligaciones para trabajadores extranjeros",requerido:false,desc:"Qué hacer y qué no hacer en México — salidas, cambios de domicilio, renovaciones"},
      {id:"historial_multas_inm",label:"Historial de multas o apercibimientos del INM",requerido:false,desc:"Registro de infracciones previas — para evaluar riesgo acumulado"},
    ],
    checklist: [
      {id:"registro_empleador_activo",label:"Registro de empleador habitual ante INM vigente y activo",riesgo:"critico"},
      {id:"padron_al_corriente",label:"Padrón de extranjeros al corriente — sin trabajadores sin expediente",riesgo:"critico"},
      {id:"avisos_en_15_dias",label:"Avisos de contratación presentados dentro de 15 días hábiles",riesgo:"critico"},
      {id:"bajas_en_tiempo",label:"Avisos de baja presentados en tiempo para todos los extranjeros terminados",riesgo:"alto"},
      {id:"cambios_notificados_inm",label:"Cambios de domicilio, cargo o empleador notificados en tiempo",riesgo:"alto"},
      {id:"calendario_activo",label:"Calendario de vencimientos activo con alertas configuradas",riesgo:"critico"},
      {id:"expedientes_completos",label:"Expedientes individuales completos y actualizados por cada extranjero",riesgo:"alto"},
      {id:"protocolo_verificacion_listo",label:"Protocolo de verificación migratoria conocido por RH y recepción",riesgo:"alto"},
      {id:"sin_extranjeros_vencidos",label:"Cero trabajadores extranjeros con documentos vencidos activos",riesgo:"critico"},
      {id:"coordinacion_despacho",label:"Coordinación activa con despacho para renovaciones y trámites",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Verificación migratoria con extranjeros sin documentos en orden",impacto:"Multa de $500 a $5,000 UMAs por trabajador + aseguramiento + deportación + cierre temporal",nivel:"critico"},
      {label:"Sin registro de empleador — contratación irregular de extranjeros",impacto:"Multa por cada extranjero + imposibilidad de tramitar visas futuras + inhabilitación",nivel:"critico"},
      {label:"Omisión de aviso de baja — extranjero sigue activo en sistema INM",impacto:"Responsabilidad del empleador por actividades del ex-empleado en México",nivel:"alto"},
      {label:"Sin protocolo de verificación — inspector sin atención adecuada",impacto:"Obstaculización de función pública + agravamiento de sanciones",nivel:"alto"},
    ]
  },
  "M-05": {
    docs: [
      {id:"analisis_residencia_fiscal",label:"Análisis de residencia fiscal por trabajador extranjero",requerido:true,desc:"Determina si es residente fiscal en México (183+ días) o no residente — impacta tasa ISR"},
      {id:"calculo_isr_extranjero",label:"Cálculo de ISR aplicable por trabajador",requerido:true,desc:"Residente fiscal: tasa tablas LISR. No residente: 15% o 30% según monto art. 152 LISR"},
      {id:"cdt_aplicable",label:"Análisis del CDT aplicable por nacionalidad",requerido:true,desc:"Convenio para evitar doble tributación — tasa reducida o exención — por cada extranjero"},
      {id:"constancia_residencia_fiscal_origen",label:"Constancia de residencia fiscal en país de origen",requerido:false,desc:"Requerida para aplicar beneficios del CDT — emitida por autoridad fiscal del país origen"},
      {id:"split_payroll_documentado",label:"Documentación del split payroll por trabajador",requerido:false,desc:"Porcentaje pagado en México vs. en el extranjero — con fundamento contractual y fiscal"},
      {id:"retencion_isr_nomina",label:"Cálculo de retención ISR en nómina para cada extranjero",requerido:true,desc:"CFDI de nómina con retención correcta — según condición migratoria y fiscal de cada uno"},
      {id:"imss_cuotas_extranjeros",label:"Análisis de obligaciones IMSS por extranjero",requerido:true,desc:"Si aplica convenio bilateral de SS — certificado de cobertura — o cuotas IMSS completas"},
      {id:"infonavit_extranjeros",label:"Análisis de obligación INFONAVIT para extranjeros",requerido:true,desc:"Extranjeros con permiso de trabajo también sujetos a INFONAVIT — salvo exención por CDT"},
      {id:"declaracion_anual_extranjero",label:"Análisis de obligación de declaración anual",requerido:false,desc:"Residente fiscal: mismas obligaciones que nacionales. No residente: solo retenciones"},
      {id:"carta_instruccion_rh",label:"Carta de instrucción a RH sobre tratamiento fiscal de cada extranjero",requerido:true,desc:"Documento interno que instruye a nómina el tratamiento específico por trabajador"},
    ],
    checklist: [
      {id:"residencia_fiscal_determinada",label:"Residencia fiscal determinada para cada extranjero activo",riesgo:"critico"},
      {id:"isr_tasa_correcta",label:"ISR calculado a la tasa correcta según residencia fiscal y CDT",riesgo:"critico"},
      {id:"cdt_aplicado_con_constancia",label:"CDT aplicado con constancia de residencia fiscal en el extranjero",riesgo:"alto"},
      {id:"split_payroll_documentado_check",label:"Split payroll documentado si el salario se paga en dos países",riesgo:"critico"},
      {id:"imss_correcto_por_trabajador",label:"IMSS calculado correctamente — con o sin convenio bilateral",riesgo:"critico"},
      {id:"infonavit_analizado",label:"Obligación INFONAVIT analizada por trabajador",riesgo:"alto"},
      {id:"cfdi_nomina_correcto",label:"CFDI de nómina timbrado correctamente para cada extranjero",riesgo:"critico"},
      {id:"dias_presencia_controlados",label:"Días de presencia en México controlados para regla 183 días",riesgo:"critico"},
      {id:"rh_instruido",label:"RH instruido por escrito sobre tratamiento de cada extranjero",riesgo:"alto"},
      {id:"revision_anual_condicion",label:"Revisión anual de condición fiscal al inicio de cada ejercicio",riesgo:"alto"},
    ],
    riesgos: [
      {label:"ISR calculado a tasa incorrecta — omisión de impuesto",impacto:"Empresa responsable solidaria del ISR omitido + actualización + recargos 1.47% mensual + multa 55-75%",nivel:"critico"},
      {label:"CDT no aplicado — pago de ISR que no correspondía",impacto:"Sobrepago de impuesto — recuperable via devolución pero complejo — costo financiero y administrativo",nivel:"alto"},
      {label:"Trabajador residente fiscal no declarando en México",impacto:"Omisión de ingresos mundiales + ISR omitido + multas + posible delito fiscal",nivel:"critico"},
      {label:"IMSS sin pagar por asumir cobertura extranjera sin convenio",impacto:"Crédito IMSS retroactivo + recargos + multas — responsabilidad solidaria del empleador",nivel:"critico"},
      {label:"Split payroll sin documentar — rechazo de deducción",impacto:"SAT rechaza deducción de sueldos pagados en el extranjero — ISR adicional para la empresa",nivel:"alto"},
      {label:"CFDI de nómina con datos incorrectos del extranjero",impacto:"Multa SAT por comprobante con datos incorrectos + nómina no deducible",nivel:"alto"},
    ]
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

// M-01 — Visas de Trabajo
export function ModM01({client}){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  const [extranjeros,setExtranjeros]=useState([]);
  const mod="M-01";

  useEffect(()=>{
    supabase.from("modulos_data").select("*").eq("client_id",client.id).eq("modulo",mod).is("sociedad_id",client._sociedad?.id||null).single()
      .then(({data:d})=>{ if(d) setData(d); });
    supabase.from("personas").select("*").eq("client_id",client.id).eq("nacionalidad_extranjera",true)
      .then(({data:d})=>{ setExtranjeros(d||[]); });
  },[client.id]);

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

  const proxVencer = extranjeros.filter(x=>{
    if(!x.visa_vencimiento) return false;
    const dias=Math.ceil((new Date(x.visa_vencimiento)-new Date())/(1000*60*60*24));
    return dias>=0 && dias<=90;
  });
  const vencidos = extranjeros.filter(x=>{
    if(!x.visa_vencimiento) return false;
    return Math.ceil((new Date(x.visa_vencimiento)-new Date())/(1000*60*60*24))<0;
  });

  return(
    <div>
      {/* Scorecard */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{...s.scoreCard}}><div style={{fontSize:26,color:MUSGO,fontFamily:"Georgia,serif"}}>{extranjeros.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Extranjeros activos</div></div>
        <div style={{...s.scoreCard}}><div style={{fontSize:26,color:vencidos.length>0?RED:GREEN,fontFamily:"Georgia,serif"}}>{vencidos.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Documentos vencidos</div></div>
        <div style={{...s.scoreCard}}><div style={{fontSize:26,color:proxVencer.length>0?GOLD:GREEN,fontFamily:"Georgia,serif"}}>{proxVencer.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Por vencer 90 días</div></div>
      </div>

      {/* Alertas críticas */}
      {vencidos.length>0&&<div style={{...s.card,borderLeft:"3px solid "+RED,marginBottom:12}}>
        <SectionTitle>⚠ Documentos vencidos — acción inmediata</SectionTitle>
        {vencidos.map(p=>(
          <div key={p.id} style={s.row}>
            <span style={s.dot("vencido")}/>
            <div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia,serif",color:TEXT_DARK}}>{p.nombre}</div><div style={s.muted}>{p.nacionalidad} · Venció: {p.visa_vencimiento}</div></div>
            <Badge status="red" label="VENCIDO"/>
          </div>
        ))}
      </div>}

      {proxVencer.length>0&&<div style={{...s.card,borderLeft:"3px solid "+GOLD,marginBottom:12}}>
        <SectionTitle>Renovaciones próximas — iniciar trámite ya</SectionTitle>
        {proxVencer.map(p=>{
          const dias=Math.ceil((new Date(p.visa_vencimiento)-new Date())/(1000*60*60*24));
          return(
            <div key={p.id} style={s.row}>
              <span style={s.dot("por renovar")}/>
              <div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia,serif",color:TEXT_DARK}}>{p.nombre}</div><div style={s.muted}>{p.nacionalidad} · Vence: {p.visa_vencimiento}</div></div>
              <Badge status={dias<=30?"red":"amber"} label={dias+" días"}/>
            </div>
          );
        })}
      </div>}

      {/* Datos del empleador */}
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Registro como Empleador ante el INM</SectionTitle>
        <InfoBox color="#F0FDF4" border="#BBF7D0">El <strong>Registro de Empleador Habitual de Extranjeros</strong> ante el INM es el primer trámite que debe realizar cualquier empresa antes de contratar trabajadores extranjeros. Sin este registro, los avisos de contratación no son válidos y cada contratación puede constituir una infracción independiente.</InfoBox>
        <div style={s.grid2}>
          <div>
            <span style={s.label}>Número de registro INM (empleador)</span>
            <input style={s.input} value={data.num_registro_empleador||""} onChange={e=>save("num_registro_empleador",e.target.value)} placeholder="Número asignado por el INM"/>
          </div>
          <div>
            <span style={s.label}>Fecha de obtención del registro</span>
            <input style={s.input} type="date" value={data.fecha_registro_empleador||""} onChange={e=>save("fecha_registro_empleador",e.target.value)}/>
          </div>
          <div>
            <span style={s.label}>Delegación INM competente</span>
            <input style={s.input} value={data.delegacion_inm||""} onChange={e=>save("delegacion_inm",e.target.value)} placeholder="Ej. Delegación CDMX"/>
          </div>
          <div>
            <span style={s.label}>Representante legal ante el INM</span>
            <input style={s.input} value={data.rep_legal_inm||""} onChange={e=>save("rep_legal_inm",e.target.value)} placeholder="Nombre del representante"/>
          </div>
          <div>
            <span style={s.label}>¿Registro vigente y actualizado?</span>
            <select style={s.input} value={data.registro_vigente||""} onChange={e=>save("registro_vigente",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="si">Sí — vigente</option>
              <option value="actualizar">Requiere actualización de datos</option>
              <option value="no">No tramitado</option>
            </select>
          </div>
          <div>
            <span style={s.label}>Número total de extranjeros histórico</span>
            <input style={s.input} type="number" value={data.total_historico_extranjeros||""} onChange={e=>save("total_historico_extranjeros",e.target.value)} placeholder="Acumulado desde inicio de operaciones"/>
          </div>
        </div>
      </div>

      {/* Tipos de visas activas */}
      <div style={s.card}>
        <SectionTitle>Tipos de Permisos Migratorios Activos en la Empresa</SectionTitle>
        <div style={s.grid2}>
          {[
            {field:"num_residente_temporal",label:"Residentes Temporales con permiso de trabajo",desc:"Vigencia 1-4 años"},
            {field:"num_residente_permanente",label:"Residentes Permanentes con permiso de trabajo",desc:"Vigencia indefinida"},
            {field:"num_intracompany",label:"Transferencias intracompañía",desc:"Art. 52 fracc. III LM"},
            {field:"num_inversionista",label:"Inversionistas y representantes",desc:"Actividades lucrativas"},
            {field:"num_distinguido",label:"Visitantes distinguidos",desc:"Sin permiso de trabajo"},
            {field:"num_otro_permiso",label:"Otro tipo de permiso",desc:"Especificar en notas"},
          ].map(f=>(
            <div key={f.field}>
              <span style={s.label}>{f.label}<br/><span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>{f.desc}</span></span>
              <input style={s.input} type="number" value={data[f.field]||""} onChange={e=>save(f.field,e.target.value)} placeholder="0"/>
            </div>
          ))}
        </div>
      </div>

      {/* Obligaciones INM */}
      <div style={s.card}>
        <SectionTitle>Plazos Legales — Obligaciones ante el INM</SectionTitle>
        {[
          {obligacion:"Aviso de contratación",plazo:"15 días hábiles desde inicio de la relación laboral",consecuencia:"Multa $500-$1,000 UMAs por omisión"},
          {obligacion:"Aviso de baja",plazo:"15 días hábiles desde el término de la relación",consecuencia:"Responsabilidad por actividades del ex-empleado"},
          {obligacion:"Aviso de cambio de domicilio del trabajador",plazo:"15 días hábiles desde el cambio",consecuencia:"Multa por omisión"},
          {obligacion:"Aviso de cambio de empleador",plazo:"15 días hábiles desde el cambio",consecuencia:"Permiso puede cancelarse si no se notifica"},
          {obligacion:"Inicio de trámite de renovación",plazo:"30 días antes del vencimiento (mínimo recomendado: 90 días)",consecuencia:"Si vence sin renovar: deportación del trabajador + multa al empleador"},
          {obligacion:"Actualización de registro de empleador",plazo:"Cuando cambian datos de la empresa (domicilio, rep. legal, giro)",consecuencia:"Avisos posteriores pueden ser inválidos"},
        ].map((x,i)=>(
          <div key={i} style={{padding:"10px 0",borderBottom:i<5?"1px solid "+BORDER:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{x.obligacion}</div>
                <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>Plazo: {x.plazo}</div>
              </div>
              <div style={{fontSize:10,color:RED,fontFamily:"system-ui,sans-serif",textAlign:"right",maxWidth:180}}>{x.consecuencia}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Notas operativas */}
      <div style={s.card}>
        <SectionTitle>Notas Operativas y Casos Activos</SectionTitle>
        <span style={s.label}>Situaciones especiales, trámites en proceso, instrucciones al cliente</span>
        <textarea style={{...s.input,minHeight:90,resize:"vertical"}} value={data.notas_operativas||""} onChange={e=>save("notas_operativas",e.target.value)} placeholder="Ej. Juan García — renovación en trámite expediente 2024-CDMX-0482 — entrega estimada 15 días. María López — aviso de baja pendiente de presentar antes del viernes..."/>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// M-02 — Transferencias Intracompañía
export function ModM02({client}){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  const mod="M-02";

  useEffect(()=>{
    supabase.from("modulos_data").select("*").eq("client_id",client.id).eq("modulo",mod).is("sociedad_id",client._sociedad?.id||null).single()
      .then(({data:d})=>{ if(d) setData(d); });
  },[client.id]);

  async function save(field,val){
    setSaving(true);
    const updated={...data,[field]:val};
    setData(updated);
    await supabase.from("modulos_data").upsert({client_id:client.id,modulo:mod,sociedad_id:client._sociedad?.id||null,data:updated,updated_at:new Date().toISOString()},{onConflict:"client_id,modulo,sociedad_id"});
    setSaving(false);
  }

  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Estructura Corporativa para Transferencias Intracompañía</SectionTitle>
        <InfoBox>La transferencia intracompañía (art. 52 fracc. III Ley de Migración) requiere que el trabajador haya laborado <strong>mínimo 1 año continuo</strong> en una empresa del mismo grupo corporativo, y que ocupe un cargo <strong>directivo, gerencial o de conocimiento especializado</strong>. Cargos operativos no califican.</InfoBox>
        <div style={s.grid2}>
          <div>
            <span style={s.label}>Empresa origen (país de origen)</span>
            <input style={s.input} value={data.empresa_origen||""} onChange={e=>save("empresa_origen",e.target.value)} placeholder="Razón social y país"/>
          </div>
          <div>
            <span style={s.label}>Relación corporativa</span>
            <select style={s.input} value={data.relacion_corporativa||""} onChange={e=>save("relacion_corporativa",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="subsidiaria">Subsidiaria (México es subsidiaria del extranjero)</option>
              <option value="matriz">Matriz (México es la empresa madre)</option>
              <option value="afiliada">Afiliada (mismo accionista mayoritario)</option>
              <option value="sucursal">Sucursal de empresa extranjera</option>
            </select>
          </div>
          <div>
            <span style={s.label}>Porcentaje de participación corporativa</span>
            <input style={s.input} value={data.porcentaje_participacion||""} onChange={e=>save("porcentaje_participacion",e.target.value)} placeholder="Ej. 100% — 51% — 30%"/>
          </div>
          <div>
            <span style={s.label}>Documento que acredita el grupo corporativo</span>
            <select style={s.input} value={data.doc_grupo||""} onChange={e=>save("doc_grupo",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="escrituras">Escrituras constitutivas de ambas empresas</option>
              <option value="actas">Actas de asamblea con composición accionaria</option>
              <option value="estados_financieros">Estados financieros consolidados</option>
              <option value="certificado_grupo">Certificado de pertenencia al grupo corporativo</option>
            </select>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Casos de Transferencia Intracompañía Activos</SectionTitle>
        <div style={s.grid2}>
          <div>
            <span style={s.label}>Número de transferidos activos</span>
            <input style={s.input} type="number" value={data.num_transferidos||""} onChange={e=>save("num_transferidos",e.target.value)} placeholder="0"/>
          </div>
          <div>
            <span style={s.label}>Duración promedio de asignación</span>
            <select style={s.input} value={data.duracion_asignacion||""} onChange={e=>save("duracion_asignacion",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="menos1">Menos de 1 año</option>
              <option value="1a2">1 a 2 años</option>
              <option value="2a4">2 a 4 años</option>
              <option value="indefinida">Indefinida — con revisiones anuales</option>
            </select>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Split Payroll y Estructura Fiscal</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">El <strong>split payroll</strong> (pago del salario en dos países) es una de las áreas de mayor riesgo fiscal en transferencias intracompañía. Sin una estructura correcta y documentación adecuada, el empleado puede quedar sujeto a ISR en México sobre el 100% de su salario global, y la empresa puede perder la deducción de la parte pagada en el extranjero.</InfoBox>
        <div style={s.grid2}>
          <div>
            <span style={s.label}>¿Hay split payroll?</span>
            <select style={s.input} value={data.hay_split_payroll||""} onChange={e=>save("hay_split_payroll",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="si">Sí — salario pagado en dos países</option>
              <option value="no">No — 100% pagado en México</option>
              <option value="no_mx">No — 100% pagado en país de origen</option>
            </select>
          </div>
          <div>
            <span style={s.label}>Porcentaje pagado en México</span>
            <input style={s.input} value={data.porcentaje_mx||""} onChange={e=>save("porcentaje_mx",e.target.value)} placeholder="Ej. 40% CDMX — 60% en origen"/>
          </div>
          <div>
            <span style={s.label}>CDT aplicable (país de origen)</span>
            <input style={s.input} value={data.cdt_pais||""} onChange={e=>save("cdt_pais",e.target.value)} placeholder="Ej. México-España, México-EUA, México-Alemania"/>
          </div>
          <div>
            <span style={s.label}>Artículo del CDT aplicable a sueldos</span>
            <input style={s.input} value={data.articulo_cdt||""} onChange={e=>save("articulo_cdt",e.target.value)} placeholder="Ej. Artículo 15 — Sueldos y Salarios"/>
          </div>
          <div>
            <span style={s.label}>¿Existe convenio bilateral de seguridad social?</span>
            <select style={s.input} value={data.convenio_ss||""} onChange={e=>save("convenio_ss",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="si_exencion">Sí — con exención de IMSS (certificado de cobertura)</option>
              <option value="si_parcial">Sí — con exención parcial</option>
              <option value="no">No — IMSS completo en México</option>
              <option value="analizar">Pendiente de análisis</option>
            </select>
          </div>
          <div>
            <span style={s.label}>¿Tiene certificado de cobertura del país origen?</span>
            <select style={s.input} value={data.certificado_cobertura||""} onChange={e=>save("certificado_cobertura",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="si">Sí — vigente</option>
              <option value="en_tramite">En trámite</option>
              <option value="no">No</option>
              <option value="na">No aplica</option>
            </select>
          </div>
        </div>
        <div style={{marginTop:10}}>
          <span style={s.label}>Análisis de riesgo de establecimiento permanente</span>
          <select style={s.input} value={data.pe_analizado||""} onChange={e=>save("pe_analizado",e.target.value)}>
            <option value="">Seleccionar</option>
            <option value="analizado_sin_riesgo">Analizado — sin riesgo de PE</option>
            <option value="analizado_riesgo_mitigado">Analizado — riesgo identificado y mitigado contractualmente</option>
            <option value="riesgo_alto">Riesgo alto — requiere reestructura</option>
            <option value="pendiente">Pendiente de análisis</option>
          </select>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Notas por Caso</SectionTitle>
        <textarea style={{...s.input,minHeight:90,resize:"vertical"}} value={data.notas_intracompany||""} onChange={e=>save("notas_intracompany",e.target.value)} placeholder="Notas específicas por caso: nombre del trabajador, país de origen, cargo, duración de asignación, estructura fiscal acordada, pendientes..."/>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// M-03 — Representantes e Inversionistas Extranjeros
export function ModM03({client}){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  const mod="M-03";

  useEffect(()=>{
    supabase.from("modulos_data").select("*").eq("client_id",client.id).eq("modulo",mod).is("sociedad_id",client._sociedad?.id||null).single()
      .then(({data:d})=>{ if(d) setData(d); });
  },[client.id]);

  async function save(field,val){
    setSaving(true);
    const updated={...data,[field]:val};
    setData(updated);
    await supabase.from("modulos_data").upsert({client_id:client.id,modulo:mod,sociedad_id:client._sociedad?.id||null,data:updated,updated_at:new Date().toISOString()},{onConflict:"client_id,modulo,sociedad_id"});
    setSaving(false);
  }

  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Datos del Representante o Inversionista Extranjero</SectionTitle>
        <div style={s.grid2}>
          <div>
            <span style={s.label}>Nombre del representante</span>
            <input style={s.input} value={data.nombre_representante||""} onChange={e=>save("nombre_representante",e.target.value)} placeholder="Nombre completo"/>
          </div>
          <div>
            <span style={s.label}>Nacionalidad</span>
            <input style={s.input} value={data.nacionalidad_rep||""} onChange={e=>save("nacionalidad_rep",e.target.value)} placeholder="País de origen"/>
          </div>
          <div>
            <span style={s.label}>Tipo de actividad en México</span>
            <select style={s.input} value={data.tipo_actividad||""} onChange={e=>save("tipo_actividad",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="representante_empresa">Representante de empresa extranjera</option>
              <option value="inversionista">Inversionista con participación activa</option>
              <option value="consultor">Consultor o asesor independiente</option>
              <option value="director_filial">Director general de filial mexicana</option>
            </select>
          </div>
          <div>
            <span style={s.label}>Empresa extranjera representada</span>
            <input style={s.input} value={data.empresa_extranjera||""} onChange={e=>save("empresa_extranjera",e.target.value)} placeholder="Razón social y país"/>
          </div>
          <div>
            <span style={s.label}>Tipo de visa actual</span>
            <select style={s.input} value={data.tipo_visa_rep||""} onChange={e=>save("tipo_visa_rep",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="residente_temporal_lucrativa">Residente Temporal — Actividades Lucrativas</option>
              <option value="residente_permanente">Residente Permanente</option>
              <option value="visitante_negocios">Visitante sin permiso de trabajo (solo negocios)</option>
              <option value="otro">Otro — especificar en notas</option>
            </select>
          </div>
          <div>
            <span style={s.label}>Vencimiento del documento migratorio</span>
            <input style={s.input} type="date" value={data.vencimiento_doc_rep||""} onChange={e=>save("vencimiento_doc_rep",e.target.value)}/>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Análisis de Establecimiento Permanente (EP)</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">El <strong>Establecimiento Permanente</strong> (art. 2 LISR) es uno de los riesgos fiscales más graves para empresas extranjeras con actividad en México. Si el representante tiene facultades para contratar en nombre de la empresa, o si existe un lugar fijo de negocios, la empresa extranjera puede quedar obligada a pagar ISR en México sobre las utilidades atribuibles.</InfoBox>
        {[
          {concepto:"Agente dependiente con facultades para contratar",desc:"El representante puede obligar a la empresa extranjera",riesgo:"critico"},
          {concepto:"Lugar fijo de negocios en México",desc:"Oficina, sucursal, almacén, taller, mina, pozo",riesgo:"critico"},
          {concepto:"Obras o proyectos de construcción (+183 días)",desc:"Instalación, montaje o trabajos de supervisión",riesgo:"alto"},
          {concepto:"Servicios prestados por +183 días en 12 meses",desc:"Por la misma empresa o empresas vinculadas",riesgo:"alto"},
          {concepto:"Actividades de almacenamiento o distribución",desc:"Bodega propia para distribución de mercancías",riesgo:"alto"},
        ].map((x,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 0",borderBottom:i<4?"1px solid "+BORDER:"none",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:500,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{x.concepto}</div>
              <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>{x.desc}</div>
            </div>
            <Badge status={x.riesgo} label={x.riesgo}/>
          </div>
        ))}
        <div style={{marginTop:12}}>
          <span style={s.label}>Conclusión del análisis de EP para este cliente</span>
          <select style={s.input} value={data.conclusion_pe||""} onChange={e=>save("conclusion_pe",e.target.value)}>
            <option value="">Seleccionar</option>
            <option value="sin_pe">Sin riesgo de EP — actividades preparatorias o auxiliares únicamente</option>
            <option value="pe_mitigado">Riesgo identificado — mitigado mediante estructura contractual</option>
            <option value="pe_existente">PE existente — empresa extranjera debe inscribirse en el SAT</option>
            <option value="analisis_pendiente">Análisis pendiente</option>
          </select>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Situación Fiscal del Representante</SectionTitle>
        <div style={s.grid2}>
          <div>
            <span style={s.label}>¿Es residente fiscal en México?</span>
            <select style={s.input} value={data.residente_fiscal_mx||""} onChange={e=>save("residente_fiscal_mx",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="si_183">Sí — más de 183 días en México</option>
              <option value="no">No residente — menos de 183 días</option>
              <option value="en_analisis">En análisis — cerca del límite</option>
            </select>
          </div>
          <div>
            <span style={s.label}>CDT aplicable</span>
            <input style={s.input} value={data.cdt_rep||""} onChange={e=>save("cdt_rep",e.target.value)} placeholder="País del CDT aplicable"/>
          </div>
          <div>
            <span style={s.label}>RFC del representante</span>
            <input style={s.input} value={data.rfc_rep||""} onChange={e=>save("rfc_rep",e.target.value)} placeholder="RFC si percibe ingresos de fuente mexicana"/>
          </div>
          <div>
            <span style={s.label}>¿Inscripción de empresa extranjera en RPPyC?</span>
            <select style={s.input} value={data.rppyc_status||""} onChange={e=>save("rppyc_status",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="inscrita">Inscrita — art. 250 LGSM</option>
              <option value="no_aplica">No aplica — no opera habitualmente en México</option>
              <option value="requerida">Requerida — trámite pendiente</option>
            </select>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Notas y Estrategia</SectionTitle>
        <textarea style={{...s.input,minHeight:90,resize:"vertical"}} value={data.notas_representante||""} onChange={e=>save("notas_representante",e.target.value)} placeholder="Estrategia de mitigación de EP, estructura contractual acordada, pendientes fiscales, renovaciones próximas..."/>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// M-04 — Cumplimiento INM
export function ModM04({client}){
  const [personas,setPersonas]=useState([]);
  const [data,setData]=useState({});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const mod="M-04";

  useEffect(()=>{
    supabase.from("personas").select("*").eq("client_id",client.id).eq("nacionalidad_extranjera",true)
      .then(({data:d})=>{ setPersonas(d||[]); setLoading(false); });
    supabase.from("modulos_data").select("*").eq("client_id",client.id).eq("modulo",mod).is("sociedad_id",client._sociedad?.id||null).single()
      .then(({data:d})=>{ if(d) setData(d); });
  },[client.id]);

  async function save(field,val){
    setSaving(true);
    const updated={...data,[field]:val};
    setData(updated);
    await supabase.from("modulos_data").upsert({client_id:client.id,modulo:mod,sociedad_id:client._sociedad?.id||null,data:updated,updated_at:new Date().toISOString()},{onConflict:"client_id,modulo,sociedad_id"});
    setSaving(false);
  }

  if(loading) return <Spinner/>;

  const proxVencer=personas.filter(x=>{
    if(!x.visa_vencimiento) return false;
    const d=Math.ceil((new Date(x.visa_vencimiento)-new Date())/(1000*60*60*24));
    return d>=0 && d<=90;
  });
  const vencidos=personas.filter(x=>{
    if(!x.visa_vencimiento) return false;
    return Math.ceil((new Date(x.visa_vencimiento)-new Date())/(1000*60*60*24))<0;
  });

  return(
    <div>
      {/* Scorecard */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={s.scoreCard}><div style={{fontSize:26,color:MUSGO,fontFamily:"Georgia,serif"}}>{personas.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Total extranjeros</div></div>
        <div style={s.scoreCard}><div style={{fontSize:26,color:vencidos.length>0?RED:GREEN,fontFamily:"Georgia,serif"}}>{vencidos.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Docs vencidos</div></div>
        <div style={s.scoreCard}><div style={{fontSize:26,color:proxVencer.length>0?GOLD:GREEN,fontFamily:"Georgia,serif"}}>{proxVencer.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Por vencer 90d</div></div>
      </div>

      {/* Padrón de extranjeros */}
      {personas.length>0&&<div style={s.card}>
        <SectionTitle>Padrón de Trabajadores Extranjeros</SectionTitle>
        {personas.map((p,i)=>{
          const dias=p.visa_vencimiento?Math.ceil((new Date(p.visa_vencimiento)-new Date())/(1000*60*60*24)):null;
          const statusColor=dias===null?GRAY:dias<0?RED:dias<=30?RED:dias<=90?GOLD:GREEN;
          return(
            <div key={p.id} style={{...s.row,alignItems:"flex-start"}}>
              <span style={{...s.dot(dias<0?"vencido":dias<=90?"por renovar":"vigente"),marginTop:4}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontFamily:"Georgia,serif",color:TEXT_DARK}}>{p.nombre}</div>
                <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:3}}>
                  <span style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif"}}>{p.nacionalidad}</span>
                  {p.puesto&&<span style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif"}}>{p.puesto}</span>}
                  {p.visa_vencimiento&&<span style={{fontSize:11,color:statusColor,fontFamily:"system-ui,sans-serif",fontWeight:600}}>
                    {dias<0?`Vencido hace ${Math.abs(dias)}d`:dias===0?"Vence hoy":`Vence en ${dias}d`}
                  </span>}
                </div>
              </div>
              {p.visa_vencimiento&&<Badge status={dias<0?"red":dias<=30?"red":dias<=90?"amber":"green"} label={p.visa_vencimiento}/>}
            </div>
          );
        })}
      </div>}

      {/* Obligaciones INM — tabla de plazos */}
      <div style={s.card}>
        <SectionTitle>Obligaciones Legales ante el INM — Guía Operativa</SectionTitle>
        {[
          {obligacion:"Registro de empleador habitual",plazo:"Previo a contratar cualquier extranjero",fundamento:"Art. 97 LM + Art. 133 Reglamento LM",consecuencia:"Sin registro: cada contratación es una infracción independiente"},
          {obligacion:"Aviso de contratación",plazo:"15 días hábiles desde inicio de relación laboral",fundamento:"Art. 97 fracc. I LM",consecuencia:"Multa $500-$1,000 UMAs por omisión (~$50,000-$100,000 MXN)"},
          {obligacion:"Aviso de baja",plazo:"15 días hábiles desde término de relación",fundamento:"Art. 97 fracc. II LM",consecuencia:"Responsabilidad del empleador por actividades posteriores"},
          {obligacion:"Aviso de cambio de domicilio del extranjero",plazo:"15 días hábiles desde el cambio",fundamento:"Art. 97 fracc. III LM",consecuencia:"Multa por omisión — documento desactualizado"},
          {obligacion:"Aviso de cambio de empleador",plazo:"15 días hábiles — requiere nuevo trámite migratorio",fundamento:"Art. 97 fracc. IV LM",consecuencia:"Cancelación del permiso si no se notifica"},
          {obligacion:"Renovación de documento migratorio",plazo:"Iniciar 90 días antes del vencimiento (mínimo 30)",fundamento:"Art. 52 LM",consecuencia:"Documento vencido: deportación + multa $2,000-$5,000 UMAs al empleador"},
          {obligacion:"Actualización de registro de empleador",plazo:"Cuando hay cambios en la empresa (domicilio, giro, rep. legal)",fundamento:"Art. 133 Reglamento LM",consecuencia:"Avisos posteriores pueden ser inválidos"},
        ].map((x,i)=>(
          <div key={i} style={{padding:"12px 0",borderBottom:i<6?"1px solid "+BORDER:"none"}}>
            <div style={{fontSize:12,fontWeight:600,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,marginBottom:3}}>{x.obligacion}</div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif"}}><strong>Plazo:</strong> {x.plazo}</div>
              <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif"}}><strong>Fundamento:</strong> {x.fundamento}</div>
            </div>
            <div style={{fontSize:11,color:RED,fontFamily:"system-ui,sans-serif",marginTop:3}}><strong>Si se omite:</strong> {x.consecuencia}</div>
          </div>
        ))}
      </div>

      {/* Protocolo de verificación */}
      <div style={s.card}>
        <SectionTitle>Protocolo ante Verificación Migratoria del INM</SectionTitle>
        <InfoBox color="#F0FDF4" border="#BBF7D0">Una verificación migratoria puede ocurrir sin previo aviso. El personal de RH y recepción debe saber exactamente qué hacer — y qué no hacer — cuando se presenta un inspector del INM.</InfoBox>
        <div style={{marginBottom:10}}>
          <span style={s.label}>¿Existe protocolo escrito de verificación?</span>
          <select style={s.input} value={data.protocolo_verificacion||""} onChange={e=>save("protocolo_verificacion",e.target.value)}>
            <option value="">Seleccionar</option>
            <option value="si_documentado">Sí — documentado y comunicado a RH y recepción</option>
            <option value="si_verbal">Sí — solo de manera verbal</option>
            <option value="no">No existe protocolo</option>
          </select>
        </div>
        <div style={{marginBottom:10}}>
          <span style={s.label}>Contacto directo en caso de verificación</span>
          <input style={s.input} value={data.contacto_verificacion||""} onChange={e=>save("contacto_verificacion",e.target.value)} placeholder="Nombre y teléfono del abogado migratorio a llamar de inmediato"/>
        </div>
        <div style={{borderTop:"1px solid "+BORDER,paddingTop:12,marginTop:4}}>
          <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:8}}>PASOS BÁSICOS EN UNA VERIFICACIÓN MIGRATORIA:</div>
          {[
            "1. No obstruir ni negar acceso al inspector — constituye delito",
            "2. Solicitar identificación oficial del inspector del INM",
            "3. Llamar inmediatamente al despacho de abogados migratorios",
            "4. Presentar el expediente del empleador y expedientes individuales de extranjeros",
            "5. No firmar nada sin revisión previa del abogado",
            "6. Documentar todo: hora, nombre del inspector, número de oficio",
          ].map((p,i)=><div key={i} style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,padding:"4px 0"}}>{p}</div>)}
        </div>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// M-05 — Extranjeros en Nómina
export function ModM05({client}){
  const [personas,setPersonas]=useState([]);
  const [data,setData]=useState({});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const mod="M-05";

  useEffect(()=>{
    supabase.from("personas").select("*").eq("client_id",client.id).eq("nacionalidad_extranjera",true)
      .then(({data:d})=>{ setPersonas(d||[]); setLoading(false); });
    supabase.from("modulos_data").select("*").eq("client_id",client.id).eq("modulo",mod).is("sociedad_id",client._sociedad?.id||null).single()
      .then(({data:d})=>{ if(d) setData(d); });
  },[client.id]);

  async function save(field,val){
    setSaving(true);
    const updated={...data,[field]:val};
    setData(updated);
    await supabase.from("modulos_data").upsert({client_id:client.id,modulo:mod,sociedad_id:client._sociedad?.id||null,data:updated,updated_at:new Date().toISOString()},{onConflict:"client_id,modulo,sociedad_id"});
    setSaving(false);
  }

  if(loading) return <Spinner/>;

  return(
    <div>
      {/* Scorecard */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={s.scoreCard}><div style={{fontSize:26,color:MUSGO,fontFamily:"Georgia,serif"}}>{personas.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>En nómina</div></div>
        <div style={s.scoreCard}><div style={{fontSize:26,color:GREEN,fontFamily:"Georgia,serif"}}>{personas.filter(x=>x.imss_alta).length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Alta IMSS</div></div>
        <div style={s.scoreCard}><div style={{fontSize:26,color:RED,fontFamily:"Georgia,serif"}}>{personas.filter(x=>!x.imss_alta).length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Sin alta IMSS</div></div>
      </div>

      {/* Regla 183 días */}
      <div style={s.card}>
        <SectionTitle>Regla de los 183 Días — Residencia Fiscal en México</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">Un extranjero que <strong>permanece más de 183 días en México</strong> en cualquier período de 12 meses se convierte en <strong>residente fiscal mexicano</strong> y debe pagar ISR sobre sus <strong>ingresos mundiales</strong> — incluyendo salario del extranjero, dividendos, intereses y cualquier otro ingreso global. Este análisis debe hacerse al inicio de cada asignación y revisarse anualmente.</InfoBox>
        {[
          {concepto:"No residente — menos de 183 días en México",base:"Solo ingresos de fuente de riqueza en México",tasa:"15% ingresos hasta $125,900 MXN anuales / 30% excedente — o tasa del CDT si aplica",requisito:"Constancia de residencia fiscal en el extranjero para aplicar CDT"},
          {concepto:"Residente fiscal en México — 183 días o más",base:"Ingresos mundiales (salario México + salario extranjero + dividendos + otros)",tasa:"Tasas progresivas de tablas LISR — igual que mexicanos — hasta 35%",requisito:"Mismas obligaciones que contribuyente mexicano — declaración anual obligatoria"},
        ].map((x,i)=>(
          <div key={i} style={{padding:"14px",borderRadius:4,background:i===0?"#F0F9FF":"#FFF7ED",border:"1px solid "+(i===0?"#BAE6FD":"#FED7AA"),marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,marginBottom:6}}>{x.concepto}</div>
            <div style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,marginBottom:3}}><strong>Base del impuesto:</strong> {x.base}</div>
            <div style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,marginBottom:3}}><strong>Tasa ISR:</strong> {x.tasa}</div>
            <div style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:GRAY}}><strong>Requisito CDT:</strong> {x.requisito}</div>
          </div>
        ))}
      </div>

      {/* Convenios para evitar doble tributación */}
      <div style={s.card}>
        <SectionTitle>Convenios para Evitar Doble Tributación (CDT) Relevantes</SectionTitle>
        <InfoBox>México tiene CDTs vigentes con más de 60 países. Para extranjeros en nómina, el artículo más relevante es el de <strong>Sueldos y Salarios</strong> (normalmente art. 15), que puede reducir o eliminar el ISR mexicano si el empleado no es residente fiscal en México. El beneficio solo aplica si se presenta la <strong>constancia de residencia fiscal en el país de origen</strong>.</InfoBox>
        {[
          {pais:"Estados Unidos",art:"Art. 15",beneficio:"Exención de ISR mexicano si permanece menos de 183 días y el salario lo paga una empresa de EUA"},
          {pais:"España",art:"Art. 15",beneficio:"Reducción de tasa — aplicar CDT con constancia de residencia fiscal española"},
          {pais:"Alemania",art:"Art. 15",beneficio:"Exención si permanece menos de 183 días y salario pagado por empresa alemana"},
          {pais:"Canadá",art:"Art. 15",beneficio:"Exención similar a EUA — verificar TMEC para implicaciones adicionales"},
          {pais:"Francia",art:"Art. 15",beneficio:"Reducción de tasa — requiere constancia del fisco francés"},
          {pais:"Países sin CDT con México",art:"N/A",beneficio:"ISR completo en México según LISR — sin posibilidad de reducción por CDT"},
        ].map((x,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<5?"1px solid "+BORDER:"none",alignItems:"flex-start"}}>
            <div style={{minWidth:100,fontSize:12,fontWeight:600,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{x.pais}</div>
            <div style={{minWidth:50,fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif"}}>{x.art}</div>
            <div style={{flex:1,fontSize:11,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{x.beneficio}</div>
          </div>
        ))}
      </div>

      {/* IMSS para extranjeros */}
      <div style={s.card}>
        <SectionTitle>Obligaciones IMSS e INFONAVIT para Trabajadores Extranjeros</SectionTitle>
        <InfoBox color="#F0FDF4" border="#BBF7D0">Los trabajadores extranjeros con permiso de trabajo en México están sujetos a las <strong>mismas obligaciones IMSS e INFONAVIT que los trabajadores nacionales</strong>, a menos que exista un convenio bilateral de seguridad social vigente entre México y el país de origen que otorgue exención.</InfoBox>
        {[
          {concepto:"México-Canadá (convenio SS)",estatus:"Vigente — exención de IMSS con certificado de cobertura canadiense",tipo:"exento"},
          {concepto:"México-España (convenio SS)",estatus:"Vigente — exención de IMSS con certificado de cobertura español",tipo:"exento"},
          {concepto:"México-EUA",estatus:"No existe convenio bilateral de SS — IMSS completo obligatorio",tipo:"obligatorio"},
          {concepto:"México-Alemania, Francia, UK y mayoría de países",estatus:"Sin convenio — IMSS completo obligatorio — salvo análisis específico",tipo:"obligatorio"},
          {concepto:"INFONAVIT — extranjeros con permiso de trabajo",estatus:"Obligatorio — misma tasa que nacionales (5% del SBC) — salvo CDT específico",tipo:"obligatorio"},
        ].map((x,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<4?"1px solid "+BORDER:"none",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:500,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{x.concepto}</div>
              <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>{x.estatus}</div>
            </div>
            <Badge status={x.tipo==="exento"?"green":"amber"} label={x.tipo}/>
          </div>
        ))}
      </div>

      {/* Configuración de nómina */}
      <div style={s.card}>
        <SectionTitle>Configuración de Nómina para Extranjeros</SectionTitle>
        <div style={s.grid2}>
          <div>
            <span style={s.label}>¿RH instruido por escrito sobre cada extranjero?</span>
            <select style={s.input} value={data.rh_instruido||""} onChange={e=>save("rh_instruido",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="si">Sí — carta de instrucción actualizada</option>
              <option value="verbal">Solo instrucciones verbales</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <span style={s.label}>¿Sistema de nómina configurado correctamente?</span>
            <select style={s.input} value={data.nomina_configurada||""} onChange={e=>save("nomina_configurada",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="si">Sí — tasa y CDT configurados</option>
              <option value="parcial">Parcialmente — revisión pendiente</option>
              <option value="no">No — usando tasa estándar incorrecta</option>
            </select>
          </div>
          <div>
            <span style={s.label}>¿Se controla el conteo de días de presencia en México?</span>
            <select style={s.input} value={data.control_dias||""} onChange={e=>save("control_dias",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="si">Sí — con registro de entradas y salidas</option>
              <option value="no">No — sin control</option>
            </select>
          </div>
          <div>
            <span style={s.label}>¿Revisión anual de condición fiscal al inicio del año?</span>
            <select style={s.input} value={data.revision_anual||""} onChange={e=>save("revision_anual",e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="si">Sí — cada enero</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div style={{marginTop:10}}>
          <span style={s.label}>Notas por trabajador — tratamiento fiscal individual</span>
          <textarea style={{...s.input,minHeight:100,resize:"vertical"}} value={data.notas_nomina||""} onChange={e=>save("notas_nomina",e.target.value)} placeholder="Ej. John Smith (EUA): no residente fiscal, tasa CDT art. 15 aplica, constancia IRS presentada, IMSS completo obligatorio — sin convenio. María García (España): residente fiscal 183+ días, ISR tablas LISR ingresos mundiales, IMSS exento convenio México-España, certificado TGSS vigente hasta dic 2025..."/>
        </div>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}
