import { db } from "../utils/db.js";
import { validarRut } from "../utils/validarInfo.js";
import { calcularCreditoSimulado, calcularRecomendacionesCreditoSimulado } from "../utils/calcularInfo.js";

const cleanNumber = (value) => Number(value.toString().replace(/,/g, "").trim());

export const simulacionController = async (req,res) => {
    try {
        let { rut, renta, monto, plazo, primer_pago } = req.body;

        const tipo = "consumo"; // hardcodeado por ahora, o para siempre no se xd
        rut = rut ? rut.trim() : "";
        renta = renta ? cleanNumber(renta) : 0;
        monto = monto ? cleanNumber(monto) : 0;
        plazo = plazo ? cleanNumber(plazo) : 0;
        primer_pago = primer_pago ? primer_pago.trim() : "";

        
        if (rut && !(await validarRut(rut))) return res.status(400).json({
            error: "Rut ingresado no pertenece a una persona real."
        });

        if (!renta || !monto || !plazo || !primer_pago || renta <= 0 || monto <= 0 || plazo <= 0) return res.status(400).json({
            error: `Información entregada es errónea, no es posible procesarla.
            `
        });

        let sim;
        let rec;

        try {
            sim = calcularCreditoSimulado({
                tipo,
                rut,
                monto,
                plazo,
                renta,
                primer_pago,
                body:req.body,
            });
            rec = calcularRecomendacionesCreditoSimulado({
                tipo,
                rut,
                monto,
                plazo,
                renta,
                primer_pago,
                body:req.body,
                sim,
            });
        } catch (e) {
            return res.status(500).json({
                error: `Error en la simulación: ${e.message}`
            });
        }

        return res.json({
            options: [
                sim,
                ...rec,
            ]
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: `Error con datos ingresados: ${e.message}`
        });
    }
}


export const guardarSimulacion = async (req, res) => {
    try {
        
        const { id: usuarioId, clienteId } = req.user; 
        
        
        if (!clienteId) {
            return res.status(400).json({ error: "Token incompleto (falta clienteId). Inicia sesión nuevamente." });
        }

        const { monto, plazo, cuotaMensual, cae } = req.body;

        await db.query(`
            INSERT INTO simulacion (cliente_id, monto, plazo, cuota_mensual, cae)
            VALUES ($1, $2, $3, $4, $5)
        `, [clienteId, monto, plazo, cuotaMensual, cae]);

        res.json({ message: "Simulación guardada correctamente" });
    } catch (e) {
        console.error("Error guardando:", e);
        res.status(500).json({ error: "Error al guardar la simulación: " + e.message });
    }
};


export const obtenerHistorial = async (req, res) => {
    try {
        const { clienteId } = req.user;
        if (!clienteId) {
            return res.status(400).json({ error: "Usuario no asociado a un cliente." });
        }

        const { rows } = await db.query(`
            SELECT * FROM simulacion 
            WHERE cliente_id = $1 
            ORDER BY fecha_simulacion DESC
        `, [clienteId]);

        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error al obtener el historial" });
    }
};