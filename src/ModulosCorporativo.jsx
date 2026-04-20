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
  dot:status=>({width:8,height:8,borderRadius:"50%",background:status==="vigente"?"#5A8A3C":status==="vencido"?"#C0392B":GOLD,flexShrink:0,display:"inline-block"}),
};

export const CORPORATIVO_DOCS = {
  "C-01": {
    docs: [
      {id:"proyecto_fusion",label:"Proyecto de fusión o escisión",requerido:true,desc:"Aprobado por asamblea extraordinaria"},
      {id:"aviso_sat_fusion",label:"Aviso al SAT de la reestructura",requerido:true,desc:"Dentro de los 30 días siguientes"},
      {id:"publicacion_dof",label:"Publicación en DOF o periódico",requerido:true,desc:"Aviso a acreedores — 3 publicaciones"},
      {id:"escritura_fusion",label:"Escritura de fusión protocolizada",requerido:true,desc:"Ante notario — inscrita en RPPyC"},
      {id:"inscripcion_rppyc",label:"Inscripción en RPPyC",requerido:true,desc:"Registro Público de la Propiedad y del Comercio"},
    ],
    checklist: [
      {id:"asamblea_aprobada",label:"Fusión/escisión aprobada en asamblea extraordinaria",riesgo:"critico"},
      {id:"aviso_sat",label:"Aviso al SAT presentado en tiempo",riesgo:"alto"},
      {id:"acreedores_notificados",label:"Acreedores notificados con 45 días de anticipación",riesgo:"alto"},
      {id:"escritura_inscrita",label:"Escritura inscrita en RPPyC",riesgo:"critico"},
      {id:"padrones_actualizados",label:"Padrones SAT, IMSS, INFONAVIT actualizados",riesgo:"alto"},
      {id:"cuentas_fusionadas",label:"Cuentas bancarias y contratos actualizados",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Fusión sin aviso a acreedores — impugnable",impacto:"Nulidad de la fusión — responsabilidad solidaria ilimitada",nivel:"critico"},
      {label:"Implicaciones fiscales no previstas",impacto:"UFIN negativa — ISR diferido — ajuste fiscal",nivel:"alto"},
      {label:"Contratos con cláusulas de cambio de control",impacto:"Terminación automática de contratos clave",nivel:"alto"},
    ]
  },
  "C-02": {
    docs: [
      {id:"indice_dd",label:"Índice de due diligence",requerido:true,desc:"Lista maestra de documentos solicitados"},
      {id:"reporte_hallazgos",label:"Reporte de hallazgos",requerido:true,desc:"Con semáforo de riesgos por área"},
      {id:"carta_representaciones",label:"Carta de representaciones del vendedor",requerido:true,desc:"Declaraciones y garantías"},
      {id:"nda_dd",label:"NDA para el proceso de due diligence",requerido:true,desc:"Firmado antes de compartir información"},
    ],
    checklist: [
      {id:"corporativo_revisado",label:"Estructura corporativa completa revisada",riesgo:"critico"},
      {id:"fiscal_revisado",label:"Situación fiscal de los últimos 5 años revisada",riesgo:"critico"},
      {id:"laboral_revisado",label:"Pasivos laborales identificados y cuantificados",riesgo:"alto"},
      {id:"contratos_clave",label:"Contratos clave revisados — cláusulas de cambio de control",riesgo:"alto"},
      {id:"litigios_identificados",label:"Litigios activos y contingentes identificados",riesgo:"alto"},
      {id:"pi_revisada",label:"Propiedad intelectual verificada",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Pasivo oculto no identificado en DD",impacto:"Precio pagado mayor al valor real — acciones de garantía",nivel:"critico"},
      {label:"Litigios no revelados — representaciones falsas",impacto:"Rescisión del contrato de compraventa + daños",nivel:"critico"},
      {label:"Contratos terminados por cambio de control",impacto:"Pérdida de relaciones comerciales clave post-cierre",nivel:"alto"},
    ]
  },
  "C-03": {
    docs: [
      {id:"pacto_accionistas",label:"Pacto de accionistas vigente",requerido:true,desc:"Firmado por todos los socios"},
      {id:"cap_table",label:"Cap table actualizado",requerido:true,desc:"Porcentajes, series, dilución"},
      {id:"certificados_acciones",label:"Certificados de acciones vigentes",requerido:true,desc:"Endosados y registrados"},
      {id:"libro_registro",label:"Libro de registro de acciones actualizado",requerido:true,desc:"Con todos los traspasos"},
    ],
    checklist: [
      {id:"unanimidad_modificacion",label:"Modificaciones al pacto requieren unanimidad",riesgo:"alto"},
      {id:"derecho_preferencia",label:"Derecho de preferencia bien definido",riesgo:"alto"},
      {id:"tag_drag",label:"Tag-along y drag-along con condiciones claras",riesgo:"medio"},
      {id:"valuacion_salida",label:"Mecanismo de valuación en caso de salida",riesgo:"alto"},
      {id:"deadlock",label:"Mecanismo de resolución de deadlock",riesgo:"medio"},
      {id:"cesion_restringida",label:"Cesión de acciones restringida a terceros",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Pacto de accionistas no inscrito — inoponible a terceros",impacto:"Terceros adquirentes de acciones no quedan vinculados",nivel:"alto"},
      {label:"Deadlock sin mecanismo de resolución",impacto:"Parálisis de la empresa — disolución forzosa",nivel:"critico"},
      {label:"Valuación disputada en salida de socio",impacto:"Litigio prolongado — operaciones interrumpidas",nivel:"alto"},
    ]
  },
  "C-04": {
    docs: [
      {id:"cap_table_startup",label:"Cap table actualizado con todas las series",requerido:true,desc:"Pre y post-money por ronda"},
      {id:"safe_convertibles",label:"SAFEs o notas convertibles vigentes",requerido:false,desc:"Con términos: valuation cap, descuento, MFN"},
      {id:"shareholder_agreement",label:"Shareholders agreement",requerido:false,desc:"Con derechos de información, pro-rata, preferencia"},
      {id:"vesting_founders",label:"Acuerdo de vesting de founders",requerido:true,desc:"Cliff de 1 año + 4 años mensual"},
    ],
    checklist: [
      {id:"vesting_founders_check",label:"Vesting de fundadores implementado correctamente",riesgo:"alto"},
      {id:"pi_empresa",label:"Propiedad intelectual a nombre de la empresa (no fundadores)",riesgo:"critico"},
      {id:"safe_vigentes",label:"SAFEs y convertibles documentados y firmados",riesgo:"alto"},
      {id:"derechos_informacion",label:"Derechos de información de inversores satisfechos",riesgo:"medio"},
      {id:"anti_dilution",label:"Cláusulas anti-dilución analizadas",riesgo:"medio"},
    ],
    riesgos: [
      {label:"PI a nombre de fundador — no de la empresa",impacto:"La empresa no tiene propiedad del producto que vende",nivel:"critico"},
      {label:"SAFE sin cap de valuación — dilución excesiva",impacto:"Fundadores diluidos severamente en siguiente ronda",nivel:"alto"},
      {label:"Incumplimiento de derechos de información",impacto:"Inversores pueden exigir recompra o ejercer derechos especiales",nivel:"medio"},
    ]
  },
  "C-05": {
    docs: [
      {id:"aviso_privacidad",label:"Aviso de privacidad vigente",requerido:true,desc:"Integral o simplificado según tipo de tratamiento"},
      {id:"transferencias_int",label:"Cláusulas de transferencia internacional",requerido:false,desc:"Si hay flujo de datos al extranjero"},
      {id:"medidas_seguridad",label:"Documento de medidas de seguridad",requerido:true,desc:"Técnicas, físicas y administrativas"},
      {id:"registro_bdp",label:"Registro de bases de datos",requerido:false,desc:"Ante INAI si aplica"},
    ],
    checklist: [
      {id:"aviso_publicado",label:"Aviso de privacidad publicado y accesible",riesgo:"alto"},
      {id:"consentimiento",label:"Consentimiento obtenido para datos sensibles",riesgo:"critico"},
      {id:"medidas_seguridad_check",label:"Medidas de seguridad implementadas y documentadas",riesgo:"alto"},
      {id:"brechas_protocolo",label:"Protocolo de atención a brechas de seguridad",riesgo:"alto"},
      {id:"derechos_arco",label:"Procedimiento ARCO implementado",riesgo:"medio"},
      {id:"transferencias_autorizadas",label:"Transferencias de datos autorizadas correctamente",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Multa INAI por incumplimiento LFPDPPP",impacto:"Hasta $23 millones de pesos + publicación de la resolución",nivel:"alto"},
      {label:"Brecha de seguridad sin notificación oportuna",impacto:"Multa adicional + daño reputacional",nivel:"alto"},
      {label:"Transferencia internacional sin cláusulas contractuales",impacto:"Infracción — suspensión del tratamiento",nivel:"medio"},
    ]
  },
  "C-06": {
    docs: [
      {id:"titulo_concesion",label:"Título de concesión o permiso federal",requerido:true,desc:"Vigente — con condicionantes"},
      {id:"garantia_concesion",label:"Garantía de cumplimiento",requerido:false,desc:"Fianza o depósito según la concesión"},
      {id:"reportes_regulatorios",label:"Reportes regulatorios presentados",requerido:true,desc:"Periodicidad según título"},
    ],
    checklist: [
      {id:"vigencia_controlada",label:"Vigencia de concesión/permiso en calendario",riesgo:"critico"},
      {id:"condicionantes_cumplidas",label:"Condicionantes del título cumplidas",riesgo:"alto"},
      {id:"reportes_presentados",label:"Reportes regulatorios presentados en tiempo",riesgo:"alto"},
      {id:"modificaciones_notificadas",label:"Modificaciones notificadas a la autoridad",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Vencimiento de concesión sin renovación",impacto:"Operaciones ilegales — clausura inmediata",nivel:"critico"},
      {label:"Incumplimiento de condicionantes",impacto:"Revocación de la concesión + multas",nivel:"critico"},
    ]
  },
  "C-07": {
    docs: [
      {id:"autorizacion_cnbv",label:"Autorización CNBV vigente",requerido:true,desc:"Para entidades del sector financiero"},
      {id:"registro_condusef",label:"Registro CONDUSEF",requerido:false,desc:"Productos y servicios registrados"},
      {id:"reportes_banxico",label:"Reportes a Banxico",requerido:false,desc:"Según el tipo de institución"},
    ],
    checklist: [
      {id:"autorizacion_vigente",label:"Autorización regulatoria vigente",riesgo:"critico"},
      {id:"capital_minimo",label:"Capital mínimo regulatorio mantenido",riesgo:"critico"},
      {id:"reportes_regulatorios",label:"Reportes regulatorios periódicos presentados",riesgo:"alto"},
      {id:"pld_implementado",label:"Sistema PLD implementado y actualizado",riesgo:"critico"},
      {id:"consejo_cumplimiento",label:"Comité de cumplimiento activo",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Operación sin autorización regulatoria",impacto:"Clausura inmediata + proceso penal",nivel:"critico"},
      {label:"Incumplimiento PLD — reporte de operaciones inusuales",impacto:"Multa hasta $23 millones + inhabilitación de directivos",nivel:"critico"},
    ]
  },
  "C-08": {
    docs: [
      {id:"protocolo_familiar",label:"Protocolo de empresa familiar",requerido:true,desc:"Con reglas de gobierno, sucesión y salida"},
      {id:"testamento_corporativo",label:"Testamento con disposiciones corporativas",requerido:false,desc:"Coordinado con notario"},
      {id:"fideicomiso_sucesorio",label:"Fideicomiso de administración o sucesorio",requerido:false,desc:"Para continuidad ante fallecimiento de socio"},
      {id:"seguro_socio_clave",label:"Seguro de vida de socio clave",requerido:false,desc:"Buy-sell agreement fondeado con seguro"},
    ],
    checklist: [
      {id:"protocolo_firmado",label:"Protocolo familiar firmado por todos los socios",riesgo:"alto"},
      {id:"sucesion_definida",label:"Sucesión en dirección y propiedad definida",riesgo:"critico"},
      {id:"mecanismo_salida",label:"Mecanismo de salida de familiares documentado",riesgo:"alto"},
      {id:"valuacion_acordada",label:"Método de valuación de acciones acordado",riesgo:"alto"},
      {id:"seguro_fondeado",label:"Buy-sell agreement fondeado con seguro de vida",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Muerte de socio mayoritario sin plan de sucesión",impacto:"Parálisis de la empresa — conflicto entre herederos",nivel:"critico"},
      {label:"Entrada de herederos no deseados como socios",impacto:"Pérdida de control — conflictos societarios",nivel:"critico"},
      {label:"Valuación disputada entre herederos",impacto:"Litigios prolongados — empresa bloqueada operativamente",nivel:"alto"},
    ]
  },
};

export function ModC01({client}){
  const [data,setData]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("historial").select("*").eq("client_id",client.id)
      .in("tipo",["fusion","escision","transformacion","reestructura"])
      .then(({data:d})=>{setData(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      {data.length===0
        ?<div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>Sin procesos de reestructura activos</div><div style={s.muted}>El despacho documentará cualquier proceso de fusión, escisión o transformación en este módulo.</div></div>
        :<div style={s.card}>{data.map(x=><div key={x.id} style={s.row}><span style={s.dot(x.status==="completado"?"vigente":"por renovar")}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.titulo}</div><div style={s.muted}>{x.tipo} · {x.fecha}</div></div><Badge status={x.status==="completado"?"green":"amber"} label={x.status||"en proceso"}/></div>)}</div>
      }
      <div style={{...s.card,marginTop:12,borderLeft:"3px solid "+MUSGO}}>
        <div style={{fontSize:11,fontWeight:600,color:MUSGO,fontFamily:"system-ui,sans-serif",marginBottom:8}}>TIPOS DE REESTRUCTURA SOCIETARIA</div>
        {["Fusión por absorción — una sociedad absorbe a otra(s)","Fusión por incorporación — nueva sociedad absorbe a las fusionantes","Escisión — parte del patrimonio se segrega a nueva sociedad","Transformación — cambio de tipo social (SA a SAPI, SRL a SA, etc.)"].map((x,i)=>(
          <div key={i} style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,padding:"5px 0",borderBottom:i<3?"1px solid "+BORDER:"none"}}>{x}</div>
        ))}
      </div>
    </div>
  );
}
export function ModC02({client}){
  return <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={{fontSize:14,fontFamily:"Georgia, serif",marginBottom:8}}>Due Diligence Legal</div><div style={s.muted}>El despacho gestiona el proceso de due diligence directamente. Los hallazgos y el reporte se comparten en este módulo.</div></div>;
}
export function ModC03({client}){
  const [personas,setPersonas]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("personas").select("*").eq("client_id",client.id).in("tipo",["accionista","socio"])
      .then(({data:d})=>{setPersonas(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      <div style={s.card}>
        <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:12}}>ESTRUCTURA ACCIONARIA</div>
        {personas.length===0
          ?<div style={s.muted}>Sin accionistas registrados</div>
          :personas.map(p=><div key={p.id} style={s.row}><span style={s.dot("vigente")}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{p.nombre}</div><div style={s.muted}>{p.participacion?p.participacion+"%":""}{p.cargo?" · "+p.cargo:""}</div></div></div>)
        }
      </div>
    </div>
  );
}
export function ModC04({client}){ return <ModC03 client={client}/>; }
export function ModC05({client}){
  const [perf,setPerf]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("perfil_regulatorio").select("*").eq("client_id",client.id)
      .then(({data:d})=>{setPerf(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  const inai=perf.find(x=>x.autoridad==="INAI")||{};
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+(inai.status==="vigente"?"#5A8A3C":GOLD)}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <div style={{fontSize:14,fontFamily:"Georgia, serif"}}>Cumplimiento LFPDPPP</div>
          <Badge status={inai.status==="vigente"?"green":"amber"} label={inai.status||"Revisar"}/>
        </div>
        <div style={s.muted}>Ley Federal de Protección de Datos Personales en Posesión de Particulares</div>
      </div>
    </div>
  );
}
export function ModC06({client}){
  const [perf,setPerf]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("perfil_regulatorio").select("*").eq("client_id",client.id)
      .then(({data:d})=>{setPerf(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  const concesiones=perf.filter(x=>x.tipo==="concesion"||x.tipo==="permiso_federal");
  return(
    <div>
      {concesiones.length===0
        ?<div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={s.muted}>Sin concesiones o permisos federales registrados.</div></div>
        :concesiones.map(c=><div key={c.id} style={{...s.card,borderLeft:"3px solid "+(c.status==="vigente"?"#5A8A3C":"#C0392B")}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{c.autoridad} — {c.tipo}</div><Badge status={c.status==="vigente"?"green":"red"} label={c.status||"revisar"}/></div>
          <div style={s.muted}>Vencimiento: {c.vencimiento||"—"}</div>
        </div>)
      }
    </div>
  );
}
export function ModC07({client}){ return <ModC06 client={client}/>; }
export function ModC08({client}){
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <div style={{fontSize:14,fontFamily:"Georgia, serif",marginBottom:8}}>Plan de Sucesión Empresarial</div>
        <div style={s.muted}>El despacho trabaja con el cliente en el diseño del protocolo familiar y plan de sucesión. La documentación se integra en este módulo.</div>
      </div>
    </div>
  );
}
