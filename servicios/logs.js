const db = require('./db');
const { enviarMensaje } = require('./api');
const { COLOR_SERVER } = require('../config/constantes');

const ETIQUETAS_TIPO = {
    kick: '👢 Expulsión',
    ban: '🔨 Baneo',
    unban: '✅ Baneo removido',
    warn: '⚠️ Advertencia',
    delwarn: '🗑️ Warn eliminado',
    suspension: '🔇 Suspensión',
    desuspension: '🔊 Suspensión removida',
    join: '📨 Nuevo miembro',
    'auto-palabra': '🚫 Filtro de palabras (automático)',
    'auto-link': '🔗 Link no autorizado (automático)',
    'auto-flood': '⚡ Antiflood (automático)',
};

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
 * Registra una acción de moderación (siempre queda en el historial de SQLite,
 * consultable con !historial) y, si hay canal de logs configurado, también
 * la publica ahí como embed.
 */
async function registrarAccion({ servidorId, tipo, usuarioId, moderadorId, detalle }) {
    db.prepare(`
        INSERT INTO historial_moderacion (servidor_id, usuario_id, moderador_id, tipo, detalle, creado_en)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(servidorId, usuarioId || null, moderadorId || null, tipo, detalle || null, Date.now());

    const canalId = obtenerCanalLogs(servidorId);
    if (!canalId) return;

    const etiqueta = ETIQUETAS_TIPO[tipo] || tipo;
    const partes = [];
    if (usuarioId) partes.push(`**Usuario:** <@${usuarioId}>`);
    if (moderadorId) partes.push(`**Moderador:** <@${moderadorId}>`);
    if (detalle) partes.push(detalle);

    await enviarMensaje(canalId, {
        embeds: [{ type: 'Text', title: etiqueta, description: partes.join('\n'), colour: COLOR_SERVER }]
    });
}

function obtenerHistorial(servidorId, usuarioId, limite = 15) {
    return db.prepare(`
        SELECT * FROM historial_moderacion
        WHERE servidor_id = ? AND usuario_id = ?
        ORDER BY creado_en DESC
        LIMIT ?
    `).all(servidorId, usuarioId, limite);
}

module.exports = { activarLogs, desactivarLogs, obtenerCanalLogs, registrarAccion, obtenerHistorial, ETIQUETAS_TIPO };
