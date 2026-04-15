import { formatearDineroStr, formatearDineroStrBonito } from "utils/formatoDinero";

// PLAZO
const optionsPlazo = [
    { value: '6', label: '6 meses' },
    { value: '12', label: '12 meses' },
    { value: '24', label: '24 meses' },
    { value: '36', label: '36 meses' },
    { value: '48', label: '48 meses' },
    { value: '60', label: '60 meses' },
    { value: '0', label: 'Otro' }
];

// RENTA
const rangeRenta = [
    500_000,
    1_500_000,
    3_000_000,
    6_000_000
]
let optionsRenta = [];
for (let i = 0; i <= rangeRenta.length; i++) {
    const minRenta = i === 0 ? null : rangeRenta[i-1];
    const maxRenta = i === rangeRenta.length ? null : rangeRenta[i];
    if (minRenta === null) {
        optionsRenta.push({
            value: `${formatearDineroStr(maxRenta)}`,
            label: `Hasta ${formatearDineroStrBonito(maxRenta)}`
        });
        continue;
    }
    if (maxRenta === null) {
        optionsRenta.push({
            value: `${formatearDineroStr(minRenta)}`,
            label: `Mas de ${formatearDineroStrBonito(minRenta)}`
        });
        continue;
    }
    optionsRenta.push({
        value: `${formatearDineroStr((maxRenta + minRenta) / 2)}`,
        label: `Desde ${formatearDineroStrBonito(minRenta)} hasta ${formatearDineroStrBonito(maxRenta)}`
    });
}
optionsRenta.push({
    value: '0',
    label: "Otro"
})

export { optionsRenta, optionsPlazo };