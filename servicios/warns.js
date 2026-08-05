const db = require('./db');

function crearWarn({ servidorId, usuarioId, moderadorId, razon }) {
    const stmt = db.prepare(`
        INSERT INTO warns (servidor_id, usuario_id, moderador_id, razon, creado_en)
        VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(servidorId, usuarioId, moderadorId, razon || null, Date.now());
    return info.lastInsertRowid;
}

function obtenerWarns(servidorId, usuarioId) {
    return db.prepare(`
        SELECT * FROM warns
        WHERE servidor_id = ? AND usuario_id = ?
        ORDER BY creado_en DESC
    `).all(servidorId, usuarioId);
}

function contarWarns(servidorId, usuarioId) {
    const fila = db.prepare(`
        SELECT COUNT(*) as total FROM warns
        WHERE servidor_id = ? AND usuario_id = ?
    `).get(servidorId, usuarioId);
    return fila.total;
}

/**
 * Elimina un warn por su ID, pero solo si pertenece al servidor indicado
 * (para que un admin de un server no pueda borrar warns de otro por accidente).
 */
function eliminarWarn(id, servidorId) {
    const info = db.prepare(`DELETE FROM warns WHERE id = ? AND servidor_id = ?`).run(id, servidorId);
    return info.changes > 0;
}

module.exports = { crearWarn, obtenerWarns, contarWarns, eliminarWarn };
