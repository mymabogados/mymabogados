import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const GOLD = "#C9A84C";
const MUSGO = "#4A5C45";
const GRAY = "#7A9070";
const BORDER = "#DDE4D8";
const TEXT_DARK = "#1E2B1A";
const WHITE = "#FAFCF8";

const s={
  card:{background:"#FAFCF8",border:"1px solid "+BORDER,borderRadius:4,padding:"1rem 1.25rem",marginBottom:8},
  muted:{fontSize:12,color:GRAY,fontFamily:"system-ui,sans-serif"},
  label:{fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:6,display:"block"},
  input:{fontSize:12,padding:"7px 10px",border:"1px solid "+BORDER,borderRadius:3,fontFamily:"system-ui,sans-serif",background:WHITE,color:TEXT_DARK,width:"100%",boxSizing:"border-box"},
  btn:{fontSize:11,padding:"6px 14px",borderRadius:4,border:"1px solid "+BORDER,background:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif",color:TEXT_DARK},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCS CATALOG
// ─────────────────────────────────────────────────────────────────────────────
export const ESPECIALIZADO_DOCS = {

  // ── PROTECCIÓN PATRIMONIAL ────────────────────────────────────────────────
  "PP-01": {
    docs: [
      {id:"escritura_fideicomiso",label:"Escritura de fideicomiso de protección patrimonial",requerido:true,desc:"Banco fiduciario mexicano — protocolizada"},
      {id:"catalogo_activos",label:"Catálogo de activos fideicomitidos",requerido:true,desc:"Inmuebles, acciones, cuentas, derechos"},
      {id:"instruccion_fiduciaria",label:"Instrucción fiduciaria vigente",requerido:true,desc:"Instrucciones al fiduciario sobre administración"},
      {id:"testamento_coordinado",label:"Testamento coordinado con el fideicomiso",requerido:false,desc:"Para continuidad patrimonial"},
      {id:"avaluos_activos",label:"Avalúos de activos fideicomitidos",requerido:false,desc:"Vigencia máxima 2 años"},
    ],
    checklist: [
      {id:"separacion_patrimonio",label:"Patrimonio personal separado del empresarial",riesgo:"critico"},
      {id:"fideicomiso_vigente",label:"Fideicomiso con instrucciones actualizadas",riesgo:"alto"},
      {id:"activos_inventariados",label:"Todos los activos relevantes inventariados",riesgo:"alto"},
      {id:"beneficiarios_designados",label:"Beneficiarios designados y documentados",riesgo:"alto"},
      {id:"revision_anual",label:"Revisión anual de la estructura patrimonial",riesgo:"medio"},
      {id:"coordinacion_fiscal",label:"Estructura coordinada con planeación fiscal",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Patrimonio personal expuesto a deudas empresariales",impacto:"Embargo de bienes personales por obligaciones de la empresa",nivel:"critico"},
      {label:"Fideicomiso sin instrucciones actualizadas",impacto:"Fiduciario actúa según instrucciones obsoletas — pérdida de activos",nivel:"alto"},
      {label:"Sin designación de beneficiarios",impacto:"Patrimonio en litigio sucesorio — costos y tiempos judiciales",nivel:"alto"},
    ]
  },
  "PP-02": {
    docs: [
      {id:"escritura_holding",label:"Escritura constitutiva del holding",requerido:true,desc:"S.A.P.I. o S. de R.L. — según estructura óptima"},
      {id:"organigrama_corporativo",label:"Organigrama corporativo actualizado",requerido:true,desc:"Con porcentajes de participación por nivel"},
      {id:"acuerdos_accionistas_holding",label:"Acuerdo de accionistas del holding",requerido:true,desc:"Gobierno, dividendos, salida de socios"},
      {id:"contratos_intercompany",label:"Contratos intercompany documentados",requerido:true,desc:"Servicios, préstamos, licencias entre entidades"},
      {id:"estudio_precio_transferencia",label:"Estudio de precios de transferencia",requerido:false,desc:"Si hay transacciones entre partes relacionadas"},
    ],
    checklist: [
      {id:"holding_operativo",label:"Holding separado de entidades operativas",riesgo:"critico"},
      {id:"contratos_intercompany_vigentes",label:"Contratos intercompany a valor de mercado",riesgo:"critico"},
      {id:"flujo_dividendos",label:"Flujo de dividendos estructurado fiscalmente",riesgo:"alto"},
      {id:"gobierno_holding",label:"Gobierno del holding con órganos formales",riesgo:"alto"},
      {id:"precios_transferencia",label:"Precios de transferencia documentados y arm's length",riesgo:"critico"},
      {id:"salida_socios_regulada",label:"Mecanismo de salida de socios documentado",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Precios de transferencia sin documentar",impacto:"Ajuste SAT + ISR omitido + multas del 55-75% del impuesto",nivel:"critico"},
      {label:"Confusión patrimonial entre entidades del grupo",impacto:"Responsabilidad solidaria — deudas de una entidad afectan a otras",nivel:"critico"},
      {label:"Dividendos sin estructura fiscal",impacto:"ISR doble — a nivel corporativo y personal",nivel:"alto"},
    ]
  },
  "PP-03": {
    docs: [
      {id:"contratos_credito",label:"Contratos de crédito vigentes",requerido:true,desc:"Bancario, bursátil o privado — con condiciones"},
      {id:"garantias_reales",label:"Escrituras de garantías reales",requerido:true,desc:"Hipoteca, prenda, fideicomiso en garantía"},
      {id:"inscripcion_rug",label:"Inscripción en Registro Único de Garantías (RUG)",requerido:false,desc:"Prendas sin transmisión de posesión"},
      {id:"tabla_amortizacion",label:"Tabla de amortización actualizada",requerido:true,desc:"Saldo, intereses y fechas de pago"},
      {id:"covenants_monitoreo",label:"Reporte de cumplimiento de covenants",requerido:false,desc:"Obligaciones financieras del contrato de crédito"},
    ],
    checklist: [
      {id:"garantias_registradas",label:"Garantías reales registradas en RPP o RUG",riesgo:"critico"},
      {id:"covenants_cumplidos",label:"Covenants financieros cumplidos al día",riesgo:"critico"},
      {id:"vencimientos_controlados",label:"Vencimientos de créditos controlados",riesgo:"alto"},
      {id:"garantias_suficientes",label:"Valor de garantías cubre el 120% de la deuda",riesgo:"alto"},
      {id:"cross_default",label:"Cláusulas de cross-default identificadas y monitoreadas",riesgo:"critico"},
      {id:"refinanciamiento_analizado",label:"Opciones de refinanciamiento analizadas",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Incumplimiento de covenant — vencimiento anticipado",impacto:"Exigibilidad inmediata de toda la deuda — ejecución de garantías",nivel:"critico"},
      {label:"Garantía no registrada — inoponible a terceros",impacto:"Pérdida de preferencia en caso de concurso — crédito quirografario",nivel:"critico"},
      {label:"Cross-default activado por deuda menor",impacto:"Todos los créditos del grupo vencen anticipadamente",nivel:"critico"},
    ]
  },
  "PP-04": {
    docs: [
      {id:"diagnostico_financiero",label:"Diagnóstico financiero de la empresa",requerido:true,desc:"Balance, flujo de caja, proyecciones"},
      {id:"inventario_acreedores",label:"Inventario de acreedores con montos y antigüedad",requerido:true,desc:"Bancarios, comerciales, fiscales, laborales"},
      {id:"propuesta_reestructura",label:"Propuesta de reestructura de deuda",requerido:false,desc:"Plan de pagos negociado con acreedores"},
      {id:"convenio_acreedores",label:"Convenio con acreedores firmado",requerido:false,desc:"Acuerdo extrajudicial de reestructura"},
      {id:"plan_concursal",label:"Plan de reestructura concursal",requerido:false,desc:"Si se presentó solicitud de concurso mercantil"},
    ],
    checklist: [
      {id:"acreedores_identificados",label:"Todos los acreedores identificados y clasificados",riesgo:"critico"},
      {id:"deuda_fiscal_regularizada",label:"Deuda fiscal regularizada o en convenio con SAT",riesgo:"critico"},
      {id:"deuda_imss_regularizada",label:"Deuda IMSS regularizada o en convenio",riesgo:"critico"},
      {id:"plan_pagos_viable",label:"Plan de pagos viable y aprobado por acreedores clave",riesgo:"alto"},
      {id:"activos_protegidos",label:"Activos esenciales protegidos durante reestructura",riesgo:"alto"},
      {id:"asesoria_concursal",label:"Asesoría jurídica concursal especializada activa",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Concurso mercantil sin asesoría especializada",impacto:"Liquidación en lugar de reestructura — pérdida total de la empresa",nivel:"critico"},
      {label:"Deuda fiscal no regularizada antes del concurso",impacto:"SAT como acreedor preferente — desplaza a otros acreedores",nivel:"critico"},
      {label:"Activos esenciales embargados durante crisis",impacto:"Imposibilidad de operar — cierre forzado",nivel:"critico"},
    ]
  },

  // ── CUMPLIMIENTO ESPECIALIZADO ────────────────────────────────────────────
  "CE-01": {
    docs: [
      {id:"aviso_lfpiorpi",label:"Aviso de presentación LFPIORPI ante UIF",requerido:true,desc:"Si realiza actividades vulnerables del art. 17"},
      {id:"politica_pld",label:"Política de Prevención de Lavado de Dinero",requerido:true,desc:"Manual interno PLD aprobado por órgano directivo"},
      {id:"expedientes_clientes_pld",label:"Expedientes KYC de clientes",requerido:true,desc:"Know Your Customer — identificación y beneficiario final"},
      {id:"reportes_operaciones_relevantes",label:"Reportes de operaciones relevantes",requerido:false,desc:"Operaciones en efectivo mayores a $100,000 MXN"},
      {id:"reportes_inusuales",label:"Reportes de operaciones inusuales",requerido:false,desc:"Operaciones que no corresponden al perfil del cliente"},
      {id:"capacitacion_pld",label:"Constancias de capacitación PLD del personal",requerido:true,desc:"Anual — registro ante CNBV/UIF según sector"},
    ],
    checklist: [
      {id:"actividad_vulnerable_identificada",label:"Actividades vulnerables identificadas y clasificadas",riesgo:"critico"},
      {id:"aviso_presentado",label:"Aviso de presentación ante UIF en tiempo",riesgo:"critico"},
      {id:"kyc_completo",label:"KYC completo para todos los clientes relevantes",riesgo:"critico"},
      {id:"oficial_cumplimiento",label:"Oficial de cumplimiento designado",riesgo:"alto"},
      {id:"politica_aprobada",label:"Política PLD aprobada por consejo o equivalente",riesgo:"alto"},
      {id:"capacitacion_anual",label:"Capacitación anual PLD completada",riesgo:"alto"},
      {id:"reportes_al_corriente",label:"Reportes a UIF al corriente",riesgo:"critico"},
    ],
    riesgos: [
      {label:"No presentación de aviso LFPIORPI",impacto:"Multa de $500,000 a $5,000,000 MXN + clausura",nivel:"critico"},
      {label:"Sin expedientes KYC — complicidad en lavado",impacto:"Responsabilidad penal del directivo — prisión de 5-15 años",nivel:"critico"},
      {label:"Reportes omitidos a la UIF",impacto:"Multa + inhabilitación del oficial de cumplimiento",nivel:"critico"},
    ]
  },
  "CE-02": {
    docs: [
      {id:"contrato_adhesion_registrado",label:"Contrato de adhesión registrado ante PROFECO",requerido:false,desc:"Obligatorio si aplica — registro en RECA"},
      {id:"aviso_privacidad_consumidor",label:"Aviso de privacidad para consumidores",requerido:true,desc:"LFPDPPP — en punto de venta y digital"},
      {id:"garantia_productos",label:"Política de garantía de productos",requerido:true,desc:"LFPC — mínimo un año para bienes nuevos"},
      {id:"terminos_condiciones",label:"Términos y condiciones del servicio",requerido:true,desc:"En lenguaje claro — sin cláusulas abusivas"},
      {id:"registro_condusef",label:"Registro ante CONDUSEF",requerido:false,desc:"Solo si es entidad financiera o SOFOM"},
    ],
    checklist: [
      {id:"contratos_sin_clausulas_abusivas",label:"Contratos sin cláusulas abusivas PROFECO",riesgo:"alto"},
      {id:"garantia_legal_cumplida",label:"Garantía legal mínima de 1 año cumplida",riesgo:"alto"},
      {id:"precios_publicados",label:"Precios publicados en moneda nacional",riesgo:"medio"},
      {id:"politica_devolucion",label:"Política de devolución clara y accesible",riesgo:"medio"},
      {id:"publicidad_sin_engano",label:"Publicidad sin engaño ni prácticas comerciales desleales",riesgo:"alto"},
      {id:"atencion_quejas",label:"Mecanismo de atención de quejas y reclamaciones",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Cláusulas abusivas en contrato de adhesión",impacto:"Nulidad de cláusulas + multa PROFECO + daño reputacional",nivel:"alto"},
      {label:"Publicidad engañosa",impacto:"Multa hasta $5,000,000 MXN + clausura temporal",nivel:"alto"},
      {label:"Sin registro de contrato de adhesión obligatorio",impacto:"Multa + nulidad del contrato en perjuicio de la empresa",nivel:"alto"},
    ]
  },
  "CE-03": {
    docs: [
      {id:"mia_aprobada",label:"Manifestación de Impacto Ambiental aprobada",requerido:false,desc:"Proyectos con impacto en ecosistemas"},
      {id:"licencia_ambiental",label:"Licencia ambiental estatal",requerido:false,desc:"Según actividad y estado"},
      {id:"coa_presentada",label:"Cédula de Operación Anual (COA)",requerido:false,desc:"Si emite contaminantes a la atmósfera"},
      {id:"plan_manejo_residuos",label:"Plan de manejo de residuos peligrosos",requerido:false,desc:"Registro ante SEMARNAT si aplica"},
      {id:"poliza_responsabilidad_ambiental",label:"Póliza de responsabilidad ambiental",requerido:false,desc:"Empresas con actividades de alto riesgo"},
      {id:"auditoria_ambiental",label:"Auditoría ambiental PROFEPA",requerido:false,desc:"Voluntary o derivada de inspección"},
    ],
    checklist: [
      {id:"permisos_ambientales_vigentes",label:"Permisos ambientales vigentes y actualizados",riesgo:"critico"},
      {id:"residuos_peligrosos_controlados",label:"Residuos peligrosos controlados y documentados",riesgo:"critico"},
      {id:"coa_presentada_check",label:"COA presentada en tiempo si aplica",riesgo:"alto"},
      {id:"sin_pasivos_ambientales",label:"Sin pasivos ambientales identificados",riesgo:"critico"},
      {id:"capacitacion_ambiental",label:"Personal capacitado en manejo ambiental",riesgo:"medio"},
      {id:"plan_contingencia_ambiental",label:"Plan de contingencia ambiental documentado",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Operación sin permisos ambientales",impacto:"Clausura inmediata por PROFEPA — daños de difícil reparación",nivel:"critico"},
      {label:"Pasivo ambiental no declarado",impacto:"Responsabilidad civil ilimitada + penal — remediación a costo de la empresa",nivel:"critico"},
      {label:"Residuos peligrosos sin plan de manejo",impacto:"Multa SEMARNAT + responsabilidad penal ambiental",nivel:"critico"},
    ]
  },
  "CE-04": {
    docs: [
      {id:"programa_seguridad_higiene",label:"Programa de Seguridad e Higiene",requerido:true,desc:"STPS — obligatorio para todos los centros de trabajo"},
      {id:"comision_seguridad",label:"Acta de integración de Comisión de Seguridad e Higiene",requerido:true,desc:"Registro ante STPS"},
      {id:"nom_verificadas",label:"Verificación de NOMs aplicables",requerido:true,desc:"NOM-001, 002, 004, 005, 006 según actividad"},
      {id:"plan_emergencias",label:"Plan de emergencias y evacuación",requerido:true,desc:"Con simulacros documentados"},
      {id:"registros_accidentes",label:"Registro de accidentes e incidentes",requerido:true,desc:"IMSS ST-7 en caso de accidente"},
      {id:"capacitacion_seguridad",label:"Constancias de capacitación en seguridad",requerido:true,desc:"Anual por trabajador"},
    ],
    checklist: [
      {id:"comision_registrada",label:"Comisión de Seguridad e Higiene registrada ante STPS",riesgo:"alto"},
      {id:"noms_cumplidas",label:"NOMs aplicables identificadas y cumplidas",riesgo:"critico"},
      {id:"simulacros_realizados",label:"Simulacros realizados y documentados",riesgo:"alto"},
      {id:"epp_proporcionado",label:"EPP proporcionado y documentado a trabajadores",riesgo:"alto"},
      {id:"accidentes_reportados",label:"Accidentes reportados al IMSS en tiempo",riesgo:"critico"},
      {id:"instalaciones_seguras",label:"Instalaciones eléctricas e hidráulicas en norma",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Accidente mortal sin programa de seguridad",impacto:"Responsabilidad penal del patrón + multa STPS + indemnización",nivel:"critico"},
      {label:"NOMs incumplidas — inspección STPS",impacto:"Multa de $318 a $318,000 MXN por violación + clausura",nivel:"alto"},
      {label:"Accidente no reportado al IMSS",impacto:"Pérdida de cobertura IMSS del trabajador + responsabilidad civil",nivel:"critico"},
    ]
  },

  // ── SECTOR INMOBILIARIO ───────────────────────────────────────────────────
  "INM-01": {
    docs: [
      {id:"titulo_propiedad",label:"Título de propiedad o escritura",requerido:true,desc:"Inscrita en RPP — libre de gravámenes"},
      {id:"certificado_libertad_gravamen",label:"Certificado de libertad o existencia de gravámenes",requerido:true,desc:"Vigencia máxima 30 días para la operación"},
      {id:"boleta_predial",label:"Boleta predial al corriente",requerido:true,desc:"Sin adeudos de ejercicios anteriores"},
      {id:"constancia_uso_suelo",label:"Constancia de uso de suelo compatible",requerido:true,desc:"Municipio o alcaldía — vigente"},
      {id:"planos_inmueble",label:"Planos del inmueble",requerido:true,desc:"Arquitectónicos y de ubicación"},
      {id:"avaluo_comercial",label:"Avalúo comercial",requerido:true,desc:"Vigencia máxima 6 meses — valuador certificado"},
      {id:"dictamen_estructural",label:"Dictamen estructural",requerido:false,desc:"Para inmuebles con más de 15 años"},
    ],
    checklist: [
      {id:"titulo_inscrito",label:"Título inscrito en RPP sin gravámenes ocultos",riesgo:"critico"},
      {id:"uso_suelo_verificado",label:"Uso de suelo verificado y compatible con la operación",riesgo:"critico"},
      {id:"predial_al_corriente",label:"Predial al corriente — sin adeudos",riesgo:"alto"},
      {id:"medidas_superficies",label:"Medidas y superficies verificadas en campo",riesgo:"alto"},
      {id:"servidumbres_identificadas",label:"Servidumbres y restricciones identificadas",riesgo:"alto"},
      {id:"vendedor_legitimado",label:"Vendedor con facultades para transmitir",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Gravamen oculto descubierto post-compra",impacto:"Inmueble embargable — pérdida de la inversión",nivel:"critico"},
      {label:"Uso de suelo incompatible con el negocio",impacto:"Imposibilidad de operar — clausura municipal",nivel:"critico"},
      {label:"Vendedor sin facultades — nulidad de la compraventa",impacto:"Litigio de nulidad — recuperación imposible sin garantías",nivel:"critico"},
    ]
  },
  "INM-02": {
    docs: [
      {id:"licencia_construccion",label:"Licencia de construcción vigente",requerido:true,desc:"Municipal — antes de iniciar obra"},
      {id:"contrato_obra",label:"Contrato de obra (por precio alzado o administración)",requerido:true,desc:"Con constructor o desarrollador"},
      {id:"fianza_cumplimiento",label:"Fianza de cumplimiento del constructor",requerido:true,desc:"Mínimo 10% del valor del contrato"},
      {id:"supervision_obra",label:"Contrato de supervisión de obra",requerido:false,desc:"Supervisor independiente — protege al dueño"},
      {id:"permiso_ambiental_obra",label:"Permisos ambientales de construcción",requerido:false,desc:"MIA si impacta ecosistemas"},
      {id:"acta_entrega_recepcion",label:"Acta de entrega-recepción de obra",requerido:true,desc:"Con lista de pendientes (punch list)"},
    ],
    checklist: [
      {id:"licencia_vigente",label:"Licencia de construcción vigente antes de iniciar",riesgo:"critico"},
      {id:"constructor_garantizado",label:"Constructor con fianza de cumplimiento",riesgo:"alto"},
      {id:"contrato_precio_fijo",label:"Precio y alcance claramente definidos en contrato",riesgo:"alto"},
      {id:"supervision_independiente",label:"Supervisión independiente del constructor",riesgo:"alto"},
      {id:"pagos_contra_avance",label:"Pagos contra avance documentado",riesgo:"alto"},
      {id:"permisos_completos",label:"Todos los permisos obtenidos antes de ocupar",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Construcción sin licencia — demolición ordenada",impacto:"Demolición a costo del propietario + multa municipal",nivel:"critico"},
      {label:"Constructor abandona obra sin fianza",impacto:"Pérdida de anticipos — obra paralizada — litigio",nivel:"critico"},
      {label:"Sobrecosto por alcance mal definido",impacto:"30-50% de sobrecosto promedio en obras sin contrato claro",nivel:"alto"},
    ]
  },
  "INM-03": {
    docs: [
      {id:"contrato_arrendamiento",label:"Contrato de arrendamiento vigente",requerido:true,desc:"Comercial o industrial — con todas las condiciones"},
      {id:"deposito_garantia",label:"Recibo de depósito en garantía",requerido:true,desc:"Meses de depósito y condiciones de devolución"},
      {id:"inventario_inmueble",label:"Inventario del inmueble al inicio",requerido:true,desc:"Estado del inmueble y equipamiento"},
      {id:"acta_entrega_arrendamiento",label:"Acta de entrega del inmueble",requerido:true,desc:"Firmada por arrendador y arrendatario"},
      {id:"poliza_arrendamiento",label:"Póliza jurídica de arrendamiento",requerido:false,desc:"Seguro que cubre impago y desocupación"},
      {id:"aval_arrendamiento",label:"Obligado solidario o aval del arrendatario",requerido:false,desc:"Persona física o moral con solvencia"},
    ],
    checklist: [
      {id:"contrato_firmado_notariado",label:"Contrato firmado — ratificado ante notario si valor alto",riesgo:"alto"},
      {id:"deposito_documentado",label:"Depósito en garantía documentado y en cuenta separada",riesgo:"medio"},
      {id:"uso_permitido_definido",label:"Uso permitido del inmueble claramente definido",riesgo:"alto"},
      {id:"incrementos_renta_pactados",label:"Incrementos de renta pactados contractualmente",riesgo:"medio"},
      {id:"obligaciones_mantenimiento",label:"Obligaciones de mantenimiento distribuidas claramente",riesgo:"medio"},
      {id:"terminacion_anticipada",label:"Causas de terminación anticipada definidas",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Arrendatario insolvente sin aval",impacto:"Proceso de desahucio 6-18 meses — rentas impagas acumuladas",nivel:"alto"},
      {label:"Uso del inmueble diferente al contratado",impacto:"Daños al inmueble — responsabilidad ante autoridades",nivel:"alto"},
      {label:"Sin cláusula de incremento — renta congelada",impacto:"Pérdida de valor real de la renta vs. inflación",nivel:"medio"},
    ]
  },
  "INM-04": {
    docs: [
      {id:"contrato_fideicomiso_inmobiliario",label:"Contrato de fideicomiso inmobiliario",requerido:true,desc:"CKD, FIBRA o fideicomiso privado"},
      {id:"prospectos_ckd",label:"Prospecto de colocación CKD",requerido:false,desc:"Si cotiza en BMV"},
      {id:"reglas_operacion_fibra",label:"Reglas de operación de la FIBRA",requerido:false,desc:"Si es FIBRA pública o privada"},
      {id:"reportes_distribucion",label:"Reportes de distribución a fideicomisarios",requerido:true,desc:"Periodicidad según contrato"},
      {id:"valuaciones_portafolio",label:"Valuaciones del portafolio inmobiliario",requerido:true,desc:"Al menos anuales — valuador certificado"},
    ],
    checklist: [
      {id:"fideicomiso_constituido_correctamente",label:"Fideicomiso constituido con banco fiduciario regulado",riesgo:"critico"},
      {id:"inmuebles_aportados_libre_gravamen",label:"Inmuebles aportados libres de gravámenes",riesgo:"critico"},
      {id:"distribucion_al_corriente",label:"Distribuciones a fideicomisarios al corriente",riesgo:"alto"},
      {id:"reportes_cnbv",label:"Reportes a CNBV al corriente si aplica",riesgo:"critico"},
      {id:"valuaciones_vigentes",label:"Valuaciones vigentes del portafolio",riesgo:"alto"},
    ],
    riesgos: [
      {label:"FIBRA sin reportes a CNBV",impacto:"Multa CNBV + suspensión de la estructura — responsabilidad de gestores",nivel:"critico"},
      {label:"Inmueble con gravamen aportado al fideicomiso",impacto:"Acreedor ejecuta garantía — fideicomisarios pierden el activo",nivel:"critico"},
      {label:"Distribuciones incumplidas — fideicomisarios demandan",impacto:"Litigio contra el gestor — remoción del administrador",nivel:"alto"},
    ]
  },
  "INM-05": {
    docs: [
      {id:"titulo_irregular",label:"Documentos de tenencia irregular",requerido:false,desc:"Posesión, cesión de derechos, título supletorio"},
      {id:"expediente_regularizacion",label:"Expediente de regularización ante SEDATU/registro",requerido:false,desc:"En trámite de regularización"},
      {id:"demanda_reivindicacion",label:"Demanda de acción reivindicatoria",requerido:false,desc:"Para recuperar posesión de tercero"},
      {id:"convenio_colindantes",label:"Convenio con colindantes sobre linderos",requerido:false,desc:"Para evitar conflictos de medianería"},
      {id:"resolucion_judicial_inmueble",label:"Resolución judicial sobre el inmueble",requerido:false,desc:"Sentencia, laudo o resolución administrativa"},
    ],
    checklist: [
      {id:"titularidad_clara",label:"Titularidad del inmueble clara y sin disputa",riesgo:"critico"},
      {id:"linderos_definidos",label:"Linderos definidos y sin conflicto con colindantes",riesgo:"alto"},
      {id:"posesion_pacifica",label:"Posesión pacífica y continua documentada",riesgo:"alto"},
      {id:"sin_litigios_activos",label:"Sin litigios activos sobre el inmueble",riesgo:"critico"},
      {id:"regularizacion_en_proceso",label:"Proceso de regularización activo si aplica",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Tercero con mejor derecho sobre el inmueble",impacto:"Pérdida de la propiedad por acción reivindicatoria",nivel:"critico"},
      {label:"Conflicto de linderos con colindante",impacto:"Litigio de deslinde — costos y tiempo — posible pérdida de superficie",nivel:"alto"},
      {label:"Inmueble en zona federal o ejidal no regularizada",impacto:"Nulidad de cualquier transmisión — imposibilidad de garantizar",nivel:"critico"},
    ]
  },

  // ── SALUD Y CIENCIAS DE LA VIDA ───────────────────────────────────────────
  "SC-01": {
    docs: [
      {id:"registros_sanitarios",label:"Registros sanitarios COFEPRIS vigentes",requerido:true,desc:"Por producto — vigencia 5 años renovable"},
      {id:"licencia_sanitaria",label:"Licencia sanitaria del establecimiento",requerido:true,desc:"COFEPRIS o Secretaría de Salud estatal"},
      {id:"aviso_funcionamiento",label:"Aviso de funcionamiento",requerido:true,desc:"Previo al inicio de operaciones"},
      {id:"responsable_sanitario",label:"Contrato con responsable sanitario",requerido:true,desc:"Profesional de la salud registrado ante COFEPRIS"},
      {id:"buenas_practicas",label:"Certificado de Buenas Prácticas de Fabricación/Distribución",requerido:false,desc:"BPF/BPD — obligatorio para exportación"},
    ],
    checklist: [
      {id:"registros_vigentes",label:"Todos los registros sanitarios vigentes",riesgo:"critico"},
      {id:"responsable_activo",label:"Responsable sanitario activo y con cédula vigente",riesgo:"critico"},
      {id:"licencia_vigente_cofepris",label:"Licencia sanitaria del establecimiento vigente",riesgo:"critico"},
      {id:"renovaciones_programadas",label:"Renovaciones programadas con 6 meses de anticipación",riesgo:"alto"},
      {id:"bpf_cumplidas",label:"BPF/BPD cumplidas y auditadas",riesgo:"alto"},
      {id:"farmacovigilancia",label:"Sistema de farmacovigilancia activo si aplica",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Operación sin registro sanitario",impacto:"Clausura inmediata + multa hasta $20,000,000 MXN + responsabilidad penal",nivel:"critico"},
      {label:"Sin responsable sanitario",impacto:"Clausura del establecimiento — sin excepción",nivel:"critico"},
      {label:"Registro sanitario vencido",impacto:"Retiro de producto del mercado + multa COFEPRIS",nivel:"critico"},
    ]
  },
  "SC-02": {
    docs: [
      {id:"registro_dispositivo_medico",label:"Registro sanitario de dispositivo médico",requerido:true,desc:"Clase I, II o III — según riesgo"},
      {id:"certificado_ce_fda",label:"Certificación CE o FDA",requerido:false,desc:"Para importación o exportación"},
      {id:"contrato_distribucion_dm",label:"Contrato de distribución de dispositivos médicos",requerido:false,desc:"Con distribuidor autorizado COFEPRIS"},
      {id:"tecnovigilancia",label:"Sistema de tecnovigilancia",requerido:true,desc:"Reporte de incidentes adversos a COFEPRIS"},
      {id:"manual_instrucciones",label:"Manual de instrucciones en español",requerido:true,desc:"Obligatorio para todos los dispositivos"},
    ],
    checklist: [
      {id:"registro_cofepris_dm",label:"Registro COFEPRIS del dispositivo vigente",riesgo:"critico"},
      {id:"clase_correcta",label:"Clasificación del dispositivo correcta",riesgo:"critico"},
      {id:"tecnovigilancia_activa",label:"Sistema de tecnovigilancia activo",riesgo:"alto"},
      {id:"distribuidor_autorizado",label:"Distribución solo a través de establecimiento autorizado",riesgo:"critico"},
      {id:"trazabilidad_lotes",label:"Trazabilidad de lotes documentada",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Dispositivo sin registro — decomiso masivo",impacto:"Retiro de mercado + multa + responsabilidad penal si hay daño a paciente",nivel:"critico"},
      {label:"Incidente adverso no reportado",impacto:"Responsabilidad civil y penal — cancelación del registro",nivel:"critico"},
      {label:"Clasificación incorrecta — registro insuficiente",impacto:"Producto operando fuera de norma — invalidez del registro",nivel:"critico"},
    ]
  },
  "SC-03": {
    docs: [
      {id:"licencia_clinica",label:"Licencia de funcionamiento de clínica/hospital",requerido:true,desc:"Secretaría de Salud estatal — por servicio"},
      {id:"contratos_medicos",label:"Contratos con médicos adscritos",requerido:true,desc:"Honorarios o relación laboral — bien definida"},
      {id:"poliza_responsabilidad_medica",label:"Póliza de responsabilidad civil médica",requerido:true,desc:"Por establecimiento y por médico"},
      {id:"consentimiento_informado",label:"Formatos de consentimiento informado",requerido:true,desc:"Por procedimiento — firmados por paciente"},
      {id:"expediente_clinico_norma",label:"Sistema de expediente clínico conforme a NOM-004",requerido:true,desc:"Físico o electrónico — confidencialidad"},
      {id:"reglamento_interno_clinica",label:"Reglamento interno del establecimiento",requerido:true,desc:"Derechos y obligaciones de pacientes y personal"},
    ],
    checklist: [
      {id:"licencia_todos_servicios",label:"Licencia cubre todos los servicios ofrecidos",riesgo:"critico"},
      {id:"medicos_cedulados",label:"Todos los médicos con cédula profesional vigente",riesgo:"critico"},
      {id:"consentimiento_firmado",label:"Consentimiento informado firmado para cada procedimiento",riesgo:"critico"},
      {id:"expediente_nom004",label:"Expediente clínico conforme a NOM-004",riesgo:"alto"},
      {id:"poliza_rc_vigente",label:"Póliza de responsabilidad civil médica vigente",riesgo:"critico"},
      {id:"privacidad_pacientes",label:"Aviso de privacidad para pacientes",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Médico sin cédula o especialidad no reconocida",impacto:"Responsabilidad penal + clausura + demanda civil",nivel:"critico"},
      {label:"Sin consentimiento informado",impacto:"Responsabilidad civil plena en caso de complicación",nivel:"critico"},
      {label:"Sin póliza de RC médica",impacto:"Indemnizaciones cubiertas por el establecimiento — quiebra operativa",nivel:"critico"},
    ]
  },
  "SC-04": {
    docs: [
      {id:"acuerdo_interoperabilidad",label:"Acuerdo de interoperabilidad con HIMSS/NOM",requerido:false,desc:"Sistemas de salud digital interoperables"},
      {id:"aviso_privacidad_salud",label:"Aviso de privacidad para datos de salud",requerido:true,desc:"Datos sensibles — protección reforzada LFPDPPP"},
      {id:"nom024_cumplimiento",label:"Cumplimiento NOM-024-SSA3 — expediente electrónico",requerido:false,desc:"Si maneja expediente clínico electrónico"},
      {id:"contrato_plataforma_telemedicina",label:"Contrato con plataforma de telemedicina",requerido:false,desc:"Si usa tercero para consultas virtuales"},
      {id:"validacion_cofepris_app",label:"Validación COFEPRIS de aplicación de salud",requerido:false,desc:"Apps con funciones diagnósticas o terapéuticas"},
    ],
    checklist: [
      {id:"datos_salud_protegidos",label:"Datos de salud con protección reforzada LFPDPPP",riesgo:"critico"},
      {id:"plataforma_segura",label:"Plataforma con cifrado y medidas de seguridad",riesgo:"critico"},
      {id:"medico_responsable_teleconsulta",label:"Médico responsable identificado en teleconsulta",riesgo:"critico"},
      {id:"prescripcion_regulada",label:"Prescripción electrónica conforme a regulación",riesgo:"alto"},
      {id:"continuidad_atencion",label:"Protocolos de continuidad de atención documentados",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Brecha de datos de salud",impacto:"Multa INAI hasta $325,000,000 MXN + daño reputacional irreversible",nivel:"critico"},
      {label:"Teleconsulta sin médico responsable identificado",impacto:"Ejercicio ilegal de la medicina — responsabilidad penal",nivel:"critico"},
      {label:"App diagnóstica sin validación COFEPRIS",impacto:"Retiro de la app + multa + responsabilidad por diagnóstico erróneo",nivel:"critico"},
    ]
  },

  // ── ENERGÍA Y MEDIO AMBIENTE ──────────────────────────────────────────────
  "EN-01": {
    docs: [
      {id:"contrato_suministro_cfe",label:"Contrato de suministro eléctrico CFE",requerido:true,desc:"Tarifa, demanda contratada, condiciones"},
      {id:"contrato_gas_natural",label:"Contrato de suministro de gas natural",requerido:false,desc:"Con distribuidora autorizada CRE"},
      {id:"permiso_autoabasto",label:"Permiso de autoabastecimiento CRE",requerido:false,desc:"Si genera su propia energía"},
      {id:"contrato_energia_cre",label:"Contrato de compraventa de energía",requerido:false,desc:"Con generador privado — mercado eléctrico"},
      {id:"medicion_consumo",label:"Registros de medición y consumo energético",requerido:true,desc:"Para gestión de costos y cumplimiento"},
    ],
    checklist: [
      {id:"contrato_cfe_vigente",label:"Contrato CFE vigente y en la tarifa correcta",riesgo:"alto"},
      {id:"demanda_contratada_adecuada",label:"Demanda contratada adecuada — sin penalizaciones",riesgo:"medio"},
      {id:"permisos_cre_vigentes",label:"Permisos CRE vigentes si aplica",riesgo:"critico"},
      {id:"medicion_correcta",label:"Equipo de medición calibrado y en norma",riesgo:"medio"},
      {id:"continuidad_suministro",label:"Plan de continuidad ante falla de suministro",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Permiso CRE vencido — operación ilegal de generación",impacto:"Clausura de instalaciones de generación + multa CRE",nivel:"critico"},
      {label:"Tarifa incorrecta — sobrecargas retroactivas",impacto:"Cargo retroactivo de hasta 5 años por tarifa incorrecta",nivel:"alto"},
      {label:"Sin plan de continuidad — falla operativa",impacto:"Paros de producción + pérdidas por merma o daño a equipo",nivel:"alto"},
    ]
  },
  "EN-02": {
    docs: [
      {id:"permiso_generacion_renovable",label:"Permiso de generación CRE",requerido:true,desc:"Solar, eólico, hidráulico — según tecnología"},
      {id:"contrato_interconexion",label:"Contrato de interconexión con CFE",requerido:true,desc:"Para inyección de excedentes a la red"},
      {id:"contrato_compraventa_energia",label:"Contrato de compraventa de energía (PPA)",requerido:false,desc:"Power Purchase Agreement con offtaker"},
      {id:"dictamen_tecnico_instalacion",label:"Dictamen técnico de la instalación",requerido:true,desc:"Por perito certificado CRE/CFE"},
      {id:"eia_renovable",label:"Evaluación de Impacto Ambiental aprobada",requerido:false,desc:"Para proyectos mayores a 0.5 MW"},
    ],
    checklist: [
      {id:"permiso_cre_renovable",label:"Permiso CRE vigente para la tecnología instalada",riesgo:"critico"},
      {id:"contrato_interconexion_firmado",label:"Contrato de interconexión firmado con CFE",riesgo:"critico"},
      {id:"ppa_estructurado",label:"PPA con precio y plazo claros",riesgo:"alto"},
      {id:"impacto_ambiental_aprobado",label:"Impacto ambiental aprobado si aplica",riesgo:"critico"},
      {id:"mantenimiento_instalacion",label:"Contrato de mantenimiento de la instalación vigente",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Generación sin permiso CRE",impacto:"Desconexión de la red + multa + decomiso de instalación",nivel:"critico"},
      {label:"PPA mal estructurado — precio fijo vs. mercado",impacto:"Pérdidas millonarias si precio de mercado cae",nivel:"alto"},
      {label:"Sin EIA — proyecto paralizado",impacto:"Clausura de obra + costos de remediación",nivel:"critico"},
    ]
  },
  "EN-03": {
    docs: [
      {id:"mia_completa",label:"Manifestación de Impacto Ambiental aprobada",requerido:true,desc:"SEMARNAT — según tipo de proyecto"},
      {id:"esia",label:"Evaluación de Impacto Social aprobada",requerido:false,desc:"Proyectos en zonas con comunidades indígenas"},
      {id:"resolutivo_ambiental",label:"Resolutivo ambiental favorable",requerido:true,desc:"Condicionantes de la MIA aprobadas"},
      {id:"plan_vigilancia_ambiental",label:"Plan de vigilancia ambiental",requerido:true,desc:"Monitoreo de impactos durante operación"},
      {id:"informes_semarnat",label:"Informes periódicos a SEMARNAT",requerido:false,desc:"Según condicionantes del resolutivo"},
    ],
    checklist: [
      {id:"mia_aprobada_check",label:"MIA aprobada antes de iniciar obras",riesgo:"critico"},
      {id:"condicionantes_cumplidas",label:"Condicionantes del resolutivo cumplidas",riesgo:"critico"},
      {id:"plan_vigilancia_activo",label:"Plan de vigilancia ambiental activo",riesgo:"alto"},
      {id:"informes_al_corriente",label:"Informes a SEMARNAT al corriente",riesgo:"alto"},
      {id:"consulta_indigena",label:"Consulta indígena realizada si aplica",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Proyecto sin MIA aprobada",impacto:"Clausura + demolición a costo del titular + multa SEMARNAT",nivel:"critico"},
      {label:"Condicionantes incumplidas",impacto:"Revocación del resolutivo — paralización total del proyecto",nivel:"critico"},
      {label:"Sin consulta indígena — impugnación",impacto:"Amparo comunidad — suspensión del proyecto indefinida",nivel:"critico"},
    ]
  },
  "EN-04": {
    docs: [
      {id:"estudio_pasivo_ambiental",label:"Estudio de pasivos ambientales",requerido:false,desc:"Para adquisición de terrenos industriales"},
      {id:"plan_remediacion",label:"Plan de remediación aprobado por SEMARNAT",requerido:false,desc:"Si hay contaminación identificada"},
      {id:"seguro_responsabilidad_ambiental",label:"Póliza de responsabilidad ambiental",requerido:false,desc:"Obligatoria para industrias de alto riesgo"},
      {id:"bitacora_derrames",label:"Bitácora de derrames e incidentes ambientales",requerido:true,desc:"Registro y reporte a autoridades"},
      {id:"convenio_restauracion",label:"Convenio de restauración con PROFEPA",requerido:false,desc:"Si hay proceso de inspección activo"},
    ],
    checklist: [
      {id:"pasivos_identificados",label:"Pasivos ambientales identificados antes de adquisición",riesgo:"critico"},
      {id:"remediacion_en_proceso",label:"Plan de remediación activo si hay contaminación",riesgo:"critico"},
      {id:"derrames_reportados",label:"Derrames reportados a SEMARNAT/PROFEPA en tiempo",riesgo:"critico"},
      {id:"seguro_ambiental_vigente",label:"Seguro de responsabilidad ambiental vigente",riesgo:"alto"},
      {id:"auditorias_proactivas",label:"Auditorías ambientales proactivas realizadas",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Pasivo ambiental adquirido sin due diligence",impacto:"Remediación a costo del comprador — millones de dólares",nivel:"critico"},
      {label:"Derrame no reportado — responsabilidad penal",impacto:"Prisión de 1-9 años + multa + remediación obligatoria",nivel:"critico"},
      {label:"Sin seguro ambiental — empresa sin respaldo",impacto:"Responsabilidad ilimitada — quiebra operativa por costos de remediación",nivel:"critico"},
    ]
  },

  // ── TECNOLOGÍA Y TRANSFORMACIÓN DIGITAL ──────────────────────────────────
  "TD-01": {
    docs: [
      {id:"contrato_desarrollo_sw",label:"Contrato de desarrollo de software",requerido:true,desc:"Con alcance, plazos, entregables y propiedad intelectual"},
      {id:"acuerdo_confidencialidad_sw",label:"NDA con desarrollador",requerido:true,desc:"Protección de información y código fuente"},
      {id:"escrow_codigo_fuente",label:"Acuerdo de escrow del código fuente",requerido:false,desc:"Deposito del código con tercero neutral"},
      {id:"licencias_terceros",label:"Inventario de licencias de software de terceros",requerido:true,desc:"Open source, SaaS, librerías — cumplimiento de licencias"},
      {id:"acta_entrega_sw",label:"Acta de entrega y aceptación del software",requerido:true,desc:"Con lista de funcionalidades entregadas"},
    ],
    checklist: [
      {id:"pi_empresa_sw",label:"Propiedad intelectual del software a nombre de la empresa",riesgo:"critico"},
      {id:"codigo_escrow",label:"Código fuente en escrow o en poder de la empresa",riesgo:"alto"},
      {id:"licencias_open_source",label:"Licencias open source analizadas — sin GPL contaminante",riesgo:"alto"},
      {id:"documentacion_tecnica",label:"Documentación técnica del sistema entregada",riesgo:"medio"},
      {id:"sla_soporte",label:"SLA de soporte y mantenimiento definido",riesgo:"alto"},
      {id:"penalidades_incumplimiento",label:"Penalidades por retraso o incumplimiento definidas",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Código fuente en poder del desarrollador — rehén",impacto:"Empresa no puede operar ni contratar otro proveedor",nivel:"critico"},
      {label:"Licencia GPL contamina software propietario",impacto:"Obligación de liberar código fuente — pérdida de ventaja competitiva",nivel:"alto"},
      {label:"Sin SLA — caídas sin penalidad ni compromiso",impacto:"Sistema crítico sin operación — pérdidas sin recurso legal",nivel:"alto"},
    ]
  },
  "TD-02": {
    docs: [
      {id:"politica_ia",label:"Política de uso responsable de IA",requerido:true,desc:"Criterios de uso, limitaciones y supervisión humana"},
      {id:"contrato_proveedor_ia",label:"Contrato con proveedor de IA",requerido:true,desc:"Términos de servicio, propiedad de datos y modelos"},
      {id:"evaluacion_sesgo",label:"Evaluación de sesgo y discriminación algorítmica",requerido:false,desc:"Para IA en decisiones sobre personas"},
      {id:"aviso_privacidad_ia",label:"Aviso de privacidad con uso de IA",requerido:true,desc:"Informar a usuarios sobre decisiones automatizadas"},
      {id:"registro_modelo_ia",label:"Registro del modelo de IA y versiones",requerido:false,desc:"Trazabilidad de decisiones automatizadas"},
    ],
    checklist: [
      {id:"supervision_humana",label:"Supervisión humana en decisiones de alto impacto",riesgo:"alto"},
      {id:"datos_entrenamiento_propios",label:"Derechos sobre datos de entrenamiento claros",riesgo:"critico"},
      {id:"sesgo_evaluado",label:"Sesgo algorítmico evaluado en sistemas de IA",riesgo:"alto"},
      {id:"explicabilidad",label:"Decisiones automatizadas explicables al afectado",riesgo:"alto"},
      {id:"privacidad_ia",label:"IA no procesa datos personales sin base legal",riesgo:"critico"},
    ],
    riesgos: [
      {label:"IA toma decisiones discriminatorias — responsabilidad",impacto:"Demanda colectiva + multa INAI + daño reputacional",nivel:"critico"},
      {label:"Datos de entrenamiento con PI de terceros",impacto:"Demanda por infracción de derechos de autor",nivel:"alto"},
      {label:"Sin explicabilidad — decisión impugnable",impacto:"Nulidad de decisión automatizada en cualquier instancia",nivel:"alto"},
    ]
  },
  "TD-03": {
    docs: [
      {id:"politica_ciberseguridad",label:"Política de ciberseguridad corporativa",requerido:true,desc:"Aprobada por directivos — revisión anual"},
      {id:"plan_respuesta_incidentes",label:"Plan de respuesta a incidentes",requerido:true,desc:"Con roles, plazos y procedimientos"},
      {id:"contrato_servicios_seguridad",label:"Contrato con proveedor de seguridad",requerido:false,desc:"SOC, pen testing, monitoreo"},
      {id:"evaluacion_riesgos_cyber",label:"Evaluación de riesgos de ciberseguridad",requerido:true,desc:"Al menos anual — por tercero independiente"},
      {id:"seguros_cyber",label:"Póliza de seguro cibernético",requerido:false,desc:"Cubre ransomware, brecha de datos, interrupción"},
    ],
    checklist: [
      {id:"politica_aprobada_cyber",label:"Política de ciberseguridad aprobada y comunicada",riesgo:"alto"},
      {id:"backups_verificados",label:"Backups verificados y con pruebas de restauración",riesgo:"critico"},
      {id:"mfa_implementado",label:"Autenticación multifactor en sistemas críticos",riesgo:"critico"},
      {id:"pen_test_anual",label:"Pen test anual realizado por tercero",riesgo:"alto"},
      {id:"incidentes_reportados",label:"Incidentes reportados al INAI si hay brecha de datos",riesgo:"critico"},
      {id:"seguro_cyber_vigente",label:"Seguro cibernético vigente",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Ransomware sin backups — operación paralizada",impacto:"Pago de rescate o pérdida total de datos — cierre operativo",nivel:"critico"},
      {label:"Brecha de datos no reportada al INAI",impacto:"Multa hasta $325,000,000 MXN + responsabilidad civil",nivel:"critico"},
      {label:"Sin MFA — acceso no autorizado a sistemas críticos",impacto:"Robo de información + fraude + responsabilidad civil",nivel:"critico"},
    ]
  },
  "TD-04": {
    docs: [
      {id:"registro_cnbv",label:"Registro o autorización ante CNBV",requerido:false,desc:"SOFOM, SOFIPO, institución de tecnología financiera"},
      {id:"ley_fintech_cumplimiento",label:"Análisis de cumplimiento Ley Fintech",requerido:true,desc:"ITF, crowdfunding, activos virtuales"},
      {id:"contrato_usuarios_fintech",label:"Contrato con usuarios de la plataforma",requerido:true,desc:"Términos, riesgos y responsabilidades claras"},
      {id:"politica_activos_virtuales",label:"Política de activos virtuales",requerido:false,desc:"Si opera con criptomonedas — CNBV/Banxico"},
      {id:"reporte_condusef_fintech",label:"Reportes CONDUSEF de la Fintech",requerido:false,desc:"Si es entidad financiera regulada"},
    ],
    checklist: [
      {id:"registro_cnbv_vigente",label:"Registro o autorización CNBV vigente si aplica",riesgo:"critico"},
      {id:"ley_fintech_analizada",label:"Ley Fintech analizada y cumplida",riesgo:"critico"},
      {id:"pld_fintech",label:"Programa PLD conforme a disposiciones Banxico/CNBV",riesgo:"critico"},
      {id:"usuarios_informados_riesgos",label:"Usuarios informados de riesgos de inversión",riesgo:"alto"},
      {id:"segregacion_fondos",label:"Fondos de usuarios segregados del patrimonio de la empresa",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Operación como fintech sin autorización CNBV",impacto:"Clausura + multa hasta $26,000,000 MXN + responsabilidad penal",nivel:"critico"},
      {label:"Fondos de usuarios mezclados — fraude",impacto:"Responsabilidad penal + pérdida de licencia",nivel:"critico"},
      {label:"Sin PLD — complicidad en lavado de dinero",impacto:"Cancelación de autorización + responsabilidad penal",nivel:"critico"},
    ]
  },

  // ── AGROINDUSTRIA Y ALIMENTOS ─────────────────────────────────────────────
  "AG-01": {
    docs: [
      {id:"contratos_agricultores",label:"Contratos de agricultura por contrato",requerido:true,desc:"Con productores primarios — precio, calidad, entrega"},
      {id:"contratos_acopio",label:"Contratos de acopio y almacenamiento",requerido:false,desc:"Con almacenes generales de depósito"},
      {id:"contratos_exportacion_agro",label:"Contratos de exportación agroalimentaria",requerido:false,desc:"Con importadores — Incoterms, divisas, garantías"},
      {id:"seguros_cosecha",label:"Seguros de cosecha o paramétricos",requerido:false,desc:"Cobertura de riesgos climáticos"},
      {id:"certificaciones_agricolas",label:"Certificaciones agrícolas (GlobalGAP, orgánico)",requerido:false,desc:"Requeridas por compradores internacionales"},
    ],
    checklist: [
      {id:"contratos_productores_vigentes",label:"Contratos con productores vigentes y con precio fijo",riesgo:"alto"},
      {id:"calidad_especificada",label:"Especificaciones de calidad claras y medibles",riesgo:"alto"},
      {id:"riesgo_climático_cubierto",label:"Riesgo climático cubierto con seguro",riesgo:"alto"},
      {id:"trazabilidad_origen",label:"Trazabilidad de origen documentada",riesgo:"critico"},
      {id:"certificaciones_vigentes",label:"Certificaciones de calidad vigentes",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Precio no fijado — pérdida por volatilidad",impacto:"Márgenes negativos en temporadas de sobreoferta",nivel:"alto"},
      {label:"Sin trazabilidad — retiro de mercado",impacto:"Retiro masivo de producto + responsabilidad civil",nivel:"critico"},
      {label:"Certificación vencida — pérdida de mercados premium",impacto:"Exclusión de cadenas de supermercados y exportación",nivel:"alto"},
    ]
  },
  "AG-02": {
    docs: [
      {id:"declaracion_do",label:"Declaración de protección de Denominación de Origen",requerido:false,desc:"IMPI — si el producto tiene DO vigente"},
      {id:"autorizacion_uso_do",label:"Autorización de uso de Denominación de Origen",requerido:false,desc:"Por el Consejo Regulador correspondiente"},
      {id:"solicitud_ig",label:"Solicitud de Indicación Geográfica ante IMPI",requerido:false,desc:"Para productos con características geográficas"},
      {id:"contrato_consejo_regulador",label:"Contrato con Consejo Regulador",requerido:false,desc:"Obligaciones de calidad y auditorías"},
      {id:"certificacion_do",label:"Certificado de cumplimiento de la DO",requerido:false,desc:"Renovación anual por el Consejo"},
    ],
    checklist: [
      {id:"uso_do_autorizado",label:"Uso de DO o IG formalmente autorizado",riesgo:"critico"},
      {id:"certificacion_do_vigente",label:"Certificación del Consejo Regulador vigente",riesgo:"critico"},
      {id:"origen_verificable",label:"Origen geográfico del producto verificable",riesgo:"alto"},
      {id:"etiquetado_correcto_do",label:"Etiquetado conforme a normas de la DO",riesgo:"alto"},
      {id:"vigilancia_uso_indebido",label:"Vigilancia activa contra uso indebido de la DO",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Uso no autorizado de DO — infracción IMPI",impacto:"Multa + decomiso + prohibición de uso + daño reputacional",nivel:"critico"},
      {label:"Certificación vencida — exclusión de mercados",impacto:"Pérdida de acceso a mercados premium nacionales e internacionales",nivel:"critico"},
      {label:"Producto fuera de zona geográfica — fraude",impacto:"Cancelación de autorización + responsabilidad penal",nivel:"critico"},
    ]
  },
  "AG-03": {
    docs: [
      {id:"registro_sanitario_alimentos",label:"Registro sanitario COFEPRIS de alimentos",requerido:true,desc:"Alimentos procesados — por producto"},
      {id:"permiso_importacion_alimentos",label:"Permiso de importación SENASICA",requerido:false,desc:"Para productos de origen animal o vegetal"},
      {id:"distintivo_h",label:"Distintivo H o equivalente",requerido:false,desc:"Restaurantes y servicios de alimentos"},
      {id:"nom_etiquetado",label:"Etiquetas conforme a NOM-051",requerido:true,desc:"Etiquetado frontal de advertencia — octágonos"},
      {id:"haccp_certificacion",label:"Certificación HACCP o FSSC 22000",requerido:false,desc:"Para exportación o clientes corporativos"},
    ],
    checklist: [
      {id:"registros_cofepris_alimentos",label:"Registros COFEPRIS vigentes para todos los productos",riesgo:"critico"},
      {id:"nom051_cumplida",label:"Etiquetado conforme a NOM-051 — octágonos correctos",riesgo:"critico"},
      {id:"haccp_implementado",label:"Sistema HACCP implementado",riesgo:"alto"},
      {id:"control_plagas",label:"Programa de control de plagas activo",riesgo:"alto"},
      {id:"cadena_frio",label:"Cadena de frío documentada si aplica",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Etiqueta sin octágonos NOM-051",impacto:"Retiro de producto + multa COFEPRIS + suspensión de venta",nivel:"critico"},
      {label:"Brote de enfermedad — responsabilidad civil",impacto:"Demandas colectivas + cierre del establecimiento",nivel:"critico"},
      {label:"Registro sanitario vencido",impacto:"Decomiso de inventario + multa + clausura de planta",nivel:"critico"},
    ]
  },
  "AG-04": {
    docs: [
      {id:"fitosanitario_exportacion",label:"Certificado fitosanitario de exportación SENASICA",requerido:true,desc:"Por embarque — requerido por destino"},
      {id:"certificado_origen_agro",label:"Certificado de origen",requerido:true,desc:"Para acceder a preferencias arancelarias TMEC/TLCUEs"},
      {id:"contrato_broker_exportacion",label:"Contrato con agente aduanal o broker",requerido:true,desc:"Para gestión de exportación"},
      {id:"registro_exportador",label:"Registro como exportador ante SENASICA",requerido:false,desc:"Para frutas, verduras y productos de origen animal"},
      {id:"documentos_destino",label:"Documentación de cumplimiento en país destino",requerido:true,desc:"FDA, EFSA, u otras autoridades según mercado"},
    ],
    checklist: [
      {id:"registro_senasica_vigente",label:"Registro exportador SENASICA vigente",riesgo:"critico"},
      {id:"certificados_fitosanitarios",label:"Certificados fitosanitarios por embarque",riesgo:"critico"},
      {id:"cumplimiento_pais_destino",label:"Requisitos del país destino cumplidos",riesgo:"critico"},
      {id:"origen_para_tlc",label:"Origen correctamente determinado para TLC",riesgo:"alto"},
      {id:"agente_aduanal_activo",label:"Agente aduanal especializado en agro",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Rechazo en frontera por fitosanitario",impacto:"Pérdida total del embarque + costos de retorno o destrucción",nivel:"critico"},
      {label:"Origen mal declarado — pérdida de preferencia arancelaria",impacto:"Cobro retroactivo de aranceles + multas aduanales",nivel:"critico"},
      {label:"Sin registro SENASICA — exportación bloqueada",impacto:"Imposibilidad de exportar mientras no se regulariza",nivel:"critico"},
    ]
  },

  // ── ENTRETENIMIENTO Y MEDIOS ──────────────────────────────────────────────
  "EM-01": {
    docs: [
      {id:"contrato_produccion",label:"Contrato de producción audiovisual",requerido:true,desc:"Con productora — alcance, derechos, entregables"},
      {id:"contrato_distribucion_em",label:"Contrato de distribución",requerido:true,desc:"Cine, streaming, TV — territorial y temporalidad"},
      {id:"cesion_derechos_actores",label:"Cesión de derechos de imagen y voz — actores",requerido:true,desc:"Por cada talent con aparición en el contenido"},
      {id:"contrato_musica_sync",label:"Licencia de sincronización musical",requerido:false,desc:"Para música en producción audiovisual"},
      {id:"errores_omisiones",label:"Póliza de Errores y Omisiones (E&O)",requerido:true,desc:"Requerida por distribuidores y plataformas"},
    ],
    checklist: [
      {id:"derechos_produccion_empresa",label:"Derechos de la producción a nombre de la empresa",riesgo:"critico"},
      {id:"talent_firmado",label:"Contratos de talent firmados antes del rodaje",riesgo:"critico"},
      {id:"musica_licenciada",label:"Toda la música con licencia de sincronización",riesgo:"critico"},
      {id:"eo_vigente",label:"Póliza E&O vigente",riesgo:"alto"},
      {id:"distribucion_exclusiva_analizada",label:"Exclusividades territoriales analizadas",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Talent sin contrato — demanda post-lanzamiento",impacto:"Bloqueo de distribución + indemnización por uso no autorizado",nivel:"critico"},
      {label:"Música sin licencia de sincronización",impacto:"Retiro de plataformas + multa por infracción de derechos de autor",nivel:"critico"},
      {label:"Sin póliza E&O — distribuidoras no aceptan el contenido",impacto:"Imposibilidad de distribución hasta obtener la póliza",nivel:"alto"},
    ]
  },
  "EM-02": {
    docs: [
      {id:"registro_obras_indautor",label:"Registro de obras ante INDAUTOR",requerido:true,desc:"Obras literarias, musicales, audiovisuales, software"},
      {id:"contratos_cesion_derechos",label:"Contratos de cesión de derechos de autor",requerido:true,desc:"Con creadores — total o parcial, temporal o definitiva"},
      {id:"licencias_contenido",label:"Licencias de contenido de terceros",requerido:false,desc:"Para uso de obras protegidas en producción propia"},
      {id:"contrato_editorial",label:"Contrato editorial o de publicación",requerido:false,desc:"Para obras literarias o musicales"},
      {id:"contratos_plataformas_digitales",label:"Contratos con plataformas digitales",requerido:false,desc:"Spotify, YouTube, Netflix — términos y regalías"},
    ],
    checklist: [
      {id:"obras_registradas",label:"Obras relevantes registradas ante INDAUTOR",riesgo:"alto"},
      {id:"derechos_cedidos_empresa",label:"Derechos de autor cedidos a la empresa — no al creador",riesgo:"critico"},
      {id:"licencias_vigentes",label:"Licencias de contenido de terceros vigentes",riesgo:"critico"},
      {id:"regalias_al_corriente",label:"Regalías a sociedades de gestión al corriente",riesgo:"alto"},
      {id:"pirateria_monitoreada",label:"Piratería digital monitoreada y perseguida",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Derechos en cabeza del creador — no de la empresa",impacto:"Empresa no puede explotar comercialmente la obra",nivel:"critico"},
      {label:"Uso de obra sin licencia — infracción INDAUTOR",impacto:"Multa + indemnización al titular + retiro del contenido",nivel:"critico"},
      {label:"Regalías impagadas — demanda colectiva de autores",impacto:"Bloqueo de distribución + daños y perjuicios",nivel:"alto"},
    ]
  },
  "EM-03": {
    docs: [
      {id:"contrato_influencer",label:"Contrato con influencer o creador de contenido",requerido:true,desc:"Alcance, exclusividad, entregables, derechos de imagen"},
      {id:"politica_publicidad_cofepris",label:"Política de publicidad conforme a COFEPRIS/PROFECO",requerido:true,desc:"Productos regulados — alimentos, medicamentos, bebidas"},
      {id:"disclosure_publicidad",label:"Política de divulgación de publicidad pagada",requerido:true,desc:"FTC/PROFECO — #ad, #publicidad en contenido"},
      {id:"cesion_imagen_influencer",label:"Cesión de derechos de imagen del influencer",requerido:true,desc:"Para uso de imagen en campañas de la marca"},
      {id:"contrato_agencia_influencer",label:"Contrato con agencia de talentos",requerido:false,desc:"Si el influencer tiene representación"},
    ],
    checklist: [
      {id:"contrato_firmado_previo",label:"Contrato firmado antes de iniciar la campaña",riesgo:"critico"},
      {id:"disclosure_incluido",label:"Disclosure de publicidad pagada en todo el contenido",riesgo:"alto"},
      {id:"restricciones_competencia",label:"Cláusula de no competencia o exclusividad clara",riesgo:"alto"},
      {id:"propiedad_contenido",label:"Propiedad del contenido creado para la marca",riesgo:"alto"},
      {id:"publicidad_productos_regulados",label:"Publicidad de productos regulados cumple normas",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Influencer sin contrato — reclama derechos post-campaña",impacto:"Retiro del contenido + indemnización por uso no autorizado",nivel:"critico"},
      {label:"Publicidad sin disclosure — multa PROFECO",impacto:"Multa + daño reputacional + retiro de campaña",nivel:"alto"},
      {label:"Publicidad de medicamento sin autorización COFEPRIS",impacto:"Multa + clausura de campaña + responsabilidad del anunciante",nivel:"critico"},
    ]
  },
  "EM-04": {
    docs: [
      {id:"contrato_patrocinio",label:"Contrato de patrocinio deportivo",requerido:true,desc:"Con atleta, equipo o evento — derechos y contraprestaciones"},
      {id:"contrato_imagen_deportista",label:"Contrato de imagen del deportista",requerido:true,desc:"Uso comercial de nombre, imagen, palmarés"},
      {id:"contrato_federacion",label:"Contrato o acreditación con federación deportiva",requerido:false,desc:"Para acceder a competencias oficiales"},
      {id:"licencias_transmision",label:"Licencias de transmisión de evento",requerido:false,desc:"TV, streaming, radio — derechos de difusión"},
      {id:"seguro_evento_deportivo",label:"Póliza de seguro del evento deportivo",requerido:true,desc:"Responsabilidad civil + accidentes de participantes"},
    ],
    checklist: [
      {id:"derechos_imagen_firmados",label:"Derechos de imagen del deportista firmados",riesgo:"critico"},
      {id:"exclusividades_analizadas",label:"Exclusividades de patrocinio analizadas",riesgo:"alto"},
      {id:"transmision_licenciada",label:"Derechos de transmisión licenciados",riesgo:"critico"},
      {id:"seguro_evento_vigente",label:"Seguro del evento vigente",riesgo:"critico"},
      {id:"reglamento_federacion",label:"Reglamento de la federación cumplido",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Uso de imagen del deportista sin contrato",impacto:"Demanda por daño moral + uso no autorizado — indemnización alta",nivel:"critico"},
      {label:"Transmisión sin derechos — bloqueo de plataformas",impacto:"Retiro inmediato del contenido + demanda del titular de derechos",nivel:"critico"},
      {label:"Evento sin seguro — accidente de participante",impacto:"Responsabilidad civil ilimitada del organizador",nivel:"critico"},
    ]
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE GENÉRICO PARA MÓDULOS ESPECIALIZADOS
// ─────────────────────────────────────────────────────────────────────────────
function ModEspecializadoGenerico({client, modId, titulo, campos}){
  const [data,setData]=useState({});
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    supabase.from("uso_poderes").select("*").eq("client_id",client.id).eq("modulo",modId).single()
      .then(({data:d})=>{ if(d) setData(d); });
  },[client.id, modId]);

  async function save(field,val){
    setSaving(true);
    const updated={...data,[field]:val,client_id:client.id,modulo:modId};
    setData(updated);
    await supabase.from("modulos_data").upsert({client_id:client.id,modulo:mod,sociedad_id:client._sociedad?.id||null,data:updated,updated_at:new Date().toISOString()},{onConflict:"client_id,modulo,sociedad_id"});
    setSaving(false);
  }

  return(
    <div>
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO}}>
        <span style={s.label}>{titulo}</span>
        <div style={s.grid2}>
          {campos.map(campo=>(
            <div key={campo.field} style={campo.fullWidth?{gridColumn:"1/-1"}:{}}>
              <span style={s.label}>{campo.label}</span>
              {campo.type==="select"?(
                <select style={s.input} value={data[campo.field]||""} onChange={e=>save(campo.field,e.target.value)}>
                  <option value="">Seleccionar</option>
                  {campo.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ):campo.type==="textarea"?(
                <textarea style={{...s.input,minHeight:70,resize:"vertical"}} value={data[campo.field]||""} onChange={e=>save(campo.field,e.target.value)} placeholder={campo.placeholder||""}/>
              ):(
                <input style={s.input} type={campo.type||"text"} value={data[campo.field]||""} onChange={e=>save(campo.field,e.target.value)} placeholder={campo.placeholder||""}/>
              )}
            </div>
          ))}
        </div>
        {saving&&<div style={{...s.muted,marginTop:6}}>Guardando...</div>}
      </div>
    </div>
  );
}

// ── EXPORTS DE COMPONENTES ────────────────────────────────────────────────────
export function ModPP01({client}){return <ModEspecializadoGenerico client={client} modId="PP-01" titulo="Blindaje de Activos" campos={[{field:"banco_fiduciario",label:"Banco fiduciario",placeholder:"Nombre del banco"},{field:"fecha_fideicomiso",label:"Fecha de constitución",type:"date"},{field:"num_escritura_fid",label:"Número de escritura",placeholder:"Escritura del fideicomiso"},{field:"activos_fideicomitidos",label:"Activos fideicomitidos",placeholder:"Inmuebles, acciones, cuentas...",fullWidth:true,type:"textarea"},{field:"beneficiarios",label:"Beneficiarios designados",placeholder:"Nombre y relación",fullWidth:true,type:"textarea"},{field:"ultima_revision",label:"Última revisión de estructura",type:"date"},{field:"coordinacion_fiscal",label:"Coordinado con fiscal",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"pendiente",label:"Pendiente"}]}]}/>;}

export function ModPP02({client}){return <ModEspecializadoGenerico client={client} modId="PP-02" titulo="Holding y Estructuras Corporativas" campos={[{field:"nombre_holding",label:"Nombre del holding",placeholder:"Razón social del holding"},{field:"fecha_constitucion_holding",label:"Fecha de constitución",type:"date"},{field:"num_entidades",label:"Número de entidades en el grupo",type:"number",placeholder:"Total de empresas"},{field:"pais_holding",label:"País del holding",placeholder:"México, Delaware, etc."},{field:"estudio_pt_vigente",label:"Estudio de precios de transferencia vigente",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"no",label:"No"},{value:"en_proceso",label:"En proceso"}]},{field:"contratos_intercompany",label:"Contratos intercompany al corriente",type:"select",options:[{value:"si",label:"Sí"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"descripcion_estructura",label:"Descripción de la estructura",type:"textarea",fullWidth:true,placeholder:"Describe la arquitectura del grupo corporativo..."}]}/>;}

export function ModPP03({client}){return <ModEspecializadoGenerico client={client} modId="PP-03" titulo="Financiamiento y Garantías" campos={[{field:"deuda_total",label:"Deuda total (MXN)",type:"number",placeholder:"Suma de todas las deudas"},{field:"num_creditos",label:"Número de créditos activos",type:"number"},{field:"banco_principal",label:"Acreedor principal",placeholder:"Banco o institución"},{field:"fecha_vencimiento_credito",label:"Vencimiento crédito principal",type:"date"},{field:"covenants_cumplidos",label:"Covenants al corriente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No — hay incumplimientos"},{value:"na",label:"No aplica"}]},{field:"garantias_registradas",label:"Garantías registradas en RPP/RUG",type:"select",options:[{value:"si",label:"Sí — todas registradas"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"notas_credito",label:"Observaciones",type:"textarea",fullWidth:true,placeholder:"Condiciones especiales, renegociaciones en proceso..."}]}/>;}

export function ModPP04({client}){return <ModEspecializadoGenerico client={client} modId="PP-04" titulo="Crisis y Reestructura de Deuda" campos={[{field:"nivel_crisis",label:"Nivel de crisis",type:"select",options:[{value:"preventivo",label:"Preventivo — monitoreo"},{value:"moderado",label:"Moderado — negociación activa"},{value:"critico",label:"Crítico — concurso o insolvencia"}]},{field:"deuda_vencida",label:"Deuda vencida (MXN)",type:"number",placeholder:"Total de deuda en mora"},{field:"acreedores_principales",label:"Acreedores principales",type:"textarea",placeholder:"Lista de acreedores con montos",fullWidth:true},{field:"plan_reestructura",label:"Plan de reestructura",type:"select",options:[{value:"si",label:"Sí — aprobado"},{value:"en_negociacion",label:"En negociación"},{value:"no",label:"No iniciado"}]},{field:"asesor_concursal",label:"Asesor concursal designado",placeholder:"Nombre del asesor o firma"},{field:"fecha_concurso",label:"Fecha de solicitud de concurso",type:"date"}]}/>;}

export function ModCE01({client}){return <ModEspecializadoGenerico client={client} modId="CE-01" titulo="Antilavado LFPIORPI" campos={[{field:"actividad_vulnerable",label:"Actividad vulnerable identificada",type:"select",options:[{value:"si",label:"Sí — art. 17 LFPIORPI"},{value:"no",label:"No aplica"},{value:"analisis_pendiente",label:"Análisis pendiente"}]},{field:"aviso_presentado",label:"Aviso presentado ante UIF",type:"select",options:[{value:"si",label:"Sí — presentado"},{value:"no",label:"No"},{value:"en_tramite",label:"En trámite"}]},{field:"oficial_cumplimiento",label:"Oficial de cumplimiento",placeholder:"Nombre del oficial designado"},{field:"fecha_ultima_capacitacion",label:"Última capacitación PLD",type:"date"},{field:"sistema_kyc",label:"Sistema KYC implementado",type:"select",options:[{value:"completo",label:"Completo"},{value:"parcial",label:"Parcial"},{value:"no",label:"No implementado"}]},{field:"reportes_uif_al_corriente",label:"Reportes UIF al corriente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]}]}/>;}

export function ModCE02({client}){return <ModEspecializadoGenerico client={client} modId="CE-02" titulo="Protección al Consumidor" campos={[{field:"contrato_adhesion",label:"Contrato de adhesión",type:"select",options:[{value:"registrado",label:"Registrado ante PROFECO"},{value:"no_aplica",label:"No aplica"},{value:"pendiente",label:"Pendiente de registro"}]},{field:"garantia_productos",label:"Garantía de productos cumplida",type:"select",options:[{value:"si",label:"Sí — mínimo 1 año"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"quejas_profeco",label:"Quejas activas PROFECO",type:"number",placeholder:"Número de quejas"},{field:"aviso_privacidad_consumidor",label:"Aviso de privacidad para consumidores",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"desactualizado",label:"Desactualizado"},{value:"no",label:"No"}]},{field:"publicidad_revisada",label:"Publicidad revisada por asesor",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"}]},{field:"notas_consumidor",label:"Observaciones",type:"textarea",fullWidth:true,placeholder:"Procedimientos activos, reclamaciones relevantes..."}]}/>;}

export function ModCE03({client}){return <ModEspecializadoGenerico client={client} modId="CE-03" titulo="Responsabilidad Ambiental" campos={[{field:"mia_status",label:"MIA aprobada",type:"select",options:[{value:"si",label:"Sí — aprobada"},{value:"no_aplica",label:"No aplica"},{value:"en_tramite",label:"En trámite"},{value:"requerida",label:"Requerida — no iniciada"}]},{field:"residuos_peligrosos",label:"Genera residuos peligrosos",type:"select",options:[{value:"si",label:"Sí — con plan de manejo"},{value:"si_sin_plan",label:"Sí — sin plan de manejo"},{value:"no",label:"No"}]},{field:"coa_presentada",label:"COA presentada",type:"select",options:[{value:"si",label:"Sí — al corriente"},{value:"no_aplica",label:"No aplica"},{value:"pendiente",label:"Pendiente"}]},{field:"pasivos_ambientales",label:"Pasivos ambientales identificados",type:"select",options:[{value:"no",label:"No identificados"},{value:"si_controlados",label:"Sí — en remediación"},{value:"si_sin_control",label:"Sí — sin control"}]},{field:"seguro_ambiental",label:"Seguro de responsabilidad ambiental",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"no",label:"No"},{value:"en_tramite",label:"En trámite"}]},{field:"notas_ambiental",label:"Notas",type:"textarea",fullWidth:true,placeholder:"Inspecciones activas, contingencias..."}]}/>;}

export function ModCE04({client}){return <ModEspecializadoGenerico client={client} modId="CE-04" titulo="Seguridad e Higiene STPS" campos={[{field:"comision_registrada",label:"Comisión de Seguridad registrada STPS",type:"select",options:[{value:"si",label:"Sí — registrada"},{value:"no",label:"No"},{value:"en_tramite",label:"En trámite"}]},{field:"num_trabajadores_csh",label:"Número de trabajadores cubiertos",type:"number"},{field:"noms_identificadas",label:"NOMs aplicables identificadas",type:"select",options:[{value:"si",label:"Sí — todas identificadas"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"ultimo_simulacro",label:"Último simulacro realizado",type:"date"},{field:"accidentes_ultimo_ano",label:"Accidentes en el último año",type:"number",placeholder:"0 si ninguno"},{field:"capacitacion_seguridad",label:"Capacitación anual completada",type:"select",options:[{value:"si",label:"Sí — todos los trabajadores"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]}]}/>;}

export function ModINM01({client}){return <ModEspecializadoGenerico client={client} modId="INM-01" titulo="Due Diligence Inmobiliario" campos={[{field:"inmueble_descripcion",label:"Descripción del inmueble",type:"textarea",fullWidth:true,placeholder:"Ubicación, superficie, tipo..."},{field:"folio_rpp_inm",label:"Folio RPP",placeholder:"Número de folio registral"},{field:"gravamenes",label:"Gravámenes identificados",type:"select",options:[{value:"libre",label:"Libre de gravámenes"},{value:"hipoteca",label:"Con hipoteca"},{value:"embargo",label:"Con embargo"},{value:"multiple",label:"Múltiples gravámenes"}]},{field:"uso_suelo_inm",label:"Uso de suelo",placeholder:"Habitacional, comercial, industrial..."},{field:"predial_corriente",label:"Predial al corriente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No — adeudos pendientes"}]},{field:"valor_avaluo",label:"Valor de avalúo (MXN)",type:"number",placeholder:"Valor comercial"},{field:"notas_dd",label:"Observaciones due diligence",type:"textarea",fullWidth:true,placeholder:"Hallazgos relevantes, riesgos identificados..."}]}/>;}

export function ModINM02({client}){return <ModEspecializadoGenerico client={client} modId="INM-02" titulo="Desarrollo y Construcción" campos={[{field:"licencia_construccion_status",label:"Licencia de construcción",type:"select",options:[{value:"vigente",label:"Vigente"},{value:"en_tramite",label:"En trámite"},{value:"no_iniciada",label:"No iniciada"},{value:"vencida",label:"Vencida"}]},{field:"constructor",label:"Constructor/Desarrollador",placeholder:"Nombre o razón social"},{field:"valor_contrato_obra",label:"Valor del contrato de obra (MXN)",type:"number"},{field:"avance_obra",label:"Porcentaje de avance",type:"number",placeholder:"0-100"},{field:"fianza_cumplimiento",label:"Fianza de cumplimiento",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"no",label:"No"},{value:"insuficiente",label:"Insuficiente"}]},{field:"fecha_entrega_estimada",label:"Fecha de entrega estimada",type:"date"},{field:"notas_obra",label:"Observaciones",type:"textarea",fullWidth:true,placeholder:"Contingencias, retrasos, litigios..."}]}/>;}

export function ModINM03({client}){return <ModEspecializadoGenerico client={client} modId="INM-03" titulo="Arrendamiento Comercial e Industrial" campos={[{field:"inmueble_arrendado",label:"Inmueble arrendado",type:"textarea",fullWidth:true,placeholder:"Descripción y ubicación"},{field:"renta_mensual",label:"Renta mensual (MXN)",type:"number"},{field:"vigencia_contrato_arr",label:"Vencimiento del contrato",type:"date"},{field:"deposito_garantia_arr",label:"Depósito en garantía (meses)",type:"number"},{field:"arrendador",label:"Arrendador",placeholder:"Nombre o razón social"},{field:"opcion_prorroga",label:"Opción de prórroga",type:"select",options:[{value:"si",label:"Sí — pactada"},{value:"no",label:"No"},{value:"negociable",label:"Negociable"}]},{field:"poliza_arr",label:"Póliza jurídica de arrendamiento",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"}]}]}/>;}

export function ModINM04({client}){return <ModEspecializadoGenerico client={client} modId="INM-04" titulo="Fideicomisos Inmobiliarios" campos={[{field:"tipo_fideicomiso_inm",label:"Tipo de fideicomiso",type:"select",options:[{value:"privado",label:"Fideicomiso privado"},{value:"ckd",label:"CKD — BMV"},{value:"fibra",label:"FIBRA — pública"},{value:"fibra_e",label:"FIBRA E"}]},{field:"banco_fiduciario_inm",label:"Banco fiduciario",placeholder:"Nombre del banco"},{field:"num_inmuebles",label:"Número de inmuebles en el portafolio",type:"number"},{field:"valor_portafolio",label:"Valor del portafolio (MXN)",type:"number"},{field:"distribucion_fideicomisarios",label:"Distribuciones al corriente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No — hay atrasos"},{value:"na",label:"No aplica"}]},{field:"reportes_cnbv_inm",label:"Reportes CNBV al corriente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]}]}/>;}

export function ModINM05({client}){return <ModEspecializadoGenerico client={client} modId="INM-05" titulo="Regularización y Conflictos" campos={[{field:"status_titularidad",label:"Status de titularidad",type:"select",options:[{value:"clara",label:"Clara — sin disputa"},{value:"irregular",label:"Irregular — en regularización"},{value:"litigio",label:"En litigio"},{value:"ejidal",label:"Origen ejidal"}]},{field:"proceso_regularizacion",label:"Proceso de regularización",type:"select",options:[{value:"si",label:"Sí — en trámite"},{value:"no",label:"No iniciado"},{value:"na",label:"No aplica"}]},{field:"litigios_activos_inm",label:"Litigios activos sobre el inmueble",type:"number",placeholder:"0 si ninguno"},{field:"colindantes_conflicto",label:"Conflicto con colindantes",type:"select",options:[{value:"no",label:"No"},{value:"si",label:"Sí — activo"},{value:"resuelto",label:"Resuelto"}]},{field:"notas_conflicto_inm",label:"Descripción del conflicto",type:"textarea",fullWidth:true,placeholder:"Partes, estado actual, estrategia..."}]}/>;}

export function ModSC01({client}){return <ModEspecializadoGenerico client={client} modId="SC-01" titulo="Regulación COFEPRIS" campos={[{field:"num_registros_sanitarios",label:"Número de registros sanitarios",type:"number"},{field:"responsable_sanitario",label:"Responsable sanitario",placeholder:"Nombre y cédula profesional"},{field:"licencia_sanitaria_status",label:"Licencia sanitaria",type:"select",options:[{value:"vigente",label:"Vigente"},{value:"en_tramite",label:"En trámite"},{value:"vencida",label:"Vencida"}]},{field:"bpf_certificado",label:"BPF/BPD certificado",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]},{field:"fecha_proxima_renovacion",label:"Próxima renovación",type:"date"},{field:"farmacovigilancia",label:"Sistema de farmacovigilancia",type:"select",options:[{value:"si",label:"Sí — activo"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]}]}/>;}

export function ModSC02({client}){return <ModEspecializadoGenerico client={client} modId="SC-02" titulo="Dispositivos Médicos" campos={[{field:"num_dispositivos",label:"Número de dispositivos registrados",type:"number"},{field:"clase_dispositivo",label:"Clase de mayor riesgo",type:"select",options:[{value:"clase1",label:"Clase I — bajo riesgo"},{value:"clase2",label:"Clase II — riesgo moderado"},{value:"clase3",label:"Clase III — alto riesgo"}]},{field:"tecnovigilancia_status",label:"Sistema de tecnovigilancia",type:"select",options:[{value:"activo",label:"Activo"},{value:"parcial",label:"Parcial"},{value:"no",label:"No implementado"}]},{field:"distribuidor_autorizado",label:"Distribución solo por establecimiento autorizado",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]},{field:"notas_dm",label:"Observaciones",type:"textarea",fullWidth:true,placeholder:"Incidentes adversos, retiros de mercado..."}]}/>;}

export function ModSC03({client}){return <ModEspecializadoGenerico client={client} modId="SC-03" titulo="Clínicas y Hospitales" campos={[{field:"tipo_establecimiento",label:"Tipo de establecimiento",type:"select",options:[{value:"clinica",label:"Clínica"},{value:"hospital",label:"Hospital"},{value:"consultorio",label:"Consultorio"},{value:"laboratorio",label:"Laboratorio"}]},{field:"num_medicos",label:"Número de médicos adscritos",type:"number"},{field:"licencia_ss_status",label:"Licencia Secretaría de Salud",type:"select",options:[{value:"vigente",label:"Vigente — todos los servicios"},{value:"parcial",label:"Parcial — algunos servicios"},{value:"vencida",label:"Vencida"}]},{field:"poliza_rc_medica",label:"Póliza RC médica",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"no",label:"No"},{value:"parcial",label:"Solo algunos médicos"}]},{field:"consentimiento_informado",label:"Consentimiento informado por procedimiento",type:"select",options:[{value:"si",label:"Sí — todos los procedimientos"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"nom004_cumplida",label:"Expediente clínico NOM-004",type:"select",options:[{value:"si",label:"Sí"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]}]}/>;}

export function ModSC04({client}){return <ModEspecializadoGenerico client={client} modId="SC-04" titulo="Telemedicina y Salud Digital" campos={[{field:"plataforma_telemedicina",label:"Plataforma de telemedicina",placeholder:"Nombre de la plataforma"},{field:"cifrado_datos_salud",label:"Datos de salud cifrados",type:"select",options:[{value:"si",label:"Sí — cifrado extremo a extremo"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"medico_responsable",label:"Médico responsable designado",placeholder:"Nombre y cédula"},{field:"nom024_cumplida",label:"NOM-024 cumplida",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]},{field:"aviso_privacidad_salud",label:"Aviso de privacidad para datos sensibles",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"no",label:"No"}]},{field:"notas_telemedicina",label:"Observaciones",type:"textarea",fullWidth:true,placeholder:"Integraciones, permisos pendientes..."}]}/>;}

export function ModEN01({client}){return <ModEspecializadoGenerico client={client} modId="EN-01" titulo="Contratos de Energía" campos={[{field:"tipo_suministro",label:"Tipo de suministro",type:"select",options:[{value:"cfe",label:"CFE — servicio básico"},{value:"calificado",label:"Usuario calificado"},{value:"autoabasto",label:"Autoabasto"},{value:"generacion_propia",label:"Generación propia"}]},{field:"tarifa_cfe",label:"Tarifa CFE",placeholder:"H-M, H-T, I, etc."},{field:"demanda_contratada",label:"Demanda contratada (kW)",type:"number"},{field:"permiso_cre",label:"Permiso CRE vigente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]},{field:"costo_mensual_energia",label:"Costo mensual energía (MXN)",type:"number"},{field:"plan_contingencia_energia",label:"Plan de contingencia energética",type:"select",options:[{value:"si",label:"Sí — documentado"},{value:"no",label:"No"}]}]}/>;}

export function ModEN02({client}){return <ModEspecializadoGenerico client={client} modId="EN-02" titulo="Energías Renovables" campos={[{field:"tecnologia_renovable",label:"Tecnología",type:"select",options:[{value:"solar",label:"Solar fotovoltaico"},{value:"eolico",label:"Eólico"},{value:"hidro",label:"Hidráulico"},{value:"cogeneracion",label:"Cogeneración"}]},{field:"capacidad_instalada",label:"Capacidad instalada (kW)",type:"number"},{field:"permiso_cre_renovable",label:"Permiso CRE",type:"select",options:[{value:"vigente",label:"Vigente"},{value:"en_tramite",label:"En trámite"},{value:"no_iniciado",label:"No iniciado"}]},{field:"contrato_interconexion",label:"Contrato de interconexión CFE",type:"select",options:[{value:"firmado",label:"Firmado"},{value:"en_negociacion",label:"En negociación"},{value:"no",label:"No"}]},{field:"ppa_vigente",label:"PPA vigente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"Autoconsumo — no aplica"}]},{field:"eia_status",label:"EIA aprobada",type:"select",options:[{value:"si",label:"Sí"},{value:"no_aplica",label:"No aplica — proyecto menor"},{value:"en_tramite",label:"En trámite"}]}]}/>;}

export function ModEN03({client}){return <ModEspecializadoGenerico client={client} modId="EN-03" titulo="Impacto Ambiental SEMARNAT" campos={[{field:"mia_status_en",label:"MIA aprobada",type:"select",options:[{value:"aprobada",label:"Aprobada"},{value:"condicionada",label:"Aprobada con condicionantes"},{value:"en_tramite",label:"En trámite"},{value:"requerida",label:"Requerida — no iniciada"},{value:"no_aplica",label:"No aplica"}]},{field:"resolutivo_vigente",label:"Resolutivo vigente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No — requiere actualización"}]},{field:"condicionantes_cumplidas",label:"Condicionantes cumplidas",type:"select",options:[{value:"todas",label:"Todas"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"consulta_indigena",label:"Consulta indígena realizada",type:"select",options:[{value:"si",label:"Sí — completada"},{value:"no_aplica",label:"No aplica"},{value:"requerida",label:"Requerida — pendiente"}]},{field:"informes_semarnat",label:"Informes periódicos al corriente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]}]}/>;}

export function ModEN04({client}){return <ModEspecializadoGenerico client={client} modId="EN-04" titulo="Responsabilidad Ambiental" campos={[{field:"pasivos_ambientales_en",label:"Pasivos ambientales",type:"select",options:[{value:"ninguno",label:"Ninguno identificado"},{value:"identificados_controlados",label:"Identificados — en remediación"},{value:"identificados_sin_control",label:"Identificados — sin control"},{value:"no_evaluado",label:"No evaluado"}]},{field:"seguro_ambiental_en",label:"Seguro de responsabilidad ambiental",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"no",label:"No"},{value:"en_tramite",label:"En trámite"}]},{field:"derrames_ultimo_ano",label:"Derrames o incidentes en el último año",type:"number",placeholder:"0 si ninguno"},{field:"plan_remediacion_en",label:"Plan de remediación aprobado",type:"select",options:[{value:"si",label:"Sí"},{value:"no_aplica",label:"No aplica"},{value:"requerido",label:"Requerido — no iniciado"}]},{field:"auditorias_proactivas",label:"Auditorías ambientales proactivas",type:"select",options:[{value:"si",label:"Sí — anuales"},{value:"ocasional",label:"Ocasionales"},{value:"no",label:"No"}]}]}/>;}

export function ModTD01({client}){return <ModEspecializadoGenerico client={client} modId="TD-01" titulo="Desarrollo de Software" campos={[{field:"sistemas_criticos",label:"Sistemas críticos del negocio",type:"textarea",fullWidth:true,placeholder:"Lista los sistemas de software críticos..."},{field:"pi_empresa_sw_check",label:"PI del software a nombre de la empresa",type:"select",options:[{value:"si",label:"Sí — todo a nombre de la empresa"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No — en poder del desarrollador"}]},{field:"codigo_escrow_check",label:"Código fuente en escrow",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"en_poder_empresa",label:"En poder de la empresa"}]},{field:"licencias_open_source",label:"Licencias open source analizadas",type:"select",options:[{value:"si",label:"Sí — sin GPL contaminante"},{value:"no",label:"No analizadas"},{value:"na",label:"No aplica"}]},{field:"proveedor_sw_principal",label:"Proveedor de software principal",placeholder:"Nombre o razón social"},{field:"sla_soporte",label:"SLA de soporte vigente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"Software propio"}]}]}/>;}

export function ModTD02({client}){return <ModEspecializadoGenerico client={client} modId="TD-02" titulo="Inteligencia Artificial" campos={[{field:"uso_ia",label:"Uso de IA en la operación",type:"select",options:[{value:"critico",label:"Crítico — decisiones de alto impacto"},{value:"operativo",label:"Operativo — automatización"},{value:"experimental",label:"Experimental"},{value:"no",label:"No usa IA"}]},{field:"sistemas_ia",label:"Sistemas de IA utilizados",type:"textarea",placeholder:"ChatGPT, modelos propios, etc.",fullWidth:true},{field:"supervision_humana_ia",label:"Supervisión humana en decisiones IA",type:"select",options:[{value:"siempre",label:"Siempre"},{value:"alto_impacto",label:"Solo decisiones de alto impacto"},{value:"no",label:"No"}]},{field:"datos_entrenamiento_propios",label:"Derechos sobre datos de entrenamiento",type:"select",options:[{value:"propios",label:"Propios — sin PI de terceros"},{value:"licenciados",label:"Licenciados correctamente"},{value:"no_analizado",label:"No analizado"}]},{field:"privacidad_ia_check",label:"IA cumple con LFPDPPP",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"analisis_pendiente",label:"Análisis pendiente"}]}]}/>;}

export function ModTD03({client}){return <ModEspecializadoGenerico client={client} modId="TD-03" titulo="Ciberseguridad Legal" campos={[{field:"politica_cyber_status",label:"Política de ciberseguridad",type:"select",options:[{value:"aprobada",label:"Aprobada — vigente"},{value:"desactualizada",label:"Desactualizada"},{value:"no",label:"No existe"}]},{field:"backups_verificados",label:"Backups verificados",type:"select",options:[{value:"si",label:"Sí — con pruebas de restauración"},{value:"sin_probar",label:"Sí — sin probar"},{value:"no",label:"No"}]},{field:"mfa_implementado",label:"MFA en sistemas críticos",type:"select",options:[{value:"si",label:"Sí — todos los sistemas"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"ultimo_pentest",label:"Último pen test",type:"date"},{field:"incidentes_ultimo_ano",label:"Incidentes de seguridad en el último año",type:"number",placeholder:"0 si ninguno"},{field:"seguro_cyber",label:"Seguro cibernético",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"no",label:"No"},{value:"en_tramite",label:"En trámite"}]}]}/>;}

export function ModTD04({client}){return <ModEspecializadoGenerico client={client} modId="TD-04" titulo="Fintech y Regulación Digital" campos={[{field:"tipo_fintech",label:"Tipo de actividad Fintech",type:"select",options:[{value:"itf",label:"ITF — Ley Fintech"},{value:"sofom",label:"SOFOM"},{value:"sofipo",label:"SOFIPO"},{value:"crowdfunding",label:"Crowdfunding"},{value:"activos_virtuales",label:"Activos virtuales"},{value:"no_aplica",label:"No aplica"}]},{field:"registro_cnbv_fintech",label:"Autorización CNBV",type:"select",options:[{value:"autorizado",label:"Autorizado"},{value:"en_tramite",label:"En trámite"},{value:"no_requerido",label:"No requerido"},{value:"pendiente",label:"Requerido — no iniciado"}]},{field:"pld_fintech_status",label:"Programa PLD Fintech",type:"select",options:[{value:"completo",label:"Completo — Banxico/CNBV"},{value:"parcial",label:"Parcial"},{value:"no",label:"No implementado"}]},{field:"segregacion_fondos_check",label:"Fondos de usuarios segregados",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]},{field:"notas_fintech",label:"Observaciones",type:"textarea",fullWidth:true,placeholder:"Trámites en proceso, requerimientos CNBV..."}]}/>;}

export function ModAG01({client}){return <ModEspecializadoGenerico client={client} modId="AG-01" titulo="Contratos Agroindustriales" campos={[{field:"tipo_produccion",label:"Tipo de producción",type:"select",options:[{value:"agricola",label:"Agrícola"},{value:"pecuario",label:"Pecuario"},{value:"pesquero",label:"Pesquero"},{value:"forestal",label:"Forestal"},{value:"agroindustrial",label:"Agroindustrial"}]},{field:"num_productores",label:"Número de productores contratados",type:"number"},{field:"contratos_precio_fijo",label:"Contratos con precio fijo",type:"select",options:[{value:"si",label:"Sí — todos"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No — precio mercado"}]},{field:"seguro_cosecha",label:"Seguro de cosecha",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"no",label:"No"},{value:"parametrico",label:"Seguro paramétrico"}]},{field:"trazabilidad_origen",label:"Trazabilidad de origen",type:"select",options:[{value:"completa",label:"Completa — lote a lote"},{value:"parcial",label:"Parcial"},{value:"no",label:"No"}]},{field:"certificaciones_agro",label:"Certificaciones vigentes",type:"textarea",placeholder:"GlobalGAP, orgánico, comercio justo...",fullWidth:true}]}/>;}

export function ModAG02({client}){return <ModEspecializadoGenerico client={client} modId="AG-02" titulo="Denominaciones de Origen" campos={[{field:"do_aplica",label:"Denominación de Origen o IG aplicable",type:"select",options:[{value:"si",label:"Sí — usa DO o IG"},{value:"no",label:"No aplica"},{value:"en_proceso",label:"En proceso de obtención"}]},{field:"nombre_do",label:"Nombre de la DO o IG",placeholder:"Ej. Tequila, Mezcal, Café Veracruz"},{field:"autorizacion_uso",label:"Autorización de uso vigente",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"vencida",label:"Vencida"},{value:"en_tramite",label:"En trámite"},{value:"na",label:"No aplica"}]},{field:"consejo_regulador",label:"Consejo Regulador",placeholder:"Nombre del Consejo"},{field:"certificacion_do_fecha",label:"Fecha de última certificación",type:"date"},{field:"vigilancia_do",label:"Vigilancia contra uso indebido",type:"select",options:[{value:"si",label:"Sí — activa"},{value:"no",label:"No"}]}]}/>;}

export function ModAG03({client}){return <ModEspecializadoGenerico client={client} modId="AG-03" titulo="Regulación de Alimentos COFEPRIS" campos={[{field:"num_registros_alimentos",label:"Número de registros sanitarios",type:"number"},{field:"nom051_cumplida",label:"NOM-051 — etiquetado frontal",type:"select",options:[{value:"si",label:"Sí — todos los productos"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"haccp_status",label:"HACCP implementado",type:"select",options:[{value:"certificado",label:"Certificado"},{value:"implementado",label:"Implementado — sin certificar"},{value:"parcial",label:"Parcial"},{value:"no",label:"No"}]},{field:"control_plagas_agro",label:"Control de plagas activo",type:"select",options:[{value:"si",label:"Sí — contrato vigente"},{value:"no",label:"No"}]},{field:"cadena_frio_agro",label:"Cadena de frío documentada",type:"select",options:[{value:"si",label:"Sí"},{value:"no_aplica",label:"No aplica"},{value:"no",label:"No documentada"}]},{field:"retiros_mercado",label:"Retiros de mercado en último año",type:"number",placeholder:"0 si ninguno"}]}/>;}

export function ModAG04({client}){return <ModEspecializadoGenerico client={client} modId="AG-04" titulo="Exportación Agroalimentaria" campos={[{field:"paises_exportacion",label:"Países de destino",type:"textarea",placeholder:"EUA, Unión Europea, Japón...",fullWidth:true},{field:"registro_senasica_exp",label:"Registro SENASICA exportador",type:"select",options:[{value:"vigente",label:"Vigente"},{value:"en_tramite",label:"En trámite"},{value:"no",label:"No"}]},{field:"tlc_utilizado",label:"TLC utilizado",type:"select",options:[{value:"tmec",label:"TMEC — EUA y Canadá"},{value:"tlcue",label:"TLCUEM — Unión Europea"},{value:"multiple",label:"Múltiples TLCs"},{value:"no",label:"No usa preferencias TLC"}]},{field:"agente_aduanal_agro",label:"Agente aduanal especializado",placeholder:"Nombre o razón social"},{field:"certificados_fitosanitarios",label:"Certificados fitosanitarios al corriente",type:"select",options:[{value:"si",label:"Sí — por embarque"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]},{field:"cumplimiento_fda",label:"Cumplimiento FDA/EFSA",type:"select",options:[{value:"si",label:"Sí"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]}]}/>;}

export function ModEM01({client}){return <ModEspecializadoGenerico client={client} modId="EM-01" titulo="Producción y Distribución" campos={[{field:"tipo_contenido",label:"Tipo de contenido",type:"select",options:[{value:"pelicula",label:"Película"},{value:"serie",label:"Serie"},{value:"documental",label:"Documental"},{value:"publicidad",label:"Publicidad"},{value:"cortometraje",label:"Cortometraje"}]},{field:"presupuesto_produccion",label:"Presupuesto de producción (MXN)",type:"number"},{field:"talent_firmado_em",label:"Contratos de talent firmados",type:"select",options:[{value:"todos",label:"Todos firmados"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"musica_licenciada_em",label:"Música licenciada",type:"select",options:[{value:"si",label:"Sí — todas las piezas"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]},{field:"poliza_eo",label:"Póliza E&O vigente",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"en_tramite",label:"En trámite"}]},{field:"plataforma_distribucion",label:"Plataformas de distribución",type:"textarea",placeholder:"Netflix, Amazon, cines, YouTube...",fullWidth:true}]}/>;}

export function ModEM02({client}){return <ModEspecializadoGenerico client={client} modId="EM-02" titulo="Derechos de Autor y Licencias" campos={[{field:"obras_registradas_indautor",label:"Obras registradas ante INDAUTOR",type:"select",options:[{value:"todas",label:"Todas las relevantes"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"derechos_cedidos_em",label:"Derechos cedidos a la empresa",type:"select",options:[{value:"si",label:"Sí — todos los creadores"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"sociedades_gestion",label:"Regalías a sociedades de gestión",type:"select",options:[{value:"al_corriente",label:"Al corriente"},{value:"adeudo",label:"Con adeudo"},{value:"na",label:"No aplica"}]},{field:"licencias_vigentes_em",label:"Licencias de contenido de terceros vigentes",type:"select",options:[{value:"si",label:"Sí"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"},{value:"na",label:"No usa contenido de terceros"}]},{field:"pirateria_monitoreo",label:"Piratería monitoreada",type:"select",options:[{value:"si",label:"Sí — activamente"},{value:"no",label:"No"}]},{field:"plataformas_digitales_em",label:"Plataformas digitales principales",type:"textarea",placeholder:"Spotify, YouTube, etc.",fullWidth:true}]}/>;}

export function ModEM03({client}){return <ModEspecializadoGenerico client={client} modId="EM-03" titulo="Influencers y Marketing Digital" campos={[{field:"num_influencers_activos",label:"Influencers activos",type:"number"},{field:"contratos_firmados_em",label:"Contratos firmados previo a campaña",type:"select",options:[{value:"siempre",label:"Siempre"},{value:"a_veces",label:"A veces"},{value:"no",label:"No"}]},{field:"disclosure_politica",label:"Política de disclosure implementada",type:"select",options:[{value:"si",label:"Sí — en todos los contenidos"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"productos_regulados_em",label:"Publicidad de productos regulados",type:"select",options:[{value:"no_aplica",label:"No aplica"},{value:"si_cumple",label:"Sí — con autorización"},{value:"si_sin_control",label:"Sí — sin control"}]},{field:"agencia_talentos",label:"Agencia de talentos principal",placeholder:"Nombre de la agencia"},{field:"presupuesto_influencer",label:"Presupuesto mensual influencer marketing (MXN)",type:"number"}]}/>;}

export function ModEM04({client}){return <ModEspecializadoGenerico client={client} modId="EM-04" titulo="Deportes y Patrocinios" campos={[{field:"tipo_patrocinio",label:"Tipo de patrocinio",type:"select",options:[{value:"atleta",label:"Atleta individual"},{value:"equipo",label:"Equipo"},{value:"evento",label:"Evento deportivo"},{value:"instalacion",label:"Instalación deportiva"}]},{field:"deportista_contratado",label:"Deportista o equipo principal",placeholder:"Nombre"},{field:"derechos_imagen_firmados_em",label:"Derechos de imagen firmados",type:"select",options:[{value:"si",label:"Sí — todos"},{value:"parcial",label:"Parcialmente"},{value:"no",label:"No"}]},{field:"transmision_licenciada_em",label:"Derechos de transmisión licenciados",type:"select",options:[{value:"si",label:"Sí"},{value:"no",label:"No"},{value:"na",label:"No aplica"}]},{field:"seguro_evento_em",label:"Seguro del evento deportivo",type:"select",options:[{value:"si",label:"Sí — vigente"},{value:"no",label:"No"},{value:"na",label:"No organiza eventos"}]},{field:"valor_contrato_patrocinio",label:"Valor del contrato de patrocinio (MXN)",type:"number"}]}/>;}
