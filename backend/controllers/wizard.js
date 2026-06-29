import express from "express";


import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import multer from 'multer';

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 min
const WIPE_INTERVAL_MS = 1 * 60 * 1000; // 1 min

const mem = new Map();
const globalRegistry = new Map();
const initializedDbs = new WeakSet();

setInterval(() => {
    const now = Date.now();
    for (const [id, wzd] of mem.entries()) {
        if (wzd.expiresAt < now) {
            wipeTmpFolder(id);
            mem.delete(id);
            registry.del(id);
            console.log(`[wizard][MEMORY] expirada: ${id}`);
        }
    }
}, WIPE_INTERVAL_MS);

setInterval(() => {
    const now = Date.now();
    for (const [id, meta] of globalRegistry.entries()) {
        if (meta.expiresAt < now) globalRegistry.delete(id);
    }
}, WIPE_INTERVAL_MS);

export const registry = {
    set: (id, meta) => globalRegistry.set(id, meta),
    get: (id) => globalRegistry.get(id) ?? null,
    del: (id) => globalRegistry.delete(id),
    has: (id) => globalRegistry.has(id),
};

const wipeTmpFolder = (wzdId) => {
    const dir = path.join("wizard", wzdId);
    fs.rm(dir, { recursive: true, force: true }, (err) => {
        if (err) console.error(`[wizard](wipe) ${wzdId}`, err);
    });
};

const normalizeField = (def) => {
    if (def && typeof def === "object" && "schema" in def) {
        return { schema: def.schema, readonly: def.readonly === true };
    }
    return { schema: def, readonly: false };
};

const getWritableSchemas = (fields) => {
    if (!fields) return {};
    return Object.fromEntries(
        Object.entries(fields)
            .map(([k, v]) => [k, normalizeField(v)])
            .filter(([, v]) => !v.readonly)
            .map(([k, v]) => [k, v.schema]),
    );
};

const getAllSchemas = (fields) => {
    if (!fields) return {};
    return Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, normalizeField(v).schema]),
    );
};

const deriveGlobalWritableSchemas = (steps) => {
    const merged = {};
    for (const step of steps ?? []) {
        Object.assign(merged, getWritableSchemas(step.fields));
    }
    return merged;
};

// STORE

const createMemoryStore = ({ ttlMs = DEFAULT_TTL_MS } = {}) => {
    return {
        async create({ wizardType, clientId = null, customTtlMs }) {
            const id        = randomUUID();
            const expiresAt = Date.now() + (customTtlMs ?? ttlMs);
            const entry     = { id, wizardType, clientId, formData: {}, expiresAt, createdAt: Date.now() };
            mem.set(id, entry);
            registry.set(id, { wizardType, expiresAt, clientId });
            console.log(`[wizard][MEMORY] nueva: ${id} (${wizardType})`);
            return id;
        },

        async get(id) {
            const wzd = mem.get(id);
            if (!wzd) return null;
            if (wzd.expiresAt < Date.now()) {
                wipeTmpFolder(id);
                mem.delete(id);
                registry.del(id);
                console.log(`[wizard][MEMORY] expirada al acceder: ${id}`);
                return null;
            }
            return wzd;
        },

        async update(id, { fields }) {
            const wzd = mem.get(id);
            if (!wzd) return false;
            wzd.formData = { ...wzd.formData, ...fields };
            mem.set(id, wzd);
            return true;
        },

        async delete(id) {
            wipeTmpFolder(id);
            mem.delete(id);
            registry.del(id);
            console.log(`[wizard][MEMORY] eliminada: ${id}`);
        },

        async touch(id, customTtlMs) {
            const wzd = mem.get(id);
            if (!wzd) return false;

            wzd.expiresAt = Date.now() + (customTtlMs ?? ttlMs);
            mem.set(id, wzd);

            registry.set(id, {
                wizardType: wzd.wizardType,
                clientId: wzd.clientId,
                expiresAt: wzd.expiresAt,
            });

            return wzd.expiresAt;
        },
    };
};

