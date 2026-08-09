const db = require('./db');
const { enviarMensaje } = require('./api');
const { COLOR_SERVER } = require('../config/constantes');

function activarLogs(servidorId, canalId, usuarioId) {
    db.prepare(`
        INSERT OR REPLACE INTO logs_moderacion (servidor_id, canal_id, activado_por, activado_en)
        VALUES (?, ?, ?, ?)
    `).run(servidorId, canalId, usuarioId, Date.now());
}

function desactivarLogs(servidorId) {
    db.prepare(`DELETE FROM logs_moderacion WHERE servidor_id = ?`).run(servidorId);
}

function obtenerCanalLogs(servidorId) {
    const fila = db.prepare(`SELECT canal_id FROM logs_moderacion WHERE servidor_id = ?`).get(servidorId);
    return fila ? fila.canal_id : null;
}

/**
 * Publica un embed en el canal de logs configurado. No hace nada si el
 * servidor no tiene logs activados — así los comandos pueden llamarla
 * siempre, sin tener que revisar antes si está activado.
 */
async function registrarAccion(servidorId, { titulo, descripcion }) {
    const canalId = obtenerCanalLogs(servidorId);
    if (!canalId) return;

    await enviarMensaje(canalId, {
        embeds: [{
            type: 'Text',
            title: titulo,
            description: descripcion,
            colour: COLOR_SERVER
        }]
    });
}

module.exports = { activarLogs, desactivarLogs, obtenerCanalLogs, registrarAccion };
