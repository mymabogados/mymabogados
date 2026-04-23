import React, { useState, useEffect, useRef } from "react";
import { ModA01,ModA02,ModA03,ModA04,ModA05,ModA06,ARBITRAJE_DOCS } from "./ModulosArbitraje";
import { ModC01,ModC02,ModC03,ModC04,ModC05,ModC06,ModC07,ModC08,CORPORATIVO_DOCS } from "./ModulosCorporativo";
import { ModO01,ModO02,ModO03,ModO04,ModO05,ModO06,ModO07,ModO08,ModO09,ModO10,OPERATIVO_DOCS } from "./ModulosOperativo";
import { ModF01,ModF02,ModF03,ModF04,ModF05,ModF06,ModF07,ModF08,FISCAL_DOCS } from "./ModulosFiscal";
import { ModM01,ModM02,ModM03,ModM04,ModM05,MIGRATORIO_DOCS } from "./ModulosMigratorio";
import { ModL01,ModL02,ModL03,ModL04,ModL05,ModL06,ModL07,ModL08,LABORAL_DOCS } from "./ModulosLaboral";
import { ModCON01,ModCON02,ModCON03,ModCON04,ModCON05,CONDOMINAL_DOCS } from "./ModulosCondominal";
import { ModPP01,ModPP02,ModPP03,ModPP04,ModCE01,ModCE02,ModCE03,ModCE04,ModINM01,ModINM02,ModINM03,ModINM04,ModINM05,ModSC01,ModSC02,ModSC03,ModSC04,ModEN01,ModEN02,ModEN03,ModEN04,ModTD01,ModTD02,ModTD03,ModTD04,ModAG01,ModAG02,ModAG03,ModAG04,ModEM01,ModEM02,ModEM03,ModEM04,ESPECIALIZADO_DOCS } from "./ModulosEspecializados";
import { DriveUploader } from "./DriveUploader";
import { supabase } from "./supabase";
import jsPDF from "jspdf";

const FORMSPREE = "https://formspree.io/f/xeevalwl";
const GOLD = "#A8C89A";
const CREAM = "#F2F4F0";
const BLACK = "#4A5C45";
const GRAY = "#7A9070";
const BORDER = "#DDE4D8";
const WHITE = "#FAFCF8";
const MUSGO = "#4A5C45";
const MUSGO_DARK = "#3C4E38";
const MUSGO_TEXT = "#F0F4EE";
const CONTENT_BG = "#F2F4F0";
const CARD_BG = "#FAFCF8";
const TEXT_DARK = "#1E2B1A";
const TEXT_MED = "#7A9070";

const STATUS_COLORS = {
  vigente:"#5A8A3C",vencido:"#C0392B","por renovar":"#C9A84C",
  pendiente:"#C9A84C",red:"#C0392B",amber:"#C9A84C",green:"#5A8A3C"
};


const MODULOS_CATALOG = [
  { id:"B-01", nombre:"Gobierno Corporativo", cat:"Base", tier:0 },
  { id:"B-02", nombre:"Cumplimiento Corporativo", cat:"Base", tier:0 },
  { id:"B-03", nombre:"Equipo Directivo y Poderes", cat:"Base", tier:0 },
  { id:"B-04", nombre:"Contratos Corporativos", cat:"Base", tier:0 },
  { id:"B-05", nombre:"Asambleas Corporativas", cat:"Base", tier:0 },
  { id:"B-06", nombre:"Perfil ante Autoridades", cat:"Base", tier:0 },
  { id:"B-07", nombre:"Alertas Críticas Operativas", cat:"Base", tier:0 },
  { id:"B-08", nombre:"Análisis de Estatutos con IA", cat:"Base", tier:0 },
  { id:"C-01", nombre:"Reestructura Societaria", cat:"Corporativo", tier:2, precio:90 },
  { id:"C-02", nombre:"Due Diligence Legal", cat:"Corporativo", tier:2, precio:90 },
  { id:"C-03", nombre:"Capital Privado y Pactos", cat:"Corporativo", tier:3, precio:120 },
  { id:"C-04", nombre:"Startups y Rondas de Inversión", cat:"Corporativo", tier:2, precio:90 },
  { id:"C-05", nombre:"Gobierno de Datos y Privacidad", cat:"Corporativo", tier:1, precio:60 },
  { id:"C-06", nombre:"Concesiones y Permisos Federales", cat:"Corporativo", tier:2, precio:90 },
  { id:"C-07", nombre:"Sector Financiero Regulado", cat:"Corporativo", tier:3, precio:120 },
  { id:"C-08", nombre:"Sucesión y Patrimonio Empresarial", cat:"Corporativo", tier:2, precio:90 },
  { id:"L-01", nombre:"Contratos de Trabajo", cat:"Laboral", tier:1, precio:60 },
  { id:"L-02", nombre:"Reglamento Interior de Trabajo", cat:"Laboral", tier:1, precio:60 },
  { id:"L-03", nombre:"REPSE y Subcontratación", cat:"Laboral", tier:2, precio:90 },
  { id:"L-04", nombre:"Terminaciones y Liquidaciones", cat:"Laboral", tier:2, precio:90 },
  { id:"L-05", nombre:"Litigios Laborales", cat:"Laboral", tier:3, precio:120 },
  { id:"L-06", nombre:"NOM-035 y Clima Laboral", cat:"Laboral", tier:1, precio:60 },
  { id:"L-07", nombre:"Seguridad Social Estratégica", cat:"Laboral", tier:2, precio:90 },
  { id:"L-08", nombre:"Directivos Clave y Retención", cat:"Laboral", tier:2, precio:90 },
  { id:"F-01", nombre:"Cumplimiento Fiscal Básico", cat:"Fiscal", tier:1, precio:60 },
  { id:"F-02", nombre:"Facturación y CFDI", cat:"Fiscal", tier:1, precio:60 },
  { id:"F-03", nombre:"Defensa Fiscal", cat:"Fiscal", tier:3, precio:120 },
  { id:"F-04", nombre:"Precios de Transferencia", cat:"Fiscal", tier:3, precio:120 },
  { id:"F-05", nombre:"Planeación Fiscal Corporativa", cat:"Fiscal", tier:3, precio:120 },
  { id:"F-06", nombre:"Comercio Exterior Fiscal", cat:"Fiscal", tier:2, precio:90 },
  { id:"F-07", nombre:"Obligaciones Informativas", cat:"Fiscal", tier:1, precio:60 },
  { id:"F-08", nombre:"Sector Financiero Fiscal", cat:"Fiscal", tier:3, precio:120 },
  { id:"A-01", nombre:"Arbitraje Comercial", cat:"Arbitraje", tier:3, precio:120 },
  { id:"A-02", nombre:"Mediación y Negociación", cat:"Arbitraje", tier:2, precio:90 },
  { id:"A-03", nombre:"Litigios Civiles y Mercantiles", cat:"Arbitraje", tier:3, precio:120 },
  { id:"A-04", nombre:"Amparo Corporativo", cat:"Arbitraje", tier:3, precio:120 },
  { id:"A-05", nombre:"Contingencias y Provisiones", cat:"Arbitraje", tier:2, precio:90 },
  { id:"A-06", nombre:"Competencia Económica", cat:"Arbitraje", tier:3, precio:120 },
  { id:"O-01", nombre:"Propiedad Intelectual", cat:"Operativo", tier:2, precio:90 },
  { id:"O-02", nombre:"Contratos con Proveedores", cat:"Operativo", tier:1, precio:60 },
  { id:"O-03", nombre:"Distribución y Agencia", cat:"Operativo", tier:1, precio:60 },
  { id:"O-04", nombre:"Franquicias", cat:"Operativo", tier:2, precio:90 },
  { id:"O-05", nombre:"Tecnología y SaaS", cat:"Operativo", tier:2, precio:90 },
  { id:"O-06", nombre:"Comercio Electrónico", cat:"Operativo", tier:1, precio:60 },
  { id:"O-07", nombre:"Inmuebles Corporativos", cat:"Operativo", tier:1, precio:60 },
  { id:"O-08", nombre:"Medio Ambiente y NOM", cat:"Operativo", tier:1, precio:60 },
  { id:"O-09", nombre:"Sector Salud", cat:"Operativo", tier:2, precio:90 },
  { id:"O-10", nombre:"Operaciones Transfronterizas", cat:"Operativo", tier:2, precio:90 },
  { id:"M-01", nombre:"Visas de Trabajo", cat:"Migratorio", tier:2, precio:90 },
  { id:"M-02", nombre:"Transferencias Intracompañía", cat:"Migratorio", tier:3, precio:120 },
  { id:"M-03", nombre:"Representantes e Inversionistas", cat:"Migratorio", tier:2, precio:90 },
  { id:"M-04", nombre:"Cumplimiento INM", cat:"Migratorio", tier:1, precio:60 },
  { id:"M-05", nombre:"Extranjeros en Nómina", cat:"Migratorio", tier:2, precio:90 },

  { id:"CON-01", nombre:"Constitución y Régimen de Condominio", cat:"Condominal", tier:1, precio:90 },
  { id:"CON-02", nombre:"Administración y Asambleas", cat:"Condominal", tier:1, precio:90 },
  { id:"CON-03", nombre:"Reglamento Interno", cat:"Condominal", tier:1, precio:90 },
  { id:"CON-04", nombre:"Cuotas y Fondo de Reserva", cat:"Condominal", tier:1, precio:90 },
  { id:"CON-05", nombre:"Conflictos entre Condóminos", cat:"Condominal", tier:1, precio:90 },
  { id:"PP-01", nombre:"Blindaje de Activos", cat:"Protección Patrimonial", tier:2, precio:120 },
  { id:"PP-02", nombre:"Holding y Estructuras Corporativas", cat:"Protección Patrimonial", tier:3, precio:150 },
  { id:"PP-03", nombre:"Financiamiento y Garantías", cat:"Protección Patrimonial", tier:2, precio:120 },
  { id:"PP-04", nombre:"Crisis y Reestructura de Deuda", cat:"Protección Patrimonial", tier:3, precio:150 },
  { id:"CE-01", nombre:"Antilavado LFPIORPI", cat:"Cumplimiento Especializado", tier:2, precio:120 },
  { id:"CE-02", nombre:"Protección al Consumidor", cat:"Cumplimiento Especializado", tier:1, precio:90 },
  { id:"CE-03", nombre:"Responsabilidad Ambiental Corporativa", cat:"Cumplimiento Especializado", tier:2, precio:120 },
  { id:"CE-04", nombre:"Seguridad e Higiene STPS", cat:"Cumplimiento Especializado", tier:1, precio:90 },
  { id:"INM-01", nombre:"Due Diligence Inmobiliario", cat:"Inmobiliario", tier:2, precio:120 },
  { id:"INM-02", nombre:"Desarrollo y Construcción", cat:"Inmobiliario", tier:2, precio:120 },
  { id:"INM-03", nombre:"Arrendamiento Comercial e Industrial", cat:"Inmobiliario", tier:1, precio:90 },
  { id:"INM-04", nombre:"Fideicomisos Inmobiliarios", cat:"Inmobiliario", tier:3, precio:150 },
  { id:"INM-05", nombre:"Regularización y Conflictos de Propiedad", cat:"Inmobiliario", tier:2, precio:120 },
  { id:"SC-01", nombre:"Regulación COFEPRIS", cat:"Salud", tier:2, precio:120 },
  { id:"SC-02", nombre:"Dispositivos Médicos y Farma", cat:"Salud", tier:3, precio:150 },
  { id:"SC-03", nombre:"Clínicas y Hospitales Privados", cat:"Salud", tier:2, precio:120 },
  { id:"SC-04", nombre:"Telemedicina y Salud Digital", cat:"Salud", tier:2, precio:120 },
  { id:"EN-01", nombre:"Contratos de Energía y CFE", cat:"Energía", tier:1, precio:90 },
  { id:"EN-02", nombre:"Energías Renovables", cat:"Energía", tier:2, precio:120 },
  { id:"EN-03", nombre:"Impacto Ambiental SEMARNAT", cat:"Energía", tier:2, precio:120 },
  { id:"EN-04", nombre:"Responsabilidad Ambiental", cat:"Energía", tier:2, precio:120 },
  { id:"TD-01", nombre:"Contratos de Desarrollo de Software", cat:"Tecnología", tier:1, precio:90 },
  { id:"TD-02", nombre:"Inteligencia Artificial y Algoritmos", cat:"Tecnología", tier:2, precio:120 },
  { id:"TD-03", nombre:"Ciberseguridad Legal", cat:"Tecnología", tier:2, precio:120 },
  { id:"TD-04", nombre:"Fintech y Regulación CNBV/Banxico", cat:"Tecnología", tier:3, precio:150 },
  { id:"AG-01", nombre:"Contratos Agroindustriales", cat:"Agroindustria", tier:1, precio:90 },
  { id:"AG-02", nombre:"Denominaciones de Origen", cat:"Agroindustria", tier:2, precio:120 },
  { id:"AG-03", nombre:"Regulación de Alimentos COFEPRIS", cat:"Agroindustria", tier:2, precio:120 },
  { id:"AG-04", nombre:"Exportación Agroalimentaria", cat:"Agroindustria", tier:2, precio:120 },
  { id:"EM-01", nombre:"Producción y Distribución", cat:"Entretenimiento", tier:2, precio:120 },
  { id:"EM-02", nombre:"Derechos de Autor y Licencias", cat:"Entretenimiento", tier:2, precio:120 },
  { id:"EM-03", nombre:"Influencers y Marketing Digital", cat:"Entretenimiento", tier:1, precio:90 },
  { id:"EM-04", nombre:"Deportes y Patrocinios", cat:"Entretenimiento", tier:2, precio:120 },
];

const TIER_COLORS = { 0:{bg:"#E8F0E8",color:"#4A5C45",label:"Base"}, 1:{bg:"#E6F3FA",color:"#2E6B8A",label:"Basico +$60"}, 2:{bg:"#FAF3E6",color:"#8A6B2E",label:"Avanzado +$90"}, 3:{bg:"#F3E6FA",color:"#7A2E6B",label:"Premium +$120"} };

// ─── CATÁLOGO DE DOCUMENTOS Y CHECKLIST POR MÓDULO ──────────────────────────
const MODULO_DOCS = {
  "L-01": {
    docs: [
      {id:"contrato_individual",label:"Contrato Individual de Trabajo",requerido:true,desc:"Firmado por trabajador y patrón"},
      {id:"contrato_colectivo",label:"Contrato Colectivo de Trabajo",requerido:false,desc:"Si aplica sindicato"},
      {id:"contrato_confianza",label:"Contrato Empleado de Confianza",requerido:false,desc:"Para puestos directivos"},
      {id:"contrato_temporal",label:"Contrato por Obra o Tiempo Determinado",requerido:false,desc:"Debe justificar temporalidad"},
      {id:"aviso_alta_imss",label:"Aviso de Alta IMSS",requerido:true,desc:"Dentro de los primeros 5 días"},
      {id:"alta_infonavit",label:"Alta INFONAVIT",requerido:true,desc:"Al inicio de la relación laboral"},
      {id:"comprobante_ndiscriminacion",label:"Política de No Discriminación",requerido:true,desc:"NOM-135 obligatoria"},
    ],
    checklist: [
      {id:"salario_min",label:"Salario igual o superior al mínimo vigente",riesgo:"alto"},
      {id:"jornada_maxima",label:"Jornada no excede máximos legales (8/7/6 hrs)",riesgo:"alto"},
      {id:"periodo_vacacional",label:"Vacaciones conforme a tabla LFT vigente",riesgo:"medio"},
      {id:"aguinaldo",label:"Aguinaldo mínimo 15 días por año",riesgo:"alto"},
      {id:"prima_vacacional",label:"Prima vacacional mínima 25%",riesgo:"medio"},
      {id:"imss_alta",label:"100% trabajadores dados de alta en IMSS",riesgo:"critico"},
      {id:"nomina_digital",label:"Nómina timbrada con CFDI",riesgo:"alto"},
      {id:"ptl_derechos",label:"Trabajadores conocen sus derechos (cartilla)",riesgo:"bajo"},
    ],
    riesgos: [
      {label:"Demanda laboral por despido injustificado",impacto:"3 meses + 20 días/año + partes proporcionales",nivel:"critico"},
      {label:"Multa STPS por incumplimiento de contrato",impacto:"$318 a $3,180 UMAs por trabajador afectado",nivel:"alto"},
      {label:"Créditos IMSS por omisión de alta",impacto:"Cuotas + recargos + multas desde inicio de relación laboral",nivel:"critico"},
      {label:"Pérdida de deducibilidad de nómina",impacto:"Rechazo de CFDI y ajuste fiscal en declaración anual",nivel:"alto"},
    ]
  },
  "L-02": {
    docs: [
      {id:"rit_vigente",label:"Reglamento Interior de Trabajo vigente",requerido:true,desc:"Depositado ante STPS o JLCA"},
      {id:"rit_deposito",label:"Constancia de depósito ante autoridad",requerido:true,desc:"Sello de recibido de la autoridad"},
      {id:"rit_difusion",label:"Acuse de difusión a trabajadores",requerido:true,desc:"Lista de asistencia o firma de conocimiento"},
      {id:"nom035_politica",label:"Política de prevención NOM-035",requerido:true,desc:"Firmada por representante legal"},
      {id:"nom035_evaluacion",label:"Evaluación del entorno organizacional",requerido:false,desc:"Requerida si más de 50 trabajadores"},
    ],
    checklist: [
      {id:"deposito_stps",label:"Depositado ante STPS o Junta de Conciliación",riesgo:"alto"},
      {id:"horas_extras",label:"Regulación de tiempo extra y pago correspondiente",riesgo:"medio"},
      {id:"sanciones",label:"Régimen disciplinario y sanciones documentado",riesgo:"medio"},
      {id:"nom035",label:"Incluye política NOM-035",riesgo:"alto"},
      {id:"actualizacion",label:"Actualizado en los últimos 2 años",riesgo:"medio"},
      {id:"modalidad_trabajo",label:"Contempla teletrabajo si aplica (NOM-037)",riesgo:"medio"},
      {id:"acoso",label:"Protocolo contra acoso y hostigamiento",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Sin RIT no se pueden aplicar sanciones disciplinarias",impacto:"Reinstalación forzosa en despido disciplinario",nivel:"critico"},
      {label:"Multa por ausencia de RIT",impacto:"$636 a $6,360 UMAs por inspección STPS",nivel:"alto"},
      {label:"Incumplimiento NOM-035",impacto:"Multa $318 a $3,180 UMAs + contingencia laboral",nivel:"alto"},
    ]
  },
  "L-03": {
    docs: [
      {id:"registro_repse",label:"Registro REPSE vigente",requerido:true,desc:"Portal del IMSS — renovación anual"},
      {id:"contrato_servicios",label:"Contrato de prestación de servicios especializados",requerido:true,desc:"Con cada contratante"},
      {id:"comprobante_imss",label:"Comprobantes de pago IMSS mensuales",requerido:true,desc:"Compartir con contratante dentro de 5 días"},
      {id:"comprobante_infonavit",label:"Comprobantes de pago INFONAVIT mensuales",requerido:true,desc:"Compartir con contratante dentro de 5 días"},
      {id:"sipare_informe",label:"Informe mensual SIPARE al IMSS",requerido:true,desc:"Primeros 17 días de cada mes"},
    ],
    checklist: [
      {id:"registro_activo",label:"Registro REPSE activo y vigente",riesgo:"critico"},
      {id:"objeto_social",label:"Objeto social acotado a servicios especializados",riesgo:"alto"},
      {id:"contratos_firmados",label:"Contratos firmados con todos los contratantes",riesgo:"alto"},
      {id:"informes_sipare",label:"Informes SIPARE presentados en tiempo",riesgo:"alto"},
      {id:"comprobantes_compartidos",label:"Comprobantes compartidos con contratante mensualmente",riesgo:"medio"},
      {id:"iva_retencion",label:"IVA retenido y enterado correctamente",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Sin REPSE el contratante no puede deducir ni acreditar IVA",impacto:"Rechazo de CFDI — pérdida total de deducción",nivel:"critico"},
      {label:"Multa por no presentar informe SIPARE",impacto:"$3,180 a $6,360 UMAs por incumplimiento",nivel:"alto"},
      {label:"Solidaridad en obligaciones laborales del contratante",impacto:"Responsabilidad solidaria ilimitada ante IMSS",nivel:"critico"},
    ]
  },
  "L-04": {
    docs: [
      {id:"finiquito_firmado",label:"Finiquito firmado ante testigos",requerido:true,desc:"O ante Junta de Conciliación y Arbitraje"},
      {id:"convenio_terminacion",label:"Convenio de terminación ratificado",requerido:false,desc:"Ante JLCA para mayor certeza jurídica"},
      {id:"calculo_liquidacion",label:"Cálculo de liquidación documentado",requerido:true,desc:"Con desglose de todos los conceptos LFT"},
      {id:"aviso_baja_imss",label:"Aviso de baja IMSS",requerido:true,desc:"Dentro de los 5 días siguientes"},
      {id:"baja_infonavit",label:"Baja INFONAVIT",requerido:true,desc:"Al término de la relación laboral"},
      {id:"carta_no_adeudo",label:"Carta de no adeudo o finiquito total",requerido:false,desc:"Recomendable para evitar reclamaciones futuras"},
    ],
    checklist: [
      {id:"conceptos_completos",label:"Incluye todos los conceptos: 3 meses + 20 días/año + partes proporcionales",riesgo:"critico"},
      {id:"prima_antiguedad",label:"Prima de antigüedad incluida si aplica",riesgo:"alto"},
      {id:"baja_seguridad_social",label:"Baja en IMSS e INFONAVIT en tiempo",riesgo:"alto"},
      {id:"convenio_jlca",label:"Convenio ratificado ante JLCA (mayor protección)",riesgo:"medio"},
      {id:"carta_no_reinstalacion",label:"Trabajador elige no reinstalación expresamente",riesgo:"alto"},
      {id:"cfdi_nomina_finiquito",label:"CFDI de nómina final timbrado",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Demanda por liquidación incompleta",impacto:"Pago de diferencias + salarios caídos desde despido",nivel:"critico"},
      {label:"Nulidad de finiquito por vicios",impacto:"Finiquito sin valor — proceso como si no hubiera terminación",nivel:"alto"},
      {label:"Multa por no dar baja en IMSS",impacto:"Cuotas posteriores + recargos desde fecha de baja real",nivel:"alto"},
    ]
  },
  "L-05": {
    docs: [
      {id:"expediente_juicio",label:"Expediente del juicio laboral",requerido:true,desc:"Número, juzgado, fecha de inicio"},
      {id:"contestacion_demanda",label:"Contestación de demanda",requerido:true,desc:"Firmada y presentada en tiempo"},
      {id:"pruebas_ofrecidas",label:"Pruebas documentales ofrecidas",requerido:true,desc:"Contrato, recibos, asistencia, etc."},
      {id:"poder_litigios",label:"Poder notarial para pleitos y cobranzas",requerido:true,desc:"A favor del abogado litigante"},
      {id:"provision_contable",label:"Provisión contable registrada",requerido:false,desc:"Recomendado si probabilidad alta"},
    ],
    checklist: [
      {id:"abogado_designado",label:"Abogado litigante designado con poder vigente",riesgo:"critico"},
      {id:"contestacion_tiempo",label:"Contestación de demanda presentada en tiempo",riesgo:"critico"},
      {id:"pruebas_resguardadas",label:"Pruebas documentales resguardadas y organizadas",riesgo:"alto"},
      {id:"provision_registrada",label:"Provisión contable registrada (NIF C-9)",riesgo:"medio"},
      {id:"seguro_riesgo",label:"Seguro de responsabilidad laboral contratado",riesgo:"bajo"},
      {id:"audiencias_seguimiento",label:"Seguimiento puntual de audiencias y actuaciones",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Condena en rebeldía por falta de contestación",impacto:"Todas las prestaciones demandadas concedidas automáticamente",nivel:"critico"},
      {label:"Prescripción de defensas por falta de pruebas",impacto:"Pérdida de excepciones y defensas disponibles",nivel:"alto"},
      {label:"Embargo de cuentas por condena no provisionada",impacto:"Paralización operativa — embargo preventivo de activos",nivel:"critico"},
    ]
  },
  "L-06": {
    docs: [
      {id:"politica_nom035",label:"Política de prevención de riesgos psicosociales",requerido:true,desc:"Firmada y difundida — todas las empresas"},
      {id:"cuestionario_factores",label:"Cuestionario de identificación de factores de riesgo",requerido:false,desc:"Obligatorio si más de 50 trabajadores"},
      {id:"evaluacion_entorno",label:"Evaluación del entorno organizacional (anual)",requerido:false,desc:"Obligatorio si más de 50 trabajadores"},
      {id:"plan_accion",label:"Plan de acción con medidas correctivas",requerido:false,desc:"Si se identificaron factores de riesgo"},
      {id:"registro_difusion",label:"Registro de difusión a trabajadores",requerido:true,desc:"Lista de asistencia o firma de recibido"},
      {id:"nom037_politica",label:"Política de teletrabajo NOM-037",requerido:false,desc:"Si hay trabajadores en home office"},
    ],
    checklist: [
      {id:"politica_vigente",label:"Política NOM-035 vigente y difundida",riesgo:"alto"},
      {id:"evaluacion_anual",label:"Evaluación del entorno realizada en el último año",riesgo:"medio"},
      {id:"factores_identificados",label:"Factores de riesgo identificados y documentados",riesgo:"medio"},
      {id:"medidas_implementadas",label:"Medidas de control implementadas",riesgo:"medio"},
      {id:"protocolo_acoso",label:"Protocolo contra acoso y hostigamiento vigente",riesgo:"alto"},
      {id:"canal_denuncia",label:"Canal de denuncia confidencial disponible",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Multa por incumplimiento NOM-035",impacto:"$318 a $3,180 UMAs por inspección STPS",nivel:"alto"},
      {label:"Demanda por acoso laboral no prevenido",impacto:"Indemnización + daño moral — responsabilidad solidaria del patrón",nivel:"critico"},
      {label:"Contingencia laboral masiva por clima tóxico",impacto:"Rescisión por responsabilidad del patrón (art. 51 LFT)",nivel:"alto"},
    ]
  },
  "L-07": {
    docs: [
      {id:"registro_patronal",label:"Registro patronal IMSS vigente",requerido:true,desc:"Para cada centro de trabajo"},
      {id:"sua_pagos",label:"Comprobantes de pago SUA (últimos 3 meses)",requerido:true,desc:"Bimestral para cuotas IMSS"},
      {id:"infonavit_pagos",label:"Comprobantes de pago INFONAVIT",requerido:true,desc:"Bimestral — aportaciones vivienda"},
      {id:"dictamen_imss",label:"Dictamen IMSS (si aplica)",requerido:false,desc:"Empresas con más de 300 trabajadores"},
      {id:"tabla_salarios",label:"Tabla de salarios integrados",requerido:true,desc:"Actualizada con percepciones variables"},
      {id:"clasificacion_riesgo",label:"Clasificación de riesgo de trabajo IMSS",requerido:true,desc:"Declaración anual en febrero"},
    ],
    checklist: [
      {id:"altas_tiempo",label:"Altas y bajas IMSS presentadas en tiempo (5 días)",riesgo:"critico"},
      {id:"salario_integrado",label:"Salario integrado calculado correctamente",riesgo:"alto"},
      {id:"cuotas_pagadas",label:"Cuotas patronales y obreras pagadas en tiempo",riesgo:"alto"},
      {id:"prima_rt",label:"Prima de riesgo de trabajo actualizada anualmente",riesgo:"medio"},
      {id:"infonavit_creditos",label:"Descuentos de créditos INFONAVIT aplicados",riesgo:"alto"},
      {id:"sua_conciliado",label:"SUA conciliado con nómina mensualmente",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Créditos IMSS por omisión o subregistro salarial",impacto:"Diferencias de cuotas + 5 años hacia atrás + recargos",nivel:"critico"},
      {label:"Embargo por adeudos IMSS o INFONAVIT",impacto:"Bloqueo de cuentas bancarias y embargo de activos",nivel:"critico"},
      {label:"Multa por alta extemporánea",impacto:"$1,272 a $2,544 UMAs por trabajador",nivel:"alto"},
    ]
  },
  "L-08": {
    docs: [
      {id:"contrato_directivo",label:"Contrato individual de trabajo directivo",requerido:true,desc:"Con cláusulas de confianza específicas"},
      {id:"acuerdo_confidencialidad",label:"Acuerdo de confidencialidad (NDA)",requerido:true,desc:"Información estratégica y secretos industriales"},
      {id:"no_competencia",label:"Pacto de no competencia post-empleo",requerido:false,desc:"6 a 24 meses — requiere contraprestación"},
      {id:"plan_compensacion",label:"Plan de compensación variable documentado",requerido:false,desc:"Bonos, comisiones, opciones sobre acciones"},
      {id:"acuerdo_permanencia",label:"Acuerdo de permanencia mínima",requerido:false,desc:"Con penalidad si hay renuncia anticipada"},
      {id:"propiedad_intelectual",label:"Cesión de derechos de propiedad intelectual",requerido:true,desc:"Toda creación durante el empleo es del patrón"},
      {id:"plan_sucesion",label:"Plan de sucesión del puesto",requerido:false,desc:"Recomendable para C-Suite"},
    ],
    checklist: [
      {id:"contrato_confianza",label:"Contrato refleja carácter de confianza (no aplicable LFT sindical)",riesgo:"alto"},
      {id:"nda_firmado",label:"NDA firmado y con alcance definido",riesgo:"alto"},
      {id:"no_comp_remunerado",label:"No competencia tiene contraprestación económica",riesgo:"medio"},
      {id:"pi_cedida",label:"Propiedad intelectual cedida expresamente",riesgo:"alto"},
      {id:"severance_pactado",label:"Severance y condiciones de salida pactadas",riesgo:"medio"},
      {id:"plan_variable_doc",label:"Plan variable documentado y auditado",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Fuga de información estratégica sin NDA",impacto:"Sin acción legal disponible — pérdida de ventaja competitiva",nivel:"critico"},
      {label:"No competencia nula por falta de contraprestación",impacto:"Directivo puede trabajar para competidor inmediatamente",nivel:"alto"},
      {label:"Demanda por bonus o comisiones no documentadas",impacto:"Pasivo laboral no provisionado — salarios caídos",nivel:"alto"},
    ]
  },

  "F-01": {
    docs: [
      {id:"constancia_situacion",label:"Constancia de Situación Fiscal",requerido:true,desc:"Vigente — máximo 3 meses de antigüedad"},
      {id:"opinion_cumplimiento",label:"Opinión de Cumplimiento SAT (32-D)",requerido:true,desc:"Positiva — renovar mensualmente"},
      {id:"cedula_identificacion",label:"Cédula de Identificación Fiscal",requerido:true,desc:"RFC con homoclave"},
      {id:"acuse_declaracion_anual",label:"Acuse declaración anual ISR",requerido:true,desc:"Último ejercicio fiscal"},
      {id:"acuse_declaraciones_mensuales",label:"Acuses declaraciones mensuales (últimos 3)",requerido:true,desc:"IVA, ISR retenciones"},
      {id:"boletin_buzon",label:"Confirmación buzón tributario activo",requerido:true,desc:"Correo electrónico registrado en SAT"},
    ],
    checklist: [
      {id:"rfc_activo",label:"RFC activo y sin restricciones",riesgo:"critico"},
      {id:"opinion_positiva",label:"Opinión de cumplimiento positiva (32-D)",riesgo:"critico"},
      {id:"buzon_activo",label:"Buzón tributario activo con correo vigente",riesgo:"alto"},
      {id:"efirma_vigente",label:"e.firma vigente (no vencida)",riesgo:"critico"},
      {id:"csd_vigente",label:"CSD (sellos digitales) vigentes",riesgo:"critico"},
      {id:"declaraciones_al_corriente",label:"Declaraciones mensuales al corriente",riesgo:"alto"},
      {id:"declaracion_anual",label:"Declaración anual presentada en tiempo",riesgo:"alto"},
      {id:"domicilio_fiscal",label:"Domicilio fiscal localizado y actualizado",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Cancelación de CSD por incumplimiento",impacto:"Imposibilidad de timbrar facturas — paralización de operaciones",nivel:"critico"},
      {label:"Restricción temporal del RFC",impacto:"Sin comprobantes fiscales válidos mientras dure la restricción",nivel:"critico"},
      {label:"Pérdida de contratos con gobierno",impacto:"Opinión negativa impide participar en licitaciones y contratos",nivel:"alto"},
      {label:"Multa por buzón tributario inactivo",impacto:"$3,390 a $9,380 pesos — notificaciones no recibidas tienen efectos legales",nivel:"alto"},
    ]
  },
  "F-02": {
    docs: [
      {id:"csd_certificados",label:"Certificados de Sello Digital (CSD)",requerido:true,desc:"Archivo .cer y .key vigentes"},
      {id:"pac_contrato",label:"Contrato con PAC autorizado",requerido:true,desc:"Proveedor Autorizado de Certificación"},
      {id:"addenda_clientes",label:"Addendas requeridas por clientes",requerido:false,desc:"Walmart, OXXO, Pemex, gobierno"},
      {id:"complementos_especiales",label:"Complementos CFDI especiales",requerido:false,desc:"Nómina, pagos, carta porte, etc."},
      {id:"politica_cancelacion",label:"Política interna de cancelación de CFDI",requerido:false,desc:"Procedimiento documentado"},
    ],
    checklist: [
      {id:"csd_vigentes",label:"CSD vigentes con más de 30 días antes de vencer",riesgo:"critico"},
      {id:"pac_activo",label:"PAC activo y con servicio vigente",riesgo:"alto"},
      {id:"cfdi_version",label:"CFDI versión 4.0 (obligatoria desde 2023)",riesgo:"alto"},
      {id:"datos_receptor",label:"Datos del receptor validados (RFC, nombre, domicilio)",riesgo:"medio"},
      {id:"complemento_nomina",label:"Complemento de nómina 1.2 en recibos de pago",riesgo:"alto"},
      {id:"cancelacion_correcta",label:"Cancelaciones con motivo correcto y aceptación del receptor",riesgo:"medio"},
      {id:"carta_porte",label:"Carta porte en traslados de mercancías si aplica",riesgo:"alto"},
    ],
    riesgos: [
      {label:"CSD vencido — facturas sin validez fiscal",impacto:"CFDI rechazados — clientes no pueden deducir",nivel:"critico"},
      {label:"Multa por CFDI con datos incorrectos",impacto:"$1,130 a $3,390 por comprobante",nivel:"alto"},
      {label:"Rechazo de nómina por complemento incorrecto",impacto:"Nómina no deducible — ajuste fiscal",nivel:"alto"},
      {label:"Infracción por falta de carta porte",impacto:"$23,000 a $76,000 por operación — retención de mercancía",nivel:"critico"},
    ]
  },
  "F-03": {
    docs: [
      {id:"oficio_inicio_auditoria",label:"Oficio de inicio de auditoría o revisión",requerido:false,desc:"Notificación del SAT"},
      {id:"requerimiento_sat",label:"Requerimiento(s) del SAT con acuse",requerido:false,desc:"Guardar todos con fecha de recepción"},
      {id:"respuesta_requerimiento",label:"Respuesta(s) al requerimiento",requerido:false,desc:"Con acuse de presentación"},
      {id:"recurso_revocacion",label:"Recurso de revocación interpuesto",requerido:false,desc:"Plazo: 30 días hábiles"},
      {id:"demanda_nulidad",label:"Demanda de nulidad ante TFJA",requerido:false,desc:"Plazo: 30 días hábiles"},
      {id:"acuerdo_conclusivo",label:"Solicitud de acuerdo conclusivo PRODECON",requerido:false,desc:"Antes de que se emita la resolución"},
      {id:"garantia_interes_fiscal",label:"Garantía del interés fiscal",requerido:false,desc:"Para suspender ejecución"},
    ],
    checklist: [
      {id:"abogado_fiscal",label:"Abogado fiscal designado con poder vigente",riesgo:"critico"},
      {id:"plazos_controlados",label:"Plazos de respuesta controlados y en calendario",riesgo:"critico"},
      {id:"documentacion_organizada",label:"Documentación soporte organizada por ejercicio",riesgo:"alto"},
      {id:"contabilidad_electronica",label:"Contabilidad electrónica enviada al SAT",riesgo:"alto"},
      {id:"provision_contable",label:"Provisión contable del contingente registrada",riesgo:"medio"},
      {id:"prodecon_notificado",label:"PRODECON notificado si hay irregularidades",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Determinación firme por no contestar en tiempo",impacto:"Crédito fiscal exigible — embargo inmediato de cuentas",nivel:"critico"},
      {label:"Preclusión de pruebas y argumentos",impacto:"Pérdida de defensas disponibles en etapas posteriores",nivel:"alto"},
      {label:"Embargo de cuentas bancarias",impacto:"Paralización operativa — hasta que se garantice o pague",nivel:"critico"},
      {label:"Publicación en lista negra 69-B",impacto:"Socios y clientes no pueden deducir operaciones",nivel:"critico"},
    ]
  },
  "F-04": {
    docs: [
      {id:"estudio_pt",label:"Estudio de precios de transferencia",requerido:true,desc:"Elaborado por especialista — vigencia anual"},
      {id:"declaracion_disif",label:"Declaración informativa DISIF",requerido:true,desc:"Presentar en marzo del ejercicio siguiente"},
      {id:"contratos_partes_relacionadas",label:"Contratos con partes relacionadas",requerido:true,desc:"Por cada operación intercompañía"},
      {id:"analisis_comparabilidad",label:"Análisis de comparabilidad",requerido:true,desc:"Parte del estudio de PT"},
      {id:"documentacion_local",label:"Documentación local (Local File)",requerido:false,desc:"Obligatoria si ingresos mayores a $900M"},
      {id:"reporte_pais_por_pais",label:"Reporte país por país (CbCR)",requerido:false,desc:"Grupos multinacionales con ingresos mayores a 12,000 MDP"},
    ],
    checklist: [
      {id:"estudio_vigente",label:"Estudio de PT vigente para el ejercicio actual",riesgo:"critico"},
      {id:"metodo_correcto",label:"Método de PT aplicado correctamente (PCNC, PRL, PC, etc.)",riesgo:"alto"},
      {id:"disif_presentada",label:"DISIF presentada en tiempo",riesgo:"alto"},
      {id:"contratos_formalizados",label:"Contratos intercompañía formalizados y vigentes",riesgo:"alto"},
      {id:"tasas_arm",label:"Tasas y condiciones en rango de mercado (arm's length)",riesgo:"critico"},
      {id:"regalias_documentadas",label:"Regalías y servicios intragrupo documentados",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Ajuste de precios de transferencia por SAT",impacto:"ISR adicional + multas + recargos sobre diferencia ajustada",nivel:"critico"},
      {label:"Multa por no presentar DISIF",impacto:"$157,100 a $220,700 pesos",nivel:"alto"},
      {label:"Presunción de REFIPRES por operaciones con paraísos fiscales",impacto:"Tributación en México al 40% sobre ingresos presuntos",nivel:"critico"},
    ]
  },
  "F-05": {
    docs: [
      {id:"estructura_corporativa",label:"Organigrama fiscal del grupo",requerido:true,desc:"Con regímenes fiscales de cada entidad"},
      {id:"decreto_aplicado",label:"Decretos o estímulos fiscales aplicados",requerido:false,desc:"Con documentación soporte"},
      {id:"convenios_doble_tributacion",label:"Certificados de residencia fiscal extranjera",requerido:false,desc:"Para aplicar tratados contra doble tributación"},
      {id:"nif_c9_provision",label:"Nota de impuestos diferidos (NIF C-9/D-4)",requerido:false,desc:"Para grupos con revisión de auditor externo"},
    ],
    checklist: [
      {id:"regimen_optimo",label:"Régimen fiscal óptimo para cada entidad del grupo",riesgo:"alto"},
      {id:"perdidas_fiscales",label:"Pérdidas fiscales amortizadas correctamente (10 años)",riesgo:"alto"},
      {id:"cufin_cufinre",label:"CUFIN y CUFINRE actualizadas",riesgo:"medio"},
      {id:"dividendos_planificados",label:"Distribución de dividendos planificada fiscalmente",riesgo:"medio"},
      {id:"estimulos_aplicados",label:"Estímulos fiscales aplicados correctamente",riesgo:"alto"},
      {id:"holding_estructura",label:"Estructura holding optimizada para patrimonio",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Pérdida de pérdidas fiscales por caducidad",impacto:"Pérdida del beneficio de amortización a los 10 años",nivel:"alto"},
      {label:"ISR adicional por distribución no planificada",impacto:"UFIN negativa genera ISR corporativo del 30%",nivel:"alto"},
      {label:"Rechazo de estímulos por requisitos incumplidos",impacto:"Reintegro del estímulo + recargos + multas",nivel:"alto"},
    ]
  },
  "F-06": {
    docs: [
      {id:"padron_importadores",label:"Padrón de importadores activo",requerido:true,desc:"Renovación anual en SAT"},
      {id:"padron_sectores",label:"Padrón de importadores sectores específicos",requerido:false,desc:"Acero, textil, calzado, etc."},
      {id:"certificacion_iva_ieps",label:"Certificación IVA/IEPS (IMMEX)",requerido:false,desc:"Para empresas con programa IMMEX"},
      {id:"programa_immex",label:"Programa IMMEX vigente",requerido:false,desc:"Resolución de SE"},
      {id:"agente_aduanal",label:"Contrato con agente aduanal",requerido:true,desc:"Patente vigente y contrato actualizado"},
    ],
    checklist: [
      {id:"padron_activo",label:"Padrón de importadores activo y sin restricciones",riesgo:"critico"},
      {id:"fracciones_correctas",label:"Fracciones arancelarias correctas en pedimentos",riesgo:"alto"},
      {id:"reglas_origen",label:"Reglas de origen cumplidas para preferencias arancelarias",riesgo:"medio"},
      {id:"valor_aduana",label:"Valor en aduana declarado correctamente",riesgo:"alto"},
      {id:"iva_exportacion",label:"IVA en exportaciones a tasa 0% aplicado",riesgo:"medio"},
      {id:"devolucion_iva",label:"Solicitudes de devolución IVA presentadas en tiempo",riesgo:"medio"},
    ],
    riesgos: [
      {label:"Suspensión del padrón de importadores",impacto:"Imposibilidad de importar — paralización de cadena de suministro",nivel:"critico"},
      {label:"Clasificación arancelaria incorrecta",impacto:"Diferencias de impuestos + multas + posible penal aduanero",nivel:"alto"},
      {label:"Pérdida de beneficios IMMEX",impacto:"Pago de IVA e IEPS suspendidos + actualización y recargos",nivel:"critico"},
    ]
  },
  "F-07": {
    docs: [
      {id:"diot_presentadas",label:"DIOT (últimas 3 presentaciones)",requerido:true,desc:"Declaración de operaciones con terceros"},
      {id:"disif_informativa",label:"DISIF presentada",requerido:false,desc:"Si hay partes relacionadas"},
      {id:"dgin_informativa",label:"DGIN presentada",requerido:false,desc:"Si hay ingresos de fuente de riqueza extranjera"},
      {id:"lfpiorpi_reportes",label:"Reportes LFPIORPI presentados",requerido:false,desc:"Si realiza actividades vulnerables"},
      {id:"acuse_presentacion",label:"Acuses de presentación de informativas",requerido:true,desc:"Guardar todos con fecha"},
    ],
    checklist: [
      {id:"diot_mensual",label:"DIOT presentada mensualmente (día 17)",riesgo:"alto"},
      {id:"proveedores_rfcs",label:"RFC de todos los proveedores validado en SAT",riesgo:"medio"},
      {id:"actividades_vulnerables",label:"Actividades vulnerables identificadas y reportadas",riesgo:"critico"},
      {id:"operaciones_relevantes",label:"Operaciones relevantes reportadas a SAT",riesgo:"alto"},
      {id:"disif_partes",label:"DISIF con partes relacionadas presentada en tiempo",riesgo:"alto"},
    ],
    riesgos: [
      {label:"Multa por no presentar DIOT",impacto:"$15,950 a $154,530 pesos por declaración",nivel:"alto"},
      {label:"Omisión de reporte LFPIORPI",impacto:"Multa de $500,000 a $5,000,000 pesos o clausura",nivel:"critico"},
      {label:"Inconsistencias entre DIOT y declaraciones mensuales",impacto:"Revisión del SAT y posible crédito fiscal",nivel:"alto"},
    ]
  },
  "F-08": {
    docs: [
      {id:"estados_cuenta_extranjeros",label:"Estados de cuenta en el extranjero",requerido:false,desc:"FATCA/CRS — reporte al SAT"},
      {id:"certificado_residencia",label:"Certificados de residencia fiscal del extranjero",requerido:false,desc:"Para aplicar tratados"},
      {id:"contrato_credito_extranjero",label:"Contratos de crédito con partes extranjeras",requerido:false,desc:"Para deducción de intereses"},
      {id:"thin_cap_calculo",label:"Cálculo de capitalización delgada",requerido:false,desc:"Si hay deuda con partes relacionadas extranjeras"},
    ],
    checklist: [
      {id:"retenciones_extranjeros",label:"Retenciones ISR a residentes en el extranjero aplicadas",riesgo:"critico"},
      {id:"tratados_aplicados",label:"Tratados para evitar doble tributación aplicados correctamente",riesgo:"alto"},
      {id:"fatca_crs",label:"Cumplimiento FATCA y CRS si aplica",riesgo:"alto"},
      {id:"thin_capitalization",label:"Capitalización delgada monitoreada (3:1)",riesgo:"alto"},
      {id:"precios_transferencia_ext",label:"Operaciones con extranjeros a precios de mercado",riesgo:"critico"},
    ],
    riesgos: [
      {label:"Omisión de retención a residentes en el extranjero",impacto:"ISR omitido enteramente a cargo del pagador + recargos + multas",nivel:"critico"},
      {label:"Rechazo de deducción de intereses por thin cap",impacto:"Ajuste fiscal + ISR adicional sobre intereses no deducibles",nivel:"alto"},
      {label:"Incumplimiento FATCA",impacto:"Sanciones del IRS y restricciones bancarias internacionales",nivel:"alto"},
    ]
  },
  ...ARBITRAJE_DOCS,
  ...CORPORATIVO_DOCS,
  ...OPERATIVO_DOCS,...FISCAL_DOCS,
  ...MIGRATORIO_DOCS};

const RIESGO_COLORS = {
  critico:{bg:"#FEF2F2",color:"#991B1B",label:"Crítico"},
  alto:{bg:"#FFF7ED",color:"#9A3412",label:"Alto"},
  medio:{bg:"#FFFBEB",color:"#92400E",label:"Medio"},
  bajo:{bg:"#F0FDF4",color:"#166534",label:"Bajo"},
};
const MODULOS_CATS = ["Base","Corporativo","Laboral","Fiscal","Arbitraje","Operativo","Migratorio","Condominal","Protección Patrimonial","Cumplimiento Especializado","Inmobiliario","Salud","Energía","Tecnología","Agroindustria","Entretenimiento"];

async function logActividad(client, adminNombre, tipo, descripcion, modulo=null, metadata={}){
  try{
    await supabase.from("actividad_log").insert({
      client_id:client.id,
      sociedad_id:client._sociedad?.id||null,
      admin_nombre:adminNombre||"Despacho M&M",
      tipo,
      modulo,
      descripcion,
      metadata,
    });
  }catch(e){console.error("logActividad error:",e);}
}

function ModulosSelector({clientId, modulosActivos=[], onChange}){
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState(new Set(modulosActivos));
  const [saving,setSaving]=useState(false);

  const totalMensual=600+Array.from(selected).reduce((sum,id)=>{
    const m=MODULOS_CATALOG.find(x=>x.id===id);
    return sum+(m?.precio||0);
  },0);

  async function save(){
    setSaving(true);
    const arr=Array.from(selected);
    await supabase.from("clients").update({modulos:arr}).eq("id",clientId);
    onChange(arr);
    setSaving(false);
    setOpen(false);
  }

  function toggle(id){
    const m=MODULOS_CATALOG.find(x=>x.id===id);
    if(m?.tier===0)return;
    setSelected(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});
  }

  const adicionales=Array.from(selected).filter(id=>{const m=MODULOS_CATALOG.find(x=>x.id===id);return m&&m.tier>0;});

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,color:"#1E2B1A",fontFamily:"system-ui,sans-serif"}}>
            <span style={{fontWeight:600}}>{adicionales.length}</span> módulos adicionales activos
            <span style={{marginLeft:12,color:"#4A5C45",fontWeight:600}}>{totalMensual.toLocaleString()} USD/mes</span>
          </div>
          <div style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginTop:2}}>Base USD600 + {adicionales.length} modulos adicionales</div>
        </div>
        <button style={{background:"#4A5C45",color:"#F0F4EE",border:"none",borderRadius:4,padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setOpen(!open)}>
          {open?"Cerrar":"Gestionar módulos"}
        </button>
      </div>

      {open&&<div style={{background:"#fff",border:"1px solid #DDE4D8",borderRadius:8,padding:16,marginTop:8}}>
        {MODULOS_CATS.map(cat=>{
          const mods=MODULOS_CATALOG.filter(m=>m.cat===cat);
          return(
            <div key={cat} style={{marginBottom:16}}>
              <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:8,fontWeight:600}}>{cat}</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {mods.map(m=>{
                  const isBase=m.tier===0;
                  const active=selected.has(m.id)||isBase;
                  const tc=TIER_COLORS[m.tier];
                  return(
                    <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:5,background:active?"#F5F8F5":"#FAFCF8",border:"1px solid "+(active?"#DDE4D8":"#EEF0EC"),cursor:isBase?"default":"pointer",opacity:isBase?.6:1}} onClick={()=>toggle(m.id)}>
                      <div style={{width:16,height:16,borderRadius:3,border:"1.5px solid "+(active?"#4A5C45":"#C0CFC0"),background:active?"#4A5C45":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {active&&<span style={{color:"#fff",fontSize:11,lineHeight:1}}>✓</span>}
                      </div>
                      <div style={{flex:1,fontSize:12,color:"#1E2B1A",fontFamily:"system-ui,sans-serif"}}>{m.id} — {m.nombre}</div>
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:3,background:tc.bg,color:tc.color,fontFamily:"system-ui,sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>{tc.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,paddingTop:12,borderTop:"1px solid #DDE4D8"}}>
          <div style={{fontSize:13,fontFamily:"system-ui,sans-serif",color:"#1E2B1A"}}>
            Total mensual: <span style={{fontWeight:700,color:"#4A5C45"}}>{totalMensual.toLocaleString()} USD</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{background:"none",border:"1px solid #DDE4D8",borderRadius:4,padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setOpen(false)}>Cancelar</button>
            <button style={{background:"#4A5C45",color:"#F0F4EE",border:"none",borderRadius:4,padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar cambios"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
const DOC_TYPES = [
  {id:"poder_general",label:"Poder General",cat:"poderes"},
  {id:"poder_dominio",label:"Poder para Actos de Dominio",cat:"poderes"},
  {id:"poder_administracion",label:"Poder para Actos de Administración",cat:"poderes"},
  {id:"poder_pleitos",label:"Poder para Pleitos y Cobranzas",cat:"poderes"},
  {id:"poder_sat",label:"Poder ante SAT",cat:"poderes"},
  {id:"poder_bancario",label:"Poder para Cuentas Bancarias",cat:"poderes"},
  {id:"poder_laboral",label:"Poder en Materia Laboral",cat:"poderes"},
  {id:"asamblea_ordinaria",label:"Asamblea Ordinaria",cat:"asambleas"},
  {id:"asamblea_extraordinaria",label:"Asamblea Extraordinaria",cat:"asambleas"},
  {id:"contrato_cliente",label:"Contrato con Cliente",cat:"contratos"},
  {id:"contrato_proveedor",label:"Contrato con Proveedor",cat:"contratos"},
  {id:"contrato_arrendamiento",label:"Contrato de Arrendamiento",cat:"contratos"},
  {id:"contrato_laboral",label:"Contrato Laboral Clave",cat:"contratos"},
  {id:"acta_constitutiva",label:"Acta Constitutiva",cat:"corporativos"},
  {id:"estatutos",label:"Estatutos Vigentes",cat:"corporativos"},
  {id:"registro_socios",label:"Libro de Registro de Socios",cat:"corporativos"},
];

const CAT_LABELS = {
  poderes:"Poderes Notariales",asambleas:"Asambleas",
  contratos:"Contratos",corporativos:"Documentos Corporativos",
};

const TIPOS_ASAMBLEA = ["Ordinaria Anual","Extraordinaria","Ordinaria Especial"];
const ASUNTOS_ORDEN = [
  "Verificación del quórum legal",
  "Lectura y aprobación del orden del día",
  "Aprobación de estados financieros",
  "Nombramiento o ratificación de administradores",
  "Determinación de emolumentos",
  "Aprobación de la gestión del ejercicio",
  "Modificación de estatutos sociales",
  "Aumento o reducción de capital social",
  "Revocación y／u otorgamiento de poderes",
  "Aprobación de fusión o escisión",
  "Distribución de dividendos",
  "Aprobación de presupuesto anual",
  "Cambio de domicilio fiscal o social",
  "Asuntos generales",
];

const DIAGNOSTICO = [
  {id:"q1",area:"estructura",question:"¿En qué año se constituyó la empresa?",options:["Antes de 2015","2015–2019","2020–2023","2024 o después"],score:{0:0,1:50,2:100,3:100}},
  {id:"q2",area:"estructura",question:"¿Han cambiado socios desde la constitución?",options:["Sí, y está documentado notarialmente","Sí, pero no está documentado","No han cambiado socios"],score:{0:100,1:0,2:100}},
  {id:"q3",area:"estructura",question:"¿Tienen un acuerdo de socios o pacto corporativo por escrito?",options:["Sí, está vigente","Está desactualizado","No existe"],score:{0:100,1:50,2:0}},
  {id:"q4",area:"actas",question:"¿Cuándo fue la última asamblea ordinaria?",options:["En los últimos 12 meses","Hace 1–3 años","Hace más de 3 años","Nunca hemos hecho una"],score:{0:100,1:50,2:0,3:0}},
  {id:"q5",area:"actas",question:"¿Las actas de asamblea están protocolizadas o firmadas formalmente?",options:["Sí, todas","Solo algunas","No están formalizadas"],score:{0:100,1:50,2:0}},
  {id:"q6",area:"poderes",question:"¿Tienen poderes notariales vigentes para los representantes actuales?",options:["Sí, están actualizados","Están desactualizados","No tenemos poderes formales"],score:{0:100,1:0,2:0}},
  {id:"q7",area:"poderes",question:"¿Han revocado los poderes de ex-socios o ex-empleados?",options:["Sí, todos revocados","Solo algunos","No se han revocado","No aplica"],score:{0:100,1:0,2:0,3:100}},
  {id:"q8",area:"contratos",question:"¿Sus contratos con clientes están por escrito y firmados?",options:["Sí, todos","La mayoría","Solo algunos","Operamos sin contratos escritos"],score:{0:100,1:75,2:25,3:0}},
  {id:"q9",area:"contratos",question:"¿Sus contratos con proveedores clave están formalizados?",options:["Sí, todos","La mayoría","Solo algunos","No"],score:{0:100,1:75,2:25,3:0}},
  {id:"q10",area:"contratos",question:"¿Sus contratos incluyen cláusulas de terminación y resolución de conflictos?",options:["Sí","Solo algunos","No"],score:{0:100,1:50,2:0}},
  {id:"q11",area:"arrendamientos",question:"¿Tienen oficinas u otros espacios rentados?",options:["Sí, con contrato formal vigente","Sí, pero sin contrato formal","No rentamos espacios"],score:{0:100,1:0,2:100}},
  {id:"q12",area:"arrendamientos",question:"¿En cuánto tiempo vence su contrato de arrendamiento más importante?",options:["Más de 12 meses","6–12 meses","Menos de 6 meses","No aplica"],score:{0:100,1:50,2:0,3:100}},
  {id:"q13",area:"fiscal",question:"¿Están al corriente en sus obligaciones fiscales con el SAT?",options:["Sí, sin adeudos","Tenemos algunos adeudos menores","Tenemos adeudos significativos"],score:{0:100,1:50,2:0}},
  {id:"q14",area:"fiscal",question:"¿Sus empleados están dados de alta formalmente en IMSS?",options:["Sí, todos","La mayoría","Solo algunos","No tenemos empleados formales"],score:{0:100,1:50,2:0,3:100}},
  {id:"q15",area:"fiscal",question:"¿Tienen contratos laborales firmados con sus empleados clave?",options:["Sí, todos","La mayoría","Solo algunos","No tenemos empleados clave"],score:{0:100,1:75,2:25,3:100}},
];

function calcDiagnostico(answers){
  const areaScores={estructura:[],actas:[],poderes:[],contratos:[],arrendamientos:[],fiscal:[]};
  DIAGNOSTICO.forEach(q=>{const ans=answers[q.id];if(ans!==undefined)areaScores[q.area].push(q.score[ans]??50);});
  const avg=arr=>arr.length?Math.round(arr.reduce((a,b)=>a+b,0)/arr.length):50;
  const toStatus=s=>s>=75?"green":s>=40?"amber":"red";
  return [
    {id:"a1",name:"Estructura societaria",sub:"Diagnóstico inicial",status:toStatus(avg(areaScores.estructura))},
    {id:"a2",name:"Actas de asamblea",sub:"Diagnóstico inicial",status:toStatus(avg(areaScores.actas))},
    {id:"a3",name:"Poderes notariales",sub:"Diagnóstico inicial",status:toStatus(avg(areaScores.poderes))},
    {id:"a4",name:"Contratos activos",sub:"Diagnóstico inicial",status:toStatus(avg(areaScores.contratos))},
    {id:"a5",name:"Arrendamientos",sub:"Diagnóstico inicial",status:toStatus(avg(areaScores.arrendamientos))},
    {id:"a6",name:"Compromisos con M&M",sub:"En proceso",status:"green"},
  ];
}

function scoreOf(areas){
  if(!areas?.length)return 0;
  const w={green:100,amber:50,red:0};
  return Math.round(areas.reduce((s,a)=>s+(w[a.status]??0),0)/areas.length);
}


async function generateReporteEjecutivo(client){
  const jsPDFLib = (await import("jspdf")).default;
  const doc = new jsPDFLib({orientation:"portrait",unit:"mm",format:"a4"});
  const today = new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"});
  const pageW=210; const margin=20; const contentW=pageW-margin*2; let y=0;

  // Cargar datos de Supabase
  const modulosActivos = ((client._sociedad?.modulos||client.modulos)||[]).filter(id=>MODULO_DOCS[id]?.checklist);
  const {data:checksData} = await supabase.from("reglas_compliance").select("*").eq("client_id",client.id).then(({data:d})=>d);
  const {data:docsData} = await supabase.from("documents").select("*").eq("client_id",client.id);
  const checks = {};
  const riesgosData = {};
  (checksData||[]).forEach(x=>{
    checks[x.modulo+"_"+x.regla_id]=x.status;
    if(x.nivel_riesgo) riesgosData[x.modulo+"_"+x.regla_id]=x.nivel_riesgo;
  });

  // Calcular score
  let totalItems=0; let cumpleItems=0; const alertasCriticas=[];
  modulosActivos.forEach(modId=>{
    const items = MODULO_DOCS[modId]?.checklist||[];
    items.forEach(item=>{
      totalItems++;
      const st = checks[modId+"_"+item.id];
      const nivel = riesgosData[modId+"_"+item.id]||item.riesgo||"bajo";
      if(st==="cumple") cumpleItems++;
      if(st==="no_cumple"&&(nivel==="critico"||nivel==="alto")){
        const modNombre = MODULOS_CATALOG.find(x=>x.id===modId)?.nombre||modId;
        alertasCriticas.push({modId,modNombre,label:item.label,nivel});
      }
    });
  });
  const score = totalItems>0?Math.round((cumpleItems/totalItems)*100):0;
  const scoreColor = score>=70?[90,138,60]:score>=40?[201,168,76]:[192,57,43];

  // Documentos pendientes (requeridos sin archivo)
  const docsPendientes=[];
  modulosActivos.forEach(modId=>{
    const requeridos = (MODULO_DOCS[modId]?.docs||[]).filter(d=>d.requerido);
    requeridos.forEach(doc=>{
      const existe = (docsData||[]).find(d=>d.modulo===modId&&d.tipo===doc.id&&d.drive_url);
      if(!existe) docsPendientes.push({modId,modNombre:MODULOS_CATALOG.find(x=>x.id===modId)?.nombre||modId,label:doc.label});
    });
  });

  function checkPage(n=20){if(y+n>272){doc.addPage();y=20;}}

  // ── HEADER ──
  doc.setFillColor(26,26,26); doc.rect(0,0,pageW,32,"F");
  doc.setFillColor(201,168,76); doc.rect(0,30,pageW,1.5,"F");
  doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont("helvetica","bold");
  doc.text("MILLÁN & MARTÍNEZ ABOGADOS",margin,13);
  doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(201,168,76);
  doc.text("REPORTE EJECUTIVO DE INMUNIDAD CORPORATIVA",margin,22);
  doc.setTextColor(180,180,180); doc.text(today,pageW-margin,22,{align:"right"});
  y=44;

  // ── CLIENTE ──
  doc.setTextColor(26,26,26); doc.setFontSize(16); doc.setFont("helvetica","bold");
  doc.text(client.name,margin,y); y+=7;
  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(136,136,128);
  doc.text("Cliente "+client.id+(client.contact?" · "+client.contact:""),margin,y); y+=14;

  // ── SCORE CARDS ──
  const cW=(contentW-9)/4;
  [
    {label:"Salud corporativa",value:String(score)+"%",color:scoreColor},
    {label:"Módulos activos",value:String(modulosActivos.length),color:[74,92,69]},
    {label:"Alertas críticas",value:String(alertasCriticas.length),color:[192,57,43]},
    {label:"Docs pendientes",value:String(docsPendientes.length),color:[201,168,76]},
  ].forEach((card,i)=>{
    const x=margin+i*(cW+3);
    doc.setFillColor(245,242,237); doc.roundedRect(x,y,cW,22,2,2,"F");
    doc.setTextColor(...card.color); doc.setFontSize(18); doc.setFont("helvetica","bold");
    doc.text(card.value,x+cW/2,y+13,{align:"center"});
    doc.setTextColor(136,136,128); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text(card.label.toUpperCase(),x+cW/2,y+19,{align:"center"});
  }); y+=30;

  // ── ESTADO POR MÓDULO ──
  doc.setFillColor(201,168,76); doc.rect(margin,y,contentW,0.5,"F"); y+=8;
  doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(136,136,128);
  doc.text("ESTADO DE CUMPLIMIENTO POR MÓDULO",margin,y); y+=6;

  modulosActivos.forEach(modId=>{
    checkPage(14);
    const items = MODULO_DOCS[modId]?.checklist||[];
    const modNombre = MODULOS_CATALOG.find(x=>x.id===modId)?.nombre||modId;
    const cumple = items.filter(x=>checks[modId+"_"+x.id]==="cumple").length;
    const noCumple = items.filter(x=>checks[modId+"_"+x.id]==="no_cumple").length;
    const pct = items.length>0?Math.round((cumple/items.length)*100):0;
    const rgb = noCumple>0?[253,245,245]:pct>=70?[245,251,240]:[253,250,240];
    const lineColor = noCumple>0?[192,57,43]:pct>=70?[90,138,60]:[201,168,76];
    doc.setFillColor(...rgb); doc.roundedRect(margin,y,contentW,12,1,1,"F");
    doc.setFillColor(...lineColor); doc.rect(margin,y,2.5,12,"F");
    doc.setTextColor(26,26,26); doc.setFontSize(9); doc.setFont("helvetica","bold");
    doc.text(modId+" · "+modNombre,margin+6,y+5);
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(136,136,128);
    doc.text(cumple+"/"+items.length+" ítems en cumplimiento",margin+6,y+10);
    doc.setTextColor(...lineColor); doc.setFontSize(8); doc.setFont("helvetica","bold");
    doc.text(String(pct)+"%",pageW-margin-2,y+7,{align:"right"}); y+=14;
  }); y+=4;

  // ── ALERTAS CRÍTICAS ──
  if(alertasCriticas.length>0){
    checkPage(20);
    doc.setFillColor(201,168,76); doc.rect(margin,y,contentW,0.5,"F"); y+=8;
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(136,136,128);
    doc.text("ALERTAS QUE REQUIEREN ATENCIÓN INMEDIATA",margin,y); y+=6;
    alertasCriticas.slice(0,8).forEach(a=>{
      checkPage(12);
      const rgb = a.nivel==="critico"?[253,245,245]:[253,250,240];
      const lc = a.nivel==="critico"?[192,57,43]:[201,168,76];
      doc.setFillColor(...rgb); doc.roundedRect(margin,y,contentW,12,1,1,"F");
      doc.setFillColor(...lc); doc.rect(margin,y,2.5,12,"F");
      doc.setTextColor(26,26,26); doc.setFontSize(9); doc.setFont("helvetica","normal");
      const labelText = doc.splitTextToSize(a.label, contentW-40);
      doc.text(labelText[0],margin+6,y+5);
      doc.setFontSize(7); doc.setTextColor(136,136,128);
      doc.text(a.modId+" · "+a.modNombre,margin+6,y+10);
      doc.setTextColor(...lc); doc.setFont("helvetica","bold");
      doc.text(a.nivel.toUpperCase(),pageW-margin-2,y+7,{align:"right"}); y+=14;
    }); y+=4;
  }

  // ── DOCUMENTOS PENDIENTES ──
  if(docsPendientes.length>0){
    checkPage(20);
    doc.setFillColor(201,168,76); doc.rect(margin,y,contentW,0.5,"F"); y+=8;
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(136,136,128);
    doc.text("DOCUMENTOS PENDIENTES DE ENTREGA",margin,y); y+=6;
    docsPendientes.slice(0,10).forEach(d=>{
      checkPage(10);
      doc.setFillColor(253,250,240); doc.roundedRect(margin,y,contentW,10,1,1,"F");
      doc.setFillColor(201,168,76); doc.circle(margin+4,y+5,1.5,"F");
      doc.setTextColor(26,26,26); doc.setFontSize(9); doc.setFont("helvetica","normal");
      doc.text(d.label,margin+9,y+4.5);
      doc.setFontSize(7); doc.setTextColor(136,136,128);
      doc.text(d.modId+" · "+d.modNombre,margin+9,y+9); y+=12;
    });
  }

  // ── FOOTER ──
  const pc=doc.getNumberOfPages();
  for(let i=1;i<=pc;i++){
    doc.setPage(i);
    doc.setFillColor(26,26,26); doc.rect(0,285,pageW,12,"F");
    doc.setFillColor(201,168,76); doc.rect(0,284,pageW,0.8,"F");
    doc.setTextColor(180,180,180); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("Millán & Martínez Abogados  ·  panel.mymabogados.mx  ·  jmartinez@mymabogados.mx",margin,292);
    doc.text("Página "+i+" de "+pc,pageW-margin,292,{align:"right"});
  }

  const dt=new Date().toISOString().slice(0,10);
  doc.save("MM_Reporte_"+client.name.replace(/\s+/g,"_")+"_"+dt+".pdf");
}

async function generatePDF(client,areas,documents,pendingDocs){
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const today=new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"});
  const pageW=210;const margin=20;const contentW=pageW-margin*2;let y=0;
  function checkPage(n=20){if(y+n>270){doc.addPage();y=20;}}

  // Cargar datos reales de cumplimiento
  const socId=client._sociedad?.id||null;
  const qChecks=socId
    ?supabase.from("reglas_compliance").select("*").eq("client_id",client.id).eq("sociedad_id",socId)
    :supabase.from("reglas_compliance").select("*").eq("client_id",client.id).is("sociedad_id",null);
  const {data:checksData}=await qChecks;
  const checks={};
  (checksData||[]).forEach(x=>{checks[x.modulo+"_"+x.regla_id]=x.status;});

  const modulos=(client._sociedad?.modulos||client.modulos||[]).filter(id=>{
    const m=MODULOS_CATALOG.find(x=>x.id===id);return m&&m.tier>0;
  });

  const totalItems=Object.keys(checks).length;
  const cumpleCount=Object.values(checks).filter(v=>v==="cumple").length;
  const noCumple=Object.values(checks).filter(v=>v==="no_cumple").length;
  const score=totalItems>0?Math.round((cumpleCount/totalItems)*100):0;
  const scoreC=score>=70?[90,138,60]:score>=40?[201,168,76]:[192,57,43];

  doc.setFillColor(26,26,26);doc.rect(0,0,pageW,30,"F");
  doc.setFillColor(201,168,76);doc.rect(0,28,pageW,1.5,"F");
  doc.setTextColor(255,255,255);doc.setFontSize(13);doc.setFont("helvetica","bold");
  doc.text("MILLÁN & MARTÍNEZ ABOGADOS",margin,13);
  doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(201,168,76);
  doc.text("PANEL DE INMUNIDAD CORPORATIVA",margin,22);
  doc.setTextColor(180,180,180);doc.text(today,pageW-margin,22,{align:"right"});
  y=42;doc.setTextColor(26,26,26);doc.setFontSize(16);doc.setFont("helvetica","bold");
  doc.text(client.name,margin,y);y+=7;
  doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(136,136,128);
  doc.text(`${client._sociedad?client._sociedad.nombre+" · ":""}${client.id}`,margin,y);y+=14;
  const cW=(contentW-9)/4;
  [{label:"Cumplimiento",value:score+"%",color:scoreC},{label:"Módulos activos",value:String(modulos.length),color:[74,92,69]},{label:"No cumple",value:String(noCumple),color:[192,57,43]},{label:"Sin revisar",value:String(totalItems-cumpleCount-noCumple),color:[201,168,76]}].forEach((sc,i)=>{
    const x=margin+i*(cW+3);doc.setFillColor(245,242,237);doc.roundedRect(x,y,cW,22,2,2,"F");
    doc.setTextColor(...sc.color);doc.setFontSize(20);doc.setFont("helvetica","bold");doc.text(sc.value,x+cW/2,y+13,{align:"center"});
    doc.setTextColor(136,136,128);doc.setFontSize(7);doc.setFont("helvetica","normal");doc.text(sc.label.toUpperCase(),x+cW/2,y+19,{align:"center"});
  });y+=30;
  doc.setFillColor(201,168,76);doc.rect(margin,y,contentW,0.5,"F");y+=8;
  doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(136,136,128);doc.text("ESTADO DE CUMPLIMIENTO POR MÓDULO",margin,y);y+=6;
  modulos.forEach(modId=>{
    const m=MODULOS_CATALOG.find(x=>x.id===modId);if(!m)return;
    const items=MODULO_DOCS[modId]?.checklist||[];
    const total=items.length;
    const cumple=items.filter(it=>checks[modId+"_"+it.id]==="cumple").length;
    const noCumpleM=items.filter(it=>checks[modId+"_"+it.id]==="no_cumple").length;
    const pct=total>0?Math.round((cumple/total)*100):null;
    const color=noCumpleM>0?[192,57,43]:pct>=75?[90,138,60]:[201,168,76];
    checkPage(12);
    doc.setFillColor(245,242,237);doc.roundedRect(margin,y,contentW,12,1,1,"F");
    doc.setFillColor(...color);doc.rect(margin,y,2.5,12,"F");
    doc.setTextColor(26,26,26);doc.setFontSize(9);doc.setFont("helvetica","bold");
    doc.text(m.nombre,margin+6,y+5);
    doc.setFontSize(7);doc.setFont("helvetica","normal");doc.setTextColor(136,136,128);
    doc.text(m.cat,margin+6,y+9.5);
    if(total>0){
      doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(...color);
      doc.text(pct!==null?pct+"%":"—",pageW-margin-2,y+6,{align:"right"});
      doc.setFontSize(7);doc.setFont("helvetica","normal");doc.setTextColor(136,136,128);
      doc.text(cumple+"/"+total+" cumple",pageW-margin-14,y+9.5,{align:"right"});
    }
    y+=12;
    // Desglose de todos los items del módulo
    y+=2;
    if(total>0){
      items.forEach(it=>{
        const st=checks[modId+"_"+it.id]||"sin_revisar";
        const stColor=st==="cumple"?[90,138,60]:st==="no_cumple"?[192,57,43]:st==="parcial"?[201,168,76]:[180,180,180];
        const stBg=st==="cumple"?[245,251,240]:st==="no_cumple"?[253,245,245]:st==="parcial"?[253,250,240]:[248,248,248];
        const stLabel=st==="cumple"?"CUMPLE":st==="no_cumple"?"NO CUMPLE":st==="parcial"?"PARCIAL":"SIN REVISAR";
        checkPage(7);y+=2;
        doc.setFillColor(...stBg);doc.roundedRect(margin+3,y,contentW-3,6,0.5,0.5,"F");
        doc.setFillColor(...stColor);doc.rect(margin+3,y,1.5,6,"F");
        doc.setTextColor(26,26,26);doc.setFontSize(7);doc.setFont("helvetica","normal");
        const label=it.label.length>90?it.label.slice(0,90)+"...":it.label;
        doc.text(label,margin+7,y+3.5);
        doc.setFontSize(6);doc.setFont("helvetica","bold");doc.setTextColor(...stColor);
        doc.text(stLabel,pageW-margin-2,y+3.5,{align:"right"});
        y+=6;
      });
      // Riesgos del módulo
      const riesgos=MODULO_DOCS[modId]?.riesgos||[];
      if(riesgos.length>0){
        checkPage(10);y+=3;
        doc.setFontSize(7);doc.setFont("helvetica","bold");doc.setTextColor(136,136,128);
        doc.text("RIESGOS IDENTIFICADOS",margin+3,y);y+=4;
        riesgos.forEach(r=>{
          const rc=r.nivel==="critico"?[192,57,43]:r.nivel==="alto"?[180,100,20]:[201,168,76];
          checkPage(10);
          doc.setFillColor(248,248,248);doc.roundedRect(margin+3,y,contentW-3,8,0.5,0.5,"F");
          doc.setFillColor(...rc);doc.rect(margin+3,y,1.5,8,"F");
          doc.setTextColor(26,26,26);doc.setFontSize(7);doc.setFont("helvetica","bold");
          const rl=r.label.length>85?r.label.slice(0,85)+"...":r.label;
          doc.text(rl,margin+7,y+3);
          doc.setFontSize(6);doc.setFont("helvetica","normal");doc.setTextColor(136,136,128);
          const imp=r.impacto.length>100?r.impacto.slice(0,100)+"...":r.impacto;
          doc.text(imp,margin+7,y+6.5);
          doc.setFontSize(6);doc.setFont("helvetica","bold");doc.setTextColor(...rc);
          doc.text(r.nivel.toUpperCase(),pageW-margin-2,y+4,{align:"right"});
          y+=9;
        });
      }
    }
    y+=6;
  });
  y+=6;doc.setFillColor(201,168,76);doc.rect(margin,y,contentW,0.5,"F");y+=8;
  Object.entries(CAT_LABELS).forEach(([cat,catLabel])=>{
    const docs=documents.filter(d=>DOC_TYPES.find(t=>t.id===d.type)?.cat===cat);if(!docs.length)return;
    checkPage(20);doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(136,136,128);doc.text(catLabel.toUpperCase(),margin,y);y+=5;
    docs.forEach(d=>{
      checkPage(10);const rgb=d.status==="vigente"?[90,138,60]:d.status==="vencido"?[192,57,43]:[201,168,76];
      doc.setFillColor(...rgb);doc.circle(margin+2,y+2.5,1.5,"F");
      doc.setTextColor(26,26,26);doc.setFontSize(9);doc.setFont("helvetica","normal");doc.text(d.name,margin+6,y+4);
      doc.setTextColor(136,136,128);doc.setFontSize(8);doc.text(d.person?`${d.person}  ·  ${d.date}`:d.date,margin+6,y+9);
      doc.setTextColor(...rgb);doc.setFontSize(7);doc.setFont("helvetica","bold");doc.text(d.status.toUpperCase(),pageW-margin-2,y+5,{align:"right"});y+=12;
    });y+=4;
  });
  if(pendingDocs.length>0){
    checkPage(20);doc.setFillColor(201,168,76);doc.rect(margin,y,contentW,0.5,"F");y+=8;
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(136,136,128);doc.text("DOCUMENTOS PENDIENTES",margin,y);y+=5;
    pendingDocs.forEach(p=>{
      checkPage(12);doc.setFillColor(201,168,76);doc.circle(margin+2,y+2.5,1.5,"F");
      doc.setTextColor(26,26,26);doc.setFontSize(9);doc.setFont("helvetica","normal");doc.text(p.name,margin+6,y+4);
      doc.setTextColor(136,136,128);doc.setFontSize(8);doc.text(p.due?`Vence: ${p.due}  ·  ${p.note}`:p.note,margin+6,y+9);y+=12;
    });
  }
  const pc=doc.getNumberOfPages();
  for(let i=1;i<=pc;i++){
    doc.setPage(i);doc.setFillColor(26,26,26);doc.rect(0,285,pageW,12,"F");
    doc.setFillColor(201,168,76);doc.rect(0,284,pageW,0.8,"F");
    doc.setTextColor(180,180,180);doc.setFontSize(7);doc.setFont("helvetica","normal");
    doc.text("Millán & Martínez Abogados  ·  panel.mymabogados.mx",margin,292);
    doc.text(`Página ${i} de ${pc}`,pageW-margin,292,{align:"right"});
  }
  var dt=new Date().toISOString().slice(0,10);doc.save("MM_Inmunidadprotegida._"+client.id+"_"+dt+".pdf");
}

const s={
  wrap:{fontFamily:"Georgia, serif",color:TEXT_DARK,background:CONTENT_BG,minHeight:"100vh",display:"flex",flexDirection:"column"},
  card:{background:CARD_BG,border:"1px solid "+BORDER,borderRadius:4,padding:"1rem 1.25rem",marginBottom:8},
  btn:{background:"none",border:"1px solid "+BORDER,borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",color:BLACK,fontFamily:"system-ui, sans-serif",letterSpacing:".08em",textTransform:"uppercase"},
  btnPrimary:{background:MUSGO,color:MUSGO_TEXT,border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui, sans-serif",letterSpacing:".08em",textTransform:"uppercase"},
  btnGold:{background:GOLD,color:WHITE,border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui, sans-serif",letterSpacing:".08em",textTransform:"uppercase"},
  btnGreen:{background:"#5A8A3C",color:WHITE,border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui, sans-serif",letterSpacing:".08em",textTransform:"uppercase"},
  btnSm:{padding:"4px 10px",fontSize:11},
  btnDanger:{border:"1px solid #fca5a5",color:"#dc2626",background:"none",borderRadius:2,padding:"3px 10px",fontSize:11,cursor:"pointer"},
  input:{width:"100%",border:"1px solid "+BORDER,borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:CARD_BG,fontFamily:"system-ui, sans-serif"},
  textarea:{width:"100%",border:"1px solid "+BORDER,borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:WHITE,fontFamily:"system-ui, sans-serif",resize:"vertical"},
  select:{width:"100%",border:"1px solid "+BORDER,borderRadius:2,padding:"8px 10px",fontSize:13,background:CARD_BG,cursor:"pointer",boxSizing:"border-box",fontFamily:"system-ui, sans-serif"},
  label:{fontSize:10,fontWeight:400,color:GRAY,letterSpacing:".1em",textTransform:"uppercase",display:"block",marginBottom:8,marginTop:20,fontFamily:"system-ui, sans-serif"},
  muted:{fontSize:12,color:GRAY,fontFamily:"system-ui, sans-serif"},
  tab:active=>({padding:"10px 16px",fontSize:11,cursor:"pointer",border:"none",background:"none",color:active?BLACK:GRAY,borderBottom:active?"2px solid "+GOLD:"2px solid transparent",fontWeight:400,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui, sans-serif"}),
  tabs:{display:"flex",borderBottom:"1px solid "+BORDER,marginBottom:20,gap:0,overflowX:"auto"},
  dot:status=>({width:8,height:8,borderRadius:"50%",background:STATUS_COLORS[status]||"#aaa",flexShrink:0,display:"inline-block"}),
  badge:status=>{
    const map={vigente:["#f0fdf4","#166534"],vencido:["#fef2f2","#991b1b"],"por renovar":["#fffbeb","#92400e"],pendiente:["#fffbeb","#92400e"],green:["#f0fdf4","#166534"],red:["#fef2f2","#991b1b"],amber:["#fffbeb","#92400e"]};
    const [bg,color]=map[status]||["#f3f4f6","#374151"];
    return{fontSize:10,padding:"2px 8px",borderRadius:2,fontWeight:400,background:bg,color,whiteSpace:"nowrap",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui, sans-serif"};
  },
  scoreCard:{background:CARD_BG,border:"1px solid "+BORDER,borderRadius:4,padding:".75rem .8rem",textAlign:"center",flex:1},
  row:{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:"1px solid "+BORDER},
  flex:(gap=8)=>({display:"flex",gap,alignItems:"center"}),
  col:(gap=8)=>({display:"flex",flexDirection:"column",gap}),
  loginWrap:{minHeight:"100vh",display:"flex",alignItems:"stretch",justifyContent:"center",background:CONTENT_BG,padding:0},
  loginBox:{background:CARD_BG,border:"none",padding:"3rem 3.5rem",width:"min(520px,100%)",display:"flex",flexDirection:"column",gap:16,boxShadow:"none",margin:"auto",justifyContent:"center"},
};

function Badge({status,label}){return <span style={s.badge(status)}>{label||status}</span>;}
function ScoreCard({label,value,color}){
  return <div style={s.scoreCard}><div style={{fontSize:26,fontWeight:400,color,fontFamily:"Georgia, serif"}}>{value}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui, sans-serif"}}>{label}</div></div>;
}
function Spinner(){return <div style={{textAlign:"center",padding:"3rem",color:GRAY,fontSize:12,letterSpacing:".1em",textTransform:"uppercase",fontFamily:"system-ui, sans-serif"}}>Cargando...</div>;}

function DiagnosticoForm({client,onComplete}){
  const [step,setStep]=useState(0);const [answers,setAnswers]=useState({});const [submitting,setSubmitting]=useState(false);
  const q=DIAGNOSTICO[step];const progress=Math.round((step/DIAGNOSTICO.length)*100);
  const areaLabels={estructura:"Estructura Societaria",actas:"Actas de Asamblea",poderes:"Poderes Notariales",contratos:"Contratos",arrendamientos:"Arrendamientos",fiscal:"Fiscal y Laboral"};
  async function next(val){
    const na={...answers,[q.id]:val};setAnswers(na);
    if(step<DIAGNOSTICO.length-1){setStep(s=>s+1);return;}
    setSubmitting(true);
    const ga=calcDiagnostico(na);
    const ad=ga.map((a,i)=>({id:`draft_${client.id}_a${i+1}`,client_id:client.id,name:a.name,sub:"Pendiente de revisión por el despacho",status:a.status,draft:true}));
    await supabase.from("areas").delete().eq("client_id",client.id).eq("draft",true);
    await supabase.from("areas").insert(ad);
    await supabase.from("clients").update({diagnostico:JSON.stringify(na),diagnostico_done:true}).eq("id",client.id);
    setSubmitting(false);onComplete(ga);
  }
  return(
    <div style={{...s.wrap,display:"flex",flexDirection:"column",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{maxWidth:540,margin:"0 auto",width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:10,letterSpacing:".2em",textTransform:"uppercase",color:GOLD,fontFamily:"system-ui, sans-serif",marginBottom:12}}>Millán & Martínez Abogados</div>
          <div style={{fontSize:22,fontFamily:"Georgia, serif"}}>Diagnóstico de Inmunidad</div>
          <div style={{fontSize:22,fontFamily:"Georgia, serif",fontStyle:"italic",color:GOLD}}>protegida.</div>
          <div style={{...s.muted,marginTop:8}}>{client.name}</div>
        </div>
        <div style={{background:BORDER,borderRadius:2,height:3,marginBottom:8}}><div style={{background:GOLD,height:3,borderRadius:2,width:progress+"%" ,transition:"width .3s"}}/></div>
        <div style={{...s.flex(),justifyContent:"space-between",marginBottom:32}}>
          <span style={{...s.muted,fontSize:11}}>{areaLabels[q.area]}</span>
          <span style={{...s.muted,fontSize:11}}>Pregunta {step+1} de {DIAGNOSTICO.length}</span>
        </div>
        <div style={{...s.card,padding:"2rem"}}>
          <div style={{fontSize:17,fontFamily:"Georgia, serif",marginBottom:24,lineHeight:1.5}}>{q.question}</div>
          <div style={s.col(10)}>
            {q.options.map((opt,i)=>(
              <button key={i} style={{...s.btn,textAlign:"left",textTransform:"none",letterSpacing:"normal",fontSize:13,padding:"12px 16px",borderColor:answers[q.id]===i?BLACK:BORDER,background:answers[q.id]===i?BLACK:"none",color:answers[q.id]===i?WHITE:BLACK}} onClick={()=>next(i)} disabled={submitting}>{opt}</button>
            ))}
          </div>
        </div>
        {step>0&&<div style={{textAlign:"center",marginTop:16}}><button style={{...s.btn,...s.btnSm,color:GRAY,borderColor:"transparent"}} onClick={()=>setStep(s=>s-1)}>← Anterior</button></div>}
        {submitting&&<div style={{textAlign:"center",marginTop:20,color:GRAY,fontSize:12,fontFamily:"system-ui, sans-serif",letterSpacing:".08em",textTransform:"uppercase"}}>Analizando tu empresa...</div>}
      </div>
    </div>
  );
}

function DiagnosticoResult({areas,onContinue}){
  const score=scoreOf(areas);const scoreColor=score>=70?"#5A8A3C":score>=40?GOLD:"#C0392B";
  const clientActivo = sociedadActiva ? {...client, id:client.id, nombre_display:sociedadActiva.nombre, modulos:sociedadActiva.modulos||[], sociedad_id:sociedadActiva.id} : client;
  return(
    <div style={{...s.wrap,display:"flex",flexDirection:"column",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{maxWidth:540,margin:"0 auto",width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:10,letterSpacing:".2em",textTransform:"uppercase",color:GOLD,fontFamily:"system-ui, sans-serif",marginBottom:12}}>Ya tenemos tu diagnóstico</div>
          <div style={{fontSize:22,fontFamily:"Georgia, serif"}}>La salud corporativa de tu empresa</div>
          <div style={{fontSize:64,fontFamily:"Georgia, serif",color:scoreColor,margin:"16px 0"}}>{score}</div>
          <div style={s.muted}>Tu despacho lo revisará y te dirá exactamente qué hacer primero.</div>
        </div>
        <div style={s.col(8)}>{areas.filter(a=>a.id!=="a6").map(a=><div key={a.id} style={{...s.card,borderLeft:"3px solid "+STATUS_COLORS[a.status]}}><div style={s.flex()}><div style={{flex:1}}><div style={{fontSize:14,fontFamily:"Georgia, serif"}}>{a.name}</div></div><Badge status={a.status}/></div></div>)}</div>
        <div style={{textAlign:"center",marginTop:24}}><button style={s.btnPrimary} onClick={onContinue}>Ver mi empresa →</button></div>
      </div>
    </div>
  );
}

// SOLICITUD DE ASAMBLEA - formulario simplificado
function SolicitudAsambleaModal({client,onClose,onSaved}){
  const [form,setForm]=useState({tipo:"Ordinaria Anual",fecha:"",lugar:"",presidente:"",secretario:"",escrutador:"",delegados:"",orden:[],notas:""});
  const [socios,setSocios]=useState([{nombre:"",participacion:""}]);
  const [sending,setSending]=useState(false);const [sent,setSent]=useState(false);

  function toggleAsunto(a){setForm(prev=>({...prev,orden:prev.orden.includes(a)?prev.orden.filter(x=>x!==a):[...prev.orden,a]}));}

  async function send(){
    if(!form.fecha)return;
    setSending(true);
    const data={id:"asm"+Date.now(),client_id:client.id,...form,socios:JSON.stringify(socios),orden:JSON.stringify(form.orden),status:"solicitada",created_at:new Date().toISOString()};
    await supabase.from("asambleas").insert(data);
    // Email al despacho
    const sociosTxt=socios.filter(s=>s.nombre).map(s=>`${s.nombre} (${s.participacion||"-"}%)`).join(", ");
    const ordenTxt=form.orden.join(", ")||"-";
    try{await fetch(FORMSPREE,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({
      empresa:client.name,contacto:client.contact,tipo:form.tipo,fecha:form.fecha,
      lugar:form.lugar||"-",presidente:form.presidente||"-",secretario:form.secretario||"-",
      escrutador:form.escrutador||"-",delegados:form.delegados||"-",
      socios:sociosTxt||"-",orden:ordenTxt,notas:form.notas||"-",
      _subject:`Solicitud de Asamblea: {form.tipo} - {client.name}`
    })});}catch(e){}
    setSending(false);setSent(true);onSaved(data);
    setTimeout(()=>{setSent(false);onClose();},1500);
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,overflowY:"auto"}} onClick={onClose}>
      <div style={{background:WHITE,padding:"2rem",width:"min(580px,95vw)",maxHeight:"90vh",overflowY:"auto",border:"1px solid "+BORDER,margin:"1rem"}} onClick={e=>e.stopPropagation()}>
        {sent?<div style={{textAlign:"center",padding:"2rem 0"}}><div style={{fontSize:28,color:GOLD,marginBottom:12}}>✓</div><div style={{fontWeight:400,fontSize:15,fontFamily:"Georgia, serif"}}>Solicitud enviada</div><div style={{...s.muted,marginTop:6}}>El despacho la procesará y subirá el acta a tu panel.</div></div>
        :<>
          <span style={{width:40,height:1,background:GOLD,display:"block",marginBottom:12}}/>
          <div style={{fontSize:16,fontFamily:"Georgia, serif",marginBottom:4}}>Necesito una asamblea</div>
          <div style={{...s.muted,marginBottom:20}}>Dinos qué necesitas y preparamos todo. El acta llega a tu panel cuando esté lista.</div>

          <span style={s.label}>Tipo de asamblea</span>
          <select style={s.select} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
            {TIPOS_ASAMBLEA.map(t=><option key={t} value={t}>{t}</option>)}
          </select>

          <span style={s.label}>Fecha de la asamblea</span>
          <input style={s.input} type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/>

          <span style={s.label}>Lugar (opcional)</span>
          <input style={s.input} placeholder="Ej. Domicilio social de la empresa" value={form.lugar} onChange={e=>setForm({...form,lugar:e.target.value})}/>

          <span style={s.label}>Presidente de la asamblea</span>
          <input style={s.input} placeholder="Nombre completo" value={form.presidente} onChange={e=>setForm({...form,presidente:e.target.value})}/>

          <span style={s.label}>Secretario de la asamblea</span>
          <input style={s.input} placeholder="Nombre completo" value={form.secretario} onChange={e=>setForm({...form,secretario:e.target.value})}/>

          <span style={s.label}>Escrutador</span>
          <input style={s.input} placeholder="Nombre completo" value={form.escrutador} onChange={e=>setForm({...form,escrutador:e.target.value})}/>

          <span style={s.label}>Delegados especiales (opcional)</span>
          <input style={s.input} placeholder="Nombre(s) de los delegados designados" value={form.delegados} onChange={e=>setForm({...form,delegados:e.target.value})}/>

          <span style={s.label}>Accionistas / Socios presentes</span>
          <div style={s.col(6)}>
            {socios.map((sc,i)=>(
              <div key={i} style={s.flex()}>
                <input style={s.input} placeholder="Nombre del socio o accionista" value={sc.nombre} onChange={e=>{const ns=[...socios];ns[i].nombre=e.target.value;setSocios(ns);}}/>
                <input style={{...s.input,width:100}} placeholder="% capital" value={sc.participacion} onChange={e=>{const ns=[...socios];ns[i].participacion=e.target.value;setSocios(ns);}}/>
                {i>0&&<button style={s.btnDanger} onClick={()=>setSocios(socios.filter((_,j)=>j!==i))}>×</button>}
              </div>
            ))}
            <button style={{...s.btn,...s.btnSm,alignSelf:"flex-start"}} onClick={()=>setSocios([...socios,{nombre:"",participacion:""}])}>+ Agregar socio</button>
          </div>

          <span style={s.label}>Puntos del orden del día</span>
          <div style={s.col(6)}>
            {ASUNTOS_ORDEN.map(a=>(
              <label key={a} style={{...s.flex(8),cursor:"pointer",fontSize:13,fontFamily:"system-ui, sans-serif"}}>
                <input type="checkbox" checked={form.orden.includes(a)} onChange={()=>toggleAsunto(a)} style={{accentColor:GOLD}}/>
                {a}
              </label>
            ))}
          </div>

          <span style={s.label}>Notas adicionales (opcional)</span>
          <textarea style={{...s.textarea,marginBottom:0}} rows={3} placeholder="Cualquier información adicional para el despacho..." value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})}/>

          <div style={{...s.flex(),justifyContent:"flex-end",marginTop:20}}>
            <button style={s.btn} onClick={onClose}>Cancelar</button>
            <button style={s.btnPrimary} onClick={send} disabled={sending||!form.fecha}>{sending?"Enviando...":"Enviar solicitud"}</button>
          </div>
        </>}
      </div>
    </div>
  );
}

function AsambleasTab({client,isAdmin=false}){
  const [asambleas,setAsambleas]=useState([]);const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);

  useEffect(()=>{
    supabase.from("asambleas").select("*").eq("client_id",client.id).then(({data})=>{setAsambleas((data||[]).filter(x=>client._sociedad?x.sociedad_id===client._sociedad.id:!x.sociedad_id));setLoading(false);});
  },[client.id]);

  async function uploadActa(id,driveUrl){
    await supabase.from("asambleas").update({acta_url:driveUrl,status:"publicada"}).eq("id",id);
    setAsambleas(prev=>prev.map(a=>a.id===id?{...a,acta_url:driveUrl,status:"publicada"}:a));
  }
  async function deleteAsamblea(id){
    await supabase.from("asambleas").delete().eq("id",id);
    setAsambleas(prev=>prev.filter(a=>a.id!==id));
  }

  if(loading)return <Spinner/>;

  const statusLabel={solicitada:"Solicitada",publicada:"Publicada",borrador:"En proceso"};
  const statusBadge={solicitada:"amber",publicada:"green",borrador:"pendiente"};

  return(
    <div>
      <div style={{...s.flex(),justifyContent:"space-between",marginBottom:16}}>
        <span style={{...s.label,margin:0}}>Asambleas</span>
        {!isAdmin&&<button style={s.btnPrimary} onClick={()=>setShowForm(true)}>+ Necesito una asamblea</button>}
      </div>

      {asambleas.length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin asambleas registradas</div>
      :asambleas.map(a=>{
        const socios=a.socios?JSON.parse(a.socios):[];
        const orden=a.orden?JSON.parse(a.orden):[];
        const isPublished=a.status==="publicada";
        return(
          <div key={a.id} style={{...s.card,borderLeft:"3px solid "+isPublished?STATUS_COLORS.green:GOLD}}>
            <div style={{...s.flex(),justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:14,fontFamily:"Georgia, serif"}}>{a.tipo}</div>
                <div style={s.muted}>{a.fecha}{a.lugar?" · "+a.lugar:""}</div>
                {a.presidente&&<div style={{...s.muted,marginTop:2}}>Presidente: {a.presidente}{a.secretario?" · Secretario: "+a.secretario:""}</div>}
                {socios.filter(s=>s.nombre).length>0&&<div style={{...s.muted,marginTop:2}}>{socios.filter(s=>s.nombre).map(s=>`${s.nombre} (${s.participacion||"-"}%)`).join(", ")}</div>}
                {orden.length>0&&<div style={{...s.muted,marginTop:2,fontSize:11}}>{orden.length} punto{orden.length!==1?"s":""} en el orden del día</div>}
              </div>
              <Badge status={statusBadge[a.status]||"amber"} label={statusLabel[a.status]||a.status}/>
            </div>

            {/* Admin: subir acta desde Drive */}
            {isAdmin&&!isPublished&&<AdminActaUpload onUpload={url=>uploadActa(a.id,url)}/>}

            <div style={{...s.flex(),gap:8,flexWrap:"wrap",marginTop:8}}>
              {isPublished&&a.acta_url&&<button style={{...s.btnGreen,...s.btnSm}} onClick={()=>window.open(a.acta_url,"_blank")}>↓ Descargar acta</button>}
              {isAdmin&&<button style={{...s.btnDanger,...s.btnSm}} onClick={()=>deleteAsamblea(a.id)}>Eliminar</button>}
            </div>
          </div>
        );
      })}

      {showForm&&<SolicitudAsambleaModal client={client} onClose={()=>setShowForm(false)} onSaved={a=>{setAsambleas(prev=>[a,...prev]);}}/>}
    </div>
  );
}

function AdminActaUpload({onUpload}){
  const [url,setUrl]=useState("");const [show,setShow]=useState(false);
  if(!show)return <button style={{...s.btn,...s.btnSm,marginTop:4}} onClick={()=>setShow(true)}>+ Subir acta finalizada</button>;
  return(
    <div style={{...s.flex(),gap:8,marginTop:8}}>
      <input style={s.input} placeholder="Link de Google Drive del acta final..." value={url} onChange={e=>setUrl(e.target.value)}/>
      <button style={{...s.btnGreen,...s.btnSm}} disabled={!url} onClick={()=>{onUpload(url);setShow(false);setUrl("");}}>Publicar</button>
      <button style={{...s.btn,...s.btnSm}} onClick={()=>setShow(false)}>×</button>
    </div>
  );
}


function ContratosClientTab({client}){
  const [contratos,setContratos]=useState([]);const [loading,setLoading]=useState(true);
  const [catActiva,setCatActiva]=useState("todos");
  const [viewingDoc,setViewingDoc]=useState(null);
  const CATS=[{id:"todos",label:"Todos"},{id:"Laboral clave",label:"Laboral"},{id:"Corporativo",label:"Corporativo"},{id:"Con proveedor",label:"Proveedores"},{id:"Con cliente",label:"Clientes"},{id:"De arrendamiento",label:"Arrendamiento"},{id:"Otro",label:"Otro"}];
  useEffect(()=>{
    const socId=client._sociedad?.id||null;
    const q=socId?supabase.from("contratos").select("*").eq("client_id",client.id).eq("sociedad_id",socId).order("created_at",{ascending:false}):supabase.from("contratos").select("*").eq("client_id",client.id).is("sociedad_id",null).order("created_at",{ascending:false});
    q.then(({data})=>{setContratos(data||[]);setLoading(false);});
  },[client.id,client._sociedad?.id]);
  if(loading)return <Spinner/>;
  const filtrados=catActiva==="todos"?contratos:contratos.filter(x=>x.tipo===catActiva);
  return(
    <div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {CATS.map(cat=><button key={cat.id} onClick={()=>setCatActiva(cat.id)} style={{fontSize:11,padding:"4px 12px",borderRadius:12,border:"1px solid "+(catActiva===cat.id?"#4A5C45":"#DDE4D8"),background:catActiva===cat.id?"#4A5C45":"none",color:catActiva===cat.id?"#F0F4EE":"#1E2B1A",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>{cat.label}</button>)}
      </div>
      {filtrados.length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin contratos en esta categoría</div>
      :filtrados.map(ctr=>{
        const dias=ctr.vencimiento?Math.ceil((new Date(ctr.vencimiento)-new Date())/(1000*60*60*24)):null;
        const st=dias===null?"vigente":dias<0?"vencido":dias<30?"por renovar":"vigente";
        return(
          <div key={ctr.id} style={{...s.card,marginBottom:8,borderLeft:"3px solid "+STATUS_COLORS[st]}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontFamily:"Georgia, serif",marginBottom:2}}>{ctr.nombre}</div>
                <div style={s.muted}>{ctr.contraparte}{ctr.tipo?" · "+ctr.tipo:""}{ctr.monto?" · $"+ctr.monto:""}</div>
                {ctr.vencimiento&&<div style={{...s.muted,marginTop:2,color:dias<0?"#C0392B":dias<30?"#C9A84C":"#7A9070"}}>Vence: {new Date(ctr.vencimiento).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}{dias!==null&&dias>=0?" · "+dias+" días":" · VENCIDO"}</div>}
                {ctr.notas&&<div style={{...s.muted,marginTop:4,fontStyle:"italic",borderLeft:"2px solid #C9A84C",paddingLeft:8}}>{ctr.notas}</div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",flexShrink:0}}>
                <Badge status={st} label={st}/>
                {ctr.drive_url&&<button style={{...s.btnGold,...s.btnSm}} onClick={()=>setViewingDoc({url:ctr.drive_url,name:ctr.nombre})}>Ver</button>}
              </div>
            </div>
          </div>
        );
      })}
      {viewingDoc&&<DocViewerModal url={viewingDoc.url} name={viewingDoc.name} onClose={()=>setViewingDoc(null)}/>}
    </div>
  );
}
function AdminContratosTab({client}){
  const [contratos,setContratos]=useState([]);const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [viewingDoc,setViewingDoc]=useState(null);
  const [form,setForm]=useState({nombre:"",tipo:"",contraparte:"",vencimiento:"",monto:"",drive_url:"",notas:""});
  const TIPOS=["Con cliente","Con proveedor","De arrendamiento","Laboral clave","Otro"];
  useEffect(()=>{
    const socId=client._sociedad?.id||null;
    const q=socId?supabase.from("contratos").select("*").eq("client_id",client.id).eq("sociedad_id",socId).order("created_at",{ascending:false}):supabase.from("contratos").select("*").eq("client_id",client.id).is("sociedad_id",null).order("created_at",{ascending:false});
    q.then(({data})=>{setContratos(data||[]);setLoading(false);});
  },[client.id,client._sociedad?.id]);
  async function add(){
    if(!form.nombre)return;
    const {drive_name:_dn,...formClean}=form;
    const cData={...formClean,vencimiento:form.vencimiento||null,monto:form.monto||null,drive_url:form.drive_url||null,notas:form.notas||null,contraparte:form.contraparte||null};
    const c={id:"ctr"+Date.now(),client_id:client.id,sociedad_id:client._sociedad?.id||null,...cData,created_at:new Date().toISOString()};
    const r=await supabase.from("contratos").insert(c);
    if(r.error){console.error("CONTRATO ERROR:",r.error.message,r.error.details,JSON.stringify(c));return;}
    setContratos(prev=>[c,...prev]);
    setShowForm(false);setForm({nombre:"",tipo:"",contraparte:"",vencimiento:"",monto:"",drive_url:"",notas:""});
  }
  async function del(id){await supabase.from("contratos").delete().eq("id",id);setContratos(prev=>prev.filter(c=>c.id!==id));}
  if(loading)return <Spinner/>;
  return(
    <div>
      <div style={{...s.flex(),justifyContent:"space-between",marginBottom:16}}>
        <span style={{...s.label,margin:0}}>{contratos.length} contratos</span>
        <button style={s.btnPrimary} onClick={()=>setShowForm(!showForm)}>+ Contrato</button>
      </div>
      {showForm&&<div style={{...s.card,...s.col(),marginBottom:16}}>
        <div style={s.flex()}>
          <input style={s.input} placeholder="Nombre del contrato" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/>
          <select style={{...s.select,width:180}} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
            <option value="">Tipo...</option>{TIPOS.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={s.flex()}>
          <input style={s.input} placeholder="Contraparte" value={form.contraparte} onChange={e=>setForm({...form,contraparte:e.target.value})}/>
          <input style={s.input} placeholder="Monto (opcional)" value={form.monto} onChange={e=>setForm({...form,monto:e.target.value})}/>
        </div>
        <div style={s.flex()}>
          <span style={{...s.muted,whiteSpace:"nowrap",fontSize:12}}>Vencimiento</span>
          <input style={s.input} type="date" value={form.vencimiento} onChange={e=>setForm({...form,vencimiento:e.target.value})}/>
        </div>
        {form.drive_url
          ? <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:"#5A8A3C",fontFamily:"system-ui,sans-serif",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{form.drive_name||"Archivo subido ✓"}</span>
              <button style={{...s.btnDanger}} onClick={()=>setForm({...form,drive_url:"",drive_name:""})}>× Quitar</button>
            </div>
          : <DriveUploader
              clientId={client.id}
              clientName={client.name}
              sociedadNombre={client._sociedad?.nombre}
              modId="contratos"
              modNombre="Contratos"
              docLabel={form.nombre||"Contrato"}
              label="Subir contrato a Drive"
              onUploaded={(url,name)=>setForm(prev=>({...prev,drive_url:url,drive_name:name}))}
            />
        }
        <textarea style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#FFFFFF",fontFamily:"system-ui, sans-serif",resize:"vertical"}} rows={2} placeholder="Notas del despacho (visible para el cliente)" value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})}/>
        <button style={{...s.btnPrimary,alignSelf:"flex-start"}} onClick={add}>Agregar</button>
      </div>}
      {contratos.length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin contratos</div>
      :contratos.map(c=>{
        const dias=c.vencimiento?Math.ceil((new Date(c.vencimiento)-new Date()) / (1000*60*60*24)):null;
        const st=dias===null?"vigente":dias<0?"vencido":dias<30?"por renovar":"vigente";
        return(
          <div key={c.id} style={{...s.card,borderLeft:"3px solid "+STATUS_COLORS[st]}}>
            <div style={{...s.flex(),justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:14,fontFamily:"Georgia, serif"}}>{c.nombre}</div>
                <div style={s.muted}>{c.contraparte}{c.tipo?" · "+c.tipo:""}{c.monto?" · "+c.monto:""}</div>
                {c.vencimiento&&<div style={{...s.muted,marginTop:2}}>Vence: {new Date(c.vencimiento).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}{dias!==null&&dias>=0?" · "+dias+" días":" · VENCIDO"}</div>}
              </div>
              <div style={s.flex()}>
                <span style={s.badge(st)}>{st}</span>
                {c.drive_url&&<a href={c.drive_url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#C9A84C",marginLeft:8}}>↗</a>}
                <button style={{...s.btnDanger,marginLeft:4}} onClick={()=>del(c.id)}>×</button>
              </div>
            </div>
            {c.notas&&<div style={{...s.muted,marginTop:6,fontStyle:"italic",borderLeft:"2px solid #C9A84C",paddingLeft:8}}>{c.notas}</div>}
          </div>
        );
      })}
    </div>
  );
}

function ResumenClientTab({client}){
  const [resumenes,setResumenes]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{supabase.from("resumenes").select("*").eq("client_id",client.id).order("created_at",{ascending:false}).then(({data})=>{setResumenes((data||[]).filter(x=>client._sociedad?x.sociedad_id===client._sociedad.id:!x.sociedad_id));setLoading(false);});},[client.id]);
  if(loading)return <Spinner/>;
  return(
    <div>
      <span style={s.label}>Resumen del despacho</span>
      {resumenes.length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin resúmenes publicados aún</div>
      :resumenes.map(r=><div key={r.id} style={{...s.card,borderLeft:"3px solid #C9A84C",marginBottom:12}}>
        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#C9A84C",fontFamily:"system-ui,sans-serif",marginBottom:8}}>{r.mes}</div>
        <div style={{fontSize:14,fontFamily:"system-ui,sans-serif",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{r.contenido}</div>
      </div>)}
    </div>
  );
}

function AdminResumenTab({client}){
  const [resumenes,setResumenes]=useState([]);const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const mesActual=new Date().toLocaleDateString("es-MX",{month:"long",year:"numeric"});
  const [form,setForm]=useState({mes:mesActual,contenido:""});
  const [saved,setSaved]=useState("");
  useEffect(()=>{supabase.from("resumenes").select("*").eq("client_id",client.id).order("created_at",{ascending:false}).then(({data})=>{setResumenes((data||[]).filter(x=>client._sociedad?x.sociedad_id===client._sociedad.id:!x.sociedad_id));setLoading(false);});},[client.id]);
  async function publish(){
    if(!form.contenido.trim())return;
    const r={id:"res"+Date.now(),client_id:client.id,mes:form.mes,contenido:form.contenido,created_at:new Date().toISOString()};
    await supabase.from("resumenes").insert(r);setResumenes(prev=>[r,...prev]);
    setShowForm(false);setForm({mes:mesActual,contenido:""});
    setSaved("Resumen publicado");setTimeout(()=>setSaved(""),2000);
  }
  async function del(id){await supabase.from("resumenes").delete().eq("id",id);setResumenes(prev=>prev.filter(r=>r.id!==id));}
  if(loading)return <Spinner/>;
  return(
    <div>
      {saved&&<div style={{fontSize:12,color:"#5A8A3C",fontFamily:"system-ui,sans-serif",marginBottom:12}}>{saved}</div>}
      <div style={{...s.flex(),justifyContent:"space-between",marginBottom:16}}>
        <span style={{...s.label,margin:0}}>Resúmenes mensuales</span>
        <button style={s.btnPrimary} onClick={()=>setShowForm(!showForm)}>+ Nuevo resumen</button>
      </div>
      {showForm&&<div style={{...s.card,display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        <input style={s.input} value={form.mes} onChange={e=>setForm({...form,mes:e.target.value})} placeholder="Mes"/>
        <textarea style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#FFFFFF",fontFamily:"system-ui, sans-serif",resize:"vertical"}} rows={8} placeholder="Contenido del resumen..." value={form.contenido} onChange={e=>setForm({...form,contenido:e.target.value})}/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button style={s.btn} onClick={()=>setShowForm(false)}>Cancelar</button>
          <button style={s.btnPrimary} onClick={publish} disabled={!form.contenido.trim()}>Publicar en panel del cliente</button>
        </div>
      </div>}
      {resumenes.length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin resúmenes</div>
      :resumenes.map(r=><div key={r.id} style={{...s.card,borderLeft:"3px solid #C9A84C",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#C9A84C",fontFamily:"system-ui,sans-serif",marginBottom:6}}>{r.mes}</div>
            <div style={{fontSize:13,fontFamily:"system-ui,sans-serif",lineHeight:1.7,whiteSpace:"pre-wrap",color:"#888880"}}>{r.contenido.length>200?r.contenido.slice(0,200)+"...":r.contenido}</div>
          </div>
          <button style={{...s.btnDanger,marginLeft:12,flexShrink:0}} onClick={()=>del(r.id)}>×</button>
        </div>
      </div>)}
    </div>
  );
}

function HistorialClientTab({client}){
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filtroTipo,setFiltroTipo]=useState("todos");
  const socId=client._sociedad?.id||null;

  useEffect(()=>{
    const q=socId
      ?supabase.from("actividad_log").select("*").eq("client_id",client.id).eq("sociedad_id",socId).order("created_at",{ascending:false}).limit(100)
      :supabase.from("actividad_log").select("*").eq("client_id",client.id).is("sociedad_id",null).order("created_at",{ascending:false}).limit(100);
    q.then(({data})=>{setLogs(data||[]);setLoading(false);});
  },[client.id,socId]);

  const TIPOS={
    checklist:{label:"Cumplimiento",color:"#4A5C45",bg:"#E8F0E8",icon:"✅"},
    documento:{label:"Documento",color:"#185FA5",bg:"#EBF4FF",icon:"📄"},
    accion:{label:"Próximo paso",color:"#C9A84C",bg:"#FFF8E7",icon:"→"},
    datos:{label:"Datos",color:"#7A9070",bg:"#F0F4EE",icon:"📝"},
    nota:{label:"Nota",color:"#7A9070",bg:"#F0F4EE",icon:"💬"},
  };

  const filtrados=filtroTipo==="todos"?logs:logs.filter(l=>l.tipo===filtroTipo);

  if(loading)return <div style={{textAlign:"center",padding:"3rem",color:"#7A9070",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando historial...</div>;

  return(
    <div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {["todos","checklist","documento","accion","datos"].map(tipo=>(
          <button key={tipo} onClick={()=>setFiltroTipo(tipo)} style={{fontSize:11,padding:"4px 12px",borderRadius:12,border:"1px solid "+(filtroTipo===tipo?"#4A5C45":"#DDE4D8"),background:filtroTipo===tipo?"#4A5C45":"none",color:filtroTipo===tipo?"#F0F4EE":"#1E2B1A",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>
            {tipo==="todos"?"Todos":TIPOS[tipo]?.label||tipo}
          </button>
        ))}
        <span style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif",alignSelf:"center",marginLeft:"auto"}}>{filtrados.length} registros</span>
      </div>

      {filtrados.length===0&&<div style={{textAlign:"center",padding:"3rem",color:"#7A9070",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin actividad registrada aún</div>}

      {filtrados.map((log,i)=>{
        const t=TIPOS[log.tipo]||{label:log.tipo,color:"#7A9070",bg:"#F5F2ED",icon:"·"};
        const fecha=new Date(log.created_at);
        const fechaStr=fecha.toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"});
        const horaStr=fecha.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});
        return(
          <div key={log.id} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:i<filtrados.length-1?"1px solid #DDE4D8":"none"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{t.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1E2B1A",marginBottom:2}}>{log.descripcion}</div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:10,padding:"1px 6px",borderRadius:2,background:t.bg,color:t.color,fontFamily:"system-ui,sans-serif"}}>{t.label}</span>
                {log.modulo&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:2,background:"#F0F4EE",color:"#4A5C45",fontFamily:"system-ui,sans-serif"}}>{log.modulo}</span>}
                <span style={{fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>{log.admin_nombre}</span>
              </div>
            </div>
            <div style={{flexShrink:0,textAlign:"right"}}>
              <div style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>{fechaStr}</div>
              <div style={{fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>{horaStr}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


function NotifBell({clientId}){
  const [notifs,setNotifs]=useState([]);const [open,setOpen]=useState(false);
  useEffect(()=>{
    supabase.from("notificaciones").select("*").eq("client_id",clientId).order("created_at",{ascending:false}).limit(20).then(({data})=>setNotifs(data||[]));
  },[clientId]);
  const unread=notifs.filter(n=>!n.leida).length;
  async function markRead(){
    await supabase.from("notificaciones").update({leida:true}).eq("client_id",clientId).eq("leida",false);
    setNotifs(prev=>prev.map(n=>({...n,leida:true})));
  }
  const iconMap={documento:"📄",semaforo:"🔴",solicitud:"✉️",asamblea:"🏛️",contrato:"📋",resumen:"📊",default:"🔔"};
  return(
    <div style={{position:"relative"}}>
      <button style={{...{background:"none",border:"1px solid rgba(255,255,255,.2)",borderRadius:2,padding:"4px 10px",fontSize:12,cursor:"pointer",color:"rgba(255,255,255,.7)",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"},position:"relative"}} onClick={()=>{setOpen(!open);if(!open&&unread>0)markRead();}}>
        🔔{unread>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#C0392B",color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>{unread}</span>}
      </button>
      {open&&<div style={{position:"absolute",right:0,top:36,background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,width:300,maxHeight:360,overflowY:"auto",zIndex:200,boxShadow:"0 8px 32px rgba(0,0,0,.12)"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #E2DDD6",fontSize:11,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif"}}>Notificaciones</div>
        {notifs.length===0?<div style={{padding:"1.5rem",textAlign:"center",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin notificaciones</div>
        :notifs.map(n=><div key={n.id} style={{padding:"10px 14px",borderBottom:"1px solid #f0f0f0",background:n.leida?"#fff":"#fffbf0"}}>
          <div style={{fontSize:13,fontFamily:"system-ui,sans-serif",color:"#1a1a1a"}}>{iconMap[n.tipo]||iconMap.default} {n.mensaje}</div>
          <div style={{fontSize:11,color:"#888880",marginTop:3,fontFamily:"system-ui,sans-serif"}}>{new Date(n.created_at).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}</div>
        </div>)}
      </div>}
    </div>
  );
}

function OnboardingScreen({client,onComplete}){
  function handleComplete(){
    try{localStorage.setItem("mm_onboarding_done_"+client.id,"1");}catch{}
    onComplete();
  }
  const [step,setStep]=useState(0);
  const steps=[
    {icon:"🏢",titulo:"Bienvenido a tu Panel Corporativo",desc:"Este es tu espacio para conocer el estado legal de tu empresa en tiempo real. Tu despacho M&M lo mantiene actualizado — tú solo tienes que revisarlo."},
    {icon:"✅",titulo:"Tu cumplimiento en un vistazo",desc:"En la pantalla principal verás tu porcentaje de cumplimiento, alertas críticas y próximos vencimientos. Todo calculado automáticamente por tu despacho."},
    {icon:"📁",titulo:"Tus módulos legales",desc:"Cada área de tu empresa tiene su propio módulo — Laboral, Corporativo, Fiscal, Migratorio y más. Haz click en cualquiera para ver el detalle de cumplimiento y los documentos."},
    {icon:"💬",titulo:"Pídele cosas a tu despacho",desc:"¿Necesitas una asamblea, un poder notarial o un contrato? Usa el botón 'Solicitar al despacho' y M&M te responde directamente desde este panel."},
  ];
  const s2=steps[step];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:"1rem"}}>
      <div style={{background:"#fff",border:"1px solid #E2DDD6",padding:"2.5rem 2rem",width:"min(500px,100%)",display:"flex",flexDirection:"column",gap:20}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:10,letterSpacing:".18em",textTransform:"uppercase",color:"#C9A84C",fontFamily:"system-ui,sans-serif",marginBottom:12}}>Bienvenido a tu panel corporativo</div>
          <div style={{fontSize:32,marginBottom:12}}>{s2.icon}</div>
          <div style={{fontSize:20,fontFamily:"'Georgia',serif",marginBottom:8}}>{s2.titulo}</div>
          <div style={{fontSize:14,color:"#888880",fontFamily:"system-ui,sans-serif",lineHeight:1.6}}>{s2.desc}</div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:6,margin:"4px 0"}}>
          {steps.map((_,i)=><div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?"#C9A84C":"#E2DDD6",transition:"width .3s"}}/>)}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          {step>0&&<button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={()=>setStep(s=>s-1)}>← Anterior</button>}
          <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={()=>{if(step<steps.length-1){setStep(s=>s+1);}else{handleComplete();}}}>
            {step<steps.length-1?"Siguiente →":"Comenzar"}
          </button>
        </div>
        <div style={{textAlign:"center"}}><button style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif"}} onClick={handleComplete}>Omitir por ahora</button></div>
      </div>
    {viewingDoc&&<DocViewerModal url={viewingDoc.url} name={viewingDoc.name} onClose={()=>setViewingDoc(null)}/>}
    </div>
  );
}

function AdminPagosTab({client}){
  const [pagos,setPagos]=useState([]);const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const mesActual=new Date().toLocaleDateString("es-MX",{month:"long",year:"numeric"});
  const [form,setForm]=useState({mes:mesActual,monto:"",status:"pendiente",nota:""});
  const [saved,setSaved]=useState("");

  useEffect(()=>{supabase.from("pagos").select("*").eq("client_id",client.id).order("created_at",{ascending:false}).then(({data})=>{setPagos((data||[]).filter(x=>client._sociedad?x.sociedad_id===client._sociedad.id:!x.sociedad_id));setLoading(false);});},[client.id]);

  async function add(){
    if(!form.mes)return;
    const p={id:"pag"+Date.now(),client_id:client.id,...form,created_at:new Date().toISOString()};
    await supabase.from("pagos").insert(p);setPagos(prev=>[p,...prev]);
    setShowForm(false);setForm({mes:mesActual,monto:"",status:"pendiente",nota:""});
    setSaved("Pago registrado ✓");setTimeout(()=>setSaved(""),2000);
  }
  async function toggleStatus(id,current){
    const next=current==="pagado"?"pendiente":"pagado";
    await supabase.from("pagos").update({status:next}).eq("id",id);
    setPagos(prev=>prev.map(p=>p.id===id?{...p,status:next}:p));
  }
  async function del(id){await supabase.from("pagos").delete().eq("id",id);setPagos(prev=>prev.filter(p=>p.id!==id));}

  if(loading)return <Spinner/>;
  const pendientes=pagos.filter(p=>p.status==="pendiente").length;
  return(
    <div>
      {saved&&<div style={{fontSize:12,color:"#5A8A3C",fontFamily:"system-ui,sans-serif",marginBottom:12}}>{saved}</div>}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:1}}>
          <div style={{fontSize:22,fontWeight:400,color:pendientes>0?"#C0392B":"#5A8A3C",fontFamily:"'Georgia',serif"}}>{pendientes}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Meses sin pagar</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:1}}>
          <div style={{fontSize:22,fontWeight:400,color:"#5A8A3C",fontFamily:"'Georgia',serif"}}>{pagos.filter(p=>p.status==="pagado").length}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Meses pagados</div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:400,color:"#888880",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Historial de facturación</span>
        <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={()=>setShowForm(!showForm)}>+ Mes</button>
      </div>
      {showForm&&<div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"1rem 1.25rem",marginBottom:8,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",gap:8}}>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} value={form.mes} onChange={e=>setForm({...form,mes:e.target.value})} placeholder="Mes"/>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} value={form.monto} onChange={e=>setForm({...form,monto:e.target.value})} placeholder="Monto"/>
        </div>
        <select style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"8px 10px",fontSize:13,background:"#fff",cursor:"pointer",boxSizing:"border-box",fontFamily:"system-ui,sans-serif"}} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
        </select>
        <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} value={form.nota} onChange={e=>setForm({...form,nota:e.target.value})} placeholder="Nota (opcional)"/>
        <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase",alignSelf:"flex-start"}} onClick={add}>Agregar</button>
      </div>}
      {pagos.length===0?<div style={{textAlign:"center",padding:"3rem 0",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin registros de pago</div>
      :pagos.map(p=><div key={p.id} style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"1rem 1.25rem",marginBottom:8,display:"flex",alignItems:"center",gap:12,borderLeft:"3px solid "+p.status==="pagado"?"#5A8A3C":"#C0392B"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontFamily:"'Georgia',serif"}}>{p.mes}</div>
          <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif"}}>{p.monto||"-"}{p.nota?" · "+p.nota:""}</div>
        </div>
        <button style={{background:p.status==="pagado"?"#5A8A3C":"none",color:p.status==="pagado"?"#fff":"#C0392B",border:p.status==="pagado"?"none":"1px solid #fca5a5",borderRadius:2,padding:"3px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>toggleStatus(p.id,p.status)}>{p.status==="pagado"?"✓ Pagado":"Pendiente"}</button>
        <button style={{border:"1px solid #fca5a5",color:"#dc2626",background:"none",borderRadius:2,padding:"3px 10px",fontSize:11,cursor:"pointer"}} onClick={()=>del(p.id)}>×</button>
      </div>)}
    </div>
  );
}

function AdminTareasTab({client,admin}){
  const [tareas,setTareas]=useState([]);const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({titulo:"",descripcion:"",asignado:admin?.name||"",due:"",status:"pendiente"});
  const [saved,setSaved]=useState("");

  useEffect(()=>{supabase.from("tareas").select("*").eq("client_id",client.id).order("created_at",{ascending:false}).then(({data})=>{setTareas((data||[]).filter(x=>client._sociedad?x.sociedad_id===client._sociedad.id:!x.sociedad_id));setLoading(false);});},[client.id]);

  async function add(){
    if(!form.titulo)return;
    const t={id:"tar"+Date.now(),client_id:client.id,...form,created_at:new Date().toISOString()};
    await supabase.from("tareas").insert(t);setTareas(prev=>[t,...prev]);
    setShowForm(false);setForm({titulo:"",descripcion:"",asignado:admin?.name||"",due:"",status:"pendiente"});
    setSaved("Tarea creada ✓");setTimeout(()=>setSaved(""),2000);
  }
  async function toggleStatus(id,current){
    const next=current==="completada"?"pendiente":"completada";
    await supabase.from("tareas").update({status:next}).eq("id",id);
    setTareas(prev=>prev.map(t=>t.id===id?{...t,status:next}:t));
  }
  async function del(id){await supabase.from("tareas").delete().eq("id",id);setTareas(prev=>prev.filter(t=>t.id!==id));}

  if(loading)return <Spinner/>;
  const pendientes=tareas.filter(t=>t.status==="pendiente").length;
  return(
    <div>
      {saved&&<div style={{fontSize:12,color:"#5A8A3C",fontFamily:"system-ui,sans-serif",marginBottom:12}}>{saved}</div>}
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,alignItems:"center"}}>
        <span style={{fontSize:10,fontWeight:400,color:"#888880",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>{pendientes} tareas por hacer</span>
        <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={()=>setShowForm(!showForm)}>+ Tarea</button>
      </div>
      {showForm&&<div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"1rem 1.25rem",marginBottom:8,display:"flex",flexDirection:"column",gap:8}}>
        <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Título de la tarea" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/>
        <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Descripción (opcional)" value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})}/>
        <div style={{display:"flex",gap:8}}>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Asignado a" value={form.asignado} onChange={e=>setForm({...form,asignado:e.target.value})}/>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} type="date" value={form.due} onChange={e=>setForm({...form,due:e.target.value})}/>
        </div>
        <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase",alignSelf:"flex-start"}} onClick={add}>Agregar tarea</button>
      </div>}
      {tareas.length===0?<div style={{textAlign:"center",padding:"3rem 0",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin tareas registradas</div>
      :tareas.map(t=><div key={t.id} style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"1rem 1.25rem",marginBottom:8,display:"flex",alignItems:"flex-start",gap:12,opacity:t.status==="completada"?.6:1,borderLeft:"3px solid "+t.status==="completada"?"#5A8A3C":"#C9A84C"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontFamily:"'Georgia',serif",textDecoration:t.status==="completada"?"line-through":"none"}}>{t.titulo}</div>
          {t.descripcion&&<div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>{t.descripcion}</div>}
          <div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:4}}>{t.asignado&&"→ "+t.asignado}{t.due&&" · Vence: "+new Date(t.due).toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button style={{background:t.status==="completada"?"#5A8A3C":"none",color:t.status==="completada"?"#fff":"#5A8A3C",border:"1px solid #5A8A3C",borderRadius:2,padding:"3px 10px",fontSize:11,cursor:"pointer"}} onClick={()=>toggleStatus(t.id,t.status)}>{t.status==="completada"?"✓":"Completar"}</button>
          <button style={{border:"1px solid #fca5a5",color:"#dc2626",background:"none",borderRadius:2,padding:"3px 10px",fontSize:11,cursor:"pointer"}} onClick={()=>del(t.id)}>×</button>
        </div>
      </div>)}
    </div>
  );
}

function AdminDashboard({clients,onSelectClient}){
  const [data,setData]=useState({});const [loading,setLoading]=useState(true);
  useEffect(()=>{
    async function load(){
      const results={};
      await Promise.all(clients.map(async c=>{
        const [a,r,ctr,t]=await Promise.all([
          supabase.from("areas").select("status").eq("client_id",c.id),
          supabase.from("requests").select("status").eq("client_id",c.id).eq("status","pendiente"),
          supabase.from("contratos").select("vencimiento").eq("client_id",c.id),
          supabase.from("tareas").select("status").eq("client_id",c.id).eq("status","pendiente"),
        ]);
        const areas=a.data||[];
        const w={green:100,amber:50,red:0};
        const score=areas.length?Math.round(areas.reduce((s,x)=>s+(w[x.status]??0),0)/areas.length):0;
        const hoy=new Date();
        const en7=new Date(hoy);en7.setDate(hoy.getDate()+7);
        const vencen=(ctr.data||[]).filter(x=>x.vencimiento&&new Date(x.vencimiento)<=en7&&new Date(x.vencimiento)>=hoy).length;
        results[c.id]={score,criticos:areas.filter(x=>x.status==="red").length,solicitudes:r.data?.length||0,vencen,tareas:t.data?.length||0};
      }));
      setData(results);setLoading(false);
    }
    load();
  },[clients]);

  if(loading)return <Spinner/>;
  const scoreColor=s=>s>=70?"#5A8A3C":s>=40?"#C9A84C":"#C0392B";

  return(
    <div>
      <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:16}}>Estado de tus empresas · {clients.length} clientes</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        {clients.map(c=>{
          const d=data[c.id]||{};
          return(
            <div key={c.id} style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"1.25rem",cursor:"pointer",transition:"border-color .15s"}} onClick={()=>onSelectClient(c.id)} onMouseEnter={e=>e.currentTarget.style.borderColor="#1a1a1a"} onMouseLeave={e=>e.currentTarget.style.borderColor="#E2DDD6"}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:14,fontFamily:"'Georgia',serif"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>Cliente {c.id}</div>
                </div>
                <div style={{fontSize:24,fontWeight:400,color:scoreColor(d.score||0),fontFamily:"'Georgia',serif"}}>{d.score||0}</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {d.criticos>0&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#fef2f2",color:"#991b1b",fontFamily:"system-ui,sans-serif"}}>⚠ {d.criticos} crítico{d.criticos!==1?"s":""}</span>}
                {d.solicitudes>0&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#fffbeb",color:"#92400e",fontFamily:"system-ui,sans-serif"}}>✉ {d.solicitudes} solicitud{d.solicitudes!==1?"es":""}</span>}
                {d.vencen>0&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#fef2f2",color:"#991b1b",fontFamily:"system-ui,sans-serif"}}>📋 {d.vencen} vence{d.vencen!==1?"n":""} pronto</span>}
                {d.tareas>0&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#f0fdf4",color:"#166534",fontFamily:"system-ui,sans-serif"}}>✓ {d.tareas} tarea{d.tareas!==1?"s":""}</span>}
                {!d.criticos&&!d.solicitudes&&!d.vencen&&!d.tareas&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#f0fdf4",color:"#166534",fontFamily:"system-ui,sans-serif"}}>Al corriente</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const KYC_DOC_LABELS = {
  identificacion_oficial: "Identificación oficial vigente",
  comprobante_domicilio: "Comprobante de domicilio",
  rfc: "RFC y cédula fiscal",
  curp: "CURP",
  origen_recursos: "Declaración de origen de recursos",
  pep: "Declaración PEP",
  beneficiario_final: "Declaración de beneficiario final",
  estado_cuenta: "Estado de cuenta bancario",
  declaracion_impuestos: "Declaración de impuestos reciente",
};

const INDUSTRIA_LABELS = {
  inmobiliaria: "Intermediación Inmobiliaria",
  marketing: "Marketing / Publicidad",
  retail: "Retail / Comercio",
  tecnologia: "Tecnología / Startups",
  servicios: "Servicios Profesionales",
  manufactura: "Manufactura / Industrial",
  financiero: "Financiero / Fintech",
  general: "General",
};

// ── PERFIL DE PERSONA (Apoderado o Accionista) ────────────────
function PersonaModal({client,industria_config,persona,onClose,onSaved}){
  const isEdit=!!persona;
  const [form,setForm]=useState(persona||{
    tipo:"apoderado",nombre:"",rfc:"",curp:"",domicilio:"",empresa:"",cargo:"",
    participacion:"",fecha_entrada:"",status:"activo",pep:false,pep_detalle:"",
    origen_recursos:"",beneficiario_final:false,industria_extra:{},
    num_escritura:"",notario:"",num_notaria:"",fecha_escritura:"",tipo_poder:"",alcance:[]
  });
  const [saving,setSaving]=useState(false);
  const cfg=industria_config||{obligatorios:[],opcionales:[],campos_extra:[]};

  async function save(){
    setSaving(true);
    if(isEdit){
      await supabase.from("personas").update(form).eq("id",persona.id);
      onSaved({...persona,...form});
    } else {
      const p={id:"per"+Date.now(),client_id:client.id,sociedad_id:client._sociedad?.id||null,...form,created_at:new Date().toISOString()};
      await supabase.from("personas").insert(p);
      // Create KYC doc placeholders
      const docs=[...cfg.obligatorios,...cfg.opcionales].map(tipo=>({
        id:"kyc"+Date.now()+Math.random().toString(36).slice(2),
        persona_id:p.id,client_id:client.id,tipo,status:"pendiente",drive_url:"",created_at:new Date().toISOString()
      }));
      if(docs.length)await supabase.from("kyc_docs").insert(docs);
      onSaved(p);
    }
    setSaving(false);onClose();
  }

  const TIPO_LABELS={apoderado:"Apoderado",accionista:"Accionista",administrador:"Administrador",comisario:"Comisario"};
  const TIPO_COLORS={apoderado:"#185FA5",accionista:"#888880",administrador:"#5A8A3C",comisario:"#7B4F9E"};

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:"1rem",overflowY:"auto"}} onClick={onClose}>
      <div style={{background:"#fff",border:"1px solid #E2DDD6",padding:"2rem",width:"min(580px,100%)",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <span style={{width:40,height:1,background:"#C9A84C",display:"block",marginBottom:12}}/>
        <div style={{fontSize:16,fontFamily:"'Georgia',serif",marginBottom:4}}>{isEdit?"Editar perfil":"Nuevo perfil"}</div>
        <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:20}}>
          {client.name} · {INDUSTRIA_LABELS[client.industria]||"General"}
          {cfg.lfpiorpi&&<span style={{marginLeft:8,fontSize:10,padding:"2px 7px",background:"#fef2f2",color:"#991b1b",borderRadius:2,fontFamily:"system-ui,sans-serif"}}>LFPIORPI aplicable</span>}
        </div>

        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:8}}>Tipo</div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {["apoderado","accionista","administrador","comisario"].map(t=><button key={t} style={{flex:1,minWidth:100,background:form.tipo===t?"#1a1a1a":"none",color:form.tipo===t?"#fff":"#1a1a1a",border:"1px solid #E2DDD6",borderColor:form.tipo===t?"#1a1a1a":"#E2DDD6",borderRadius:2,padding:"7px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",textTransform:"capitalize"}} onClick={()=>setForm({...form,tipo:t})}>{TIPO_LABELS[t]}</button>)}
        </div>

        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:8,marginTop:16}}>Datos personales</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Nombre completo *" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/>
          <div style={{display:"flex",gap:8}}>
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="RFC" value={form.rfc} onChange={e=>setForm({...form,rfc:e.target.value.toUpperCase()})}/>
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="CURP" value={form.curp} onChange={e=>setForm({...form,curp:e.target.value.toUpperCase()})}/>
          </div>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Domicilio" value={form.domicilio} onChange={e=>setForm({...form,domicilio:e.target.value})}/>
          <div style={{display:"flex",gap:8}}>
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Empresa donde trabaja" value={form.empresa} onChange={e=>setForm({...form,empresa:e.target.value})}/>
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Cargo / Rol" value={form.cargo} onChange={e=>setForm({...form,cargo:e.target.value})}/>
          </div>
          {form.tipo==="apoderado"&&<>
            <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:8,marginTop:12}}>Documento que le da el poder</div>
            <div style={{display:"flex",gap:8}}>
              <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Número de escritura" value={form.num_escritura||""} onChange={e=>setForm({...form,num_escritura:e.target.value})}/>
              <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Nombre del notario" value={form.notario||""} onChange={e=>setForm({...form,notario:e.target.value})}/>
            </div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Número de notaría" value={form.num_notaria||""} onChange={e=>setForm({...form,num_notaria:e.target.value})}/>
              <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} type="date" placeholder="Fecha de la escritura" value={form.fecha_escritura||""} onChange={e=>setForm({...form,fecha_escritura:e.target.value})}/>
            </div>
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif",marginTop:8}} placeholder="¿Para qué está autorizado? (ej. Poder General, Poder para cuentas bancarias)" value={form.tipo_poder||""} onChange={e=>setForm({...form,tipo_poder:e.target.value})}/>
            <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:8,marginTop:12}}>Alcance del poder - instituciones y registros vinculados</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {Object.entries(ALCANCE_PODER).map(([cat,items])=>(
                <div key={cat}>
                  <div style={{fontSize:11,fontWeight:600,color:"#1a1a1a",fontFamily:"system-ui,sans-serif",marginBottom:6,letterSpacing:".04em"}}>{cat}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {items.map(item=>(
                      <label key={item} style={{display:"flex",gap:8,alignItems:"center",cursor:"pointer",fontSize:12,fontFamily:"system-ui,sans-serif",color:(form.alcance||[]).includes(item)?"#1a1a1a":"#555"}}>
                        <input type="checkbox" checked={(form.alcance||[]).includes(item)} onChange={()=>{const a=form.alcance||[];setForm({...form,alcance:a.includes(item)?a.filter(x=>x!==item):[...a,item]});}} style={{accentColor:"#C9A84C",flexShrink:0}}/>
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>}
          {form.tipo==="accionista"&&<div style={{display:"flex",gap:8}}>
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="% de participación" value={form.participacion} onChange={e=>setForm({...form,participacion:e.target.value})}/>
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Fecha de entrada" type="date" value={form.fecha_entrada} onChange={e=>setForm({...form,fecha_entrada:e.target.value})}/>
          </div>}
          {(form.tipo==="administrador"||form.tipo==="comisario")&&<>
            <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:8,marginTop:12}}>Documento de nombramiento</div>
            <div style={{display:"flex",gap:8}}>
              <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder={form.tipo==="administrador"?"Número de escritura / Acta de asamblea":"Acta de asamblea de designación"} value={form.num_escritura||""} onChange={e=>setForm({...form,num_escritura:e.target.value})}/>
              <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} type="date" placeholder="Fecha de designación" value={form.fecha_escritura||""} onChange={e=>setForm({...form,fecha_escritura:e.target.value})}/>
            </div>
            {form.tipo==="administrador"&&<div style={{display:"flex",gap:8,marginTop:8}}>
              <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Nombre del notario (si aplica)" value={form.notario||""} onChange={e=>setForm({...form,notario:e.target.value})}/>
              <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Número de notaría" value={form.num_notaria||""} onChange={e=>setForm({...form,num_notaria:e.target.value})}/>
            </div>}
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif",marginTop:8}} placeholder={form.tipo==="administrador"?"Ej: Administrador Único, Consejero Presidente":"Alcance de su función de vigilancia"} value={form.tipo_poder||""} onChange={e=>setForm({...form,tipo_poder:e.target.value})}/>
          </>}
        </div>

        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:8,marginTop:16}}>Compliance</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <label style={{display:"flex",gap:10,alignItems:"center",cursor:"pointer",fontSize:13,fontFamily:"system-ui,sans-serif"}}>
            <input type="checkbox" checked={form.pep} onChange={e=>setForm({...form,pep:e.target.checked})} style={{accentColor:"#C9A84C"}}/>
            Persona Políticamente Expuesta (PEP)
          </label>
          {form.pep&&<input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Cargo público o relación con PEP" value={form.pep_detalle} onChange={e=>setForm({...form,pep_detalle:e.target.value})}/>}
          <label style={{display:"flex",gap:10,alignItems:"center",cursor:"pointer",fontSize:13,fontFamily:"system-ui,sans-serif"}}>
            <input type="checkbox" checked={form.beneficiario_final} onChange={e=>setForm({...form,beneficiario_final:e.target.checked})} style={{accentColor:"#C9A84C"}}/>
            Es beneficiario final real de la empresa
          </label>
          {(cfg.obligatorios.includes("origen_recursos")||cfg.opcionales.includes("origen_recursos"))&&
            <textarea style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif",resize:"vertical"}} rows={2} placeholder="Origen y fuente de recursos / ingresos" value={form.origen_recursos} onChange={e=>setForm({...form,origen_recursos:e.target.value})}/>
          }
        </div>

        {cfg.campos_extra&&cfg.campos_extra.length>0&&<>
          <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:8,marginTop:16}}>Datos de industria - {INDUSTRIA_LABELS[client.industria]||"General"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {cfg.campos_extra.map(campo=>(
              <div key={campo.id}>
                {campo.tipo==="select"
                  ?<select style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"8px 10px",fontSize:13,background:"#fff",cursor:"pointer",boxSizing:"border-box",fontFamily:"system-ui,sans-serif"}} value={(form.industria_extra||{})[campo.id]||""} onChange={e=>setForm({...form,industria_extra:{...(form.industria_extra||{}),[campo.id]:e.target.value}})}>
                    <option value="">{campo.label}...</option>
                    {campo.opciones.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                  :<input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder={campo.label} value={(form.industria_extra||{})[campo.id]||""} onChange={e=>setForm({...form,industria_extra:{...(form.industria_extra||{}),[campo.id]:e.target.value}})}/>
                }
              </div>
            ))}
          </div>
        </>}

        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:20}}>
          <button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={onClose}>Cancelar</button>
          <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={save} disabled={!form.nombre||saving}>{saving?"Guardando...":"Guardar"}</button>
        </div>
      </div>
    </div>
  );
}

// ── USO DE PODERES MODAL ──────────────────────────────────────
function UsoPoderesModal({persona,client,onClose}){
  const [usos,setUsos]=useState([]);const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({tipo_acto:"",descripcion:"",fecha:""});
  const [saved,setSaved]=useState("");

  useEffect(()=>{
    supabase.from("uso_poderes").select("*").eq("persona_id",persona.id).order("created_at",{ascending:false}).then(({data})=>{setUsos(data||[]);setLoading(false);});
  },[persona.id]);

  async function add(){
    if(!form.tipo_acto)return;
    const u={id:"uso"+Date.now(),persona_id:persona.id,client_id:client.id,...form,created_at:new Date().toISOString()};
    await supabase.from("uso_poderes").insert(u);
    // Notify admins via notificaciones table (client_id=null means for all admins)
    const msg=`${persona.nombre} usó poder: {form.tipo_acto}${form.descripcion?"  -  "+form.descripcion:""}`;
    // Store as notificacion for the client (despacho lo ve en solicitudes)
    await supabase.from("notificaciones").insert({
      id:"notif"+Date.now(),
      client_id:client.id,
      tipo:"poder",
      mensaje:msg,
      leida:false,
      created_at:new Date().toISOString()
    });
    // Also create a request so admin sees it in Solicitudes
    await supabase.from("requests").insert({
      id:"req"+Date.now(),
      client_id:client.id,
      label:"Uso de poder registrado",
      type:"uso_poder",
      notes:msg,
      status:"pendiente",
      date:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})
    });
    setUsos(prev=>[u,...prev]);
    setShowForm(false);setForm({tipo_acto:"",descripcion:"",fecha:""});
    setSaved("Acto registrado. El despacho ha sido notificado.");
  }
  async function del(id){await supabase.from("uso_poderes").delete().eq("id",id);setUsos(prev=>prev.filter(u=>u.id!==id));}

  const TIPOS_ACTO=["Firma de contrato","Representación ante notario","Apertura de cuenta bancaria","Firma ante SAT","Representación en juicio","Acto de dominio","Administración de bienes","Otro"];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:"1rem"}} onClick={onClose}>
      <div style={{background:"#fff",border:"1px solid #E2DDD6",padding:"2rem",width:"min(520px,100%)",maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <span style={{width:40,height:1,background:"#C9A84C",display:"block",marginBottom:12}}/>
        <div style={{fontSize:16,fontFamily:"'Georgia',serif",marginBottom:4}}>Uso de poderes</div>
        <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:4}}>{persona.nombre}</div>
        {(persona.num_escritura||persona.tipo_poder||persona.alcance?.length>0)&&<div style={{background:"#F5F2ED",border:"1px solid #E2DDD6",borderRadius:4,padding:"10px 14px",marginBottom:16}}>
          {persona.tipo_poder&&<div style={{fontSize:13,fontFamily:"'Georgia',serif",color:"#1a1a1a",marginBottom:4}}>{persona.tipo_poder}</div>}
          <div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif"}}>
            {persona.num_escritura&&"Escritura "+persona.num_escritura}
            {persona.notario&&" · Not. "+persona.notario}
            {persona.num_notaria&&" No. "+persona.num_notaria}
            {persona.fecha_escritura&&" · "+new Date(persona.fecha_escritura).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}
          </div>
          {persona.alcance&&persona.alcance.length>0&&<div style={{marginTop:8}}>
            <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:6}}>Alcance vinculado</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {persona.alcance.map(a=><span key={a} style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#fff",color:"#888880",fontFamily:"system-ui,sans-serif",border:"1px solid #E2DDD6"}}>{a}</span>)}
            </div>
          </div>}
        </div>}
        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:12}}>Historial de gestiones</div>
        {saved&&<div style={{fontSize:12,color:"#5A8A3C",fontFamily:"system-ui,sans-serif",marginBottom:10,padding:"8px 12px",background:"#f0fdf4",borderRadius:4}}>{saved}</div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif"}}>{usos.length} actos registrados</span>
          <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={()=>setShowForm(!showForm)}>+ Registrar gestión</button>
        </div>
        {showForm&&<div style={{background:"#F5F2ED",border:"1px solid #E2DDD6",borderRadius:4,padding:"1rem",marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
          <select style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"8px 10px",fontSize:13,background:"#fff",cursor:"pointer",boxSizing:"border-box",fontFamily:"system-ui,sans-serif"}} value={form.tipo_acto} onChange={e=>setForm({...form,tipo_acto:e.target.value})}>
            <option value="">Tipo de acto...</option>{TIPOS_ACTO.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Descripción del acto" value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})}/>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/>
          <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase",alignSelf:"flex-start"}} onClick={add} disabled={!form.tipo_acto}>Guardar</button>
        </div>}
        {loading?<div style={{textAlign:"center",padding:"2rem",color:"#888880",fontSize:12}}>Cargando...</div>
        :usos.length===0?<div style={{textAlign:"center",padding:"2rem",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin gestiones registradas aún</div>
        :usos.map(u=><div key={u.id} style={{background:"#F5F2ED",border:"1px solid #E2DDD6",borderRadius:4,padding:"10px 14px",marginBottom:8,display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontFamily:"'Georgia',serif"}}>{u.tipo_acto}</div>
            {u.descripcion&&<div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>{u.descripcion}</div>}
            {u.fecha&&<div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>{new Date(u.fecha).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}</div>}
          </div>
          <button style={{border:"1px solid #fca5a5",color:"#dc2626",background:"none",borderRadius:2,padding:"3px 8px",fontSize:11,cursor:"pointer",flexShrink:0}} onClick={()=>del(u.id)}>×</button>
        </div>)}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
          <button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── KYC DOCS MODAL ────────────────────────────────────────────
function KYCDocsModal({persona,onClose}){
  const [docs,setDocs]=useState([]);const [loading,setLoading]=useState(true);

  useEffect(()=>{
    supabase.from("kyc_docs").select("*").eq("persona_id",persona.id).then(({data})=>{setDocs(data||[]);setLoading(false);});
  },[persona.id]);

  async function updateDoc(id,field,val){
    await supabase.from("kyc_docs").update({[field]:val}).eq("id",id);
    setDocs(prev=>prev.map(d=>d.id===id?{...d,[field]:val}:d));
  }

  const statusBadge={pendiente:{bg:"#fffbeb",color:"#92400e"},entregado:{bg:"#f0fdf4",color:"#166534"},vencido:{bg:"#fef2f2",color:"#991b1b"}};

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:"1rem"}} onClick={onClose}>
      <div style={{background:"#fff",border:"1px solid #E2DDD6",padding:"2rem",width:"min(520px,100%)",maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <span style={{width:40,height:1,background:"#C9A84C",display:"block",marginBottom:12}}/>
        <div style={{fontSize:16,fontFamily:"'Georgia',serif",marginBottom:4}}>Documentos KYC</div>
        <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:20}}>{persona.nombre}</div>
        {loading?<div style={{textAlign:"center",padding:"2rem",color:"#888880",fontSize:12}}>Cargando...</div>
        :docs.length===0?<div style={{textAlign:"center",padding:"2rem",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin documentos requeridos</div>
        :docs.map(d=><div key={d.id} style={{background:"#F5F2ED",border:"1px solid #E2DDD6",borderRadius:4,padding:"10px 14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:13,fontFamily:"'Georgia',serif"}}>{KYC_DOC_LABELS[d.tipo]||d.tipo}</div>
            <select style={{border:"1px solid #E2DDD6",borderRadius:2,padding:"3px 8px",fontSize:11,background:(statusBadge[d.status]||statusBadge.pendiente).bg,color:(statusBadge[d.status]||statusBadge.pendiente).color,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} value={d.status} onChange={e=>updateDoc(d.id,"status",e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="entregado">Entregado</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
          <div style={{display:"flex",gap:8}}>
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"7px 10px",fontSize:12,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Link Google Drive..." value={d.drive_url||""} onChange={e=>updateDoc(d.id,"drive_url",e.target.value)}/>
            {d.drive_url&&<a href={d.drive_url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#C9A84C",whiteSpace:"nowrap",alignSelf:"center"}}>Ver ↗</a>}
          </div>
        </div>)}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
          <button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── PERSONAS TAB (Admin + Client) ─────────────────────────────


const ALCANCE_PODER = {
  "SAT / Fiscal": [
    "Registro en RFC",
    "Trámites ante SAT (declaraciones, devoluciones, recursos)",
    "Padrón de importadores",
    "IEPS / facturación especial",
    "Portal de la Secretaría de Economía (SE)",
    "Registro en SIEM",
    "Trámites ante SE (permisos de importación / exportación)",
    "Trámites ante IMPI (marcas, patentes)",
  ],
  "IMSS / Laboral": [
    "Registro patronal IMSS",
    "Trámites ante IMSS (altas, bajas, modificaciones)",
    "Trámites ante STPS",
    "Representación en juicios laborales",
    "Registro ante INFONAVIT",
  ],
  "Registro Público": [
    "Inscripción de actos en RPPyC",
    "Modificaciones al folio mercantil",
    "Registro de poderes notariales",
    "Cancelación de gravámenes",
  ],
  "Sistema Financiero": [
    "Apertura y operación de cuentas bancarias",
    "Representación ante CNBV",
    "Representación ante Banxico",
    "Operaciones de crédito y financiamiento",
    "Contratos con casas de bolsa",
  ],
  "Notarial / Judicial": [
    "Actos ante notario público",
    "Representación en juicio civil",
    "Representación en juicio mercantil",
    "Representación en amparo",
    "Actos de dominio sobre inmuebles",
    "Actos de administración de bienes",
  ],
  "Regulatorio Específico": [
    "COFEPRIS / permisos sanitarios",
    "SEMARNAT / permisos ambientales",
    "Padrón de proveedores gobierno federal",
    "Compranet / licitaciones públicas",
    "SCT / permisos de transporte",
  ],
};

// ── CONSTANCIAS DE REPRESENTACIÓN ────────────────────────────
function ConstanciasModal({persona, onClose}){
  const [constancias, setConstancias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({alcance:"", institucion:"", num_registro:"", drive_url:"", status:"activo", notas:""});
  const [saved, setSaved] = useState("");

  const alcances = persona.alcance || [];

  useEffect(()=>{
    supabase.from("constancias_representacion").select("*").eq("persona_id", persona.id).order("created_at",{ascending:false}).then(({data})=>{setConstancias(data||[]);setLoading(false);});
  },[persona.id]);

  async function add(){
    if(!form.alcance||!form.institucion)return;
    const c={id:"con"+Date.now(), persona_id:persona.id, client_id:persona.client_id, ...form, created_at:new Date().toISOString()};
    await supabase.from("constancias_representacion").insert(c);
    setConstancias(prev=>[c,...prev]);
    setShowForm(false);setForm({alcance:"",institucion:"",num_registro:"",drive_url:"",status:"activo",notas:""});
    setSaved("Constancia registrada ✓");setTimeout(()=>setSaved(""),2000);
  }
  async function del(id){
    await supabase.from("constancias_representacion").delete().eq("id",id);
    setConstancias(prev=>prev.filter(c=>c.id!==id));
  }
  async function updateStatus(id, status){
    await supabase.from("constancias_representacion").update({status}).eq("id",id);
    setConstancias(prev=>prev.map(c=>c.id===id?{...c,status}:c));
  }

  const statusStyle={
    activo:{bg:"#f0fdf4",color:"#166534"},
    revocado:{bg:"#fef2f2",color:"#991b1b"},
    "en trámite":{bg:"#fffbeb",color:"#92400e"},
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:"1rem",overflowY:"auto"}} onClick={onClose}>
      <div style={{background:"#fff",border:"1px solid #E2DDD6",padding:"2rem",width:"min(580px,100%)",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <span style={{width:40,height:1,background:"#C9A84C",display:"block",marginBottom:12}}/>
        <div style={{fontSize:16,fontFamily:"'Georgia',serif",marginBottom:2}}>Constancias de representación</div>
        <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:4}}>{persona.nombre}</div>
        {persona.tipo_poder&&<div style={{fontSize:12,color:"#C9A84C",fontFamily:"system-ui,sans-serif",fontStyle:"italic",marginBottom:16}}>{persona.tipo_poder}</div>}

        {saved&&<div style={{fontSize:12,color:"#5A8A3C",fontFamily:"system-ui,sans-serif",marginBottom:12,padding:"6px 10px",background:"#f0fdf4",borderRadius:2}}>{saved}</div>}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif"}}>{constancias.length} constancia{constancias.length!==1?"s":""} registrada{constancias.length!==1?"s":""}</span>
          <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={()=>setShowForm(!showForm)}>+ Agregar</button>
        </div>

        {showForm&&<div style={{background:"#F5F2ED",border:"1px solid #E2DDD6",borderRadius:4,padding:"1rem",marginBottom:16,display:"flex",flexDirection:"column",gap:8}}>
          <select style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"8px 10px",fontSize:13,background:"#fff",cursor:"pointer",boxSizing:"border-box",fontFamily:"system-ui,sans-serif"}} value={form.alcance} onChange={e=>setForm({...form,alcance:e.target.value})}>
            <option value="">Tipo de representación / alcance *</option>
            {alcances.length>0
              ?alcances.map(a=><option key={a} value={a}>{a}</option>)
              :Object.entries(ALCANCE_PODER).map(([cat,items])=><optgroup key={cat} label={cat}>{items.map(i=><option key={i} value={i}>{i}</option>)}</optgroup>)
            }
          </select>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Institución específica * (ej. HSBC, SAT CDMX Norte, IMSS Sub. 4)" value={form.institucion} onChange={e=>setForm({...form,institucion:e.target.value})}/>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Número de registro o referencia (opcional)" value={form.num_registro} onChange={e=>setForm({...form,num_registro:e.target.value})}/>
          <select style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"8px 10px",fontSize:13,background:"#fff",cursor:"pointer",boxSizing:"border-box",fontFamily:"system-ui,sans-serif"}} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
            <option value="activo">Activo</option>
            <option value="en trámite">En trámite</option>
            <option value="revocado">Revocado</option>
          </select>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Link constancia en Google Drive (opcional)" value={form.drive_url} onChange={e=>setForm({...form,drive_url:e.target.value})}/>
          </div>
          <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Notas adicionales (opcional)" value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setShowForm(false)}>Cancelar</button>
            <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={add} disabled={!form.alcance||!form.institucion}>Guardar</button>
          </div>
        </div>}

        {loading?<div style={{textAlign:"center",padding:"2rem",color:"#888880",fontSize:12}}>Cargando...</div>
        :constancias.length===0?<div style={{textAlign:"center",padding:"2rem",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin constancias registradas aún</div>
        :constancias.map(c=>(
          <div key={c.id} style={{background:"#F5F2ED",border:"1px solid #E2DDD6",borderRadius:4,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid "+c.status==="activo"?"#5A8A3C":c.status==="en trámite"?"#C9A84C":"#C0392B"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontFamily:"'Georgia',serif",color:"#1a1a1a"}}>{c.institucion}</div>
                <div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>{c.alcance}</div>
                {c.num_registro&&<div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>Ref: {c.num_registro}</div>}
                {c.notas&&<div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2,fontStyle:"italic"}}>{c.notas}</div>}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                <select style={{border:"1px solid #E2DDD6",borderRadius:2,padding:"2px 6px",fontSize:10,background:(statusStyle[c.status]||statusStyle.activo).bg,color:(statusStyle[c.status]||statusStyle.activo).color,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} value={c.status} onChange={e=>updateStatus(c.id,e.target.value)}>
                  <option value="activo">Activo</option>
                  <option value="en trámite">En trámite</option>
                  <option value="revocado">Revocado</option>
                </select>
                {c.drive_url&&<a href={c.drive_url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#C9A84C",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap"}}>Ver constancia ↗</a>}
                <button style={{border:"1px solid #fca5a5",color:"#dc2626",background:"none",borderRadius:2,padding:"2px 8px",fontSize:11,cursor:"pointer"}} onClick={()=>del(c.id)}>×</button>
              </div>
            </div>
          </div>
        ))}

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
          <button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
function UsosPoderesInline({personaId}){
  const [usos,setUsos]=useState([]);const [loaded,setLoaded]=useState(false);
  useEffect(()=>{
    supabase.from("uso_poderes").select("*").eq("persona_id",personaId).order("created_at",{ascending:false}).limit(3).then(({data})=>{setUsos(data||[]);setLoaded(true);});
  },[personaId]);
  if(!loaded||usos.length===0)return null;
  return(
    <div style={{marginTop:8,borderTop:"1px solid #F5F2ED",paddingTop:8}}>
      <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:6}}>Últimas gestiones realizadas</div>
      {usos.map(u=><div key={u.id} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:"#C9A84C",flexShrink:0,marginTop:4}}/>
        <div>
          <span style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1a1a1a"}}>{u.tipo_acto}</span>
          {u.descripcion&&<span style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif"}}> - {u.descripcion}</span>}
          {u.fecha&&<span style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif"}}> · {new Date(u.fecha).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}</span>}
        </div>
      </div>)}
    </div>
  );
}

function ConstanciasInline({personaId}){
  const [items,setItems]=useState([]);const [loaded,setLoaded]=useState(false);
  useEffect(()=>{
    supabase.from("constancias_representacion").select("institucion,alcance,status").eq("persona_id",personaId).order("created_at",{ascending:false}).limit(4).then(({data})=>{setItems(data||[]);setLoaded(true);});
  },[personaId]);
  if(!loaded||items.length===0)return null;
  const sColor={activo:"#5A8A3C","en trámite":"#C9A84C",revocado:"#C0392B"};
  return(
    <div style={{marginTop:6,borderTop:"1px solid #F5F2ED",paddingTop:6}}>
      <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:4}}>Acreditado ante</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
        {items.map((c,i)=><span key={i} style={{fontSize:10,padding:"2px 8px",borderRadius:2,background:"#fff",border:"1px solid "+sColor[c.status]||"#E2DDD6",color:sColor[c.status]||"#888880",fontFamily:"system-ui,sans-serif"}}>{c.institucion}</span>)}
      </div>
    </div>
  );
}
function PersonasTab({client,isAdmin=false}){
  const [personas,setPersonas]=useState([]);const [loading,setLoading]=useState(true);
  const [industria_config,setIndustriaConfig]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editingPersona,setEditingPersona]=useState(null);
  const [confirmDeletePersona,setConfirmDeletePersona]=useState(null);

  async function deletePersona(id){
    await supabase.from("personas").delete().eq("id",id);
    await supabase.from("kyc_docs").delete().eq("persona_id",id);
    setPersonas(prev=>prev.filter(p=>p.id!==id));
    setConfirmDeletePersona(null);
  }
  const [viewingUsos,setViewingUsos]=useState(null);
  const [viewingKYC,setViewingKYC]=useState(null);
  const [viewingConstancias,setViewingConstancias]=useState(null);
  const [filter,setFilter]=useState("todos");

  useEffect(()=>{
    async function load(){
      const [p,ind]=await Promise.all([
        supabase.from("personas").select("*").eq("client_id",client.id).order("tipo").order("nombre"),
        supabase.from("industrias").select("*").eq("id",client.industria||"general").single(),
      ]);
      const socId = client._sociedad?.id||null;
      setPersonas((p.data||[]).filter(x=>socId?x.sociedad_id===socId:!x.sociedad_id));
      setIndustriaConfig(ind.data?.campos_kyc||{obligatorios:[],opcionales:[],campos_extra:[]});
      setLoading(false);
    }
    load();
  },[client.id,client.industria]);

  const filtered=filter==="todos"?personas:personas.filter(p=>p.tipo===filter);
  const apoderados=personas.filter(p=>p.tipo==="apoderado");
  const accionistas=personas.filter(p=>p.tipo==="accionista");

  if(loading)return <div style={{textAlign:"center",padding:"3rem",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;

  return(
    <div>
      {/* Summary cards */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:1,minWidth:70}}>
          <div style={{fontSize:20,fontWeight:400,color:"#185FA5",fontFamily:"'Georgia',serif"}}>{apoderados.length}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Apoderados</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:1,minWidth:70}}>
          <div style={{fontSize:20,fontWeight:400,color:"#888880",fontFamily:"'Georgia',serif"}}>{accionistas.length}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Accionistas</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:1,minWidth:70}}>
          <div style={{fontSize:20,fontWeight:400,color:"#166534",fontFamily:"'Georgia',serif"}}>{personas.filter(p=>p.tipo==="administrador").length}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Administradores</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:1,minWidth:70}}>
          <div style={{fontSize:20,fontWeight:400,color:"#7B4F9E",fontFamily:"'Georgia',serif"}}>{personas.filter(p=>p.tipo==="comisario").length}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Comisarios</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:1,minWidth:70}}>
          <div style={{fontSize:20,fontWeight:400,color:personas.filter(p=>p.pep).length>0?"#C0392B":"#5A8A3C",fontFamily:"'Georgia',serif"}}>{personas.filter(p=>p.pep).length}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>PEP</div>
        </div>
      </div>

      {/* Filter + Add */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",gap:6}}>
          {[{id:"todos",label:"Todos"},{id:"apoderado",label:"Apoderados"},{id:"accionista",label:"Accionistas"},{id:"administrador",label:"Administradores"},{id:"comisario",label:"Comisarios"}].map(f=><button key={f.id} style={{background:filter===f.id?"#1a1a1a":"none",color:filter===f.id?"#fff":"#888880",border:"1px solid #E2DDD6",borderRadius:2,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setFilter(f.id)}>{f.label}</button>)}
        </div>
        {isAdmin&&<button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={()=>setShowForm(true)}>+ Persona</button>}
      </div>

      {/* List */}
      {filtered.length===0?<div style={{textAlign:"center",padding:"3rem 0",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin {filter==="todos"?"personas registradas":filter+"s registrados"}</div>
      :filtered.map(p=>(
        <div key={p.id} style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"1rem 1.25rem",marginBottom:8,borderLeft:"3px solid "+p.status==="activo"?"#5A8A3C":"#E2DDD6"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{fontSize:14,fontFamily:"'Georgia',serif"}}>{p.nombre}</div>
                <span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:p.tipo==="apoderado"?"#E6F1FB":p.tipo==="administrador"?"#f0fdf4":p.tipo==="comisario"?"#f5f0ff":"#F5F2ED",color:p.tipo==="apoderado"?"#185FA5":p.tipo==="administrador"?"#166534":p.tipo==="comisario"?"#7B4F9E":"#888880",fontFamily:"system-ui,sans-serif",textTransform:"capitalize"}}>{p.tipo==="administrador"?"Administrador":p.tipo==="comisario"?"Comisario":p.tipo}</span>
                {p.pep&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#fef2f2",color:"#991b1b",fontFamily:"system-ui,sans-serif"}}>PEP</span>}
                {p.beneficiario_final&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#fffbeb",color:"#92400e",fontFamily:"system-ui,sans-serif"}}>Benef. Final</span>}
              </div>
              <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif"}}>
                {p.cargo&&p.cargo}{p.empresa&&" · "+p.empresa}
                {p.tipo==="accionista"&&p.participacion&&<span style={{marginLeft:8,fontWeight:600,color:"#1a1a1a"}}>{p.participacion}%</span>}
              </div>
              {(p.rfc||p.curp)&&<div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>
                {p.rfc&&"RFC: "+p.rfc}{p.curp&&" · CURP: "+p.curp}
              </div>}
              {(p.tipo==="apoderado"||p.tipo==="administrador")&&p.num_escritura&&<div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>
                {p.tipo==="administrador"?"Designación:":"Escritura"} {p.num_escritura}{p.notario&&" · Not. "+p.notario}{p.num_notaria&&" No. "+p.num_notaria}{p.fecha_escritura&&" · "+new Date(p.fecha_escritura).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}
              </div>}
              {p.tipo==="comisario"&&p.num_escritura&&<div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>
                Acta de designación: {p.num_escritura}{p.fecha_escritura&&" · "+new Date(p.fecha_escritura).toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}
              </div>}
              {(p.tipo==="apoderado"||p.tipo==="administrador"||p.tipo==="comisario")&&p.tipo_poder&&<div style={{fontSize:11,color:"#C9A84C",fontFamily:"system-ui,sans-serif",marginTop:2,fontStyle:"italic"}}>{p.tipo_poder}</div>}
              {p.tipo==="apoderado"&&p.alcance&&p.alcance.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                {p.alcance.map(a=><span key={a} style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#F5F2ED",color:"#888880",fontFamily:"system-ui,sans-serif",border:"1px solid #E2DDD6"}}>{a}</span>)}
              </div>}
              {p.tipo==="apoderado"&&<UsosPoderesInline personaId={p.id}/>
              }
              {p.tipo==="apoderado"&&<ConstanciasInline personaId={p.id}/>}
              {p.industria_extra&&Object.keys(p.industria_extra).length>0&&<div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>
                {Object.entries(p.industria_extra).map(([k,v])=>v?`${k}: {v}`:"").filter(Boolean).join(" · ")}
              </div>}
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
              {p.tipo==="apoderado"&&<button style={{background:"none",border:"1px solid #C9A84C",color:"#92400e",borderRadius:2,padding:"3px 8px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setViewingUsos(p)}>Ver gestiones ↗</button>}
              <button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"3px 8px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setViewingKYC(p)}>KYC</button>
              {(p.tipo==="apoderado"||p.tipo==="administrador")&&<button style={{background:"none",border:"1px solid #185FA5",color:"#185FA5",borderRadius:2,padding:"3px 8px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setViewingConstancias({...p,client_id:client.id})}>Constancias ↗</button>}
              {isAdmin&&<button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"3px 8px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setEditingPersona(p)}>✎</button>}
              {isAdmin&&<button style={{background:"none",border:"1px solid #fecaca",borderRadius:2,padding:"3px 8px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",color:"#dc2626"}} onClick={()=>setConfirmDeletePersona(p)}>×</button>}
            </div>
          </div>
        </div>
      ))}

      {(showForm||editingPersona)&&<PersonaModal
        client={client}
        industria_config={industria_config}
        persona={editingPersona}
        onClose={()=>{setShowForm(false);setEditingPersona(null);}}
        onSaved={p=>{
          if(editingPersona){setPersonas(prev=>prev.map(x=>x.id===p.id?p:x));}
          else{setPersonas(prev=>[...prev,p]);}
          setShowForm(false);setEditingPersona(null);
        }}
      />}
      {viewingUsos&&<UsoPoderesModal persona={viewingUsos} client={client} onClose={()=>setViewingUsos(null)}/>}
      {viewingKYC&&<KYCDocsModal persona={viewingKYC} onClose={()=>setViewingKYC(null)}/>
      }
      {viewingConstancias&&<ConstanciasModal persona={viewingConstancias} onClose={()=>setViewingConstancias(null)}/>}
      {confirmDeletePersona&&<div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
        <div style={{background:"#FAFCF8",padding:"2rem",border:"1px solid #DDE4D8",width:"min(380px,90vw)",borderRadius:4}}>
          <div style={{fontSize:15,fontFamily:"Georgia,serif",marginBottom:8}}>Eliminar persona</div>
          <div style={{fontSize:12,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:20}}>¿Eliminar a <strong>{confirmDeletePersona.nombre}</strong>? Se eliminarán también sus documentos KYC.</div>
          <div style={{display:"flex",gap:8}}>
            <button style={{fontSize:12,padding:"7px 14px",border:"1px solid #DDE4D8",borderRadius:3,cursor:"pointer",background:"none",fontFamily:"system-ui,sans-serif"}} onClick={()=>setConfirmDeletePersona(null)}>Cancelar</button>
            <button style={{fontSize:12,padding:"7px 14px",border:"none",borderRadius:3,cursor:"pointer",background:"#dc2626",color:"#fff",fontFamily:"system-ui,sans-serif"}} onClick={()=>deletePersona(confirmDeletePersona.id)}>Eliminar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── COMPLIANCE ALERTS ENGINE ──────────────────────────────────
async function calcComplianceAlerts(clientId, industria) {
  const hoy = new Date();
  const hace12meses = new Date(hoy); hace12meses.setFullYear(hoy.getFullYear() - 1);
  const en30 = new Date(hoy); en30.setDate(hoy.getDate() + 30);
  const en7 = new Date(hoy); en7.setDate(hoy.getDate() + 7);

  const [personas, kycDocs, asambleas, contratos, areas] = await Promise.all([
    supabase.from("personas").select("*").eq("client_id", clientId),
    supabase.from("kyc_docs").select("*").eq("client_id", clientId),
    supabase.from("asambleas").select("*").eq("client_id", clientId).order("fecha", {ascending:false}),
    supabase.from("contratos").select("*").eq("client_id", clientId),
    supabase.from("areas").select("*").eq("client_id", clientId),
  ]);

  const alerts = [];

  // 1. Apoderados sin KYC completo
  const ps = personas.data || [];
  const kd = kycDocs.data || [];
  ps.forEach(p => {
    const docsPersona = kd.filter(d => d.persona_id === p.id);
    const pendientes = docsPersona.filter(d => d.status === "pendiente" && !d.drive_url);
    if (pendientes.length > 0) {
      alerts.push({
        id: "kyc_" + p.id,
        tipo: "kyc",
        nivel: "red",
        titulo: `Falta documentación de {p.nombre}`,
        detalle: `${pendientes.length} documento(s) sin entregar al despacho`,
        accion: "Ir a Personas",
        tab: "personas",
      });
    }
  });

  // 2. PEP sin declaración detallada
  ps.filter(p => p.pep && !p.pep_detalle).forEach(p => {
    alerts.push({
      id: "pep_" + p.id,
      tipo: "pep",
      nivel: "red",
      titulo: `Representante con cargo público sin declarar - {p.nombre}`,
      detalle: "Uno de tus representantes tiene o tuvo un cargo público y no está documentado. Esto puede afectar tus operaciones bancarias.",
      accion: "Completar perfil",
      tab: "personas",
    });
  });

  // 3. Origen de recursos vacío en industrias que lo requieren
  const industriasConOrigen = ["inmobiliaria", "financiero", "retail", "manufactura"];
  if (industriasConOrigen.includes(industria)) {
    ps.filter(p => !p.origen_recursos).forEach(p => {
      alerts.push({
        id: "origen_" + p.id,
        tipo: "compliance",
        nivel: "amber",
        titulo: `¿De dónde vienen los recursos? - {p.nombre}`,
        detalle: "Tu industria requiere documentar el origen de los recursos de tus socios y representantes. Sin esto, los bancos pueden cuestionarte.",
        accion: "Completar perfil",
        tab: "personas",
      });
    });
  }

  // 3b. Tu empresa no tiene administrador registrado
  const tieneAdmin = ps.some(p => p.tipo === "administrador");
  if (!tieneAdmin && ps.length > 0) {
    alerts.push({
      id: "sin_administrador",
      tipo: "compliance",
      nivel: "amber",
      titulo: "Tu empresa no tiene administrador registrado",
      detalle: "No hay registro de quién administra formalmente tu empresa. Cualquier decisión puede ser cuestionada.",
      accion: "Ir a Personas",
      tab: "personas",
    });
  }

  // 3c. Tu empresa no tiene vigilancia interna registrada
  const tieneComisario = ps.some(p => p.tipo === "comisario");
  if (!tieneComisario && ps.length > 0) {
    alerts.push({
      id: "sin_comisario",
      tipo: "compliance",
      nivel: "amber",
      titulo: "Tu empresa no tiene vigilancia interna registrada",
      detalle: "Sin comisario, no hay nadie que vigile formalmente las decisiones del administrador.",
      accion: "Ir a Personas",
      tab: "personas",
    });
  }

  // 4. ¿Quién controla realmente tu empresa?
  const tieneBenef = ps.some(p => p.beneficiario_final);
  if (ps.length > 0 && !tieneBenef) {
    alerts.push({
      id: "benef_final",
      tipo: "compliance",
      nivel: "amber",
      titulo: "¿Quién controla realmente tu empresa?",
      detalle: "Oficialmente nadie aparece como el controlador real de tu empresa. Esto es un riesgo ante bancos, gobierno y clientes corporativos.",
      accion: "Ir a Personas",
      tab: "personas",
    });
  }

  // 5. Asamblea ordinaria no celebrada en 12+ meses
  const asms = asambleas.data || [];
  const ultOrd = asms.find(a => a.tipo === "Ordinaria Anual" && a.status === "publicada");
  if (!ultOrd) {
    alerts.push({
      id: "asamblea_anual",
      tipo: "asamblea",
      nivel: "red",
      titulo: "Tu empresa no ha sesionado en más de un año",
      detalle: "Sin asambleas formales, las decisiones de tu empresa no tienen respaldo legal. Eso te puede costar caro.",
      accion: "Necesito una asamblea",
      tab: "asambleas",
    });
  } else if (new Date(ultOrd.fecha) < hace12meses) {
    alerts.push({
      id: "asamblea_vencida",
      tipo: "asamblea",
      nivel: "amber",
      titulo: "Tu última asamblea fue hace más de un año",
      detalle: `Última asamblea ordinaria: {new Date(ultOrd.fecha).toLocaleDateString("es-MX", {day:"numeric",month:"short",year:"numeric"})}`,
      accion: "Solicitar nueva asamblea",
      tab: "asambleas",
    });
  }

  // 6. Contratos vencidos
  const ctrs = contratos.data || [];
  ctrs.filter(c => c.vencimiento && new Date(c.vencimiento) < hoy).forEach(c => {
    alerts.push({
      id: "ctr_vencido_" + c.id,
      tipo: "contrato",
      nivel: "red",
      titulo: `Contrato vencido y sin renovar - {c.nombre}`,
      detalle: `Venció el {new Date(c.vencimiento).toLocaleDateString("es-MX", {day:"numeric",month:"short",year:"numeric"})}`,
      accion: "Ver contratos",
      tab: "contratos",
    });
  });

  // 7. Contratos por vencer en 30 días
  ctrs.filter(c => c.vencimiento && new Date(c.vencimiento) >= hoy && new Date(c.vencimiento) <= en30).forEach(c => {
    const dias = Math.ceil((new Date(c.vencimiento) - hoy) / (1000*60*60*24));
    alerts.push({
      id: "ctr_pronto_" + c.id,
      tipo: "contrato",
      nivel: dias <= 7 ? "red" : "amber",
      titulo: `Contrato próximo a vencer - {c.nombre}`,
      detalle: `Vence en {dias} día${dias !== 1 ? "s" : ""}`,
      accion: "Ver contratos",
      tab: "contratos",
    });
  });

  // 8. Áreas en rojo sin nota del despacho
  const ar = areas.data || [];
  ar.filter(a => a.status === "red" && !a.nota).forEach(a => {
    alerts.push({
      id: "area_red_" + a.id,
      tipo: "semaforo",
      nivel: "amber",
      titulo: `El despacho aún no ha explicado este riesgo - {a.name}`,
      detalle: "Tu despacho detectó un problema aquí pero aún no ha agregado una explicación. Solicítala.",
      accion: "Agregar nota",
      tab: "panel",
    });
  });

  // 9b. Apoderados sin uso de poder registrado en 12+ meses
  const [usosPoderes] = await Promise.all([
    supabase.from("uso_poderes").select("persona_id, created_at").eq("client_id", clientId),
  ]);
  const usosData = usosPoderes.data || [];
  ps.filter(p => p.tipo === "apoderado" && p.status === "activo").forEach(p => {
    const usosPersona = usosData.filter(u => u.persona_id === p.id);
    if (usosPersona.length === 0) {
      alerts.push({
        id: "sin_usos_" + p.id,
        tipo: "compliance",
        nivel: "amber",
        titulo: `Poder sin actividad registrada - {p.nombre}`,
        detalle: "Este representante tiene poderes activos pero no hay registro de que los haya usado. Verifica si sigue siendo necesario.",
        accion: "Ver apoderado",
        tab: "personas",
      });
    } else {
      const ultimo = new Date(Math.max(...usosPersona.map(u => new Date(u.created_at))));
      if (ultimo < hace12meses) {
        alerts.push({
          id: "uso_antiguo_" + p.id,
          tipo: "compliance",
          nivel: "amber",
          titulo: `Poder sin uso reciente - {p.nombre}`,
      detalle: `Último uso: {ultimo.toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}`,
          accion: "Ver apoderado",
          tab: "personas",
        });
      }
    }
  });

  // 9. LFPIORPI - inmobiliaria/financiero sin declaración de origen en TODOS
  if (["inmobiliaria", "financiero"].includes(industria)) {
    const sinOrigen = ps.filter(p => !p.origen_recursos).length;
    if (sinOrigen > 0 && ps.length > 0) {
      alerts.push({
        id: "lfpiorpi",
        tipo: "regulatorio",
        nivel: "red",
        titulo: "Tu industria tiene obligaciones antilavado sin cumplir",
        detalle: `${sinOrigen} persona${sinOrigen !== 1 ? "s" : ""} sin declaración de origen de recursos. Industria sujeta a LFPIORPI.`,
        accion: "Completar perfiles",
        tab: "personas",
      });
    }
  }


  // 10. Poder con alcance SAT sin RFC del apoderado
  ps.filter(p => p.tipo === "apoderado" && p.alcance && p.alcance.some(a => a.includes("SAT") || a.includes("Secretaría de Economía") || a.includes("RFC")) && !p.rfc).forEach(p => {
    alerts.push({
      id: "alcance_sat_" + p.id,
      tipo: "regulatorio",
      nivel: "amber",
      titulo: `Representante ante el SAT sin RFC registrado - {p.nombre}`,
      detalle: "Este representante hace trámites fiscales pero no tenemos su RFC. Es un riesgo ante cualquier revisión del SAT.",
      accion: "Completar perfil",
      tab: "personas",
    });
  });

  // 11. Poder con alcance financiero sin identificación KYC
  ps.filter(p => p.tipo === "apoderado" && p.alcance && p.alcance.some(a => a.includes("bancari") || a.includes("CNBV") || a.includes("crédito"))).forEach(p => {
    const docsPersona = kd.filter(d => d.persona_id === p.id && d.tipo === "identificacion_oficial" && d.status === "entregado");
    if (docsPersona.length === 0) {
      alerts.push({
        id: "alcance_fin_" + p.id,
        tipo: "kyc",
        nivel: "red",
        titulo: `Representante bancario sin documentos - {p.nombre}`,
        detalle: "Este representante puede operar cuentas bancarias pero no ha entregado su identificación. Tu banco puede bloquearte.",
        accion: "Ver KYC",
        tab: "personas",
      });
    }
  });

  // 12. Constancias revocadas activas
  const { data: constanciasData } = await supabase.from("constancias_representacion").select("*").eq("client_id", clientId).eq("status","revocado");
  (constanciasData||[]).forEach(c=>{
    const persona = ps.find(p=>p.id===c.persona_id);
    alerts.push({
      id:"const_rev_"+c.id,
      tipo:"regulatorio",
      nivel:"amber",
      titulo:`Representación revocada - {c.institucion}`,
      detalle:`${persona?.nombre||"Apoderado"} ya no tiene representación activa ante {c.institucion}`,
      accion:"Ver constancias",
      tab:"personas",
    });
  });

  // Sort: red first, then amber
  return alerts.sort((a, b) => (a.nivel === "red" ? -1 : 1) - (b.nivel === "red" ? -1 : 1));
}

// ── COMPLIANCE PANEL COMPONENT ────────────────────────────────
function CompliancePanel({client, onNavigate}){
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calcComplianceAlerts(client.id, client.industria || "general").then(a => {
      setAlerts(a); setLoading(false);
    });
  }, [client.id, client.industria]);

  const TIPO_ICON = {kyc:"🪪", pep:"⚠️", compliance:"📋", asamblea:"🏛️", contrato:"📄", semaforo:"🔴", regulatorio:"⚖️"};
  const red = alerts.filter(a => a.nivel === "red");
  const amber = alerts.filter(a => a.nivel === "amber");

  if (loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Analizando...</div>;

  return (
    <div>
      {/* Summary */}
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:1,borderTop:"3px solid "+red.length>0?"#C0392B":"#5A8A3C"}}>
          <div style={{fontSize:24,fontWeight:400,color:red.length>0?"#C0392B":"#5A8A3C",fontFamily:"'Georgia',serif"}}>{red.length}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Críticas</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:1,borderTop:"3px solid "+amber.length>0?"#C9A84C":"#5A8A3C"}}>
          <div style={{fontSize:24,fontWeight:400,color:amber.length>0?"#C9A84C":"#5A8A3C",fontFamily:"'Georgia',serif"}}>{amber.length}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Atención</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".65rem .8rem",textAlign:"center",flex:2}}>
          <div style={{fontSize:13,fontFamily:"'Georgia',serif",color:"#1a1a1a"}}>{INDUSTRIA_LABELS[client.industria]||"General"}</div>
          <div style={{fontSize:10,color:"#888880",marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Perfil de compliance</div>
        </div>
      </div>

      {alerts.length === 0 && (
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:4,padding:"2rem",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>✓</div>
          <div style={{fontSize:15,fontFamily:"'Georgia',serif",color:"#166534"}}>Sin alertas de compliance</div>
          <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:4}}>Todo en orden para esta empresa</div>
        </div>
      )}

      {red.length > 0 && <>
        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#C0392B",fontFamily:"system-ui,sans-serif",marginBottom:8}}>Alertas críticas</div>
        {red.map(a => (
          <div key={a.id} style={{background:"#fff",border:"1px solid #fca5a5",borderRadius:4,padding:"1rem 1.25rem",marginBottom:8,borderLeft:"3px solid #C0392B",display:"flex",alignItems:"flex-start",gap:12}}>
            <span style={{fontSize:18,flexShrink:0}}>{TIPO_ICON[a.tipo]||"⚠️"}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontFamily:"'Georgia',serif",color:"#1a1a1a"}}>{a.titulo}</div>
              <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:3}}>{a.detalle}</div>
            </div>
            {onNavigate && <button style={{background:"#C0392B",color:"#fff",border:"none",borderRadius:2,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap",flexShrink:0}} onClick={()=>onNavigate(a.tab)}>{a.accion}</button>}
          </div>
        ))}
      </>}

      {amber.length > 0 && <>
        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#C9A84C",fontFamily:"system-ui,sans-serif",marginBottom:8,marginTop:red.length>0?16:0}}>Requieren atención</div>
        {amber.map(a => (
          <div key={a.id} style={{background:"#fff",border:"1px solid #fde68a",borderRadius:4,padding:"1rem 1.25rem",marginBottom:8,borderLeft:"3px solid #C9A84C",display:"flex",alignItems:"flex-start",gap:12}}>
            <span style={{fontSize:18,flexShrink:0}}>{TIPO_ICON[a.tipo]||"⚠️"}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontFamily:"'Georgia',serif",color:"#1a1a1a"}}>{a.titulo}</div>
              <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:3}}>{a.detalle}</div>
            </div>
            {onNavigate && <button style={{background:"none",border:"1px solid #C9A84C",color:"#92400e",borderRadius:2,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap",flexShrink:0}} onClick={()=>onNavigate(a.tab)}>{a.accion}</button>}
          </div>
        ))}
      </>}
    </div>
  );
}

function AdminNotifBell(){
  const [notifs,setNotifs]=useState([]);const [open,setOpen]=useState(false);const [loading,setLoading]=useState(true);

  async function load(){
    // Get all recent requests and uso_poderes across all clients
    const [reqs,usos,diags,allClients,allPersonas]=await Promise.all([
      supabase.from("requests").select("*").eq("status","pendiente").order("date",{ascending:false}).limit(20),
      supabase.from("uso_poderes").select("*").order("created_at",{ascending:false}).limit(15),
      supabase.from("notificaciones").select("*").eq("leida",false).order("created_at",{ascending:false}).limit(20),
      supabase.from("clients").select("id,name"),
      supabase.from("personas").select("id,nombre"),
    ]);
    const cMap=Object.fromEntries((allClients.data||[]).map(c=>[c.id,c.name]));
    const pMap=Object.fromEntries((allPersonas.data||[]).map(p=>[p.id,p.nombre]));
    const items=[];
    (reqs.data||[]).forEach(r=>items.push({id:"req_"+r.id,tipo:"solicitud",icon:"✉️",texto:`${cMap[r.client_id]||r.client_id} - {r.label}`,sub:r.notes||"",fecha:r.date,client_id:r.client_id}));
    (usos.data||[]).forEach(u=>items.push({id:"uso_"+u.id,tipo:"poder",icon:"📋",texto:`${cMap[u.client_id]||u.client_id} - Uso de poder: {u.tipo_acto}`,sub:pMap[u.persona_id]||"",fecha:new Date(u.created_at).toLocaleDateString("es-MX",{day:"numeric",month:"short"}),client_id:u.client_id}));
    (diags.data||[]).filter(n=>n.tipo!=="poder").forEach(n=>items.push({id:"notif_"+n.id,tipo:n.tipo,icon:"🔔",texto:`${cMap[n.client_id]||n.client_id} - {n.mensaje}`,sub:"",fecha:new Date(n.created_at).toLocaleDateString("es-MX",{day:"numeric",month:"short"}),client_id:n.client_id}));
    items.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
    setNotifs(items);setLoading(false);
  }

  useEffect(()=>{load();},[]);

  const unread=notifs.length;

  async function markAllRead(){
    await supabase.from("notificaciones").update({leida:true}).eq("leida",false);
    setNotifs(prev=>prev.filter(n=>!n.id.startsWith("notif_")));
  }

  return(
    <div style={{position:"relative"}}>
      <button style={{background:"none",border:"1px solid rgba(255,255,255,.2)",borderRadius:2,padding:"4px 10px",fontSize:12,cursor:"pointer",color:"rgba(255,255,255,.7)",fontFamily:"system-ui,sans-serif",position:"relative"}} onClick={()=>{setOpen(!open);if(!open)load();}}>
        🔔{unread>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#C0392B",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",fontWeight:600}}>{unread>9?"9+":unread}</span>}
      </button>
      {open&&<div style={{position:"absolute",right:0,top:40,background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,width:360,maxHeight:480,overflowY:"auto",zIndex:300,boxShadow:"0 8px 32px rgba(0,0,0,.15)"}}>
        <div style={{padding:"10px 16px",borderBottom:"1px solid #E2DDD6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif"}}>Notificaciones del despacho</span>
          {unread>0&&<button style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#C9A84C",fontFamily:"system-ui,sans-serif"}} onClick={markAllRead}>Marcar leídas</button>}
        </div>
        {loading?<div style={{padding:"2rem",textAlign:"center",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>
        :notifs.length===0?<div style={{padding:"2rem",textAlign:"center",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin notificaciones pendientes</div>
        :notifs.map(n=><div key={n.id} style={{padding:"10px 16px",borderBottom:"1px solid #f5f5f5",background:"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="#F5F2ED"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:16,flexShrink:0}}>{n.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1a1a1a",lineHeight:1.4}}>{n.texto}</div>
              {n.sub&&<div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:2}}>{n.sub}</div>}
              <div style={{fontSize:10,color:"#C9A84C",fontFamily:"system-ui,sans-serif",marginTop:3}}>{n.fecha}</div>
            </div>
          </div>
        </div>)}
      </div>}
    </div>
  );
}

const AUTORIDADES = {
  SAT: {
    label: "SAT",
    color: "#C0392B",
    bg: "#fef2f2",
    icon: "🏛",
    campos: [
      {id:"rfc",label:"RFC",tipo:"text"},
      {id:"regimen_fiscal",label:"Régimen fiscal",tipo:"text"},
      {id:"buzon_tributario",label:"Buzón tributario",tipo:"select",ops:["Activo","Inactivo","No configurado"]},
      {id:"opinion_cumplimiento",label:"Opinión de cumplimiento",tipo:"select",ops:["Positiva","Negativa","No vigente","No consultada"]},
      {id:"opinion_fecha",label:"Fecha de consulta de opinión",tipo:"date"},
      {id:"efirma_vencimiento",label:"Vencimiento e.firma (FIEL)",tipo:"date"},
      {id:"efirma_titular",label:"¿Quién tiene la e.firma?",tipo:"text"},
      {id:"csd_vencimiento",label:"Vencimiento CSD (Sello Digital)",tipo:"date"},
      {id:"csd_estatus",label:"Estatus CSD",tipo:"select",ops:["Activo","Inactivo","Revocado"]},
      {id:"representante_sat",label:"Representante acreditado ante SAT",tipo:"text"},
      {id:"avisos_sat",label:"Últimos avisos presentados",tipo:"textarea"},
      {id:"obligaciones_sat",label:"Obligaciones periódicas activas",tipo:"textarea"},
      {id:"notas_sat",label:"Notas adicionales SAT",tipo:"textarea"},
    ]
  },
  IMSS: {
    label: "IMSS",
    color: "#185FA5",
    bg: "#E6F1FB",
    icon: "🏥",
    campos: [
      {id:"registro_patronal",label:"Número de registro patronal",tipo:"text"},
      {id:"subdelegacion_imss",label:"Subdelegación IMSS",tipo:"text"},
      {id:"representante_imss",label:"Representante ante IMSS",tipo:"text"},
      {id:"num_trabajadores",label:"Número de trabajadores registrados",tipo:"text"},
      {id:"estatus_imss",label:"Estatus de cumplimiento",tipo:"select",ops:["En orden","Adeudo menor","Adeudo significativo"]},
      {id:"sua_operador",label:"¿Quién opera el SUA?",tipo:"text"},
      {id:"notas_imss",label:"Notas adicionales IMSS",tipo:"textarea"},
    ]
  },
  SE: {
    label: "Secretaría de Economía",
    color: "#5A8A3C",
    bg: "#f0fdf4",
    icon: "📋",
    campos: [
      {id:"folio_mercantil",label:"Folio mercantil RPPyC",tipo:"text"},
      {id:"fecha_inscripcion_rppyc",label:"Fecha de inscripción en RPPyC",tipo:"date"},
      {id:"folio_actualizacion",label:"Última modificación registrada",tipo:"date"},
      {id:"representante_se",label:"Representante ante SE",tipo:"text"},
      {id:"siem_registro",label:"Registro SIEM",tipo:"text"},
      {id:"notas_se",label:"Notas adicionales SE - RPPyC",tipo:"textarea"},
    ]
  },
  INFONAVIT: {
    label: "INFONAVIT",
    color: "#C9A84C",
    bg: "#fffbeb",
    icon: "🏠",
    campos: [
      {id:"registro_infonavit",label:"Número de registro INFONAVIT",tipo:"text"},
      {id:"estatus_infonavit",label:"Estatus de cumplimiento",tipo:"select",ops:["En orden","Adeudo menor","Adeudo significativo"]},
      {id:"notas_infonavit",label:"Notas adicionales INFONAVIT",tipo:"textarea"},
    ]
  },
  STPS: {
    label: "STPS",
    color: "#7B4F9E",
    bg: "#f5f0ff",
    icon: "⚖",
    campos: [
      {id:"reglamento_stps",label:"Reglamento interior de trabajo",tipo:"select",ops:["Vigente","Desactualizado","No existe"]},
      {id:"reglamento_fecha",label:"Fecha del reglamento",tipo:"date"},
      {id:"representante_stps",label:"Representante ante STPS",tipo:"text"},
      {id:"notas_stps",label:"Notas adicionales STPS",tipo:"textarea"},
    ]
  },
};

function PerfilRegulatorioTab({client,isAdmin=false}){
  const [perfiles,setPerfiles]=useState({});
  const [loading,setLoading]=useState(true);
  const [activeAut,setActiveAut]=useState("SAT");
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({});
  const [saved,setSaved]=useState("");
  const [riesgos,setRiesgos]=useState([]);

  useEffect(()=>{
    async function load(){
      const socId = client._sociedad?.id||null;
      const {data}=await supabase.from("perfil_regulatorio").select("*").eq("client_id",client.id);
      const map={};
      (data||[]).filter(x=>socId?x.sociedad_id===socId:!x.sociedad_id).forEach(p=>{map[p.autoridad]=p.datos||{};});
      setPerfiles(map);
      const {data:reglas}=await supabase.from("reglas_compliance").select("*").eq("activa",true);
      calcRiesgos(map,reglas||[]);
      setLoading(false);
    }
    load();
  },[client.id]);

  function calcRiesgos(perfs,reglas){
    const hoy=new Date();
    const en30=new Date(hoy);en30.setDate(hoy.getDate()+30);
    const alerts=[];
    reglas.forEach(r=>{
      const datos=perfs[r.autoridad]||{};
      const val=datos[r.campo];
      let triggered=false;
      if(r.condicion==="vencido"&&val){triggered=new Date(val)<hoy;}
      else if(r.condicion==="por_vencer_30"&&val){triggered=new Date(val)>=hoy&&new Date(val)<=en30;}
      else if(r.condicion==="ausente"){triggered=!val||val===""||val==="No configurado"||val==="No existe"||val==="No consultada"||val==="Inactivo"||val==="Revocado";}
      else if(r.condicion==="negativa"){triggered=val==="Negativa"||val==="No vigente"||val==="No consultada";}
      else if(r.condicion==="adeudo"){triggered=val==="Adeudo menor"||val==="Adeudo significativo";}
      else if(r.condicion==="desactualizado"&&val){const d=new Date(val);const dos=new Date(hoy);dos.setFullYear(hoy.getFullYear()-2);triggered=d<dos;}
      else if(r.condicion==="inactivo"){triggered=!val||val==="Inactivo"||val==="Revocado"||val==="No existe";}
      if(triggered){
        const dias=val&&(r.condicion==="vencido"||r.condicion==="por_vencer_30")?Math.ceil((new Date(val)-hoy) / (1000*60*60*24)):null;
        const detalle=dias!==null?(dias<0?"Venció hace "+Math.abs(dias)+" días":"Vence en "+dias+" días"):r.descripcion;
        alerts.push({...r,detalle});
      }
    });
    alerts.sort((a,b)=>(a.nivel==="red"?-1:1)-(b.nivel==="red"?-1:1));
    setRiesgos(alerts);
  }

  async function save(){
    const existing=await supabase.from("perfil_regulatorio").select("id").eq("client_id",client.id).eq("autoridad",activeAut).single();
    if(existing.data){
      await supabase.from("perfil_regulatorio").update({datos:form,updated_at:new Date().toISOString()}).eq("id",existing.data.id);
    } else {
      await supabase.from("perfil_regulatorio").insert({id:"reg"+Date.now(),client_id:client.id,autoridad:activeAut,datos:form,updated_at:new Date().toISOString()});
    }
    const newPerfiles={...perfiles,[activeAut]:form};
    setPerfiles(newPerfiles);
    const {data:reglas}=await supabase.from("reglas_compliance").select("*").eq("activa",true);
    calcRiesgos(newPerfiles,reglas||[]);
    setEditing(false);setSaved("Guardado");setTimeout(()=>setSaved(""),2000);
  }

  if(loading)return <div style={{textAlign:"center",padding:"3rem",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;

  const autConfig=AUTORIDADES[activeAut];
  const datosAut=perfiles[activeAut]||{};
  const red=riesgos.filter(r=>r.nivel==="red");
  const amber=riesgos.filter(r=>r.nivel==="amber");

  return(
    <div>
      {riesgos.length>0&&<div style={{marginBottom:20}}>
        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:8}}>Lo que las autoridades pueden usarte en contra</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:4,padding:".5rem .8rem",flex:1,textAlign:"center"}}>
            <div style={{fontSize:22,color:"#C0392B",fontFamily:"'Georgia',serif"}}>{red.length}</div>
            <div style={{fontSize:10,color:"#888880",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Críticas</div>
          </div>
          <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:4,padding:".5rem .8rem",flex:1,textAlign:"center"}}>
            <div style={{fontSize:22,color:"#C9A84C",fontFamily:"'Georgia',serif"}}>{amber.length}</div>
            <div style={{fontSize:10,color:"#888880",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Atención</div>
          </div>
          <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:".5rem .8rem",flex:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",textAlign:"center"}}>Reglas actualizadas automáticamente<br/><span style={{color:"#C9A84C"}}>Sync semanal via DOF/SAT</span></div>
          </div>
        </div>
        {riesgos.map(r=>(
          <div key={r.id} style={{background:"#fff",border:"1px solid #E2DDD6",borderLeft:"3px solid "+(r.nivel==="red"?"#C0392B":"#C9A84C"),borderRadius:4,padding:"8px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16,flexShrink:0}}>{AUTORIDADES[r.autoridad]?.icon||"⚠"}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1a1a1a",fontWeight:600}}>{r.titulo}</div>
              <div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif"}}>{r.detalle}</div>
            </div>
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:r.nivel==="red"?"#fef2f2":"#fffbeb",color:r.nivel==="red"?"#991b1b":"#92400e",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap"}}>{r.autoridad}</span>
          </div>
        ))}
      </div>}

      {riesgos.length===0&&Object.keys(perfiles).length>0&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:4,padding:"1rem",marginBottom:20,textAlign:"center"}}>
        <div style={{fontSize:13,fontFamily:"'Georgia',serif",color:"#166534",marginTop:4}}>Sin alertas regulatorias detectadas</div>
      </div>}

      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {Object.entries(AUTORIDADES).map(([key,cfg])=>{
          const tieneRojo=riesgos.some(r=>r.autoridad===key&&r.nivel==="red");
          const tieneAmber=riesgos.some(r=>r.autoridad===key&&r.nivel==="amber");
          return(
            <button key={key} style={{background:activeAut===key?cfg.color:"#fff",color:activeAut===key?"#fff":cfg.color,border:"1px solid "+cfg.color,borderRadius:2,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",position:"relative"}} onClick={()=>{setActiveAut(key);setForm(perfiles[key]||{});setEditing(false);}}>
              {cfg.icon} {key}
              {(tieneRojo||tieneAmber)&&<span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:tieneRojo?"#C0392B":"#C9A84C",border:"1px solid #fff"}}/>}
            </button>
          );
        })}
      </div>

      <div style={{background:"#fff",border:"1px solid "+autConfig.color,borderRadius:4,borderTop:"3px solid "+autConfig.color}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid #E2DDD6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14,fontFamily:"'Georgia',serif"}}>{autConfig.icon} {autConfig.label}</div>
            {riesgos.filter(r=>r.autoridad===activeAut).length>0&&<div style={{fontSize:11,color:"#C0392B",fontFamily:"system-ui,sans-serif",marginTop:2}}>{riesgos.filter(r=>r.autoridad===activeAut).length} alerta(s) en esta sección</div>}
          </div>
          {isAdmin&&!editing&&<button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={()=>{setForm({...datosAut});setEditing(true);}}>Editar</button>}
          {isAdmin&&editing&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
            {saved&&<span style={{fontSize:11,color:"#5A8A3C",fontFamily:"system-ui,sans-serif"}}>{saved}</span>}
            <button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setEditing(false)}>Cancelar</button>
            <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={save}>Guardar</button>
          </div>}
        </div>
        <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14}}>
          {autConfig.campos.map(campo=>{
            const val=editing?(form[campo.id]||""):(datosAut[campo.id]||"");
            const alerta=riesgos.find(r=>r.campo===campo.id&&r.autoridad===activeAut);
            return(
              <div key={campo.id}>
                <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:alerta?"#C0392B":"#888880",fontFamily:"system-ui,sans-serif",marginBottom:5}}>{campo.label}{alerta?" ⚠":""}</div>
                {editing
                  ?campo.tipo==="select"
                    ?<select style={{width:"100%",border:"1px solid "+(alerta?"#fca5a5":"#E2DDD6"),borderRadius:2,padding:"8px 10px",fontSize:13,background:"#fff",cursor:"pointer",boxSizing:"border-box",fontFamily:"system-ui,sans-serif"}} value={val} onChange={e=>setForm({...form,[campo.id]:e.target.value})}>
                      <option value="">Sin datos</option>
                      {campo.ops.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                    :campo.tipo==="textarea"
                    ?<textarea style={{width:"100%",border:"1px solid "+(alerta?"#fca5a5":"#E2DDD6"),borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif",resize:"vertical"}} rows={2} value={val} onChange={e=>setForm({...form,[campo.id]:e.target.value})}/>
                    :<input style={{width:"100%",border:"1px solid "+(alerta?"#fca5a5":"#E2DDD6"),borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} type={campo.tipo} value={val} onChange={e=>setForm({...form,[campo.id]:e.target.value})}/>
                  :<div style={{fontSize:13,fontFamily:"system-ui,sans-serif",color:val?"#1a1a1a":"#ccc",fontStyle:val?"normal":"italic"}}>
                    {val||"Sin datos"}
                    {alerta&&val&&<span style={{marginLeft:8,fontSize:10,padding:"2px 6px",borderRadius:2,background:alerta.nivel==="red"?"#fef2f2":"#fffbeb",color:alerta.nivel==="red"?"#991b1b":"#92400e",fontFamily:"system-ui,sans-serif"}}>{alerta.titulo}</span>}
                  </div>
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MOTOR DE CONSECUENCIAS OPERATIVAS ────────────────────────
const CONSECUENCIAS_MAP = {
  // SAT
  csd_vencido: {
    autoridad: "SAT",
    riesgo: "Cancelación de sellos digitales",
    consecuencia: "Sin sellos vigentes no puedes emitir una sola factura. Tu empresa no puede cobrar.",
    impacto: "CRÍTICO",
    nivel: "red",
    plazo: "Inmediato al vencer",
    accion_correctiva: "Renovar CSD ante el SAT antes del vencimiento",
    fundamento: "Art. 17-D CFF  -  el SAT puede dejar sin efectos los certificados",
    icon: "🚫",
  },
  efirma_vencida: {
    autoridad: "SAT",
    riesgo: "e.firma (FIEL) vencida",
    consecuencia: "Sin e.firma no puedes firmar nada ante el gobierno  -  declaraciones, contratos notariales, ni representar a tu empresa.",
    impacto: "CRÍTICO",
    nivel: "red",
    plazo: "Inmediato al vencer",
    accion_correctiva: "Renovar e.firma en SAT o módulo de atención",
    fundamento: "Art. 17-D CFF  -  certificados dejan de surtir efectos al vencer",
    icon: "🔑",
  },
  efirma_por_vencer: {
    autoridad: "SAT",
    riesgo: "e.firma próxima a vencer",
    consecuencia: "En menos de 30 días no podrás firmar nada ante el SAT. Renuévala antes de que sea tarde.",
    impacto: "ALTO",
    nivel: "amber",
    plazo: "Menos de 30 días",
    accion_correctiva: "Agendar renovación de e.firma con el SAT",
    fundamento: "Art. 17-D CFF",
    icon: "⏰",
  },
  opinion_negativa: {
    autoridad: "SAT",
    riesgo: "Opinión de cumplimiento negativa",
    consecuencia: "Con opinión negativa: no puedes ser proveedor de gobierno, los bancos te restringen y tus clientes corporativos pueden cancelarte.",
    impacto: "CRÍTICO",
    nivel: "red",
    plazo: "Inmediato",
    accion_correctiva: "Regularizar adeudos SAT y solicitar nueva opinión",
    fundamento: "Regla 2.1.39 RMF  -  opinión afecta contratos con gobierno",
    icon: "⛔",
  },
  buzon_inactivo: {
    autoridad: "SAT",
    riesgo: "Buzón tributario inactivo",
    consecuencia: "El SAT te notifica aunque no estés leyendo. Si no tienes buzón activo, puedes perder una defensa sin saberlo.",
    impacto: "ALTO",
    nivel: "amber",
    plazo: "Ya en curso",
    accion_correctiva: "Activar buzón tributario y registrar correo de notificaciones",
    fundamento: "Art. 17-K CFF  -  buzón inactivo no exime de efectos de notificaciones",
    icon: "📭",
  },
  sin_representante_sat: {
    autoridad: "SAT",
    riesgo: "Sin representante acreditado ante SAT",
    consecuencia: "Si el SAT llega a revisarte y no tienes representante acreditado, no tienes con quién defenderte.",
    impacto: "MEDIO",
    nivel: "amber",
    plazo: "Al primer acto de autoridad",
    accion_correctiva: "Acreditar representante legal ante SAT con e.firma",
    fundamento: "Art. 19 CFF  -  representación ante autoridades fiscales",
    icon: "👤",
  },
  padron_importadores: {
    autoridad: "SAT",
    riesgo: "Riesgo de suspensión en Padrón de Importadores",
    consecuencia: "Si no estás al corriente, el SAT puede suspenderte del padrón. No podrás importar mercancía.",
    impacto: "CRÍTICO",
    nivel: "red",
    plazo: "Al detectar incumplimiento",
    accion_correctiva: "Verificar estatus en padrón de importadores y regularizar",
    fundamento: "Reglas 1.3.2 y 1.3.3 RGCE",
    icon: "🚢",
  },
  // IMSS
  credito_fiscal_imss: {
    autoridad: "IMSS",
    riesgo: "Crédito fiscal IMSS  -  riesgo de embargo",
    consecuencia: "El IMSS no necesita ir a juicio para embargarte. Puede congelar tus cuentas y tomar tus bienes directamente.",
    impacto: "CRÍTICO",
    nivel: "red",
    plazo: "Inmediato tras liquidación de crédito",
    accion_correctiva: "Celebrar convenio de pago con el IMSS o cubrir adeudo",
    fundamento: "Art. 287 LSS  -  el IMSS tiene facultades de ejecución fiscal",
    icon: "🏦",
  },
  sin_registro_patronal: {
    autoridad: "IMSS",
    riesgo: "Sin registro patronal IMSS",
    consecuencia: "Tus empleados están desprotegidos y tú tienes multas severas por cada trabajador sin registrar.",
    impacto: "CRÍTICO",
    nivel: "red",
    plazo: "Inmediato",
    accion_correctiva: "Inscribir empresa ante IMSS y dar de alta a trabajadores",
    fundamento: "Art. 15 y 304-A LSS",
    icon: "👷",
  },
  sin_representante_imss: {
    autoridad: "IMSS",
    riesgo: "Sin representante ante IMSS",
    consecuencia: "Si el IMSS inicia una revisión y no tienes representante registrado, no puedes defenderte.",
    impacto: "MEDIO",
    nivel: "amber",
    plazo: "Al primer acto de autoridad",
    accion_correctiva: "Acreditar representante legal ante IMSS",
    fundamento: "Art. 5-A fracción VIII LSS",
    icon: "⚖️",
  },
  // INFONAVIT
  credito_fiscal_infonavit: {
    autoridad: "INFONAVIT",
    riesgo: "Crédito fiscal INFONAVIT  -  riesgo de embargo",
    consecuencia: "INFONAVIT puede congelarte las cuentas sin juicio si tienes adeudos.",
    impacto: "CRÍTICO",
    nivel: "red",
    plazo: "Inmediato tras liquidación",
    accion_correctiva: "Regularizar aportaciones INFONAVIT",
    fundamento: "Art. 30 Ley del INFONAVIT",
    icon: "🏠",
  },
  // BANCOS / PLD
  riesgo_pld: {
    autoridad: "BANCOS",
    riesgo: "Riesgo de bloqueo por PLD",
    consecuencia: "Tu banco puede congelarte las cuentas sin aviso si la documentación de tus representantes y dueños no está completa.",
    impacto: "CRÍTICO",
    nivel: "red",
    plazo: "Sin previo aviso",
    accion_correctiva: "Completar KYC de todos los apoderados y declarar beneficiario final",
    fundamento: "LFPIORPI y disposiciones Banxico en materia de PLD",
    icon: "🔒",
  },
  sin_representante_bancario: {
    autoridad: "BANCOS",
    riesgo: "Sin constancia de representante bancario",
    consecuencia: "Sin constancia de representación, tu banco puede rechazar operaciones o exigir que el dueño vaya en persona.",
    impacto: "ALTO",
    nivel: "amber",
    plazo: "Al siguiente operación bancaria cuestionada",
    accion_correctiva: "Registrar constancia de representación ante banco",
    fundamento: "Circular Banxico 14/2022 en materia de representación",
    icon: "🏛️",
  },
  // RPPyC
  folio_cancelado: {
    autoridad: "RPPyC",
    riesgo: "Folio mercantil desactualizado",
    consecuencia: "Sin folio actualizado, cualquier cambio en tu empresa puede ser desconocido por bancos, socios y clientes. Terceros pueden alegar desconocimiento de cambios societarios.",
    impacto: "ALTO",
    nivel: "amber",
    plazo: "Al primer acto cuestionado",
    accion_correctiva: "Actualizar folio mercantil en RPPyC",
    fundamento: "Art. 21 Código de Comercio  -  obligación de inscripción",
    icon: "📋",
  },
};

async function calcConsecuencias(clientId, industria) {
  const hoy = new Date();
  const en30 = new Date(hoy); en30.setDate(hoy.getDate() + 30);

  const [perfiles, personas, kycDocs, constancias] = await Promise.all([
    supabase.from("perfil_regulatorio").select("*").eq("client_id", clientId),
    supabase.from("personas").select("*").eq("client_id", clientId),
    supabase.from("kyc_docs").select("*").eq("client_id", clientId),
    supabase.from("constancias_representacion").select("*").eq("client_id", clientId).eq("status", "activo"),
  ]);

  const perMap = {};
  (perfiles.data || []).forEach(p => { perMap[p.autoridad] = p.datos || {}; });
  const ps = personas.data || [];
  const kd = kycDocs.data || [];
  const cons = constancias.data || [];

  const alertas = [];

  const sat = perMap["SAT"] || {};
  const imss = perMap["IMSS"] || {};
  const infonavit = perMap["INFONAVIT"] || {};

  // CSD vencido
  if (sat.csd_vencimiento && new Date(sat.csd_vencimiento) < hoy) {
    alertas.push({ ...CONSECUENCIAS_MAP.csd_vencido, id: "cons_csd_vencido",
      detalle: `CSD venció el {new Date(sat.csd_vencimiento).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}` });
  }
  // e.firma vencida
  if (sat.efirma_vencimiento && new Date(sat.efirma_vencimiento) < hoy) {
    alertas.push({ ...CONSECUENCIAS_MAP.efirma_vencida, id: "cons_efirma_vencida",
      detalle: `e.firma venció el {new Date(sat.efirma_vencimiento).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}` });
  }
  // e.firma por vencer
  else if (sat.efirma_vencimiento && new Date(sat.efirma_vencimiento) >= hoy && new Date(sat.efirma_vencimiento) <= en30) {
    const dias = Math.ceil((new Date(sat.efirma_vencimiento) - hoy) / (1000*60*60*24));
    alertas.push({ ...CONSECUENCIAS_MAP.efirma_por_vencer, id: "cons_efirma_pronto",
      detalle: `e.firma vence en {dias} días - {new Date(sat.efirma_vencimiento).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}` });
  }
  // Opinión negativa
  if (sat.opinion_cumplimiento === "Negativa" || sat.opinion_cumplimiento === "No vigente" || sat.opinion_cumplimiento === "No consultada" || !sat.opinion_cumplimiento) {
    alertas.push({ ...CONSECUENCIAS_MAP.opinion_negativa, id: "cons_opinion",
      detalle: sat.opinion_cumplimiento ? `Estatus actual: {sat.opinion_cumplimiento}` : "Sin datos de opinión de cumplimiento" });
  }
  // Buzón inactivo
  if (!sat.buzon_tributario || sat.buzon_tributario === "Inactivo" || sat.buzon_tributario === "No configurado") {
    alertas.push({ ...CONSECUENCIAS_MAP.buzon_inactivo, id: "cons_buzon",
      detalle: "Notificaciones del SAT con efectos legales sin receptor activo" });
  }
  // Sin representante SAT
  if (!sat.representante_sat) {
    alertas.push({ ...CONSECUENCIAS_MAP.sin_representante_sat, id: "cons_rep_sat",
      detalle: "Sin representante legal acreditado ante el SAT" });
  }
  // IMSS adeudo
  if (imss.estatus_imss === "Adeudo menor" || imss.estatus_imss === "Adeudo significativo") {
    alertas.push({ ...CONSECUENCIAS_MAP.credito_fiscal_imss, id: "cons_imss_adeudo",
      detalle: `Estatus IMSS: {imss.estatus_imss}` });
  }
  // Sin registro patronal
  if (!imss.registro_patronal) {
    alertas.push({ ...CONSECUENCIAS_MAP.sin_registro_patronal, id: "cons_imss_reg",
      detalle: "Sin número de registro patronal registrado" });
  }
  // Sin representante IMSS
  if (!imss.representante_imss) {
    alertas.push({ ...CONSECUENCIAS_MAP.sin_representante_imss, id: "cons_rep_imss",
      detalle: "Sin representante acreditado ante el IMSS" });
  }
  // INFONAVIT adeudo
  if (infonavit.estatus_infonavit === "Adeudo menor" || infonavit.estatus_infonavit === "Adeudo significativo") {
    alertas.push({ ...CONSECUENCIAS_MAP.credito_fiscal_infonavit, id: "cons_infonavit",
      detalle: `Estatus INFONAVIT: {infonavit.estatus_infonavit}` });
  }
  // PLD - KYC incompleto en apoderados bancarios
  const apoderadosBancarios = ps.filter(p => p.tipo === "apoderado" && p.alcance && p.alcance.some(a => a.includes("bancari") || a.includes("CNBV") || a.includes("crédito")));
  const sinKYC = apoderadosBancarios.filter(p => {
    const docs = kd.filter(d => d.persona_id === p.id && d.status === "entregado");
    return docs.length === 0;
  });
  if (sinKYC.length > 0 || ps.filter(p => p.beneficiario_final).length === 0) {
    alertas.push({ ...CONSECUENCIAS_MAP.riesgo_pld, id: "cons_pld",
      detalle: sinKYC.length > 0 ? `${sinKYC.length} apoderado(s) bancario(s) sin KYC completo` : "Sin beneficiario final declarado - riesgo PLD" });
  }
  // Sin constancia bancaria
  const consBancaria = cons.filter(c => c.alcance && (c.alcance.includes("bancari") || c.alcance.includes("Apertura") || c.alcance.includes("CNBV")));
  if (apoderadosBancarios.length > 0 && consBancaria.length === 0) {
    alertas.push({ ...CONSECUENCIAS_MAP.sin_representante_bancario, id: "cons_rep_banco",
      detalle: "Apoderado con alcance bancario sin constancia de representación ante institución" });
  }
  // Folio desactualizado
  const se = perMap["SE"] || {};
  if (se.folio_actualizacion) {
    const dos = new Date(hoy); dos.setFullYear(hoy.getFullYear() - 2);
    if (new Date(se.folio_actualizacion) < dos) {
      alertas.push({ ...CONSECUENCIAS_MAP.folio_cancelado, id: "cons_folio",
        detalle: `Última actualización: {new Date(se.folio_actualizacion).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}` });
    }
  } else if (!se.folio_mercantil) {
    alertas.push({ ...CONSECUENCIAS_MAP.folio_cancelado, id: "cons_folio_ausente",
      detalle: "Sin folio mercantil registrado en el sistema" });
  }

  alertas.sort((a, b) => (a.nivel === "red" ? -1 : 1) - (b.nivel === "red" ? -1 : 1));
  return alertas;
}

function ConsecuenciasTab({client, isAdmin=false, onNavigate}){
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [alertasModulos, setAlertasModulos] = useState([]);

  useEffect(()=>{
    calcConsecuencias(client.id, client.industria||"general").then(a=>{setAlertas(a);setLoading(false);});
    // Cargar items no cumple de reglas_compliance
    const socId=client._sociedad?.id||null;
    const q=socId
      ?supabase.from("reglas_compliance").select("*").eq("client_id",client.id).eq("sociedad_id",socId).eq("status","no_cumple")
      :supabase.from("reglas_compliance").select("*").eq("client_id",client.id).is("sociedad_id",null).eq("status","no_cumple");
    q.then(({data:d})=>{
      const grouped={};
      (d||[]).forEach(x=>{
        if(!grouped[x.modulo])grouped[x.modulo]=[];
        const mod=MODULOS_CATALOG.find(m=>m.id===x.modulo);
        const items=MODULO_DOCS[x.modulo]?.checklist||[];
        const item=items.find(i=>i.id===x.regla_id);
        if(item)grouped[x.modulo].push({...x,label:item.label,riesgo:item.riesgo,modNombre:mod?.nombre||x.modulo});
      });
      setAlertasModulos(Object.entries(grouped).map(([modId,items])=>({modId,modNombre:items[0]?.modNombre||modId,items})));
    });
  },[client.id,client._sociedad?.id]);

  if(loading)return <div style={{textAlign:"center",padding:"3rem",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Analizando riesgos operativos...</div>;

  const criticos = alertas.filter(a=>a.nivel==="red");
  const altos = alertas.filter(a=>a.nivel==="amber");
  const totalNoCumple = alertasModulos.reduce((acc,m)=>acc+m.items.length,0);
  const IMPACTO_COLOR = {CRÍTICO:"#C0392B",ALTO:"#E67E22",MEDIO:"#C9A84C"};
  const IMPACTO_BG = {CRÍTICO:"#fef2f2",ALTO:"#fef9f0",MEDIO:"#fffbeb"};

  return(
    <div>
      {/* Header */}
      <div style={{background:"#1a1a1a",borderRadius:4,padding:"1.25rem 1.5rem",marginBottom:20}}>
        <div style={{fontSize:10,letterSpacing:".15em",textTransform:"uppercase",color:"#C9A84C",fontFamily:"system-ui,sans-serif",marginBottom:6}}>Exposición operativa</div>
        <div style={{fontSize:18,fontFamily:"'Georgia',serif",color:"#fff",marginBottom:4}}>Lo que puede detenerte de operar mañana</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.5)",fontFamily:"system-ui,sans-serif"}}>Facturas bloqueadas · Cuentas embargadas · Sin acceso a trámites · Representantes sin validez</div>
        <div style={{display:"flex",gap:12,marginTop:16}}>
          <div style={{background:"rgba(192,57,43,.2)",border:"1px solid rgba(192,57,43,.4)",borderRadius:4,padding:"8px 16px",textAlign:"center"}}>
            <div style={{fontSize:24,color:"#ff6b6b",fontFamily:"'Georgia',serif"}}>{criticos.length}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Críticos</div>
          </div>
          <div style={{background:"rgba(201,168,76,.15)",border:"1px solid rgba(201,168,76,.3)",borderRadius:4,padding:"8px 16px",textAlign:"center"}}>
            <div style={{fontSize:24,color:"#C9A84C",fontFamily:"'Georgia',serif"}}>{altos.length}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Atención</div>
          </div>
          {totalNoCumple>0&&<div style={{background:"rgba(192,57,43,.15)",border:"1px solid rgba(192,57,43,.3)",borderRadius:4,padding:"8px 16px",textAlign:"center"}}>
            <div style={{fontSize:24,color:"#ff9999",fontFamily:"'Georgia',serif"}}>{totalNoCumple}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Sin cumplir</div>
          </div>}
          {alertas.length===0&&totalNoCumple===0&&<div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>✓</span>
            <span style={{fontSize:13,color:"#5A8A3C",fontFamily:"system-ui,sans-serif"}}>Sin riesgos operativos detectados</span>
          </div>}
        </div>
      </div>

      {alertasModulos.length>0&&<div style={{marginBottom:16}}>
        <div style={{fontSize:10,letterSpacing:".15em",textTransform:"uppercase",color:"#C0392B",fontFamily:"system-ui,sans-serif",marginBottom:10,fontWeight:600}}>⚠ Items sin cumplir por módulo</div>
        {alertasModulos.map(mod=>(
          <div key={mod.modId} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:4,padding:"12px 14px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:13,fontFamily:"Georgia,serif",color:"#1E2B1A"}}>{mod.modNombre}</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:11,background:"#fef2f2",color:"#991b1b",border:"1px solid #fecaca",borderRadius:3,padding:"2px 8px",fontFamily:"system-ui,sans-serif"}}>{mod.items.length} sin cumplir</span>
                {onNavigate&&<button onClick={()=>onNavigate("mod_"+mod.modId)} style={{fontSize:11,padding:"3px 10px",borderRadius:3,border:"1px solid #DDE4D8",background:"#fff",cursor:"pointer",fontFamily:"system-ui,sans-serif",color:"#4A5C45"}}>Ver módulo →</button>}
              </div>
            </div>
            {mod.items.map((item,idx)=>(
              <div key={idx} style={{display:"flex",flexDirection:"column",gap:3,padding:"6px 0",borderTop:"1px solid #fecaca"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:9,padding:"1px 6px",borderRadius:2,background:item.riesgo==="critico"?"#fef2f2":"#fff7ed",color:item.riesgo==="critico"?"#991b1b":"#9a3412",fontFamily:"system-ui,sans-serif",fontWeight:600,textTransform:"uppercase"}}>{item.riesgo}</span>
                  <span style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1E2B1A"}}>{item.label}</span>
                </div>
                {item.accion_recomendada&&<div style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:"#4A5C45",background:"#F0F4EE",borderRadius:3,padding:"4px 8px",borderLeft:"2px solid #4A5C45"}}>
                  <span style={{fontWeight:600}}>Próximo paso: </span>{item.accion_recomendada}
                </div>}
              </div>
            ))}
          </div>
        ))}
      </div>}
      {alertas.length===0&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:4,padding:"2rem",textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:8}}>✓</div>
        <div style={{fontSize:15,fontFamily:"'Georgia',serif",color:"#166534"}}>Todo en orden - puedes operar sin interrupciones</div>
        <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:4}}>Llena tu perfil ante autoridades para ver el análisis completo</div>
      </div>}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {alertas.map(a=>(
          <div key={a.id} style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,overflow:"hidden",borderLeft:"4px solid "+(a.nivel==="red"?"#C0392B":"#C9A84C")}}>
            {/* Header row */}
            <div style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:12}} onClick={()=>setExpanded(expanded===a.id?null:a.id)}>
              <span style={{fontSize:20,flexShrink:0}}>{a.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                  <div style={{fontSize:13,fontFamily:"'Georgia',serif",color:"#1a1a1a",fontWeight:400}}>{a.riesgo}</div>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:IMPACTO_BG[a.impacto]||"#f3f4f6",color:IMPACTO_COLOR[a.impacto]||"#888",fontFamily:"system-ui,sans-serif",fontWeight:600}}>{a.impacto}</span>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#f3f4f6",color:"#888880",fontFamily:"system-ui,sans-serif"}}>{a.autoridad}</span>
                </div>
                <div style={{fontSize:12,color:"#C0392B",fontFamily:"system-ui,sans-serif",fontWeight:500}}>{a.consecuencia}</div>
                <div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:3}}>{a.detalle}</div>
              </div>
              <span style={{fontSize:11,color:"#888880",flexShrink:0}}>{expanded===a.id?"▲":"▼"}</span>
            </div>
            {/* Expanded detail */}
            {expanded===a.id&&<div style={{borderTop:"1px solid #F5F2ED",padding:"12px 16px",background:"#F5F2ED",display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"8px 12px",flex:1,minWidth:150}}>
                  <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:4}}>¿Cuándo pasa esto?</div>
                  <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1a1a1a"}}>{a.plazo}</div>
                </div>
                <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"8px 12px",flex:2,minWidth:200}}>
                  <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:4}}>¿Qué hago ahora?</div>
                  <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1a1a1a"}}>{a.accion_correctiva}</div>
                </div>
              </div>
              <div style={{fontSize:10,color:"#888880",fontFamily:"system-ui,sans-serif",fontStyle:"italic"}}>Fundamento: {a.fundamento}</div>
              {isAdmin&&onNavigate&&<div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"}} onClick={()=>onNavigate(a.autoridad==="SAT"||a.autoridad==="IMSS"||a.autoridad==="INFONAVIT"||a.autoridad==="RPPyC"?"regulatorio":"personas")}>Corregir esto →</button>
              </div>}
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ANÁLISIS DE ESTATUTOS CON IA ─────────────────────────────
function AdminEstatutosTab({client}){
  const [checklist,setChecklist]=useState([]);
  const [analisis,setAnalisis]=useState([]);
  const [loading,setLoading]=useState(true);
  const [analyzing,setAnalyzing]=useState(false);
  const [showChecklist,setShowChecklist]=useState(false);
  const [newClausula,setNewClausula]=useState({categoria:"",titulo:"",descripcion:"",obligatoria:true});
  const [dragOver,setDragOver]=useState(false);
  const fileRef=React.useRef(null);

  useEffect(()=>{
    async function load(){
      const [cl,an]=await Promise.all([
        supabase.from("clausulas_checklist").select("*").order("orden"),
        supabase.from("analisis_estatutos").select("*").eq("client_id",client.id).order("created_at",{ascending:false}),
      ]);
      setChecklist(cl.data||[]);
      setAnalisis(an.data||[]);
      setLoading(false);
    }
    load();
  },[client.id]);

  async function analyzeFile(file){
    if(!file||!file.type.includes("pdf"))return;
    setAnalyzing(true);
    try{
      // Upload to Supabase Storage to avoid Vercel 4MB body limit
      const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");const path=`${client.id}/${Date.now()}_${safeName}`;
      const {error:uploadError}=await supabase.storage.from("estatutos").upload(path,file,{contentType:"application/pdf"});
      if(uploadError)throw new Error("Error al subir: "+uploadError.message);

      const response=await fetch("/api/analizar-estatutos",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          storagePath:path,
          clientId:client.id,
          clientName:client.name,
          industria:client.industria||"general",
          fileName:file.name,
        })
      });

      const data=await response.json();
      if(!data.ok){throw new Error(data.error||"Error en el análisis");}
      setAnalisis(prev=>[data.analisis,...prev]);
    }catch(e){
      console.error(e);
      alert("Error al analizar: "+e.message);
    }
    setAnalyzing(false);
  }

  async function addClausula(){
    if(!newClausula.titulo||!newClausula.descripcion)return;
    const c={id:"cl"+Date.now(),...newClausula,orden:checklist.length+1,created_at:new Date().toISOString()};
    await supabase.from("clausulas_checklist").insert(c);
    setChecklist(prev=>[...prev,c]);
    setNewClausula({categoria:"",titulo:"",descripcion:"",obligatoria:true});
  }
  async function deleteClausula(id){
    await supabase.from("clausulas_checklist").delete().eq("id",id);
    setChecklist(prev=>prev.filter(c=>c.id!==id));
  }
  async function deleteAnalisis(id){
    await supabase.from("analisis_estatutos").delete().eq("id",id);
    setAnalisis(prev=>prev.filter(a=>a.id!==id));
  }

  if(loading)return <div style={{textAlign:"center",padding:"3rem",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;

  const NIVEL_COLOR={bajo:"#5A8A3C",medio:"#C9A84C",alto:"#C0392B"};
  const NIVEL_LABEL={bajo:"Riesgo bajo",medio:"Riesgo medio",alto:"Riesgo alto"};

  return(
    <div>
      {/* Upload area */}
      <div
        style={{border:"2px dashed "+(dragOver?"#1a1a1a":"#E2DDD6"),borderRadius:4,padding:"2rem",textAlign:"center",marginBottom:20,background:dragOver?"#F5F2ED":"#fff",cursor:"pointer",transition:"all .2s"}}
        onDragOver={e=>{e.preventDefault();setDragOver(true);}}
        onDragLeave={()=>setDragOver(false)}
        onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)analyzeFile(f);}}
        onClick={()=>fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>analyzeFile(e.target.files[0])}/>
        {analyzing
          ?<div>
            <div style={{fontSize:24,marginBottom:8}}>🔍</div>
            <div style={{fontSize:14,fontFamily:"'Georgia',serif",color:"#1a1a1a",marginBottom:4}}>Analizando tus estatutos...</div>
            <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif"}}>Claude está revisando cada cláusula contra tu checklist</div>
          </div>
          :<div>
            <div style={{fontSize:32,marginBottom:8}}>📄</div>
            <div style={{fontSize:14,fontFamily:"'Georgia',serif",color:"#1a1a1a",marginBottom:4}}>Sube los estatutos de {client.name}</div>
            <div style={{fontSize:12,color:"#888880",fontFamily:"system-ui,sans-serif"}}>Arrastra el PDF aquí o haz clic para seleccionar</div>
            <div style={{fontSize:11,color:"#C9A84C",fontFamily:"system-ui,sans-serif",marginTop:8}}>El análisis tarda menos de 30 segundos</div>
          </div>
        }
      </div>

      {/* Checklist management */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif"}}>{checklist.length} cláusulas en tu checklist</span>
          <button style={{background:"none",border:"1px solid #E2DDD6",borderRadius:2,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>setShowChecklist(!showChecklist)}>{showChecklist?"Ocultar checklist":"Ver y editar checklist"}</button>
        </div>
        {showChecklist&&<div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"1rem"}}>
          {checklist.map(c=><div key={c.id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid #F5F2ED"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1a1a1a",fontWeight:600}}>{c.titulo}</div>
              <div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif"}}>{c.descripcion}</div>
              {c.categoria&&<span style={{fontSize:10,padding:"1px 6px",background:"#F5F2ED",color:"#888880",borderRadius:2,fontFamily:"system-ui,sans-serif"}}>{c.categoria}</span>}
            </div>
            <span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:c.obligatoria?"#fef2f2":"#fffbeb",color:c.obligatoria?"#991b1b":"#92400e",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap"}}>{c.obligatoria?"Obligatoria":"Recomendada"}</span>
            <button style={{border:"1px solid #fca5a5",color:"#dc2626",background:"none",borderRadius:2,padding:"2px 8px",fontSize:11,cursor:"pointer",flexShrink:0}} onClick={()=>deleteClausula(c.id)}>×</button>
          </div>)}
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12,padding:"12px",background:"#F5F2ED",borderRadius:4}}>
            <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif"}}>Agregar cláusula al checklist</div>
            <div style={{display:"flex",gap:8}}>
              <input style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"8px 10px",fontSize:12,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif"}} placeholder="Título de la cláusula *" value={newClausula.titulo} onChange={e=>setNewClausula({...newClausula,titulo:e.target.value})}/>
              <input style={{width:140,border:"1px solid #E2DDD6",borderRadius:2,padding:"8px 10px",fontSize:12,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif",flexShrink:0}} placeholder="Categoría" value={newClausula.categoria} onChange={e=>setNewClausula({...newClausula,categoria:e.target.value})}/>
            </div>
            <textarea style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"8px 10px",fontSize:12,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif",resize:"vertical"}} rows={2} placeholder="Descripción - ¿qué debe decir el estatuto sobre esto?" value={newClausula.descripcion} onChange={e=>setNewClausula({...newClausula,descripcion:e.target.value})}/>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <label style={{display:"flex",gap:6,alignItems:"center",cursor:"pointer",fontSize:12,fontFamily:"system-ui,sans-serif"}}>
                <input type="checkbox" checked={newClausula.obligatoria} onChange={e=>setNewClausula({...newClausula,obligatoria:e.target.checked})} style={{accentColor:"#C9A84C"}}/>
                Obligatoria
              </label>
              <button style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:2,padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",marginLeft:"auto"}} onClick={addClausula} disabled={!newClausula.titulo||!newClausula.descripcion}>Agregar</button>
            </div>
          </div>
        </div>}
      </div>

      {/* Analysis results */}
      {analisis.length===0?<div style={{textAlign:"center",padding:"2rem",color:"#888880",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Aún no hay análisis - sube los estatutos para empezar</div>
      :analisis.map(a=>{
        const r=a.resultado||{};
        if(r.error)return(
          <div key={a.id} style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:4,padding:"1rem",marginBottom:12}}>
            <div style={{fontSize:13,color:"#C0392B",fontFamily:"system-ui,sans-serif"}}>Error al analizar: {r.error}</div>
          </div>
        );
        const clausulasPresentes=(r.clausulas||[]).filter(c=>c.presente&&c.actualizada).length;
        const clausulasFaltantes=(r.clausulas||[]).filter(c=>!c.presente).length;
        const clausulasDesactualizadas=(r.clausulas||[]).filter(c=>c.presente&&!c.actualizada).length;
        return(
          <div key={a.id} style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,marginBottom:16,overflow:"hidden"}}>
            {/* Header */}
            <div style={{background:"#1a1a1a",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,color:"#fff",fontFamily:"system-ui,sans-serif",fontWeight:600}}>{a.nombre_documento}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.5)",fontFamily:"system-ui,sans-serif"}}>{new Date(a.created_at).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}{r.fecha_probable_constitucion&&" · Constituida aprox. "+r.fecha_probable_constitucion}</div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {r.nivel_riesgo&&<span style={{fontSize:11,padding:"3px 10px",borderRadius:2,background:NIVEL_COLOR[r.nivel_riesgo]||"#888",color:"#fff",fontFamily:"system-ui,sans-serif",fontWeight:600}}>{NIVEL_LABEL[r.nivel_riesgo]||r.nivel_riesgo}</span>}
                <button style={{border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.5)",background:"none",borderRadius:2,padding:"2px 8px",fontSize:11,cursor:"pointer"}} onClick={()=>deleteAnalisis(a.id)}>×</button>
              </div>
            </div>

            <div style={{padding:"16px"}}>
              {/* Resumen ejecutivo */}
              {r.resumen_ejecutivo&&<div style={{background:"#F5F2ED",borderRadius:4,padding:"12px 16px",marginBottom:16,borderLeft:"3px solid #C9A84C"}}>
                <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:6}}>Diagnóstico rápido</div>
                <div style={{fontSize:13,fontFamily:"system-ui,sans-serif",color:"#1a1a1a",lineHeight:1.6}}>{r.resumen_ejecutivo}</div>
              </div>}

              {/* Objeto social */}
              {r.objeto_social&&<div style={{marginBottom:16}}>
                <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#888880",fontFamily:"system-ui,sans-serif",marginBottom:8}}>Objeto social</div>
                <div style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"12px",borderLeft:"3px solid "+(r.objeto_social.vigente?"#5A8A3C":"#C0392B")}}>
                  <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1a1a1a",marginBottom:4}}>{r.objeto_social.texto}</div>
                  {r.objeto_social.observacion&&<div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",fontStyle:"italic"}}>{r.objeto_social.observacion}</div>}
                </div>
              </div>}

              {/* Prioridades */}
              {r.prioridad_actualizacion?.length>0&&<div style={{marginBottom:16}}>
                <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#C0392B",fontFamily:"system-ui,sans-serif",marginBottom:8}}>Esto es lo más urgente</div>
                {r.prioridad_actualizacion.map((p,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 12px",background:i===0?"#fef2f2":"#fff",border:"1px solid "+(i===0?"#fca5a5":"#E2DDD6"),borderRadius:4,marginBottom:6}}>
                  <span style={{fontSize:14,fontWeight:600,color:i===0?"#C0392B":i===1?"#C9A84C":"#888",fontFamily:"'Georgia',serif",flexShrink:0}}>{i+1}</span>
                  <span style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1a1a1a"}}>{p}</span>
                </div>)}
              </div>}

              {/* Clausulas summary */}
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <div style={{flex:1,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:4,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:20,color:"#5A8A3C",fontFamily:"'Georgia',serif"}}>{clausulasPresentes}</div>
                  <div style={{fontSize:10,color:"#888880",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Al día</div>
                </div>
                <div style={{flex:1,background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:4,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:20,color:"#C0392B",fontFamily:"'Georgia',serif"}}>{clausulasFaltantes}</div>
                  <div style={{fontSize:10,color:"#888880",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Faltan</div>
                </div>
                <div style={{flex:1,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:4,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:20,color:"#C9A84C",fontFamily:"'Georgia',serif"}}>{clausulasDesactualizadas}</div>
                  <div style={{fontSize:10,color:"#888880",fontFamily:"system-ui,sans-serif",textTransform:"uppercase",letterSpacing:".06em"}}>Desactualizadas</div>
                </div>
              </div>

              {/* Clausulas detail */}
              {(r.clausulas||[]).map((c,i)=><div key={i} style={{background:"#fff",border:"1px solid #E2DDD6",borderRadius:4,padding:"10px 14px",marginBottom:6,borderLeft:"3px solid "+(c.presente&&c.actualizada?"#5A8A3C":!c.presente?"#C0392B":"#C9A84C")}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1a1a1a",fontWeight:600,marginBottom:3}}>{c.titulo}</div>
                    <div style={{fontSize:11,color:"#888880",fontFamily:"system-ui,sans-serif",lineHeight:1.5}}>{c.observacion_practica}</div>
                    {!c.presente&&c.riesgo_si_falta&&<div style={{fontSize:11,color:"#C0392B",fontFamily:"system-ui,sans-serif",marginTop:4,fontStyle:"italic"}}>⚠ {c.riesgo_si_falta}</div>}
                    {c.texto_encontrado&&<div style={{fontSize:10,color:"#888880",fontFamily:"system-ui,sans-serif",marginTop:4,background:"#F5F2ED",padding:"4px 8px",borderRadius:2,fontStyle:"italic"}}>"{c.texto_encontrado}"</div>}
                  </div>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:2,whiteSpace:"nowrap",fontFamily:"system-ui,sans-serif",background:c.presente&&c.actualizada?"#f0fdf4":!c.presente?"#fef2f2":"#fffbeb",color:c.presente&&c.actualizada?"#166534":!c.presente?"#991b1b":"#92400e",flexShrink:0}}>{c.presente&&c.actualizada?"✓ Tiene":"No tiene"}</span>
                </div>
              </div>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BrandingTab({client, onBrandingUpdate}){
  const [branding, setBranding] = useState(client.branding || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const logoRef = React.useRef(null);
  const coverRef = React.useRef(null);

  async function uploadImage(file, key) {
    const ext = file.name.split(".").pop();
    const path = client.id + "/" + key + "." + ext;
    const { error } = await supabase.storage.from("branding").upload(path, file, { contentType: file.type, upsert: true });
    if (error) { alert("Error al subir imagen: " + error.message); return null; }
    const { data } = supabase.storage.from("branding").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file, "logo");
    if (url) { const nb = { ...branding, logo: url }; setBranding(nb); await save(nb); }
  }

  async function handleCover(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file, "cover");
    if (url) { const nb = { ...branding, cover: url }; setBranding(nb); await save(nb); }
  }

  async function save(b) {
    setSaving(true);
    const data = b || branding;
    await supabase.from("clients").update({ branding: data }).eq("id", client.id);
    onBrandingUpdate && onBrandingUpdate(data);
    setSaving(false);
    setSaved("Guardado ✓");
    setTimeout(() => setSaved(""), 2000);
  }

  const MUSGO_DEF = "#4A5C45";

  return (
    <div>
      <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:16}}>Personalización del portal</div>

      {/* Preview */}
      <div style={{background:"#F2F4F0",borderRadius:8,padding:16,marginBottom:20,border:"1px solid #DDE4D8"}}>
        <div style={{fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:8,textTransform:"uppercase",letterSpacing:".08em"}}>Vista previa del sidebar</div>
        <div style={{width:180,background:branding.color||MUSGO_DEF,borderRadius:6,padding:"14px 12px",display:"flex",flexDirection:"column",gap:8}}>
          {branding.logo
            ? <img src={branding.logo} style={{height:28,objectFit:"contain",filter:"brightness(0) invert(1)",alignSelf:"flex-start"}} alt="logo"/>
            : <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.9)",fontFamily:"system-ui,sans-serif"}}>{branding.nombre||client.name}</div>
          }
          <div style={{fontSize:9,color:"rgba(255,255,255,.45)",fontFamily:"system-ui,sans-serif"}}>{branding.nombre_portal||"Panel corporativo"}</div>
          <div style={{height:1,background:"rgba(255,255,255,.12)"}}/>
          <div style={{fontSize:10,color:"rgba(255,255,255,.6)",fontFamily:"system-ui,sans-serif"}}>Mi empresa</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.6)",fontFamily:"system-ui,sans-serif"}}>Alertas críticas</div>
          <div style={{height:1,background:"rgba(255,255,255,.12)",marginTop:4}}/>
          <div style={{fontSize:8,color:"rgba(255,255,255,.3)",fontFamily:"system-ui,sans-serif"}}>Powered by M&M Abogados</div>
        </div>
      </div>

      {/* Fields */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>

        {/* Logo */}
        <div>
          <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:6}}>Logo de la empresa</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {branding.logo
              ? <img src={branding.logo} style={{height:36,border:"1px solid #DDE4D8",borderRadius:4,padding:4,background:"#fff"}} alt="logo"/>
              : <div style={{width:60,height:36,border:"1px dashed #DDE4D8",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>Sin logo</div>
            }
            <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogo}/>
            <button style={{background:"#4A5C45",color:"#F0F4EE",border:"none",borderRadius:4,padding:"6px 12px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>logoRef.current?.click()}>Subir logo</button>
            {branding.logo && <button style={{background:"none",border:"1px solid #DDE4D8",borderRadius:4,padding:"6px 10px",fontSize:11,cursor:"pointer",color:"#C0392B"}} onClick={()=>{const nb={...branding};delete nb.logo;setBranding(nb);save(nb);}}>Quitar</button>}
          </div>
          <div style={{fontSize:10,color:"#AAA",fontFamily:"system-ui,sans-serif",marginTop:4}}>PNG o SVG con fondo transparente recomendado. Se mostrará en blanco sobre el color del sidebar.</div>
        </div>

        {/* Color */}
        <div>
          <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:6}}>Color principal del portal</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <input type="color" value={branding.color||MUSGO_DEF} onChange={e=>setBranding({...branding,color:e.target.value})} style={{width:40,height:32,border:"1px solid #DDE4D8",borderRadius:4,cursor:"pointer",padding:2}}/>
            <input style={{...{width:"100%",border:"1px solid #DDE4D8",borderRadius:4,padding:"7px 10px",fontSize:12,outline:"none",background:"#fff",fontFamily:"system-ui,sans-serif"},width:120}} value={branding.color||MUSGO_DEF} onChange={e=>setBranding({...branding,color:e.target.value})} placeholder="#4A5C45"/>
            <button style={{background:"#4A5C45",color:"#F0F4EE",border:"none",borderRadius:4,padding:"6px 12px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>save()}>Aplicar</button>
          </div>
        </div>

        {/* Nombre portal */}
        <div>
          <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:6}}>Nombre del portal</div>
          <div style={{display:"flex",gap:8}}>
            <input style={{flex:1,border:"1px solid #DDE4D8",borderRadius:4,padding:"7px 10px",fontSize:12,outline:"none",background:"#fff",fontFamily:"system-ui,sans-serif"}} value={branding.nombre_portal||""} onChange={e=>setBranding({...branding,nombre_portal:e.target.value})} placeholder="Panel corporativo"/>
            <button style={{background:"#4A5C45",color:"#F0F4EE",border:"none",borderRadius:4,padding:"6px 12px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>save()}>Guardar</button>
          </div>
          <div style={{fontSize:10,color:"#AAA",fontFamily:"system-ui,sans-serif",marginTop:4}}>Aparece debajo del logo en el sidebar.</div>
        </div>

        {/* Cover */}
        <div>
          <div style={{fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:6}}>Imagen de portada del login</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {branding.cover
              ? <img src={branding.cover} style={{height:52,width:80,objectFit:"cover",borderRadius:4,border:"1px solid #DDE4D8"}} alt="cover"/>
              : <div style={{width:80,height:52,border:"1px dashed #DDE4D8",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif",textAlign:"center"}}>Sin imagen</div>
            }
            <input ref={coverRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleCover}/>
            <div>
              <button style={{background:"#4A5C45",color:"#F0F4EE",border:"none",borderRadius:4,padding:"6px 12px",fontSize:11,cursor:"pointer",fontFamily:"system-ui,sans-serif",display:"block",marginBottom:4}} onClick={()=>coverRef.current?.click()}>Subir imagen</button>
              {branding.cover && <button style={{background:"none",border:"1px solid #DDE4D8",borderRadius:4,padding:"4px 10px",fontSize:11,cursor:"pointer",color:"#C0392B"}} onClick={()=>{const nb={...branding};delete nb.cover;setBranding(nb);save(nb);}}>Quitar</button>}
            </div>
          </div>
          <div style={{fontSize:10,color:"#AAA",fontFamily:"system-ui,sans-serif",marginTop:4}}>Se muestra en el panel izquierdo del login. Recomendado: 800x600px mínimo.</div>
        </div>

        {saved&&<div style={{fontSize:12,color:"#4A5C45",fontFamily:"system-ui,sans-serif",textAlign:"center"}}>{saved}</div>}
      </div>
    </div>
  );
}

function ModuloView({modId, client}){
  const m = MODULOS_CATALOG.find(x=>x.id===modId);
  if(!m) return null;
  const tc = TIER_COLORS[m.tier];
  const [activeTab,setActiveTab]=useState("datos");

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:10,padding:"2px 8px",borderRadius:3,background:tc.bg,color:tc.color,fontFamily:"system-ui,sans-serif",fontWeight:600}}>{m.id}</span>
        <div style={{fontSize:18,fontFamily:"Georgia, serif",color:TEXT_DARK}}>{m.nombre}</div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid "+BORDER,marginBottom:16}}>
        {["datos","documentos","checklist","riesgos"].map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{padding:"8px 16px",fontSize:11,cursor:"pointer",border:"none",background:"none",color:activeTab===t?TEXT_DARK:GRAY,borderBottom:activeTab===t?"2px solid "+MUSGO:"2px solid transparent",fontWeight:activeTab===t?600:400,letterSpacing:".06em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>
            {t==="datos"?"Datos":t==="documentos"?"Documentos":t==="checklist"?"Cumplimiento":"Riesgos"}
          </button>
        ))}
      </div>

      {/* Content by tab */}
      {activeTab==="datos"&&<ModuloViewDatos modId={modId} client={client}/>}
      {activeTab==="documentos"&&<ModuloViewDocs modId={modId} client={client} isAdmin={false}/>}
      {activeTab==="checklist"&&<ModuloViewChecklist modId={modId} client={client}/>}
      {activeTab==="riesgos"&&<ModuloViewRiesgos modId={modId}/>}
    </div>
  );
}

function ModuloViewDatos({modId, client}){
  // Route to specific module data component
  if(modId==="L-01") return <ModL01 client={client}/>;
  if(modId==="L-02") return <ModL02 client={client}/>;
  if(modId==="L-03") return <ModL03 client={client}/>;
  if(modId==="L-04") return <ModL04 client={client}/>;
  if(modId==="L-05") return <ModL05 client={client}/>;
  if(modId==="L-06") return <ModL06 client={client}/>;
  if(modId==="L-07") return <ModL07 client={client}/>;
  if(modId==="L-08") return <ModL08 client={client}/>;
  if(modId==="F-01") return <ModF01 client={client}/>;
  if(modId==="F-02") return <ModF02 client={client}/>;
  if(modId==="F-03") return <ModF03 client={client}/>;
  if(modId==="F-04") return <ModF04 client={client}/>;
  if(modId==="F-05") return <ModF05 client={client}/>;
  if(modId==="F-06") return <ModF06 client={client}/>;
  if(modId==="F-07") return <ModF07 client={client}/>;
  if(modId==="F-08") return <ModF08 client={client}/>;
  if(modId==="A-01") return <ModA01 client={client}/>;
  if(modId==="A-02") return <ModA02 client={client}/>;
  if(modId==="A-03") return <ModA03 client={client}/>;
  if(modId==="A-04") return <ModA04 client={client}/>;
  if(modId==="A-05") return <ModA05 client={client}/>;
  if(modId==="A-06") return <ModA06 client={client}/>;
  if(modId==="C-01") return <ModC01 client={client}/>;
  if(modId==="C-02") return <ModC02 client={client}/>;
  if(modId==="C-03") return <ModC03 client={client}/>;
  if(modId==="C-04") return <ModC04 client={client}/>;
  if(modId==="C-05") return <ModC05 client={client}/>;
  if(modId==="C-06") return <ModC06 client={client}/>;
  if(modId==="C-07") return <ModC07 client={client}/>;
  if(modId==="C-08") return <ModC08 client={client}/>;
  if(modId==="O-01") return <ModO01 client={client}/>;
  if(modId==="O-02") return <ModO02 client={client}/>;
  if(modId==="O-03") return <ModO03 client={client}/>;
  if(modId==="O-04") return <ModO04 client={client}/>;
  if(modId==="O-05") return <ModO05 client={client}/>;
  if(modId==="O-06") return <ModO06 client={client}/>;
  if(modId==="O-07") return <ModO07 client={client}/>;
  if(modId==="O-08") return <ModO08 client={client}/>;
  if(modId==="O-09") return <ModO09 client={client}/>;
  if(modId==="O-10") return <ModO10 client={client}/>;
  if(modId==="M-01") return <ModM01 client={client}/>;
  if(modId==="M-02") return <ModM02 client={client}/>;
  if(modId==="M-03") return <ModM03 client={client}/>;
  if(modId==="M-04") return <ModM04 client={client}/>;
  if(modId==="M-05") return <ModM05 client={client}/>;
  if(modId==="M-01") return <ModM01 client={client}/>;
  if(modId==="M-02") return <ModM02 client={client}/>;
  if(modId==="M-03") return <ModM03 client={client}/>;
  if(modId==="M-04") return <ModM04 client={client}/>;
  if(modId==="M-05") return <ModM05 client={client}/>;
  const tc = TIER_COLORS[MODULOS_CATALOG.find(x=>x.id===modId)?.tier||0];
  return <div style={{...s.card,borderLeft:"3px solid "+tc.color}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>Datos del módulo disponibles próximamente.</div></div>;
}

function ModuloViewDocs({modId, client, isAdmin=false}){
  const catalog = MODULO_DOCS[modId];
  const [docs,setDocs]=useState([]);const [loading,setLoading]=useState(true);
  const [uploading,setUploading]=useState(null);
  const [viewingDoc,setViewingDoc]=useState(null);

  useEffect(()=>{
    supabase.from("documents").select("*").eq("client_id",client.id).eq("modulo",modId)
      .then(({data:d})=>{setDocs(d||[]);setLoading(false);});
  },[client.id,modId]);

  async function uploadDoc(docId, driveUrl, name){
    const newDoc={id:"doc_"+client.id+"_"+modId+"_"+docId+"_"+Date.now(),client_id:client.id,sociedad_id:client._sociedad?.id||null,type:docId,modulo:modId,name:name||docId,drive_url:driveUrl,status:"vigente",date:new Date().toISOString().slice(0,10)};
    await supabase.from("documents").insert(newDoc);
    const modNombreDoc=MODULOS_CATALOG.find(x=>x.id===modId)?.nombre||modId;
    await logActividad(client,client._adminNombre||"Despacho M&M","documento",`Documento subido en ${modNombreDoc}: ${name||docId}`,modId,{tipo:docId,nombre:name});
    const socId = client._sociedad?.id||null;
    const q = socId
      ? supabase.from("documents").select("*").eq("client_id",client.id).eq("modulo",modId).eq("sociedad_id",socId)
      : supabase.from("documents").select("*").eq("client_id",client.id).eq("modulo",modId).is("sociedad_id",null);
    const {data:d}=await q;
    setDocs(d||[]);
    setUploading(null);
  }

  if(loading)return <Spinner/>;
  if(!catalog)return <div style={s.muted}>Sin catálogo de documentos para este módulo.</div>;

  const requeridos = catalog.docs.filter(d=>d.requerido);
  const opcionales = catalog.docs.filter(d=>!d.requerido);
  const completados = requeridos.filter(d=>docs.find(x=>x.type===d.id&&x.status!=="vencido")).length;

  return(
    <div>
      {/* Progress */}
      <div style={{...s.card,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:13,fontFamily:"Georgia, serif"}}>Documentos requeridos</div>
          <Badge status={completados===requeridos.length?"green":completados>0?"amber":"red"} label={completados+"/"+requeridos.length+" completos"}/>
        </div>
        <div style={{background:BORDER,borderRadius:2,height:6}}><div style={{background:completados===requeridos.length?"#5A8A3C":GOLD,height:6,borderRadius:2,width:(completados/Math.max(requeridos.length,1)*100)+"%",transition:"width .3s"}}/></div>
      </div>

      {/* Required docs */}
      <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:8,textTransform:"uppercase",letterSpacing:".08em"}}>Documentos requeridos</div>
      {requeridos.map(docDef=>{
        const existingDocs = docs.filter(d=>d.type===docDef.id);
        const hasAny = existingDocs.length>0;
        return(
          <div key={docDef.id} style={{...s.card,marginBottom:8,borderLeft:"3px solid "+(hasAny?"#5A8A3C":"#C0392B")}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:hasAny?8:0}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontFamily:"Georgia, serif",marginBottom:2}}>{docDef.label}</div>
                <div style={s.muted}>{docDef.desc}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                <Badge status={hasAny?"green":"red"} label={hasAny?existingDocs.length+" archivo(s)":"Pendiente"}/>
                {isAdmin&&<button style={{...s.btn,...s.btnSm}} onClick={()=>setUploading(docDef.id)}>+ Subir</button>}
                {isAdmin&&<BtnNotificar clientId={client.id} mensaje={"Documento pendiente: "+docDef.label+(!hasAny?" — favor de entregar al despacho":"")}/>}
                {isAdmin&&<FechaVencimiento docId={existingDocs[0]?.id} clientId={client.id} modId={modId} tipoId={docDef.id} fechaActual={existingDocs[0]?.fecha_vencimiento}/>}
              </div>
            </div>
            {hasAny&&<div style={{borderTop:"1px solid "+BORDER,paddingTop:8}}>
              {existingDocs.map((d,i)=>(
                <div key={d.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:i<existingDocs.length-1?"1px solid "+BORDER:"none"}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"#5A8A3C",flexShrink:0,display:"inline-block"}}/>
                  <span style={{flex:1,fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1E2B1A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</span>
                  <span style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif",flexShrink:0}}>{d.date}</span>
                  {d.drive_url&&<button style={{...s.btnGold,...s.btnSm,flexShrink:0}} onClick={()=>setViewingDoc({url:d.drive_url,name:d.name||docDef.label})}>Ver</button>}
                </div>
              ))}
            </div>}
            {uploading===docDef.id&&(
              <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+BORDER}}>
                <UploadDocForm onSubmit={(url,name)=>uploadDoc(docDef.id,url,name)} onCancel={()=>setUploading(null)} clientId={client.id} clientName={client.name} sociedadNombre={client._sociedad?.nombre} modId={modId} modNombre={MODULOS_CATALOG.find(x=>x.id===modId)?.nombre} docLabel={docDef.label}/>
              </div>
            )}
          </div>
        );
      })}

      {/* Optional docs */}
      {opcionales.length>0&&<>
        <div style={{fontSize:11,fontWeight:600,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:8,marginTop:16,textTransform:"uppercase",letterSpacing:".08em"}}>Documentos opcionales / complementarios</div>
        {opcionales.map(docDef=>{
          const existing = docs.find(d=>d.type===docDef.id);
          return(
            <div key={docDef.id} style={{...s.card,marginBottom:8,borderLeft:"3px solid "+(existing?"#5A8A3C":BORDER)}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontFamily:"Georgia, serif",marginBottom:2}}>{docDef.label}</div>
                  <div style={s.muted}>{docDef.desc}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                  <Badge status={existing?"green":"amber"} label={existing?"Disponible":"Opcional"}/>
                  {existing?.drive_url&&<button style={{...s.btnGold,...s.btnSm}} onClick={()=>setViewingDoc({url:existing.drive_url,name:existing.name||docDef.label})}>Ver ↗</button>}
                  <button style={{...s.btn,...s.btnSm}} onClick={()=>setUploading(docDef.id)}>Subir</button>
                </div>
              </div>
              {uploading===docDef.id&&(
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+BORDER}}>
                  <UploadDocForm onSubmit={(url,name)=>uploadDoc(docDef.id,url,name)} onCancel={()=>setUploading(null)} clientId={client.id} clientName={client.name} sociedadNombre={client._sociedad?.nombre} modId={modId} modNombre={MODULOS_CATALOG.find(x=>x.id===modId)?.nombre} docLabel={docDef.label}/>
                </div>
              )}
            </div>
          );
        })}
      </>}
    {viewingDoc&&<DocViewerModal url={viewingDoc.url} name={viewingDoc.name} onClose={()=>setViewingDoc(null)}/>}
    </div>
  );
}

function UploadDocForm({onSubmit, onCancel, clientId, clientName, sociedadNombre, modId, modNombre, docLabel}){
  const [url,setUrl]=useState("");const [name,setName]=useState("");
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <DriveUploader
          clientId={clientId||"cliente"}
          clientName={clientName||"Cliente"}
          sociedadNombre={sociedadNombre}
          modId={modId}
          modNombre={modNombre}
          docLabel={docLabel}
          label="Subir archivo a Drive"
          onUploaded={(driveUrl,fileName)=>{setUrl(driveUrl);setName(fileName);}}
        />
        <span style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>o pega un enlace:</span>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <input style={{...s.input,flex:2,minWidth:200}} placeholder="Nombre del documento" value={name} onChange={e=>setName(e.target.value)}/>
        <input style={{...s.input,flex:3,minWidth:200}} placeholder="URL de Google Drive" value={url} onChange={e=>setUrl(e.target.value)}/>
        <button style={{...s.btnPrimary,...s.btnSm}} onClick={()=>url&&onSubmit(url,name)} disabled={!url}>Guardar</button>
        <button style={{...s.btn,...s.btnSm}} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

function ModuloViewChecklist({modId, client, isAdmin=false, adminNombre="Despacho M&M"}){
  const catalog = MODULO_DOCS[modId];
  const [checks,setChecks]=useState({});const [acciones,setAcciones]=useState({});const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    (client._sociedad?.id ? supabase.from("reglas_compliance").select("*").eq("client_id",client.id).eq("modulo",modId).eq("sociedad_id",client._sociedad.id) : supabase.from("reglas_compliance").select("*").eq("client_id",client.id).eq("modulo",modId).is("sociedad_id",null))
      .then(({data:d})=>{
        const map={};
        (d||[]).forEach(x=>{map[x.regla_id]=x.status;});
        setChecks(map);setLoading(false);
      });
  },[client.id,modId]);

  async function saveAccion(id,val){
    setAcciones(prev=>({...prev,[id]:val}));
    const socId=client._sociedad?.id||null;
    const qEx=socId
      ?supabase.from("reglas_compliance").select("id").eq("client_id",client.id).eq("modulo",modId).eq("regla_id",id).eq("sociedad_id",socId).maybeSingle()
      :supabase.from("reglas_compliance").select("id").eq("client_id",client.id).eq("modulo",modId).eq("regla_id",id).is("sociedad_id",null).maybeSingle();
    const {data:ex}=await qEx;
    if(ex?.id){await supabase.from("reglas_compliance").update({accion_recomendada:val}).eq("id",ex.id);}
    else{await supabase.from("reglas_compliance").insert({id:"rc_"+client.id+"_"+modId+"_"+id+"_"+(socId||"null"),client_id:client.id,modulo:modId,regla_id:id,status:"sin_revisar",sociedad_id:socId,accion_recomendada:val});}
    if(val&&val.length>3){
      const items=MODULO_DOCS[modId]?.checklist||[];
      const itemLabel=items.find(x=>x.id===id)?.label||id;
      const modNombre=MODULOS_CATALOG.find(x=>x.id===modId)?.nombre||modId;
      await logActividad(client,client._adminNombre||"Despacho M&M","accion","Próximo paso actualizado en "+modNombre+": "+itemLabel,modId,{regla_id:id});
    }
  }

  async function toggleCheck(id, currentStatus){
    const newStatus = currentStatus==="cumple"?"no_cumple":currentStatus==="no_cumple"?"parcial":"cumple";
    setSaving(true);
    const socId=client._sociedad?.id||null;
    const qEx=socId
      ?supabase.from("reglas_compliance").select("id").eq("client_id",client.id).eq("modulo",modId).eq("regla_id",id).eq("sociedad_id",socId).maybeSingle()
      :supabase.from("reglas_compliance").select("id").eq("client_id",client.id).eq("modulo",modId).eq("regla_id",id).is("sociedad_id",null).maybeSingle();
    const {data:ex}=await qEx;
    if(ex?.id){
      const r=await supabase.from("reglas_compliance").update({status:newStatus}).eq("id",ex.id);
      if(r.error)console.error("UPDATE ERROR:",r.error.message,r.error.details);
    } else {
      const r=await supabase.from("reglas_compliance").insert({id:"rc_"+client.id+"_"+modId+"_"+id+"_"+(socId||"null"),client_id:client.id,modulo:modId,regla_id:id,status:newStatus,sociedad_id:socId});
      if(r.error)console.error("INSERT ERROR:",r.error.message,r.error.details,{client_id:client.id,modulo:modId,regla_id:id,status:newStatus,sociedad_id:socId});
    }
    const modNombre=MODULOS_CATALOG.find(x=>x.id===modId)?.nombre||modId;
    const items=MODULO_DOCS[modId]?.checklist||[];
    const itemLabel=items.find(x=>x.id===id)?.label||id;
    const statusLabel=newStatus==="cumple"?"Cumple":newStatus==="no_cumple"?"No cumple":newStatus==="parcial"?"Parcial":"Sin revisar";
    await logActividad(client,adminNombre,"checklist",`${modNombre} — "${itemLabel}" marcado como ${statusLabel}`,modId,{regla_id:id,status:newStatus});
    setChecks(prev=>({...prev,[id]:newStatus}));
    setSaving(false);
    if(newStatus==="no_cumple"){
      const item = catalog.checklist.find(x=>x.id===id);
      if(item && (item.riesgo==="critico"||item.riesgo==="alto")){
        const notifId = "compliance_"+client.id+"_"+modId+"_"+id;
        const {data:existe}=await supabase.from("notificaciones").select("id").eq("id",notifId).single();
        if(!existe){
          const modNombre = MODULOS_CATALOG.find(x=>x.id===modId)?.nombre||modId;
          await supabase.from("notificaciones").insert({
            id: notifId,
            client_id: client.id,
            tipo: "alerta_critica",
            mensaje: modNombre+" — "+item.label+" marcado como No cumple (riesgo: "+item.riesgo+")",
            leida: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }
  }

  if(loading)return <Spinner/>;
  if(!catalog)return <div style={s.muted}>Sin checklist para este módulo.</div>;

  const items = catalog.checklist;
  const cumple = items.filter(x=>checks[x.id]==="cumple").length;
  const noCumple = items.filter(x=>checks[x.id]==="no_cumple").length;
  const parcial = items.filter(x=>checks[x.id]==="parcial").length;

  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:24,fontWeight:400,color:"#5A8A3C",fontFamily:"Georgia, serif"}}>{cumple}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Cumple</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:24,fontWeight:400,color:GOLD,fontFamily:"Georgia, serif"}}>{parcial}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Parcial</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:24,fontWeight:400,color:"#C0392B",fontFamily:"Georgia, serif"}}>{noCumple}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>No cumple</div></div>
        <div style={{...s.scoreCard,flex:1}}><div style={{fontSize:24,fontWeight:400,color:GRAY,fontFamily:"Georgia, serif"}}>{items.length-cumple-parcial-noCumple}</div><div style={{fontSize:10,color:GRAY,marginTop:4,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif"}}>Sin revisar</div></div>
      </div>

      <div style={s.card}>
        {items.map((item,i)=>{
          const st = checks[item.id]||"sin_revisar";
          const rc = RIESGO_COLORS[item.riesgo]||RIESGO_COLORS.bajo;
          const stColor = st==="cumple"?"#5A8A3C":st==="no_cumple"?"#C0392B":st==="parcial"?GOLD:GRAY;
          const stLabel = st==="cumple"?"Cumple":st==="no_cumple"?"No cumple":st==="parcial"?"Parcial":"Sin revisar";
          return(
            <div key={item.id} style={{padding:"12px 0",borderBottom:i<items.length-1?"1px solid "+BORDER:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK,marginBottom:3}}>{item.label}</div>
                  <span style={{fontSize:10,padding:"1px 6px",borderRadius:2,background:rc.bg,color:rc.color,fontFamily:"system-ui,sans-serif"}}>{rc.label}</span>
                </div>
                <select value={st} onChange={e=>toggleCheck(item.id,e.target.value)} disabled={saving} style={{fontSize:11,padding:"4px 8px",borderRadius:4,border:"1.5px solid "+stColor,background:"none",color:stColor,cursor:"pointer",fontFamily:"system-ui,sans-serif",fontWeight:600,minWidth:100}}>
                  <option value="sin_revisar">Sin revisar</option>
                  <option value="cumple">Cumple</option>
                  <option value="parcial">Parcial</option>
                  <option value="no_cumple">No cumple</option>
                </select>
              </div>
              {isAdmin&&<input
                style={{fontSize:11,padding:"4px 8px",border:"1px dashed #DDE4D8",borderRadius:3,fontFamily:"system-ui,sans-serif",background:"#F5F2ED",width:"100%",boxSizing:"border-box",marginTop:6,color:"#4A5C45"}}
                placeholder="Próximo paso para el cliente (visible en su dashboard)..."
                value={acciones[item.id]||""}
                onChange={e=>saveAccion(item.id,e.target.value)}
              />}
              {!isAdmin&&acciones[item.id]&&st!=="cumple"&&<div style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:"#4A5C45",background:"#F0F4EE",borderRadius:3,padding:"5px 8px",marginTop:6,borderLeft:"2px solid #4A5C45"}}>
                <span style={{fontWeight:600}}>Próximo paso: </span>{acciones[item.id]}
              </div>}
            </div>
          );
        })}
      </div>
      <div style={{...s.muted,marginTop:8,textAlign:"center"}}>Haz clic en el estatus para cambiar entre: Cumple → No cumple → Parcial</div>
    </div>
  );
}

function ModuloViewRiesgos({modId}){
  const catalog = MODULO_DOCS[modId];
  if(!catalog)return <div style={s.muted}>Sin análisis de riesgos para este módulo.</div>;

  return(
    <div>
      {catalog.riesgos.map((riesgo,i)=>{
        const rc = RIESGO_COLORS[riesgo.nivel]||RIESGO_COLORS.bajo;
        return(
          <div key={i} style={{...s.card,borderLeft:"3px solid "+rc.color,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:3,background:rc.bg,color:rc.color,fontFamily:"system-ui,sans-serif",fontWeight:600}}>{rc.label}</span>
              <div style={{fontSize:14,fontFamily:"Georgia, serif",color:TEXT_DARK}}>{riesgo.label}</div>
            </div>
            <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_MED,padding:"8px 10px",background:"#F5F8F5",borderRadius:4}}>
              <span style={{fontWeight:600,color:TEXT_DARK}}>Impacto: </span>{riesgo.impacto}
            </div>
          </div>
        );
      })}
      <div style={{...s.card,borderLeft:"3px solid "+MUSGO,marginTop:8}}>
        <div style={{fontSize:11,color:MUSGO,fontFamily:"system-ui,sans-serif",fontWeight:600,marginBottom:4}}>NOTA DEL DESPACHO</div>
        <div style={{fontSize:12,color:GRAY,fontFamily:"system-ui,sans-serif"}}>El despacho monitorea estos riesgos continuamente. Ante cualquier alerta crítica te notificaremos directamente.</div>
      </div>
    </div>
  );
}
function AdminModulosTab({clients, activeClient, activeSociedad}){
  const [selClient,setSelClient]=useState(activeClient?.id||null);
  const [selMod,setSelMod]=useState(null);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState("");

  const clientBase = clients.find(x=>x.id===selClient);
  const client = clientBase ? {...clientBase, _sociedad: activeSociedad} : null;
  const modActivos = client ? ((client._sociedad?.modulos||client.modulos)||[]).filter(id=>{
    const m=MODULOS_CATALOG.find(x=>x.id===id);
    return m&&m.tier>0;
  }) : [];

  return(
    <div style={{display:"flex",gap:16,height:"100%"}}>
      {/* Client list */}
      <div style={{width:200,flexShrink:0}}>
        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:8}}>Cliente</div>
        {clients.map(cl=>(
          <button key={cl.id} onClick={()=>{setSelClient(cl.id);setSelMod(null);}} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:4,border:"1px solid "+(selClient===cl.id?MUSGO:BORDER),background:selClient===cl.id?"#E8F0E8":"#fff",cursor:"pointer",marginBottom:4,fontFamily:"system-ui,sans-serif",fontSize:12,color:selClient===cl.id?MUSGO:TEXT_DARK}}>
            <div style={{fontWeight:600}}>{cl.name}</div>
            <div style={{fontSize:10,color:GRAY}}>{(cl.modulos||[]).filter(id=>{const m=MODULOS_CATALOG.find(x=>x.id===id);return m&&m.tier>0;}).length} módulos activos</div>
          </button>
        ))}
      </div>

      {/* Module list */}
      {client&&<div style={{width:220,flexShrink:0}}>
        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:8}}>Módulos activos</div>
        {modActivos.length===0
          ?<div style={{fontSize:12,color:GRAY,fontFamily:"system-ui,sans-serif",padding:"1rem 0"}}>Sin módulos adicionales activos</div>
          :modActivos.map(id=>{
            const m=MODULOS_CATALOG.find(x=>x.id===id);
            const tc=TIER_COLORS[m.tier];
            return(
              <button key={id} onClick={()=>setSelMod(id)} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:4,border:"1px solid "+(selMod===id?tc.color:BORDER),background:selMod===id?tc.bg:"#fff",cursor:"pointer",marginBottom:4,fontFamily:"system-ui,sans-serif",fontSize:12,color:TEXT_DARK}}>
                <div style={{fontSize:9,color:tc.color,fontWeight:600,marginBottom:2}}>{id}</div>
                <div>{m.nombre}</div>
              </button>
            );
          })
        }
      </div>}

      {/* Module editor */}
      {client&&selMod&&<div style={{flex:1}}>
        <AdminModuloEditor client={client} modId={selMod} onSaved={msg=>{setSaved(msg);setTimeout(()=>setSaved(""),2000);}}/>
        {saved&&<div style={{fontSize:12,color:"#5A8A3C",fontFamily:"system-ui,sans-serif",marginTop:8}}>{saved}</div>}
      </div>}

      {!client&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center",color:GRAY,fontFamily:"system-ui,sans-serif"}}>
          <div style={{fontSize:32,marginBottom:8}}>⚡</div>
          <div style={{fontSize:14}}>Selecciona un cliente para gestionar sus módulos</div>
        </div>
      </div>}
    </div>
  );
}


function AdminModuloTabs({modId, client}){
  const [activeTab,setActiveTab]=useState("datos");
  const tabs=[{id:"datos",label:"Datos"},{id:"documentos",label:"Documentos"},{id:"cumplimiento",label:"Cumplimiento"},{id:"riesgos",label:"Riesgos"}];
  return(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",gap:4,marginBottom:12}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{fontSize:11,padding:"5px 14px",borderRadius:4,border:"1.5px solid "+(activeTab===t.id?BLACK:BORDER),background:activeTab===t.id?BLACK:"none",color:activeTab===t.id?WHITE:GRAY,cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>{t.label}</button>
        ))}
      </div>
      <div style={{border:"1px solid "+BORDER,borderRadius:8,padding:16,background:"#FAFCF8"}}>
        {activeTab==="datos"&&<ModuloViewDatos modId={modId} client={client}/>}
        {activeTab==="datos"&&<ModuloViewDatos modId={modId} client={client}/>}
        {activeTab==="documentos"&&<ModuloViewDocs modId={modId} client={client} isAdmin={true}/>}
        {activeTab==="cumplimiento"&&<ModuloViewChecklist modId={modId} client={client} isAdmin={true} adminNombre={client._adminNombre||"Despacho M&M"}/>}
        {activeTab==="riesgos"&&<ModuloViewRiesgos modId={modId}/>}
      </div>
    </div>
  );
}


// ── ADMIN COMPLIANCE GENERAL ─────────────────────────────────────────────────


// ── FECHA VENCIMIENTO INLINE ──────────────────────────────────────────────────
function FechaVencimiento({docId, clientId, modId, tipoId, fechaActual}){
  const [fecha, setFecha] = useState(fechaActual||"");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function guardar(val){
    setFecha(val);
    setSaving(true);
    if(docId){
      await supabase.from("documents").update({fecha_vencimiento:val||null}).eq("id",docId);
    } else {
      await supabase.from("documents").upsert({
        client_id:clientId, modulo:modId, tipo:tipoId,
        fecha_vencimiento:val||null
      },{onConflict:"client_id,modulo,tipo"});
    }
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  const hoy = new Date();
  const vence = fecha ? new Date(fecha+"T12:00:00") : null;
  const diasRestantes = vence ? Math.ceil((vence-hoy)/(1000*60*60*24)) : null;
  const color = diasRestantes===null?"#888":diasRestantes<0?"#C0392B":diasRestantes<=7?"#C0392B":diasRestantes<=30?"#C9A84C":"#5A8A3C";

  const [diasAlerta, setDiasAlerta] = useState(fechaActual?.dias_alerta||30);

  async function guardarDiasAlerta(val){
    const n = parseInt(val)||30;
    setDiasAlerta(n);
    if(docId){
      await supabase.from("documents").update({dias_alerta:n}).eq("id",docId);
    }
  }

  return(
    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
      <input
        type="date"
        value={fecha}
        onChange={e=>guardar(e.target.value)}
        style={{fontSize:10,padding:"3px 6px",borderRadius:3,border:"1px solid #DDE4D8",fontFamily:"system-ui,sans-serif",color:color,background:"none",cursor:"pointer"}}
      />
      {diasRestantes!==null&&(
        <span style={{fontSize:10,color,fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap"}}>
          {diasRestantes<0?"Vencido hace "+Math.abs(diasRestantes)+"d":diasRestantes===0?"Vence hoy":""+diasRestantes+"d"}
        </span>
      )}
      <div style={{display:"flex",alignItems:"center",gap:3}}>
        <span style={{fontSize:10,color:"#888",fontFamily:"system-ui,sans-serif"}}>🔔</span>
        <input
          type="number"
          value={diasAlerta}
          min={1}
          max={365}
          onChange={e=>guardarDiasAlerta(e.target.value)}
          style={{fontSize:10,padding:"3px 4px",borderRadius:3,border:"1px solid #DDE4D8",fontFamily:"system-ui,sans-serif",width:40,textAlign:"center"}}
          title="Días antes del vencimiento para recibir alerta"
        />
        <span style={{fontSize:10,color:"#888",fontFamily:"system-ui,sans-serif"}}>d</span>
      </div>
      {saving&&<span style={{fontSize:10,color:"#888",fontFamily:"system-ui,sans-serif"}}>...</span>}
      {saved&&<span style={{fontSize:10,color:"#5A8A3C",fontFamily:"system-ui,sans-serif"}}>✓</span>}
    </div>
  );
}

// ── CALENDARIO DE VENCIMIENTOS ────────────────────────────────────────────────
function CalendarioVencimientos({client}){
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesActual, setMesActual] = useState(new Date());

  useEffect(()=>{
    const socId=client?._sociedad?.id||null;
    const qDocs = client
      ? (socId ? supabase.from("documents").select("*").eq("client_id",client.id).eq("sociedad_id",socId).not("fecha_vencimiento","is",null) : supabase.from("documents").select("*").eq("client_id",client.id).is("sociedad_id",null).not("fecha_vencimiento","is",null))
      : supabase.from("documents").select("*,clients(name)").not("fecha_vencimiento","is",null);
    const qCtrs = client
      ? (socId ? supabase.from("contratos").select("*").eq("client_id",client.id).eq("sociedad_id",socId).not("vencimiento","is",null) : supabase.from("contratos").select("*").eq("client_id",client.id).is("sociedad_id",null).not("vencimiento","is",null))
      : supabase.from("contratos").select("*").not("vencimiento","is",null);
    Promise.all([qDocs,qCtrs]).then(([d,ctr])=>{
      const docs=(d.data||[]).map(x=>({...x,fecha_vencimiento:x.fecha_vencimiento,_nombre:x.name||x.tipo,_tipo:"documento"}));
      const ctrs=(ctr.data||[]).map(x=>({...x,fecha_vencimiento:x.vencimiento,_nombre:x.nombre,_tipo:"contrato"}));
      setEventos([...docs,...ctrs]);
      setLoading(false);
    });
  },[client?.id,client?._sociedad?.id]);

  if(loading) return <div style={{textAlign:"center",padding:"3rem",color:"#888",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando calendario...</div>;

  const year = mesActual.getFullYear();
  const month = mesActual.getMonth();
  const primerDia = new Date(year,month,1).getDay();
  const diasEnMes = new Date(year,month+1,0).getDate();
  const hoy = new Date();

  function eventosDelDia(dia){
    const fecha = new Date(year,month,dia);
    return eventos.filter(e=>{
      const v = new Date(e.fecha_vencimiento+"T12:00:00");
      return v.getFullYear()===year && v.getMonth()===month && v.getDate()===dia;
    });
  }

  function colorEvento(e){
    const v = new Date(e.fecha_vencimiento+"T12:00:00");
    const dias = Math.ceil((v-hoy)/(1000*60*60*24));
    return dias<0?"#C0392B":dias<=7?"#E74C3C":dias<=30?"#C9A84C":"#5A8A3C";
  }

  const nombreMes = mesActual.toLocaleDateString("es-MX",{month:"long",year:"numeric"});
  const dias = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

  // Eventos próximos (30 días)
  const proximos = eventos
    .map(e=>({...e,vence:new Date(e.fecha_vencimiento+"T12:00:00")}))
    .filter(e=>{ const d=Math.ceil((e.vence-hoy)/(1000*60*60*24)); return d>=-7 && d<=120; })
    .sort((a,b)=>a.vence-b.vence);

  return(
    <div>
      {/* Header mes */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={()=>setMesActual(new Date(year,month-1,1))} style={{...s.btn,...s.btnSm}}>‹</button>
        <div style={{fontSize:14,fontFamily:"Georgia,serif",color:"#1E2B1A",textTransform:"capitalize"}}>{nombreMes}</div>
        <button onClick={()=>setMesActual(new Date(year,month+1,1))} style={{...s.btn,...s.btnSm}}>›</button>
      </div>

      {/* Grid días semana */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {dias.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#888",fontFamily:"system-ui,sans-serif",padding:"4px 0"}}>{d}</div>)}
      </div>

      {/* Grid calendario */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {Array(primerDia).fill(null).map((_,i)=><div key={"e"+i}/>)}
        {Array(diasEnMes).fill(null).map((_,i)=>{
          const dia = i+1;
          const esHoy = hoy.getFullYear()===year && hoy.getMonth()===month && hoy.getDate()===dia;
          const evs = eventosDelDia(dia);
          return(
            <div key={dia} style={{
              minHeight:52, padding:4, borderRadius:4,
              background: esHoy?"#4A5C45":evs.length>0?"#FFFBEB":"#FAFCF8",
              border:"1px solid "+(esHoy?"#4A5C45":evs.length>0?"#DDE4D8":"#F0EDE8"),
              position:"relative"
            }}>
              <div style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:esHoy?"#fff":"#1E2B1A",fontWeight:esHoy?"700":"400"}}>{dia}</div>
              {evs.map((e,idx)=>{
                const modNombre = MODULOS_CATALOG.find(x=>x.id===e.modulo)?.nombre||e.modulo||"";
                const docDef = MODULO_DOCS[e.modulo]?.docs?.find(d=>d.id===e.tipo);
                return(
                  <div key={idx} style={{
                    fontSize:9, background:colorEvento(e), color:"#fff",
                    borderRadius:2, padding:"1px 4px", marginTop:2,
                    fontFamily:"system-ui,sans-serif",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    maxWidth:"100%"
                  }} title={(docDef?.label||e.tipo)+" — "+modNombre}>
                    {docDef?.label||e.tipo}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Próximos vencimientos */}
      {proximos.length>0&&<div style={{marginTop:20}}>
        <div style={{fontSize:11,letterSpacing:".1em",textTransform:"uppercase",color:"#888",fontFamily:"system-ui,sans-serif",marginBottom:8}}>Próximos 30 días</div>
        {proximos.map((e,i)=>{
          const dias = Math.ceil((e.vence-hoy)/(1000*60*60*24));
          const color = dias<0?"#C0392B":dias<=7?"#E74C3C":dias<=30?"#C9A84C":"#5A8A3C";
          const docDef = MODULO_DOCS[e.modulo]?.docs?.find(d=>d.id===e.tipo);
          const modNombre = MODULOS_CATALOG.find(x=>x.id===e.modulo)?.nombre||e.modulo;
          const clientNombre = e.clients?.name||client?.name||"";
          return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #F0EDE8"}}>
              <div style={{width:36,textAlign:"center"}}>
                <div style={{fontSize:14,fontFamily:"Georgia,serif",color,fontWeight:600}}>{Math.abs(dias)}</div>
                <div style={{fontSize:9,color:"#888",fontFamily:"system-ui,sans-serif"}}>{dias<0?"días":"días"}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1E2B1A"}}>{e._nombre||docDef?.label||e.nombre||e.name||e.tipo}</div>
                <div style={{fontSize:11,color:"#888",fontFamily:"system-ui,sans-serif"}}>{e._tipo==="contrato"?"Contrato":modNombre}{clientNombre?" · "+clientNombre:""}</div>
              </div>
              <div style={{fontSize:10,color,fontFamily:"system-ui,sans-serif",fontWeight:600}}>
                {dias<0?"VENCIDO":dias===0?"HOY":e.vence.toLocaleDateString("es-MX",{day:"numeric",month:"short"})}
              </div>
            </div>
          );
        })}
      </div>}

      {eventos.length===0&&<div style={{textAlign:"center",padding:"2rem",color:"#888",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin vencimientos registrados</div>}
    </div>
  );
}

function BtnNotificar({clientId, mensaje, label="🔔 Notificar"}){
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);
  async function notificar(){
    if(sending||sent)return;
    setSending(true);
    await supabase.from("notificaciones").insert({
      id:"manual_"+Date.now(),
      client_id:clientId,
      tipo:"manual",
      mensaje:mensaje,
      leida:false,
      created_at:new Date().toISOString()
    });
    setSending(false);setSent(true);
    setTimeout(()=>setSent(false),4000);
  }
  return(
    <button onClick={notificar} disabled={sending||sent} style={{fontSize:10,padding:"3px 10px",borderRadius:3,border:"1px solid "+(sent?"#5A8A3C":"#C9A84C"),background:sent?"#f0fdf4":"#fffbeb",color:sent?"#5A8A3C":"#92400E",cursor:sending||sent?"default":"pointer",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap"}}>
      {sent?"✓ Enviado":sending?"...":label}
    </button>
  );
}

function AdminComplianceGeneral({client}){
  const modulosActivos = ((client._sociedad?.modulos||client.modulos)||[]).filter(id=>{
    const m=MODULOS_CATALOG.find(x=>x.id===id);
    return m && MODULO_DOCS[id]?.checklist;
  });
  const [checks,setChecks]=useState({});
  const [riesgos,setRiesgos]=useState({});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(null);
  const [expanded,setExpanded]=useState(null);

  useEffect(()=>{
    supabase.from("reglas_compliance").select("*").eq("client_id",client.id)
      .then(({data:d})=>{
        const cm={};const rm={};
        (d||[]).forEach(x=>{cm[x.modulo+"_"+x.regla_id]=x.status;if(x.nivel_riesgo)rm[x.modulo+"_"+x.regla_id]=x.nivel_riesgo;});
        setChecks(cm);setRiesgos(rm);setLoading(false);
      });
  },[client.id]);

  async function toggleStatus(modId,itemId,current){
    const key=modId+"_"+itemId;
    const newStatus=current==="cumple"?"no_cumple":current==="no_cumple"?"parcial":"cumple";
    setSaving(key);
    const socId2=client._sociedad?.id||null;
    const q2=socId2?supabase.from("reglas_compliance").select("id").eq("client_id",client.id).eq("modulo",modId).eq("regla_id",itemId).eq("sociedad_id",socId2).maybeSingle():supabase.from("reglas_compliance").select("id").eq("client_id",client.id).eq("modulo",modId).eq("regla_id",itemId).is("sociedad_id",null).maybeSingle();
    const {data:ex2}=await q2;
    if(ex2?.id){await supabase.from("reglas_compliance").update({status:newStatus}).eq("id",ex2.id);}
    else{await supabase.from("reglas_compliance").insert({client_id:client.id,modulo:modId,regla_id:itemId,status:newStatus,sociedad_id:socId2});}
    setChecks(prev=>({...prev,[key]:newStatus}));
    setSaving(null);
    if(newStatus==="no_cumple"){
      const item=MODULO_DOCS[modId]?.checklist?.find(x=>x.id===itemId);
      const nivel=riesgos[key]||item?.riesgo||"bajo";
      if(nivel==="critico"||nivel==="alto"){
        const notifId="compliance_"+client.id+"_"+modId+"_"+itemId;
        const {data:existe}=await supabase.from("notificaciones").select("id").eq("id",notifId).single();
        if(!existe){
          const modNombre=MODULOS_CATALOG.find(x=>x.id===modId)?.nombre||modId;
          await supabase.from("notificaciones").insert({
            id:notifId,client_id:client.id,tipo:"alerta_critica",
            mensaje:modNombre+" — "+(item?.label||itemId)+" marcado como No cumple (riesgo: "+nivel+")",
            leida:false,created_at:new Date().toISOString()
          });
        }
      }
    }
  }

  async function changeRiesgo(modId,itemId,nuevoNivel){
    const key=modId+"_"+itemId;
    setSaving(key+"_r");
    const socId3=client._sociedad?.id||null;
    const q3=socId3?supabase.from("reglas_compliance").select("id").eq("client_id",client.id).eq("modulo",modId).eq("regla_id",itemId).eq("sociedad_id",socId3).maybeSingle():supabase.from("reglas_compliance").select("id").eq("client_id",client.id).eq("modulo",modId).eq("regla_id",itemId).is("sociedad_id",null).maybeSingle();
    const {data:ex3}=await q3;
    if(ex3?.id){await supabase.from("reglas_compliance").update({nivel_riesgo:nuevoNivel,status:checks[key]||"sin_revisar"}).eq("id",ex3.id);}
    else{await supabase.from("reglas_compliance").insert({client_id:client.id,modulo:modId,regla_id:itemId,nivel_riesgo:nuevoNivel,status:checks[key]||"sin_revisar",sociedad_id:socId3});}
    setRiesgos(prev=>({...prev,[key]:nuevoNivel}));
    setSaving(null);
  }

  if(loading)return <div style={{textAlign:"center",padding:"3rem",color:GRAY,fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando cumplimiento...</div>;
  if(modulosActivos.length===0)return <div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin módulos con checklist activos para este cliente.</div>;

  return(
    <div>
      {modulosActivos.map(modId=>{
        const m=MODULOS_CATALOG.find(x=>x.id===modId);
        const items=MODULO_DOCS[modId].checklist;
        const cumple=items.filter(x=>checks[modId+"_"+x.id]==="cumple").length;
        const noCumple=items.filter(x=>checks[modId+"_"+x.id]==="no_cumple").length;
        const parcial=items.filter(x=>checks[modId+"_"+x.id]==="parcial").length;
        const sinRevisar=items.length-cumple-noCumple-parcial;
        const semaforo=noCumple>0?"#C0392B":sinRevisar===items.length?"#888":parcial>0?"#C9A84C":"#5A8A3C";
        const isOpen=expanded===modId;
        return(
          <div key={modId} style={{...s.card,marginBottom:8,borderLeft:"3px solid "+semaforo}}>
            <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setExpanded(isOpen?null:modId)}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:10,padding:"1px 6px",borderRadius:2,background:"#f3f4f6",color:GRAY,fontFamily:"system-ui,sans-serif"}}>{modId}</span>
                  <span style={{fontSize:13,fontFamily:"Georgia, serif",color:TEXT_DARK}}>{m?.nombre}</span>
                </div>
                <div style={{display:"flex",gap:12,marginTop:6}}>
                  <span style={{fontSize:11,color:"#5A8A3C",fontFamily:"system-ui,sans-serif"}}>✓ {cumple} cumple</span>
                  {noCumple>0&&<span style={{fontSize:11,color:"#C0392B",fontFamily:"system-ui,sans-serif"}}>✗ {noCumple} no cumple</span>}
                  {parcial>0&&<span style={{fontSize:11,color:"#C9A84C",fontFamily:"system-ui,sans-serif"}}>◑ {parcial} parcial</span>}
                  {sinRevisar>0&&<span style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif"}}>○ {sinRevisar} sin revisar</span>}
                </div>
              </div>
              <span style={{fontSize:11,color:GRAY}}>{isOpen?"▲":"▼"}</span>
            </div>
            {isOpen&&<div style={{marginTop:12,borderTop:"1px solid "+BORDER,paddingTop:12}}>
              {items.map(item=>{
                const key=modId+"_"+item.id;
                const st=checks[key]||"sin_revisar";
                const nivel=riesgos[key]||item.riesgo||"bajo";
                const rc=RIESGO_COLORS[nivel]||RIESGO_COLORS.bajo;
                const stColor=st==="cumple"?"#5A8A3C":st==="no_cumple"?"#C0392B":st==="parcial"?GOLD:GRAY;
                const stLabel=st==="cumple"?"Cumple":st==="no_cumple"?"No cumple":st==="parcial"?"Parcial":"Sin revisar";
                return(
                  <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",borderBottom:"1px solid "+BORDER,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:200}}>
                      <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:TEXT_DARK}}>{item.label}</div>
                    </div>
                    <select
                      value={nivel}
                      onChange={e=>changeRiesgo(modId,item.id,e.target.value)}
                      disabled={saving===key+"_r"}
                      style={{fontSize:10,padding:"3px 6px",borderRadius:3,border:"1px solid "+BORDER,background:rc.bg,color:rc.color,fontFamily:"system-ui,sans-serif",cursor:"pointer"}}
                    >
                      <option value="critico">Crítico</option>
                      <option value="alto">Alto</option>
                      <option value="medio">Medio</option>
                      <option value="bajo">Bajo</option>
                    </select>
                    <button
                      onClick={()=>toggleStatus(modId,item.id,st)}
                      disabled={saving===key}
                      style={{fontSize:11,padding:"4px 12px",borderRadius:4,border:"1.5px solid "+stColor,background:"none",color:stColor,cursor:"pointer",fontFamily:"system-ui,sans-serif",fontWeight:600,minWidth:90}}
                    >{saving===key?"...":stLabel}</button>
                    <BtnNotificar clientId={client.id} mensaje={(m?.nombre||modId)+" — "+item.label+" ("+stLabel+")"} />
                  </div>
                );
              })}
            </div>}
          </div>
        );
      })}
    </div>
  );
}

// ── ADMIN ALERTAS CRITICAS ────────────────────────────────────────────────────
function AdminAlertasCriticas({client}){
  const modulosActivos=((client._sociedad?.modulos||client.modulos)||[]).filter(id=>MODULO_DOCS[id]?.checklist);
  const [checks,setChecks]=useState({});
  const [riesgos,setRiesgos]=useState({});
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    supabase.from("reglas_compliance").select("*").eq("client_id",client.id)
      .then(({data:d})=>{
        const cm={};const rm={};
        (d||[]).forEach(x=>{cm[x.modulo+"_"+x.regla_id]=x.status;if(x.nivel_riesgo)rm[x.modulo+"_"+x.regla_id]=x.nivel_riesgo;});
        setChecks(cm);setRiesgos(rm);setLoading(false);
      });
  },[client.id]);

  if(loading)return <div style={{textAlign:"center",padding:"3rem",color:GRAY,fontSize:12,fontFamily:"system-ui,sans-serif"}}>Analizando alertas...</div>;

  const alertas=[];
  modulosActivos.forEach(modId=>{
    const items=MODULO_DOCS[modId]?.checklist||[];
    const modNombre=MODULOS_CATALOG.find(x=>x.id===modId)?.nombre||modId;
    items.forEach(item=>{
      const key=modId+"_"+item.id;
      const st=checks[key];
      const nivel=riesgos[key]||item.riesgo||"bajo";
      if(st==="no_cumple"||(nivel==="critico"&&st&&st!=="cumple")){
        alertas.push({modId,modNombre,item,st,nivel,key});
      }
    });
  });

  const criticas=alertas.filter(a=>a.nivel==="critico");
  const altas=alertas.filter(a=>a.nivel==="alto"&&a.st==="no_cumple");

  if(alertas.length===0)return(
    <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:4,padding:"2rem",textAlign:"center"}}>
      <div style={{fontSize:28,marginBottom:8}}>✓</div>
      <div style={{fontSize:15,fontFamily:"Georgia, serif",color:"#166534"}}>Sin alertas críticas detectadas</div>
      <div style={{fontSize:12,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:4}}>Todos los módulos revisados están en orden</div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{...s.scoreCard,flex:1,borderTop:"3px solid #C0392B"}}>
          <div style={{fontSize:28,color:"#C0392B",fontFamily:"Georgia, serif"}}>{criticas.length}</div>
          <div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Críticas</div>
        </div>
        <div style={{...s.scoreCard,flex:1,borderTop:"3px solid #C9A84C"}}>
          <div style={{fontSize:28,color:"#C9A84C",fontFamily:"Georgia, serif"}}>{altas.length}</div>
          <div style={{fontSize:10,color:GRAY,marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Altas</div>
        </div>
        <div style={{...s.scoreCard,flex:2}}>
          <div style={{fontSize:13,fontFamily:"Georgia, serif",color:TEXT_DARK}}>{modulosActivos.length} módulos activos</div>
          <div style={{fontSize:10,color:GRAY,marginTop:4,fontFamily:"system-ui,sans-serif"}}>{alertas.length} items requieren atención</div>
        </div>
      </div>
      {[...criticas,...altas].map(({modId,modNombre,item,st,nivel,key})=>{
        const rc=RIESGO_COLORS[nivel]||RIESGO_COLORS.bajo;
        return(
          <div key={key} style={{...s.card,marginBottom:8,borderLeft:"3px solid "+(nivel==="critico"?"#C0392B":"#C9A84C")}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:3}}>{modId} · {modNombre}</div>
                <div style={{fontSize:13,fontFamily:"Georgia, serif",color:TEXT_DARK}}>{item.label}</div>
                <div style={{marginTop:6}}>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:rc.bg,color:rc.color,fontFamily:"system-ui,sans-serif",fontWeight:600}}>{rc.label}</span>
                  <span style={{fontSize:10,padding:"2px 7px",borderRadius:2,background:"#FEF2F2",color:"#C0392B",fontFamily:"system-ui,sans-serif",marginLeft:6}}>No cumple</span>
                </div>
              </div>
              <BtnNotificar clientId={client.id} mensaje={modNombre+" — "+item.label+" — requiere atención inmediata"}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminModuloEditor({client, modId, onSaved}){
  const m = MODULOS_CATALOG.find(x=>x.id===modId);
  const [nota,setNota]=useState("");
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    // Load existing note from historial
    supabase.from("historial").select("*").eq("client_id",client.id)
      .eq("tipo","modulo_nota_"+modId).order("created_at",{ascending:false}).limit(1)
      .then(({data:d})=>{if(d&&d[0])setNota(d[0].detalle||"");});
  },[client.id,modId]);

  async function saveNota(){
    setSaving(true);
    await supabase.from("historial").upsert({
      client_id:client.id, tipo:"modulo_nota_"+modId,
      titulo:"Nota módulo "+m.nombre, detalle:nota,
      fecha:new Date().toISOString().slice(0,10)
    });
    setSaving(false);
    onSaved&&onSaved("Guardado ✓");
  }

  const tc = TIER_COLORS[m.tier];

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:10,padding:"2px 8px",borderRadius:3,background:tc.bg,color:tc.color,fontFamily:"system-ui,sans-serif",fontWeight:600}}>{m.id}</span>
        <div style={{fontSize:16,fontFamily:"Georgia, serif",color:TEXT_DARK}}>{m.nombre}</div>
        <Badge status="green" label={m.cat}/>
      </div>

      {/* Live data view — tabs */}
      <AdminModuloTabs modId={modId} client={client}/>

      {/* Nota del despacho */}
      <div>
        <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:GRAY,fontFamily:"system-ui,sans-serif",marginBottom:8}}>Nota del despacho para el cliente</div>
        <textarea style={{...{width:"100%",border:"1px solid "+BORDER,borderRadius:4,padding:"9px 12px",fontSize:12,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"system-ui,sans-serif",resize:"vertical"},height:100}} value={nota} onChange={e=>setNota(e.target.value)} placeholder="Agrega contexto, recomendaciones o actualizaciones para el cliente sobre este módulo..."/>
        <button style={{...{background:MUSGO,color:"#F0F4EE",border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif",letterSpacing:".08em",textTransform:"uppercase"},marginTop:8}} onClick={saveNota} disabled={saving}>{saving?"Guardando...":"Guardar nota"}</button>
      </div>
    </div>
  );
}


function GestorSociedades({clientId}){
  const [sociedades,setSociedades]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [nueva,setNueva]=useState({nombre:"",rfc:"",tipo_societario:"",modulos:[]});
  const [editando,setEditando]=useState(null);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    supabase.from("sociedades").select("*").eq("client_id",clientId).order("created_at")
      .then(({data:d})=>setSociedades(d||[]));
  },[clientId]);

  async function crear(){
    if(!nueva.nombre) return;
    setSaving(true);
    const {data:saved}=await supabase.from("sociedades").insert({...nueva,client_id:clientId}).select().single();
    if(saved){ setSociedades(prev=>[...prev,saved]); setNueva({nombre:"",rfc:"",tipo_societario:"",modulos:[]}); setShowForm(false); }
    setSaving(false);
  }

  async function actualizar(s){
    setSaving(true);
    await supabase.from("sociedades").update({nombre:s.nombre,rfc:s.rfc,tipo_societario:s.tipo_societario,modulos:s.modulos}).eq("id",s.id);
    setSociedades(prev=>prev.map(x=>x.id===s.id?s:x));
    setEditando(null);setSaving(false);
  }

  async function eliminar(id){
    await supabase.from("sociedades").delete().eq("id",id);
    setSociedades(prev=>prev.filter(x=>x.id!==id));
  }

  return(
    <div style={{marginTop:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:GRAY,fontFamily:"system-ui,sans-serif"}}>Sociedades del grupo</span>
        <button style={{fontSize:11,padding:"4px 12px",borderRadius:3,border:"1px solid "+BORDER,background:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif",color:TEXT_DARK}} onClick={()=>setShowForm(!showForm)}>+ Agregar sociedad</button>
      </div>

      {showForm&&<div style={{background:"#F5F2ED",border:"1px solid "+BORDER,borderRadius:4,padding:12,marginBottom:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div>
            <span style={{fontSize:10,color:GRAY,fontFamily:"system-ui,sans-serif",display:"block",marginBottom:4}}>Nombre de la sociedad</span>
            <input style={{fontSize:12,padding:"7px 10px",border:"1px solid "+BORDER,borderRadius:3,fontFamily:"system-ui,sans-serif",width:"100%",boxSizing:"border-box"}} value={nueva.nombre} onChange={e=>setNueva({...nueva,nombre:e.target.value})} placeholder="Razón social"/>
          </div>
          <div>
            <span style={{fontSize:10,color:GRAY,fontFamily:"system-ui,sans-serif",display:"block",marginBottom:4}}>RFC</span>
            <input style={{fontSize:12,padding:"7px 10px",border:"1px solid "+BORDER,borderRadius:3,fontFamily:"system-ui,sans-serif",width:"100%",boxSizing:"border-box"}} value={nueva.rfc} onChange={e=>setNueva({...nueva,rfc:e.target.value})} placeholder="RFC de la sociedad"/>
          </div>
          <div>
            <span style={{fontSize:10,color:GRAY,fontFamily:"system-ui,sans-serif",display:"block",marginBottom:4}}>Tipo societario</span>
            <select style={{fontSize:12,padding:"7px 10px",border:"1px solid "+BORDER,borderRadius:3,fontFamily:"system-ui,sans-serif",width:"100%",boxSizing:"border-box"}} value={nueva.tipo_societario} onChange={e=>setNueva({...nueva,tipo_societario:e.target.value})}>
              <option value="">Seleccionar</option>
              <option value="SA de CV">S.A. de C.V.</option>
              <option value="SAPI de CV">S.A.P.I. de C.V.</option>
              <option value="SRL de CV">S. de R.L. de C.V.</option>
              <option value="SC">S.C.</option>
              <option value="AC">A.C.</option>
              <option value="Fideicomiso">Fideicomiso</option>
            </select>
          </div>
        </div>
        <div style={{marginBottom:8}}>
          <span style={{fontSize:10,color:GRAY,fontFamily:"system-ui,sans-serif",display:"block",marginBottom:4}}>Módulos activos de esta sociedad</span>
          <ModulosSelector clientId={clientId} modulosActivos={nueva.modulos||[]} onChange={mods=>setNueva({...nueva,modulos:mods})}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={crear} disabled={saving} style={{fontSize:11,padding:"6px 14px",borderRadius:3,border:"none",background:"#4A5C45",color:"#F0F4EE",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>{saving?"Guardando...":"Crear sociedad"}</button>
          <button onClick={()=>setShowForm(false)} style={{fontSize:11,padding:"6px 14px",borderRadius:3,border:"1px solid "+BORDER,background:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Cancelar</button>
        </div>
      </div>}

      {sociedades.length===0&&!showForm&&<div style={{fontSize:12,color:GRAY,fontFamily:"system-ui,sans-serif",padding:"12px 0"}}>Sin sociedades registradas — el cliente opera como entidad única.</div>}

      {sociedades.map(soc=>(
        <div key={soc.id} style={{border:"1px solid "+BORDER,borderRadius:4,padding:12,marginBottom:8,background:"#FAFCF8"}}>
          {editando?.id===soc.id?(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <div>
                  <span style={{fontSize:10,color:GRAY,fontFamily:"system-ui,sans-serif",display:"block",marginBottom:4}}>Nombre</span>
                  <input style={{fontSize:12,padding:"7px 10px",border:"1px solid "+BORDER,borderRadius:3,fontFamily:"system-ui,sans-serif",width:"100%",boxSizing:"border-box"}} value={editando.nombre} onChange={e=>setEditando({...editando,nombre:e.target.value})}/>
                </div>
                <div>
                  <span style={{fontSize:10,color:GRAY,fontFamily:"system-ui,sans-serif",display:"block",marginBottom:4}}>RFC</span>
                  <input style={{fontSize:12,padding:"7px 10px",border:"1px solid "+BORDER,borderRadius:3,fontFamily:"system-ui,sans-serif",width:"100%",boxSizing:"border-box"}} value={editando.rfc||""} onChange={e=>setEditando({...editando,rfc:e.target.value})}/>
                </div>
              </div>
              <div style={{marginBottom:8}}>
                <span style={{fontSize:10,color:GRAY,fontFamily:"system-ui,sans-serif",display:"block",marginBottom:4}}>Módulos activos</span>
                <ModulosSelector clientId={clientId} modulosActivos={editando.modulos||[]} onChange={mods=>setEditando({...editando,modulos:mods})}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>actualizar(editando)} disabled={saving} style={{fontSize:11,padding:"6px 14px",borderRadius:3,border:"none",background:"#4A5C45",color:"#F0F4EE",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>{saving?"Guardando...":"Guardar"}</button>
                <button onClick={()=>setEditando(null)} style={{fontSize:11,padding:"6px 14px",borderRadius:3,border:"1px solid "+BORDER,background:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Cancelar</button>
              </div>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontFamily:"Georgia,serif",color:"#1E2B1A"}}>{soc.nombre}</div>
                <div style={{fontSize:11,color:GRAY,fontFamily:"system-ui,sans-serif",marginTop:2}}>
                  {soc.tipo_societario&&<span>{soc.tipo_societario} · </span>}
                  {soc.rfc&&<span>RFC: {soc.rfc} · </span>}
                  <span>{(soc.modulos||[]).length} módulos activos</span>
                </div>
              </div>
              <button onClick={()=>setEditando({...soc})} style={{fontSize:10,padding:"4px 10px",borderRadius:3,border:"1px solid "+BORDER,background:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Editar</button>
              <button onClick={()=>eliminar(soc.id)} style={{fontSize:10,padding:"4px 10px",borderRadius:3,border:"1px solid #fecaca",background:"#fef2f2",color:"#991b1b",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>×</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UsersTab({clients,setClients,admins,setAdmins}){
  const [editingClient,setEditingClient]=useState(null);const [editingAdmin,setEditingAdmin]=useState(null);
  const [showNewAdmin,setShowNewAdmin]=useState(false);const [newAdmin,setNewAdmin]=useState({id:"",name:"",password:""});
  const [saved,setSaved]=useState("");const [confirmDelete,setConfirmDelete]=useState(null);

  async function saveClient(c){
    await supabase.from("clients").update({name:c.name,contact:c.contact,email:c.email,password:c.password,modulos:c.modulos||[]}).eq("id",c.id);
    setClients(prev=>prev.map(x=>x.id===c.id?c:x));setEditingClient(null);
    setSaved("Cliente actualizado ✓");setTimeout(()=>setSaved(""),2000);
  }
  async function deleteClient(id){
    await supabase.from("clients").delete().eq("id",id);
    setClients(prev=>prev.filter(c=>c.id!==id));setConfirmDelete(null);
    setSaved("Cliente eliminado");setTimeout(()=>setSaved(""),2000);
  }
  async function saveAdmin(a){
    await supabase.from("admins").update({name:a.name,password:a.password}).eq("id",a.id);
    setAdmins(prev=>prev.map(x=>x.id===a.id?a:x));setEditingAdmin(null);
    setSaved("Usuario actualizado ✓");setTimeout(()=>setSaved(""),2000);
  }
  async function addAdmin(){
    if(!newAdmin.id||!newAdmin.password)return;
    await supabase.from("admins").insert(newAdmin);setAdmins(prev=>[...prev,newAdmin]);
    setShowNewAdmin(false);setNewAdmin({id:"",name:"",password:""});
    setSaved("Usuario creado ✓");setTimeout(()=>setSaved(""),2000);
  }
  async function deleteAdmin(id){await supabase.from("admins").delete().eq("id",id);setAdmins(prev=>prev.filter(a=>a.id!==id));}

  return(
    <div>
      {saved&&<div style={{fontSize:12,color:"#5A8A3C",fontFamily:"system-ui, sans-serif",marginBottom:12}}>{saved}</div>}
      {confirmDelete&&(
        <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:WHITE,padding:"2rem",border:"1px solid "+BORDER,width:"min(400px,90vw)"}}>
            <div style={{fontSize:16,fontFamily:"Georgia, serif",marginBottom:8}}>Eliminar cliente</div>
            <div style={{...s.muted,marginBottom:20}}>Se eliminarán todos los datos de <strong>{confirmDelete.name}</strong>. Esta acción no se puede deshacer.</div>
            <div style={s.flex()}>
              <button style={s.btn} onClick={()=>setConfirmDelete(null)}>Cancelar</button>
              <button style={{background:"#dc2626",color:WHITE,border:"none",borderRadius:2,padding:"7px 16px",fontSize:12,cursor:"pointer"}} onClick={()=>deleteClient(confirmDelete.id)}>Eliminar permanentemente</button>
            </div>
          </div>
        </div>
      )}
      <span style={s.label}>Usuarios del despacho</span>
      <div style={{...s.flex(),justifyContent:"flex-end",marginBottom:8}}><button style={s.btnPrimary} onClick={()=>setShowNewAdmin(!showNewAdmin)}>+ Nuevo usuario</button></div>
      {showNewAdmin&&<div style={{...s.card,...s.col(),marginBottom:12}}>
        <div style={s.flex()}><input style={{...s.input,width:100}} placeholder="Usuario" value={newAdmin.id} onChange={e=>setNewAdmin({...newAdmin,id:e.target.value})}/><input style={s.input} placeholder="Nombre completo" value={newAdmin.name} onChange={e=>setNewAdmin({...newAdmin,name:e.target.value})}/></div>
        <div style={s.flex()}><input style={s.input} type="password" placeholder="Contraseña" value={newAdmin.password} onChange={e=>setNewAdmin({...newAdmin,password:e.target.value})}/><button style={s.btnPrimary} onClick={addAdmin}>Crear</button></div>
      </div>}
      <div style={{...s.card,marginBottom:20}}>
        {admins.map(a=>editingAdmin?.id===a.id
          ?<div key={a.id} style={{...s.col(),padding:"12px 0",borderBottom:"1px solid "+BORDER}}>
            <div style={s.flex()}><input style={{...s.input,width:100}} value={editingAdmin.id} disabled/><input style={s.input} placeholder="Nombre" value={editingAdmin.name} onChange={e=>setEditingAdmin({...editingAdmin,name:e.target.value})}/></div>
            <div style={s.flex()}><input style={s.input} type="password" placeholder="Nueva contraseña" value={editingAdmin.password} onChange={e=>setEditingAdmin({...editingAdmin,password:e.target.value})}/><button style={s.btnPrimary} onClick={()=>saveAdmin(editingAdmin)}>Guardar</button><button style={s.btn} onClick={()=>setEditingAdmin(null)}>Cancelar</button></div>
          </div>
          :<div key={a.id} style={s.row}><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{a.name}</div><div style={s.muted}>@{a.id}</div></div><button style={{...s.btn,...s.btnSm}} onClick={()=>setEditingAdmin({...a})}>Editar</button><button style={{...s.btnDanger,...s.btnSm}} onClick={()=>deleteAdmin(a.id)}>×</button></div>
        )}
      </div>
      <span style={s.label}>Clientes del sistema</span>
      <div style={s.card}>
        {clients.map(c=>editingClient?.id===c.id
          ?<div key={c.id} style={{...s.col(),padding:"12px 0",borderBottom:"1px solid "+BORDER}}>
            <ModulosSelector clientId={editingClient.id} modulosActivos={editingClient.modulos||[]} onChange={mods=>setEditingClient({...editingClient,modulos:mods})}/><div style={s.flex()}><input style={{...s.input,width:80}} value={editingClient.id} disabled/><input style={s.input} placeholder="Nombre empresa" value={editingClient.name} onChange={e=>setEditingClient({...editingClient,name:e.target.value})}/></div>
            <div style={s.flex()}><input style={s.input} placeholder="Contacto" value={editingClient.contact} onChange={e=>setEditingClient({...editingClient,contact:e.target.value})}/><input style={s.input} placeholder="Email" value={editingClient.email} onChange={e=>setEditingClient({...editingClient,email:e.target.value})}/></div>
            <div style={s.flex()}><input style={s.input} type="password" placeholder="Nueva contraseña" value={editingClient.password} onChange={e=>setEditingClient({...editingClient,password:e.target.value})}/><button style={s.btnPrimary} onClick={()=>saveClient(editingClient)}>Guardar</button><button style={s.btn} onClick={()=>setEditingClient(null)}>Cancelar</button></div>
            <GestorSociedades clientId={editingClient.id}/>
          </div>
          :<div key={c.id} style={s.row}><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{c.name}</div><div style={s.muted}>Usuario: {c.id} · {c.contact}</div></div><button style={{...s.btn,...s.btnSm}} onClick={()=>setEditingClient({...c,password:""})}>Editar</button><button style={{...s.btnDanger,...s.btnSm}} onClick={()=>setConfirmDelete(c)}>Eliminar</button></div>
        )}
      </div>
    </div>
  );
}


const FAQ_DATA = [
  {categoria:"Mi panel",items:[
    {q:"¿Qué es el Panel de Inmunidad Corporativa?",a:"Es tu herramienta de cumplimiento legal en tiempo real. Tu despacho M&M Abogados lo actualiza constantemente con el estado legal de tu empresa."},
    {q:"¿Cada cuánto se actualiza la información?",a:"Tu despacho actualiza el panel cada vez que revisa tu situación legal. Las alertas de vencimiento se actualizan automáticamente todos los días."},
    {q:"¿La información de mi empresa es confidencial?",a:"Sí. Solo tú y el equipo de M&M Abogados tienen acceso a tu panel. Ningún otro cliente puede ver tu información."},
    {q:"¿Qué significa el porcentaje de cumplimiento?",a:"Es el porcentaje de items legales que tu empresa tiene en orden según la revisión de tu despacho."},
  ]},
  {categoria:"Módulos",items:[
    {q:"¿Qué son los módulos?",a:"Cada módulo representa un área legal de tu empresa — Laboral, Fiscal, Corporativo, Migratorio, etc. Dentro de cada módulo puedes ver documentos, checklist de cumplimiento y riesgos."},
    {q:"¿Qué significa que un item esté en rojo?",a:"Significa que tu despacho identificó algo que no está en orden y requiere atención. Haz click en el módulo para ver el detalle."},
    {q:"¿Por qué no veo módulos en mi panel?",a:"Los módulos se activan según los servicios contratados con M&M Abogados. Contacta a tu ejecutivo para revisar tu plan."},
  ]},
  {categoria:"Documentos",items:[
    {q:"¿Cómo subo documentos al panel?",a:"Los documentos los sube directamente tu despacho a Google Drive. Usa Solicitar al despacho si necesitas agregar alguno específico."},
    {q:"¿Dónde se guardan mis documentos?",a:"En Google Drive, en una carpeta exclusiva para tu empresa. Desde el panel puedes hacer click en cualquier documento para abrirlo."},
    {q:"¿Qué pasa cuando un documento está por vencer?",a:"Recibirás un email automático con anticipación. También lo verás en el dashboard y en el calendario de vencimientos."},
  ]},
  {categoria:"Solicitudes",items:[
    {q:"¿Cómo le pido algo a mi despacho?",a:"Ve a Solicitar al despacho en el menú lateral. Ahí puedes enviar una solicitud con el tipo de servicio y el detalle. El equipo de M&M te contacta."},
    {q:"¿Qué tipo de solicitudes puedo hacer?",a:"Asambleas, poderes notariales, contratos, due diligence, asesoría laboral, trámites migratorios, revisión de documentos y cualquier necesidad legal."},
    {q:"¿Cuánto tarda en responder el despacho?",a:"Máximo 24 horas hábiles. Para asuntos urgentes contacta directamente a tu ejecutivo por teléfono o WhatsApp."},
  ]},
  {categoria:"Sociedades",items:[
    {q:"¿Puedo ver varias empresas en el mismo panel?",a:"Sí. Si tu grupo tiene más de una sociedad verás un selector en la parte superior para cambiar entre ellas. Cada sociedad tiene su propio cumplimiento y documentos."},
    {q:"¿Qué es la vista Grupo?",a:"Muestra la información del grupo corporativo en conjunto sin filtrar por sociedad específica."},
  ]},
  {categoria:"Contacto",items:[
    {q:"¿Cómo contacto a M&M Abogados?",a:"Por email a hola@mymabogados.mx, por teléfono al número que te proporcionamos, o desde el panel usando Solicitar al despacho."},
    {q:"¿Qué hago si algo no funciona?",a:"Envía un email a soporte@mymabogados.mx con una descripción y captura de pantalla. Lo revisamos en menos de 24 horas hábiles."},
  ]},
];

function FAQModal({onClose}){
  const [busqueda,setBusqueda]=React.useState("");
  const [catActiva,setCatActiva]=React.useState(null);
  const [itemAbierto,setItemAbierto]=React.useState(null);
  const categorias=FAQ_DATA.map(c=>c.categoria);
  const faqFiltrada=busqueda.length>1?FAQ_DATA.map(cat=>({...cat,items:cat.items.filter(i=>i.q.toLowerCase().includes(busqueda.toLowerCase())||i.a.toLowerCase().includes(busqueda.toLowerCase()))})).filter(cat=>cat.items.length>0):catActiva?FAQ_DATA.filter(c=>c.categoria===catActiva):FAQ_DATA;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.65)",display:"flex",alignItems:"flex-end",justifyContent:"flex-end",zIndex:500,padding:"1rem"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:8,width:"min(460px,100%)",maxHeight:"78vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #DDE4D8",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div><div style={{fontSize:15,fontFamily:"Georgia,serif",color:"#1E2B1A"}}>Preguntas frecuentes</div><div style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginTop:2}}>M&M Abogados · Panel Corporativo</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#7A9070",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"10px 20px",borderBottom:"1px solid #DDE4D8",flexShrink:0}}>
          <input style={{width:"100%",fontSize:12,padding:"8px 12px",border:"1px solid #DDE4D8",borderRadius:4,fontFamily:"system-ui,sans-serif",background:"#F5F2ED",boxSizing:"border-box",outline:"none"}} placeholder="Buscar una pregunta..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} autoFocus/>
        </div>
        {!busqueda&&<div style={{display:"flex",gap:6,padding:"10px 20px",borderBottom:"1px solid #DDE4D8",flexWrap:"wrap",flexShrink:0}}>
          <button onClick={()=>setCatActiva(null)} style={{fontSize:10,padding:"3px 10px",borderRadius:12,border:"1px solid "+(catActiva===null?"#4A5C45":"#DDE4D8"),background:catActiva===null?"#4A5C45":"none",color:catActiva===null?"#F0F4EE":"#1E2B1A",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Todas</button>
          {categorias.map(cat=><button key={cat} onClick={()=>setCatActiva(cat===catActiva?null:cat)} style={{fontSize:10,padding:"3px 10px",borderRadius:12,border:"1px solid "+(catActiva===cat?"#4A5C45":"#DDE4D8"),background:catActiva===cat?"#4A5C45":"none",color:catActiva===cat?"#F0F4EE":"#1E2B1A",cursor:"pointer",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap"}}>{cat}</button>)}
        </div>}
        <div style={{overflowY:"auto",flex:1}}>
          {faqFiltrada.map(cat=>(
            <div key={cat.categoria}>
              <div style={{fontSize:9,letterSpacing:".15em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",padding:"12px 20px 4px",fontWeight:600}}>{cat.categoria}</div>
              {cat.items.map((item,i)=>(
                <div key={i} style={{borderBottom:"1px solid #DDE4D8"}}>
                  <button onClick={()=>setItemAbierto(itemAbierto===cat.categoria+i?null:cat.categoria+i)} style={{width:"100%",textAlign:"left",padding:"12px 20px",background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <span style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1E2B1A",lineHeight:1.5}}>{item.q}</span>
                    <span style={{fontSize:14,color:"#7A9070",flexShrink:0}}>{itemAbierto===cat.categoria+i?"−":"+"}</span>
                  </button>
                  {itemAbierto===cat.categoria+i&&<div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#4A5C45",lineHeight:1.7,padding:"0 20px 14px"}}>{item.a}</div>}
                </div>
              ))}
            </div>
          ))}
          {faqFiltrada.length===0&&<div style={{padding:"2rem",textAlign:"center",color:"#7A9070",fontSize:12,fontFamily:"system-ui,sans-serif"}}>No encontramos resultados</div>}
        </div>
        <div style={{padding:"12px 20px",borderTop:"1px solid #DDE4D8",flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>¿No encontraste lo que buscas?</span>
          <a href="mailto:hola@mymabogados.mx" style={{fontSize:11,color:"#4A5C45",fontFamily:"system-ui,sans-serif",textDecoration:"none",fontWeight:600}}>Escribirnos →</a>
        </div>
      </div>
    </div>
  );
}



function RequestModal({client, onClose, onSubmit}){
  const [tipo,setTipo]=useState("");
  const [notes,setNotes]=useState("");
  const [saving,setSaving]=useState(false);
  const tipos=[
    "Asamblea de accionistas",
    "Poder notarial",
    "Contrato",
    "Due diligence",
    "Asesoría laboral",
    "Trámite migratorio",
    "Revisión de documentos",
    "Consulta fiscal",
    "Otro",
  ];
  async function send(){
    if(!tipo) return;
    setSaving(true);
    await onSubmit({label:tipo,type:tipo,notes});
    setSaving(false);
    onClose();
  }
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:"1rem"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",padding:"2rem",width:"min(500px,100%)",borderRadius:4}}>
        <div style={{fontSize:16,fontFamily:"Georgia,serif",color:"#1E2B1A",marginBottom:4}}>Solicitar al despacho</div>
        <div style={{fontSize:12,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:20}}>El equipo de M&M Abogados recibirá tu solicitud y te contactará.</div>
        <div style={{marginBottom:12}}>
          <span style={{fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",display:"block",marginBottom:6}}>Tipo de solicitud</span>
          <select style={{fontSize:12,padding:"8px 10px",border:"1px solid #DDE4D8",borderRadius:3,fontFamily:"system-ui,sans-serif",width:"100%",background:"#FAFCF8",color:"#1E2B1A"}} value={tipo} onChange={e=>setTipo(e.target.value)}>
            <option value="">Seleccionar...</option>
            {tipos.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{marginBottom:20}}>
          <span style={{fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",display:"block",marginBottom:6}}>Detalle (opcional)</span>
          <textarea style={{fontSize:12,padding:"8px 10px",border:"1px solid #DDE4D8",borderRadius:3,fontFamily:"system-ui,sans-serif",width:"100%",minHeight:80,resize:"vertical",background:"#FAFCF8",color:"#1E2B1A",boxSizing:"border-box"}} placeholder="Describe lo que necesitas..." value={notes} onChange={e=>setNotes(e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{fontSize:12,padding:"8px 16px",border:"1px solid #DDE4D8",borderRadius:3,background:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>Cancelar</button>
          <button onClick={send} disabled={!tipo||saving} style={{fontSize:12,padding:"8px 16px",border:"none",borderRadius:3,background:"#4A5C45",color:"#F0F4EE",cursor:(!tipo||saving)?"not-allowed":"pointer",fontFamily:"system-ui,sans-serif",opacity:(!tipo||saving)?0.6:1}}>{saving?"Enviando...":"Enviar solicitud"}</button>
        </div>
      </div>
    </div>
  );
}


function DocViewerModal({url, name, onClose}){
  const previewUrl = url.replace("/view","/preview").replace("/edit","/preview");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,26,26,.8)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:600,padding:"1rem"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#1a1a1a",width:"min(900px,100%)",height:"85vh",display:"flex",flexDirection:"column",borderRadius:4,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.1)",flexShrink:0}}>
          <span style={{fontSize:13,color:"#F0F4EE",fontFamily:"system-ui,sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"70%"}}>{name}</span>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <a href={("https://drive.google.com/uc?export=download&id="+(url.match(/[-\w]{25,}/)||[])[0])} target="_blank" rel="noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:3,border:"1px solid rgba(255,255,255,.2)",color:"#F0F4EE",textDecoration:"none",fontFamily:"system-ui,sans-serif"}}>↓ Descargar</a>
            <button onClick={onClose} style={{fontSize:18,background:"none",border:"none",color:"rgba(255,255,255,.6)",cursor:"pointer",lineHeight:1,padding:"2px 6px"}}>×</button>
          </div>
        </div>
        <iframe src={previewUrl} style={{flex:1,border:"none",width:"100%"}} allow="autoplay" title={name}/>
      </div>
    </div>
  );
}



const PERMISOS_SECCIONES = {
  principal: [
    {id:"panel",label:"Mi empresa (dashboard)"},
    {id:"riesgos",label:"Alertas críticas"},
    {id:"marca",label:"Mi marca"},
  ],
  empresa: [
    {id:"compliance",label:"Estado corporativo"},
    {id:"regulatorio",label:"Ante autoridades"},
    {id:"personas",label:"Equipo directivo"},
    {id:"poderes",label:"Poderes"},
    {id:"docs",label:"Mis documentos"},
    {id:"contratos",label:"Mis contratos"},
  ],
  despacho: [
    {id:"asambleas",label:"Asambleas"},
    {id:"historial",label:"Historial"},
    {id:"resumen",label:"Novedades del despacho"},
    {id:"pendientes",label:"Pendientes"},
    {id:"solicitudes",label:"Solicitar al despacho"},
    {id:"calendario",label:"Calendario"},
  ],
};

function GestorUsuariosInternos({client, isAdmin=false}){
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({nombre:"",email:"",password:"",modulos:[],rol:"visor",activo:true,permisos:{principal:[],empresa:[],despacho:[],modulos:[]}});
  const [saved,setSaved]=useState("");

  const modulos=(client._sociedad?.modulos||client.modulos||[]).filter(id=>{
    const m=MODULOS_CATALOG.find(x=>x.id===id);return m&&m.tier>0;
  });

  useEffect(()=>{
    supabase.from("client_users").select("*").eq("client_id",client.id).order("created_at")
    .then(({data})=>{setUsers(data||[]);setLoading(false);});
  },[client.id]);

  function togglePermiso(cat,id){
    setForm(prev=>{
      const cur=prev.permisos[cat]||[];
      return {...prev,permisos:{...prev.permisos,[cat]:cur.includes(id)?cur.filter(x=>x!==id):[...cur,id]}};
    });
  }

  function toggleModulo(id){
    setForm(prev=>({...prev,modulos:prev.modulos.includes(id)?prev.modulos.filter(x=>x!==id):[...prev.modulos,id]}));
  }

  async function save(){
    if(!form.nombre||!form.email||!form.password)return;
    if(editing){
      await supabase.from("client_users").update({nombre:form.nombre,email:form.email,password:form.password,modulos:form.permisos?.modulos||[],rol:form.rol,activo:form.activo,permisos:form.permisos}).eq("id",editing.id);
      setUsers(prev=>prev.map(u=>u.id===editing.id?{...u,...form}:u));
    } else {
      const nu={client_id:client.id,sociedad_id:client._sociedad?.id||null,nombre:form.nombre,email:form.email,password:form.password,modulos:form.permisos?.modulos||[],rol:form.rol||"visor",activo:true,permisos:form.permisos};
      const {data}=await supabase.from("client_users").insert(nu).select().single();
      if(data)setUsers(prev=>[...prev,data]);
    }
    setSaved("Guardado ✓");setTimeout(()=>setSaved(""),2000);
    setShowForm(false);setEditing(null);setForm({nombre:"",email:"",password:"",modulos:[],rol:"visor",activo:true,permisos:{principal:[],empresa:[],despacho:[],modulos:[]}});
  }

  async function toggleActivo(u){
    await supabase.from("client_users").update({activo:!u.activo}).eq("id",u.id);
    setUsers(prev=>prev.map(x=>x.id===u.id?{...x,activo:!x.activo}:x));
  }

  if(loading)return <Spinner/>;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:14,fontFamily:"Georgia,serif",color:"#1E2B1A"}}>Usuarios internos</div>
          <div style={{fontSize:12,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginTop:2}}>Personas de tu organización que pueden acceder al panel</div>
        </div>
        <button style={{background:"#4A5C45",color:"#F0F4EE",border:"none",borderRadius:3,padding:"8px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} onClick={()=>{setEditing(null);setForm({nombre:"",email:"",password:"",modulos:[],rol:"visor",activo:true});setShowForm(true);}}>+ Agregar usuario</button>
      </div>

      {showForm&&<div style={{background:"#F5F2ED",border:"1px solid #DDE4D8",borderRadius:4,padding:"1.25rem",marginBottom:16}}>
        <div style={{fontSize:12,fontFamily:"Georgia,serif",color:"#1E2B1A",marginBottom:12}}>{editing?"Editar usuario":"Nuevo usuario interno"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <input style={{fontSize:12,padding:"8px 10px",border:"1px solid #DDE4D8",borderRadius:3,fontFamily:"system-ui,sans-serif",background:"#FAFCF8"}} placeholder="Nombre completo" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/>
          <input style={{fontSize:12,padding:"8px 10px",border:"1px solid #DDE4D8",borderRadius:3,fontFamily:"system-ui,sans-serif",background:"#FAFCF8"}} placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
          <input style={{fontSize:12,padding:"8px 10px",border:"1px solid #DDE4D8",borderRadius:3,fontFamily:"system-ui,sans-serif",background:"#FAFCF8"}} placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
          <select style={{fontSize:12,padding:"8px 10px",border:"1px solid #DDE4D8",borderRadius:3,fontFamily:"system-ui,sans-serif",background:"#FAFCF8"}} value={form.rol} onChange={e=>setForm({...form,rol:e.target.value})}>
            <option value="visor">Visor — solo lectura</option>
            <option value="editor">Editor — puede subir docs</option>
          </select>
        </div>
        {["principal","empresa","despacho"].map(cat=>(
          <div key={cat} style={{marginBottom:10}}>
            <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:6}}>{cat==="principal"?"Principal":cat==="empresa"?"Mi empresa":"Despacho"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {PERMISOS_SECCIONES[cat].map(sec=>{
                const active=(form.permisos[cat]||[]).includes(sec.id);
                return <button key={sec.id} onClick={()=>togglePermiso(cat,sec.id)} style={{fontSize:11,padding:"3px 10px",borderRadius:3,border:"1px solid "+(active?"#4A5C45":"#DDE4D8"),background:active?"#4A5C45":"none",color:active?"#F0F4EE":"#1E2B1A",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>{sec.label}</button>;
              })}
            </div>
          </div>
        ))}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:6}}>Módulos activos</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {modulos.map(id=>{
              const m=MODULOS_CATALOG.find(x=>x.id===id);
              const active=(form.permisos.modulos||[]).includes(id);
              return <button key={id} onClick={()=>togglePermiso("modulos",id)} style={{fontSize:11,padding:"3px 10px",borderRadius:3,border:"1px solid "+(active?"#4A5C45":"#DDE4D8"),background:active?"#4A5C45":"none",color:active?"#F0F4EE":"#1E2B1A",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>{id} {m?.nombre||id}</button>;
            })}
            {modulos.length===0&&<span style={{fontSize:12,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>Sin módulos activos</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{fontSize:12,padding:"7px 14px",border:"1px solid #DDE4D8",borderRadius:3,cursor:"pointer",background:"none",fontFamily:"system-ui,sans-serif"}}>Cancelar</button>
          <button onClick={save} style={{fontSize:12,padding:"7px 14px",border:"none",borderRadius:3,cursor:"pointer",background:"#4A5C45",color:"#F0F4EE",fontFamily:"system-ui,sans-serif"}}>{editing?"Guardar cambios":"Crear usuario"}</button>
          {saved&&<span style={{fontSize:12,color:"#5A8A3C",fontFamily:"system-ui,sans-serif",alignSelf:"center"}}>{saved}</span>}
        </div>
      </div>}

      {users.length===0&&!showForm&&<div style={{textAlign:"center",padding:"2rem",color:"#7A9070",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin usuarios internos — agrega el primero</div>}
      {users.map(u=>(
        <div key={u.id} style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"1rem",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,opacity:u.activo?1:0.5}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontFamily:"Georgia,serif",color:"#1E2B1A"}}>{u.nombre}</div>
            <div style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginTop:2}}>{u.email} · {u.rol==="editor"?"Editor":"Visor"}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
              {(u.modulos||[]).map(id=><span key={id} style={{fontSize:9,padding:"2px 6px",borderRadius:2,background:"#E8F0E8",color:"#4A5C45",fontFamily:"system-ui,sans-serif"}}>{id}</span>)}
              {(!u.modulos||u.modulos.length===0)&&<span style={{fontSize:11,color:"#C9A84C",fontFamily:"system-ui,sans-serif"}}>Sin módulos asignados</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={()=>{setEditing(u);setForm({nombre:u.nombre,email:u.email,password:u.password,modulos:u.modulos||[],rol:u.rol||"visor",activo:u.activo,permisos:u.permisos||{principal:[],empresa:[],despacho:[],modulos:[]}});setShowForm(true);}} style={{fontSize:11,padding:"4px 10px",border:"1px solid #DDE4D8",borderRadius:3,cursor:"pointer",background:"none",fontFamily:"system-ui,sans-serif"}}>✎ Editar</button>
            <button onClick={()=>toggleActivo(u)} style={{fontSize:11,padding:"4px 10px",border:"1px solid #DDE4D8",borderRadius:3,cursor:"pointer",background:"none",fontFamily:"system-ui,sans-serif",color:u.activo?"#C0392B":"#5A8A3C"}}>{u.activo?"Desactivar":"Activar"}</button>
          </div>
        </div>
      ))}
    </div>
  );
}


function GestorNotificaciones({client, isAdmin=false}){
  const [prefs,setPrefs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({user_email:"",user_nombre:"",tipos:{checklist:true,documento:true,nota:true,accion:true,solicitud:true,vencimiento:true}});
  const [saved,setSaved]=useState("");

  const TIPOS_LABELS={
    checklist:{label:"Alertas de cumplimiento",desc:"Cuando un item se marca como No cumple"},
    documento:{label:"Documentos subidos",desc:"Cuando el despacho sube un documento nuevo"},
    nota:{label:"Notas del despacho",desc:"Cuando el despacho agrega una nota"},
    accion:{label:"Próximos pasos",desc:"Cuando se actualiza el próximo paso de un item"},
    solicitud:{label:"Solicitudes respondidas",desc:"Cuando el despacho responde una solicitud"},
    vencimiento:{label:"Vencimientos próximos",desc:"Documentos y contratos por vencer"},
  };

  useEffect(()=>{
    supabase.from("notif_preferencias").select("*").eq("client_id",client.id).order("created_at")
    .then(({data})=>{setPrefs(data||[]);setLoading(false);});
  },[client.id]);

  async function save(){
    if(!form.user_email)return;
    const existing=prefs.find(p=>p.user_email===form.user_email);
    if(existing){
      await supabase.from("notif_preferencias").update({user_nombre:form.user_nombre,tipos:form.tipos,activo:true}).eq("id",existing.id);
      setPrefs(prev=>prev.map(p=>p.id===existing.id?{...p,...form,activo:true}:p));
    } else {
      const {data}=await supabase.from("notif_preferencias").insert({client_id:client.id,sociedad_id:client._sociedad?.id||null,...form}).select().single();
      if(data)setPrefs(prev=>[...prev,data]);
    }
    setSaved("Guardado ✓");setTimeout(()=>setSaved(""),2000);
    setShowForm(false);setForm({user_email:"",user_nombre:"",tipos:{checklist:true,documento:true,nota:true,accion:true,solicitud:true,vencimiento:true}});
  }

  async function toggleActivo(p){
    await supabase.from("notif_preferencias").update({activo:!p.activo}).eq("id",p.id);
    setPrefs(prev=>prev.map(x=>x.id===p.id?{...x,activo:!x.activo}:x));
  }

  async function editPref(p){
    setForm({user_email:p.user_email,user_nombre:p.user_nombre||"",tipos:p.tipos||{}});
    setShowForm(true);
  }

  if(loading)return <div style={{textAlign:"center",padding:"2rem",color:"#7A9070",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando...</div>;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:14,fontFamily:"Georgia,serif",color:"#1E2B1A"}}>Notificaciones por email</div>
          <div style={{fontSize:12,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginTop:2}}>Configura quién recibe alertas y de qué tipo</div>
        </div>
        <button onClick={()=>{setForm({user_email:"",user_nombre:"",tipos:{checklist:true,documento:true,nota:true,accion:true,solicitud:true,vencimiento:true}});setShowForm(true);}} style={{background:"#4A5C45",color:"#F0F4EE",border:"none",borderRadius:3,padding:"8px 16px",fontSize:12,cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>+ Agregar destinatario</button>
      </div>

      {showForm&&<div style={{background:"#F5F2ED",border:"1px solid #DDE4D8",borderRadius:4,padding:"1.25rem",marginBottom:16}}>
        <div style={{fontSize:12,fontFamily:"Georgia,serif",color:"#1E2B1A",marginBottom:12}}>Configurar destinatario</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div>
            <label style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:4,display:"block"}}>Email</label>
            <input style={{fontSize:12,padding:"8px 10px",border:"1px solid #DDE4D8",borderRadius:3,fontFamily:"system-ui,sans-serif",background:"#FAFCF8",width:"100%",boxSizing:"border-box"}} placeholder="correo@empresa.com" type="email" value={form.user_email} onChange={e=>setForm({...form,user_email:e.target.value})}/>
          </div>
          <div>
            <label style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:4,display:"block"}}>Nombre (opcional)</label>
            <input style={{fontSize:12,padding:"8px 10px",border:"1px solid #DDE4D8",borderRadius:3,fontFamily:"system-ui,sans-serif",background:"#FAFCF8",width:"100%",boxSizing:"border-box"}} placeholder="Director General" value={form.user_nombre} onChange={e=>setForm({...form,user_nombre:e.target.value})}/>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:8,display:"block"}}>Tipos de notificación</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {Object.entries(TIPOS_LABELS).map(([key,t])=>(
              <div key={key} onClick={()=>setForm(prev=>({...prev,tipos:{...prev.tipos,[key]:!prev.tipos[key]}}))} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 10px",borderRadius:3,border:"1px solid "+(form.tipos[key]?"#4A5C45":"#DDE4D8"),background:form.tipos[key]?"#F0F4EE":"#FAFCF8",cursor:"pointer"}}>
                <div style={{width:16,height:16,borderRadius:3,border:"1.5px solid "+(form.tipos[key]?"#4A5C45":"#DDE4D8"),background:form.tipos[key]?"#4A5C45":"none",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {form.tipos[key]&&<span style={{color:"#F0F4EE",fontSize:10,lineHeight:1}}>✓</span>}
                </div>
                <div>
                  <div style={{fontSize:11,fontFamily:"system-ui,sans-serif",color:"#1E2B1A",fontWeight:600}}>{t.label}</div>
                  <div style={{fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowForm(false)} style={{fontSize:12,padding:"7px 14px",border:"1px solid #DDE4D8",borderRadius:3,cursor:"pointer",background:"none",fontFamily:"system-ui,sans-serif"}}>Cancelar</button>
          <button onClick={save} style={{fontSize:12,padding:"7px 14px",border:"none",borderRadius:3,cursor:"pointer",background:"#4A5C45",color:"#F0F4EE",fontFamily:"system-ui,sans-serif"}}>Guardar</button>
          {saved&&<span style={{fontSize:12,color:"#5A8A3C",fontFamily:"system-ui,sans-serif",alignSelf:"center"}}>{saved}</span>}
        </div>
      </div>}

      {prefs.length===0&&!showForm&&<div style={{textAlign:"center",padding:"2rem",color:"#7A9070",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Sin destinatarios configurados</div>}
      {prefs.map(p=>(
        <div key={p.id} style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"1rem",marginBottom:8,opacity:p.activo?1:0.5}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontFamily:"Georgia,serif",color:"#1E2B1A"}}>{p.user_nombre||p.user_email}</div>
              <div style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginTop:2}}>{p.user_nombre?p.user_email:""}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                {Object.entries(p.tipos||{}).filter(([,v])=>v).map(([k])=>(
                  <span key={k} style={{fontSize:9,padding:"2px 6px",borderRadius:2,background:"#E8F0E8",color:"#4A5C45",fontFamily:"system-ui,sans-serif"}}>{TIPOS_LABELS[k]?.label||k}</span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>editPref(p)} style={{fontSize:11,padding:"4px 10px",border:"1px solid #DDE4D8",borderRadius:3,cursor:"pointer",background:"none",fontFamily:"system-ui,sans-serif"}}>✎ Editar</button>
              <button onClick={()=>toggleActivo(p)} style={{fontSize:11,padding:"4px 10px",border:"1px solid #DDE4D8",borderRadius:3,cursor:"pointer",background:"none",fontFamily:"system-ui,sans-serif",color:p.activo?"#C0392B":"#5A8A3C"}}>{p.activo?"Pausar":"Activar"}</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientDashboard({client, onNavigate}){
  const [checks,setChecks]=useState({});
  const [docs,setDocs]=useState([]);
  const [loading,setLoading]=useState(true);
  const socId = client._sociedad?.id||null;

  useEffect(()=>{
    async function load(){
      setLoading(true);
      const [ch,d,ctr]=await Promise.all([
        socId
          ? supabase.from("reglas_compliance").select("*").eq("client_id",client.id).eq("sociedad_id",socId)
          : supabase.from("reglas_compliance").select("*").eq("client_id",client.id).is("sociedad_id",null),
        socId
          ? supabase.from("documents").select("*").eq("client_id",client.id).eq("sociedad_id",socId).not("fecha_vencimiento","is",null)
          : supabase.from("documents").select("*").eq("client_id",client.id).is("sociedad_id",null).not("fecha_vencimiento","is",null),
        socId
          ? supabase.from("contratos").select("*").eq("client_id",client.id).eq("sociedad_id",socId).not("vencimiento","is",null)
          : supabase.from("contratos").select("*").eq("client_id",client.id).is("sociedad_id",null).not("vencimiento","is",null),
      ]);
      const cm={};
      (ch.data||[]).forEach(x=>{cm[x.modulo+"_"+x.regla_id]=x.status;});
      setChecks(cm);
      // Unificar documentos y contratos en un solo array de vencimientos
      const docsConFecha=(d.data||[]).map(x=>({...x,_tipo:"documento",fecha_vencimiento:x.fecha_vencimiento,nombre:x.name}));
      const ctrsConFecha=(ctr.data||[]).map(x=>({...x,_tipo:"contrato",fecha_vencimiento:x.vencimiento,nombre:x.nombre}));
      setDocs([...docsConFecha,...ctrsConFecha]);
      setLoading(false);
    }
    load();
    load();
    const interval = setInterval(load, 60000);
    return ()=>clearInterval(interval);
  },[client.id,socId]);

  const modulos = (client._sociedad?.modulos||client.modulos||[]).filter(id=>{
    const m=MODULOS_CATALOG.find(x=>x.id===id);return m&&m.tier>0;
  });

  // Calcular métricas reales
  const totalItems = Object.keys(checks).length;
  const cumple = Object.values(checks).filter(v=>v==="cumple").length;
  const noCumple = Object.values(checks).filter(v=>v==="no_cumple").length;
  const parcial = Object.values(checks).filter(v=>v==="parcial").length;
  const pct = totalItems>0 ? Math.round((cumple/totalItems)*100) : null;
  const pctColor = pct===null?"#7A9070":pct>=75?"#5A8A3C":pct>=50?"#C9A84C":"#C0392B";

  // Docs por vencer
  const hoy=new Date();
  const proxVencer = docs.filter(d=>{
    if(!d.fecha_vencimiento) return false;
    const dias=Math.ceil((new Date(d.fecha_vencimiento)-hoy)/(1000*60*60*24));
    return dias>=0 && dias<=45;
  }).sort((a,b)=>new Date(a.fecha_vencimiento)-new Date(b.fecha_vencimiento));

  const vencidos = docs.filter(d=>{
    if(!d.fecha_vencimiento) return false;
    return Math.ceil((new Date(d.fecha_vencimiento)-hoy)/(1000*60*60*24))<0;
  });

  // Alertas críticas del checklist
  const alertasCriticas = [];
  Object.entries(checks).forEach(([key,status])=>{
    if(status==="no_cumple"){
      const [modId,reglaId]=key.split("_");
      const mod=MODULOS_CATALOG.find(x=>x.id===modId);
      const docs_mod=MODULO_DOCS[modId];
      const item=docs_mod?.checklist?.find(x=>x.id===reglaId);
      if(item) alertasCriticas.push({modId,modNombre:mod?.nombre||modId,label:item.label,riesgo:item.riesgo});
    }
  });

  if(loading) return <div style={{textAlign:"center",padding:"3rem",color:"#7A9070",fontSize:12,fontFamily:"system-ui,sans-serif"}}>Cargando tu panel...</div>;

  return(
    <div>
      {/* Scorecards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        <div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"1rem",textAlign:"center"}}>
          <div style={{fontSize:28,fontFamily:"Georgia,serif",color:pctColor,fontWeight:400}}>{pct!==null?pct+"%":"—"}</div>
          <div style={{fontSize:10,color:"#7A9070",marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Cumplimiento</div>
        </div>
        <div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"1rem",textAlign:"center"}}>
          <div style={{fontSize:28,fontFamily:"Georgia,serif",color:"#4A5C45",fontWeight:400}}>{modulos.length}</div>
          <div style={{fontSize:10,color:"#7A9070",marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Módulos activos</div>
        </div>
        <div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"1rem",textAlign:"center"}}>
          <div style={{fontSize:28,fontFamily:"Georgia,serif",color:noCumple>0?"#C0392B":"#5A8A3C",fontWeight:400}}>{noCumple}</div>
          <div style={{fontSize:10,color:"#7A9070",marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Alertas críticas</div>
        </div>
        <div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"1rem",textAlign:"center"}}>
          <div style={{fontSize:28,fontFamily:"Georgia,serif",color:vencidos.length>0?"#C0392B":proxVencer.length>0?"#C9A84C":"#5A8A3C",fontWeight:400}}>{vencidos.length+proxVencer.length}</div>
          <div style={{fontSize:10,color:"#7A9070",marginTop:4,textTransform:"uppercase",letterSpacing:".08em",fontFamily:"system-ui,sans-serif"}}>Vencimientos 30 días</div>
        </div>
      </div>

      {/* Alertas críticas */}
      {alertasCriticas.length>0&&<div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"1rem",marginBottom:12}}>
        <div style={{fontSize:10,letterSpacing:".15em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:10,fontWeight:600}}>⚠ Requiere atención</div>
        {alertasCriticas.slice(0,5).map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:i<Math.min(alertasCriticas.length,5)-1?"1px solid #DDE4D8":"none"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:"#C0392B",flexShrink:0,marginTop:4,display:"inline-block"}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1E2B1A"}}>{a.label}</div>
              <div style={{fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginTop:1}}>{a.modNombre}</div>
            </div>
            <button onClick={()=>onNavigate("mod_"+a.modId)} style={{fontSize:10,padding:"3px 8px",borderRadius:2,border:"1px solid #DDE4D8",background:"none",cursor:"pointer",fontFamily:"system-ui,sans-serif",color:"#4A5C45",whiteSpace:"nowrap"}}>Ver módulo →</button>
          </div>
        ))}
        {alertasCriticas.length>5&&<div style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginTop:8,textAlign:"center",cursor:"pointer"}} onClick={()=>onNavigate("riesgos")}>{alertasCriticas.length-5} alertas más → ver todas</div>}
      </div>}

      {/* Vencimientos próximos */}
      {(proxVencer.length>0||vencidos.length>0)&&<div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"1rem",marginBottom:12}}>
        <div style={{fontSize:10,letterSpacing:".15em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:10,fontWeight:600}}>📅 Vencimientos</div>
        {vencidos.map((d,i)=>{
          const dias=Math.abs(Math.ceil((new Date(d.fecha_vencimiento)-hoy)/(1000*60*60*24)));
          return <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #DDE4D8",gap:8}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1E2B1A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.nombre||d.name||d.tipo}</div>
              <div style={{fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>{d._tipo==="contrato"?"Contrato":"Documento"}{d.modulo?" · "+d.modulo:""}</div>
            </div>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:2,background:"#fef2f2",color:"#991b1b",fontFamily:"system-ui,sans-serif",flexShrink:0}}>Venció hace {dias}d</span>
          </div>;
        })}
        {proxVencer.map((d,i)=>{
          const dias=Math.ceil((new Date(d.fecha_vencimiento)-hoy)/(1000*60*60*24));
          return <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<proxVencer.length-1?"1px solid #DDE4D8":"none",gap:8}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1E2B1A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.nombre||d.name||d.tipo}</div>
              <div style={{fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>{d._tipo==="contrato"?"Contrato":"Documento"}{d.modulo?" · "+d.modulo:""}</div>
            </div>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:2,background:dias<=7?"#fef2f2":dias<=30?"#fffbeb":"#f0fdf4",color:dias<=7?"#991b1b":dias<=30?"#92400e":"#166534",fontFamily:"system-ui,sans-serif",flexShrink:0}}>Vence en {dias}d</span>
          </div>;
        })}
      </div>}

      {/* Estado por módulo */}
      {modulos.length>0&&<div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"1rem",marginBottom:12}}>
        <div style={{fontSize:10,letterSpacing:".15em",textTransform:"uppercase",color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:10,fontWeight:600}}>Estado por módulo</div>
        {modulos.map((modId,i)=>{
          const m=MODULOS_CATALOG.find(x=>x.id===modId);
          const items=MODULO_DOCS[modId]?.checklist||[];
          const total=items.length;
          const cumpleCount=items.filter(it=>checks[modId+"_"+it.id]==="cumple").length;
          const noCount=items.filter(it=>checks[modId+"_"+it.id]==="no_cumple").length;
          const pctMod=total>0?Math.round((cumpleCount/total)*100):null;
          const color=noCount>0?"#C0392B":pctMod>=75?"#5A8A3C":"#C9A84C";
          return <div key={modId} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<modulos.length-1?"1px solid #DDE4D8":"none",cursor:"pointer"}} onClick={()=>onNavigate("mod_"+modId)}>
            <span style={{fontSize:9,padding:"2px 5px",borderRadius:2,background:"#F0F4EE",color:"#4A5C45",fontFamily:"system-ui,sans-serif",flexShrink:0}}>{modId}</span>
            <div style={{flex:1,fontSize:12,fontFamily:"system-ui,sans-serif",color:"#1E2B1A"}}>{m?.nombre||modId}</div>
            {total>0&&<div style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>{cumpleCount}/{total}</div>}
            <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
          </div>;
        })}
      </div>}

      {/* Sin módulos */}
      {modulos.length===0&&<div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:4,padding:"2rem",textAlign:"center"}}>
        <div style={{fontSize:14,fontFamily:"Georgia,serif",color:"#1E2B1A",marginBottom:8}}>Tu panel está listo</div>
        <div style={{fontSize:12,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>El despacho está configurando tus módulos. Pronto verás aquí el estado de cumplimiento de tu empresa.</div>
      </div>}
    </div>
  );
}

function ClientView({client,onLogout,clientUser=null}){
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [tab,setTab]=useState("panel");
  // Permisos del usuario interno
  const isClientUser = !!clientUser;
  const permisos = clientUser?.permisos||null;
  function tienePermiso(cat, tabId){
    if(!isClientUser) return true; // CEO ve todo
    if(!permisos) return false;
    if(cat==="modulo") return (permisos.modulos||[]).includes(tabId);
    return (permisos[cat]||[]).includes(tabId);
  }const [docCat,setDocCat]=useState("poderes");
  const [showReq,setShowReq]=useState(false);const [areas,setAreas]=useState([]);
  const [documents,setDocuments]=useState([]);const [pendingDocs,setPendingDocs]=useState([]);
  const [requests,setRequests]=useState([]);const [loading,setLoading]=useState(true);
  const [showDiag,setShowDiag]=useState(false);const [diagDone,setDiagDone]=useState(false);
  const [diagResult,setDiagResult]=useState(null);
  const [showOnboarding,setShowOnboarding]=useState(false);
  const [showFAQ,setShowFAQ]=useState(false);
  const [viewingDoc,setViewingDoc]=useState(null);
  const [sociedades,setSociedades]=useState([]);
  const [sociedadActiva,setSociedadActiva]=useState(clientUser?.sociedad_id?null:null);

  useEffect(()=>{
    async function load(){
      const [a,d,p,r,cl,soc]=await Promise.all([
        supabase.from("areas").select("*").eq("client_id",client.id),
        supabase.from("documents").select("*").eq("client_id",client.id),
        supabase.from("pending_docs").select("*").eq("client_id",client.id),
        supabase.from("requests").select("*").eq("client_id",client.id),
        supabase.from("clients").select("diagnostico_done").eq("id",client.id).single(),
        supabase.from("sociedades").select("*").eq("client_id",client.id).order("created_at"),
      ]);
      setAreas(a.data||[]);setDocuments(d.data||[]);setPendingDocs(p.data||[]);setRequests(r.data||[]);
      const socData=soc.data||[];setSociedades(socData);
      // Empieza en vista Grupo — el usuario elige la sociedad
      // Si es client_user con sociedad asignada, forzarla
      if(clientUser?.sociedad_id){
        const socAsignada=socData.find(s=>s.id===clientUser.sociedad_id);
        if(socAsignada) setSociedadActiva(socAsignada);
        else setSociedadActiva(null);
      } else {
        setSociedadActiva(null);
      }
      setSociedadLoaded(true);
      const done=cl.data?.diagnostico_done;setDiagDone(!!done);
      const onboardingDone = localStorage.getItem("mm_onboarding_done_"+client.id);
      if(!done&&!onboardingDone){setShowOnboarding(true);}
      setLoading(false);
    }
    load();
  },[client.id]);

  // Recargar datos cuando cambia la sociedad activa
  const [sociedadLoaded,setSociedadLoaded]=useState(false);
  useEffect(()=>{
    if(loading || !sociedadLoaded) return;
    async function reloadSociedad(){
      const socId = sociedadActiva?.id || null;
      const qAreas = socId
        ? supabase.from("areas").select("*").eq("client_id",client.id).eq("sociedad_id",socId)
        : supabase.from("areas").select("*").eq("client_id",client.id).is("sociedad_id",null);
      const qDocs = socId
        ? supabase.from("documents").select("*").eq("client_id",client.id).eq("sociedad_id",socId)
        : supabase.from("documents").select("*").eq("client_id",client.id).is("sociedad_id",null);
      const qPending = socId
        ? supabase.from("pending_docs").select("*").eq("client_id",client.id).eq("sociedad_id",socId)
        : supabase.from("pending_docs").select("*").eq("client_id",client.id).is("sociedad_id",null);
      const qRequests = socId
        ? supabase.from("requests").select("*").eq("client_id",client.id).eq("sociedad_id",socId)
        : supabase.from("requests").select("*").eq("client_id",client.id).is("sociedad_id",null);
      const [a,d,p,r2]=await Promise.all([qAreas,qDocs,qPending,qRequests]);
      setAreas(a.data||[]);setDocuments(d.data||[]);setPendingDocs(p.data||[]);setRequests(r2.data||[]);
    }
    reloadSociedad();
  },[sociedadActiva?.id]);

  async function submitRequest(req){
    const nr={id:"r"+Date.now(),client_id:client.id,sociedad_id:sociedadActiva?.id||null,label:req.label,type:req.type,notes:req.notes,status:"pendiente",date:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})};
    await supabase.from("requests").insert(nr);setRequests(prev=>[...prev,nr]);
  }

  if(loading)return <div style={s.wrap}><Spinner/></div>;
  if(showDiag)return <DiagnosticoForm client={client} onComplete={a=>{setDiagResult(a);setShowDiag(false);}}/>;
  if(diagResult)return <DiagnosticoResult areas={diagResult} onContinue={()=>{setAreas(diagResult||[]);setDiagResult(null);setDiagDone(true);}}/>;

  const score=scoreOf(areas);const scoreColor=score>=70?"#5A8A3C":score>=40?GOLD:"#C0392B";
  const clientEfectivo = sociedadActiva ? {...client, modulos: sociedadActiva.modulos||[], _sociedad: sociedadActiva} : client;
  const catDocs=documents.filter(d=>DOC_TYPES.find(t=>t.id===d.type)?.cat===docCat);
  const poderesDoc=documents.filter(d=>["poder_general","poder_dominio","poder_administracion","poder_pleitos","poder_sat","poder_bancario","poder_laboral"].includes(d.type));
  const poderesPorPersona=poderesDoc.reduce((acc,doc)=>{const key=doc.person||"Sin asignar";if(!acc[key])acc[key]=[];acc[key].push(doc);return acc;},{});
  const allTabs=[
    {id:"panel",label:"Mi empresa",cat:"principal"},
    {id:"riesgos",label:"🚨 Alertas críticas",cat:"principal"},
    {id:"marca",label:"Mi marca",cat:"principal"},
    {id:"compliance",label:"Estado corporativo",cat:"empresa"},
    {id:"regulatorio",label:"Ante autoridades",cat:"empresa"},
    {id:"personas",label:"Mi equipo directivo",cat:"empresa"},
    {id:"poderes",label:"Poderes",cat:"empresa"},
    {id:"docs",label:"Mis documentos",cat:"empresa"},
    {id:"contratos",label:"Mis contratos",cat:"empresa"},
    {id:"asambleas",label:"Asambleas",cat:"despacho"},
    {id:"historial",label:"Historial",cat:"despacho"},
    {id:"resumen",label:"Novedades del despacho",cat:"despacho"},
    {id:"pendientes",label:`Pendientes${pendingDocs.length>0?" · "+pendingDocs.length:""}`,cat:"despacho"},
    {id:"solicitudes",label:"Solicitar al despacho",cat:"despacho"},
    {id:"calendario",label:"📅 Calendario",cat:"despacho"},
    {id:"usuarios_internos",label:"👥 Mi equipo",cat:"principal",soloAdmin:true},{id:"notificaciones",label:"🔔 Notificaciones",cat:"principal"},
  ];
  const tabs=allTabs.filter(t=>tienePermiso(t.cat,t.id)&&(!t.soloAdmin||!isClientUser));

  return(
    <div style={{fontFamily:"Georgia, serif",color:TEXT_DARK,background:CONTENT_BG,height:"100vh",display:"flex",overflow:"hidden"}}>
        {/* SIDEBAR */}
        <div style={{width:sidebarOpen?204:0,background:(client.branding?.color||MUSGO),borderRight:sidebarOpen?"1px solid rgba(0,0,0,.15)":"none",overflow:"hidden",transition:"width .2s",flexShrink:0,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
          <div style={{padding:"22px 18px 14px"}}>
            {client.branding?.logo?<img src={client.branding.logo} style={{height:24,maxWidth:140,objectFit:"contain",filter:"brightness(0) invert(1)"}} alt="logo"/>:<div style={{fontSize:12,fontWeight:700,color:MUSGO_TEXT,letterSpacing:".02em"}}>M&M Abogados</div>}
            <div style={{fontSize:10,color:"rgba(240,244,238,.45)",marginTop:2}}>{client.branding?.nombre_portal||"Panel corporativo"}</div>
          </div>
          <div style={{height:1,background:"rgba(255,255,255,.12)",margin:"0 18px"}}/>
          <div style={{padding:"14px 18px 5px",fontSize:9,textTransform:"uppercase",letterSpacing:".12em",color:"rgba(240,244,238,.38)",fontWeight:500}}>Principal</div>
          {tabs.slice(0,3).map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 18px",fontSize:12,color:tab===t.id?MUSGO_TEXT:"rgba(240,244,238,.6)",cursor:"pointer",border:"none",background:tab===t.id?"rgba(255,255,255,.12)":"none",borderLeft:tab===t.id?"2px solid #A8C89A":"2px solid transparent",fontFamily:"system-ui,sans-serif",textAlign:"left",width:"100%"}}>{t.label}</button>)}
          <div style={{padding:"14px 18px 5px",fontSize:9,textTransform:"uppercase",letterSpacing:".12em",color:"rgba(240,244,238,.38)",fontWeight:500}}>Mi empresa</div>
          {tabs.slice(3,9).map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 18px",fontSize:12,color:tab===t.id?MUSGO_TEXT:"rgba(240,244,238,.6)",cursor:"pointer",border:"none",background:tab===t.id?"rgba(255,255,255,.12)":"none",borderLeft:tab===t.id?"2px solid #A8C89A":"2px solid transparent",fontFamily:"system-ui,sans-serif",textAlign:"left",width:"100%"}}>{t.label}</button>)}
          <div style={{padding:"14px 18px 5px",fontSize:9,textTransform:"uppercase",letterSpacing:".12em",color:"rgba(240,244,238,.38)",fontWeight:500}}>Despacho</div>
          {tabs.slice(9).map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 18px",fontSize:12,color:tab===t.id?MUSGO_TEXT:"rgba(240,244,238,.6)",cursor:"pointer",border:"none",background:tab===t.id?"rgba(255,255,255,.12)":"none",borderLeft:tab===t.id?"2px solid #A8C89A":"2px solid transparent",fontFamily:"system-ui,sans-serif",textAlign:"left",width:"100%"}}>{t.label}</button>)}
          {(clientEfectivo.modulos||[]).filter(id=>{const m=MODULOS_CATALOG.find(x=>x.id===id);return m&&m.tier>0&&tienePermiso("modulo",id);}).length>0&&<>
            <div style={{padding:"14px 18px 5px",fontSize:9,textTransform:"uppercase",letterSpacing:".12em",color:"rgba(240,244,238,.38)",fontWeight:500}}>Módulos activos</div>
            {(clientEfectivo.modulos||[]).filter(id=>{const m=MODULOS_CATALOG.find(x=>x.id===id);return m&&m.tier>0&&tienePermiso("modulo",id);}).map(id=>{
              const m=MODULOS_CATALOG.find(x=>x.id===id);
              if(!m)return null;
              const tc=TIER_COLORS[m.tier];
              return <button key={id} onClick={()=>setTab("mod_"+id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 18px",fontSize:12,color:tab==="mod_"+id?MUSGO_TEXT:"rgba(240,244,238,.6)",cursor:"pointer",border:"none",background:tab==="mod_"+id?"rgba(255,255,255,.12)":"none",borderLeft:tab==="mod_"+id?"2px solid "+tc.color:"2px solid transparent",fontFamily:"system-ui,sans-serif",textAlign:"left",width:"100%",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                <span style={{fontSize:9,padding:"1px 4px",borderRadius:2,background:"rgba(255,255,255,.12)",color:"rgba(255,255,255,.5)",flexShrink:0}}>{id}</span>
                <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{m.nombre}</span>
              </button>;
            })}
          </>}
          <div style={{marginTop:"auto",padding:"16px 18px",borderTop:"1px solid rgba(255,255,255,.1)"}}>
            <button style={{width:"100%",background:"rgba(0,0,0,.15)",border:"none",borderRadius:8,padding:"10px 12px",textAlign:"left",cursor:"pointer"}} onClick={onLogout}>
              <div style={{fontSize:9,color:"rgba(240,244,238,.38)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:3}}>Sesión activa</div>
              <div style={{fontSize:11,color:MUSGO_TEXT,fontWeight:500}}>Cerrar sesión</div>
            </button>
            <div style={{fontSize:9,color:"rgba(255,255,255,.2)",fontFamily:"system-ui,sans-serif",marginTop:8,textAlign:"center"}}>Powered by M&M Abogados</div>
          </div>
        </div>
        {/* MAIN AREA */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* TOPBAR */}
          <div style={{background:CARD_BG,borderBottom:"1px solid "+BORDER,padding:"0 24px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><button style={{background:"none",border:"none",cursor:"pointer",padding:"4px 6px",fontSize:18,color:TEXT_MED,lineHeight:1}} onClick={()=>setSidebarOpen(!sidebarOpen)}>{sidebarOpen?"←":"☰"}</button><div style={{fontSize:14,fontWeight:600,color:TEXT_DARK,fontFamily:"system-ui,sans-serif"}}>{tabs.find(t=>t.id===tab)?.label||"Mi empresa"}</div></div>
            <div style={{display:"flex",gap:8}}>
              {!isClientUser&&<button style={{...s.btn,...s.btnSm,borderColor:BORDER,color:TEXT_MED}} onClick={()=>generatePDF(client,areas,documents,pendingDocs)}>↓ PDF</button>}
              <button style={{width:32,height:32,borderRadius:"50%",border:"1px solid "+BORDER,background:"none",cursor:"pointer",fontSize:15,color:TEXT_MED,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600}} onClick={()=>setShowFAQ(true)}>?</button>
              <NotifBell clientId={client.id}/>
            </div>
          </div>
          {/* CONTENT */}
          {sociedades.length>0&&!isClientUser&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",background:"#F5F2ED",borderBottom:"1px solid #DDE4D8",flexShrink:0,flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap"}}>Vista:</span>
            <button onClick={()=>setSociedadActiva(null)} style={{fontSize:11,padding:"4px 12px",borderRadius:3,border:"1.5px solid "+(sociedadActiva===null?"#4A5C45":"#DDE4D8"),background:sociedadActiva===null?"#4A5C45":"none",color:sociedadActiva===null?"#F0F4EE":"#1E2B1A",cursor:"pointer",fontFamily:"system-ui,sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>Grupo</button>
            {sociedades.map(soc=>(
              <button key={soc.id} onClick={()=>setSociedadActiva(soc)} style={{fontSize:11,padding:"4px 12px",borderRadius:3,border:"1.5px solid "+(sociedadActiva?.id===soc.id?"#4A5C45":"#DDE4D8"),background:sociedadActiva?.id===soc.id?"#4A5C45":"none",color:sociedadActiva?.id===soc.id?"#F0F4EE":"#1E2B1A",cursor:"pointer",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap"}}>
                {soc.nombre}
              </button>
            ))}
            {sociedadActiva?.rfc&&<span style={{fontSize:10,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginLeft:4}}>RFC: {sociedadActiva.rfc}</span>}
          </div>}
          <div style={{flex:1,overflowY:"auto",padding:"24px",boxSizing:"border-box"}}>

      {tab==="panel"&&<ClientDashboard client={clientEfectivo} onNavigate={t=>setTab(t)}/>}

      {tab==="poderes"&&<>
        {Object.keys(poderesPorPersona).length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin poderes registrados</div>
        :Object.entries(poderesPorPersona).map(([persona,docs])=>(
          <div key={persona} style={{marginBottom:20}}>
            <span style={s.label}>{persona}</span>
            <div style={s.card}>{docs.map(doc=><div key={doc.id} style={s.row}><span style={s.dot(doc.status)}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{DOC_TYPES.find(t=>t.id===doc.type)?.label||doc.type}</div><div style={s.muted}>{doc.date}</div></div><Badge status={doc.status} label={doc.status}/>{doc.drive_url?<button style={{...s.btnGold,...s.btnSm,marginLeft:8}} onClick={()=>window.open(doc.drive_url,"_blank")}>Abrir ↗</button>:<span style={{...s.muted,marginLeft:8,fontSize:11}}>Sin archivo</span>}</div>)}</div>
          </div>
        ))}
        <div style={{textAlign:"right",marginTop:8}}><button style={s.btnPrimary} onClick={()=>setShowReq(true)}>+ Solicitar poder</button></div>
      </>}

      {tab==="docs"&&<>
        <div style={{...s.flex(6),flexWrap:"wrap",marginBottom:16}}>
          {Object.entries(CAT_LABELS).map(([cat,label])=><button key={cat} style={docCat===cat?{...s.btnPrimary,...s.btnSm}:{...s.btn,...s.btnSm}} onClick={()=>setDocCat(cat)}>{label}</button>)}
        </div>
        <div style={s.card}>
          {catDocs.length===0?<div style={{...s.muted,textAlign:"center",padding:"1.5rem 0"}}>Sin documentos en esta categoría</div>
          :catDocs.map(doc=><div key={doc.id} style={s.row}><span style={s.dot(doc.status)}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{doc.name}</div><div style={s.muted}>{doc.person?doc.person+" · ":""}{doc.date}</div></div><Badge status={doc.status} label={doc.status}/>{doc.drive_url?<button style={{...s.btnGold,...s.btnSm,marginLeft:8}} onClick={()=>setViewingDoc({url:doc.drive_url,name:doc.name})}>Ver</button>:<span style={{...s.muted,marginLeft:8,fontSize:11}}>Sin archivo</span>}</div>)}
        </div>
        <div style={{textAlign:"right",marginTop:16}}><button style={s.btnPrimary} onClick={()=>setShowReq(true)}>+ Solicitar documento</button></div>
      </>}

      {tab==="asambleas"&&<AsambleasTab client={clientEfectivo} isAdmin={false}/>}

      {tab==="pendientes"&&(pendingDocs.length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin pendientes</div>
        :pendingDocs.map(p=><div key={p.id} style={{...s.card,borderLeft:"3px solid "+GOLD}}><div style={{...s.flex(),justifyContent:"space-between",alignItems:"flex-start"}}><div style={{fontSize:14,fontFamily:"Georgia, serif"}}>{p.name}</div><Badge status="pendiente" label={`Vence: {p.due}`}/></div><div style={{...s.muted,marginTop:6}}>{p.note}</div></div>)
      )}

      {tab==="solicitudes"&&<>
        <div style={{...s.flex(),justifyContent:"space-between",marginBottom:16}}>
          <span style={{...s.label,margin:0}}>Lo que he pedido al despacho</span>
          <button style={s.btnPrimary} onClick={()=>setShowReq(true)}>+ Pedir algo al despacho</button>
        </div>
        {requests.length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Aún no has pedido nada - estamos aquí</div>
        :requests.map(r=><div key={r.id} style={s.card}><div style={s.flex()}><div style={{flex:1}}><div style={{fontSize:14,fontFamily:"Georgia, serif"}}>{r.label}</div><div style={s.muted}>{r.date}{r.notes?" · "+r.notes:""}</div></div><Badge status={r.status} label={{pendiente:"En revisión",completado:"Completado"}[r.status]||r.status}/></div></div>)}
      </>}

      {tab==="riesgos"&&<ConsecuenciasTab client={clientEfectivo} isAdmin={false} onNavigate={t=>setTab(t)}/>}
      {tab==="compliance"&&<CompliancePanel client={clientEfectivo} onNavigate={t=>setTab(t)}/>}
      {tab==="regulatorio"&&<PerfilRegulatorioTab client={clientEfectivo} isAdmin={false}/>}
      {tab==="marca"&&<BrandingTab client={clientEfectivo} onBrandingUpdate={b=>setBranding&&setBranding(b)}/>}
      {tab==="personas"&&<PersonasTab client={clientEfectivo} isAdmin={false}/>}
      {tab==="contratos"&&<ContratosClientTab client={clientEfectivo}/>}
      {tab==="historial"&&<HistorialClientTab client={clientEfectivo}/>}
      {tab==="resumen"&&<ResumenClientTab client={clientEfectivo}/>}
      {showOnboarding&&<OnboardingScreen client={client} onComplete={()=>{setShowOnboarding(false);}}/>}
      {tab&&tab.startsWith("mod_")&&<ModuloView modId={tab.replace("mod_","")} client={clientEfectivo}/>}
      {tab==="calendario"&&<CalendarioVencimientos client={clientEfectivo}/>}
      {tab==="usuarios_internos"&&<GestorUsuariosInternos client={clientEfectivo} isAdmin={false}/>}
      {tab==="notificaciones"&&<GestorNotificaciones client={clientEfectivo} isAdmin={false}/>}
      {showReq&&<RequestModal client={client} onClose={()=>setShowReq(false)} onSubmit={submitRequest}/>}
      {showFAQ&&<FAQModal onClose={()=>setShowFAQ(false)}/>}
      {viewingDoc&&<DocViewerModal url={viewingDoc.url} name={viewingDoc.name} onClose={()=>setViewingDoc(null)}/>}
          </div>
        </div>
      </div>
  );
}


function AdminView({onLogout,admin}){
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [clients,setClients]=useState([]);const [admins,setAdmins]=useState([]);
  const [sel,setSel]=useState(null);const [tab,setTab]=useState("panel");
  const [adminSociedades,setAdminSociedades]=useState([]);
  const [adminSocActiva,setAdminSocActiva]=useState(null);
  const [viewingDocAdmin,setViewingDocAdmin]=useState(null);
  const [areas,setAreas]=useState([]);const [documents,setDocuments]=useState([]);
  const [pendingDocs,setPendingDocs]=useState([]);const [requests,setRequests]=useState([]);
  const [editing,setEditing]=useState(null);const [loading,setLoading]=useState(true);
  const [saved,setSaved]=useState(false);const [showAddClient,setShowAddClient]=useState(false);
  const [showAddDoc,setShowAddDoc]=useState(false);const [showAddPending,setShowAddPending]=useState(false);
  const [newClient,setNewClient]=useState({id:"",name:"",contact:"",email:"",password:"",industria:"general"});
  const [newDoc,setNewDoc]=useState({type:"",name:"",person:"",date:"",status:"vigente",drive_url:""});
  const [newPending,setNewPending]=useState({name:"",due:"",note:""});

  useEffect(()=>{
    async function load(){
      const [c,a]=await Promise.all([supabase.from("clients").select("*"),supabase.from("admins").select("*")]);
      const firstClient = c.data?.[0];
      setClients(c.data||[]);setAdmins(a.data||[]);
      if(firstClient){
        setSel(firstClient.id);
        supabase.from("sociedades").select("*").eq("client_id",firstClient.id).order("created_at").then(({data:s})=>{console.log("Sociedades iniciales:",s);setAdminSociedades(s||[]);});
      }
      setLoading(false);
    }
    load();
  },[]);

  useEffect(()=>{
    if(!sel)return;
    setAdminSocActiva(null);
    supabase.from("sociedades").select("*").eq("client_id",sel).order("created_at").then(({data:s})=>{console.log("Sociedades admin:",s);setAdminSociedades(s||[]);});
  },[sel]);

  useEffect(()=>{
    if(!sel)return;
    async function load(){
      const socId = adminSocActiva?.id || null;
      const [a,d,p,r]=await Promise.all([
        socId ? supabase.from("areas").select("*").eq("client_id",sel).eq("sociedad_id",socId) : supabase.from("areas").select("*").eq("client_id",sel).is("sociedad_id",null),
        socId ? supabase.from("documents").select("*").eq("client_id",sel).eq("sociedad_id",socId) : supabase.from("documents").select("*").eq("client_id",sel).is("sociedad_id",null),
        socId ? supabase.from("pending_docs").select("*").eq("client_id",sel).eq("sociedad_id",socId) : supabase.from("pending_docs").select("*").eq("client_id",sel).is("sociedad_id",null),
        socId ? supabase.from("requests").select("*").eq("client_id",sel).eq("sociedad_id",socId) : supabase.from("requests").select("*").eq("client_id",sel).is("sociedad_id",null),
      ]);
      setAreas(a.data||[]);setDocuments(d.data||[]);setPendingDocs(p.data||[]);setRequests(r.data||[]);
    }
    load();
  },[sel,adminSocActiva?.id]);

  const client=sel ? {...(clients.find(c=>c.id===sel)||{}), _sociedad: adminSocActiva, _adminNombre: admin?.nombre||admin?.username||"Despacho M&M"} : null;

  async function updateArea(areaId,field,val){
    const prevArea=areas.find(a=>a.id===areaId);
    setAreas(prev=>prev.map(a=>a.id===areaId?{...a,[field]:val}:a));
    await supabase.from("areas").update({[field]:val}).eq("id",areaId);
    if(field==="status"&&prevArea&&prevArea.status!==val){
      await supabase.from("historial").insert({id:"h"+Date.now(),client_id:sel,area_name:prevArea.name,status_anterior:prevArea.status,status_nuevo:val,nota:"",admin_name:admin?.name||"Despacho",created_at:new Date().toISOString()});
    }
    setSaved(true);setTimeout(()=>setSaved(false),2000);
  }
  async function publishDraftAreas(){
    await supabase.from("areas").update({draft:false,sub:"Validado por M&M Abogados"}).eq("client_id",sel).eq("draft",true);
    setAreas(prev=>prev.map(a=>({...a,draft:false,sub:"Validado por M&M Abogados"})));
    setSaved(true);setTimeout(()=>setSaved(false),2000);
  }
  async function addDoc(){
    if(!newDoc.type||!newDoc.name)return;
    const doc={id:"d"+Date.now(),client_id:sel,sociedad_id:adminSocActiva?.id||null,...newDoc};
    await supabase.from("documents").insert(doc);setDocuments(prev=>[...prev,doc]);
    setShowAddDoc(false);setNewDoc({type:"",name:"",person:"",date:"",status:"vigente",drive_url:""});
  }
  async function removeDoc(docId){await supabase.from("documents").delete().eq("id",docId);setDocuments(prev=>prev.filter(d=>d.id!==docId));}
  async function addPending(){
    if(!newPending.name)return;
    const p={id:"p"+Date.now(),client_id:sel,...newPending};
    await supabase.from("pending_docs").insert(p);setPendingDocs(prev=>[...prev,p]);
    setShowAddPending(false);setNewPending({name:"",due:"",note:""});
  }
  async function removePending(pid){await supabase.from("pending_docs").delete().eq("id",pid);setPendingDocs(prev=>prev.filter(p=>p.id!==pid));}
  async function resolveRequest(rid){await supabase.from("requests").update({status:"completado"}).eq("id",rid);setRequests(prev=>prev.map(r=>r.id===rid?{...r,status:"completado"}:r));}
  async function addClient(){
    if(!newClient.id||!newClient.name||!newClient.password)return;
    const nc={...newClient,industria:newClient.industria||"general",updated_at:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})};
    await supabase.from("clients").insert(nc);
    const da=[
      {id:"a1_"+newClient.id,client_id:newClient.id,name:"Estructura societaria",sub:"Pendiente de diagnóstico",status:"amber"},
      {id:"a2_"+newClient.id,client_id:newClient.id,name:"Actas de asamblea",sub:"Pendiente de diagnóstico",status:"amber"},
      {id:"a3_"+newClient.id,client_id:newClient.id,name:"Poderes notariales",sub:"Pendiente de diagnóstico",status:"amber"},
      {id:"a4_"+newClient.id,client_id:newClient.id,name:"Contratos activos",sub:"Pendiente de diagnóstico",status:"amber"},
      {id:"a5_"+newClient.id,client_id:newClient.id,name:"Arrendamientos",sub:"Pendiente de diagnóstico",status:"amber"},
      {id:"a6_"+newClient.id,client_id:newClient.id,name:"Compromisos con M&M",sub:"En proceso",status:"green"},
    ];
    await supabase.from("areas").insert(da);
    setClients(prev=>[...prev,nc]);setSel(newClient.id);setShowAddClient(false);
    setNewClient({id:"",name:"",contact:"",email:"",password:""});
  }

  const hasDrafts=areas.some(a=>a.draft);
  const pendingReqs=requests.filter(r=>r.status==="pendiente").length;
  const tareas_pendientes=0;
  const tabs=[{id:"dashboard",label:"Dashboard"},{id:"panel",label:"Estado del cliente"},{id:"riesgos",label:"🚨 Alertas críticas"},{id:"compliance",label:"Estado corporativo"},{id:"regulatorio",label:"Ante autoridades"},{id:"personas",label:"Equipo directivo"},{id:"docs",label:"Documentos"},{id:"contratos",label:"Contratos"},{id:"estatutos",label:"Análisis estatutos"},{id:"pagos",label:"Facturación"},{id:"tareas",label:`Tareas${tareas_pendientes>0?" · "+tareas_pendientes:""}`},{id:"resumen",label:"Novedades"},{id:"asambleas",label:"Asambleas"},{id:"pendientes",label:"Pendientes"},{id:"solicitudes",label:`Solicitudes${pendingReqs>0?" · "+pendingReqs:""}`},{id:"usuarios",label:"Usuarios"},{id:"modulos",label:"Módulos"},{id:"calendario",label:"📅 Calendario"},{id:"usuarios_internos_admin",label:"👥 Usuarios internos"},{id:"notificaciones_admin",label:"🔔 Notificaciones"}];

  if(loading)return <div style={s.wrap}><Spinner/></div>;

  return(
    <div style={{fontFamily:"Georgia, serif",color:BLACK,background:CREAM,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* TOP NAV */}
      {/* SIDEBAR + MAIN */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* SIDEBAR */}
        <div style={{width:sidebarOpen?204:0,background:MUSGO,borderRight:sidebarOpen?"1px solid "+MUSGO_DARK:"none",overflow:"hidden",transition:"width .2s",flexShrink:0,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
          <div style={{padding:"22px 18px 14px"}}>
            <div style={{fontSize:12,fontWeight:700,color:MUSGO_TEXT,letterSpacing:".02em"}}>M&M Abogados</div>
            <div style={{fontSize:10,color:"rgba(240,244,238,.45)",marginTop:2}}>Panel administrativo</div>
          </div>
          <div style={{height:1,background:"rgba(255,255,255,.12)",margin:"0 18px"}}/>
          {tab!=="usuarios"&&<div style={{padding:"12px 12px 8px"}}>
            <select style={{width:"100%",background:"rgba(0,0,0,.2)",border:"1px solid rgba(255,255,255,.15)",borderRadius:6,padding:"7px 10px",fontSize:11,color:MUSGO_TEXT,cursor:"pointer",fontFamily:"system-ui,sans-serif"}} value={sel||""} onChange={e=>setSel(e.target.value)}>
              {clients.map(c=><option key={c.id} value={c.id} style={{background:MUSGO,color:MUSGO_TEXT}}>{c.id} · {c.name}</option>)}
            </select>
          </div>}
          {adminSociedades.length>0&&<div style={{padding:"8px 12px"}}>
            <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:".1em",color:"rgba(240,244,238,.38)",marginBottom:6,paddingLeft:6}}>Sociedad</div>
            <button onClick={()=>setAdminSocActiva(null)} style={{display:"block",width:"100%",textAlign:"left",padding:"6px 10px",borderRadius:4,border:"1px solid "+(adminSocActiva===null?"rgba(168,200,154,.6)":"rgba(255,255,255,.1)"),background:adminSocActiva===null?"rgba(255,255,255,.12)":"none",cursor:"pointer",marginBottom:3,fontFamily:"system-ui,sans-serif",fontSize:11,color:adminSocActiva===null?"#F0F4EE":"rgba(240,244,238,.6)",fontWeight:600}}>
              Grupo
            </button>
            {adminSociedades.map(soc=>(
              <button key={soc.id} onClick={()=>setAdminSocActiva(soc)} style={{display:"block",width:"100%",textAlign:"left",padding:"6px 10px",borderRadius:4,border:"1px solid "+(adminSocActiva?.id===soc.id?"rgba(168,200,154,.6)":"rgba(255,255,255,.1)"),background:adminSocActiva?.id===soc.id?"rgba(255,255,255,.12)":"none",cursor:"pointer",marginBottom:3,fontFamily:"system-ui,sans-serif",fontSize:11,color:adminSocActiva?.id===soc.id?"#F0F4EE":"rgba(240,244,238,.6)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {soc.nombre}
              </button>
            ))}
          </div>}
          <div style={{height:1,background:"rgba(255,255,255,.08)",margin:"0 18px"}}/>
          <div style={{padding:"10px 18px 5px",fontSize:9,textTransform:"uppercase",letterSpacing:".12em",color:"rgba(240,244,238,.38)",fontWeight:500}}>Vistas</div>
          {tabs.slice(0,3).map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 18px",fontSize:12,color:tab===t.id?MUSGO_TEXT:"rgba(240,244,238,.6)",cursor:"pointer",border:"none",background:tab===t.id?"rgba(255,255,255,.12)":"none",borderLeft:tab===t.id?"2px solid #A8C89A":"2px solid transparent",fontFamily:"system-ui,sans-serif",textAlign:"left",width:"100%"}}>{t.label}</button>)}
          <div style={{padding:"10px 18px 5px",fontSize:9,textTransform:"uppercase",letterSpacing:".12em",color:"rgba(240,244,238,.38)",fontWeight:500}}>Cliente</div>
          {tabs.slice(3,11).map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 18px",fontSize:12,color:tab===t.id?MUSGO_TEXT:"rgba(240,244,238,.6)",cursor:"pointer",border:"none",background:tab===t.id?"rgba(255,255,255,.12)":"none",borderLeft:tab===t.id?"2px solid #A8C89A":"2px solid transparent",fontFamily:"system-ui,sans-serif",textAlign:"left",width:"100%"}}>{t.label}</button>)}
          <div style={{padding:"10px 18px 5px",fontSize:9,textTransform:"uppercase",letterSpacing:".12em",color:"rgba(240,244,238,.38)",fontWeight:500}}>Sistema</div>
          {tabs.slice(11).map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 18px",fontSize:12,color:tab===t.id?MUSGO_TEXT:"rgba(240,244,238,.6)",cursor:"pointer",border:"none",background:tab===t.id?"rgba(255,255,255,.12)":"none",borderLeft:tab===t.id?"2px solid #A8C89A":"2px solid transparent",fontFamily:"system-ui,sans-serif",textAlign:"left",width:"100%"}}>{t.label}</button>)}
          <div style={{marginTop:"auto",padding:"16px 18px",borderTop:"1px solid rgba(255,255,255,.1)"}}>
            <button style={{width:"100%",background:"rgba(0,0,0,.15)",border:"none",borderRadius:8,padding:"10px 12px",textAlign:"left",cursor:"pointer"}} onClick={onLogout}>
              <div style={{fontSize:9,color:"rgba(240,244,238,.38)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:3}}>Admin activo</div>
              <div style={{fontSize:11,color:MUSGO_TEXT,fontWeight:500}}>{admin?.name||"Despacho"}</div>
            </button>
          </div>
        </div>
        {/* MAIN AREA */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* TOPBAR */}
          <div style={{background:CARD_BG,borderBottom:"1px solid "+BORDER,padding:"0 24px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{fontSize:14,fontWeight:600,color:TEXT_DARK,fontFamily:"system-ui,sans-serif"}}>{tabs.find(t=>t.id===tab)?.label||"Dashboard"}</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {saved&&<span style={{fontSize:11,color:"#3A7A30",fontFamily:"system-ui,sans-serif"}}>Guardado ✓</span>}
              {client&&tab!=="usuarios"&&<><button style={{...s.btn,...s.btnSm,borderColor:BORDER,color:TEXT_MED}} onClick={()=>generatePDF(client,areas,documents,pendingDocs)}>↓ PDF</button><button style={{...s.btn,...s.btnSm,borderColor:"#C9A84C",color:"#92400E",background:"#fffbeb"}} onClick={()=>generateReporteEjecutivo(client)}>↓ Reporte ejecutivo</button></> }
              <AdminNotifBell/>
            </div>
          </div>
          {tab==="usuarios"&&<div style={{padding:"8px 16px",background:CARD_BG,borderBottom:"1px solid "+BORDER}}><button style={{...s.btn,...s.btnSm}} onClick={()=>setShowAddClient(!showAddClient)}>+ Cliente</button></div>}
          {/* CONTENT */}
          <div style={{flex:1,overflowY:"auto",padding:"24px",boxSizing:"border-box"}}>

      {showAddClient&&<div style={{...s.card,...s.col(),marginBottom:16}}>
        <span style={{...s.label,margin:0}}>Nuevo cliente</span>
        <div style={s.flex()}><input style={{...s.input,width:80}} placeholder="ID (002)" value={newClient.id} onChange={e=>setNewClient({...newClient,id:e.target.value})}/><input style={s.input} placeholder="Nombre empresa" value={newClient.name} onChange={e=>setNewClient({...newClient,name:e.target.value})}/></div>
        <div style={s.flex()}><input style={s.input} placeholder="Contacto" value={newClient.contact} onChange={e=>setNewClient({...newClient,contact:e.target.value})}/><input style={s.input} placeholder="Email" value={newClient.email} onChange={e=>setNewClient({...newClient,email:e.target.value})}/></div>
        <div style={s.flex()}>
          <select style={{...s.select,flex:1}} value={newClient.industria} onChange={e=>setNewClient({...newClient,industria:e.target.value})}>
            {Object.entries(INDUSTRIA_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={s.flex()}><input style={s.input} type="password" placeholder="Contraseña cliente" value={newClient.password} onChange={e=>setNewClient({...newClient,password:e.target.value})}/><button style={s.btnPrimary} onClick={addClient}>Crear</button></div>
      </div>}

      {/* TABS BAR */}
      <div style={{background:WHITE,borderBottom:"1px solid "+BORDER,padding:"0 1rem",display:"flex",overflowX:"auto",flexShrink:0}}>
        {tabs.map(t=><button key={t.id} style={{padding:"12px 14px",fontSize:11,cursor:"pointer",border:"none",background:"none",color:tab===t.id?BLACK:GRAY,borderBottom:tab===t.id?"2px solid "+GOLD:"2px solid transparent",fontWeight:400,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap"}} onClick={()=>setTab(t.id)}>{t.label}</button>)}
      </div>
      {/* CONTENT */}
      <div style={{flex:1,overflowY:"auto",padding:"1.5rem",maxWidth:"100%",width:"100%",boxSizing:"border-box"}}>

      {tab==="usuarios_internos_admin"&&client&&<GestorUsuariosInternos client={{...client,_sociedad:adminSocActiva}} isAdmin={true}/>}
      {tab==="notificaciones_admin"&&client&&<GestorNotificaciones client={{...client,_sociedad:adminSocActiva}} isAdmin={true}/>}
      {tab==="usuarios"&&<UsersTab clients={clients} setClients={c=>{setClients(c);if(!c.find(x=>x.id===sel))setSel(c[0]?.id||null);}} admins={admins} setAdmins={setAdmins}/>}
      {tab==="modulos"&&<AdminModulosTab clients={clients} activeClient={client} activeSociedad={adminSocActiva}/>}

      {tab==="panel"&&client&&<>
        {hasDrafts&&<div style={{...s.card,borderLeft:"3px solid "+GOLD,marginBottom:16}}><div style={{...s.flex(),justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:14,fontFamily:"Georgia, serif"}}>Resultados pendientes de revisión</div><div style={{...s.muted,marginTop:4}}>El cliente completó el diagnóstico. Revisa y publica.</div></div><button style={s.btnGold} onClick={publishDraftAreas}>Publicar →</button></div></div>}
        <div style={s.col()}>{areas.map(area=>(
          <div key={area.id} style={{...s.card,borderLeft:"3px solid "+STATUS_COLORS[area.status]}}>
            {editing===area.id
            ?<div style={s.col()}>
              <input style={s.input} value={area.name} onChange={e=>setAreas(prev=>prev.map(a=>a.id===area.id?{...a,name:e.target.value}:a))} onBlur={e=>updateArea(area.id,"name",e.target.value)}/>
              <input style={s.input} value={area.sub} onChange={e=>setAreas(prev=>prev.map(a=>a.id===area.id?{...a,sub:e.target.value}:a))} onBlur={e=>updateArea(area.id,"sub",e.target.value)}/>
              <textarea style={{width:"100%",border:"1px solid #E2DDD6",borderRadius:2,padding:"9px 12px",fontSize:13,outline:"none",boxSizing:"border-box",background:"#FFFFFF",fontFamily:"system-ui, sans-serif",resize:"vertical"}} rows={2} placeholder="Nota visible para el cliente (opcional)" value={area.nota||""} onChange={e=>setAreas(prev=>prev.map(a=>a.id===area.id?{...a,nota:e.target.value}:a))} onBlur={e=>updateArea(area.id,"nota",e.target.value)}/>
              <div style={s.flex()}>
                <select style={{...s.select,flex:1}} value={area.status} onChange={e=>updateArea(area.id,"status",e.target.value)}>
                  {["red","amber","green"].map(st=><option key={st} value={st}>{({red:"Atención urgente",amber:"Revisar",green:"En orden"})[st]}</option>)}
                </select>
                <button style={s.btnPrimary} onClick={()=>setEditing(null)}>Listo</button>
              </div>
            </div>
            :<div style={{...s.flex(),cursor:"pointer"}} onClick={()=>setEditing(area.id)}>
              <div style={{flex:1}}><div style={{fontSize:14,fontFamily:"Georgia, serif"}}>{area.name}</div><div style={s.muted}>{area.sub}{area.draft&&<span style={{...s.badge("amber"),marginLeft:8}}>Borrador</span>}</div></div>
              <Badge status={area.status}/><span style={{fontSize:11,color:GRAY,marginLeft:8}}>✎</span>
            </div>}
          </div>
        ))}</div>
      </>}

      {tab==="docs"&&client&&<>
        <div style={{...s.flex(),justifyContent:"space-between",marginBottom:16}}>
          <span style={{...s.label,margin:0}}>{documents.length} documentos</span>
          <button style={s.btnPrimary} onClick={()=>setShowAddDoc(!showAddDoc)}>+ Documento</button>
        </div>
        {showAddDoc&&<div style={{...s.card,...s.col(),marginBottom:16}}>
          <select style={s.select} value={newDoc.type} onChange={e=>{const dt=DOC_TYPES.find(d=>d.id===e.target.value);setNewDoc({...newDoc,type:e.target.value,name:dt?.label||""});}}>
            <option value="">Tipo de documento...</option>
            {Object.entries(CAT_LABELS).map(([cat,cl])=><optgroup key={cat} label={cl}>{DOC_TYPES.filter(d=>d.cat===cat).map(d=><option key={d.id} value={d.id}>{d.label}</option>)}</optgroup>)}
          </select>
          <input style={s.input} placeholder="Nombre del documento" value={newDoc.name} onChange={e=>setNewDoc({...newDoc,name:e.target.value})}/>
          <div style={s.flex()}><input style={s.input} placeholder="Persona (si aplica)" value={newDoc.person} onChange={e=>setNewDoc({...newDoc,person:e.target.value})}/><input style={s.input} type="date" value={newDoc.date} onChange={e=>setNewDoc({...newDoc,date:e.target.value})}/></div>
          <select style={s.select} value={newDoc.status} onChange={e=>setNewDoc({...newDoc,status:e.target.value})}>
            {["vigente","por renovar","vencido"].map(st=><option key={st} value={st}>{st}</option>)}
          </select>
          <div style={s.col(4)}><span style={{...s.muted,fontSize:11}}>Link Google Drive</span><input style={s.input} placeholder="https://drive.google.com/file/d/..." value={newDoc.drive_url} onChange={e=>setNewDoc({...newDoc,drive_url:e.target.value})}/></div>
          <button style={{...s.btnPrimary,alignSelf:"flex-start"}} onClick={addDoc}>Agregar</button>
        </div>}
        {Object.entries(CAT_LABELS).map(([cat,catLabel])=>{
          const docs=documents.filter(d=>DOC_TYPES.find(t=>t.id===d.type)?.cat===cat);if(!docs.length)return null;
          return <div key={cat} style={{marginBottom:16}}><span style={s.label}>{catLabel}</span><div style={s.card}>{docs.map(doc=><div key={doc.id} style={s.row}><span style={s.dot(doc.status)}/><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{doc.name}</div><div style={s.muted}>{doc.person?doc.person+" · ":""}{doc.date}</div></div><Badge status={doc.status}/>{doc.drive_url&&<button style={{...s.btnGold,...s.btnSm,marginLeft:8}} onClick={()=>setViewingDocAdmin({url:doc.drive_url,name:doc.name})}>Ver</button>}<button style={{...s.btnDanger,marginLeft:4}} onClick={()=>removeDoc(doc.id)}>×</button></div>)}</div></div>;
        })}
      </>}

      {viewingDocAdmin&&<DocViewerModal url={viewingDocAdmin.url} name={viewingDocAdmin.name} onClose={()=>setViewingDocAdmin(null)}/>}
      {tab==="dashboard"&&<AdminDashboard clients={clients} onSelectClient={id=>{setSel(id);setTab("panel");}}/>}
      {tab==="riesgos"&&client&&<AdminAlertasCriticas client={{...client,_sociedad:adminSocActiva}}/>}
      {tab==="compliance"&&client&&<AdminComplianceGeneral client={{...client,_sociedad:adminSocActiva}}/>}
      {tab==="calendario"&&<CalendarioVencimientos client={clientEfectivo}/>}
      {tab==="regulatorio"&&client&&<PerfilRegulatorioTab client={{...client,_sociedad:adminSocActiva}} isAdmin={true}/>}
      {tab==="personas"&&client&&<PersonasTab client={{...client,_sociedad:adminSocActiva}} isAdmin={true}/>}
      {tab==="contratos"&&client&&<AdminContratosTab key={adminSocActiva?.id||"grupo"} client={{...client,_sociedad:adminSocActiva}}/>}
      {tab==="estatutos"&&client&&<AdminEstatutosTab client={client}/>}
      {tab==="pagos"&&client&&<AdminPagosTab client={client}/>}
      {tab==="tareas"&&client&&<AdminTareasTab client={client} admin={admin}/>}
      {tab==="resumen"&&client&&<AdminResumenTab client={client}/>}
      {tab==="asambleas"&&client&&<AsambleasTab client={{...client,_sociedad:adminSocActiva}} isAdmin={true}/>}

      {tab==="pendientes"&&client&&<>
        <div style={{...s.flex(),justifyContent:"space-between",marginBottom:16}}>
          <span style={{...s.label,margin:0}}>Pendientes del cliente</span>
          <button style={s.btnPrimary} onClick={()=>setShowAddPending(!showAddPending)}>+ Pendiente</button>
        </div>
        {showAddPending&&<div style={{...s.card,...s.col(),marginBottom:16}}>
          <input style={s.input} placeholder="Nombre del documento" value={newPending.name} onChange={e=>setNewPending({...newPending,name:e.target.value})}/>
          <div style={s.flex()}><input style={s.input} placeholder="Fecha límite" value={newPending.due} onChange={e=>setNewPending({...newPending,due:e.target.value})}/><input style={s.input} placeholder="Nota" value={newPending.note} onChange={e=>setNewPending({...newPending,note:e.target.value})}/></div>
          <button style={{...s.btnPrimary,alignSelf:"flex-start"}} onClick={addPending}>Agregar</button>
        </div>}
        {pendingDocs.length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin pendientes</div>
        :pendingDocs.map(p=><div key={p.id} style={{...s.card,...s.flex(),borderLeft:"3px solid "+GOLD,alignItems:"flex-start"}}><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{p.name}</div><div style={s.muted}>{p.due?"Vence: "+p.due+" · ":""}{p.note}</div></div><button style={s.btnDanger} onClick={()=>removePending(p.id)}>×</button></div>)}
      </>}

      {tab==="solicitudes"&&client&&<>
        <span style={s.label}>Solicitudes recibidas</span>
        {requests.length===0?<div style={{...s.muted,textAlign:"center",padding:"3rem 0"}}>Sin solicitudes</div>
        :requests.map(r=><div key={r.id} style={{...s.card,...s.flex(),alignItems:"flex-start"}}><div style={{flex:1}}><div style={{fontSize:13,fontFamily:"Georgia, serif"}}>{r.label}</div><div style={s.muted}>{r.date}{r.notes?" · "+r.notes:""}</div></div>{r.status==="pendiente"?<button style={s.btnPrimary} onClick={()=>resolveRequest(r.id)}>Marcar como listo</button>:<Badge status="green" label="Completado"/>}</div>)}
      </>}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

function Login({onLogin}){
  const [who,setWho]=useState("client");const [user,setUser]=useState("");
  const [pass,setPass]=useState("");const [err,setErr]=useState("");const [loading,setLoading]=useState(false);
  const [otpStep,setOtpStep]=useState(false);
  const [otp,setOtp]=useState("");
  const [pendingSession,setPendingSession]=useState(null);
  const [otpEmail,setOtpEmail]=useState("");

  async function attempt(){
    setErr("");setLoading(true);
    if(who==="admin"){
      const {data}=await supabase.from("admins").select("*").eq("id",user.toLowerCase()).single();
      if(!data||data.password!==pass){setErr("Usuario o contraseña incorrectos");setLoading(false);return;}
      // Admin no requiere OTP
      onLogin({role:"admin",admin:data});return;
    }
    if(!user){setErr("Ingresa tu usuario");setLoading(false);return;}
    // Buscar en client_users por email
    const {data:cu}=await supabase.from("client_users").select("*").eq("email",user).eq("activo",true).maybeSingle();
    if(cu){
      if(pass!==cu.password){setErr("Contraseña incorrecta");setLoading(false);return;}
      const {data:cl}=await supabase.from("clients").select("*").eq("id",cu.client_id).single();
      if(!cl){setErr("Cliente no encontrado");setLoading(false);return;}
      // Enviar OTP
      await sendOTP(cu.email, cu.nombre);
      setPendingSession({role:"client_user",client:{...cl,modulos:cu.modulos||[]},clientUser:cu});
      setOtpEmail(cu.email);setOtpStep(true);setLoading(false);return;
    }
    // Buscar en clients por ID
    const {data}=await supabase.from("clients").select("*").eq("id",user).single();
    if(!data){setErr("Usuario no encontrado");setLoading(false);return;}
    if(pass===data.password){
      // Enviar OTP
      await sendOTP(data.email||data.id, data.name);
      setPendingSession({role:"client",client:data});
      setOtpEmail(data.email||"");setOtpStep(true);setLoading(false);return;
    }
    setErr("Usuario o contraseña incorrectos");setLoading(false);
  }

  async function sendOTP(email, nombre){
    try{
      await supabase.functions.invoke("send-otp",{body:{email,nombre}});
    }catch(e){console.error("OTP error:",e);}
  }

  async function verifyOTP(){
    setErr("");setLoading(true);
    if(!otp||otp.length!==6){setErr("Ingresa el código de 6 dígitos");setLoading(false);return;}
    const email=otpEmail||pendingSession?.client?.email||pendingSession?.client?.id;
    const {data}=await supabase.from("otp_codes").select("*").eq("email",email).eq("code",otp).eq("used",false).gt("expires_at",new Date().toISOString()).maybeSingle();
    if(!data){setErr("Código incorrecto o expirado");setLoading(false);return;}
    await supabase.from("otp_codes").update({used:true}).eq("id",data.id);
    onLogin(pendingSession);
  }

  if(otpStep){
    return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F5F2ED"}}>
        <div style={{background:"#FAFCF8",border:"1px solid #DDE4D8",borderRadius:8,padding:"2.5rem",width:"min(420px,90vw)",textAlign:"center"}}>
          <div style={{fontSize:11,letterSpacing:".15em",textTransform:"uppercase",color:"#C9A84C",fontFamily:"system-ui,sans-serif",marginBottom:8}}>Verificación de dos pasos</div>
          <div style={{fontSize:20,fontFamily:"Georgia,serif",color:"#1E2B1A",marginBottom:8}}>Ingresa tu código</div>
          <div style={{fontSize:13,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginBottom:24}}>
            Enviamos un código de 6 dígitos a<br/>
            <strong style={{color:"#1E2B1A"}}>{otpEmail||"tu correo registrado"}</strong>
          </div>
          <input
            style={{fontSize:28,padding:"12px 16px",border:"1px solid #DDE4D8",borderRadius:6,fontFamily:"system-ui,sans-serif",textAlign:"center",letterSpacing:".4em",width:"100%",boxSizing:"border-box",marginBottom:16,background:"#F5F2ED",color:"#1E2B1A"}}
            type="text" maxLength={6} placeholder="000000"
            value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))}
            onKeyDown={e=>e.key==="Enter"&&verifyOTP()}
            autoFocus
          />
          {err&&<div style={{fontSize:12,color:"#C0392B",fontFamily:"system-ui,sans-serif",marginBottom:12}}>{err}</div>}
          <button onClick={verifyOTP} disabled={loading||otp.length!==6} style={{width:"100%",background:"#4A5C45",color:"#F0F4EE",border:"none",borderRadius:6,padding:"12px",fontSize:14,cursor:"pointer",fontFamily:"system-ui,sans-serif",marginBottom:12,opacity:(loading||otp.length!==6)?0.6:1}}>
            {loading?"Verificando...":"Verificar código"}
          </button>
          <button onClick={()=>{setOtpStep(false);setOtp("");setErr("");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#7A9070",fontFamily:"system-ui,sans-serif"}}>
            ← Volver al inicio de sesión
          </button>
          <div style={{fontSize:11,color:"#7A9070",fontFamily:"system-ui,sans-serif",marginTop:16}}>El código expira en 10 minutos</div>
        </div>
      </div>
    );
  }

  return(
    <div style={s.loginWrap}>
      {/* Left panel - brand */}
      <div style={{background:MUSGO,flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"4rem",minHeight:"100vh",backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
        <div style={{fontSize:10,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(240,244,238,.5)",fontFamily:"system-ui,sans-serif",marginBottom:32}}>Millán & Martínez Abogados</div>
        <div style={{fontSize:42,fontFamily:"Georgia, serif",fontWeight:400,color:MUSGO_TEXT,lineHeight:1.15,marginBottom:8}}>Tu empresa,</div>
        <div style={{fontSize:42,fontFamily:"Georgia, serif",fontWeight:400,color:"rgba(240,244,238,.6)",fontStyle:"italic",lineHeight:1.15,marginBottom:32}}>protegida.</div>
        <div style={{width:48,height:2,background:"rgba(240,244,238,.3)",marginBottom:32}}/>
        <div style={{fontSize:14,color:"rgba(240,244,238,.5)",fontFamily:"system-ui,sans-serif",lineHeight:1.7,maxWidth:380}}>Panel de gestión corporativa para empresas que tienen demasiado construido para dejarlo en manos equivocadas.</div>
      </div>
      {/* Right panel - login form */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:CONTENT_BG,minHeight:"100vh"}}>
      <div style={s.loginBox}>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:22,fontFamily:"Georgia, serif",fontWeight:400,color:TEXT_DARK,lineHeight:1.2,marginBottom:6}}>Acceder</div>
          <div style={{fontSize:13,color:TEXT_MED,fontFamily:"system-ui,sans-serif"}}>Ingresa tus credenciales para continuar</div>
        </div>
        <div style={{...s.flex(),marginTop:8}}>
          {["client","admin"].map(r=>(
            <button key={r} style={{...s.btn,flex:1,borderColor:who===r?BLACK:BORDER,background:who===r?BLACK:"none",color:who===r?WHITE:GRAY}} onClick={()=>{setWho(r);setErr("");setUser("");setPass("");}}>
              {r==="admin"?"Despacho":"Cliente"}
            </button>
          ))}
        </div>
        <input style={{...s.input,padding:"11px 12px",fontSize:13}} type="text" placeholder={who==="admin"?"Usuario (jesus, beto, carlos)":"Usuario (001, 002...)"} value={user} onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()}/>
        <input style={{...s.input,padding:"11px 12px",fontSize:13}} type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()}/>
        {err&&<div style={{fontSize:12,color:"#C0392B",fontFamily:"system-ui, sans-serif"}}>{err}</div>}
        <button style={{...s.btnPrimary,padding:"12px 14px",fontSize:12,letterSpacing:".12em"}} onClick={attempt} disabled={loading}>{loading?"Verificando...":"Entrar"}</button>
      </div>
      </div>
    </div>
  );
}

export default function App(){
  const [session,setSession]=useState(()=>{
    try{const s=localStorage.getItem("mm_session");return s?JSON.parse(s):null;}
    catch{return null;}
  });

  function login(s){
    try{localStorage.setItem("mm_session",JSON.stringify(s));}catch{}
    setSession(s);
  }

  function logout(){
    try{localStorage.removeItem("mm_session");}catch{}
    setSession(null);
  }

  if(!session)return <Login onLogin={login}/>;
  if(session.role==="admin")return <AdminView onLogout={logout} admin={session.admin}/>;
  return <ClientView client={session.client} onLogout={logout} clientUser={session.clientUser||null}/>;
}
