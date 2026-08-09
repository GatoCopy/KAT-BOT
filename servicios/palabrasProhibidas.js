const db = require('./db');

function agregarPalabra(servidorId, palabra) {
    db.prepare(`
        INSERT OR IGNORE INTO palabras_prohibidas (servidor_id, palabra)
        VALUES (?, ?)
    `).run(servidorId, palabra.toLowerCase());
}

function quitarPalabra(servidorId, palabra) {
    const info = db.prepare(`
        DELETE FROM palabras_prohibidas WHERE servidor_id = ? AND palabra = ?
    `).run(servidorId, palabra.toLowerCase());
    return info.changes > 0;
}

function obtenerPalabrasProhibidas(servidorId) {
    return db.prepare(`
        SELECT palabra FROM palabras_prohibidas WHERE servidor_id = ?
    `).all(servidorId).map(fila => fila.palabra);
}

module.exports = { agregarPalabra, quitarPalabra, obtenerPalabrasProhibidas };
