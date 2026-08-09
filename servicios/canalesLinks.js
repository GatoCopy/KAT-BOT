const db = require('./db');

function permitirCanal(servidorId, canalId) {
    db.prepare(`
        INSERT OR IGNORE INTO canales_links_permitidos (servidor_id, canal_id)
        VALUES (?, ?)
    `).run(servidorId, canalId);
}

function quitarCanal(servidorId, canalId) {
    const info = db.prepare(`
        DELETE FROM canales_links_permitidos WHERE servidor_id = ? AND canal_id = ?
    `).run(servidorId, canalId);
    return info.changes > 0;
}

function canalPermiteLinks(servidorId, canalId) {
    const fila = db.prepare(`
        SELECT 1 FROM canales_links_permitidos WHERE servidor_id = ? AND canal_id = ?
    `).get(servidorId, canalId);
    return Boolean(fila);
}

function listarCanalesPermitidos(servidorId) {
    return db.prepare(`
        SELECT canal_id FROM canales_links_permitidos WHERE servidor_id = ?
    `).all(servidorId).map(fila => fila.canal_id);
}

module.exports = { permitirCanal, quitarCanal, canalPermiteLinks, listarCanalesPermitidos };
