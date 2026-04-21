import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const GOLD = "#C9A84C";
const MUSGO = "#4A5C45";
const GRAY = "#7A9070";
const BORDER = "#DDE4D8";
const TEXT_DARK = "#1E2B1A";
const WHITE = "#FAFCF8";

function Spinner(){return <div style={{textAlign:"center",padding:"2rem",color:GRAY,fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;}
function Badge({status,label}){
  const map={vigente:["#f0fdf4","#166534"],vencido:["#fef2f2","#991b1b"],"por renovar":["#fffbeb","#92400e"],pendiente:["#fffbeb","#92400e"],green:["#f0fdf4","#166534"],red:["#fef2f2","#991b1b"],amber:["#fffbeb","#92400e"]};
  const [bg,color]=map[status]||["#f3f4f6","#374151"];
  return <span style={{fontSize:10,padding:"2px 8px",borderRadius:2,background:bg,color,whiteSpace:"nowrap",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>{label||status}</span>;
}
const s={
  card:{background:"#FAFCF8",border:"1px solid "+BORDER,borderRadius:4,padding:"1rem 1.25rem",marginBottom:8},
  row:{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:"1px solid "+BORDER},
  muted:{fontSize:12,color:GRAY,fontFamily:"system-ui,sans-serif"},
  scoreCard:{background:"#FAFCF8",border:"1px solid "+BORDER,borderRadius:4,padding:".75rem .8rem",textAlign:"center",flex:1},
  label:{fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:6,display:"block"},
  input:{fontSize:12,padding:"7px 10px",border:"1px solid "+BORDER,borderRadius:3,fontFamily:"system-ui,sans-serif",background:WHITE,color:TEXT_DARK,width:"100%",boxSizing:"border-box"},
  btn:{fontSize:11,padding:"6px 14px",borderRadius:4,border:"1px solid "+BORDER,background:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif",color:TEXT_DARK},
  btnSm:{fontSize:10,padding:"4px 10px"},
};

export const CONDOMINAL_DOCS = {
  "CON-01": {
    docs: [
      {id:"escritura_constitucion",label:"Escritura constitutiva del régimen de condominio",requerido:true,desc:"Protocolizada ante notario público"},
      {id:"inscripcion_rpp",label:"Inscripción en Registro Público de la Propiedad",requerido:true,desc:"Folio real vigente"},
      {id:"planos_autorizados",label:"Planos arquitectónicos autorizados",requerido:true,desc:"Con sello de autorización municipal"},
      {id:"tabla_indivisos",label:"Tabla de indivisos",requerido:true,desc:"Porcentajes de copropiedad por unidad"},
      {id:"licencia_construccion",label:"Licencia de construcción o constancia de uso",requerido:false,desc:"Según municipio"},
      {id:"certificado_habitabilidad",label:"Certificado de habitabilidad o terminación de obra",requerido:false,desc:"Emitido por autoridad municipal"},
    ],
    checklist: [
      {id:"regimen_inscrito",label:"Régimen de condominio inscrito en RPP vigente",riesgo:"critico"},
      {id:"indivisos_correctos",label:"Tabla de indivisos correctamente calculada y protocolizada",riesgo:"alto"},
      {id:"planos_actualizados",label:"Planos actualizados y coinciden con construcción real",riesgo:"alto"},
      {id:"modificaciones_protocolizadas",label:"Modificaciones al régimen debidamente protocolizadas",riesgo:"critico"},
      {id:"uso_suelo_compatible",label:"Uso de suelo compatible con actividades del condominio",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Régimen no inscrito — actos jurídicos nulos",impacto:"Transmisiones de propiedad sin validez legal — litigios entre condóminos",nivel:"critico"},
      {label:"Modificaciones al régimen sin protocolizar",impacto:"Nulidad de cambios — conflictos sobre derechos de uso",nivel:"critico"},
      {label:"Tabla de indivisos incorrecta",impacto:"Distribución inequitativa de cuotas — impugnaciones en asamblea",nivel:"alto"},
    ]
  },
  "CON-02": {
    docs: [
      {id:"nombramiento_administrador",label:"Acta de nombramiento del administrador",requerido:true,desc:"Aprobada en asamblea con quórum legal"},
      {id:"poder_administrador",label:"Poder notarial del administrador",requerido:true,desc:"Con facultades expresas para actos de administración"},
      {id:"actas_asamblea",label:"Libro de actas de asambleas",requerido:true,desc:"Ordinarias y extraordinarias debidamente firmadas"},
      {id:"lista_condominios",label:"Padrón actualizado de condóminos",requerido:true,desc:"Con datos de contacto y unidad privativa"},
      {id:"estados_cuenta_admin",label:"Estados de cuenta bancaria del condominio",requerido:true,desc:"Cuenta exclusiva a nombre del condominio"},
      {id:"contrato_administracion",label:"Contrato de administración",requerido:false,desc:"Si el administrador es externo"},
      {id:"seguro_inmueble",label:"Póliza de seguro del inmueble",requerido:false,desc:"Daños, responsabilidad civil y robo"},
    ],
    checklist: [
      {id:"administrador_nombrado",label:"Administrador nombrado en asamblea con quórum legal",riesgo:"critico"},
      {id:"poder_vigente",label:"Poder notarial del administrador vigente y con facultades suficientes",riesgo:"critico"},
      {id:"asamblea_ordinaria_anual",label:"Asamblea ordinaria anual celebrada en tiempo y forma",riesgo:"alto"},
      {id:"convocatoria_legal",label:"Convocatorias conforme a reglamento y ley",riesgo:"alto"},
      {id:"quorum_verificado",label:"Quórum legal verificado y documentado en actas",riesgo:"alto"},
      {id:"cuenta_exclusiva",label:"Cuenta bancaria exclusiva del condominio",riesgo:"alto"},
      {id:"seguro_vigente",label:"Seguro del inmueble vigente",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Administrador sin poder notarial — actos nulos",impacto:"Contratos y compromisos sin validez — responsabilidad personal del administrador",nivel:"critico"},
      {label:"Nulidad de asamblea por vicios en convocatoria",impacto:"Acuerdos impugnables — paralización de decisiones del condominio",nivel:"critico"},
      {label:"Fondos mezclados con cuentas personales",impacto:"Responsabilidad penal por peculado o fraude — conflictos entre condóminos",nivel:"critico"},
      {label:"Asamblea ordinaria sin celebrar",impacto:"Incumplimiento de ley — impugnación de gestión del administrador",nivel:"alto"},
    ]
  },
  "CON-03": {
    docs: [
      {id:"reglamento_interno",label:"Reglamento interno del condominio",requerido:true,desc:"Aprobado en asamblea y firmado"},
      {id:"deposito_autoridad",label:"Constancia de depósito ante autoridad",requerido:false,desc:"Según legislación estatal aplicable"},
      {id:"reglamento_obras",label:"Reglamento de obras y modificaciones",requerido:false,desc:"Procedimiento para modificaciones en áreas privativas"},
      {id:"manual_convivencia",label:"Manual de convivencia y uso de áreas comunes",requerido:false,desc:"Horarios, normas de uso, mascotas"},
    ],
    checklist: [
      {id:"reglamento_vigente",label:"Reglamento interno vigente y aprobado en asamblea",riesgo:"alto"},
      {id:"reglamento_distribuido",label:"Reglamento distribuido a todos los condóminos",riesgo:"medio"},
      {id:"modificaciones_aprobadas",label:"Modificaciones al reglamento aprobadas con mayoría legal",riesgo:"alto"},
      {id:"sanciones_definidas",label:"Régimen de sanciones claro y aplicable",riesgo:"medio"},
      {id:"uso_areas_comunes",label:"Normas de uso de áreas comunes documentadas",riesgo:"bajo"},
    ],
    riesgos: [
      {label:"Reglamento desactualizado o sin vigencia legal",impacto:"Inaplicabilidad de sanciones — conflictos sin resolución",nivel:"alto"},
      {label:"Sanciones sin fundamento reglamentario",impacto:"Impugnación exitosa por condómino — responsabilidad del administrador",nivel:"alto"},
    ]
  },
  "CON-04": {
    docs: [
      {id:"presupuesto_anual",label:"Presupuesto anual aprobado en asamblea",requerido:true,desc:"Con desglose de gastos ordinarios y extraordinarios"},
      {id:"estado_fondo_reserva",label:"Estado del fondo de reserva",requerido:true,desc:"Saldo y movimientos del ejercicio"},
      {id:"comprobantes_cuotas",label:"Comprobantes de pago de cuotas",requerido:false,desc:"Recibos emitidos a condóminos"},
      {id:"estados_cuenta_mensuales",label:"Estados de cuenta mensuales",requerido:true,desc:"Ingresos, egresos y saldo del condominio"},
      {id:"relacion_morosos",label:"Relación de condóminos morosos",requerido:false,desc:"Con monto y antigüedad de adeudo"},
    ],
    checklist: [
      {id:"presupuesto_aprobado",label:"Presupuesto anual aprobado en asamblea ordinaria",riesgo:"alto"},
      {id:"fondo_reserva_suficiente",label:"Fondo de reserva con saldo mínimo del 10% del presupuesto anual",riesgo:"alto"},
      {id:"cuotas_al_corriente",label:"Más del 80% de condóminos al corriente en cuotas",riesgo:"medio"},
      {id:"estados_cuenta_rendidos",label:"Estados de cuenta rendidos mensualmente a condóminos",riesgo:"medio"},
      {id:"procedimiento_cobranza",label:"Procedimiento de cobranza a morosos documentado",riesgo:"alto"},
      {id:"gastos_autorizados",label:"Todos los gastos con autorización y comprobante fiscal",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Fondo de reserva insuficiente — emergencia sin recursos",impacto:"Cuotas extraordinarias urgentes — conflictos y demandas de condóminos",nivel:"alto"},
      {label:"Morosidad alta — operación del condominio comprometida",impacto:"Imposibilidad de pagar servicios — deterioro del inmueble",nivel:"alto"},
      {label:"Gastos sin comprobante — responsabilidad del administrador",impacto:"Acción de rendición de cuentas — responsabilidad civil y penal",nivel:"critico"},
    ]
  },
  "CON-05": {
    docs: [
      {id:"convenios_mediacion",label:"Convenios de mediación firmados",requerido:false,desc:"Conflictos resueltos por mediación"},
      {id:"resoluciones_arbitraje",label:"Resoluciones de arbitraje o autoridad",requerido:false,desc:"Laudos o resoluciones administrativas"},
      {id:"notificaciones_formales",label:"Notificaciones formales a condóminos",requerido:false,desc:"Infracciones, requerimientos de pago, apercibimientos"},
      {id:"demandas_activas",label:"Demandas activas — condóminos o terceros",requerido:false,desc:"Expedientes judiciales en trámite"},
      {id:"convenios_pago",label:"Convenios de pago con morosos",requerido:false,desc:"Acuerdos de liquidación de adeudos"},
    ],
    checklist: [
      {id:"mecanismo_resolucion",label:"Mecanismo de resolución de conflictos definido en reglamento",riesgo:"alto"},
      {id:"notificaciones_documentadas",label:"Notificaciones a condóminos infractores documentadas",riesgo:"medio"},
      {id:"mediacion_antes_litigio",label:"Mediación agotada antes de iniciar litigio",riesgo:"medio"},
      {id:"asesoria_juridica",label:"Asesoría jurídica activa para conflictos relevantes",riesgo:"alto"},
      {id:"contingencias_provisionadas",label:"Contingencias legales provisionadas en presupuesto",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Demanda colectiva de condóminos contra administrador",impacto:"Remoción del administrador — responsabilidad civil por daños",nivel:"critico"},
      {label:"Conflicto sin mecanismo de resolución",impacto:"Escalada a litigio — costos y paralización de decisiones",nivel:"alto"},
      {label:"Notificaciones sin soporte documental",impacto:"Sanciones impugnables — condómino infractor sin consecuencias",nivel:"medio"},
    ]
  },
};

export function ModCON01({client}){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  const mod="CON-01";
  useEffect(()=>{supabase.from("uso_poderes").select("*").eq("client_id",client.id).eq("modulo",mod).single().then(({data:d})=>{if(d)setData(d);});},[client.id]);
  async function save(field,val){setSaving(true);const updated={...data,[field]:val,client_id:client.id,modulo:mod};setData(updated);await supabase.from("uso_poderes").upsert(updated,{onConflict:"client_id,modulo"});setSaving(false);}
  return(<div><div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><span style={s.label}>Constitución del Régimen</span><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><span style={s.label}>Notario público</span><input style={s.input} value={data.notario||""} onChange={e=>save("notario",e.target.value)} placeholder="Nombre del notario"/></div><div><span style={s.label}>Número de escritura</span><input style={s.input} value={data.num_escritura||""} onChange={e=>save("num_escritura",e.target.value)} placeholder="Ej. 45,231"/></div><div><span style={s.label}>Fecha de constitución</span><input style={s.input} type="date" value={data.fecha_constitucion||""} onChange={e=>save("fecha_constitucion",e.target.value)}/></div><div><span style={s.label}>Folio RPP</span><input style={s.input} value={data.folio_rpp||""} onChange={e=>save("folio_rpp",e.target.value)} placeholder="Folio de inscripción"/></div><div><span style={s.label}>Total de unidades privativas</span><input style={s.input} type="number" value={data.total_unidades||""} onChange={e=>save("total_unidades",e.target.value)} placeholder="Número de departamentos/locales"/></div><div><span style={s.label}>Tipo de condominio</span><select style={s.input} value={data.tipo_condominio||""} onChange={e=>save("tipo_condominio",e.target.value)}><option value="">Seleccionar</option><option value="habitacional">Habitacional</option><option value="comercial">Comercial</option><option value="mixto">Mixto</option><option value="industrial">Industrial</option></select></div></div><div style={{marginTop:10}}><span style={s.label}>Domicilio del condominio</span><input style={s.input} value={data.domicilio||""} onChange={e=>save("domicilio",e.target.value)} placeholder="Calle, número, colonia, municipio, estado"/></div>{saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}</div></div>);
}

export function ModCON02({client}){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  const mod="CON-02";
  useEffect(()=>{supabase.from("uso_poderes").select("*").eq("client_id",client.id).eq("modulo",mod).single().then(({data:d})=>{if(d)setData(d);});},[client.id]);
  async function save(field,val){setSaving(true);const updated={...data,[field]:val,client_id:client.id,modulo:mod};setData(updated);await supabase.from("uso_poderes").upsert(updated,{onConflict:"client_id,modulo"});setSaving(false);}
  return(<div><div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><span style={s.label}>Administrador</span><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><span style={s.label}>Nombre del administrador</span><input style={s.input} value={data.nombre_admin||""} onChange={e=>save("nombre_admin",e.target.value)} placeholder="Nombre completo o razón social"/></div><div><span style={s.label}>Tipo</span><select style={s.input} value={data.tipo_admin||""} onChange={e=>save("tipo_admin",e.target.value)}><option value="">Seleccionar</option><option value="condómino">Condómino</option><option value="externo">Administrador externo</option><option value="empresa">Empresa administradora</option></select></div><div><span style={s.label}>Fecha de nombramiento</span><input style={s.input} type="date" value={data.fecha_nombramiento||""} onChange={e=>save("fecha_nombramiento",e.target.value)}/></div><div><span style={s.label}>Vigencia del nombramiento</span><input style={s.input} type="date" value={data.vigencia_nombramiento||""} onChange={e=>save("vigencia_nombramiento",e.target.value)}/></div><div><span style={s.label}>Notario del poder</span><input style={s.input} value={data.notario_poder||""} onChange={e=>save("notario_poder",e.target.value)} placeholder="Notario que otorgó el poder"/></div><div><span style={s.label}>Número de escritura del poder</span><input style={s.input} value={data.num_poder||""} onChange={e=>save("num_poder",e.target.value)} placeholder="Número de escritura"/></div></div></div><div style={{...s.card,borderLeft:"3px solid "+GOLD,marginTop:8}}><span style={s.label}>Última asamblea ordinaria</span><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><span style={s.label}>Fecha</span><input style={s.input} type="date" value={data.fecha_ultima_asamblea||""} onChange={e=>save("fecha_ultima_asamblea",e.target.value)}/></div><div><span style={s.label}>Quórum alcanzado</span><select style={s.input} value={data.quorum||""} onChange={e=>save("quorum",e.target.value)}><option value="">Seleccionar</option><option value="si">Sí — quórum legal alcanzado</option><option value="no">No — asamblea de segunda convocatoria</option></select></div><div><span style={s.label}>Próxima asamblea ordinaria</span><input style={s.input} type="date" value={data.proxima_asamblea||""} onChange={e=>save("proxima_asamblea",e.target.value)}/></div><div><span style={s.label}>Número de condóminos activos</span><input style={s.input} type="number" value={data.num_condominios||""} onChange={e=>save("num_condominios",e.target.value)}/></div></div></div>{saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}</div>);
}

export function ModCON03({client}){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  const mod="CON-03";
  useEffect(()=>{supabase.from("uso_poderes").select("*").eq("client_id",client.id).eq("modulo",mod).single().then(({data:d})=>{if(d)setData(d);});},[client.id]);
  async function save(field,val){setSaving(true);const updated={...data,[field]:val,client_id:client.id,modulo:mod};setData(updated);await supabase.from("uso_poderes").upsert(updated,{onConflict:"client_id,modulo"});setSaving(false);}
  return(<div><div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><span style={s.label}>Reglamento Interno</span><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><span style={s.label}>Fecha de aprobación</span><input style={s.input} type="date" value={data.fecha_reglamento||""} onChange={e=>save("fecha_reglamento",e.target.value)}/></div><div><span style={s.label}>Última actualización</span><input style={s.input} type="date" value={data.ultima_actualizacion_reg||""} onChange={e=>save("ultima_actualizacion_reg",e.target.value)}/></div><div><span style={s.label}>Depositado ante autoridad</span><select style={s.input} value={data.depositado||""} onChange={e=>save("depositado",e.target.value)}><option value="">Seleccionar</option><option value="si">Sí</option><option value="no">No</option><option value="no_aplica">No aplica</option></select></div><div><span style={s.label}>Distribuido a todos los condóminos</span><select style={s.input} value={data.distribuido||""} onChange={e=>save("distribuido",e.target.value)}><option value="">Seleccionar</option><option value="si">Sí</option><option value="parcial">Parcialmente</option><option value="no">No</option></select></div></div><div style={{marginTop:10}}><span style={s.label}>Notas</span><textarea style={{...s.input,minHeight:60,resize:"vertical"}} value={data.notas_reglamento||""} onChange={e=>save("notas_reglamento",e.target.value)} placeholder="Disposiciones especiales, actualizaciones pendientes..."/></div></div>{saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}</div>);
}

export function ModCON04({client}){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  const mod="CON-04";
  useEffect(()=>{supabase.from("uso_poderes").select("*").eq("client_id",client.id).eq("modulo",mod).single().then(({data:d})=>{if(d)setData(d);});},[client.id]);
  async function save(field,val){setSaving(true);const updated={...data,[field]:val,client_id:client.id,modulo:mod};setData(updated);await supabase.from("uso_poderes").upsert(updated,{onConflict:"client_id,modulo"});setSaving(false);}
  const porcentajeMorosos=data.num_morosos&&data.num_condominios?Math.round((parseInt(data.num_morosos)/parseInt(data.num_condominios))*100):null;
  return(<div><div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><span style={s.label}>Cuotas</span><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><span style={s.label}>Cuota ordinaria mensual (MXN)</span><input style={s.input} type="number" value={data.cuota_ordinaria||""} onChange={e=>save("cuota_ordinaria",e.target.value)} placeholder="Importe mensual"/></div><div><span style={s.label}>Presupuesto anual aprobado (MXN)</span><input style={s.input} type="number" value={data.presupuesto_anual||""} onChange={e=>save("presupuesto_anual",e.target.value)} placeholder="Total del ejercicio"/></div><div><span style={s.label}>Condóminos morosos</span><input style={s.input} type="number" value={data.num_morosos||""} onChange={e=>save("num_morosos",e.target.value)}/></div><div><span style={s.label}>Total condóminos</span><input style={s.input} type="number" value={data.num_condominios||""} onChange={e=>save("num_condominios",e.target.value)}/></div></div>{porcentajeMorosos!==null&&<div style={{marginTop:10,padding:"8px 12px",borderRadius:3,background:porcentajeMorosos>20?"#fef2f2":porcentajeMorosos>10?"#fffbeb":"#f0fdf4",border:"1px solid "+(porcentajeMorosos>20?"#fecaca":porcentajeMorosos>10?"#fde68a":"#bbf7d0")}}><span style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:porcentajeMorosos>20?"#991b1b":porcentajeMorosos>10?"#92400e":"#166534"}}>{porcentajeMorosos}% morosidad — {porcentajeMorosos>20?"⚠️ Alta":porcentajeMorosos>10?"Moderada":"✓ Controlada"}</span></div>}</div><div style={{...s.card,borderLeft:"3px solid "+GOLD,marginTop:8}}><span style={s.label}>Fondo de Reserva</span><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><span style={s.label}>Saldo actual (MXN)</span><input style={s.input} type="number" value={data.saldo_fondo||""} onChange={e=>save("saldo_fondo",e.target.value)}/></div><div><span style={s.label}>Aportación mensual (MXN)</span><input style={s.input} type="number" value={data.aportacion_fondo||""} onChange={e=>save("aportacion_fondo",e.target.value)}/></div></div></div>{saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}</div>);
}

export function ModCON05({client}){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);
  const mod="CON-05";
  useEffect(()=>{supabase.from("uso_poderes").select("*").eq("client_id",client.id).eq("modulo",mod).single().then(({data:d})=>{if(d)setData(d);});},[client.id]);
  async function save(field,val){setSaving(true);const updated={...data,[field]:val,client_id:client.id,modulo:mod};setData(updated);await supabase.from("uso_poderes").upsert(updated,{onConflict:"client_id,modulo"});setSaving(false);}
  return(<div><div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><span style={s.label}>Conflictos activos</span><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><span style={s.label}>Número de conflictos activos</span><input style={s.input} type="number" value={data.num_conflictos||""} onChange={e=>save("num_conflictos",e.target.value)} placeholder="0"/></div><div><span style={s.label}>Demandas en proceso</span><select style={s.input} value={data.demandas_activas||""} onChange={e=>save("demandas_activas",e.target.value)}><option value="">Seleccionar</option><option value="ninguna">Ninguna</option><option value="1_2">1-2 demandas</option><option value="3_mas">3 o más</option></select></div><div><span style={s.label}>Morosos en cobranza judicial</span><input style={s.input} type="number" value={data.morosos_juicio||""} onChange={e=>save("morosos_juicio",e.target.value)}/></div><div><span style={s.label}>Mediaciones en proceso</span><input style={s.input} type="number" value={data.mediaciones||""} onChange={e=>save("mediaciones",e.target.value)}/></div></div><div style={{marginTop:10}}><span style={s.label}>Descripción de conflictos relevantes</span><textarea style={{...s.input,minHeight:80,resize:"vertical"}} value={data.desc_conflictos||""} onChange={e=>save("desc_conflictos",e.target.value)} placeholder="Describe los conflictos activos, partes involucradas y estado actual..."/></div></div>{saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}</div>);
}
