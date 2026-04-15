// EL AJUSTE DEBE SER PARA LA TNM BASE !!!!!
// ESTO ES SOLO PARA ESTIMACION (SIMULACION)
// a no ser :v

const TABLA_RIESGO_ESTIMADO_CONSUMO = [
    { rangoMax: 0.07, ajuste: 0.0000 },         // muy bajo, perfecto!
    { rangoMax: 0.10, ajuste: 0.0015 },         // bajo
    { rangoMax: 0.15, ajuste: 0.0030 },         // medio bajo
    { rangoMax: 0.20, ajuste: 0.0060 },         // medio
    { rangoMax: 0.25, ajuste: 0.0100 },         // medio alto
    { rangoMax: 0.30, ajuste: 0.0150 },         // alto
    { rangoMax: 0.40, ajuste: 0.0200 },         // muy alto
    { rangoMax: 0.50, ajuste: 0.0300 },         // critico
    { rangoMax: Infinity, ajuste: 0.0400 },     // demasiado riesgo
];

const TABLAS_RIESGO_ESTIMADO = {
    "consumo": TABLA_RIESGO_ESTIMADO_CONSUMO,
}

// por si estan desordenadas
Object.keys(TABLAS_RIESGO_ESTIMADO).forEach(tipo => TABLAS_RIESGO_ESTIMADO[tipo].sort((a,b) => a.rangoMax - b.rangoMax));

export default TABLAS_RIESGO_ESTIMADO;