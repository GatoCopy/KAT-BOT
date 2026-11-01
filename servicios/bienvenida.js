const db = require('./db');
const { enviarMensaje } = require('./api');

// Los nombres de columna salen SOLO de este mapa (nunca de lo que escriba un usuario).
const TIPOS = {
    bienvenida: { canal: 'bienvenida_canal_id', mensaje: 'bienvenida_mensaje' },
    despedida: { canal: 'despedida_canal_id', mensaje: 'despedida_mensaje' },
};

const PLANTILLAS_POR_DEFECTO = {
    bienvenida: '👋 ¡Bienvenido/a {usuario} a **{servidor}**! Ya somos {miembros} miembros.',
    despedida: '👋 **{nombre}** ha dejado **{servidor}**.',
};

function columnasDe(tipo) {
    const cols = TIPOS[tipo];
    if (!cols) throw new Error(`Tipo de mensaje de servidor desconocido: ${tipo}`);
    return cols;
}

function guardarMensaje(servidorId, tipo, canalId, mensaje) {
    const { canal, mensaje: colMensaje } = columnasDe(tipo);
    db.prepare(`
        INSERT INTO bienvenida_config (servidor_id, ${canal}, ${colMensaje}) VALUES (?, ?, ?)
        ON CONFLICT(servidor_id) DO UPDATE SET ${canal} = excluded.${canal}, ${colMensaje} = excluded.${colMensaje}
    `).run(servidorId, canalId, mensaje);
}

function desactivarMensaje(servidorId, tipo) {
    const { canal, mensaje } = columnasDe(tipo);
    db.prepare(`UPDATE bienvenida_config SET ${canal} = NULL, ${mensaje} = NULL WHERE servidor_id = ?`).run(servidorId);
}

/**
 * Retorna { canalId, mensaje } si ese tipo está activado en el servidor, o null.
 */
function obtenerMensaje(servidorId, tipo) {
    const { canal, mensaje } = columnasDe(tipo);
    const fila = db.prepare(`SELECT ${canal} AS canal_id, ${mensaje} AS mensaje FROM bienvenida_config WHERE servidor_id = ?`).get(servidorId);
    if (!fila || !fila.canal_id || !fila.mensaje) return null;
    return { canalId: fila.canal_id, mensaje: fila.mensaje };
}

/**
 * Reemplaza los marcadores de la plantilla:
 *   {usuario} → mención, {nombre} → nombre de usuario, {servidor} → nombre del servidor, {miembros} → total de miembros
 */
function renderizarPlantilla(plantilla, { usuarioId, nombre, servidor, miembros }) {
    return plantilla
        .replace(/\{usuario\}/gi, `<@${usuarioId}>`)
        .replace(/\{nombre\}/gi, nombre)
        .replace(/\{servidor\}/gi, servidor)
        .replace(/\{miembros\}/gi, String(miembros ?? '?'));
}

/**
 * Envía el mensaje configurado (si lo hay) cuando alguien entra o sale.
 * `allowedMentions: users` evita que un nombre de usuario como "@everyone" dispare un ping masivo.
 */
async function enviarMensajeDeServidor(tipo, guild, usuario) {
    const config = obtenerMensaje(guild.id, tipo);
    if (!config) return;

    const texto = renderizarPlantilla(config.mensaje, {
        usuarioId: usuario.id,
        nombre: usuario.username,
        servidor: guild.name,
        miembros: guild.memberCount,
    });

    await enviarMensaje(config.canalId, { content: texto, allowedMentions: { parse: ['users'] } });
}

module.exports = {
    PLANTILLAS_POR_DEFECTO,
    guardarMensaje,
    desactivarMensaje,
    obtenerMensaje,
    renderizarPlantilla,
    enviarMensajeDeServidor,
};
