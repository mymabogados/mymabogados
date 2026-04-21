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

function Spinner(){return <div style={{textAlign:"center",padding:"2rem",color:GRAY,fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;}

function Badge({status,label}){
  const map={
    vigente:["#f0fdf4","#166534"],vencido:["#fef2f2","#991b1b"],
    "por renovar":["#fffbeb","#92400e"],pendiente:["#fffbeb","#92400e"],
    green:["#f0fdf4","#166534"],red:["#fef2f2","#991b1b"],amber:["#fffbeb","#92400e"],
    critico:["#fef2f2","#991b1b"],alto:["#fff7ed","#9a3412"],
    medio:["#fffbeb","#92400e"],bajo:["#f0fdf4","#166534"],
    activo:["#eff6ff","#1d4ed8"],concluido:["#f0fdf4","#166534"],
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
  textarea:{minHeight:70,resize:"vertical"},
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCS CATALOG
// ─────────────────────────────────────────────────────────────────────────────
export const LABORAL_DOCS = {
  "L-01": {
    docs: [
      {id:"contrato_individual",label:"Contratos individuales de trabajo vigentes",requerido:true,desc:"Por cada trabajador — firmados, con fecha y prestaciones completas de LFT"},
      {id:"contrato_colectivo",label:"Contrato colectivo de trabajo (CCT)",requerido:false,desc:"Si hay sindicato — depositado ante la Junta o Tribunal Laboral"},
      {id:"contrato_confianza",label:"Contratos de empleados de confianza",requerido:false,desc:"Con exclusión expresa de régimen sindical — cláusula de confidencialidad"},
      {id:"contrato_temporal",label:"Contratos por obra o tiempo determinado",requerido:false,desc:"Con justificación legal de temporalidad — art. 37-39 LFT"},
      {id:"aviso_alta_imss",label:"Avisos de alta IMSS",requerido:true,desc:"Dentro de los primeros 5 días del inicio de la relación laboral"},
      {id:"alta_infonavit",label:"Altas INFONAVIT",requerido:true,desc:"Al inicio de la relación laboral — número de crédito si aplica"},
      {id:"politica_no_discriminacion",label:"Política de No Discriminación e Igualdad Laboral",requerido:true,desc:"NOM-135 — publicada y comunicada a todos los trabajadores"},
      {id:"tabla_vacaciones",label:"Tabla de vacaciones actualizada conforme a reforma 2023",requerido:true,desc:"Mínimo 12 días el primer año — incremento progresivo LFT vigente"},
      {id:"recibos_nomina",label:"Recibos de nómina CFDI firmados",requerido:true,desc:"Timbrados — con desglose de percepciones y deducciones"},
      {id:"nom035_diagnostico",label:"Diagnóstico NOM-035 aplicado",requerido:true,desc:"Identificación de factores de riesgo psicosocial — anual"},
      {id:"acuerdo_privacidad_trabajador",label:"Aviso de privacidad para trabajadores",requerido:true,desc:"LFPDPPP — datos personales en el empleo"},
    ],
    checklist: [
      {id:"contratos_todos_firmados",label:"100% de trabajadores con contrato individual firmado",riesgo:"critico"},
      {id:"imss_todos_alta",label:"100% de trabajadores dados de alta en IMSS",riesgo:"critico"},
      {id:"salario_minimo_cumplido",label:"Salario igual o superior al mínimo vigente y profesional si aplica",riesgo:"critico"},
      {id:"vacaciones_reforma2023",label:"Vacaciones conforme a tabla reformada 2023 (mínimo 12 días primer año)",riesgo:"critico"},
      {id:"aguinaldo_15dias",label:"Aguinaldo mínimo 15 días por año de servicio",riesgo:"alto"},
      {id:"prima_vacacional_25",label:"Prima vacacional mínima 25% sobre salario de vacaciones",riesgo:"alto"},
      {id:"nomina_timbrada",label:"100% de nómina timbrada con CFDI",riesgo:"critico"},
      {id:"ptu_calculada",label:"PTU calculada y pagada antes del 31 de mayo",riesgo:"alto"},
      {id:"infonavit_al_corriente",label:"Aportaciones INFONAVIT al corriente",riesgo:"alto"},
      {id:"nom035_aplicada",label:"NOM-035 aplicada — diagnóstico anual realizado",riesgo:"alto"},
      {id:"contratos_tipo_correcto",label:"Tipo de contrato correcto según la naturaleza de cada relación",riesgo:"critico"},
      {id:"empleados_confianza_identificados",label:"Empleados de confianza correctamente identificados y documentados",riesgo:"alto"},
      {id:"politica_discriminacion",label:"Política de no discriminación publicada y comunicada",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Trabajador sin contrato — relación laboral por tiempo indeterminado automática",impacto:"Despido injustificado: 3 meses salario + 20 días por año + partes proporcionales — sin posibilidad de defensa",nivel:"critico"},
      {label:"Trabajador sin alta en IMSS",impacto:"Créditos IMSS retroactivos + recargos 1.47% mensual + multas — responsabilidad solidaria en subcontratación",nivel:"critico"},
      {label:"Vacaciones sin actualizar a reforma 2023",impacto:"Diferencias de vacaciones exigibles + demanda laboral + multa STPS",nivel:"critico"},
      {label:"PTU no pagada o mal calculada",impacto:"Demanda laboral + multa STPS + responsabilidad penal por retención indebida",nivel:"alto"},
      {label:"Nómina no timbrada",impacto:"Multa SAT + sueldos no deducibles + ISR no acreditado",nivel:"critico"},
      {label:"Empleado de confianza sin cláusula expresa",impacto:"Se asimila a trabajador de base — protección sindical plena — riesgo de reinstalación",nivel:"alto"},
    ]
  },
  "L-02": {
    docs: [
      {id:"rit_vigente",label:"Reglamento Interior de Trabajo vigente",requerido:true,desc:"Depositado ante el Tribunal Laboral — con sello y folio de depósito"},
      {id:"acuse_deposito_rit",label:"Acuse de depósito del RIT ante Tribunal Laboral",requerido:true,desc:"Obligatorio para que el RIT sea oponible a trabajadores"},
      {id:"rit_publicado",label:"Constancia de publicación del RIT en instalaciones",requerido:true,desc:"Publicado en lugar visible — art. 423 LFT"},
      {id:"firma_conocimiento_rit",label:"Acuses de conocimiento del RIT firmados por trabajadores",requerido:true,desc:"Cada trabajador debe firmar que recibió y leyó el RIT"},
      {id:"rit_actualizado_reforma",label:"RIT actualizado conforme a reformas laborales recientes",requerido:true,desc:"Reforma 2019, 2021, 2023 — teletrabajo, NOM-035, subcontratación"},
    ],
    checklist: [
      {id:"rit_depositado_tribunal",label:"RIT depositado ante Tribunal Laboral Federal o Local competente",riesgo:"critico"},
      {id:"rit_publicado_instalaciones",label:"RIT publicado en lugar visible en todas las instalaciones",riesgo:"alto"},
      {id:"todos_firmaron_rit",label:"100% de trabajadores firmaron acuse de conocimiento del RIT",riesgo:"alto"},
      {id:"rit_incluye_teletrabajo",label:"RIT incluye disposiciones de teletrabajo si aplica",riesgo:"alto"},
      {id:"rit_incluye_hostigamiento",label:"RIT incluye protocolo contra hostigamiento y acoso sexual",riesgo:"critico"},
      {id:"rit_incluye_sanciones",label:"RIT con régimen disciplinario y sanciones proporcionales",riesgo:"alto"},
      {id:"rit_actualizado_3anos",label:"RIT actualizado en los últimos 3 años",riesgo:"alto"},
      {id:"rit_no_clausulas_ilegales",label:"RIT sin cláusulas contrarias a LFT o derechos mínimos",riesgo:"critico"},
    ],
    riesgos: [
      {label:"RIT sin depositar ante Tribunal — inoponible al trabajador",impacto:"Sanciones disciplinarias impugnables — trabajador puede desconocer el RIT en juicio",nivel:"critico"},
      {label:"RIT sin protocolo de hostigamiento sexual",impacto:"Multa STPS + responsabilidad civil por omisión + riesgo reputacional",nivel:"critico"},
      {label:"Trabajadores sin acuse de conocimiento del RIT",impacto:"En caso de sanción: impugnación exitosa del procedimiento disciplinario",nivel:"alto"},
      {label:"RIT desactualizado — sin teletrabajo ni NOM-035",impacto:"Vulnerabilidad legal ante demandas de trabajadores en home office",nivel:"alto"},
    ]
  },
  "L-03": {
    docs: [
      {id:"registro_repse",label:"Registro REPSE vigente (si presta servicios especializados)",requerido:false,desc:"STPS — obligatorio si presta servicios u obras especializadas a terceros"},
      {id:"constancia_repse_proveedor",label:"Constancias REPSE vigentes de todos los proveedores de servicios",requerido:false,desc:"Si contrata servicios especializados — verificar vigencia cada año"},
      {id:"contratos_servicios_especializados",label:"Contratos de servicios especializados u obras",requerido:true,desc:"Art. 13 LFT — deben incluir número de REPSE, objeto, monto y trabajadores"},
      {id:"informes_cuatrimestrales",label:"Informes cuatrimestrales REPSE presentados",requerido:false,desc:"Si tiene registro REPSE — enero, mayo y septiembre ante el STPS"},
      {id:"comprobantes_seguridad_social",label:"Comprobantes de cumplimiento de seguridad social de proveedores",requerido:true,desc:"IMSS e INFONAVIT al corriente — responsabilidad solidaria si proveedor incumple"},
      {id:"constancias_sat_proveedor",label:"Constancias de situación fiscal de proveedores REPSE",requerido:true,desc:"SAT — verificar que no estén en listas negras 69-B o 69-B Bis"},
      {id:"verificacion_69b",label:"Verificación en lista negra SAT 69-B de proveedores",requerido:true,desc:"Mensual — proveedores con CFDI cuestionados o cancelados"},
      {id:"clausula_responsabilidad_solidaria",label:"Cláusula de responsabilidad solidaria en contratos",requerido:true,desc:"El contratante puede ser solidariamente responsable si el proveedor incumple IMSS/INFONAVIT"},
    ],
    checklist: [
      {id:"registro_repse_propio_vigente",label:"Registro REPSE propio vigente si presta servicios a terceros",riesgo:"critico"},
      {id:"proveedores_con_repse",label:"100% de proveedores de servicios especializados con REPSE vigente",riesgo:"critico"},
      {id:"contratos_con_numero_repse",label:"Contratos incluyen número de REPSE del proveedor",riesgo:"critico"},
      {id:"informes_cuatrimestrales_al_corriente",label:"Informes cuatrimestrales REPSE presentados en tiempo",riesgo:"critico"},
      {id:"imss_proveedor_verificado",label:"IMSS e INFONAVIT de proveedores verificados mensualmente",riesgo:"critico"},
      {id:"proveedores_no_en_69b",label:"Proveedores no listados en artículo 69-B SAT",riesgo:"critico"},
      {id:"objeto_contrato_coincide",label:"Objeto del contrato coincide exactamente con el REPSE del proveedor",riesgo:"alto"},
      {id:"trabajadores_declarados_repse",label:"Número de trabajadores declarados en REPSE es correcto",riesgo:"alto"},
      {id:"responsabilidad_solidaria_documentada",label:"Cláusula de responsabilidad solidaria en todos los contratos",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Proveedor sin REPSE — servicios especializados ilegales",impacto:"Multa al contratante de $23,348 a $467,000 MXN + responsabilidad solidaria IMSS/INFONAVIT",nivel:"critico"},
      {label:"Proveedor en lista 69-B SAT",impacto:"CFDI cuestionados + ISR e IVA no acreditables + multas por operaciones inexistentes",nivel:"critico"},
      {label:"Informe cuatrimestral omitido",impacto:"Multa STPS + cancelación del registro REPSE",nivel:"critico"},
      {label:"Objeto del contrato no coincide con REPSE",impacto:"Contrato fuera del régimen — responsabilidad solidaria automática",nivel:"alto"},
      {label:"IMSS del proveedor sin verificar — proveedor incumple",impacto:"Empresa contratante responde solidariamente por cuotas omitidas del proveedor",nivel:"critico"},
    ]
  },
  "L-04": {
    docs: [
      {id:"acta_rescision",label:"Acta de rescisión de la relación laboral",requerido:true,desc:"Firmada por el trabajador y testigos — con causas específicas del art. 47 LFT"},
      {id:"liquidacion_calculo",label:"Cálculo detallado de liquidación o finiquito",requerido:true,desc:"Con desglose de 3 meses, 20 días por año, partes proporcionales, prima de antigüedad"},
      {id:"recibo_finiquito",label:"Recibo de finiquito firmado ante fedatario",requerido:true,desc:"Ante Tribunal Laboral o Notario — para que sea oponible en juicio"},
      {id:"carta_renuncia",label:"Carta de renuncia voluntaria",requerido:false,desc:"Firmada ante el Tribunal Laboral para que sea válida — art. 33 LFT"},
      {id:"constancia_imss_baja",label:"Aviso de baja ante el IMSS",requerido:true,desc:"Dentro de los 5 días siguientes a la terminación"},
      {id:"constancia_infonavit_baja",label:"Aviso de baja ante INFONAVIT",requerido:true,desc:"Al término de la relación laboral"},
      {id:"liberacion_obligaciones",label:"Carta de no adeudo y liberación de obligaciones",requerido:false,desc:"Del trabajador hacia la empresa — devolución de equipos, confidencialidad"},
    ],
    checklist: [
      {id:"acta_rescision_causas_especificas",label:"Acta de rescisión con causas específicas del art. 47 LFT",riesgo:"critico"},
      {id:"liquidacion_correcta",label:"Liquidación calculada correctamente incluyendo reforma de vacaciones 2023",riesgo:"critico"},
      {id:"finiquito_ante_tribunal",label:"Finiquito firmado ante Tribunal Laboral o Notario",riesgo:"critico"},
      {id:"baja_imss_5dias",label:"Baja en IMSS presentada dentro de 5 días",riesgo:"alto"},
      {id:"renuncia_ante_tribunal",label:"Renuncia voluntaria ratificada ante Tribunal Laboral",riesgo:"critico"},
      {id:"prima_antiguedad_pagada",label:"Prima de antigüedad pagada si aplica (15 días por año — art. 162 LFT)",riesgo:"alto"},
      {id:"salarios_caidos_controlados",label:"Salarios caídos controlados — demanda presentada a tiempo",riesgo:"critico"},
      {id:"documentos_entregados",label:"Documentos del trabajador devueltos — carta de recomendación si corresponde",riesgo:"bajo"},
    ],
    riesgos: [
      {label:"Despido sin acta de rescisión con causas específicas",impacto:"Despido injustificado automático — 3 meses + 20 días/año + partes proporcionales + salarios caídos",nivel:"critico"},
      {label:"Finiquito sin ratificación ante Tribunal",impacto:"Impugnable en cualquier momento — trabajador puede reclamar diferencias",nivel:"critico"},
      {label:"Renuncia sin ratificación ante Tribunal",impacto:"Nula — se convierte en despido injustificado — art. 33 LFT",nivel:"critico"},
      {label:"Cálculo de liquidación con tabla de vacaciones anterior a 2023",impacto:"Diferencias reclamables + salarios caídos sobre el diferencial",nivel:"alto"},
      {label:"Baja IMSS tardía — trabajador accidentado post-baja",impacto:"Empresa responde por el accidente como si el trabajador estuviera activo",nivel:"alto"},
    ]
  },
  "L-05": {
    docs: [
      {id:"demanda_laboral",label:"Copia de demanda laboral",requerido:false,desc:"Expediente completo — número, Tribunal, demandante, prestaciones reclamadas"},
      {id:"contestacion_demanda",label:"Contestación de demanda presentada",requerido:false,desc:"Con excepciones y defensas — dentro del plazo legal"},
      {id:"ofrecimiento_pruebas",label:"Acuerdo de ofrecimiento y admisión de pruebas",requerido:false,desc:"Documentales, testimoniales, periciales ofrecidas"},
      {id:"laudo_sentencia",label:"Laudo o sentencia",requerido:false,desc:"Primera o segunda instancia — con monto condenado"},
      {id:"convenio_judicial",label:"Convenio judicial aprobado por Tribunal",requerido:false,desc:"Convenio de terminación del juicio con cantidad acordada"},
      {id:"amparo_laboral",label:"Demanda de amparo laboral",requerido:false,desc:"Si se impugnó laudo o sentencia — número de expediente"},
    ],
    checklist: [
      {id:"demandas_inventariadas",label:"Todas las demandas laborales activas inventariadas y monitoreadas",riesgo:"critico"},
      {id:"provision_contable",label:"Provisión contable para contingencias laborales registrada",riesgo:"alto"},
      {id:"abogado_litigante_activo",label:"Abogado litigante designado y activo en cada expediente",riesgo:"critico"},
      {id:"plazos_procesales_controlados",label:"Plazos procesales controlados — sin caducidades ni preclusiones",riesgo:"critico"},
      {id:"estrategia_definida",label:"Estrategia definida por expediente: litigar, convenir o pagar",riesgo:"alto"},
      {id:"documentos_defensa_disponibles",label:"Documentos de defensa disponibles (contratos, recibos, finiquitos)",riesgo:"alto"},
      {id:"salarios_caidos_monitoreados",label:"Salarios caídos monitoreados — impacto creciente en el tiempo",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Salarios caídos sin tope — demanda antigua sin atender",impacto:"Monto crece indefinidamente — desde 2019 sin tope legal — puede superar el valor de la empresa",nivel:"critico"},
      {label:"Caducidad del expediente por inactividad",impacto:"Preclusión de etapas procesales — pérdida del juicio por omisión procesal",nivel:"critico"},
      {label:"Sin provisión contable — contingencia no reflejada",impacto:"Estados financieros incorrectos — responsabilidad de administradores",nivel:"alto"},
      {label:"Documentos de defensa sin localizar",impacto:"Imposibilidad de probar en juicio — condena automática",nivel:"critico"},
    ]
  },
  "L-06": {
    docs: [
      {id:"diagnostico_nom035",label:"Diagnóstico de factores de riesgo psicosocial NOM-035",requerido:true,desc:"Guías de referencia I, II o III según tamaño de empresa — anual"},
      {id:"politica_prevencion_riesgos",label:"Política de prevención de factores de riesgo psicosocial",requerido:true,desc:"Aprobada por la dirección — publicada y comunicada"},
      {id:"medidas_control_nom035",label:"Medidas de control y prevención implementadas",requerido:true,desc:"Derivadas del diagnóstico — con responsables y fechas"},
      {id:"difusion_nom035",label:"Constancias de difusión de la NOM-035 a trabajadores",requerido:true,desc:"Por escrito — firmadas por cada trabajador"},
      {id:"protocolo_hostigamiento",label:"Protocolo para prevenir el hostigamiento y acoso sexual",requerido:true,desc:"NOM-035 + reforma LFT — incluir en RIT — con mecanismo de denuncia"},
      {id:"registro_eventos_traumaticos",label:"Registro de atención a trabajadores con eventos traumáticos severos",requerido:false,desc:"Solo si se han presentado — con referencia a servicios médicos"},
      {id:"evaluacion_clima_laboral",label:"Evaluación de clima laboral",requerido:false,desc:"Complementaria a la NOM-035 — recomendada anualmente"},
    ],
    checklist: [
      {id:"diagnostico_anual_realizado",label:"Diagnóstico NOM-035 realizado anualmente",riesgo:"alto"},
      {id:"guia_correcta_aplicada",label:"Guía de referencia correcta aplicada según número de trabajadores",riesgo:"alto"},
      {id:"medidas_implementadas",label:"Medidas de control implementadas y documentadas",riesgo:"alto"},
      {id:"politica_publicada",label:"Política de prevención publicada en todas las instalaciones",riesgo:"medio"},
      {id:"protocolo_hostigamiento_vigente",label:"Protocolo contra hostigamiento y acoso sexual vigente y conocido",riesgo:"critico"},
      {id:"mecanismo_denuncia",label:"Mecanismo confidencial de denuncia de hostigamiento activo",riesgo:"critico"},
      {id:"trabajadores_capacitados",label:"Trabajadores capacitados en identificación de riesgos psicosociales",riesgo:"medio"},
      {id:"seguimiento_casos",label:"Seguimiento documentado de casos reportados",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Sin diagnóstico NOM-035 — incumplimiento STPS",impacto:"Multa de $318 a $318,000 MXN + inhabilitación en licitaciones públicas",nivel:"alto"},
      {label:"Sin protocolo de hostigamiento sexual",impacto:"Responsabilidad civil + multa STPS + responsabilidad penal del patrón si hay víctimas",nivel:"critico"},
      {label:"Acoso laboral documentado sin atención",impacto:"Demanda laboral especial + indemnización + daño moral + responsabilidad penal",nivel:"critico"},
      {label:"Clima laboral deteriorado sin diagnóstico",impacto:"Rotación excesiva + demandas colectivas + baja productividad cuantificable",nivel:"medio"},
    ]
  },
  "L-07": {
    docs: [
      {id:"cedulon_imss",label:"Cédula de determinación IMSS vigente",requerido:true,desc:"Mensual — con desglose por trabajador de cuotas obrero-patronales"},
      {id:"pago_imss_comprobante",label:"Comprobantes de pago de cuotas IMSS",requerido:true,desc:"Últimos 12 meses — con referencia de pago bancario"},
      {id:"infonavit_comprobante",label:"Comprobantes de aportaciones INFONAVIT",requerido:true,desc:"Últimos 12 meses — incluyendo amortizaciones de créditos"},
      {id:"opinion_cumplimiento_imss",label:"Opinión de cumplimiento IMSS vigente",requerido:true,desc:"Trámite en IMSS — para licitaciones y contratos con gobierno"},
      {id:"opinion_cumplimiento_infonavit",label:"Opinión de cumplimiento INFONAVIT vigente",requerido:true,desc:"Trámite en INFONAVIT — para licitaciones y contratos"},
      {id:"determinacion_sbc",label:"Determinación del Salario Base de Cotización (SBC)",requerido:true,desc:"Con todas las percepciones integradas — verificación de integración correcta"},
      {id:"registro_variaciones_sbc",label:"Avisos de modificación de salario al IMSS",requerido:true,desc:"Ante cada cambio salarial — dentro de los 5 días"},
      {id:"censo_trabajadores_imss",label:"Censo de trabajadores activos vs. alta en IMSS",requerido:true,desc:"Sin diferencias — 100% de coincidencia"},
      {id:"creditos_infonavit_activos",label:"Relación de créditos INFONAVIT activos de trabajadores",requerido:false,desc:"Con descuentos aplicados en nómina — para evitar multas por omisión"},
    ],
    checklist: [
      {id:"imss_al_corriente",label:"Cuotas IMSS al corriente — sin adeudos",riesgo:"critico"},
      {id:"infonavit_al_corriente",label:"Aportaciones INFONAVIT al corriente — sin adeudos",riesgo:"critico"},
      {id:"sbc_integrado_correctamente",label:"SBC integrado correctamente — todas las percepciones incluidas",riesgo:"critico"},
      {id:"variaciones_notificadas",label:"Variaciones salariales notificadas al IMSS en 5 días",riesgo:"alto"},
      {id:"opinion_imss_vigente",label:"Opinión de cumplimiento IMSS vigente",riesgo:"alto"},
      {id:"opinion_infonavit_vigente",label:"Opinión de cumplimiento INFONAVIT vigente",riesgo:"alto"},
      {id:"creditos_infonavit_descontados",label:"Créditos INFONAVIT correctamente descontados en nómina",riesgo:"alto"},
      {id:"trabajadores_imss_igual_nomina",label:"Número de trabajadores en IMSS igual que en nómina",riesgo:"critico"},
      {id:"auditoria_imss_preventiva",label:"Auditoría interna preventiva de IMSS realizada en el último año",riesgo:"medio"},
    ],
    riesgos: [
      {label:"SBC subintegrado — percepciones no incluidas",impacto:"Crédito IMSS por diferencias de cuotas + recargos retroactivos + multas — hasta 5 años atrás",nivel:"critico"},
      {label:"Trabajadores en nómina sin alta en IMSS",impacto:"Crédito IMSS completo + responsabilidad solidaria en subcontratación + multa STPS",nivel:"critico"},
      {label:"Adeudo IMSS/INFONAVIT — opinion de cumplimiento negativa",impacto:"Imposibilidad de participar en licitaciones públicas + embargo de cuentas",nivel:"alto"},
      {label:"Crédito INFONAVIT no descontado",impacto:"Multa INFONAVIT + responsabilidad solidaria con el trabajador",nivel:"alto"},
      {label:"Revisión IMSS por auditoría — diferencias significativas",impacto:"Crédito IMSS retroactivo + multas + recargos — promedio $500,000-$5,000,000 MXN",nivel:"critico"},
    ]
  },
  "L-08": {
    docs: [
      {id:"contrato_director_general",label:"Contrato del Director General / CEO",requerido:true,desc:"Con funciones, autoridad, compensación total, causas de terminación y golden parachute"},
      {id:"contratos_directivos_clave",label:"Contratos de directivos clave (C-Suite)",requerido:true,desc:"CFO, COO, CHRO, CTO — con paquetes de compensación completos"},
      {id:"plan_compensacion_variable",label:"Plan de compensación variable (bonos)",requerido:true,desc:"Métricas, triggers, fechas de pago, clawback si aplica"},
      {id:"plan_stock_options",label:"Plan de opciones sobre acciones (Stock Options / SAR)",requerido:false,desc:"Reglas del plan, precio de ejercicio, vesting schedule, aceleración por cambio de control"},
      {id:"acuerdo_no_competencia",label:"Acuerdos de no competencia post-empleo",requerido:true,desc:"Duración, territorio, actividades prohibidas, contraprestación — validez bajo LFT"},
      {id:"acuerdo_confidencialidad",label:"Acuerdos de confidencialidad y propiedad intelectual",requerido:true,desc:"Toda la IP generada durante el empleo pertenece a la empresa"},
      {id:"golden_parachute",label:"Cláusula de Golden Parachute documentada",requerido:false,desc:"Compensación por terminación en cambio de control — monto, triggers, condiciones"},
      {id:"clawback_policy",label:"Política de Clawback",requerido:false,desc:"Recuperación de bonos pagados por resultados restados o fraude — SEC/BMV si cotiza"},
      {id:"succession_plan",label:"Plan de sucesión de posiciones clave",requerido:false,desc:"Identificación de sucesores y plan de desarrollo — para continuidad del negocio"},
      {id:"d&o_insurance",label:"Póliza D&O (Directors & Officers Liability)",requerido:false,desc:"Seguro de responsabilidad civil para directivos — cubre actuaciones en el cargo"},
    ],
    checklist: [
      {id:"contratos_directivos_firmados",label:"Contratos de todos los directivos clave firmados y vigentes",riesgo:"critico"},
      {id:"compensacion_aprobada_consejo",label:"Paquetes de compensación aprobados por el Consejo de Administración",riesgo:"alto"},
      {id:"no_competencia_valida",label:"Cláusulas de no competencia con contraprestación — válidas bajo LFT",riesgo:"alto"},
      {id:"ip_empresa_no_directivo",label:"PI generada en el empleo a nombre de la empresa — no del directivo",riesgo:"critico"},
      {id:"stock_options_plan_aprobado",label:"Plan de stock options aprobado por Asamblea de Accionistas",riesgo:"alto"},
      {id:"vesting_schedule_definido",label:"Vesting schedule definido — cliff y vesting mensual o anual",riesgo:"alto"},
      {id:"aceleracion_cambio_control",label:"Aceleración de vesting en cambio de control definida contractualmente",riesgo:"alto"},
      {id:"golden_parachute_aprobado",label:"Golden parachute aprobado por el Consejo con límites razonables",riesgo:"medio"},
      {id:"clawback_implementado",label:"Política de clawback implementada si la empresa cotiza o tiene inversionistas",riesgo:"alto"},
      {id:"d&o_vigente",label:"Póliza D&O vigente para todos los miembros del Consejo y directivos",riesgo:"alto"},
      {id:"succession_plan_documentado",label:"Plan de sucesión documentado para posiciones críticas",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Directivo sin contrato — mismas protecciones que trabajador de base",impacto:"Imposibilidad de terminar sin liquidación completa — demanda por reinstalación",nivel:"critico"},
      {label:"Cláusula de no competencia sin contraprestación",impacto:"Nula bajo LFT mexicana — directivo puede irse con la competencia sin restricción",nivel:"alto"},
      {label:"Stock options sin plan aprobado por asamblea",impacto:"Reclamación del directivo + incertidumbre fiscal + posible dilución no autorizada",nivel:"alto"},
      {label:"Golden parachute excesivo — cuestionable por accionistas",impacto:"Impugnación por accionistas + responsabilidad de consejeros que lo aprobaron",nivel:"medio"},
      {label:"Sin póliza D&O — directivo demandado personalmente",impacto:"Patrimonio personal del directivo expuesto — renuncia de talento clave + vacío de liderazgo",nivel:"alto"},
      {label:"IP de producto clave a nombre del fundador-directivo",impacto:"Empresa no tiene titularidad — riesgo de extorsión o pérdida en salida del directivo",nivel:"critico"},
    ]
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

function useModData(client, mod){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  useEffect(()=>{
    supabase.from("uso_poderes").select("*").eq("client_id",client.id).eq("modulo",mod).single()
      .then(({data:d})=>{ if(d) setData(d); });
  },[client.id,mod]);
  async function save(field,val){
    setSaving(true);
    const updated={...data,[field]:val,client_id:client.id,modulo:mod};
    setData(updated);
    await supabase.from("uso_poderes").upsert(updated,{onConflict:"client_id,modulo"});
    setSaving(false);
  }
  return {data,save,saving};
}

function Field({label,children}){
  return <div><span style={s.label}>{label}</span>{children}</div>;
}

function SelectField({label,field,value,onChange,options}){
  return(
    <Field label={label}>
      <select style={s.input} value={value||""} onChange={e=>onChange(field,e.target.value)}>
        <option value="">Seleccionar</option>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

// L-01 — Contratos de Trabajo
export function ModL01({client}){
  const {data,save,saving}=useModData(client,"L-01");
  const [trabajadores,setTrabajadores]=useState([]);
  useEffect(()=>{
    supabase.from("personas").select("*").eq("client_id",client.id).then(({data:d})=>setTrabajadores(d||[]));
  },[client.id]);
  const sinContrato=parseInt(data.num_sin_contrato||0);
  const sinImss=parseInt(data.num_sin_imss||0);
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={s.scoreCard}><div style={{fontSize:26,color:MUSGO,fontFamily:"Georgia,serif"}}>{data.num_trabajadores||"—"}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Total trabajadores</div></div>
        <div style={s.scoreCard}><div style={{fontSize:26,color:sinContrato>0?RED:GREEN,fontFamily:"Georgia,serif"}}>{sinContrato}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Sin contrato</div></div>
        <div style={s.scoreCard}><div style={{fontSize:26,color:sinImss>0?RED:GREEN,fontFamily:"Georgia,serif"}}>{sinImss}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Sin alta IMSS</div></div>
      </div>

      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Plantilla y Tipos de Contrato</SectionTitle>
        <div style={s.grid2}>
          <Field label="Total de trabajadores en nómina"><input style={s.input} type="number" value={data.num_trabajadores||""} onChange={e=>save("num_trabajadores",e.target.value)}/></Field>
          <Field label="Trabajadores sin contrato firmado"><input style={s.input} type="number" value={data.num_sin_contrato||""} onChange={e=>save("num_sin_contrato",e.target.value)} placeholder="0"/></Field>
          <Field label="Trabajadores por tiempo indeterminado"><input style={s.input} type="number" value={data.num_indeterminado||""} onChange={e=>save("num_indeterminado",e.target.value)} placeholder="0"/></Field>
          <Field label="Trabajadores por tiempo determinado"><input style={s.input} type="number" value={data.num_determinado||""} onChange={e=>save("num_determinado",e.target.value)} placeholder="0"/></Field>
          <Field label="Empleados de confianza"><input style={s.input} type="number" value={data.num_confianza||""} onChange={e=>save("num_confianza",e.target.value)} placeholder="0"/></Field>
          <Field label="Trabajadores en periodo de prueba"><input style={s.input} type="number" value={data.num_prueba||""} onChange={e=>save("num_prueba",e.target.value)} placeholder="0"/></Field>
          <Field label="Trabajadores en home office / teletrabajo"><input style={s.input} type="number" value={data.num_teletrabajo||""} onChange={e=>save("num_teletrabajo",e.target.value)} placeholder="0"/></Field>
          <Field label="Trabajadores a honorarios (no relación laboral)"><input style={s.input} type="number" value={data.num_honorarios||""} onChange={e=>save("num_honorarios",e.target.value)} placeholder="0"/></Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Cumplimiento de Prestaciones — Reforma 2023</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">La <strong>Reforma de Vacaciones 2023</strong> aumentó el mínimo de 6 a <strong>12 días el primer año</strong>, con incremento de 2 días por cada año laborado hasta el quinto, y luego 2 días cada 5 años. Contratos y políticas anteriores a 2023 que no se actualizaron generan pasivos laborales exigibles.</InfoBox>
        <div style={s.grid2}>
          <SelectField label="Tabla de vacaciones actualizada a reforma 2023" field="vacaciones_reforma" value={data.vacaciones_reforma} onChange={save} options={[{value:"si",label:"Sí — actualizada"},{value:"no",label:"No — tabla anterior"}]}/>
          <SelectField label="Aguinaldo mínimo 15 días pagado" field="aguinaldo_cumplido" value={data.aguinaldo_cumplido} onChange={save} options={[{value:"si",label:"Sí"},{value:"no",label:"No — pendiente de revisión"}]}/>
          <SelectField label="Prima vacacional mínima 25%" field="prima_vacacional" value={data.prima_vacacional} onChange={save} options={[{value:"si",label:"Sí — cumplida"},{value:"superior",label:"Superior al mínimo legal"},{value:"no",label:"No cumplida"}]}/>
          <SelectField label="PTU pagada antes del 31 de mayo" field="ptu_pagada" value={data.ptu_pagada} onChange={save} options={[{value:"si",label:"Sí — pagada en tiempo"},{value:"no",label:"No pagada"},{value:"exenta",label:"Exenta — primer año"}]}/>
          <Field label="Monto PTU último ejercicio (MXN)"><input style={s.input} type="number" value={data.monto_ptu||""} onChange={e=>save("monto_ptu",e.target.value)} placeholder="Total distribuido"/></Field>
          <SelectField label="Nómina 100% timbrada con CFDI" field="nomina_timbrada" value={data.nomina_timbrada} onChange={save} options={[{value:"si",label:"Sí — 100%"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]}/>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Trabajadores en Honorarios — Riesgo de Relación Laboral Encubierta</SectionTitle>
        <InfoBox>Los honorarios (<strong>art. 10 LFT</strong>) encubren relaciones laborales cuando el prestador tiene horario fijo, subordinación, exclusividad y continuidad. Si el IMSS o el Tribunal detectan esta situación, se presume relación laboral desde el inicio — con todo el pasivo de prestaciones acumulado.</InfoBox>
        <div style={s.grid2}>
          <SelectField label="¿Hay prestadores de servicios que trabajan como empleados?" field="honorarios_riesgo" value={data.honorarios_riesgo} onChange={save} options={[{value:"no",label:"No — todos son genuinamente independientes"},{value:"algunos",label:"Algunos — revisión pendiente"},{value:"si",label:"Sí — hay riesgo de relación laboral"}]}/>
          <Field label="Número de prestadores en riesgo"><input style={s.input} type="number" value={data.num_honorarios_riesgo||""} onChange={e=>save("num_honorarios_riesgo",e.target.value)} placeholder="0"/></Field>
        </div>
        <Field label="Acciones tomadas o pendientes">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_honorarios||""} onChange={e=>save("notas_honorarios",e.target.value)} placeholder="Regularización en proceso, contratos revisados, análisis pendiente..."/>
        </Field>
      </div>

      <div style={s.card}>
        <SectionTitle>Notas Operativas</SectionTitle>
        <textarea style={{...s.input,minHeight:80,resize:"vertical"}} value={data.notas_contratos||""} onChange={e=>save("notas_contratos",e.target.value)} placeholder="Situaciones especiales, contratos por renovar, trabajadores próximos a término de periodo de prueba..."/>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// L-02 — Reglamento Interior de Trabajo
export function ModL02({client}){
  const {data,save,saving}=useModData(client,"L-02");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Estado del Reglamento Interior de Trabajo</SectionTitle>
        <InfoBox>El RIT es obligatorio para empresas con 10 o más trabajadores (art. 422 LFT). Sin depósito ante el Tribunal Laboral, <strong>no es oponible al trabajador</strong> — cualquier sanción basada en él puede ser impugnada exitosamente.</InfoBox>
        <div style={s.grid2}>
          <SelectField label="¿Existe RIT?" field="rit_existe" value={data.rit_existe} onChange={save} options={[{value:"si",label:"Sí — vigente"},{value:"desactualizado",label:"Sí — desactualizado"},{value:"no",label:"No existe"}]}/>
          <Field label="Fecha del RIT vigente"><input style={s.input} type="date" value={data.fecha_rit||""} onChange={e=>save("fecha_rit",e.target.value)}/></Field>
          <SelectField label="Depositado ante Tribunal Laboral" field="rit_depositado" value={data.rit_depositado} onChange={save} options={[{value:"si",label:"Sí — con acuse"},{value:"no",label:"No depositado"},{value:"en_tramite",label:"En trámite"}]}/>
          <Field label="Número de folio de depósito"><input style={s.input} value={data.folio_deposito_rit||""} onChange={e=>save("folio_deposito_rit",e.target.value)} placeholder="Folio asignado por el Tribunal"/></Field>
          <SelectField label="Publicado en instalaciones" field="rit_publicado" value={data.rit_publicado} onChange={save} options={[{value:"si",label:"Sí — en lugar visible"},{value:"no",label:"No"}]}/>
          <SelectField label="100% trabajadores firmaron conocimiento" field="rit_firmado_todos" value={data.rit_firmado_todos} onChange={save} options={[{value:"si",label:"Sí — todos"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]}/>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Contenido del RIT — Verificación de Cláusulas Obligatorias</SectionTitle>
        {[
          {field:"rit_horas_trabajo",label:"Horas de trabajo — jornada, turnos, descansos"},
          {field:"rit_teletrabajo",label:"Disposiciones de teletrabajo — equipos, gastos, desconexión digital"},
          {field:"rit_protocolo_hostigamiento",label:"Protocolo contra hostigamiento y acoso sexual (obligatorio desde 2019)"},
          {field:"rit_medidas_seguridad",label:"Medidas de seguridad e higiene en el trabajo"},
          {field:"rit_sanciones",label:"Régimen disciplinario y sanciones proporcionales"},
          {field:"rit_nom035",label:"Disposiciones NOM-035 — factores de riesgo psicosocial"},
          {field:"rit_vacaciones_2023",label:"Tabla de vacaciones actualizada a reforma 2023"},
        ].map(item=>(
          <div key={item.field} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+BORDER}}>
            <span style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{item.label}</span>
            <select style={{...s.input,width:"auto",minWidth:140}} value={data[item.field]||""} onChange={e=>save(item.field,e.target.value)}>
              <option value="">Sin revisar</option>
              <option value="incluido">✓ Incluido</option>
              <option value="pendiente">Pendiente de agregar</option>
              <option value="no_aplica">No aplica</option>
            </select>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <SectionTitle>Notas y Pendientes</SectionTitle>
        <textarea style={{...s.input,minHeight:80,resize:"vertical"}} value={data.notas_rit||""} onChange={e=>save("notas_rit",e.target.value)} placeholder="Actualizaciones pendientes, trámite de depósito en proceso, trabajadores sin firma..."/>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// L-03 — REPSE y Subcontratación
export function ModL03({client}){
  const {data,save,saving}=useModData(client,"L-03");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Posición de la Empresa en el Esquema REPSE</SectionTitle>
        <InfoBox color="#F0F9FF" border="#BAE6FD">La reforma de subcontratación de 2021 prohibió el outsourcing de personal y limitó los servicios especializados a actividades que <strong>no forman parte del objeto social ni de la actividad económica preponderante</strong> del contratante. Solo se permiten servicios especializados con REPSE vigente.</InfoBox>
        <div style={s.grid2}>
          <SelectField label="Rol de la empresa" field="rol_repse" value={data.rol_repse} onChange={save} options={[{value:"contratante",label:"Contratante — recibe servicios especializados"},{value:"prestador",label:"Prestador — presta servicios especializados"},{value:"ambos",label:"Ambos roles"},{value:"ninguno",label:"No aplica — sin servicios especializados"}]}/>
          <SelectField label="¿Tiene registro REPSE propio?" field="tiene_repse" value={data.tiene_repse} onChange={save} options={[{value:"si",label:"Sí — vigente"},{value:"en_tramite",label:"En trámite"},{value:"no",label:"No — no presta servicios a terceros"},{value:"requerido",label:"Requerido — no tramitado"}]}/>
          <Field label="Número de registro REPSE"><input style={s.input} value={data.numero_repse||""} onChange={e=>save("numero_repse",e.target.value)} placeholder="REPSE-XXXXXXX"/></Field>
          <Field label="Fecha de vencimiento del REPSE"><input style={s.input} type="date" value={data.vencimiento_repse||""} onChange={e=>save("vencimiento_repse",e.target.value)}/></Field>
          <Field label="Servicios especializados que presta"><input style={s.input} value={data.servicios_presta||""} onChange={e=>save("servicios_presta",e.target.value)} placeholder="Descripción de los servicios especializados"/></Field>
          <Field label="Número de clientes que reciben los servicios"><input style={s.input} type="number" value={data.num_clientes_repse||""} onChange={e=>save("num_clientes_repse",e.target.value)} placeholder="0"/></Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Informes Cuatrimestrales REPSE</SectionTitle>
        <InfoBox>Los prestadores de servicios especializados con REPSE deben presentar informes cuatrimestrales al STPS en <strong>enero, mayo y septiembre</strong>. La omisión de un informe puede resultar en la cancelación del registro y en multas.</InfoBox>
        <div style={s.grid2}>
          <SelectField label="Informe enero (1er cuatrimestre)" field="informe_enero" value={data.informe_enero} onChange={save} options={[{value:"presentado",label:"Presentado"},{value:"pendiente",label:"Pendiente"},{value:"na",label:"No aplica"}]}/>
          <SelectField label="Informe mayo (2do cuatrimestre)" field="informe_mayo" value={data.informe_mayo} onChange={save} options={[{value:"presentado",label:"Presentado"},{value:"pendiente",label:"Pendiente"},{value:"na",label:"No aplica"}]}/>
          <SelectField label="Informe septiembre (3er cuatrimestre)" field="informe_septiembre" value={data.informe_septiembre} onChange={save} options={[{value:"presentado",label:"Presentado"},{value:"pendiente",label:"Pendiente"},{value:"na",label:"No aplica"}]}/>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Proveedores de Servicios Especializados Contratados</SectionTitle>
        <div style={s.grid2}>
          <Field label="Número de proveedores con servicios especializados"><input style={s.input} type="number" value={data.num_proveedores_repse||""} onChange={e=>save("num_proveedores_repse",e.target.value)} placeholder="0"/></Field>
          <SelectField label="¿Todos tienen REPSE vigente verificado?" field="proveedores_repse_verificados" value={data.proveedores_repse_verificados} onChange={save} options={[{value:"si",label:"Sí — todos verificados"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No verificados"}]}/>
          <SelectField label="¿Verificación mensual en portal STPS?" field="verificacion_mensual" value={data.verificacion_mensual} onChange={save} options={[{value:"si",label:"Sí — mensual con evidencia"},{value:"ocasional",label:"Ocasional"},{value:"no",label:"No se verifica"}]}/>
          <SelectField label="¿Proveedores verificados en lista 69-B SAT?" field="verificacion_69b" value={data.verificacion_69b} onChange={save} options={[{value:"si",label:"Sí — mensual"},{value:"ocasional",label:"Ocasional"},{value:"no",label:"No"}]}/>
          <SelectField label="¿Contratos incluyen número de REPSE del proveedor?" field="contratos_con_repse" value={data.contratos_con_repse} onChange={save} options={[{value:"si",label:"Sí — todos"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]}/>
          <SelectField label="¿Se obtienen comprobantes IMSS/INFONAVIT del proveedor?" field="comprobantes_ss_proveedor" value={data.comprobantes_ss_proveedor} onChange={save} options={[{value:"si",label:"Sí — mensualmente"},{value:"ocasional",label:"Ocasionalmente"},{value:"no",label:"No"}]}/>
        </div>
        <Field label="Proveedores relevantes y observaciones">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_proveedores||""} onChange={e=>save("notas_proveedores",e.target.value)} placeholder="Lista de proveedores principales, status de REPSE, pendientes de verificación..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// L-04 — Terminaciones y Liquidaciones
export function ModL04({client}){
  const {data,save,saving}=useModData(client,"L-04");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Parámetros de Liquidación</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">Una <strong>liquidación por despido injustificado</strong> incluye: 3 meses de salario integrado + 20 días de salario integrado por año de servicio + partes proporcionales (aguinaldo, vacaciones, prima vacacional) + prima de antigüedad (15 días por año — tope 2 veces el SMG). La reforma de vacaciones 2023 incrementó las partes proporcionales en todos los cálculos.</InfoBox>
        <div style={s.grid2}>
          <Field label="Salario diario integrado promedio (MXN)"><input style={s.input} type="number" value={data.sdi_promedio||""} onChange={e=>save("sdi_promedio",e.target.value)} placeholder="Incluye todas las percepciones"/></Field>
          <SelectField label="¿Calculadora de liquidaciones actualizada a 2023?" field="calculadora_actualizada" value={data.calculadora_actualizada} onChange={save} options={[{value:"si",label:"Sí — con vacaciones reforma 2023"},{value:"no",label:"No — tabla anterior"}]}/>
          <Field label="Terminaciones en el último año"><input style={s.input} type="number" value={data.terminaciones_anio||""} onChange={e=>save("terminaciones_anio",e.target.value)} placeholder="0"/></Field>
          <Field label="Monto total pagado en liquidaciones (MXN)"><input style={s.input} type="number" value={data.monto_liquidaciones||""} onChange={e=>save("monto_liquidaciones",e.target.value)} placeholder="0"/></Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Proceso de Terminación — Checklist Operativo</SectionTitle>
        {[
          {field:"proceso_acta_rescision",label:"Acta de rescisión con causas específicas del art. 47 LFT"},
          {field:"proceso_finiquito_tribunal",label:"Finiquito ratificado ante Tribunal Laboral o Notario"},
          {field:"proceso_renuncia_tribunal",label:"Renuncia voluntaria ratificada ante Tribunal (art. 33 LFT)"},
          {field:"proceso_baja_imss_5dias",label:"Baja IMSS presentada dentro de 5 días"},
          {field:"proceso_calculo_correcto",label:"Cálculo con vacaciones reforma 2023 y SDI completo"},
          {field:"proceso_documentos_devueltos",label:"Documentos del trabajador devueltos — carta de recomendación emitida"},
          {field:"proceso_confidencialidad_recordada",label:"Obligación de confidencialidad recordada por escrito al salir"},
        ].map(item=>(
          <div key={item.field} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+BORDER}}>
            <span style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{item.label}</span>
            <select style={{...s.input,width:"auto",minWidth:140}} value={data[item.field]||""} onChange={e=>save(item.field,e.target.value)}>
              <option value="">Sin definir</option>
              <option value="siempre">Siempre se hace</option>
              <option value="a_veces">A veces</option>
              <option value="no">No se hace</option>
            </select>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <SectionTitle>Notas — Terminaciones Recientes o Pendientes</SectionTitle>
        <textarea style={{...s.input,minHeight:80,resize:"vertical"}} value={data.notas_terminaciones||""} onChange={e=>save("notas_terminaciones",e.target.value)} placeholder="Terminaciones en proceso, negociaciones activas, cálculos pendientes de revisión..."/>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// L-05 — Litigios Laborales
export function ModL05({client}){
  const {data,save,saving}=useModData(client,"L-05");
  const [juicios,setJuicios]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [nuevoJuicio,setNuevoJuicio]=useState({});

  useEffect(()=>{
    supabase.from("historial").select("*").eq("client_id",client.id).eq("tipo","juicio_laboral")
      .order("created_at",{ascending:false})
      .then(({data:d})=>setJuicios(d||[]));
  },[client.id]);

  async function agregarJuicio(){
    if(!nuevoJuicio.demandante) return;
    const j={...nuevoJuicio,client_id:client.id,tipo:"juicio_laboral",created_at:new Date().toISOString()};
    const {data:saved}=await supabase.from("historial").insert(j).select().single();
    if(saved){ setJuicios(prev=>[saved,...prev]); setNuevoJuicio({}); setShowForm(false); }
  }

  const montoTotal=juicios.reduce((sum,j)=>sum+(parseFloat(j.monto_riesgo)||0),0);

  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={s.scoreCard}><div style={{fontSize:26,color:juicios.filter(j=>j.status==="activo").length>0?RED:GREEN,fontFamily:"Georgia,serif"}}>{juicios.filter(j=>j.status==="activo").length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Juicios activos</div></div>
        <div style={s.scoreCard}><div style={{fontSize:26,color:MUSGO,fontFamily:"Georgia,serif"}}>{juicios.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Total expedientes</div></div>
        <div style={s.scoreCard}><div style={{fontSize:14,color:RED,fontFamily:"Georgia,serif",fontWeight:400}}>${montoTotal.toLocaleString("es-MX")}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Monto en riesgo MXN</div></div>
      </div>

      <InfoBox color="#FEF2F2" border="#FECACA">Los <strong>salarios caídos</strong> en juicios laborales activos crecen cada día desde la presentación de la demanda — sin tope desde 2019. Un juicio de 3 años con salario de $30,000/mes puede representar más de $1,000,000 MXN adicional solo en salarios caídos. La estrategia de convenir o pagar debe evaluarse permanentemente.</InfoBox>

      {/* Lista de juicios */}
      {juicios.map(j=>(
        <div key={j.id} style={{...s.card,borderLeft:"3px solid "+(j.status==="activo"?RED:j.status==="convenio"?GOLD:GREEN)}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <div style={{fontSize:13,fontFamily:"Georgia,serif",color:TEXT_DARK,fontWeight:500}}>{j.nombre||"Demandante sin nombre"}</div>
              <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>
                {j.tribunal&&<span>Tribunal: {j.tribunal} · </span>}
                {j.expediente&&<span>Exp: {j.expediente} · </span>}
                {j.etapa&&<span>Etapa: {j.etapa}</span>}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <Badge status={j.status||"activo"} label={j.status||"activo"}/>
              {j.monto_riesgo&&<div style={{fontSize:12,color:RED,fontFamily:"system-ui,sans-serif",marginTop:4,fontWeight:600}}>${parseFloat(j.monto_riesgo).toLocaleString("es-MX")} MXN</div>}
            </div>
          </div>
          {j.prestaciones&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif"}}>Prestaciones: {j.prestaciones}</div>}
          {j.estrategia&&<div style={{fontSize:11,color:MUSGO,fontFamily:"system-ui,sans-serif",marginTop:4}}>Estrategia: {j.estrategia}</div>}
        </div>
      ))}

      {/* Agregar juicio */}
      <button style={{...s.card,width:"100%",textAlign:"center",cursor:"pointer",color:MUSGO,fontSize:12,fontFamily:"system-ui,sans-serif",border:"1px dashed "+BORDER}} onClick={()=>setShowForm(!showForm)}>
        {showForm?"Cancelar":"+ Registrar juicio laboral"}
      </button>

      {showForm&&<div style={s.card}>
        <SectionTitle>Nuevo Expediente</SectionTitle>
        <div style={s.grid2}>
          <Field label="Nombre del demandante"><input style={s.input} value={nuevoJuicio.nombre||""} onChange={e=>setNuevoJuicio({...nuevoJuicio,nombre:e.target.value})}/></Field>
          <Field label="Número de expediente"><input style={s.input} value={nuevoJuicio.expediente||""} onChange={e=>setNuevoJuicio({...nuevoJuicio,expediente:e.target.value})} placeholder="Ej. 123/2024"/></Field>
          <Field label="Tribunal"><input style={s.input} value={nuevoJuicio.tribunal||""} onChange={e=>setNuevoJuicio({...nuevoJuicio,tribunal:e.target.value})} placeholder="Ej. TFJA CDMX — Sala 3"/></Field>
          <Field label="Etapa procesal">
            <select style={s.input} value={nuevoJuicio.etapa||""} onChange={e=>setNuevoJuicio({...nuevoJuicio,etapa:e.target.value})}>
              <option value="">Seleccionar</option>
              <option value="demanda_admitida">Demanda admitida</option>
              <option value="contestacion">Contestación</option>
              <option value="pruebas">Periodo de pruebas</option>
              <option value="alegatos">Alegatos</option>
              <option value="laudo">Laudo / Sentencia</option>
              <option value="amparo">Amparo</option>
              <option value="ejecucion">Ejecución de laudo</option>
            </select>
          </Field>
          <Field label="Monto en riesgo (MXN)"><input style={s.input} type="number" value={nuevoJuicio.monto_riesgo||""} onChange={e=>setNuevoJuicio({...nuevoJuicio,monto_riesgo:e.target.value})} placeholder="Estimado de la condena"/></Field>
          <Field label="Status">
            <select style={s.input} value={nuevoJuicio.status||""} onChange={e=>setNuevoJuicio({...nuevoJuicio,status:e.target.value})}>
              <option value="activo">Activo</option>
              <option value="convenio">En negociación de convenio</option>
              <option value="concluido">Concluido</option>
            </select>
          </Field>
        </div>
        <Field label="Prestaciones reclamadas"><input style={s.input} value={nuevoJuicio.prestaciones||""} onChange={e=>setNuevoJuicio({...nuevoJuicio,prestaciones:e.target.value})} placeholder="Ej. 3 meses, 20 días/año, vacaciones, horas extra..."/></Field>
        <Field label="Estrategia definida">
          <select style={s.input} value={nuevoJuicio.estrategia||""} onChange={e=>setNuevoJuicio({...nuevoJuicio,estrategia:e.target.value})}>
            <option value="">Seleccionar</option>
            <option value="litigar">Litigar — hay defensa sólida</option>
            <option value="convenir">Convenir — negociación activa</option>
            <option value="pagar">Pagar — condenable</option>
            <option value="evaluar">En evaluación</option>
          </select>
        </Field>
        <button onClick={agregarJuicio} style={{...s.card,background:MUSGO,color:WHITE,cursor:"pointer",textAlign:"center",marginTop:8,padding:"10px",fontSize:12,fontFamily:"system-ui,sans-serif",borderColor:MUSGO}}>Guardar expediente</button>
      </div>}

      <div style={{...s.card,marginTop:8}}>
        <SectionTitle>Provisión Contable y Notas</SectionTitle>
        <div style={s.grid2}>
          <Field label="Provisión contable registrada (MXN)"><input style={s.input} type="number" value={data.provision_contable||""} onChange={e=>save("provision_contable",e.target.value)} placeholder="Total provisionado"/></Field>
          <SelectField label="¿Provisión refleja contingencias reales?" field="provision_suficiente" value={data.provision_suficiente} onChange={save} options={[{value:"si",label:"Sí — suficiente"},{value:"insuficiente",label:"Insuficiente"},{value:"no_hay",label:"No hay provisión"}]}/>
        </div>
        <Field label="Notas generales de litigios">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_litigios||""} onChange={e=>save("notas_litigios",e.target.value)} placeholder="Estrategia general, negociaciones activas, contingencias importantes..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// L-06 — NOM-035 y Clima Laboral
export function ModL06({client}){
  const {data,save,saving}=useModData(client,"L-06");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>NOM-035 — Situación Actual</SectionTitle>
        <InfoBox>La NOM-035-STPS-2018 obliga a <strong>todos los patrones</strong> a identificar, analizar y prevenir los factores de riesgo psicosocial. La guía a aplicar depende del tamaño: <strong>Guía I</strong> (hasta 15 trabajadores), <strong>Guía II</strong> (16-50), <strong>Guía III</strong> (más de 50). El incumplimiento genera multa y responsabilidad civil.</InfoBox>
        <div style={s.grid2}>
          <Field label="Número de trabajadores (para determinar Guía)"><input style={s.input} type="number" value={data.num_trabajadores_nom||""} onChange={e=>save("num_trabajadores_nom",e.target.value)}/></Field>
          <SelectField label="Guía de referencia aplicada" field="guia_aplicada" value={data.guia_aplicada} onChange={save} options={[{value:"guia1",label:"Guía I — hasta 15 trabajadores"},{value:"guia2",label:"Guía II — 16 a 50 trabajadores"},{value:"guia3",label:"Guía III — más de 50 trabajadores"}]}/>
          <Field label="Fecha del último diagnóstico"><input style={s.input} type="date" value={data.fecha_diagnostico_nom||""} onChange={e=>save("fecha_diagnostico_nom",e.target.value)}/></Field>
          <SelectField label="Diagnóstico anual al corriente" field="diagnostico_al_corriente" value={data.diagnostico_al_corriente} onChange={save} options={[{value:"si",label:"Sí — vigente"},{value:"vencido",label:"Vencido — más de 1 año"},{value:"no",label:"No se ha realizado"}]}/>
          <SelectField label="Medidas de control implementadas" field="medidas_control" value={data.medidas_control} onChange={save} options={[{value:"si",label:"Sí — documentadas"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No implementadas"}]}/>
          <SelectField label="Resultados del diagnóstico" field="resultado_diagnostico" value={data.resultado_diagnostico} onChange={save} options={[{value:"bajo",label:"Nivel bajo — sin acciones urgentes"},{value:"medio",label:"Nivel medio — acciones preventivas"},{value:"alto",label:"Nivel alto — acciones correctivas urgentes"},{value:"sin_diagnostico",label:"Sin diagnóstico"}]}/>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Protocolo contra Hostigamiento y Acoso Sexual</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">Desde 2019, la reforma al art. 3 Bis LFT obliga a todos los patrones a contar con un <strong>protocolo para prevenir la discriminación por razón de género y para atender casos de violencia y acoso</strong>. La omisión genera responsabilidad civil y penal del patrón, además de multa STPS.</InfoBox>
        <div style={s.grid2}>
          <SelectField label="¿Existe protocolo formalizado?" field="protocolo_existe" value={data.protocolo_existe} onChange={save} options={[{value:"si_completo",label:"Sí — completo y difundido"},{value:"si_basico",label:"Sí — básico"},{value:"no",label:"No existe"}]}/>
          <SelectField label="¿Incluido en el RIT?" field="protocolo_en_rit" value={data.protocolo_en_rit} onChange={save} options={[{value:"si",label:"Sí"},{value:"no",label:"No"}]}/>
          <SelectField label="Mecanismo confidencial de denuncia" field="mecanismo_denuncia" value={data.mecanismo_denuncia} onChange={save} options={[{value:"si",label:"Sí — activo y conocido"},{value:"no",label:"No existe"}]}/>
          <SelectField label="Comité de atención de quejas integrado" field="comite_quejas" value={data.comite_quejas} onChange={save} options={[{value:"si",label:"Sí"},{value:"no",label:"No"}]}/>
        </div>
        <Field label="Casos activos o histórico relevante">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_hostigamiento||""} onChange={e=>save("notas_hostigamiento",e.target.value)} placeholder="Casos denunciados, resoluciones, acciones tomadas — confidencial"/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// L-07 — Seguridad Social Estratégica
export function ModL07({client}){
  const {data,save,saving}=useModData(client,"L-07");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Status IMSS e INFONAVIT</SectionTitle>
        <div style={s.grid2}>
          <SelectField label="Cuotas IMSS al corriente" field="imss_corriente" value={data.imss_corriente} onChange={save} options={[{value:"si",label:"Sí — sin adeudos"},{value:"convenio",label:"En convenio de pago"},{value:"no",label:"No — adeudo pendiente"}]}/>
          <Field label="Adeudo IMSS (MXN)"><input style={s.input} type="number" value={data.adeudo_imss||""} onChange={e=>save("adeudo_imss",e.target.value)} placeholder="0 si sin adeudo"/></Field>
          <SelectField label="Aportaciones INFONAVIT al corriente" field="infonavit_corriente" value={data.infonavit_corriente} onChange={save} options={[{value:"si",label:"Sí — sin adeudos"},{value:"convenio",label:"En convenio de pago"},{value:"no",label:"No — adeudo pendiente"}]}/>
          <Field label="Adeudo INFONAVIT (MXN)"><input style={s.input} type="number" value={data.adeudo_infonavit||""} onChange={e=>save("adeudo_infonavit",e.target.value)} placeholder="0 si sin adeudo"/></Field>
          <SelectField label="Opinión de cumplimiento IMSS vigente" field="opinion_imss" value={data.opinion_imss} onChange={save} options={[{value:"positiva",label:"Positiva — vigente"},{value:"negativa",label:"Negativa"},{value:"vencida",label:"Vencida"}]}/>
          <SelectField label="Opinión de cumplimiento INFONAVIT vigente" field="opinion_infonavit" value={data.opinion_infonavit} onChange={save} options={[{value:"positiva",label:"Positiva — vigente"},{value:"negativa",label:"Negativa"},{value:"vencida",label:"Vencida"}]}/>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Salario Base de Cotización (SBC) — Verificación de Integración</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">El <strong>SBC mal integrado</strong> es la causa más común de créditos IMSS. El SBC debe incluir <strong>todas las percepciones ordinarias y extraordinarias</strong> que el trabajador recibe regularmente: salario ordinario, tiempo extra habitual, prima dominical, comisiones regulares, y cualquier prestación en especie. Solo están exentos los conceptos expresamente listados en el art. 27 LSS.</InfoBox>
        {[
          {field:"sbc_salario_ordinario",label:"Salario ordinario incluido en SBC"},
          {field:"sbc_tiempo_extra",label:"Tiempo extra habitual incluido en SBC"},
          {field:"sbc_vales_despensa",label:"Vales de despensa — exentos hasta 40% del SMG diario"},
          {field:"sbc_prima_dominical",label:"Prima dominical incluida en SBC"},
          {field:"sbc_comisiones",label:"Comisiones regulares incluidas en SBC"},
          {field:"sbc_premios_asistencia",label:"Premios de puntualidad y asistencia — si son regulares, van en SBC"},
          {field:"sbc_gratificaciones",label:"Gratificaciones regulares incluidas en SBC"},
        ].map(item=>(
          <div key={item.field} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+BORDER}}>
            <span style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{item.label}</span>
            <select style={{...s.input,width:"auto",minWidth:160}} value={data[item.field]||""} onChange={e=>save(item.field,e.target.value)}>
              <option value="">Sin verificar</option>
              <option value="correcto">✓ Integrado correctamente</option>
              <option value="revisar">Requiere revisión</option>
              <option value="excluido_indebidamente">Excluido indebidamente</option>
              <option value="na">No aplica</option>
            </select>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <SectionTitle>Créditos INFONAVIT Activos</SectionTitle>
        <div style={s.grid2}>
          <Field label="Número de trabajadores con crédito INFONAVIT activo"><input style={s.input} type="number" value={data.num_creditos_infonavit||""} onChange={e=>save("num_creditos_infonavit",e.target.value)} placeholder="0"/></Field>
          <SelectField label="¿Descuentos aplicados correctamente en nómina?" field="descuentos_infonavit_correctos" value={data.descuentos_infonavit_correctos} onChange={save} options={[{value:"si",label:"Sí — todos"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]}/>
        </div>
        <Field label="Notas IMSS/INFONAVIT">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_ss||""} onChange={e=>save("notas_ss",e.target.value)} placeholder="Auditorías en proceso, créditos impugnados, convenios activos..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// L-08 — Directivos Clave y Retención
export function ModL08({client}){
  const {data,save,saving}=useModData(client,"L-08");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Directivos Clave — Inventario</SectionTitle>
        <div style={s.grid2}>
          <Field label="Número de directivos clave (C-Suite)"><input style={s.input} type="number" value={data.num_directivos||""} onChange={e=>save("num_directivos",e.target.value)} placeholder="0"/></Field>
          <SelectField label="¿Todos tienen contrato firmado?" field="contratos_directivos" value={data.contratos_directivos} onChange={save} options={[{value:"si",label:"Sí — todos"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]}/>
          <SelectField label="Compensación total aprobada por Consejo" field="compensacion_aprobada" value={data.compensacion_aprobada} onChange={save} options={[{value:"si",label:"Sí — acta de Consejo"},{value:"no",label:"No — sin aprobación formal"}]}/>
          <SelectField label="Póliza D&O vigente" field="d_o_vigente" value={data.d_o_vigente} onChange={save} options={[{value:"si",label:"Sí — todos los directivos y consejeros"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]}/>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Compensación Variable y Stock Options</SectionTitle>
        <InfoBox>En México, las cláusulas de <strong>no competencia post-empleo</strong> son válidas pero requieren una <strong>contraprestación adicional al salario</strong> — sin ella, son nulas. Los stock options deben estar en un plan aprobado por la Asamblea de Accionistas para ser exigibles y tener tratamiento fiscal claro.</InfoBox>
        <div style={s.grid2}>
          <SelectField label="¿Hay plan de compensación variable (bonos)?" field="plan_bonos" value={data.plan_bonos} onChange={save} options={[{value:"si_documentado",label:"Sí — documentado y aprobado"},{value:"si_informal",label:"Sí — informal"},{value:"no",label:"No"}]}/>
          <SelectField label="¿Hay métricas de bono definidas por escrito?" field="metricas_bono" value={data.metricas_bono} onChange={save} options={[{value:"si",label:"Sí — KPIs claros"},{value:"subjetivo",label:"Subjetivo — sin métricas"},{value:"no",label:"No hay bono"}]}/>
          <SelectField label="¿Hay plan de stock options o SARs?" field="plan_stock_options" value={data.plan_stock_options} onChange={save} options={[{value:"si_aprobado",label:"Sí — aprobado por Asamblea"},{value:"si_sin_aprobar",label:"Sí — sin aprobación formal"},{value:"no",label:"No"}]}/>
          <SelectField label="Vesting schedule definido" field="vesting_definido" value={data.vesting_definido} onChange={save} options={[{value:"si",label:"Sí — cliff + vesting mensual/anual"},{value:"no_cliff",label:"Sin cliff — vesting lineal"},{value:"no",label:"No definido"},{value:"na",label:"No aplica"}]}/>
          <SelectField label="¿Aceleración en cambio de control?" field="aceleracion_cambio_control" value={data.aceleracion_cambio_control} onChange={save} options={[{value:"single_trigger",label:"Single trigger — aceleración automática"},{value:"double_trigger",label:"Double trigger — terminación + cambio de control"},{value:"no",label:"Sin aceleración"},{value:"na",label:"No aplica"}]}/>
          <SelectField label="¿Hay política de Clawback?" field="clawback" value={data.clawback} onChange={save} options={[{value:"si",label:"Sí — documentada"},{value:"no",label:"No"},{value:"na",label:"No aplica — empresa no cotiza"}]}/>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Golden Parachute y Protecciones en Cambio de Control</SectionTitle>
        <InfoBox>El <strong>Golden Parachute</strong> es la compensación acordada al directivo en caso de terminación relacionada con un cambio de control (fusión, adquisición, cambio de accionista mayoritario). Debe aprobarse por el Consejo, tener límites razonables y estar vinculado a condiciones de no competencia.</InfoBox>
        <div style={s.grid2}>
          <SelectField label="¿Existe Golden Parachute para el CEO/DG?" field="golden_parachute_ceo" value={data.golden_parachute_ceo} onChange={save} options={[{value:"si",label:"Sí — aprobado por Consejo"},{value:"si_informal",label:"Sí — sin aprobación formal"},{value:"no",label:"No"}]}/>
          <Field label="Monto del Golden Parachute CEO (meses de sueldo)"><input style={s.input} type="number" value={data.meses_golden_parachute||""} onChange={e=>save("meses_golden_parachute",e.target.value)} placeholder="Ej. 24 meses"/></Field>
          <SelectField label="¿Golden Parachute para otros directivos?" field="golden_parachute_otros" value={data.golden_parachute_otros} onChange={save} options={[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"algunos",label:"Solo algunos"}]}/>
          <SelectField label="Trigger del Golden Parachute" field="trigger_golden" value={data.trigger_golden} onChange={save} options={[{value:"cambio_control",label:"Cambio de control únicamente"},{value:"terminacion",label:"Terminación sin causa"},{value:"ambos",label:"Cambio de control + terminación"},{value:"na",label:"No aplica"}]}/>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>No Competencia y Confidencialidad</SectionTitle>
        <InfoBox color="#F0FDF4" border="#BBF7D0">Una cláusula de no competencia válida en México debe: (1) tener contraprestación adicional al salario, (2) ser razonable en tiempo (máximo 2 años recomendado), (3) ser razonable en territorio, y (4) referirse a actividades específicas. Sin contraprestación, es nula y el directivo puede irse con la competencia sin restricción.</InfoBox>
        <div style={s.grid2}>
          <SelectField label="¿Cláusulas de no competencia con contraprestación?" field="no_competencia_contraprestacion" value={data.no_competencia_contraprestacion} onChange={save} options={[{value:"si",label:"Sí — con contraprestación válida"},{value:"sin_contraprestacion",label:"Sin contraprestación — nulas"},{value:"no",label:"No hay cláusulas"}]}/>
          <Field label="Duración de no competencia (meses)"><input style={s.input} type="number" value={data.duracion_no_competencia||""} onChange={e=>save("duracion_no_competencia",e.target.value)} placeholder="Ej. 12 o 24 meses"/></Field>
          <SelectField label="¿IP generada en el empleo a nombre de la empresa?" field="ip_empresa" value={data.ip_empresa} onChange={save} options={[{value:"si",label:"Sí — cláusula expresa en todos los contratos"},{value:"algunos",label:"Solo algunos contratos"},{value:"no",label:"No — riesgo de reclamación"}]}/>
          <SelectField label="¿Acuerdos de confidencialidad firmados?" field="confidencialidad_firmada" value={data.confidencialidad_firmada} onChange={save} options={[{value:"todos",label:"Todos los directivos"},{value:"algunos",label:"Solo algunos"},{value:"no",label:"No"}]}/>
        </div>
        <Field label="Notas — plan de sucesión y retención">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_directivos||""} onChange={e=>save("notas_directivos",e.target.value)} placeholder="Plan de sucesión documentado, directivos en riesgo de salida, negociaciones de renovación de contrato, retención de talento clave..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}
