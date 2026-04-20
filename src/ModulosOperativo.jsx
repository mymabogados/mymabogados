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

export const OPERATIVO_DOCS = {
  "O-01": {
    docs: [
      {id:"marcas_registradas",label:"Certificados de registro de marca (IMPI)",requerido:true,desc:"Vigentes — renovación cada 10 años"},
      {id:"solicitudes_pendientes",label:"Expedientes de solicitud en trámite",requerido:false,desc:"Con número de expediente IMPI"},
      {id:"licencias_marca",label:"Contratos de licencia de marca",requerido:false,desc:"Registrados ante IMPI"},
      {id:"patentes",label:"Títulos de patente o modelo de utilidad",requerido:false,desc:"Vigentes — 20 años desde solicitud"},
      {id:"derechos_autor",label:"Registro de obras ante INDAUTOR",requerido:false,desc:"Software, diseños, contenidos"},
    ],
    checklist: [
      {id:"marcas_vigentes",label:"Marcas registradas vigentes en todas las clases relevantes",riesgo:"critico"},
      {id:"renovaciones_controladas",label:"Renovaciones controladas con anticipación de 6 meses",riesgo:"alto"},
      {id:"cobertura_geografica",label:"Cobertura geográfica adecuada (México + mercados clave)",riesgo:"alto"},
      {id:"licencias_registradas",label:"Licencias de marca registradas ante IMPI",riesgo:"medio"},
      {id:"vigilancia_marcaria",label:"Vigilancia marcaria activa contra infractores",riesgo:"medio"},
      {id:"pi_empresa",label:"Toda la PI a nombre de la empresa — no personas físicas",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Marca vencida — tercero la registra primero",impacto:"Pérdida del derecho — obligación de cambiar marca",nivel:"critico"},
      {label:"Infracción marcaria no perseguida",impacto:"Confusión del consumidor — daño reputacional y ventas",nivel:"alto"},
      {label:"PI a nombre de empleado o fundador",impacto:"La empresa no tiene titularidad — riesgo de extorsión",nivel:"critico"},
    ]
  },
  "O-02": {
    docs: [
      {id:"contratos_proveedores",label:"Contratos vigentes con proveedores estratégicos",requerido:true,desc:"Firmados y con vigencia definida"},
      {id:"sla_proveedores",label:"SLAs y penalidades documentados",requerido:true,desc:"Niveles de servicio y consecuencias"},
      {id:"confidencialidad_prov",label:"NDAs con proveedores clave",requerido:true,desc:"Información confidencial compartida"},
    ],
    checklist: [
      {id:"contratos_vigentes",label:"Contratos vigentes con todos los proveedores estratégicos",riesgo:"alto"},
      {id:"slas_definidos",label:"SLAs claros con penalidades aplicables",riesgo:"alto"},
      {id:"terminacion_causa",label:"Cláusula de terminación por causa justificada",riesgo:"alto"},
      {id:"exclusividad_analizada",label:"Exclusividades analizadas — sin dependencia excesiva",riesgo:"medio"},
      {id:"concentracion_riesgo",label:"Concentración de riesgo por proveedor evaluada",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Sin contrato con proveedor crítico",impacto:"Sin protección ante incumplimiento — sin penalidades ejecutables",nivel:"alto"},
      {label:"Exclusividad que limita competencia",impacto:"Restricción de mercado — posible infracción COFECE",nivel:"medio"},
      {label:"Concentración en un solo proveedor",impacto:"Riesgo operativo ante quiebra o incumplimiento del proveedor",nivel:"alto"},
    ]
  },
  "O-03": {
    docs: [
      {id:"contrato_distribucion",label:"Contratos de distribución vigentes",requerido:true,desc:"Por territorio y tipo de producto"},
      {id:"lista_distribuidores",label:"Listado de distribuidores activos",requerido:true,desc:"Con territorios y condiciones"},
      {id:"manual_distribucion",label:"Manual de identidad de marca para distribuidores",requerido:false,desc:"Uso correcto de marca y materiales"},
    ],
    checklist: [
      {id:"territorios_definidos",label:"Territorios exclusivos bien delimitados",riesgo:"alto"},
      {id:"preaviso_terminacion",label:"Preaviso de terminación de 30-90 días",riesgo:"alto"},
      {id:"metas_documentadas",label:"Metas de venta documentadas",riesgo:"medio"},
      {id:"proteccion_marca",label:"Protección de uso de marca en canal",riesgo:"alto"},
      {id:"no_competencia_dist",label:"No competencia con otros distribuidores en el mismo territorio",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Distribuidor que usa la marca incorrectamente",impacto:"Daño reputacional — confusión del consumidor",nivel:"alto"},
      {label:"Terminación sin preaviso — reclamación de daños",impacto:"Indemnización por daños y perjuicios al distribuidor",nivel:"alto"},
    ]
  },
  "O-04": {
    docs: [
      {id:"cof",label:"Circular de Oferta de Franquicia (COF)",requerido:true,desc:"Actualizada — entrega 30 días antes de firma"},
      {id:"contrato_franquicia",label:"Contrato de franquicia por unidad",requerido:true,desc:"Vigente y con todas las cláusulas"},
      {id:"manual_operaciones",label:"Manual de operaciones del franquiciante",requerido:true,desc:"Actualizado y protegido"},
      {id:"registro_marca_franquicia",label:"Marca de franquicia registrada en IMPI",requerido:true,desc:"Todas las clases del giro"},
    ],
    checklist: [
      {id:"cof_vigente",label:"COF actualizada anualmente",riesgo:"critico"},
      {id:"marca_protegida",label:"Marca protegida en todos los territorios de operación",riesgo:"critico"},
      {id:"secreto_industrial",label:"Secreto industrial y know-how protegidos",riesgo:"alto"},
      {id:"auditoria_franquiciatarios",label:"Auditorías a franquiciatarios realizadas",riesgo:"medio"},
      {id:"royalties_cobrados",label:"Regalías cobradas y documentadas",riesgo:"alto"},
    ],
    riesgos: [
      {label:"COF desactualizada — nulidad de contratos",impacto:"Contratos de franquicia anulables — restitución de inversiones",nivel:"critico"},
      {label:"Franquiciatario que opera fuera del sistema",impacto:"Daño reputacional + incumplimiento de estándares de marca",nivel:"alto"},
      {label:"Secreto industrial filtrado sin protección",impacto:"Pérdida de ventaja competitiva — imposible recuperar",nivel:"critico"},
    ]
  },
  "O-05": {
    docs: [
      {id:"contrato_desarrollo",label:"Contrato de desarrollo de software",requerido:true,desc:"Con cláusula de obra por encargo"},
      {id:"licencias_sw",label:"Licencias de software de terceros",requerido:true,desc:"Vigentes y con número de usuarios correcto"},
      {id:"acuerdo_sla_tech",label:"SLA con proveedor de tecnología",requerido:true,desc:"Uptime, soporte, tiempos de respuesta"},
      {id:"politica_ciberseguridad",label:"Política de ciberseguridad",requerido:true,desc:"Actualizada — aprobada por dirección"},
    ],
    checklist: [
      {id:"codigo_empresa",label:"Código fuente a nombre de la empresa",riesgo:"critico"},
      {id:"licencias_correctas",label:"Licencias de software vigentes y suficientes",riesgo:"alto"},
      {id:"backups",label:"Backups automáticos y probados",riesgo:"alto"},
      {id:"acceso_privilegiado",label:"Acceso privilegiado documentado y controlado",riesgo:"alto"},
      {id:"incidentes_protocolo",label:"Protocolo de respuesta a incidentes de seguridad",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Software desarrollado a nombre del proveedor",impacto:"La empresa no puede usar ni modificar su propio sistema",nivel:"critico"},
      {label:"Uso de software sin licencia",impacto:"Multas + litigio por infracción de derechos de autor",nivel:"alto"},
      {label:"Brecha de seguridad sin protocolo de respuesta",impacto:"Multa INAI + daño reputacional + pérdida de datos",nivel:"critico"},
    ]
  },
  "O-06": {
    docs: [
      {id:"terminos_condiciones",label:"Términos y condiciones del sitio web",requerido:true,desc:"Actualizados — con ley aplicable y jurisdicción"},
      {id:"politica_privacidad_web",label:"Política de privacidad en el sitio",requerido:true,desc:"Conforme a LFPDPPP"},
      {id:"politica_devoluciones",label:"Política de devoluciones y cancelaciones",requerido:true,desc:"Conforme a PROFECO — 5 días para desistir"},
    ],
    checklist: [
      {id:"terminos_vigentes",label:"Términos y condiciones vigentes y accesibles",riesgo:"alto"},
      {id:"derecho_retracto",label:"Derecho de retracto de 5 días días implementado",riesgo:"alto"},
      {id:"precios_impuestos",label:"Precios con impuestos incluidos (IVA)",riesgo:"medio"},
      {id:"marketplace_contratos",label:"Contratos con marketplaces vigentes",riesgo:"medio"},
      {id:"datos_pago_seguros",label:"Datos de pago procesados de forma segura (PCI DSS)",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Sin derecho de retracto — infracción PROFECO",impacto:"Multa hasta $2.4 millones + publicación en medios",nivel:"alto"},
      {label:"Fuga de datos de tarjetas de crédito",impacto:"Multas PCI DSS + demandas de usuarios + daño reputacional",nivel:"critico"},
    ]
  },
  "O-07": {
    docs: [
      {id:"escrituras_inmuebles",label:"Escrituras de inmuebles",requerido:true,desc:"Inscritas en el RPPyC"},
      {id:"contratos_arrendamiento",label:"Contratos de arrendamiento comercial",requerido:true,desc:"Vigentes con todas las cláusulas"},
      {id:"licencias_funcionamiento",label:"Licencias de funcionamiento municipales",requerido:true,desc:"Por establecimiento"},
      {id:"uso_suelo",label:"Constancias de uso de suelo",requerido:true,desc:"Compatibles con la actividad"},
    ],
    checklist: [
      {id:"inmuebles_libres_gravamen",label:"Inmuebles libres de gravamen o gravámenes controlados",riesgo:"alto"},
      {id:"arrendamientos_vigentes",label:"Arrendamientos vigentes con opciones de renovación",riesgo:"alto"},
      {id:"uso_suelo_correcto",label:"Uso de suelo compatible con la actividad",riesgo:"critico"},
      {id:"licencias_vigentes",label:"Licencias de funcionamiento vigentes",riesgo:"alto"},
      {id:"mantenimiento_legal",label:"Obligaciones de mantenimiento en arrendamiento cumplidas",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Uso de suelo incompatible — clausura",impacto:"Clausura inmediata del establecimiento",nivel:"critico"},
      {label:"Arrendamiento sin opción de renovación",impacto:"Desalojo forzoso — pérdida de inversión en local",nivel:"alto"},
      {label:"Gravamen no identificado sobre inmueble propio",impacto:"Embargo sorpresivo — pérdida del bien",nivel:"critico"},
    ]
  },
  "O-08": {
    docs: [
      {id:"licencia_ambiental",label:"Licencia ambiental SEMARNAT",requerido:false,desc:"Si la actividad requiere MIA o LAU"},
      {id:"coa",label:"Cédula de Operación Anual (COA)",requerido:false,desc:"Emisiones a la atmósfera — si aplica"},
      {id:"manifiesto_residuos",label:"Manifiestos de residuos peligrosos",requerido:false,desc:"Con transportista y disposición final autorizados"},
    ],
    checklist: [
      {id:"mia_aprobada",label:"MIA aprobada si actividad lo requiere",riesgo:"critico"},
      {id:"noms_cumplidas",label:"NOMs ambientales aplicables cumplidas",riesgo:"alto"},
      {id:"residuos_peligrosos",label:"Residuos peligrosos manejados con transportista autorizado",riesgo:"alto"},
      {id:"coa_presentada",label:"COA presentada anualmente si aplica",riesgo:"medio"},
      {id:"auditoria_ambiental",label:"Auditoría ambiental voluntaria realizada",riesgo:"bajo"},
    ],
    riesgos: [
      {label:"Operación sin MIA — sanción PROFEPA",impacto:"Clausura + multa hasta $23 millones + remediación",nivel:"critico"},
      {label:"Residuos peligrosos sin control documental",impacto:"Responsabilidad objetiva — daño ambiental imprescriptible",nivel:"critico"},
    ]
  },
  "O-09": {
    docs: [
      {id:"registro_sanitario",label:"Registros sanitarios COFEPRIS",requerido:true,desc:"Por producto — vigencia 5 años"},
      {id:"licencia_sanitaria",label:"Licencias sanitarias de establecimientos",requerido:true,desc:"Por establecimiento — renovación anual"},
      {id:"buenas_practicas",label:"Manual de buenas prácticas de manufactura",requerido:false,desc:"GMP/BPM según tipo de producto"},
    ],
    checklist: [
      {id:"registros_vigentes",label:"Registros sanitarios vigentes para todos los productos",riesgo:"critico"},
      {id:"licencias_establecimientos",label:"Licencias sanitarias de establecimientos vigentes",riesgo:"critico"},
      {id:"bpm_implementadas",label:"BPM implementadas y documentadas",riesgo:"alto"},
      {id:"etiquetado_correcto",label:"Etiquetado conforme a NOMs aplicables",riesgo:"alto"},
      {id:"farmacovigilancia",label:"Sistema de farmacovigilancia si aplica",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Comercialización sin registro sanitario",impacto:"Retiro del mercado + multa + proceso penal",nivel:"critico"},
      {label:"Incumplimiento de BPM",impacto:"Suspensión de licencia sanitaria — paro de producción",nivel:"critico"},
    ]
  },
  "O-10": {
    docs: [
      {id:"contratos_internacionales",label:"Contratos con partes extranjeras",requerido:true,desc:"Con ley aplicable y jurisdicción definidas"},
      {id:"apostillas",label:"Documentos con apostilla o legalización",requerido:false,desc:"Para uso en el extranjero"},
      {id:"poderes_extranjero",label:"Poderes para el extranjero",requerido:false,desc:"Apostillados y en idioma del país"},
      {id:"agentes_representantes",label:"Contratos con agentes en el extranjero",requerido:false,desc:"Con límites de representación claros"},
    ],
    checklist: [
      {id:"ley_aplicable",label:"Ley aplicable y jurisdicción definidas en contratos",riesgo:"critico"},
      {id:"clausula_arbitraje_int",label:"Cláusula de arbitraje internacional en contratos relevantes",riesgo:"alto"},
      {id:"poderes_apostillados",label:"Poderes apostillados vigentes en países de operación",riesgo:"alto"},
      {id:"restricciones_exportacion",label:"Restricciones de exportación/importación verificadas",riesgo:"medio"},
      {id:"compliance_anticorrupcion",label:"Compliance anti-corrupción en operaciones internacionales",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Contrato sin ley aplicable — litigio sobre jurisdicción",impacto:"Proceso preliminar de años para definir dónde litigar",nivel:"alto"},
      {label:"Agente en el extranjero sin límites de representación",impacto:"La empresa queda obligada por actos del agente",nivel:"critico"},
      {label:"FCPA / Ley Anticorrupción de EEUU en operaciones con nexo americano",impacto:"Multas millonarias + proceso penal en EEUU",nivel:"critico"},
    ]
  },
};

export function ModO01({client}){
  const [docs,setDocs]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("documents").select("*").eq("client_id",client.id)
      .in("type",["marca","patente","derecho_autor","modelo_utilidad","diseno_industrial"])
      .then(({data:d})=>{setDocs(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:"#5A8A3C",fontFamily:"Georgia, serif"}}>{docs.filter(x=>x.status==="vigente").length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Vigentes</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:GOLD,fontFamily:"Georgia, serif"}}>{docs.filter(x=>x.status==="por renovar").length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Por renovar</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:"#C0392B",fontFamily:"Georgia, serif"}}>{docs.filter(x=>x.status==="vencido").length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Vencidos</div></div>
      </div>
      {docs.length===0
        ?<div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={s.muted}>Sin activos de propiedad intelectual registrados. El despacho puede ayudarte a registrar marcas y proteger tu PI.</div></div>
        :<div style={s.card}>{docs.map(x=><div key={x.id} style={s.row}><span style={s.dot(x.status)}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.name}</div><div style={s.muted}>{x.type}{x.date?" · "+x.date:""}</div></div><Badge status={x.status} label={x.status}/></div>)}</div>
      }
    </div>
  );
}
export function ModO02({client}){
  const [contratos,setContratos]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("contratos").select("*").eq("client_id",client.id).eq("tipo","proveedor")
      .then(({data:d})=>{setContratos(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      {contratos.length===0
        ?<div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={s.muted}>Sin contratos de proveedores registrados.</div></div>
        :<div style={s.card}>{contratos.map(x=><div key={x.id} style={s.row}><span style={s.dot(x.status)}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.nombre}</div><div style={s.muted}>{x.contraparte}{x.vencimiento?" · Vence: "+x.vencimiento:""}</div></div><Badge status={x.status} label={x.status}/></div>)}</div>
      }
    </div>
  );
}
export function ModO03({client}){ return <ModO02 client={client}/>; }
export function ModO04({client}){ return <ModO02 client={client}/>; }
export function ModO05({client}){
  return <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={{fontSize:14,fontFamily:"Georgia, serif",marginBottom:8}}>Tecnología y SaaS</div><div style={s.muted}>El despacho gestiona los contratos de tecnología y políticas de ciberseguridad en este módulo.</div></div>;
}
export function ModO06({client}){ return <ModO05 client={client}/>; }
export function ModO07({client}){
  const [docs,setDocs]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("documents").select("*").eq("client_id",client.id)
      .in("type",["escritura","arrendamiento_comercial","licencia_funcionamiento","uso_suelo"])
      .then(({data:d})=>{setDocs(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      {docs.length===0
        ?<div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={s.muted}>Sin inmuebles registrados.</div></div>
        :<div style={s.card}>{docs.map(x=><div key={x.id} style={s.row}><span style={s.dot(x.status)}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.name}</div><div style={s.muted}>{x.type}{x.date?" · "+x.date:""}</div></div><Badge status={x.status} label={x.status}/></div>)}</div>
      }
    </div>
  );
}
export function ModO08({client}){ return <ModO05 client={client}/>; }
export function ModO09({client}){
  const [docs,setDocs]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("documents").select("*").eq("client_id",client.id)
      .in("type",["registro_sanitario","licencia_sanitaria","bpm"])
      .then(({data:d})=>{setDocs(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      {docs.length===0
        ?<div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={s.muted}>Sin registros sanitarios registrados.</div></div>
        :<div style={s.card}>{docs.map(x=><div key={x.id} style={s.row}><span style={s.dot(x.status)}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.name}</div><div style={s.muted}>{x.type}{x.date?" · "+x.date:""}</div></div><Badge status={x.status} label={x.status}/></div>)}</div>
      }
    </div>
  );
}
export function ModO10({client}){
  const [contratos,setContratos]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("contratos").select("*").eq("client_id",client.id).eq("tipo","internacional")
      .then(({data:d})=>{setContratos(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      {contratos.length===0
        ?<div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={s.muted}>Sin contratos internacionales registrados.</div></div>
        :<div style={s.card}>{contratos.map(x=><div key={x.id} style={s.row}><span style={s.dot(x.status)}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.nombre}</div><div style={s.muted}>{x.contraparte}{x.vencimiento?" · Vence: "+x.vencimiento:""}</div></div><Badge status={x.status} label={x.status}/></div>)}</div>
      }
    </div>
  );
}