const createDbStore = ({ db, ttlMs = DEFAULT_TTL_MS }) => {
    if (!db) throw new Error("[wizard] createDbStore requiere un db pool/client.");

    if (!initializedDbs.has(db)) {
        initializedDbs.add(db);

        db.query(`SELECT id, wizardtype, clientid, expiresat FROM wizardtransactions`)
            .then(({ rows }) => {
                const now     = Date.now();
                const expired = rows.filter((r) => new Date(r.expiresat).getTime() < now);
                const active  = rows.filter((r) => new Date(r.expiresat).getTime() >= now);

                active.forEach((row) => {
                    registry.set(row.id, {
                        wizardType: row.wizardtype,
                        clientId:   row.clientid ?? null,
                        expiresAt:  new Date(row.expiresat).getTime(),
                    });
                });

                if (expired.length) {
                    expired.forEach((row) => wipeTmpFolder(row.id));
                    db.query(
                        `DELETE FROM wizardtransactions WHERE id = ANY($1)`,
                        [expired.map((r) => r.id)],
                    ).catch((err) => console.error("[wizard](hydrate-clean)", err));
                }

                console.log(`[wizard][DB] hidratado: ${active.length} activas, ${expired.length} expiradas eliminadas.`);
            })
            .catch((err) => console.error("[wizard](hydrate)", err));

        setInterval(async () => {
            try {
                const { rows } = await db.query(
                    `SELECT id FROM wizardtransactions WHERE expiresat < now()`,
                );
                rows.forEach((row) => {
                    wipeTmpFolder(row.id);
                    registry.del(row.id);
                    console.log(`[wizard][DB] expirada: ${row.id}`);
                });
                if (rows.length) {
                    await db.query(`DELETE FROM wizardtransactions WHERE expiresat < now()`);
                }
            } catch (err) {
                console.error("[wizard](db-clean)", err);
            }
        }, WIPE_INTERVAL_MS);
    }

    return {
        async create({ wizardType, clientId = null, customTtlMs }) {
            const expiresAt = new Date(Date.now() + (customTtlMs ?? ttlMs));
            const { rows }  = await db.query(
                `INSERT INTO wizardtransactions (wizardtype, clientid, expiresat)
                 VALUES ($1, $2, $3)
                 RETURNING id`,
                [wizardType, clientId ?? null, expiresAt],
            );
            const id = rows[0].id;
            registry.set(id, { wizardType, expiresAt: expiresAt.getTime(), clientId });
            console.log(`[wizard][DB] nueva: ${id} (${wizardType})`);
            return id;
        },

        async get(id) {
            const { rows } = await db.query(
                `SELECT * FROM wizardtransactions
                 WHERE id = $1 AND expiresat > now()`,
                [id],
            );
            if (!rows.length) {
                registry.del(id);
                return null;
            }
            const row = rows[0];
            return {
                id:         row.id,
                wizardType: row.wizardtype,
                clientId:   row.clientid ?? null,
                formData:   row.formdata ?? {},
                expiresAt:  new Date(row.expiresat).getTime(),
                createdAt:  new Date(row.createdat).getTime(),
            };
        },

        async update(id, { fields }) {
            const { rowCount } = await db.query(
                `UPDATE wizardtransactions
                 SET formdata = formdata || $2::jsonb
                 WHERE id = $1 AND expiresat > now()`,
                [id, JSON.stringify(fields ?? {})],
            );
            return rowCount > 0;
        },

        async delete(id) {
            wipeTmpFolder(id);
            registry.del(id);
            await db.query(`DELETE FROM wizardtransactions WHERE id = $1`, [id]);
            console.log(`[wizard][DB] eliminada: ${id}`);
        },

        async touch(id, customTtlMs) {
            const expiresAt = new Date(Date.now() + (customTtlMs ?? ttlMs));

            const { rowCount } = await db.query(
                `UPDATE wizardtransactions
                SET expiresat = $2
                WHERE id = $1 AND expiresat > now()`,
                [id, expiresAt],
            );

            if (rowCount > 0) {
                const meta = registry.get(id);
                if (meta) {
                    registry.set(id, {
                        ...meta,
                        expiresAt: expiresAt.getTime(),
                    });
                }
            }
            return rowCount > 0 ? expiresAt.getTime() : false;
        },
    };
};

