const db = require('./db');

function activarCanal(canalId, usuarioId) {
    db.prepare(`
        INSERT OR REPLACE INTO canales_ia (canal_id, activado_por, activado_en)
        VALUES (?, ?, ?)
    `).run(canalId, usuarioId, Date.now());
}

function desactivarCanal(canalId) {
    db.prepare(`DELETE FROM canales_ia WHERE canal_id = ?`).run(canalId);
}

function esCanalIA(canalId) {
    const fila = db.prepare(`SELECT 1 FROM canales_ia WHERE canal_id = ?`).get(canalId);
    return Boolean(fila);
}

module.exports = { activarCanal, desactivarCanal, esCanalIA };
