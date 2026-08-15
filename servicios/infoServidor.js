const db = require('./db');

function guardarInfo(servidorId, contenido) {
    db.prepare(`
        INSERT INTO info_servidor (servidor_id, contenido, actualizado_en)
        VALUES (?, ?, ?)
        ON CONFLICT(servidor_id) DO UPDATE SET contenido = excluded.contenido, actualizado_en = excluded.actualizado_en
    `).run(servidorId, contenido, Date.now());
}

function obtenerInfo(servidorId) {
    const fila = db.prepare(`SELECT contenido FROM info_servidor WHERE servidor_id = ?`).get(servidorId);
    return fila ? fila.contenido : null;
}

function borrarInfo(servidorId) {
    db.prepare(`DELETE FROM info_servidor WHERE servidor_id = ?`).run(servidorId);
}

module.exports = { guardarInfo, obtenerInfo, borrarInfo };