export const createWizardStore = ({ mode = "MEMORY", db = null, ttlMs = DEFAULT_TTL_MS } = {}) => {
    if (mode === "DB")     return createDbStore({ db, ttlMs });
    if (mode === "MEMORY") return createMemoryStore({ ttlMs });
    throw new Error(`[wizard] modo inválido: "${mode}"`);
};

// MULTER
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fieldname = file.fieldname.replace(/\[\]$/, "");
        
        // CORRECCIÓN SONARCLOUD: Sanitizamos el input del usuario con path.basename()
        const safeWzdId = path.basename(req.wzdId || "default");
        const safeFieldname = path.basename(fieldname || "upload");
        
        const dir = path.join("wizard", safeWzdId, safeFieldname);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const name = Buffer.from(file.originalname, "latin1").toString("utf8");
        // CORRECCIÓN SONARCLOUD: Sanitizamos el nombre del archivo
        const safeName = path.basename(name);
        cb(null, safeName);
    },
});

// CORRECCIÓN SONARCLOUD: Se agrega un límite de 10 MB para evitar ataques DoS por saturación de memoria
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});
// VALIDATIONS

const validateKnownFields = async (writableSchemas, fields) => {
    if (!writableSchemas || !Object.keys(writableSchemas).length) return { ok: true, errors: {} };

    const errors = {};
    for (const [key, schema] of Object.entries(writableSchemas)) {
        if (!(key in fields)) continue;
        const res = await schema.safeParseAsync(fields[key]);
        if (!res.success) {
            errors[key] = res.error.issues[0]?.message ?? "Inválido";
        }
    }

    return { ok: Object.keys(errors).length === 0, errors };
};

