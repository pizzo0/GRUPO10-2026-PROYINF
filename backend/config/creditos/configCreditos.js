import TABLAS_RIESGO_ESTIMADO from "./tablaRiesgoEstimado.js"
import TABLAS_TASAS_BASE from "./tablasTasasBase.js"

// CONFIG DE LOS CREDITOS

const CONFIG_CREDITOS = {
    consumo: {
        // PLAZO
        plazoMin:2,
        plazoMax:60,

        // MONTO
        montoMin:10_000,
        montoMax:100_000_000,

        // INTERES ANUAL
        interesAnualMin:0.00,
        interesAnualMax:0.50,

        // TASA/INTERES BASE

        tablaTasaBase: TABLAS_TASAS_BASE["consumo"],

        // RIESGO ESTIMADO (SIMULACION)

        // se ocupara el ajuste logistico si esta es false.
        usarTablaRiesgoEstimado: false,
        // si usarTabla es true, se usa esta.
        tablaRiesgoEstimado: TABLAS_RIESGO_ESTIMADO["consumo"],
        
        // para el uso del ajuste logistico
        ajusteLogisticoRiesgoEstimado: {
            maximo: 0.180,
            pendiente: 30,
            ratio: 0.22,
        }
    }
}

export default CONFIG_CREDITOS;