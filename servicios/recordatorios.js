const db = require('./db');

function crearRecordatorio({ usuarioId, canalId, mensaje, recordarEn }) {
    const stmt = db.prepare(`
        INSERT INTO recordatorios (usuario_id, canal_id, mensaje, recordar_en, creado_en)
        VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(usuarioId, canalId, mensaje, recordarEn, Date.now());
    return info.lastInsertRowid;
}

function obtenerRecordatoriosPendientesDe(usuarioId) {
    return db.prepare(`
        SELECT * FROM recordatorios
        WHERE usuario_id = ? AND enviado = 0
        ORDER BY recordar_en ASC
    `).all(usuarioId);
}

function obtenerRecordatoriosVencidos() {
    return db.prepare(`
        SELECT * FROM recordatorios
        WHERE enviado = 0 AND recordar_en <= ?
    `).all(Date.now());
}

function marcarEnviado(id) {
    db.prepare(`UPDATE recordatorios SET enviado = 1 WHERE id = ?`).run(id);
}

module.exports = {
    crearRecordatorio,
    obtenerRecordatoriosPendientesDe,
    obtenerRecordatoriosVencidos,
    marcarEnviado,
};
