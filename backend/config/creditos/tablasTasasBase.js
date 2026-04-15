// ESTAS TABLAS TEBEN TENER LA TNM (TASA NOMINAL MENSUAL / TASA MENSUAL) !!!!!

const TABLA_TASAS_BASE_CONSUMO = [
    // Monto <= 500.000
    { montoMax: 500_000, plazoMax: 12, tasa: 0.025 },
    { montoMax: 500_000, plazoMax: 24, tasa: 0.027 },
    { montoMax: 500_000, plazoMax: 36, tasa: 0.029 },
    { montoMax: 500_000, plazoMax: 48, tasa: 0.031 },
    { montoMax: 500_000, plazoMax: Infinity, tasa: 0.033 },

    // Monto <= 1.500.000
    { montoMax: 1_500_000, plazoMax: 12, tasa: 0.020 },
    { montoMax: 1_500_000, plazoMax: 24, tasa: 0.022 },
    { montoMax: 1_500_000, plazoMax: 36, tasa: 0.024 },
    { montoMax: 1_500_000, plazoMax: 48, tasa: 0.026 },
    { montoMax: 1_500_000, plazoMax: Infinity, tasa: 0.028 },

    // Monto <= 3.000.000
    { montoMax: 3_000_000, plazoMax: 12, tasa: 0.018 },
    { montoMax: 3_000_000, plazoMax: 24, tasa: 0.020 },
    { montoMax: 3_000_000, plazoMax: 36, tasa: 0.022 },
    { montoMax: 3_000_000, plazoMax: 48, tasa: 0.024 },
    { montoMax: 3_000_000, plazoMax: Infinity, tasa: 0.026 },

    // Monto <= 6.000.000
    { montoMax: 6_000_000, plazoMax: 12, tasa: 0.015 },
    { montoMax: 6_000_000, plazoMax: 24, tasa: 0.017 },
    { montoMax: 6_000_000, plazoMax: 36, tasa: 0.019 },
    { montoMax: 6_000_000, plazoMax: 48, tasa: 0.021 },
    { montoMax: 6_000_000, plazoMax: Infinity, tasa: 0.023 },

    // Monto > 6.000.000 (Infinity)
    { montoMax: Infinity, plazoMax: 12, tasa: 0.013 },
    { montoMax: Infinity, plazoMax: 24, tasa: 0.015 },
    { montoMax: Infinity, plazoMax: 36, tasa: 0.017 },
    { montoMax: Infinity, plazoMax: 48, tasa: 0.019 },
    { montoMax: Infinity, plazoMax: Infinity, tasa: 0.021 },
];

const TABLAS_TASAS_BASE = {
    "consumo": TABLA_TASAS_BASE_CONSUMO,
}

// esto es para ordenar la tabla si es que no esta ordenada :)
Object.keys(TABLAS_TASAS_BASE).forEach(tipo => {
    TABLAS_TASAS_BASE[tipo].sort((a,b) => {
        if (a.montoMax !== b.montoMax) return a.montoMax - b.montoMax;
        return a.plazoMax - b.plazoMax;
    });
});

export default TABLAS_TASAS_BASE;