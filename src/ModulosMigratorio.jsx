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

export const MIGRATORIO_DOCS = {
  "M-01": {
    docs: [
      {id:"fm3_residente_temporal",label:"Tarjeta de Residente Temporal con permiso de trabajo",requerido:true,desc:"Por cada trabajador extranjero — vigencia 1-4 años"},
      {id:"oferta_trabajo_inm",label:"Oferta de trabajo validada por INM",requerido:true,desc:"Previa al trámite de visa"},
      {id:"contrato_laboral_extranjero",label:"Contrato de trabajo del extranjero",requerido:true,desc:"En español — con prestaciones de ley"},
      {id:"apostilla_documentos",label:"Documentos del extranjero apostillados",requerido:true,desc:"Título, acta de nacimiento, antecedentes penales"},
      {id:"aviso_contratacion_inm",label:"Aviso de contratación de extranjero al INM",requerido:true,desc:"Dentro de los 15 días de inicio de relación laboral"},
      {id:"aviso_baja_inm",label:"Aviso de baja al INM",requerido:false,desc:"Al término de la relación laboral — 15 días"},
    ],
    checklist: [
      {id:"documentos_vigentes",label:"Tarjetas de residente vigentes para todos los extranjeros",riesgo:"critico"},
      {id:"aviso_contratacion",label:"Aviso de contratación presentado al INM en tiempo",riesgo:"alto"},
      {id:"contrato_ley",label:"Contrato de trabajo conforme a LFT",riesgo:"alto"},
      {id:"imss_extranjero",label:"Extranjero dado de alta en IMSS",riesgo:"critico"},
      {id:"permiso_actividad",label:"Permiso migratorio corresponde a la actividad realizada",riesgo:"critico"},
      {id:"renovacion_anticipada",label:"Renovaciones iniciadas 3 meses antes del vencimiento",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Extranjero trabajando con documento vencido",impacto:"Multa al empleador de $2,000 a $5,000 UMAs + deportación del trabajador",nivel:"critico"},
      {label:"Actividad diferente al permiso migratorio",impacto:"Cancelación del permiso + sanción al empleador",nivel:"critico"},
      {label:"Sin aviso de contratación al INM",impacto:"Multa de $500 a $1,000 UMAs por trabajador",nivel:"alto"},
    ]
  },
  "M-02": {
    docs: [
      {id:"carta_asignacion",label:"Carta de asignación intracompañía",requerido:true,desc:"De la empresa origen a la empresa destino en México"},
      {id:"visa_intracompany",label:"Visa de residente temporal — transferencia intracompañía",requerido:true,desc:"Categoría: cargos directivos, gerenciales o especializados"},
      {id:"comprobante_relacion",label:"Comprobante de relación corporativa entre empresas",requerido:true,desc:"Escrituras, actas de asamblea — que demuestren grupo"},
      {id:"historial_laboral",label:"Historial laboral en empresa origen (mínimo 1 año)",requerido:true,desc:"Carta de la empresa origen con puesto y tiempo"},
      {id:"descripcion_puesto",label:"Descripción detallada del puesto en México",requerido:true,desc:"Justificando especialización o cargo directivo"},
    ],
    checklist: [
      {id:"relacion_corporativa",label:"Relación corporativa entre empresas documentada",riesgo:"critico"},
      {id:"cargo_calificado",label:"Cargo es directivo, gerencial o especializado",riesgo:"critico"},
      {id:"un_ano_origen",label:"Empleado tiene al menos 1 año en empresa origen",riesgo:"alto"},
      {id:"carta_asignacion_vigente",label:"Carta de asignación vigente y con condiciones claras",riesgo:"alto"},
      {id:"split_payroll",label:"Split payroll analizado — obligaciones fiscales de ambos países",riesgo:"alto"},
      {id:"convenio_ss",label:"Convenio de seguridad social entre países analizado",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Transferencia sin documentar relación corporativa",impacto:"Rechazo de visa — empleado no puede trabajar en México",nivel:"critico"},
      {label:"Double taxation por split payroll mal estructurado",impacto:"ISR en dos países + recargos + multas",nivel:"critico"},
      {label:"IMSS no pagado por asumir que el origen lo cubre",impacto:"Crédito IMSS + responsabilidad solidaria de la empresa",nivel:"alto"},
    ]
  },
  "M-03": {
    docs: [
      {id:"visa_inversionista",label:"Visa de residente temporal — actividades lucrativas",requerido:true,desc:"Para representantes de empresa extranjera en México"},
      {id:"poder_representacion",label:"Poder notarial de la empresa extranjera",requerido:true,desc:"Apostillado — que acredite representación en México"},
      {id:"inscripcion_rppyc_ext",label:"Inscripción de empresa extranjera en RPPyC",requerido:false,desc:"Si opera habitualmente en México (art. 250 LGSM)"},
      {id:"rfc_extranjero",label:"RFC de la persona física extranjera",requerido:true,desc:"Si percibe ingresos de fuente mexicana"},
      {id:"contrato_representacion",label:"Contrato de representación o agencia",requerido:false,desc:"Con empresa mexicana si aplica"},
    ],
    checklist: [
      {id:"visa_actividad_correcta",label:"Visa corresponde a la actividad de representación",riesgo:"critico"},
      {id:"poder_vigente_ext",label:"Poder notarial vigente y apostillado",riesgo:"alto"},
      {id:"rfc_tramitado",label:"RFC tramitado si percibe ingresos en México",riesgo:"alto"},
      {id:"establecimiento_permanente",label:"Riesgo de establecimiento permanente analizado",riesgo:"critico"},
      {id:"inscripcion_analizada",label:"Necesidad de inscripción en RPPyC analizada",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Establecimiento permanente no declarado",impacto:"ISR sobre utilidades atribuibles en México + multas",nivel:"critico"},
      {label:"Representante sin visa de actividades lucrativas",impacto:"Deportación + sanción a la empresa mexicana receptora",nivel:"critico"},
      {label:"Empresa extranjera operando sin inscripción RPPyC",impacto:"Contratos nulos + imposibilidad de litigar en México",nivel:"alto"},
    ]
  },
  "M-04": {
    docs: [
      {id:"avisos_inm_contratacion",label:"Avisos de contratación al INM (todos los extranjeros)",requerido:true,desc:"Dentro de 15 días de inicio — acuse de presentación"},
      {id:"avisos_inm_baja",label:"Avisos de baja al INM",requerido:true,desc:"Al término de la relación — 15 días"},
      {id:"avisos_inm_cambio",label:"Avisos de cambio de domicilio o condición",requerido:false,desc:"Cuando hay cambios en la situación migratoria"},
      {id:"registro_empleador_inm",label:"Registro como empleador habitual de extranjeros",requerido:false,desc:"Facilita trámites futuros ante el INM"},
    ],
    checklist: [
      {id:"avisos_en_tiempo",label:"Avisos de contratación presentados en 15 días",riesgo:"alto"},
      {id:"bajas_notificadas",label:"Bajas notificadas al INM al término de relación",riesgo:"alto"},
      {id:"expedientes_actualizados",label:"Expedientes migratorios de cada extranjero actualizados",riesgo:"medio"},
      {id:"vencimientos_controlados",label:"Vencimientos de documentos migratorios en calendario",riesgo:"critico"},
      {id:"protocolo_deportacion",label:"Protocolo ante inspección migratoria documentado",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Inspección del INM sin documentación en orden",impacto:"Multa de $500 a $5,000 UMAs + aseguramiento de extranjeros",nivel:"critico"},
      {label:"Omisión de aviso de baja — extranjero sigue como activo",impacto:"Responsabilidad del empleador por actividades del ex-empleado",nivel:"alto"},
      {label:"Documento migratorio vencido no detectado",impacto:"Multa + proceso administrativo migratorio",nivel:"critico"},
    ]
  },
  "M-05": {
    docs: [
      {id:"alta_imss_extranjero",label:"Alta IMSS del trabajador extranjero",requerido:true,desc:"Desde el primer día — igual que nacionales"},
      {id:"rfc_extranjero_nomina",label:"RFC del trabajador extranjero",requerido:true,desc:"Necesario para timbrar CFDI de nómina"},
      {id:"curp_extranjero",label:"CURP del trabajador extranjero",requerido:true,desc:"Tramitada ante RENAPO"},
      {id:"convenio_ss_pais",label:"Análisis de convenio de SS con país de origen",requerido:false,desc:"México tiene convenios con EE.UU., Canadá, España y otros"},
      {id:"retencion_isr_extranjero",label:"Cálculo de retención ISR para residente extranjero",requerido:true,desc:"Tasa puede diferir según días de presencia en México"},
    ],
    checklist: [
      {id:"imss_desde_dia_uno",label:"Alta IMSS desde el primer día de trabajo",riesgo:"critico"},
      {id:"rfc_curp_tramitados",label:"RFC y CURP tramitados antes de primer pago",riesgo:"alto"},
      {id:"isr_correcto",label:"ISR calculado correctamente según residencia fiscal",riesgo:"alto"},
      {id:"convenio_analizado",label:"Convenio de seguridad social con país de origen analizado",riesgo:"medio"},
      {id:"cfdi_nomina_correcto",label:"CFDI de nómina con datos correctos del extranjero",riesgo:"alto"},
      {id:"dias_presencia",label:"Días de presencia en México monitoreados (183 días)",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Extranjero se convierte en residente fiscal sin saberlo",impacto:"ISR sobre ingresos mundiales — no solo los de México",nivel:"critico"},
      {label:"IMSS no pagado por desconocimiento",impacto:"Crédito IMSS + recargos desde el primer día de trabajo",nivel:"critico"},
      {label:"CFDI de nómina con RFC incorrecto",impacto:"Nómina no deducible — ajuste fiscal anual",nivel:"alto"},
    ]
  },
};

export function ModM01({client}){
  const [personas,setPersonas]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("personas").select("*").eq("client_id",client.id)
      .eq("nacionalidad_extranjera",true)
      .order("nombre",{ascending:true})
      .then(({data:d})=>{setPersonas(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  const vigentes=personas.filter(x=>x.visa_status==="vigente");
  const porVencer=personas.filter(x=>x.visa_status==="por renovar");
  const vencidos=personas.filter(x=>x.visa_status==="vencido");
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:"#5A8A3C",fontFamily:"Georgia, serif"}}>{vigentes.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Vigentes</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:GOLD,fontFamily:"Georgia, serif"}}>{porVencer.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Por renovar</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:"#C0392B",fontFamily:"Georgia, serif"}}>{vencidos.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Vencidos</div></div>
      </div>
      {personas.length===0
        ?<div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={s.muted}>Sin personal extranjero registrado. Si contratarás personal de otro país, el despacho gestiona todo el proceso migratorio.</div></div>
        :<div style={s.card}>
          <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:8}}>PERSONAL EXTRANJERO</div>
          {personas.map(p=>{
            const diasVence=p.visa_vencimiento?Math.ceil((new Date(p.visa_vencimiento)-new Date())/(1000*60*60*24)):null;
            return(
              <div key={p.id} style={{...s.row,alignItems:"flex-start"}}>
                <span style={{...s.dot(p.visa_status||"por renovar"),marginTop:4}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{p.nombre}</div>
                  <div style={s.muted}>{p.cargo||p.tipo}{p.nacionalidad?" · "+p.nacionalidad:""}</div>
                  {p.visa_vencimiento&&<div style={{fontSize:11,color:diasVence&&diasVence<90?"#C0392B":GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>Vence: {p.visa_vencimiento}{diasVence?` (${diasVence} días)`:""}</div>}
                </div>
                <Badge status={p.visa_status||"por renovar"} label={p.visa_tipo||"Sin tipo"}/>
              </div>
            );
          })}
        </div>
      }
      <div style={{...s.card,marginTop:12,borderLeft:"3px solid "+MUSGO}}>
        <div style={{fontSize:11,fontWeight:600,color:MUSGO,fontFamily:"system-ui,sans-serif",marginBottom:8}}>TIPOS DE PERMISO MIGRATORIO PARA TRABAJO</div>
        {[
          {tipo:"Residente Temporal con permiso de trabajo",desc:"Vigencia 1-4 años renovable — el más común"},
          {tipo:"Residente Permanente",desc:"Sin restricción de trabajo — después de 4 años como temporal"},
          {tipo:"Transferencia intracompañía",desc:"Directivos y personal especializado de empresas del mismo grupo"},
          {tipo:"Visitante con permiso de trabajo",desc:"Hasta 180 días — actividades específicas o temporales"},
        ].map((x,i)=>(
          <div key={i} style={{padding:"8px 0",borderBottom:i<3?"1px solid "+BORDER:"none"}}>
            <div style={{fontSize:12,fontWeight:500,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{x.tipo}</div>
            <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>{x.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModM02({client}){
  const [personas,setPersonas]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("personas").select("*").eq("client_id",client.id)
      .eq("tipo","transferencia_intracompania")
      .then(({data:d})=>{setPersonas(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      {personas.length===0
        ?<div style={{...s.card,borderLeft:"3px solid "+MUSGO}}><div style={s.muted}>Sin transferencias intracompañía registradas. El despacho gestiona el proceso completo: validación de relación corporativa, carta de asignación, trámite de visa y obligaciones fiscales en ambos países.</div></div>
        :<div style={s.card}>{personas.map(p=><div key={p.id} style={s.row}><span style={s.dot(p.visa_status||"por renovar")}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{p.nombre}</div><div style={s.muted}>{p.empresa_origen?" Origen: "+p.empresa_origen:""}{p.cargo?" · "+p.cargo:""}</div></div><Badge status={p.visa_status||"por renovar"} label={p.visa_vencimiento||"Sin datos"}/></div>)}</div>
      }
      <div style={{...s.card,marginTop:12,borderLeft:"3px solid "+MUSGO}}>
        <div style={{fontSize:11,fontWeight:600,color:MUSGO,fontFamily:"system-ui,sans-serif",marginBottom:8}}>REQUISITOS TRANSFERENCIA INTRACOMPAÑÍA</div>
        {["Relación corporativa documentada entre empresa origen y México","Empleado con mínimo 1 año en la empresa del grupo","Cargo directivo, gerencial o de conocimiento especializado","Carta de asignación con duración, condiciones y retorno","Análisis de split payroll y obligaciones fiscales en ambos países"].map((x,i)=>(
          <div key={i} style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,padding:"6px 0",borderBottom:i<4?"1px solid "+BORDER:"none"}}>{x}</div>
        ))}
      </div>
    </div>
  );
}

export function ModM03({client}){
  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO,marginBottom:16}}>
        <div style={{fontSize:14,fontFamily:"Georgia, serif",marginBottom:8}}>Representantes de Empresa Extranjera</div>
        <div style={s.muted}>El despacho gestiona el proceso de visa para representantes e inversionistas extranjeros, así como el análisis de establecimiento permanente y obligaciones fiscales.</div>
      </div>
      <div style={s.card}>
        <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:12}}>RIESGO DE ESTABLECIMIENTO PERMANENTE</div>
        {[
          {concepto:"Agente dependiente con facultades para contratar",riesgo:"alto"},
          {concepto:"Lugar fijo de negocios en México (oficina, almacén)",riesgo:"critico"},
          {concepto:"Obras o proyectos de construcción más de 183 días",riesgo:"alto"},
          {concepto:"Servicios prestados por más de 183 días en 12 meses",riesgo:"alto"},
        ].map((x,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<3?"1px solid "+BORDER:"none"}}>
            <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,flex:1}}>{x.concepto}</div>
            <Badge status={x.riesgo==="critico"?"red":"amber"} label={x.riesgo}/>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModM04({client}){
  const [personas,setPersonas]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("personas").select("*").eq("client_id",client.id)
      .eq("nacionalidad_extranjera",true)
      .then(({data:d})=>{setPersonas(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  const proxVencer=personas.filter(x=>{
    if(!x.visa_vencimiento)return false;
    const dias=Math.ceil((new Date(x.visa_vencimiento)-new Date())/(1000*60*60*24));
    return dias>=0&&dias<=90;
  });
  return(
    <div>
      {proxVencer.length>0&&<div style={{...s.card,borderLeft:"3px solid #C0392B",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:600,color:"#C0392B",fontFamily:"system-ui,sans-serif",marginBottom:8}}>RENOVACIONES URGENTES</div>
        {proxVencer.map(p=>{
          const dias=Math.ceil((new Date(p.visa_vencimiento)-new Date())/(1000*60*60*24));
          return <div key={p.id} style={s.row}><span style={s.dot("vencido")}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{p.nombre}</div><div style={s.muted}>Vence: {p.visa_vencimiento}</div></div><Badge status="red" label={dias+" días"}/></div>;
        })}
      </div>}
      <div style={s.card}>
        <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:12}}>OBLIGACIONES ANTE EL INM</div>
        {[
          {obligacion:"Aviso de contratación",plazo:"15 días hábiles desde inicio de relación laboral"},
          {obligacion:"Aviso de baja",plazo:"15 días hábiles desde término de relación laboral"},
          {obligacion:"Aviso de cambio de domicilio",plazo:"15 días hábiles desde el cambio"},
          {obligacion:"Renovación de documento migratorio",plazo:"30 días antes del vencimiento (máximo)"},
          {obligacion:"Aviso de cambio de empleador",plazo:"15 días hábiles desde el cambio"},
        ].map((x,i)=>(
          <div key={i} style={{padding:"10px 0",borderBottom:i<4?"1px solid "+BORDER:"none"}}>
            <div style={{fontSize:12,fontWeight:500,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{x.obligacion}</div>
            <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>{x.plazo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModM05({client}){
  const [personas,setPersonas]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from("personas").select("*").eq("client_id",client.id)
      .eq("nacionalidad_extranjera",true)
      .then(({data:d})=>{setPersonas(d||[]);setLoading(false);});
  },[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:MUSGO,fontFamily:"Georgia, serif"}}>{personas.length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Extranjeros en nómina</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:"#5A8A3C",fontFamily:"Georgia, serif"}}>{personas.filter(x=>x.imss_alta).length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Con alta IMSS</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:28,fontWeight:400,color:"#C0392B",fontFamily:"Georgia, serif"}}>{personas.filter(x=>!x.imss_alta).length}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Sin alta IMSS</div></div>
      </div>
      <div style={s.card}>
        <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:12}}>REGLA DE LOS 183 DÍAS — RESIDENCIA FISCAL</div>
        <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,padding:"10px",background:"#FFF7ED",borderRadius:4,marginBottom:12,border:"1px solid #FED7AA"}}>
          Un extranjero que permanece más de 183 días en México en un período de 12 meses se convierte en residente fiscal mexicano y debe pagar ISR sobre sus ingresos mundiales.
        </div>
        {[
          {concepto:"Residente en el extranjero (menos de 183 días)",isr:"ISR solo sobre ingresos de fuente mexicana — tasa 15% o 30% según monto"},
          {concepto:"Residente fiscal en México (183+ días)",isr:"ISR sobre ingresos mundiales — mismas tasas que nacionales"},
          {concepto:"Convenio para evitar doble tributación",isr:"Puede reducir o eliminar ISR mexicano — verificar país de origen"},
        ].map((x,i)=>(
          <div key={i} style={{padding:"10px 0",borderBottom:i<2?"1px solid "+BORDER:"none"}}>
            <div style={{fontSize:12,fontWeight:500,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{x.concepto}</div>
            <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>{x.isr}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
