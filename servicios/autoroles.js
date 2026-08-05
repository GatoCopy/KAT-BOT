const db = require('./db');

function crearAutorol({ mensajeId, emojiId, rolId, servidorId, canalId, creadoPor }) {
    db.prepare(`
        INSERT OR REPLACE INTO autoroles (mensaje_id, emoji_id, rol_id, servidor_id, canal_id, creado_por, creado_en)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(mensajeId, emojiId, rolId, servidorId, canalId, creadoPor, Date.now());
}

function obtenerAutorol(mensajeId, emojiId) {
    return db.prepare(`
        SELECT * FROM autoroles WHERE mensaje_id = ? AND emoji_id = ?
    `).get(mensajeId, emojiId) || null;
}

function eliminarAutorol(mensajeId, emojiId) {
    const info = db.prepare(`DELETE FROM autoroles WHERE mensaje_id = ? AND emoji_id = ?`).run(mensajeId, emojiId);
    return info.changes > 0;
}

function listarAutorolesServidor(servidorId) {
    return db.prepare(`SELECT * FROM autoroles WHERE servidor_id = ? ORDER BY creado_en ASC`).all(servidorId);
}

module.exports = { crearAutorol, obtenerAutorol, eliminarAutorol, listarAutorolesServidor };
