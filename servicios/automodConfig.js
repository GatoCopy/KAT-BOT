const db = require('./db');

function obtenerConfigAutomod(servidorId) {
    let fila = db.prepare(`SELECT * FROM automod_config WHERE servidor_id = ?`).get(servidorId);

    if (!fila) {
        db.prepare(`INSERT INTO automod_config (servidor_id) VALUES (?)`).run(servidorId);
        fila = {
            servidor_id: servidorId,
            antiflood_activado: 0,
            filtro_palabras_activado: 0,
            filtro_links_activado: 0,
        };
    }

    return fila;
}

function actualizarConfigAutomod(servidorId, campos) {
    obtenerConfigAutomod(servidorId); // asegura que exista la fila antes de actualizar

    const columnas = Object.keys(campos);
    const asignaciones = columnas.map(c => `${c} = ?`).join(', ');
    const valores = columnas.map(c => campos[c]);

    db.prepare(`UPDATE automod_config SET ${asignaciones} WHERE servidor_id = ?`).run(...valores, servidorId);
}

module.exports = { obtenerConfigAutomod, actualizarConfigAutomod };
