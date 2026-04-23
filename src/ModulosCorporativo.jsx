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
    green:["#f0fdf4","#166534"],red:["#fef2f2","#991b1b"],amber:["#fffbeb","#92400e"],
    critico:["#fef2f2","#991b1b"],alto:["#fff7ed","#9a3412"],
    medio:["#fffbeb","#92400e"],bajo:["#f0fdf4","#166534"],
    activo:["#eff6ff","#1d4ed8"],concluido:["#f0fdf4","#166534"],
    pendiente:["#fffbeb","#92400e"],
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

function Field({label,children,fullWidth}){
  return <div style={fullWidth?{gridColumn:"1/-1"}:{}}><span style={s.label}>{label}</span>{children}</div>;
}

function Select({field,value,onChange,options,placeholder}){
  return(
    <select style={s.input} value={value||""} onChange={e=>onChange(field,e.target.value)}>
      <option value="">{placeholder||"Seleccionar"}</option>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCS CATALOG
// ─────────────────────────────────────────────────────────────────────────────
export const CORPORATIVO_DOCS = {
  "C-01": {
    docs: [
      {id:"acuerdo_fusion",label:"Acuerdo de fusión o escisión aprobado en asamblea",requerido:true,desc:"Con quórum calificado — art. 222-228 LGSM"},
      {id:"convenio_fusion",label:"Convenio de fusión o escisión protocolizado",requerido:true,desc:"Ante notario — inscrito en RPP y SAT"},
      {id:"balance_fusion",label:"Balance general de fusión aprobado",requerido:true,desc:"Por cada sociedad involucrada — con dictamen de auditor"},
      {id:"aviso_sat_fusion",label:"Aviso de fusión ante el SAT",requerido:true,desc:"Dentro del mes siguiente a la fecha del acuerdo — art. 14-B CFF"},
      {id:"aviso_sat_escision",label:"Aviso de escisión ante el SAT",requerido:false,desc:"Con plan de escisión — dentro de 30 días"},
      {id:"publicacion_poa",label:"Publicación en el POA (Periódico Oficial)",requerido:true,desc:"Aviso a acreedores — 3 meses antes de que surta efectos"},
      {id:"inscripcion_rpp_fusion",label:"Inscripción en RPP de la fusión/escisión",requerido:true,desc:"Con número de inscripción y fecha"},
      {id:"cancelacion_personas_morales",label:"Cancelación ante SAT de personas morales fusionadas/escindidas",requerido:true,desc:"RFC de las entidades que desaparecen"},
      {id:"acta_disolucion",label:"Acta de disolución y liquidación si aplica",requerido:false,desc:"Para sociedades que se disuelven en el proceso"},
      {id:"estudio_fiscal_fusion",label:"Estudio fiscal de la restructura",requerido:true,desc:"Análisis art. 14-B CFF — condiciones para no considerar enajenación"},
    ],
    checklist: [
      {id:"quorum_fusion",label:"Quórum calificado en asamblea de fusión/escisión (mayoría especial)",riesgo:"critico"},
      {id:"convenio_protocolizado",label:"Convenio de fusión/escisión protocolizado e inscrito en RPP",riesgo:"critico"},
      {id:"aviso_sat_30dias",label:"Aviso al SAT presentado dentro de los 30 días del acuerdo",riesgo:"critico"},
      {id:"publicacion_poa_3meses",label:"Publicación en POA con 3 meses de anticipación a acreedores",riesgo:"critico"},
      {id:"art14b_cff_cumplido",label:"Condiciones art. 14-B CFF cumplidas — sin enajenación fiscal",riesgo:"critico"},
      {id:"balances_auditados",label:"Balances de fusión dictaminados por auditor externo",riesgo:"alto"},
      {id:"rfc_cancelados",label:"RFC de entidades fusionadas/escindidas cancelados ante SAT",riesgo:"alto"},
      {id:"acreedores_notificados",label:"Acreedores notificados — sin oposición pendiente",riesgo:"alto"},
      {id:"libro_socios_actualizado",label:"Libro de socios/accionistas actualizado en la sobreviviente",riesgo:"alto"},
      {id:"contratos_novados",label:"Contratos con terceros novados o cedidos a la sobreviviente",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Fusión sin cumplir art. 14-B CFF — enajenación fiscal",impacto:"ISR sobre ganancia en la fusión + actualización + recargos — puede ser millones de pesos",nivel:"critico"},
      {label:"Sin publicación en POA — acreedor impugna la fusión",impacto:"Nulidad de la fusión — todos los actos realizados bajo la nueva estructura son cuestionables",nivel:"critico"},
      {label:"Quórum incorrecto en asamblea de fusión",impacto:"Nulidad del acuerdo — fusión impugnable por cualquier accionista disidente",nivel:"critico"},
      {label:"Contratos no cedidos — contraparte puede rescindir",impacto:"Pérdida de contratos clave al no notificar la fusión como cambio de control",nivel:"alto"},
      {label:"RFC no cancelados — obligaciones fiscales duplicadas",impacto:"Declaraciones omitidas de entidades que ya no existen — créditos fiscales",nivel:"alto"},
    ]
  },
  "C-02": {
    docs: [
      {id:"nda_dd",label:"NDA firmado por todas las partes del due diligence",requerido:true,desc:"Con cláusula de standstill si aplica"},
      {id:"data_room_indice",label:"Índice del data room entregado",requerido:true,desc:"Lista de documentos solicitados vs. documentos entregados"},
      {id:"reporte_dd_legal",label:"Reporte de due diligence legal",requerido:true,desc:"Con hallazgos, semáforo por área y recomendaciones"},
      {id:"reporte_dd_fiscal",label:"Reporte de due diligence fiscal",requerido:false,desc:"Contingencias SAT, IMSS, créditos fiscales"},
      {id:"reporte_dd_laboral",label:"Reporte de due diligence laboral",requerido:false,desc:"Juicios activos, REPSE, seguridad social"},
      {id:"carta_representaciones",label:"Carta de representaciones y garantías del vendedor",requerido:true,desc:"Warranties sobre el estado legal de la empresa"},
      {id:"lista_contingencias",label:"Lista de contingencias identificadas",requerido:true,desc:"Con monto estimado, probabilidad y recomendación"},
      {id:"escrow_contingencias",label:"Acuerdo de escrow para contingencias",requerido:false,desc:"Retención de precio de compra para cubrir contingencias post-cierre"},
    ],
    checklist: [
      {id:"nda_firmado",label:"NDA firmado antes de iniciar la revisión",riesgo:"critico"},
      {id:"data_room_completo",label:"Data room con documentos completos — sin gaps críticos",riesgo:"critico"},
      {id:"contingencias_provisionadas",label:"Contingencias identificadas y provisionadas en precio",riesgo:"critico"},
      {id:"juicios_inventariados",label:"Todos los juicios activos inventariados — laborales, civiles, fiscales",riesgo:"critico"},
      {id:"imss_sin_adeudos",label:"IMSS e INFONAVIT sin adeudos significativos",riesgo:"alto"},
      {id:"sat_sin_creditos",label:"Sin créditos fiscales SAT activos o con defensa documentada",riesgo:"alto"},
      {id:"propiedad_intelectual_titular",label:"PI clave a nombre de la empresa — no del fundador",riesgo:"critico"},
      {id:"contratos_clave_vigentes",label:"Contratos clave (clientes, proveedores, arrendamientos) vigentes y cedibles",riesgo:"alto"},
      {id:"change_of_control",label:"Cláusulas de change of control en contratos revisadas",riesgo:"critico"},
      {id:"permisos_vigentes",label:"Permisos y concesiones vigentes — cedibles a comprador",riesgo:"alto"},
      {id:"rep_warranties_completas",label:"Representaciones y garantías completas y verificadas",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Contingencia fiscal oculta descubierta post-cierre",impacto:"Ajuste al precio de compra + litigio con vendedor — o absorción por comprador si no hay escrow",nivel:"critico"},
      {label:"IP clave a nombre del fundador — no de la empresa",impacto:"Comprador adquiere empresa sin sus activos más valiosos — nulidad del negocio",nivel:"critico"},
      {label:"Cláusula de change of control en contrato clave",impacto:"Cliente o proveedor principal puede rescindir la relación al cierre — destruye el valor",nivel:"critico"},
      {label:"Juicios laborales sin descubrir — salarios caídos acumulados",impacto:"Responsabilidad por juicios desconocidos — sin protección si no hay rep & warranties",nivel:"alto"},
    ]
  },
  "C-03": {
    docs: [
      {id:"pacto_accionistas",label:"Pacto de accionistas vigente",requerido:true,desc:"Firmado por todos los accionistas — protocolizado si hay inmuebles o acciones representativas"},
      {id:"estatutos_actualizados",label:"Estatutos sociales actualizados con el pacto",requerido:true,desc:"Cláusulas de restricción de transmisión, quórum especial, veto"},
      {id:"cap_table",label:"Cap table actualizado",requerido:true,desc:"Tabla de capitalización — porcentajes, series, opciones, warrants, deuda convertible"},
      {id:"acuerdo_tag_drag",label:"Acuerdo de tag-along y drag-along",requerido:false,desc:"Derechos de co-venta y arrastre — en pacto o estatutos"},
      {id:"acuerdo_rofr",label:"Right of First Refusal (ROFR) documentado",requerido:false,desc:"Derecho de preferencia antes de vender a tercero"},
      {id:"acuerdo_anti_dilucion",label:"Acuerdo de anti-dilución documentado",requerido:false,desc:"Full ratchet o weighted average — protección para inversionistas"},
      {id:"liquidation_preference",label:"Liquidation preference documentada",requerido:false,desc:"Preferencia de liquidación y participación — 1x, 2x, participating"},
      {id:"vesting_fundadores",label:"Vesting schedule de fundadores",requerido:false,desc:"Con reverse vesting y cliff — protección ante salida anticipada"},
      {id:"acuerdo_confidencialidad_socios",label:"NDA entre socios y acuerdo de no competencia",requerido:true,desc:"Entre socios y la empresa — con contraprestación válida"},
    ],
    checklist: [
      {id:"pacto_accionistas_vigente",label:"Pacto de accionistas vigente y firmado por todos los socios",riesgo:"critico"},
      {id:"estatutos_alineados_pacto",label:"Estatutos alineados con el pacto — sin contradicciones",riesgo:"critico"},
      {id:"cap_table_correcto",label:"Cap table correcto — suma 100% — todas las series reflejadas",riesgo:"critico"},
      {id:"tag_drag_definido",label:"Tag-along y drag-along definidos con umbrales claros",riesgo:"alto"},
      {id:"rofr_definido",label:"ROFR con plazo y precio definidos",riesgo:"alto"},
      {id:"anti_dilucion_tipo",label:"Tipo de anti-dilución definido y comprendido por todos los socios",riesgo:"alto"},
      {id:"liquidation_pref_documentada",label:"Liquidation preference con múltiplo y participación claros",riesgo:"alto"},
      {id:"vesting_fundadores_activo",label:"Vesting de fundadores activo — con cliff y aceleración",riesgo:"alto"},
      {id:"mecanismo_deadlock",label:"Mecanismo de resolución de deadlock documentado",riesgo:"critico"},
      {id:"salida_socios_regulada",label:"Mecanismo de salida forzada (buy-sell, shotgun) documentado",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Sin pacto de accionistas — socio minoritario paraliza decisiones",impacto:"Deadlock indefinido — imposibilidad de tomar decisiones estratégicas sin unanimidad",nivel:"critico"},
      {label:"Sin mecanismo de arrastre (drag-along) — venta bloqueada",impacto:"Socio minoritario puede bloquear la venta de la empresa a cualquier precio",nivel:"critico"},
      {label:"Anti-dilución full ratchet mal entendida por fundadores",impacto:"Down round destruye participación de fundadores — pérdida del control de la empresa",nivel:"critico"},
      {label:"Vesting de fundadores sin reverse vesting",impacto:"Fundador que sale temprano se lleva 100% de sus acciones — desincentivo para los que se quedan",nivel:"alto"},
      {label:"Cap table incorrecto — acciones prometidas no documentadas",impacto:"Litigio por acciones — dilución inesperada en ronda o venta",nivel:"critico"},
    ]
  },
  "C-04": {
    docs: [
      {id:"safe_notas_convertibles",label:"SAFEs o notas convertibles vigentes",requerido:false,desc:"Con valuación cap, descuento, MFN y condiciones de conversión"},
      {id:"term_sheet_ronda",label:"Term sheet de ronda de inversión",requerido:false,desc:"Firmado — con valuación pre-money, monto, serie y condiciones principales"},
      {id:"shareholders_agreement_vc",label:"Shareholders agreement con inversionistas VC",requerido:false,desc:"Con todos los derechos de los inversionistas — information rights, pro-rata, board seat"},
      {id:"cap_table_diluted",label:"Cap table fully diluted",requerido:true,desc:"Con SAFEs, opciones, warrants y conversiones futuras — sin sorpresas en la ronda"},
      {id:"plan_opciones_empleados",label:"Plan de opciones para empleados (ESOP)",requerido:false,desc:"Pool reservado — porcentaje, vesting, precio de ejercicio, cliff"},
      {id:"certificado_inversion_extranjera",label:"Certificado de inversión extranjera ante RNIE",requerido:false,desc:"Si hay inversionistas extranjeros — obligatorio ante RNIE dentro de los 5 días"},
      {id:"autorizacion_cofece_inversion",label:"Análisis de concentración COFECE",requerido:false,desc:"Si la inversión supera umbrales de notificación COFECE"},
      {id:"information_rights",label:"Acuerdo de information rights con inversionistas",requerido:false,desc:"Frecuencia de reportes, estados financieros, KPIs — obligaciones de la empresa"},
    ],
    checklist: [
      {id:"safe_condiciones_claras",label:"SAFEs con valuación cap, descuento y MFN claros",riesgo:"critico"},
      {id:"cap_table_diluted_correcto",label:"Cap table fully diluted correcto — antes de la ronda",riesgo:"critico"},
      {id:"esop_pool_reservado",label:"ESOP pool reservado antes de la ronda — no dilutivo post-cierre",riesgo:"alto"},
      {id:"rnie_registrado",label:"Inversión extranjera registrada ante RNIE si aplica",riesgo:"critico"},
      {id:"board_composition",label:"Composición del Consejo post-ronda definida y documentada",riesgo:"alto"},
      {id:"pro_rata_rights",label:"Derechos pro-rata de inversionistas documentados",riesgo:"medio"},
      {id:"drag_along_inversionistas",label:"Drag-along que obliga a inversionistas en venta de la empresa",riesgo:"alto"},
      {id:"information_rights_cumplidos",label:"Reportes a inversionistas enviados en tiempo y forma",riesgo:"medio"},
      {id:"cofece_analizado",label:"Análisis COFECE realizado si supera umbrales",riesgo:"critico"},
    ],
    riesgos: [
      {label:"SAFE sin valuación cap — conversión en down round devastadora",impacto:"Fundadores diluidos a casi nada si la empresa vale menos en la ronda de conversión",nivel:"critico"},
      {label:"Cap table incorrecto antes de la ronda — sorpresas en closing",impacto:"Ronda se cae o se renegocia — daño reputacional con inversionistas",nivel:"critico"},
      {label:"Inversión extranjera sin registro RNIE",impacto:"Multa hasta $2,500,000 MXN + obligación de regularizar retroactivamente",nivel:"critico"},
      {label:"ESOP pool no reservado antes de la ronda",impacto:"Pool se toma de las acciones existentes — dilución inesperada para fundadores",nivel:"alto"},
      {label:"Information rights incumplidos — inversionista con derecho de aceleración",impacto:"Notas convertibles o SAFEs con trigger de incumplimiento — conversión forzada",nivel:"alto"},
    ]
  },
  "C-05": {
    docs: [
      {id:"acta_consejo_constitucion",label:"Acta de constitución del Consejo de Administración",requerido:true,desc:"Con número de consejeros, requisitos de independencia, periodicidad de sesiones"},
      {id:"reglamento_consejo",label:"Reglamento del Consejo de Administración",requerido:true,desc:"Convocatoria, quórum, votaciones, conflictos de interés, comités"},
      {id:"actas_consejo_ejercicio",label:"Actas del Consejo del ejercicio vigente",requerido:true,desc:"Firmadas por todos los asistentes — resguardadas en libro de actas"},
      {id:"declaraciones_conflicto_interes",label:"Declaraciones de conflicto de interés de consejeros",requerido:true,desc:"Anuales y por operación específica — art. 156-159 LGSM"},
      {id:"reglamento_comite_auditoria",label:"Reglamento del Comité de Auditoría",requerido:false,desc:"Integración, funciones, periodicidad — consejeros independientes"},
      {id:"reglamento_comite_compensacion",label:"Reglamento del Comité de Compensación",requerido:false,desc:"Aprobación de paquetes de directivos — criterios y límites"},
      {id:"reglamento_comite_riesgos",label:"Reglamento del Comité de Riesgos",requerido:false,desc:"Identificación y monitoreo de riesgos estratégicos, operativos y financieros"},
      {id:"codigo_etica",label:"Código de ética corporativa",requerido:true,desc:"Aprobado por el Consejo — comunicado a toda la organización"},
      {id:"politica_operaciones_partes_relacionadas",label:"Política de operaciones con partes relacionadas",requerido:true,desc:"Aprobación previa del Consejo o Comité — condiciones de mercado"},
      {id:"d_o_insurance_consejo",label:"Póliza D&O para consejeros",requerido:false,desc:"Cubre actuaciones de buena fe en el cargo — responsabilidad civil"},
    ],
    checklist: [
      {id:"consejo_integrado_correctamente",label:"Consejo integrado con número correcto de independientes",riesgo:"alto"},
      {id:"sesiones_periodicas",label:"Sesiones del Consejo con periodicidad definida — mínimo trimestral",riesgo:"alto"},
      {id:"actas_firmadas_resguardadas",label:"Actas firmadas y resguardadas en libro oficial",riesgo:"critico"},
      {id:"conflictos_interes_declarados",label:"Conflictos de interés declarados anualmente por todos los consejeros",riesgo:"critico"},
      {id:"comite_auditoria_activo",label:"Comité de Auditoría activo con consejeros independientes",riesgo:"alto"},
      {id:"operaciones_pr_aprobadas",label:"Operaciones con partes relacionadas aprobadas por Consejo",riesgo:"critico"},
      {id:"codigo_etica_publicado",label:"Código de ética publicado y firmado por directivos",riesgo:"medio"},
      {id:"d_o_consejeros_vigente",label:"D&O vigente para todos los consejeros",riesgo:"alto"},
      {id:"indemnizacion_consejeros",label:"Cláusula de indemnización a consejeros en estatutos o resolución",riesgo:"medio"},
      {id:"evaluacion_desempeno_consejo",label:"Evaluación de desempeño del Consejo realizada anualmente",riesgo:"bajo"},
    ],
    riesgos: [
      {label:"Operaciones con partes relacionadas sin aprobación del Consejo",impacto:"Nulidad de la operación + responsabilidad personal del director que la autorizó",nivel:"critico"},
      {label:"Consejero con conflicto de interés no declarado — vota en el acuerdo",impacto:"Nulidad del acuerdo + responsabilidad civil del consejero + acción de responsabilidad",nivel:"critico"},
      {label:"Sin actas del Consejo — decisiones no documentadas",impacto:"Imposibilidad de probar quórum y votaciones — impugnación de cualquier acuerdo",nivel:"critico"},
      {label:"Sin D&O — consejero demandado personalmente",impacto:"Patrimonio personal del consejero expuesto — renuncia de talento independiente",nivel:"alto"},
      {label:"Comité de Auditoría sin independencia real",impacto:"Auditor interno sin supervisión efectiva — riesgo de fraude sin detección",nivel:"alto"},
    ]
  },
  "C-06": {
    docs: [
      {id:"concesion_titulo",label:"Título de concesión o permiso vigente",requerido:true,desc:"Con número, fecha de otorgamiento, vigencia y condicionantes"},
      {id:"contrato_concesion",label:"Contrato de concesión o autorización",requerido:false,desc:"Si la concesión deriva de un contrato con el gobierno"},
      {id:"plan_negocios_concesion",label:"Plan de negocios aprobado por la autoridad",requerido:false,desc:"Con compromisos de inversión, metas y cronograma"},
      {id:"informes_regulatorios",label:"Informes periódicos a la autoridad reguladora",requerido:true,desc:"Según el sector — SENER, SCT, COFEPRIS, CNBV, CRE, etc."},
      {id:"garantias_concesion",label:"Garantías otorgadas al gobierno (fianzas, seguros)",requerido:false,desc:"Como condición de la concesión — vigentes y suficientes"},
      {id:"cumplimiento_condicionantes",label:"Registro de cumplimiento de condicionantes",requerido:true,desc:"Todas las obligaciones derivadas del título de concesión"},
      {id:"renovacion_concesion",label:"Solicitud de renovación de concesión",requerido:false,desc:"Si la concesión está próxima a vencer — con anticipación requerida"},
    ],
    checklist: [
      {id:"titulo_concesion_vigente",label:"Título de concesión o permiso vigente y actualizado",riesgo:"critico"},
      {id:"condicionantes_cumplidas",label:"Condicionantes de la concesión cumplidas al 100%",riesgo:"critico"},
      {id:"informes_regulatorios_corriente",label:"Informes a la autoridad reguladora al corriente",riesgo:"critico"},
      {id:"garantias_vigentes",label:"Garantías exigidas por la autoridad vigentes",riesgo:"alto"},
      {id:"renovacion_iniciada",label:"Proceso de renovación iniciado con anticipación suficiente",riesgo:"critico"},
      {id:"cambios_notificados_autoridad",label:"Cambios societarios notificados a la autoridad si son requisito",riesgo:"alto"},
      {id:"cesion_concesion_analizada",label:"Procedimiento de cesión de concesión analizado para M&A",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Incumplimiento de condicionante — revocación de la concesión",impacto:"Pérdida total del negocio concesionado — sin indemnización si es por incumplimiento",nivel:"critico"},
      {label:"Renovación no solicitada en tiempo — concesión vence",impacto:"Cese de operaciones + proceso de nueva licitación — competidores pueden ganar",nivel:"critico"},
      {label:"Cesión de concesión no autorizada en M&A",impacto:"Transacción nula respecto a la concesión — comprador no puede operar",nivel:"critico"},
      {label:"Cambio de control sin notificar a la autoridad",impacto:"Revocación automática si el título requiere notificación de cambio de control",nivel:"critico"},
    ]
  },
  "C-07": {
    docs: [
      {id:"autorizacion_cnbv",label:"Autorización o registro ante la CNBV",requerido:false,desc:"Casa de bolsa, banco, SOFOM regulada, aseguradora, AFORE"},
      {id:"autorizacion_cnsf",label:"Autorización ante la CNSF",requerido:false,desc:"Si es institución de seguros o fianzas"},
      {id:"licencia_banxico",label:"Autorización o registro ante Banxico",requerido:false,desc:"Si opera activos virtuales o transmisión de dinero"},
      {id:"manual_credito",label:"Manual de crédito y políticas de otorgamiento",requerido:false,desc:"SOFOM, SOFIPO — criterios de elegibilidad, límites, garantías"},
      {id:"programa_cumplimiento_regulatorio",label:"Programa de cumplimiento regulatorio financiero",requerido:true,desc:"Con oficial de cumplimiento — CNBV, CNSF, Banxico según aplique"},
      {id:"reportes_cnbv_corriente",label:"Reportes regulatorios a la CNBV al corriente",requerido:false,desc:"Mensuales, trimestrales y anuales según el tipo de entidad"},
      {id:"indices_capital",label:"Índices de capitalización y solvencia",requerido:false,desc:"ICAP para bancos — RCS para aseguradoras — mínimos regulatorios"},
      {id:"reservas_tecnicas",label:"Reservas técnicas constituidas (seguros)",requerido:false,desc:"Suficiencia actuarial — dictamen del actuario independiente"},
    ],
    checklist: [
      {id:"autorizacion_vigente",label:"Autorización regulatoria vigente y sin condicionantes incumplidas",riesgo:"critico"},
      {id:"oficial_cumplimiento_financiero",label:"Oficial de cumplimiento regulatorio designado y activo",riesgo:"critico"},
      {id:"reportes_regulatorios_corriente",label:"Reportes regulatorios al corriente — sin omisiones",riesgo:"critico"},
      {id:"indices_capital_minimos",label:"Índices de capitalización sobre el mínimo regulatorio",riesgo:"critico"},
      {id:"pld_financiero_completo",label:"Programa PLD conforme a disposiciones del regulador financiero",riesgo:"critico"},
      {id:"conducta_mercado",label:"Conductas de mercado — sin prácticas prohibidas por CNBV/COFECE",riesgo:"critico"},
      {id:"gobierno_corporativo_regulatorio",label:"Gobierno corporativo conforme a disposiciones del regulador",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Operación sin autorización regulatoria",impacto:"Clausura + multa hasta $26,000,000 MXN + responsabilidad penal de directivos",nivel:"critico"},
      {label:"Índice de capitalización bajo el mínimo — plan de saneamiento",impacto:"Intervención gerencial de la CNBV — pérdida del control de la entidad",nivel:"critico"},
      {label:"Reportes regulatorios omitidos",impacto:"Multa + apercibimiento público + intervención del regulador",nivel:"critico"},
      {label:"Prácticas de mercado prohibidas — manipulación",impacto:"Sanción CNBV/COFECE + daño reputacional irreversible + inhabilitación de directivos",nivel:"critico"},
    ]
  },
  "C-08": {
    docs: [
      {id:"protocolo_familia_empresarial",label:"Protocolo familiar empresarial",requerido:false,desc:"Reglas de acceso de familiares a la empresa, gobierno, dividendos, conflictos"},
      {id:"testamento_corporativo",label:"Testamento corporativo / testamento coordinado",requerido:false,desc:"Disposición de acciones en caso de fallecimiento — alineado con fideicomiso si existe"},
      {id:"acuerdo_sucesion_liderazgo",label:"Acuerdo de sucesión de liderazgo",requerido:false,desc:"Quién asume el control en caso de incapacidad o fallecimiento del fundador"},
      {id:"fideicomiso_sucesion",label:"Fideicomiso de control o sucesión",requerido:false,desc:"Para mantener unidad de la empresa en la sucesión — sin fragmentar acciones"},
      {id:"buy_sell_agreement",label:"Buy-sell agreement entre socios",requerido:false,desc:"Precio y condiciones para que socios restantes compren la parte del fallecido/incapacitado"},
      {id:"valuacion_empresa",label:"Valuación de la empresa actualizada",requerido:false,desc:"Para activar buy-sell, testamento o seguro de vida corporativo — máximo 2 años"},
      {id:"seguro_vida_socios",label:"Seguro de vida corporativo para socios clave",requerido:false,desc:"Para financiar el buy-sell — suma asegurada igual a la valuación de la participación"},
      {id:"consejo_familia",label:"Acta del Consejo de Familia",requerido:false,desc:"Órgano de gobierno de la familia — separado del Consejo de Administración"},
    ],
    checklist: [
      {id:"protocolo_familiar_documentado",label:"Protocolo familiar documentado y firmado por todos los familiares activos",riesgo:"alto"},
      {id:"testamento_coordinado_empresa",label:"Testamento del fundador coordinado con la estructura corporativa",riesgo:"critico"},
      {id:"sucesion_liderazgo_definida",label:"Sucesor del fundador/CEO definido y documentado",riesgo:"critico"},
      {id:"buy_sell_valuacion_actual",label:"Buy-sell agreement con valuación actualizada (menos de 2 años)",riesgo:"alto"},
      {id:"seguro_vida_suficiente",label:"Seguro de vida corporativo suficiente para financiar el buy-sell",riesgo:"alto"},
      {id:"fideicomiso_control_activo",label:"Fideicomiso de control activo — evita fragmentación de acciones",riesgo:"alto"},
      {id:"consejo_familia_activo",label:"Consejo de Familia activo con sesiones periódicas",riesgo:"medio"},
      {id:"siguiente_generacion_preparada",label:"Siguiente generación con preparación documentada para el relevo",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Fundador fallece sin testamento coordinado — acciones en sucesión intestamentaria",impacto:"Acciones fragmentadas entre herederos sin experiencia — parálisis operativa — litigio familiar",nivel:"critico"},
      {label:"Sin buy-sell agreement — heredero no quiere vender",impacto:"Heredero sin experiencia empresarial con derecho de bloqueo — destrucción de valor",nivel:"critico"},
      {label:"Sin seguro de vida — buy-sell sin financiamiento",impacto:"Socios restantes no pueden pagar la parte del fallecido — empresa en riesgo de liquidación",nivel:"critico"},
      {label:"Sin sucesor definido — vacío de liderazgo",impacto:"Parálisis operativa en el momento más crítico — pérdida de clientes y talento clave",nivel:"critico"},
      {label:"Protocolo familiar sin actualizar tras cambio generacional",impacto:"Conflicto entre ramas familiares — litigio que paraliza la empresa",nivel:"alto"},
    ]
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

// C-01 — Reestructura Societaria
export function ModC01({client}){
  const {data,save,saving}=useModData(client,"C-01");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Tipo de Restructura</SectionTitle>
        <div style={s.grid2}>
          <Field label="Tipo de operación">
            <Select field="tipo_restructura" value={data.tipo_restructura} onChange={save} options={[
              {value:"fusion_absorcion",label:"Fusión por absorción"},
              {value:"fusion_creacion",label:"Fusión por creación de nueva sociedad"},
              {value:"escision_pura",label:"Escisión pura"},
              {value:"escision_fusion",label:"Escisión-fusión"},
              {value:"transformacion",label:"Transformación de tipo social"},
            ]}/>
          </Field>
          <Field label="Status actual">
            <Select field="status_restructura" value={data.status_restructura} onChange={save} options={[
              {value:"planeacion",label:"En planeación"},
              {value:"aprobada_asamblea",label:"Aprobada en asamblea"},
              {value:"en_proceso",label:"En proceso — publicaciones/avisos"},
              {value:"concluida",label:"Concluida"},
            ]}/>
          </Field>
          <Field label="Sociedad sobreviviente / nueva">
            <input style={s.input} value={data.sociedad_sobreviviente||""} onChange={e=>save("sociedad_sobreviviente",e.target.value)} placeholder="Razón social"/>
          </Field>
          <Field label="Número de sociedades involucradas">
            <input style={s.input} type="number" value={data.num_sociedades||""} onChange={e=>save("num_sociedades",e.target.value)} placeholder="0"/>
          </Field>
          <Field label="Fecha del acuerdo de asamblea">
            <input style={s.input} type="date" value={data.fecha_acuerdo||""} onChange={e=>save("fecha_acuerdo",e.target.value)}/>
          </Field>
          <Field label="Fecha de surtimiento de efectos">
            <input style={s.input} type="date" value={data.fecha_efectos||""} onChange={e=>save("fecha_efectos",e.target.value)}/>
          </Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Flujo de Obligaciones Legales y Fiscales</SectionTitle>
        <InfoBox color="#F0F9FF" border="#BAE6FD">
          El <b>artículo 14-B del CFF</b> establece las condiciones para que una fusión o escisión no sea considerada enajenación fiscal. Si no se cumplen, el SAT puede gravar la operación como si fuera una venta — con ISR sobre la ganancia completa. Las condiciones deben verificarse antes de ejecutar la restructura.
        </InfoBox>
        {[
          {field:"cff14b_razon_negocio",label:"¿Existe razón de negocios válida documentada?",desc:"Eficiencia operativa, sinergias, reestructura de grupo — no evasión fiscal"},
          {field:"cff14b_un_ano",label:"¿Los accionistas conservarán las acciones por al menos 1 año?",desc:"Post-fusión/escisión — condición del art. 14-B"},
          {field:"cff14b_no_cambio_actividad",label:"¿La sociedad continuará con la misma actividad por al menos 1 año?",desc:"No se puede cambiar el giro inmediatamente después de la fusión"},
          {field:"cff14b_aviso_sat",label:"¿Aviso al SAT presentado dentro de los 30 días del acuerdo?",desc:"Con información de las sociedades involucradas y el plan"},
          {field:"publicacion_poa",label:"¿Publicación en POA realizada con 3 meses de anticipación?",desc:"Para que los acreedores puedan oponerse — art. 224 LGSM"},
          {field:"inscripcion_rpp",label:"¿Inscripción en RPP completada?",desc:"La fusión/escisión no surte efectos ante terceros hasta la inscripción"},
        ].map(item=>(
          <div key={item.field} style={{padding:"10px 0",borderBottom:"1px solid "+BORDER}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{item.label}</div>
                <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>{item.desc}</div>
              </div>
              <Select field={item.field} value={data[item.field]} onChange={save} options={[
                {value:"si",label:"✓ Sí"},
                {value:"no",label:"✗ No"},
                {value:"pendiente",label:"Pendiente"},
                {value:"na",label:"N/A"},
              ]}/>
            </div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <SectionTitle>Notario y Trámites</SectionTitle>
        <div style={s.grid2}>
          <Field label="Notario público a cargo">
            <input style={s.input} value={data.notario||""} onChange={e=>save("notario",e.target.value)} placeholder="Nombre del notario"/>
          </Field>
          <Field label="Número de escritura del convenio">
            <input style={s.input} value={data.num_escritura||""} onChange={e=>save("num_escritura",e.target.value)} placeholder="Número de escritura"/>
          </Field>
          <Field label="Número de folio RPP">
            <input style={s.input} value={data.folio_rpp||""} onChange={e=>save("folio_rpp",e.target.value)} placeholder="Folio de inscripción"/>
          </Field>
          <Field label="Asesor fiscal de la restructura">
            <input style={s.input} value={data.asesor_fiscal||""} onChange={e=>save("asesor_fiscal",e.target.value)} placeholder="Despacho fiscal externo"/>
          </Field>
        </div>
        <Field label="Notas y pendientes" fullWidth>
          <textarea style={{...s.input,...s.textarea}} value={data.notas_restructura||""} onChange={e=>save("notas_restructura",e.target.value)} placeholder="Pendientes de la restructura, contratos por novar, empleados por transferir, asuntos fiscales..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// C-02 — Due Diligence
export function ModC02({client}){
  const {data,save,saving}=useModData(client,"C-02");
  const [hallazgos,setHallazgos]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [nuevoH,setNuevoH]=useState({});

  useEffect(()=>{
    supabase.from("historial").select("*").eq("client_id",client.id).eq("tipo","hallazgo_dd")
      .order("created_at",{ascending:false})
      .then(({data:d})=>setHallazgos(d||[]));
  },[client.id]);

  async function agregarHallazgo(){
    if(!nuevoH.area) return;
    const h={...nuevoH,client_id:client.id,tipo:"hallazgo_dd",created_at:new Date().toISOString()};
    const {data:saved}=await supabase.from("historial").insert(h).select().single();
    if(saved){ setHallazgos(prev=>[saved,...prev]); setNuevoH({}); setShowForm(false); }
  }

  const criticos=hallazgos.filter(h=>h.nivel==="critico").length;
  const altos=hallazgos.filter(h=>h.nivel==="alto").length;
  const medios=hallazgos.filter(h=>h.nivel==="medio").length;

  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={s.scoreCard}><div style={{fontSize:26,color:criticos>0?RED:GREEN,fontFamily:"Georgia,serif"}}>{criticos}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Críticos</div></div>
        <div style={s.scoreCard}><div style={{fontSize:26,color:altos>0?GOLD:GREEN,fontFamily:"Georgia,serif"}}>{altos}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Altos</div></div>
        <div style={s.scoreCard}><div style={{fontSize:26,color:MUSGO,fontFamily:"Georgia,serif"}}>{hallazgos.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Total hallazgos</div></div>
      </div>

      <div style={s.card}>
        <SectionTitle>Status del Due Diligence</SectionTitle>
        <div style={s.grid2}>
          <Field label="Tipo de transacción">
            <Select field="tipo_transaccion" value={data.tipo_transaccion} onChange={save} options={[
              {value:"compra_acciones",label:"Compra de acciones (SPA)"},
              {value:"compra_activos",label:"Compra de activos"},
              {value:"fusion",label:"Fusión"},
              {value:"inversion_minoritaria",label:"Inversión minoritaria"},
              {value:"jv",label:"Joint venture"},
            ]}/>
          </Field>
          <Field label="Status del DD">
            <Select field="status_dd" value={data.status_dd} onChange={save} options={[
              {value:"en_proceso",label:"En proceso"},
              {value:"concluido",label:"Concluido"},
              {value:"pendiente_info",label:"Pendiente de información"},
            ]}/>
          </Field>
          <Field label="Empresa target">
            <input style={s.input} value={data.empresa_target||""} onChange={e=>save("empresa_target",e.target.value)} placeholder="Razón social de la empresa analizada"/>
          </Field>
          <Field label="Fecha de inicio del DD">
            <input style={s.input} type="date" value={data.fecha_inicio_dd||""} onChange={e=>save("fecha_inicio_dd",e.target.value)}/>
          </Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Semáforo por Área de Revisión</SectionTitle>
        {[
          {field:"dd_legal",label:"Legal — estructura societaria, contratos, litigios"},
          {field:"dd_fiscal",label:"Fiscal — SAT, IMSS, créditos fiscales"},
          {field:"dd_laboral",label:"Laboral — juicios, REPSE, seguridad social"},
          {field:"dd_pi",label:"Propiedad intelectual — marcas, patentes, software"},
          {field:"dd_ambiental",label:"Ambiental — permisos, pasivos, MIA"},
          {field:"dd_regulatorio",label:"Regulatorio — permisos, concesiones, autoridades"},
          {field:"dd_inmobiliario",label:"Inmobiliario — títulos, gravámenes, uso de suelo"},
          {field:"dd_contratos",label:"Contratos clave — clientes, proveedores, distribución"},
        ].map(item=>(
          <div key={item.field} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+BORDER}}>
            <span style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{item.label}</span>
            <Select field={item.field} value={data[item.field]} onChange={save} options={[
              {value:"verde",label:"✓ Sin hallazgos relevantes"},
              {value:"amarillo",label:"⚠ Hallazgos menores"},
              {value:"rojo",label:"✗ Hallazgos críticos"},
              {value:"pendiente",label:"Pendiente de revisar"},
            ]}/>
          </div>
        ))}
      </div>

      {/* Tracker de hallazgos */}
      <div style={s.card}>
        <SectionTitle>Hallazgos del Due Diligence</SectionTitle>
        {hallazgos.map(h=>(
          <div key={h.id} style={{...s.card,borderLeft:"3px solid "+(h.nivel==="critico"?RED:h.nivel==="alto"?GOLD:GREEN),marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,fontWeight:500}}>{h.area||"Área no definida"} — {h.nombre||"Hallazgo"}</div>
                {h.descripcion&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>{h.descripcion}</div>}
                {h.recomendacion&&<div style={{fontSize:11,color:MUSGO,fontFamily:"system-ui,sans-serif",marginTop:4}}>Recomendación: {h.recomendacion}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                <Badge status={h.nivel||"medio"} label={h.nivel||"medio"}/>
                {h.monto_estimado&&<div style={{fontSize:11,color:RED,fontFamily:"system-ui,sans-serif",marginTop:4}}>${parseFloat(h.monto_estimado).toLocaleString("es-MX")} MXN</div>}
              </div>
            </div>
          </div>
        ))}

        <button style={{...s.card,width:"100%",textAlign:"center",cursor:"pointer",color:MUSGO,fontSize:12,fontFamily:"system-ui,sans-serif",border:"1px dashed "+BORDER,marginTop:4}} onClick={()=>setShowForm(!showForm)}>
          {showForm?"Cancelar":"+ Registrar hallazgo"}
        </button>

        {showForm&&<div style={{...s.card,marginTop:8}}>
          <SectionTitle>Nuevo Hallazgo</SectionTitle>
          <div style={s.grid2}>
            <Field label="Área">
              <Select field="area" value={nuevoH.area||""} onChange={(f,v)=>setNuevoH({...nuevoH,[f]:v})} options={[
                {value:"Legal",label:"Legal"},{value:"Fiscal",label:"Fiscal"},{value:"Laboral",label:"Laboral"},
                {value:"PI",label:"Propiedad Intelectual"},{value:"Ambiental",label:"Ambiental"},
                {value:"Regulatorio",label:"Regulatorio"},{value:"Inmobiliario",label:"Inmobiliario"},
                {value:"Contratos",label:"Contratos"},
              ]}/>
            </Field>
            <Field label="Nivel de riesgo">
              <Select field="nivel" value={nuevoH.nivel||""} onChange={(f,v)=>setNuevoH({...nuevoH,[f]:v})} options={[
                {value:"critico",label:"Crítico"},{value:"alto",label:"Alto"},{value:"medio",label:"Medio"},{value:"bajo",label:"Bajo"},
              ]}/>
            </Field>
            <Field label="Nombre del hallazgo" fullWidth>
              <input style={s.input} value={nuevoH.nombre||""} onChange={e=>setNuevoH({...nuevoH,nombre:e.target.value})} placeholder="Ej. Crédito IMSS por SBC subintegrado"/>
            </Field>
            <Field label="Descripción" fullWidth>
              <textarea style={{...s.input,...s.textarea}} value={nuevoH.descripcion||""} onChange={e=>setNuevoH({...nuevoH,descripcion:e.target.value})} placeholder="Detalle del hallazgo..."/>
            </Field>
            <Field label="Monto estimado (MXN)">
              <input style={s.input} type="number" value={nuevoH.monto_estimado||""} onChange={e=>setNuevoH({...nuevoH,monto_estimado:e.target.value})} placeholder="0"/>
            </Field>
            <Field label="Recomendación">
              <Select field="recomendacion_tipo" value={nuevoH.recomendacion_tipo||""} onChange={(f,v)=>setNuevoH({...nuevoH,[f]:v})} options={[
                {value:"ajuste_precio",label:"Ajuste al precio de compra"},
                {value:"escrow",label:"Retener en escrow"},
                {value:"rep_warranty",label:"Rep & warranty del vendedor"},
                {value:"regularizar_cierre",label:"Regularizar antes del cierre"},
                {value:"deal_breaker",label:"Deal breaker — no cerrar"},
              ]}/>
            </Field>
          </div>
          <button onClick={agregarHallazgo} style={{...s.card,background:MUSGO,color:WHITE,cursor:"pointer",textAlign:"center",marginTop:8,padding:"10px",fontSize:12,fontFamily:"system-ui,sans-serif",borderColor:MUSGO}}>Guardar hallazgo</button>
        </div>}
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// C-03 — Capital Privado y Pactos
export function ModC03({client}){
  const {data,save,saving}=useModData(client,"C-03");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Estructura de Capital</SectionTitle>
        <div style={s.grid2}>
          <Field label="Número de socios/accionistas actuales">
            <input style={s.input} type="number" value={data.num_socios||""} onChange={e=>save("num_socios",e.target.value)} placeholder="0"/>
          </Field>
          <Field label="Tipo de sociedad">
            <Select field="tipo_sociedad" value={data.tipo_sociedad} onChange={save} options={[
              {value:"sa",label:"S.A. de C.V."},{value:"sapi",label:"S.A.P.I. de C.V."},
              {value:"srl",label:"S. de R.L. de C.V."},{value:"sc",label:"S.C."},
            ]}/>
          </Field>
          <Field label="Capital social fijo (MXN)">
            <input style={s.input} type="number" value={data.capital_fijo||""} onChange={e=>save("capital_fijo",e.target.value)} placeholder="Capital mínimo fijo"/>
          </Field>
          <Field label="Capital social variable (MXN)">
            <input style={s.input} type="number" value={data.capital_variable||""} onChange={e=>save("capital_variable",e.target.value)} placeholder="Capital variable actual"/>
          </Field>
          <Field label="¿Hay inversionistas externos?">
            <Select field="hay_inversionistas" value={data.hay_inversionistas} onChange={save} options={[
              {value:"si",label:"Sí — con acuerdos formales"},{value:"si_informal",label:"Sí — sin acuerdos formales"},{value:"no",label:"No — solo fundadores/familia"},
            ]}/>
          </Field>
          <Field label="Valuación implícita de la empresa (MXN)">
            <input style={s.input} type="number" value={data.valuacion||""} onChange={e=>save("valuacion",e.target.value)} placeholder="Estimado o última ronda"/>
          </Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Derechos de los Accionistas — Pacto</SectionTitle>
        <InfoBox>Los derechos que se describen a continuación son los más críticos en cualquier pacto de accionistas. Su ausencia o mala redacción es la causa más frecuente de conflictos societarios en empresas mexicanas con múltiples socios o inversionistas.</InfoBox>
        {[
          {field:"tag_along",label:"Tag-along (derecho de co-venta)",desc:"El socio minoritario puede sumarse a la venta en las mismas condiciones que el mayoritario. Sin él, el mayoritario puede vender su paquete y dejar al minoritario atrapado con el nuevo socio.",umbral:"Umbral típico: venta de más del 30% del capital"},
          {field:"drag_along",label:"Drag-along (derecho de arrastre)",desc:"El mayoritario puede obligar al minoritario a vender en las mismas condiciones. Necesario para que un comprador pueda adquirir el 100% — sin él, el minoritario puede bloquear la venta.",umbral:"Umbral típico: mayoría del 75% o acuerdo del Consejo"},
          {field:"rofr",label:"Right of First Refusal (ROFR)",desc:"Antes de vender a un tercero, el socio debe ofrecerle las acciones a los otros socios en las mismas condiciones. Protege la composición del accionariado.",umbral:"Plazo típico: 30 días para ejercer"},
          {field:"anti_dilucion",label:"Anti-dilución",desc:"Protege al inversionista de dilución en rondas a valuación menor (down round). Full ratchet ajusta el precio de conversión al nuevo precio. Weighted average es menos agresiva.",umbral:"Tipo: full ratchet (agresiva) vs. weighted average (balanceada)"},
          {field:"liquidation_pref",label:"Liquidation preference",desc:"Define quién cobra primero en una venta o liquidación y cuánto. Una preferencia 1x non-participating garantiza al inversionista recuperar su inversión antes que los fundadores. 2x participating es mucho más agresiva.",umbral:"Múltiplo típico: 1x non-participating"},
        ].map(item=>(
          <div key={item.field} style={{...s.card,borderLeft:"3px solid "+BORDER,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontFamily:"Georgia,serif",color:TEXT_DARK,fontWeight:500,marginBottom:3}}>{item.label}</div>
                <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:3}}>{item.desc}</div>
                <div style={{fontSize:10,color:MUSGO,fontFamily:"system-ui,sans-serif"}}>{item.umbral}</div>
              </div>
              <Select field={item.field} value={data[item.field]} onChange={save} options={[
                {value:"si_documentado",label:"✓ Documentado"},{value:"si_informal",label:"Informal"},{value:"no",label:"No existe"},
              ]}/>
            </div>
            {data[item.field]==="si_documentado"&&<Field label="Condiciones específicas pactadas">
              <input style={s.input} value={data[item.field+"_condiciones"]||""} onChange={e=>save(item.field+"_condiciones",e.target.value)} placeholder="Umbral, múltiplo, tipo, plazo..."/>
            </Field>}
          </div>
        ))}
      </div>

      <div style={s.card}>
        <SectionTitle>Gobierno y Resolución de Conflictos</SectionTitle>
        <div style={s.grid2}>
          <Field label="Mecanismo de resolución de deadlock">
            <Select field="deadlock_mecanismo" value={data.deadlock_mecanismo} onChange={save} options={[
              {value:"mediacion",label:"Mediación primero"},{value:"arbitraje",label:"Arbitraje vinculante"},
              {value:"buy_sell",label:"Buy-sell (shotgun)"},{value:"ninguno",label:"No definido"},
            ]}/>
          </Field>
          <Field label="Foro de resolución de disputas">
            <Select field="foro_disputas" value={data.foro_disputas} onChange={save} options={[
              {value:"arbitraje_cca",label:"Arbitraje CCA México"},{value:"arbitraje_icc",label:"Arbitraje ICC"},
              {value:"arbitraje_jams",label:"Arbitraje JAMS"},{value:"judicial_mexico",label:"Tribunales mexicanos"},
            ]}/>
          </Field>
          <Field label="Ley aplicable al pacto">
            <Select field="ley_aplicable" value={data.ley_aplicable} onChange={save} options={[
              {value:"mexico",label:"Derecho mexicano"},{value:"delaware",label:"Delaware — EUA"},
              {value:"cayman",label:"Cayman Islands"},{value:"otro",label:"Otro — especificar"},
            ]}/>
          </Field>
          <Field label="Vesting de fundadores activo">
            <Select field="vesting_fundadores_c03" value={data.vesting_fundadores_c03} onChange={save} options={[
              {value:"si",label:"Sí — con reverse vesting"},{value:"no",label:"No"},{value:"na",label:"No aplica"},
            ]}/>
          </Field>
        </div>
        <Field label="Notas del pacto y situación actual">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_pacto||""} onChange={e=>save("notas_pacto",e.target.value)} placeholder="Conflictos activos, negociaciones de entrada o salida de socios, actualización pendiente del pacto..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// C-04 — Startups y Venture Capital
export function ModC04({client}){
  const {data,save,saving}=useModData(client,"C-04");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Estado de la Empresa</SectionTitle>
        <div style={s.grid2}>
          <Field label="Etapa de la empresa">
            <Select field="etapa" value={data.etapa} onChange={save} options={[
              {value:"pre_seed",label:"Pre-seed — idea/MVP"},{value:"seed",label:"Seed — primeros clientes"},
              {value:"serie_a",label:"Serie A — escalando"},{value:"serie_b",label:"Serie B+"},
              {value:"growth",label:"Growth — rentable"},{value:"pre_ipo",label:"Pre-IPO"},
            ]}/>
          </Field>
          <Field label="Valuación pre-money última ronda (USD)">
            <input style={s.input} type="number" value={data.valuacion_usd||""} onChange={e=>save("valuacion_usd",e.target.value)} placeholder="0"/>
          </Field>
          <Field label="Monto levantado total (USD)">
            <input style={s.input} type="number" value={data.monto_total_usd||""} onChange={e=>save("monto_total_usd",e.target.value)} placeholder="0"/>
          </Field>
          <Field label="Runway actual (meses)">
            <input style={s.input} type="number" value={data.runway_meses||""} onChange={e=>save("runway_meses",e.target.value)} placeholder="Meses de operación con cash actual"/>
          </Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Instrumentos de Inversión Activos</SectionTitle>
        <InfoBox color="#F0F9FF" border="#BAE6FD">
          El <b>SAFE (Simple Agreement for Future Equity)</b> es el instrumento más común en etapas tempranas. No genera deuda — convierte a acciones en la siguiente ronda calificada. El <b>valuación cap</b> protege al inversionista de una valuación excesivamente alta en la conversión. El <b>descuento</b> le da acceso a un precio menor al de los nuevos inversionistas.
        </InfoBox>
        <div style={s.grid2}>
          <Field label="¿Hay SAFEs vigentes?">
            <Select field="hay_safes" value={data.hay_safes} onChange={save} options={[
              {value:"si",label:"Sí"},{value:"no",label:"No"},
            ]}/>
          </Field>
          {data.hay_safes==="si"&&<>
            <Field label="Monto total en SAFEs (USD)">
              <input style={s.input} type="number" value={data.monto_safes||""} onChange={e=>save("monto_safes",e.target.value)} placeholder="0"/>
            </Field>
            <Field label="Valuación cap más alta (USD)">
              <input style={s.input} type="number" value={data.cap_mas_alto||""} onChange={e=>save("cap_mas_alto",e.target.value)} placeholder="Cap del SAFE más favorable al inversionista"/>
            </Field>
            <Field label="Descuento típico de los SAFEs">
              <input style={s.input} value={data.descuento_safes||""} onChange={e=>save("descuento_safes",e.target.value)} placeholder="Ej. 20%"/>
            </Field>
            <Field label="¿Tienen cláusula MFN?">
              <Select field="mfn_safes" value={data.mfn_safes} onChange={save} options={[
                {value:"si",label:"Sí — todos"},{value:"algunos",label:"Algunos"},{value:"no",label:"No"},
              ]}/>
            </Field>
          </>}
          <Field label="¿Hay notas convertibles?">
            <Select field="hay_notas" value={data.hay_notas} onChange={save} options={[
              {value:"si",label:"Sí"},{value:"no",label:"No"},
            ]}/>
          </Field>
          {data.hay_notas==="si"&&<>
            <Field label="Monto total en notas convertibles (USD)">
              <input style={s.input} type="number" value={data.monto_notas||""} onChange={e=>save("monto_notas",e.target.value)} placeholder="0"/>
            </Field>
            <Field label="Tasa de interés de las notas">
              <input style={s.input} value={data.tasa_notas||""} onChange={e=>save("tasa_notas",e.target.value)} placeholder="Ej. 8% anual"/>
            </Field>
            <Field label="Vencimiento de las notas">
              <input style={s.input} type="date" value={data.vencimiento_notas||""} onChange={e=>save("vencimiento_notas",e.target.value)}/>
            </Field>
          </>}
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Cap Table y Dilución</SectionTitle>
        <div style={s.grid2}>
          <Field label="% Fundadores (fully diluted)">
            <input style={s.input} value={data.pct_fundadores||""} onChange={e=>save("pct_fundadores",e.target.value)} placeholder="Ej. 65%"/>
          </Field>
          <Field label="% Inversionistas (fully diluted)">
            <input style={s.input} value={data.pct_inversionistas||""} onChange={e=>save("pct_inversionistas",e.target.value)} placeholder="Ej. 25%"/>
          </Field>
          <Field label="% ESOP pool (fully diluted)">
            <input style={s.input} value={data.pct_esop||""} onChange={e=>save("pct_esop",e.target.value)} placeholder="Ej. 10%"/>
          </Field>
          <Field label="% SAFEs/notas (fully diluted estimado)">
            <input style={s.input} value={data.pct_safes_notas||""} onChange={e=>save("pct_safes_notas",e.target.value)} placeholder="Estimado de dilución post-conversión"/>
          </Field>
          <Field label="¿Cap table validado por abogado?">
            <Select field="cap_table_validado" value={data.cap_table_validado} onChange={save} options={[
              {value:"si",label:"Sí — validado y firmado"},{value:"no",label:"No — solo en spreadsheet"},
            ]}/>
          </Field>
          <Field label="Registro RNIE de inversión extranjera">
            <Select field="rnie_registrado" value={data.rnie_registrado} onChange={save} options={[
              {value:"si",label:"Sí — todos los inversionistas extranjeros"},{value:"no",label:"No"},{value:"na",label:"No hay inversión extranjera"},
            ]}/>
          </Field>
        </div>
        <Field label="Notas — próxima ronda y estrategia">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_vc||""} onChange={e=>save("notas_vc",e.target.value)} placeholder="Próxima ronda planeada, inversionistas en proceso, condiciones clave, due diligence en curso..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// C-05 — Gobierno Corporativo Avanzado
export function ModC05({client}){
  const {data,save,saving}=useModData(client,"C-05");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Composición del Consejo de Administración</SectionTitle>
        <InfoBox>Un <b>Consejo efectivo</b> requiere consejeros independientes para que las decisiones sean objetivas — especialmente en conflictos de interés, operaciones con partes relacionadas y compensación de directivos. Sin independencia real, el Consejo es solo una formalidad que no protege a los accionistas minoritarios.</InfoBox>
        <div style={s.grid2}>
          <Field label="Número total de consejeros">
            <input style={s.input} type="number" value={data.num_consejeros||""} onChange={e=>save("num_consejeros",e.target.value)} placeholder="0"/>
          </Field>
          <Field label="Consejeros independientes">
            <input style={s.input} type="number" value={data.num_independientes||""} onChange={e=>save("num_independientes",e.target.value)} placeholder="0"/>
          </Field>
          <Field label="Consejeros patrimoniales (accionistas)">
            <input style={s.input} type="number" value={data.num_patrimoniales||""} onChange={e=>save("num_patrimoniales",e.target.value)} placeholder="0"/>
          </Field>
          <Field label="¿Hay Presidente del Consejo?">
            <Select field="presidente_consejo" value={data.presidente_consejo} onChange={save} options={[
              {value:"si_independiente",label:"Sí — independiente"},{value:"si_no_independiente",label:"Sí — no independiente"},{value:"no",label:"No"},
            ]}/>
          </Field>
          <Field label="¿CEO y Presidente del Consejo son la misma persona?">
            <Select field="ceo_presidente_mismo" value={data.ceo_presidente_mismo} onChange={save} options={[
              {value:"no",label:"No — funciones separadas"},{value:"si",label:"Sí — misma persona"},
            ]}/>
          </Field>
          <Field label="Periodicidad de sesiones ordinarias">
            <Select field="periodicidad_sesiones" value={data.periodicidad_sesiones} onChange={save} options={[
              {value:"mensual",label:"Mensual"},{value:"bimestral",label:"Bimestral"},{value:"trimestral",label:"Trimestral"},{value:"semestral",label:"Semestral"},
            ]}/>
          </Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Comités del Consejo</SectionTitle>
        {[
          {field:"comite_auditoria",label:"Comité de Auditoría",desc:"Supervisa auditoría interna y externa, estados financieros, control interno y cumplimiento. Debe ser mayoritariamente independiente."},
          {field:"comite_compensacion",label:"Comité de Compensación",desc:"Aprueba paquetes de compensación de directivos, bonos, stock options y golden parachutes. Previene excesos y conflictos de interés."},
          {field:"comite_riesgos",label:"Comité de Riesgos",desc:"Identifica, evalúa y monitorea riesgos estratégicos, operativos, financieros y de cumplimiento. Reporta al Consejo."},
          {field:"comite_nombramientos",label:"Comité de Nombramientos",desc:"Propone candidatos a consejeros y directivos. Asegura proceso de selección objetivo e independiente."},
        ].map(item=>(
          <div key={item.field} style={{...s.card,borderLeft:"3px solid "+BORDER,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontFamily:"Georgia,serif",color:TEXT_DARK,fontWeight:500,marginBottom:3}}>{item.label}</div>
                <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif"}}>{item.desc}</div>
              </div>
              <Select field={item.field} value={data[item.field]} onChange={save} options={[
                {value:"activo_independiente",label:"✓ Activo — independiente"},{value:"activo_no_independiente",label:"Activo — no independiente"},{value:"no",label:"No existe"},
              ]}/>
            </div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <SectionTitle>Conflictos de Interés y Operaciones con Partes Relacionadas</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">
          El artículo 156-159 de la LGSM establece que un consejero con <b>interés personal en una operación</b> debe abstenerse de participar en la deliberación y votación. Si vota a pesar del conflicto, la operación puede ser nula y el consejero responde por daños y perjuicios.
        </InfoBox>
        <div style={s.grid2}>
          <Field label="¿Declaraciones anuales de conflicto de interés?">
            <Select field="declaraciones_ci" value={data.declaraciones_ci} onChange={save} options={[
              {value:"si_todos",label:"Sí — todos los consejeros"},{value:"algunos",label:"Algunos"},{value:"no",label:"No"},
            ]}/>
          </Field>
          <Field label="¿Política de operaciones con partes relacionadas?">
            <Select field="politica_opr" value={data.politica_opr} onChange={save} options={[
              {value:"si",label:"Sí — aprobada por Consejo"},{value:"no",label:"No"},
            ]}/>
          </Field>
          <Field label="¿Operaciones con partes relacionadas en el ejercicio?">
            <Select field="hay_opr" value={data.hay_opr} onChange={save} options={[
              {value:"no",label:"No"},{value:"si_aprobadas",label:"Sí — aprobadas por Consejo"},{value:"si_sin_aprobar",label:"Sí — sin aprobación del Consejo"},
            ]}/>
          </Field>
          <Field label="Monto total de OPR del ejercicio (MXN)">
            <input style={s.input} type="number" value={data.monto_opr||""} onChange={e=>save("monto_opr",e.target.value)} placeholder="0"/>
          </Field>
        </div>
        <Field label="Notas del Consejo">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_consejo||""} onChange={e=>save("notas_consejo",e.target.value)} placeholder="Consejeros próximos a renovar, comités por integrar, evaluación de desempeño pendiente, operaciones con partes relacionadas relevantes..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// C-06 — Concesiones y Regulatorio
export function ModC06({client}){
  const {data,save,saving}=useModData(client,"C-06");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Títulos de Concesión y Permisos</SectionTitle>
        <div style={s.grid2}>
          <Field label="Autoridad otorgante">
            <Select field="autoridad" value={data.autoridad} onChange={save} options={[
              {value:"sener",label:"SENER — energía"},{value:"sct",label:"SCT — transporte y telecomunicaciones"},
              {value:"cofepris",label:"COFEPRIS — salud"},{value:"cnbv",label:"CNBV — financiero"},
              {value:"cre",label:"CRE — energía regulada"},{value:"ifetel",label:"IFT — telecomunicaciones"},
              {value:"agua",label:"CONAGUA — agua"},{value:"mineria",label:"SGM — minería"},
              {value:"otra",label:"Otra autoridad"},
            ]}/>
          </Field>
          <Field label="Número de título/permiso">
            <input style={s.input} value={data.num_titulo||""} onChange={e=>save("num_titulo",e.target.value)} placeholder="Número oficial del título"/>
          </Field>
          <Field label="Fecha de otorgamiento">
            <input style={s.input} type="date" value={data.fecha_otorgamiento||""} onChange={e=>save("fecha_otorgamiento",e.target.value)}/>
          </Field>
          <Field label="Fecha de vencimiento">
            <input style={s.input} type="date" value={data.fecha_vencimiento_concesion||""} onChange={e=>save("fecha_vencimiento_concesion",e.target.value)}/>
          </Field>
          <Field label="Status del título">
            <Select field="status_concesion" value={data.status_concesion} onChange={save} options={[
              {value:"vigente",label:"Vigente — sin condicionantes incumplidas"},
              {value:"vigente_condicionantes",label:"Vigente — con condicionantes pendientes"},
              {value:"en_renovacion",label:"En proceso de renovación"},
              {value:"suspendido",label:"Suspendido temporalmente"},
            ]}/>
          </Field>
          <Field label="Monto de garantías otorgadas (MXN)">
            <input style={s.input} type="number" value={data.monto_garantias||""} onChange={e=>save("monto_garantias",e.target.value)} placeholder="Fianzas o seguros a favor del gobierno"/>
          </Field>
        </div>
        <Field label="Condicionantes críticas del título">
          <textarea style={{...s.input,...s.textarea}} value={data.condicionantes||""} onChange={e=>save("condicionantes",e.target.value)} placeholder="Lista las obligaciones específicas del título de concesión — inversiones mínimas, metas de cobertura, reportes, etc."/>
        </Field>
      </div>

      <div style={s.card}>
        <SectionTitle>Reportes Regulatorios</SectionTitle>
        <div style={s.grid2}>
          <Field label="Frecuencia de reportes a la autoridad">
            <Select field="frecuencia_reportes" value={data.frecuencia_reportes} onChange={save} options={[
              {value:"mensual",label:"Mensual"},{value:"trimestral",label:"Trimestral"},
              {value:"semestral",label:"Semestral"},{value:"anual",label:"Anual"},
            ]}/>
          </Field>
          <Field label="¿Reportes al corriente?">
            <Select field="reportes_corriente" value={data.reportes_corriente} onChange={save} options={[
              {value:"si",label:"Sí — todos presentados"},{value:"no",label:"No — hay omisiones"},{value:"parcial",label:"Parcialmente"},
            ]}/>
          </Field>
        </div>
        <Field label="Notas regulatorias">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_concesion||""} onChange={e=>save("notas_concesion",e.target.value)} placeholder="Inspecciones recientes, sanciones activas, renovación en proceso, cambios regulatorios pendientes..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// C-07 — Sector Financiero Regulado
export function ModC07({client}){
  const {data,save,saving}=useModData(client,"C-07");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Tipo de Entidad Financiera</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">
          Operar como entidad financiera sin la autorización correspondiente es un delito federal en México. La CNBV, CNSF y Banxico tienen facultades para clausurar, multar e inhabilitar a directivos de entidades que operen sin licencia o que incumplan con los requerimientos de capitalización.
        </InfoBox>
        <div style={s.grid2}>
          <Field label="Tipo de entidad">
            <Select field="tipo_entidad_financiera" value={data.tipo_entidad_financiera} onChange={save} options={[
              {value:"banco",label:"Institución de banca múltiple"},{value:"sofom_r",label:"SOFOM regulada"},
              {value:"sofom_enr",label:"SOFOM no regulada"},{value:"sofipo",label:"SOFIPO"},
              {value:"casa_bolsa",label:"Casa de bolsa"},{value:"aseguradora",label:"Institución de seguros"},
              {value:"afianzadora",label:"Institución de fianzas"},{value:"afore",label:"AFORE"},
              {value:"fondo_inversion",label:"Fondo de inversión"},{value:"sociedad_cooperativa",label:"Sociedad cooperativa de ahorro"},
            ]}/>
          </Field>
          <Field label="Regulador principal">
            <Select field="regulador_principal" value={data.regulador_principal} onChange={save} options={[
              {value:"cnbv",label:"CNBV"},{value:"cnsf",label:"CNSF"},{value:"banxico",label:"Banxico"},
              {value:"consar",label:"CONSAR"},{value:"multiple",label:"Múltiples reguladores"},
            ]}/>
          </Field>
          <Field label="Número de autorización">
            <input style={s.input} value={data.num_autorizacion||""} onChange={e=>save("num_autorizacion",e.target.value)} placeholder="Número oficial de la autorización"/>
          </Field>
          <Field label="Fecha de autorización">
            <input style={s.input} type="date" value={data.fecha_autorizacion||""} onChange={e=>save("fecha_autorizacion",e.target.value)}/>
          </Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Indicadores de Cumplimiento Regulatorio</SectionTitle>
        <div style={s.grid2}>
          <Field label="Índice de capitalización (ICAP %)">
            <input style={s.input} value={data.icap||""} onChange={e=>save("icap",e.target.value)} placeholder="Mínimo regulatorio: 10.5%"/>
          </Field>
          <Field label="Status del ICAP">
            <Select field="status_icap" value={data.status_icap} onChange={save} options={[
              {value:"sobre_minimo",label:"Sobre el mínimo regulatorio"},{value:"cerca_minimo",label:"Cerca del mínimo — alerta"},
              {value:"bajo_minimo",label:"Bajo el mínimo — plan de saneamiento"},{value:"na",label:"No aplica"},
            ]}/>
          </Field>
          <Field label="Oficial de cumplimiento regulatorio">
            <input style={s.input} value={data.oficial_cumplimiento_financiero||""} onChange={e=>save("oficial_cumplimiento_financiero",e.target.value)} placeholder="Nombre y registro"/>
          </Field>
          <Field label="Reportes regulatorios al corriente">
            <Select field="reportes_regulatorios_financiero" value={data.reportes_regulatorios_financiero} onChange={save} options={[
              {value:"si",label:"Sí — todos al corriente"},{value:"no",label:"No — hay omisiones"},{value:"parcial",label:"Parcialmente"},
            ]}/>
          </Field>
          <Field label="¿Hay procedimientos sancionatorios activos?">
            <Select field="procedimientos_cnbv" value={data.procedimientos_cnbv} onChange={save} options={[
              {value:"no",label:"No"},{value:"si",label:"Sí — especificar en notas"},
            ]}/>
          </Field>
          <Field label="PLD — programa completo y actualizado">
            <Select field="pld_financiero" value={data.pld_financiero} onChange={save} options={[
              {value:"completo",label:"Completo — auditado"},{value:"parcial",label:"Parcial"},{value:"no",label:"No"},
            ]}/>
          </Field>
        </div>
        <Field label="Notas regulatorias financieras">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_financiero||""} onChange={e=>save("notas_financiero",e.target.value)} placeholder="Inspecciones CNBV recientes, observaciones, planes de acción, cambios regulatorios..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}

// C-08 — Sucesión y Protocolo Familiar
export function ModC08({client}){
  const {data,save,saving}=useModData(client,"C-08");
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <SectionTitle>Diagnóstico de Empresa Familiar</SectionTitle>
        <InfoBox color="#FEF2F2" border="#FECACA">
          El <b>70% de las empresas familiares no sobreviven al fundador</b>. La causa principal no es falta de capital — es ausencia de reglas claras para la sucesión, el gobierno y la resolución de conflictos familiares. El Protocolo Familiar es el instrumento que establece esas reglas antes de que se necesiten.
        </InfoBox>
        <div style={s.grid2}>
          <Field label="Generación actual de la empresa">
            <Select field="generacion" value={data.generacion} onChange={save} options={[
              {value:"1g",label:"1a generación — fundador activo"},{value:"2g",label:"2a generación — hijos activos"},
              {value:"3g",label:"3a generación — nietos activos"},{value:"mixta",label:"Transición — múltiples generaciones"},
            ]}/>
          </Field>
          <Field label="Número de familiares en la empresa">
            <input style={s.input} type="number" value={data.num_familiares_empresa||""} onChange={e=>save("num_familiares_empresa",e.target.value)} placeholder="0"/>
          </Field>
          <Field label="Número de accionistas familiares (no activos)">
            <input style={s.input} type="number" value={data.num_accionistas_familiares||""} onChange={e=>save("num_accionistas_familiares",e.target.value)} placeholder="0"/>
          </Field>
          <Field label="¿Hay conflicto familiar activo?">
            <Select field="conflicto_familiar" value={data.conflicto_familiar} onChange={save} options={[
              {value:"no",label:"No"},{value:"latente",label:"Latente — tensiones sin resolver"},{value:"activo",label:"Activo — requiere intervención"},
            ]}/>
          </Field>
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Protocolo Familiar</SectionTitle>
        <InfoBox color="#F0FDF4" border="#BBF7D0">
          El <b>Protocolo Familiar</b> no es un documento legal en sentido estricto — es un acuerdo de familia que regula la relación entre la familia y la empresa. Su fuerza no viene de la ley sino del compromiso de todos los miembros. Para que sea efectivo debe incluirse en el pacto de accionistas y en los estatutos.
        </InfoBox>
        <div style={s.grid2}>
          <Field label="¿Existe protocolo familiar?">
            <Select field="protocolo_existe" value={data.protocolo_existe} onChange={save} options={[
              {value:"si_firmado",label:"Sí — firmado por todos los familiares"},
              {value:"si_borrador",label:"En proceso de negociación"},
              {value:"no",label:"No existe"},
            ]}/>
          </Field>
          <Field label="¿Protocolo incorporado al pacto de accionistas?">
            <Select field="protocolo_en_pacto" value={data.protocolo_en_pacto} onChange={save} options={[
              {value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"Sin pacto de accionistas"},
            ]}/>
          </Field>
        </div>
        <div style={{marginTop:10}}>
          <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:8}}>TEMAS QUE DEBE CUBRIR EL PROTOCOLO:</div>
          {[
            {field:"prot_acceso_empresa",label:"Reglas de acceso de familiares a la empresa (requisitos, puestos permitidos, remuneración)"},
            {field:"prot_dividendos",label:"Política de dividendos — cuándo se reparten y cuánto se reinvierte"},
            {field:"prot_acciones",label:"Restricciones a la transmisión de acciones entre familia y a terceros"},
            {field:"prot_gobierno",label:"Gobierno corporativo — quién puede ser consejero, director general"},
            {field:"prot_conflictos",label:"Mecanismo de resolución de conflictos familiares — mediación familiar"},
            {field:"prot_salida",label:"Mecanismo de salida voluntaria de un familiar — precio y condiciones"},
          ].map(item=>(
            <div key={item.field} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid "+BORDER}}>
              <span style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,flex:1}}>{item.label}</span>
              <Select field={item.field} value={data[item.field]} onChange={save} options={[
                {value:"incluido",label:"✓ Incluido"},{value:"pendiente",label:"Pendiente"},{value:"no_aplica",label:"N/A"},
              ]}/>
            </div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <SectionTitle>Sucesión del Liderazgo</SectionTitle>
        <div style={s.grid2}>
          <Field label="¿Hay sucesor identificado para el CEO/DG?">
            <Select field="sucesor_identificado" value={data.sucesor_identificado} onChange={save} options={[
              {value:"si_documentado",label:"Sí — documentado y comunicado"},
              {value:"si_informal",label:"Sí — solo de manera informal"},
              {value:"no",label:"No identificado"},
            ]}/>
          </Field>
          <Field label="¿El sucesor está en preparación activa?">
            <Select field="sucesor_preparacion" value={data.sucesor_preparacion} onChange={save} options={[
              {value:"si",label:"Sí — plan de desarrollo activo"},{value:"no",label:"No"},{value:"na",label:"No aplica"},
            ]}/>
          </Field>
          <Field label="¿Hay testamento del fundador coordinado con la empresa?">
            <Select field="testamento_coordinado" value={data.testamento_coordinado} onChange={save} options={[
              {value:"si",label:"Sí — alineado con estructura corporativa"},
              {value:"testamento_no_coordinado",label:"Hay testamento pero no coordinado"},
              {value:"sin_testamento",label:"Sin testamento — riesgo crítico"},
            ]}/>
          </Field>
          <Field label="¿Hay fideicomiso de control/sucesión?">
            <Select field="fideicomiso_sucesion" value={data.fideicomiso_sucesion} onChange={save} options={[
              {value:"si",label:"Sí — activo"},{value:"no",label:"No"},{value:"en_proceso",label:"En proceso de constitución"},
            ]}/>
          </Field>
          <Field label="¿Hay buy-sell agreement entre socios?">
            <Select field="buy_sell_c08" value={data.buy_sell_c08} onChange={save} options={[
              {value:"si_con_seguro",label:"Sí — con seguro de vida para financiarlo"},
              {value:"si_sin_seguro",label:"Sí — sin seguro (sin financiamiento)"},
              {value:"no",label:"No"},
            ]}/>
          </Field>
          <Field label="Valuación de la empresa para buy-sell">
            <Select field="valuacion_buy_sell" value={data.valuacion_buy_sell} onChange={save} options={[
              {value:"vigente",label:"Vigente — menos de 2 años"},
              {value:"desactualizada",label:"Desactualizada — más de 2 años"},
              {value:"formula",label:"Fórmula acordada en el pacto"},
              {value:"no",label:"No hay valuación"},
            ]}/>
          </Field>
        </div>
        <Field label="Notas — sucesión y familia empresarial">
          <textarea style={{...s.input,...s.textarea}} value={data.notas_sucesion||""} onChange={e=>save("notas_sucesion",e.target.value)} placeholder="Estado actual del proceso de sucesión, conflictos latentes, acciones prioritarias, consejo de familia..."/>
        </Field>
      </div>
      {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
    </div>
  );
}
