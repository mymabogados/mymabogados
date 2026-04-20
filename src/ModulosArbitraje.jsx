import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const GOLD = "#C9A84C";
const MUSGO = "#4A5C45";
const GRAY = "#7A9070";
const BORDER = "#DDE4D8";
const TEXT_DARK = "#1E2B1A";
const TEXT_MED = "#7A9070";
const WHITE = "#FAFCF8";

function Spinner(){return <div style={{textAlign:"center",padding:"2rem",color:GRAY,fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;}
function Badge({status,label}){
  const map={vigente:["#f0fdf4","#166534"],vencido:["#fef2f2","#991b1b"],"por renovar":["#fffbeb","#92400e"],pendiente:["#fffbeb","#92400e"],green:["#f0fdf4","#166534"],red:["#fef2f2","#991b1b"],amber:["#fffbeb","#92400e"]};
  const [bg,color]=map[status]||["#f3f4f6","#374151"];
  return <span style={{fontSize:10,padding:"2px 8px",borderRadius:2,fontWeight:400,background:bg,color,whiteSpace:"nowrap",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>{label||status}</span>;
}

const s = {
  card:{background:"#FAFCF8",border:"1px solid "+BORDER,borderRadius:4,padding:"1rem 1.25rem",marginBottom:8},
  row:{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:"1px solid "+BORDER},
  muted:{fontSize:12,color:GRAY,fontFamily:"system-ui,sans-serif"},
  flex:(gap=8)=>({display:"flex",gap,alignItems:"center"}),
  scoreCard:{background:"#FAFCF8",border:"1px solid "+BORDER,borderRadius:4,padding:".75rem .8rem",textAlign:"center",flex:1},
  btnGold:{background:GOLD,color:WHITE,border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif"},
  btnSm:{padding:"4px 10px",fontSize:11},
  btn:{background:"none",border:"1px solid "+BORDER,borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",color:TEXT_DARK,fontFamily:"system-ui,sans-serif"},
  btnPrimary:{background:MUSGO,color:"#F0F4EE",border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif"},
  input:{width:"100%",border:"1px solid "+BORDER,borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#FAFCF8",fontFamily:"system-ui,sans-serif"},
  dot:status=>({width:8,height:8,borderRadius:"50%",background:status==="vigente"?"#5A8A3C":status==="vencido"?"#C0392B":GOLD,flexShrink:0,display:"inline-block"}),
};

export const ARBITRAJE_DOCS = {
  "A-01": {
    docs: [
      {id:"clausula_arbitral",label:"Cláusula arbitral en contratos vigentes",requerido:true,desc:"Revisada y actualizada — institución, sede, ley aplicable"},
      {id:"reglamento_arbitral",label:"Reglamento arbitral aplicable",requerido:false,desc:"ICC, CANACO, CAM, UNCITRAL"},
      {id:"demanda_arbitral",label:"Demanda arbitral o escrito de respuesta",requerido:false,desc:"Si hay procedimiento activo"},
      {id:"laudo_arbitral",label:"Laudo arbitral (si resuelto)",requerido:false,desc:"Con constancia de notificación"},
      {id:"poder_arbitraje",label:"Poder notarial para arbitraje",requerido:true,desc:"A favor del abogado árbitro — con facultades expresas"},
    ],
    checklist: [
      {id:"clausulas_revisadas",label:"Cláusulas arbitrales revisadas en todos los contratos clave",riesgo:"alto"},
      {id:"institucion_designada",label:"Institución arbitral designada (no arbitraje ad hoc)",riesgo:"medio"},
      {id:"sede_definida",label:"Sede y ley aplicable definidas expresamente",riesgo:"alto"},
      {id:"poder_vigente",label:"Poder para arbitraje vigente y con facultades suficientes",riesgo:"critico"},
      {id:"provision_costos",label:"Provisión de costos arbitrales registrada",riesgo:"medio"},
      {id:"medidas_cautelares",label:"Medidas cautelares solicitadas si hay riesgo de daño",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Cláusula arbitral patológica — nula o de difícil ejecución",impacto:"Procedimiento nulo — vuelta al litigio ordinario con tiempo perdido",nivel:"critico"},
      {label:"Laudo no ejecutable por defecto de forma",impacto:"Reconocimiento y ejecución negados por tribunales",nivel:"alto"},
      {label:"Costos arbitrales no provisionados",impacto:"Impacto financiero inesperado — honorarios árbitros desde $50,000 USD",nivel:"alto"},
    ]
  },
  "A-02": {
    docs: [
      {id:"acuerdo_mediacion",label:"Acuerdo de mediación firmado",requerido:false,desc:"Con constancia del centro de mediación"},
      {id:"convenio_transaccion",label:"Convenio de transacción ratificado",requerido:false,desc:"Ante juez para dar fuerza ejecutiva"},
      {id:"clausula_med_arb",label:"Cláusula Med-Arb en contratos",requerido:false,desc:"Mediación previa obligatoria antes de arbitraje"},
    ],
    checklist: [
      {id:"mediador_certificado",label:"Mediador certificado por institución reconocida",riesgo:"medio"},
      {id:"convenio_ratificado",label:"Convenio de mediación ratificado judicialmente",riesgo:"alto"},
      {id:"compromisos_seguimiento",label:"Compromisos post-mediación con seguimiento documentado",riesgo:"medio"},
      {id:"confidencialidad",label:"Cláusula de confidencialidad en proceso de mediación",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Convenio de mediación sin fuerza ejecutiva",impacto:"Sin ratificación judicial no es título ejecutivo",nivel:"alto"},
      {label:"Incumplimiento de compromisos post-mediación",impacto:"Reinicio del conflicto con posición debilitada",nivel:"medio"},
    ]
  },
  "A-03": {
    docs: [
      {id:"expediente_civil",label:"Expediente del juicio civil o mercantil",requerido:true,desc:"Número, juzgado, tipo de juicio"},
      {id:"poder_litigios_civil",label:"Poder notarial para pleitos y cobranzas",requerido:true,desc:"Vigente y con facultades suficientes"},
      {id:"contestacion_civil",label:"Contestación de demanda presentada",requerido:false,desc:"Con acuse de presentación"},
      {id:"pruebas_civiles",label:"Pruebas documentales ofrecidas",requerido:true,desc:"Organizadas por hechos de la demanda"},
      {id:"provision_civil",label:"Provisión contable del contingente",requerido:false,desc:"NIF C-9 — si probabilidad alta"},
    ],
    checklist: [
      {id:"abogado_poder",label:"Abogado con poder vigente para el juicio",riesgo:"critico"},
      {id:"terminos_contestacion",label:"Contestación presentada en términos legales",riesgo:"critico"},
      {id:"pruebas_ofrecidas",label:"Pruebas documentales ofrecidas y admitidas",riesgo:"alto"},
      {id:"provision_nif",label:"Provisión contable registrada (NIF C-9)",riesgo:"medio"},
      {id:"audiencias_seguimiento",label:"Audiencias y actuaciones con seguimiento puntual",riesgo:"critico"},
      {id:"reconvencion_analizada",label:"Posibilidad de reconvención analizada",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Condena en rebeldía por falta de contestación",impacto:"Pretensiones del actor concedidas automáticamente",nivel:"critico"},
      {label:"Caducidad de la instancia por inactividad",impacto:"Pérdida del juicio — reinicio desde cero si aplica",nivel:"alto"},
      {label:"Embargo de bienes por condena no garantizada",impacto:"Paralización operativa — afectación de cuentas y activos",nivel:"critico"},
    ]
  },
  "A-04": {
    docs: [
      {id:"acto_reclamado",label:"Identificación del acto reclamado",requerido:true,desc:"Exactamente qué se impugna y por qué"},
      {id:"demanda_amparo",label:"Demanda de amparo presentada",requerido:false,desc:"Con acuse de presentación"},
      {id:"suspension_solicitada",label:"Solicitud de suspensión del acto",requerido:false,desc:"Provisional y definitiva si aplica"},
      {id:"garantia_suspension",label:"Garantía para suspensión",requerido:false,desc:"Si se requiere para otorgar la suspensión"},
    ],
    checklist: [
      {id:"plazo_15_dias",label:"Demanda presentada dentro de 15 días hábiles",riesgo:"critico"},
      {id:"suspension_solicitada_check",label:"Suspensión del acto solicitada si hay urgencia",riesgo:"alto"},
      {id:"agravios_correctos",label:"Agravios correctamente formulados — violaciones concretas",riesgo:"alto"},
      {id:"principio_relatividad",label:"Principio de relatividad observado",riesgo:"medio"},
      {id:"cumplimiento_ejecutoria",label:"Cumplimiento de ejecutoria monitoreado",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Amparo extemporáneo — plazo vencido",impacto:"Sobreseimiento — acto reclamado queda firme",nivel:"critico"},
      {label:"Acto consumado irreparablemente sin suspensión",impacto:"Amparo improcedente — daño sin remedio legal",nivel:"critico"},
      {label:"Incumplimiento de ejecutoria de amparo",impacto:"Repetición del acto — incidente de inejecución — separación del cargo",nivel:"alto"},
    ]
  },
  "A-05": {
    docs: [
      {id:"registro_contingencias",label:"Registro de contingencias activas",requerido:true,desc:"Todas las materias: laboral, fiscal, civil, etc."},
      {id:"opinion_legal",label:"Opinión legal de probabilidad por contingencia",requerido:true,desc:"Probable, posible o remota — con fundamento"},
      {id:"provision_contable",label:"Provisión contable registrada",requerido:false,desc:"NIF C-9 — monto y clasificación"},
      {id:"reporte_auditores",label:"Reporte para auditores externos",requerido:false,desc:"Carta de abogados para auditoría"},
    ],
    checklist: [
      {id:"todas_registradas",label:"Todas las contingencias identificadas y registradas",riesgo:"critico"},
      {id:"probabilidad_clasificada",label:"Probabilidad clasificada: probable/posible/remota",riesgo:"alto"},
      {id:"monto_estimado",label:"Monto estimado de cada contingencia",riesgo:"alto"},
      {id:"provision_correcta",label:"Provisión contable correcta según NIF C-9",riesgo:"alto"},
      {id:"auditores_informados",label:"Auditores externos informados oportunamente",riesgo:"medio"},
      {id:"actualizacion_mensual",label:"Registro actualizado mensualmente",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Contingencias no reveladas en estados financieros",impacto:"Responsabilidad del consejo — dictamen con salvedad",nivel:"critico"},
      {label:"Provisión insuficiente — condena mayor a lo estimado",impacto:"Impacto financiero no previsto — ajuste de resultados",nivel:"alto"},
      {label:"Prescripción de acciones por no monitorear plazos",impacto:"Pérdida de defensas y acciones legales disponibles",nivel:"alto"},
    ]
  },
  "A-06": {
    docs: [
      {id:"expediente_cofece",label:"Expediente COFECE activo",requerido:false,desc:"Número de expediente y estado procesal"},
      {id:"programa_cumplimiento",label:"Programa de cumplimiento en competencia",requerido:false,desc:"Compliance antitrust documentado"},
      {id:"notificacion_concentracion",label:"Notificación de concentración presentada",requerido:false,desc:"Si hay fusión o adquisición relevante"},
    ],
    checklist: [
      {id:"umbral_notificacion",label:"Umbrales de notificación de concentraciones monitoreados",riesgo:"critico"},
      {id:"acuerdos_precio",label:"Sin acuerdos de precio con competidores",riesgo:"critico"},
      {id:"practicas_relativas",label:"Prácticas monopólicas relativas analizadas",riesgo:"alto"},
      {id:"programa_compliance",label:"Programa de compliance antitrust implementado",riesgo:"alto"},
      {id:"capacitacion_directivos",label:"Directivos capacitados en competencia económica",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Multa por práctica monopólica absoluta",impacto:"Hasta 10% de los ingresos anuales del agente económico",nivel:"critico"},
      {label:"Concentración sin notificar a COFECE",impacto:"Multa hasta 8% de ingresos + posible desconcentración forzosa",nivel:"critico"},
      {label:"Inhabilitación de directivos involucrados",impacto:"Hasta 10 años de inhabilitación para ejercer comercio",nivel:"alto"},
    ]
  },
};

export function ModA01({client}){
  const [data,setData]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("historial").select("*").eq("client_id",client.id)
      .in("tipo",["arbitraje","arbitraje_comercial","procedimiento_arbitral"])
      .order("created_at",{ascending:false})
      .then(({data:d})=>{setData(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  const activos=data.filter(x=>x.status!=="concluido");
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:"#C0392B",fontFamily:"Georgia, serif"}}>{activos.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Activos</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:"#5A8A3C",fontFamily:"Georgia, serif"}}>{data.filter(x=>x.status==="concluido").length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Concluidos</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:20,fontWeight:400,color:"#C0392B",fontFamily:"Georgia, serif"}}>{data.reduce((s,x)=>s+(parseFloat(x.monto)||0),0)>0?"$"+data.reduce((s,x)=>s+(parseFloat(x.monto)||0),0).toLocaleString():"—"}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Contingencia</div></div>
      </div>
      {data.length===0
        ?<div style={{...s.card,borderLeft:"3px solid #5A8A3C"}}><div style={{fontSize:13,fontFamily:"Georgia, serif",color:"#5A8A3C"}}>Sin procedimientos arbitrales activos</div></div>
        :<div style={s.card}>{data.map(x=><div key={x.id} style={{...s.row,alignItems:"flex-start"}}>
          <span style={{...s.dot(x.status==="concluido"?"vigente":"vencido"),marginTop:4}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.titulo||x.tipo}</div>
            <div style={s.muted}>{x.autoridad||"ICC/CANACO/CAM"}{x.expediente?" · "+x.expediente:""}</div>
            {x.proxima_fecha&&<div style={{fontSize:11,color:GOLD,fontFamily:"system-ui,sans-serif",marginTop:2}}>Próxima actuación: {x.proxima_fecha}</div>}
          </div>
          <Badge status={x.status==="concluido"?"green":"red"} label={x.status||"activo"}/>
        </div>)}</div>
      }
      <div style={{...s.card,marginTop:12,borderLeft:"3px solid "+MUSGO}}>
        <div style={{fontSize:11,fontWeight:600,color:MUSGO,fontFamily:"system-ui,sans-serif",marginBottom:8}}>INSTITUCIONES ARBITRALES EN MÉXICO</div>
        {["ICC (Cámara de Comercio Internacional) — sede preferida para contratos internacionales","CANACO (Cámara Nacional de Comercio) — árbitros especializados en México","CAM (Centro de Arbitraje de México) — disputas comerciales nacionales","CIACAC / JAMS — contratos con contraparte estadounidense"].map((x,i)=>(
          <div key={i} style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,padding:"5px 0",borderBottom:i<3?"1px solid "+BORDER:"none"}}>{x}</div>
        ))}
      </div>
    </div>
  );
}

export function ModA02({client}){
  const [data,setData]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("historial").select("*").eq("client_id",client.id).ilike("tipo","%mediacion%")
      .then(({data:d})=>{setData(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      {data.length===0
        ?<div style={{...s.card,borderLeft:"3px solid #5A8A3C"}}><div style={{fontSize:13,fontFamily:"Georgia, serif",color:"#5A8A3C"}}>Sin procedimientos de mediación activos</div></div>
        :<div style={s.card}>{data.map(x=><div key={x.id} style={s.row}>
          <span style={s.dot(x.status==="concluido"?"vigente":"por renovar")}/>
          <div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.titulo}</div><div style={s.muted}>{x.fecha}</div></div>
          <Badge status={x.status==="concluido"?"green":"amber"} label={x.status||"en proceso"}/>
        </div>)}</div>
      }
      <div style={{...s.card,marginTop:12,borderLeft:"3px solid "+MUSGO}}>
        <div style={{fontSize:11,fontWeight:600,color:MUSGO,fontFamily:"system-ui,sans-serif",marginBottom:8}}>VENTAJAS DE LA MEDIACIÓN</div>
        {["Confidencial — no crea precedente","Más rápida y económica que litigio o arbitraje","El resultado es negociado — preserva relaciones comerciales","El convenio ratificado tiene fuerza de sentencia ejecutoriada"].map((x,i)=>(
          <div key={i} style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,padding:"5px 0",borderBottom:i<3?"1px solid "+BORDER:"none"}}>{x}</div>
        ))}
      </div>
    </div>
  );
}

export function ModA03({client}){ return <ModA01 client={client}/>; }
export function ModA04({client}){
  const [data,setData]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("historial").select("*").eq("client_id",client.id).ilike("tipo","%amparo%")
      .then(({data:d})=>{setData(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      {data.length===0
        ?<div style={{...s.card,borderLeft:"3px solid #5A8A3C"}}><div style={{fontSize:13,fontFamily:"Georgia, serif",color:"#5A8A3C"}}>Sin amparos activos</div></div>
        :<div style={s.card}>{data.map(x=><div key={x.id} style={s.row}>
          <span style={s.dot(x.status==="concluido"?"vigente":"vencido")}/>
          <div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.titulo}</div><div style={s.muted}>{x.autoridad}{x.expediente?" · "+x.expediente:""}</div></div>
          <Badge status={x.status==="concluido"?"green":"red"} label={x.status||"activo"}/>
        </div>)}</div>
      }
    </div>
  );
}

export function ModA05({client}){
  const [data,setData]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("historial").select("*").eq("client_id",client.id)
      .then(({data:d})=>{setData(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  const total=data.reduce((s,x)=>s+(parseFloat(x.monto)||0),0);
  const probable=data.filter(x=>x.probabilidad==="probable");
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:24,fontWeight:400,color:"#C0392B",fontFamily:"Georgia, serif"}}>{probable.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Probable</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:24,fontWeight:400,color:GOLD,fontFamily:"Georgia, serif"}}>{data.filter(x=>x.probabilidad==="posible").length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Posible</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:18,fontWeight:400,color:"#C0392B",fontFamily:"Georgia, serif"}}>{total>0?"$"+total.toLocaleString():"—"}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Total contingente</div></div>
      </div>
      {data.length===0
        ?<div style={{...s.card,borderLeft:"3px solid #5A8A3C"}}><div style={{fontSize:13,fontFamily:"Georgia, serif",color:"#5A8A3C"}}>Sin contingencias registradas</div></div>
        :<div style={s.card}>{data.map(x=><div key={x.id} style={s.row}>
          <span style={s.dot(x.probabilidad==="probable"?"vencido":x.probabilidad==="posible"?"por renovar":"vigente")}/>
          <div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{x.titulo}</div><div style={s.muted}>{x.tipo}{x.monto?" · $"+parseFloat(x.monto).toLocaleString():""}</div></div>
          <Badge status={x.probabilidad==="probable"?"red":x.probabilidad==="posible"?"amber":"green"} label={x.probabilidad||"remota"}/>
        </div>)}</div>
      }
    </div>
  );
}

export function ModA06({client}){
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO,marginBottom:16}}>
        <div style={{fontSize:14,fontFamily:"Georgia, serif",marginBottom:8}}>Estatus ante COFECE</div>
        <div style={s.muted}>El despacho monitorea el cumplimiento en materia de competencia económica. Sin procedimientos activos registrados.</div>
      </div>
      <div style={s.card}>
        <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:12}}>CONDUCTAS DE RIESGO A EVITAR</div>
        {["Acuerdos de precio, reparto de mercado o clientes con competidores","Condiciones de exclusividad injustificadas con distribuidores","Precios predatorios para eliminar competidores","Fusiones y adquisiciones sin notificar cuando superen umbrales COFECE","Negativa injustificada a contratar con ciertos agentes"].map((x,i)=>(
          <div key={i} style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,padding:"7px 0",borderBottom:i<4?"1px solid "+BORDER:"none"}}>{x}</div>
        ))}
      </div>
    </div>
  );
}