const validateAllFields = async (schemas, data) => {
    if (!schemas || !Object.keys(schemas).length) return { ok: true, errors: {} };

    const res = await z.object(schemas).safeParseAsync(data);
    if (res.success) return { ok: true, errors: {} };

    const errors = {};
    for (const issue of res.error.issues) {
        const key = issue.path[0];
        if (key && !errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
};

// MIDDLEWARES

const resolveWizard = (wizards) => (req, res, next) => {
    const def = wizards[req.params.wizardType];
    if (!def) return res.status(404).json({ error: "Wizard no encontrado." });
    req.wizardDef = def;
    next();
};

const resolveWzd = (wizards) => async (req, res, next) => {
    const wzd = req.query.wzd ?? req.body?.wzd;
    if (!wzd) return res.status(400).json({ error: "Falta el campo wzd." });

    const def = req.wizardDef ?? wizards[req.params.wizardType];
    if (!def) return res.status(404).json({ error: "Wizard no encontrado." });

    const _wzd = await def.store.get(wzd);
    if (!_wzd) return res.status(410).json({ error: "Transacción expirada o inválida." });
    if (_wzd.wizardType !== req.params.wizardType)
        return res.status(400).json({ error: "Tipo de wizard no coincide." });

    if (_wzd.clientId != null) {
        const cookieClientId = req.user?.id ?? req.session?.clientId ?? null;
        if (String(_wzd.clientId) !== String(cookieClientId)) {
            return res.status(403).json({ error: "No autorizado para esta transacción." });
        }
    }

    req.wzdId   = wzd;
    req.wzdData = _wzd;
    next();
};

// ROUTER

export const createWizardRouter = ({ wizards }) => {
    const router = express.Router();

    const globalWritableSchemas = Object.fromEntries(
        Object.entries(wizards).map(([type, def]) => [
            type,
            deriveGlobalWritableSchemas(def.steps),
        ]),
    );

    const mwWizard = resolveWizard(wizards);
    const mwWzd    = resolveWzd(wizards);

    // GET /data
    router.get("/:wizardType/data", mwWizard, mwWzd, async (req, res) => {
        await req.wizardDef.store.touch(req.wzdId);
        res.json({ formData: req.wzdData.formData });
    });

    // POST /start
    router.post("/:wizardType/start", mwWizard, async (req, res) => {
        try {
            const def      = req.wizardDef;
            const clientId = def.requireClient
                ? (req.user?.id ?? req.session?.clientId ?? null)
                : null;

            const wzd = await def.store.create({
                wizardType: req.params.wizardType,
                clientId,
            });
            res.json({ wzd });
        } catch (err) {
            console.error("[wizard](start)", err);
            res.status(500).json({ error: "Error al iniciar el wizard." });
        }
    });

    // GET /resume
    router.get("/:wizardType/resume", mwWizard, mwWzd, async (req, res) => {
        const expiresAt = await req.wizardDef.store.touch(req.wzdId);
        res.json({ expiresAt: expiresAt });
    });

    // PATCH /fields
    router.patch(
        "/:wizardType/fields",
        mwWizard,
        mwWzd,
        upload.any(),
        async (req, res) => {
            try {
                const def = req.wizardDef;
                const wzd = req.wzdId;
                // const _wzd = req.wzdData;
                const wizType = req.params.wizardType;

                let jsonFields = {};
                try {
                    jsonFields = JSON.parse(req.body.__json ?? "{}");
                } catch {
                    return res.status(400).json({ error: "Campo __json inválido." });
                }

                const fileFields = {};
                for (const file of req.files ?? []) {
                    const isArray   = file.fieldname.endsWith("[]");
                    const fieldname = isArray ? file.fieldname.slice(0, -2) : file.fieldname;

                    const name = Buffer.from(file.originalname, "latin1").toString("utf8");
                    const entry = {
                        uploaded: true,
                        url:  path.join("wizard", wzd, fieldname, name).replace(/\\/g, "/"),
                        name: name,
                        size: file.size,
                        scanned: false,
                    };

                    if (isArray) {
                        if (!fileFields[fieldname]) fileFields[fieldname] = [];
                        fileFields[fieldname].push(entry);
                    } else {
                        fileFields[fieldname] = entry;
                    }
                }

                const mergedFields = { ...jsonFields };
                for (const [key, newEntries] of Object.entries(fileFields)) {
                    const existingUploaded = Array.isArray(jsonFields[key])
                        ? jsonFields[key].filter((e) => e?.uploaded === true)
                        : [];
                    if (Array.isArray(newEntries)) {
                        const incomingNames = new Set(newEntries.map((e) => e.name));
                        const kept          = existingUploaded.filter((e) => !incomingNames.has(e.name));
                        mergedFields[key]   = [...kept, ...newEntries];
                    } else {
                        mergedFields[key] = newEntries;
                    }
                }

                const readonlyKeys = new Set(
                    def.steps.flatMap((step) =>
                        Object.entries(step.fields ?? {})
                            .filter(([, v]) => normalizeField(v).readonly)
                            .map(([k]) => k),
                    ),
                );

                const writableFields = Object.fromEntries(
                    Object.entries(mergedFields).filter(([k]) => !readonlyKeys.has(k)),
                );

                const writableSchemas = globalWritableSchemas[wizType] ?? {};
                const { ok, errors }  = await validateKnownFields(writableSchemas, writableFields);
                if (!ok) return res.status(422).json({ errors });

                const allowedWritableKeys = new Set([
                    ...Object.keys(writableSchemas),
                    ...Object.keys(fileFields).filter((k) => !readonlyKeys.has(k)),
                ]);
                const toSave = Object.fromEntries(
                    Object.entries(writableFields).filter(([k]) => allowedWritableKeys.has(k)),
                );

                await def.store.update(wzd, { fields: toSave });
                await def.store.touch(wzd);

                const updated = await def.store.get(wzd);
                res.json({ ok: true, formData: updated?.formData ?? {} });
            } catch (err) {
                console.error("[wizard](fields)", err);
                res.status(500).json({ error: "Error guardando campos." });
            }
        },
    );

    // DELETE /fields/:field
    router.delete("/:wizardType/fields/:field", mwWizard, mwWzd, async (req, res) => {
        try {
            const def = req.wizardDef;
            const wzd = req.wzdId;
            const _wzd = req.wzdData;
            const field = req.params.field;
            const filename = req.query.filename;

            const isReadonly = def.steps.some((step) =>
                normalizeField(step.fields?.[field] ?? null).readonly,
            );
            if (isReadonly) {
                return res.status(403).json({ error: "Este campo no puede ser modificado por el usuario." });
            }

            const current = _wzd.formData[field];

            if (filename) {
                const filePath = path.join("wizard", wzd, field, filename);
                fs.rm(filePath, { force: true }, (err) => {
                    if (err) console.error("[wizard](delete-file)", err);
                });

                const updated = Array.isArray(current)
                    ? current.filter((e) => e.name !== filename)
                    : [];
                await def.store.update(wzd, { fields: { [field]: updated } });
                await def.store.touch(wzd);
                return res.json({ ok: true, [field]: updated });
            }

            if (current?.url) {
                fs.rm(current.url, { force: true }, (err) => {
                    if (err) console.error("[wizard](delete-file)", err);
                });
            } else if (Array.isArray(current)) {
                current.forEach((e) => {
                    if (e?.url) fs.rm(e.url, { force: true }, () => {});
                });
            }

            await def.store.update(wzd, { fields: { [field]: null } });
            await def.store.touch(wzd);
            res.json({ ok: true, [field]: null });
        } catch (err) {
            console.error("[wizard](delete-field)", err);
            res.status(500).json({ error: "Error borrando campo." });
        }
    });

    // POST /step/:stepIndex
    router.post("/:wizardType/step/:stepIndex", mwWizard, mwWzd, async (req, res) => {
        try {
            const def = req.wizardDef;
            const wzd = req.wzdId;
            const _wzd = req.wzdData;
            const stepIndex = parseInt(req.params.stepIndex, 10);

            if (isNaN(stepIndex) || !def.steps?.[stepIndex])
                return res.status(400).json({ error: "StepIndex inválido." });

            let formData = _wzd.formData;

            const currentStep = def.steps[stepIndex];
            const isLastStep  = stepIndex === def.steps.length - 1;

            if (currentStep.prevStepComplete) {
                await currentStep.prevStepComplete(formData, req, res, def.store);
                if (res.headersSent) return;

                const refreshed = await def.store.get(wzd);
                if (!refreshed) return res.status(410).json({ error: "Transacción expirada." });
                formData = refreshed.formData;
            }

            for (let i = 0; i <= stepIndex; i++) {
                const stepDef = def.steps[i];
                if (!stepDef?.fields) continue;

                const stepSchemas = getAllSchemas(stepDef.fields);
                const { ok, errors } = await validateAllFields(stepSchemas, formData);

                // console.log(ok, errors);
                // console.log(formData);

                if (!ok) {
                    const readonlyKeys = new Set(
                        Object.entries(stepDef.fields)
                            .filter(([, v]) => normalizeField(v).readonly)
                            .map(([k]) => k),
                    );

                    const fieldErrors = {};
                    const readonlyErrors = {};
                    for (const [k, v] of Object.entries(errors)) {
                        if (readonlyKeys.has(k)) readonlyErrors[k] = v;
                        else fieldErrors[k] = v;
                    }

                    return res.status(422).json({
                        failedStep: i,
                        errors: fieldErrors,
                        readonlyErrors,
                    });
                }
            }

            if (currentStep.onStepComplete) {
                await currentStep.onStepComplete(formData, req, res, def.store);
                if (res.headersSent) return;
            }

            if (isLastStep) {
                if (def.onComplete) await def.onComplete(formData, req, res, def.store);
                if (!res.headersSent) res.json({ done: true });
                return;
            }

            res.json({ ok: true });
        } catch (err) {
            if (err?.status && (err?.error || err?.message)) {
                return res.status(err.status).json({ error: err.error ?? err?.message });
            }
            if (err?.error || err?.message) {
                return res.status(500).json({ error: err.error ?? err?.message });
            }
            console.error("[wizard](step)", err?.status, err?.error ?? err?.message);
            res.status(500).json({ error: "Error procesando el step." });
        }
    });

    router.delete("/:wizardType/session", mwWizard, mwWzd, async (req, res) => {
        try {
            await req.wizardDef.store.delete(req.wzdId);
            res.json({ ok: true });
        } catch (err) {
            console.error("[wizard](end-session)", err);
            res.status(500).json({ error: "Error al terminar la sesión." });
        }
    });

    return router;
};
