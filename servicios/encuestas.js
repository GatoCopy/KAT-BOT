const db = require('./db');

function crearEncuesta({ canalId, creadorId, pregunta, opciones }) {
    const stmt = db.prepare(`
        INSERT INTO encuestas (canal_id, creador_id, pregunta, opciones, creada_en)
        VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(canalId, creadorId, pregunta, JSON.stringify(opciones), Date.now());
    return info.lastInsertRowid;
}

function obtenerEncuesta(id) {
    const fila = db.prepare(`SELECT * FROM encuestas WHERE id = ?`).get(id);
    if (!fila) return null;
    return { ...fila, opciones: JSON.parse(fila.opciones) };
}

/**
 * Registra (o reemplaza, si ya había votado) el voto de un usuario en una encuesta.
 */
function votar(encuestaId, usuarioId, opcion) {
    db.prepare(`
        INSERT INTO votos (encuesta_id, usuario_id, opcion)
        VALUES (?, ?, ?)
        ON CONFLICT(encuesta_id, usuario_id) DO UPDATE SET opcion = excluded.opcion
    `).run(encuestaId, usuarioId, opcion);
}

function contarVotos(encuestaId) {
    return db.prepare(`
        SELECT opcion, COUNT(*) as total
        FROM votos
        WHERE encuesta_id = ?
        GROUP BY opcion
    `).all(encuestaId);
}

function cerrarEncuesta(id) {
    db.prepare(`UPDATE encuestas SET cerrada = 1 WHERE id = ?`).run(id);
}

module.exports = {
    crearEncuesta,
    obtenerEncuesta,
    votar,
    contarVotos,
    cerrarEncuesta,
};
