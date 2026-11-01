const db = require('./db');

/**
 * Registra un baneo temporal. Si ese usuario ya tenía uno pendiente en el
 * servidor, se reemplaza por el nuevo (así no quedan dos relojes corriendo).
 */
function crearTempban({ servidorId, usuarioId, moderadorId, razon, expiraEn }) {
    cancelarTempbans(servidorId, usuarioId);

    const info = db.prepare(`
        INSERT INTO tempbans (servidor_id, usuario_id, moderador_id, razon, expira_en)
        VALUES (?, ?, ?, ?, ?)
    `).run(servidorId, usuarioId, moderadorId, razon || null, expiraEn);

    return info.lastInsertRowid;
}

function obtenerTempbansVencidos() {
    return db.prepare(`
        SELECT * FROM tempbans
        WHERE procesado = 0 AND expira_en <= ?
    `).all(Date.now());
}

function marcarTempbanProcesado(id) {
    db.prepare(`UPDATE tempbans SET procesado = 1 WHERE id = ?`).run(id);
}

/**
 * Cancela los tempbans pendientes de un usuario (se usa al desbanearlo a mano,
 * o al reemplazar un tempban por otro).
 */
function cancelarTempbans(servidorId, usuarioId) {
    db.prepare(`
        UPDATE tempbans SET procesado = 1
        WHERE servidor_id = ? AND usuario_id = ? AND procesado = 0
    `).run(servidorId, usuarioId);
}

module.exports = { crearTempban, obtenerTempbansVencidos, marcarTempbanProcesado, cancelarTempbans };
