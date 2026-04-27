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
  const {data,save,saving}=useModData(client,"O-07");
  return(
    <div>
      <InfoBox>Control de inmuebles corporativos — escrituras, uso de suelo, licencias de funcionamiento, arrendamientos y obligaciones registrales.</InfoBox>
      <SectionTitle>Portafolio inmobiliario</SectionTitle>
      <div style={s.grid2}>
        <Field label="Número de inmuebles propios"><input style={s.input} type="number" value={data.num_inmuebles_propios||""} onChange={e=>save("num_inmuebles_propios",e.target.value)} placeholder="0"/></Field>
        <Field label="Número de inmuebles arrendados"><input style={s.input} type="number" value={data.num_inmuebles_arrendados||""} onChange={e=>save("num_inmuebles_arrendados",e.target.value)} placeholder="0"/></Field>
        <Field label="Valor aproximado del portafolio (MXN)"><input style={s.input} type="number" value={data.valor_portafolio||""} onChange={e=>save("valor_portafolio",e.target.value)} placeholder="0"/></Field>
        <Field label="Estados donde opera">
          <input style={s.input} value={data.estados_operacion||""} onChange={e=>save("estados_operacion",e.target.value)} placeholder="CDMX, Monterrey, Guadalajara..."/>
        </Field>
      </div>

      <SectionTitle>Escrituras y registro</SectionTitle>
      <div style={s.grid2}>
        <Field label="Escrituras inscritas en RPP">
          <select value={data.escrituras_rpp||""} onChange={e=>save("escrituras_rpp",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="todas">Todas inscritas</option>
            <option value="parcial">Parcialmente inscritas</option>
            <option value="ninguna">Sin inscripción</option>
          </select>
        </Field>
        <Field label="Folio mercantil / número de escritura principal"><input style={s.input} value={data.folio_escritura||""} onChange={e=>save("folio_escritura",e.target.value)} placeholder="Número de escritura o folio RPP"/></Field>
        <Field label="Gravámenes o hipotecas activas">
          <select value={data.gravamenes||""} onChange={e=>save("gravamenes",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="sin_gravamenes">Sin gravámenes</option>
            <option value="hipoteca">Con hipoteca</option>
            <option value="embargo">Con embargo</option>
            <option value="multiple">Múltiples gravámenes</option>
          </select>
        </Field>
        <Field label="Predial al corriente">
          <select value={data.predial||""} onChange={e=>save("predial",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="corriente">Al corriente</option>
            <option value="adeudos">Con adeudos</option>
            <option value="no_aplica">No aplica — arrendados</option>
          </select>
        </Field>
      </div>

      <SectionTitle>Uso de suelo y licencias</SectionTitle>
      <div style={s.grid2}>
        <Field label="Uso de suelo compatible con actividad">
          <select value={data.uso_suelo||""} onChange={e=>save("uso_suelo",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="compatible">Compatible — sin restricciones</option>
            <option value="condicionado">Condicionado — con restricciones</option>
            <option value="incompatible">Incompatible — riesgo</option>
            <option value="no_verificado">No verificado</option>
          </select>
        </Field>
        <Field label="Licencia de funcionamiento">
          <select value={data.licencia_funcionamiento||""} onChange={e=>save("licencia_funcionamiento",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="vigente">Vigente</option>
            <option value="vencida">Vencida</option>
            <option value="en_tramite">En trámite</option>
            <option value="no_requerida">No requerida</option>
          </select>
        </Field>
        <Field label="Vencimiento licencia de funcionamiento"><input style={s.input} type="date" value={data.vencimiento_licencia||""} onChange={e=>save("vencimiento_licencia",e.target.value)}/></Field>
        <Field label="Aviso de apertura presentado">
          <select value={data.aviso_apertura||""} onChange={e=>save("aviso_apertura",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — presentado</option>
            <option value="no">No</option>
            <option value="na">No aplica</option>
          </select>
        </Field>
      </div>

      <SectionTitle>Arrendamientos</SectionTitle>
      <div style={s.grid2}>
        <Field label="Contratos de arrendamiento vigentes">
          <select value={data.arrendamientos_vigentes||""} onChange={e=>save("arrendamientos_vigentes",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="todos_vigentes">Todos vigentes y firmados</option>
            <option value="parcial">Algunos sin contrato formal</option>
            <option value="sin_contratos">Sin contratos formales</option>
            <option value="na">No aplica — solo propios</option>
          </select>
        </Field>
        <Field label="Depósitos en garantía documentados">
          <select value={data.depositos_garantia||""} onChange={e=>save("depositos_garantia",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — documentados</option>
            <option value="no">No documentados</option>
            <option value="na">No aplica</option>
          </select>
        </Field>
        <Field label="Monto total rentas mensuales (MXN)"><input style={s.input} type="number" value={data.monto_rentas||""} onChange={e=>save("monto_rentas",e.target.value)} placeholder="0"/></Field>
        <Field label="Próximo vencimiento de arrendamiento"><input style={s.input} type="date" value={data.proximo_vencimiento_arr||""} onChange={e=>save("proximo_vencimiento_arr",e.target.value)}/></Field>
      </div>
      <Field label="Observaciones inmobiliarias">
        <textarea style={{...s.input,...s.textarea}} value={data.obs_inmuebles||""} onChange={e=>save("obs_inmuebles",e.target.value)} placeholder="Situaciones especiales, litigios de propiedad, renovaciones en proceso..."/>
      </Field>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}

export function ModO08({client}){
  const {data,save,saving}=useModData(client,"O-08");
  return(
    <div>
      <InfoBox>Cumplimiento ambiental y de NOMs aplicables al centro de trabajo. Licencias SEMARNAT, manejo de residuos, emisiones y responsabilidad ambiental corporativa.</InfoBox>
      <SectionTitle>Licencias y autorizaciones ambientales</SectionTitle>
      <div style={s.grid2}>
        <Field label="Requiere Manifestación de Impacto Ambiental (MIA)">
          <select value={data.requiere_mia||""} onChange={e=>save("requiere_mia",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si_aprobada">Sí — aprobada y vigente</option>
            <option value="si_tramite">Sí — en trámite</option>
            <option value="si_requerida">Sí — requerida pero no iniciada</option>
            <option value="no">No aplica</option>
          </select>
        </Field>
        <Field label="Licencia ambiental única (LAU)">
          <select value={data.lau||""} onChange={e=>save("lau",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="vigente">Vigente</option>
            <option value="vencida">Vencida</option>
            <option value="en_tramite">En trámite</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </Field>
        <Field label="Vencimiento LAU"><input style={s.input} type="date" value={data.vencimiento_lau||""} onChange={e=>save("vencimiento_lau",e.target.value)}/></Field>
        <Field label="Cédula de Operación Anual (COA)">
          <select value={data.coa||""} onChange={e=>save("coa",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="corriente">Al corriente</option>
            <option value="pendiente">Pendiente de presentar</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </Field>
      </div>

      <SectionTitle>Residuos y emisiones</SectionTitle>
      <div style={s.grid2}>
        <Field label="Genera residuos peligrosos">
          <select value={data.residuos_peligrosos||""} onChange={e=>save("residuos_peligrosos",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si_plan">Sí — con plan de manejo</option>
            <option value="si_sin_plan">Sí — sin plan de manejo</option>
            <option value="no">No genera</option>
          </select>
        </Field>
        <Field label="Empresa autorizada para manejo de residuos"><input style={s.input} value={data.empresa_residuos||""} onChange={e=>save("empresa_residuos",e.target.value)} placeholder="Nombre o razón social"/></Field>
        <Field label="Registro de generador de residuos (SEMARNAT)">
          <select value={data.registro_generador||""} onChange={e=>save("registro_generador",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="vigente">Vigente</option>
            <option value="no_registrado">No registrado</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </Field>
        <Field label="Emisiones a la atmósfera">
          <select value={data.emisiones||""} onChange={e=>save("emisiones",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="sin_emisiones">Sin emisiones significativas</option>
            <option value="con_autorizacion">Con emisiones — autorización vigente</option>
            <option value="sin_autorizacion">Con emisiones — sin autorización</option>
          </select>
        </Field>
      </div>

      <SectionTitle>NOMs aplicables</SectionTitle>
      <div style={s.grid2}>
        <Field label="NOMs ambientales identificadas">
          <select value={data.noms_ambientales||""} onChange={e=>save("noms_ambientales",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="identificadas_cumpliendo">Identificadas y en cumplimiento</option>
            <option value="identificadas_parcial">Identificadas — cumplimiento parcial</option>
            <option value="no_identificadas">No identificadas formalmente</option>
          </select>
        </Field>
        <Field label="Última auditoría ambiental"><input style={s.input} type="date" value={data.ultima_auditoria_ambiental||""} onChange={e=>save("ultima_auditoria_ambiental",e.target.value)}/></Field>
        <Field label="Pasivos ambientales identificados">
          <select value={data.pasivos_ambientales||""} onChange={e=>save("pasivos_ambientales",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="no">No identificados</option>
            <option value="si_remediacion">Sí — en remediación</option>
            <option value="si_sin_control">Sí — sin control</option>
          </select>
        </Field>
        <Field label="Seguro de responsabilidad ambiental">
          <select value={data.seguro_ambiental||""} onChange={e=>save("seguro_ambiental",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="si">Sí — vigente</option>
            <option value="no">No</option>
            <option value="en_tramite">En trámite</option>
          </select>
        </Field>
      </div>
      <Field label="Observaciones ambientales">
        <textarea style={{...s.input,...s.textarea}} value={data.obs_ambiental||""} onChange={e=>save("obs_ambiental",e.target.value)} placeholder="Inspecciones activas, contingencias, sanciones en proceso..."/>
      </Field>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
    </div>
  );
}

export function ModO09({client}){
  const {data,save,saving}=useModData(client,"O-09");
  return(
    <div>
      <InfoBox>Cumplimiento regulatorio ante COFEPRIS — registros sanitarios, licencias, BPF/BPD, responsable sanitario y farmacovigilancia. Aplica a empresas del sector salud, alimentos, cosméticos y dispositivos médicos.</InfoBox>
      <SectionTitle>Registros y licencias COFEPRIS</SectionTitle>
      <div style={s.grid2}>
        <Field label="Número de registros sanitarios activos"><input style={s.input} type="number" value={data.num_registros_sanitarios||""} onChange={e=>save("num_registros_sanitarios",e.target.value)} placeholder="0"/></Field>
        <Field label="Licencia sanitaria">
          <select value={data.licencia_sanitaria||""} onChange={e=>save("licencia_sanitaria",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="vigente">Vigente</option>
            <option value="vencida">Vencida</option>
            <option value="en_tramite">En trámite</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </Field>
        <Field label="Vencimiento licencia sanitaria"><input style={s.input} type="date" value={data.vencimiento_licencia_sanitaria||""} onChange={e=>save("vencimiento_licencia_sanitaria",e.target.value)}/></Field>
        <Field label="Aviso de funcionamiento">
          <select value={data.aviso_funcionamiento||""} onChange={e=>save("aviso_funcionamiento",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="presentado">Presentado y vigente</option>
            <option value="pendiente">Pendiente</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </Field>
      </div>

      <SectionTitle>Responsable sanitario y BPF</SectionTitle>
      <div style={s.grid2}>
        <Field label="Responsable sanitario designado"><input style={s.input} value={data.responsable_sanitario||""} onChange={e=>save("responsable_sanitario",e.target.value)} placeholder="Nombre y cédula profesional"/></Field>
        <Field label="Cédula profesional del responsable"><input style={s.input} value={data.cedula_responsable||""} onChange={e=>save("cedula_responsable",e.target.value)} placeholder="Número de cédula"/></Field>
        <Field label="Certificación BPF/BPD">
          <select value={data.bpf||""} onChange={e=>save("bpf",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="certificado">Certificado — vigente</option>
            <option value="en_proceso">En proceso de certificación</option>
            <option value="no">No certificado</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </Field>
        <Field label="Próxima renovación BPF/BPD"><input style={s.input} type="date" value={data.renovacion_bpf||""} onChange={e=>save("renovacion_bpf",e.target.value)}/></Field>
      </div>

      <SectionTitle>Farmacovigilancia y tecnovigilancia</SectionTitle>
      <div style={s.grid2}>
        <Field label="Sistema de farmacovigilancia">
          <select value={data.farmacovigilancia||""} onChange={e=>save("farmacovigilancia",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="activo">Activo y reportando</option>
            <option value="implementado_sin_reportes">Implementado — sin reportes recientes</option>
            <option value="no_implementado">No implementado</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </Field>
        <Field label="Reportes COFEPRIS al corriente">
          <select value={data.reportes_cofepris||""} onChange={e=>save("reportes_cofepris",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="corriente">Al corriente</option>
            <option value="pendientes">Con reportes pendientes</option>
            <option value="no_aplica">No aplica</option>
          </select>
        </Field>
        <Field label="Alertas sanitarias activas">
          <select value={data.alertas_sanitarias||""} onChange={e=>save("alertas_sanitarias",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="sin_alertas">Sin alertas activas</option>
            <option value="con_alertas">Con alertas — en atención</option>
          </select>
        </Field>
        <Field label="Última inspección COFEPRIS"><input style={s.input} type="date" value={data.ultima_inspeccion_cofepris||""} onChange={e=>save("ultima_inspeccion_cofepris",e.target.value)}/></Field>
      </div>

      <SectionTitle>Sector específico</SectionTitle>
      <div style={s.grid2}>
        <Field label="Tipo de establecimiento">
          <select value={data.tipo_establecimiento||""} onChange={e=>save("tipo_establecimiento",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="farmacia">Farmacia</option>
            <option value="laboratorio">Laboratorio de fabricación</option>
            <option value="distribuidor">Distribuidor/importador</option>
            <option value="clinica">Clínica u hospital</option>
            <option value="alimentos">Fabricante de alimentos</option>
            <option value="cosmeticos">Fabricante de cosméticos</option>
            <option value="dispositivos">Dispositivos médicos</option>
            <option value="otro">Otro</option>
          </select>
        </Field>
        <Field label="Número de productos con registro sanitario"><input style={s.input} type="number" value={data.num_productos_registro||""} onChange={e=>save("num_productos_registro",e.target.value)} placeholder="0"/></Field>
        <Field label="Registros próximos a vencer (6 meses)"><input style={s.input} type="number" value={data.registros_por_vencer||""} onChange={e=>save("registros_por_vencer",e.target.value)} placeholder="0"/></Field>
        <Field label="Importaciones — pedimento sanitario">
          <select value={data.pedimento_sanitario||""} onChange={e=>save("pedimento_sanitario",e.target.value)} style={{...s.input,cursor:"pointer"}}>
            <option value="">Seleccionar...</option>
            <option value="correcto">Correcto y al corriente</option>
            <option value="irregular">Con irregularidades</option>
            <option value="no_aplica">No aplica — sin importaciones</option>
          </select>
        </Field>
      </div>
      <Field label="Observaciones sector salud">
        <textarea style={{...s.input,...s.textarea}} value={data.obs_salud||""} onChange={e=>save("obs_salud",e.target.value)} placeholder="Inspecciones activas, sanciones, productos en proceso de registro..."/>
      </Field>
      {saving&&<div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",textAlign:"right",marginTop:4}}>Guardando...</div>}
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
