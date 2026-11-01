const db = require('./db');

function obtenerConfigAutomod(servidorId) {
    let fila = db.prepare(`SELECT * FROM automod_config WHERE servidor_id = ?`).get(servidorId);

    if (!fila) {
        db.prepare(`INSERT INTO automod_config (servidor_id) VALUES (?)`).run(servidorId);
        fila = db.prepare(`SELECT * FROM automod_config WHERE servidor_id = ?`).get(servidorId);
    }

    return fila;
}

// Columnas que se pueden modificar desde fuera. Los nombres de columna van
// directo al SQL, así que se validan contra esta lista en vez de confiar en quien llame.
const COLUMNAS_PERMITIDAS = new Set([
    'antiflood_activado',
    'filtro_palabras_activado',
    'filtro_links_activado',
    'filtro_invitaciones_activado',
    'antimenciones_activado',
]);

function actualizarConfigAutomod(servidorId, campos) {
    obtenerConfigAutomod(servidorId); // asegura que exista la fila antes de actualizar

    const columnas = Object.keys(campos);
    for (const c of columnas) {
        if (!COLUMNAS_PERMITIDAS.has(c)) {
            throw new Error(`Columna no permitida en automod_config: ${c}`);
        }
    }

    const asignaciones = columnas.map(c => `${c} = ?`).join(', ');
    const valores = columnas.map(c => campos[c]);

    db.prepare(`UPDATE automod_config SET ${asignaciones} WHERE servidor_id = ?`).run(...valores, servidorId);
}

module.exports = { obtenerConfigAutomod, actualizarConfigAutomod };
