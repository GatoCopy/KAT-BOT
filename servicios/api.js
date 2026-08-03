const { API_URL } = require('../config/constantes');

const TOKEN = process.env.BOT_TOKEN ? process.env.BOT_TOKEN.trim() : process.env.TOKEN;

/**
 * Envía un mensaje (texto plano o embed) a un canal.
 * @param {string} channelId
 * @param {string|object} contenido - string para texto plano, objeto { embeds: [...] } para embeds
 */
async function enviarMensaje(channelId, contenido) {
    try {
        const bodyData = typeof contenido === 'string' ? { content: contenido } : contenido;

        const response = await fetch(`${API_URL}/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'x-bot-token': TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('❌ Error enviando mensaje HTTP:', response.status, errData);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error de red al enviar mensaje:', error);
        return null;
    }
}

/**
 * Elimina un mensaje específico de un canal.
 */
async function eliminarMensaje(channelId, messageId) {
    try {
        const res = await fetch(`${API_URL}/channels/${channelId}/messages/${messageId}`, {
            method: 'DELETE',
            headers: { 'x-bot-token': TOKEN }
        });
        return res.ok;
    } catch (error) {
        console.error('❌ Error eliminando mensaje:', error);
        return false;
    }
}

/**
 * Elimina varios mensajes en bloque. Si falla el endpoint bulk, cae a borrado uno por uno.
 * @returns {number} cantidad de mensajes eliminados (aproximado)
 */
async function eliminarMensajesEnBloque(channelId, ids) {
    try {
        const resDelete = await fetch(`${API_URL}/channels/${channelId}/messages/bulk`, {
            method: 'DELETE',
            headers: {
                'x-bot-token': TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });

        if (resDelete.ok) {
            return ids.length;
        }

        // Fallback: borrado uno por uno si el bulk no está disponible
        let eliminados = 0;
        for (const id of ids) {
            const ok = await eliminarMensaje(channelId, id);
            if (ok) eliminados++;
        }
        return eliminados;
    } catch (error) {
        console.error('❌ Error en borrado en bloque:', error);
        return 0;
    }
}

/**
 * Obtiene los últimos mensajes de un canal.
 * @param {string} channelId
 * @param {number} limite
 */
async function obtenerMensajes(channelId, limite) {
    const res = await fetch(`${API_URL}/channels/${channelId}/messages?limit=${limite}`, {
        headers: { 'x-bot-token': TOKEN }
    });
    if (!res.ok) return null;
    return await res.json();
}

/**
 * Verifica si un usuario es Administrador/Dueño del servidor al que pertenece el canal.
 * En DMs o canales privados (sin server), se permite el uso por defecto.
 */
async function esAdministrador(channelId, userId) {
    try {
        const channelData = await obtenerCanal(channelId);
        if (!channelData) return false;

        if (!channelData.server) return true; // DM / canal privado

        const serverData = await obtenerServidor(channelData.server);
        if (!serverData) return false;

        if (serverData.owner === userId) return true;

        const memberData = await obtenerMiembro(channelData.server, userId);
        if (!memberData) return false;

        // NOTA: esto retorna true para cualquier miembro válido, igual que el original.
        // Si luego quieres exigir un rol de admin específico, aquí es donde se revisaría
        // memberData.roles contra un ID de rol configurado.
        return true;
    } catch (e) {
        console.error('❌ Error verificando permisos:', e);
        return false;
    }
}

/**
 * Edita el contenido de un mensaje ya enviado por el bot.
 */
async function editarMensaje(channelId, messageId, contenido) {
    try {
        const bodyData = typeof contenido === 'string' ? { content: contenido } : contenido;
        const res = await fetch(`${API_URL}/channels/${channelId}/messages/${messageId}`, {
            method: 'PATCH',
            headers: {
                'x-bot-token': TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });
        return res.ok;
    } catch (error) {
        console.error('❌ Error editando mensaje:', error);
        return false;
    }
}

/**
 * Obtiene la info de un canal (incluye a qué server pertenece, si aplica).
 */
async function obtenerCanal(channelId) {
    const res = await fetch(`${API_URL}/channels/${channelId}`, {
        headers: { 'x-bot-token': TOKEN }
    });
    if (!res.ok) return null;
    return await res.json();
}

/**
 * Obtiene la info de un servidor por su ID.
 */
async function obtenerServidor(serverId) {
    const res = await fetch(`${API_URL}/servers/${serverId}`, {
        headers: { 'x-bot-token': TOKEN }
    });
    if (!res.ok) return null;
    return await res.json();
}

/**
 * Lista los miembros de un servidor. Devuelve { members: [...], users: [...] }.
 */
async function obtenerMiembrosServidor(serverId) {
    const res = await fetch(`${API_URL}/servers/${serverId}/members`, {
        headers: { 'x-bot-token': TOKEN }
    });
    if (!res.ok) return null;
    return await res.json();
}

/**
 * Obtiene el perfil "global" de un usuario (no ligado a un server en específico).
 */
async function obtenerUsuario(userId) {
    const res = await fetch(`${API_URL}/users/${userId}`, {
        headers: { 'x-bot-token': TOKEN }
    });
    if (!res.ok) return null;
    return await res.json();
}

/**
 * Obtiene los datos de membresía de un usuario dentro de un servidor
 * (fecha en la que se unió, apodo, roles, etc).
 */
async function obtenerMiembro(serverId, userId) {
    const res = await fetch(`${API_URL}/servers/${serverId}/members/${userId}`, {
        headers: { 'x-bot-token': TOKEN }
    });
    if (!res.ok) return null;
    return await res.json();
}

module.exports = {
    TOKEN,
    enviarMensaje,
    editarMensaje,
    eliminarMensaje,
    eliminarMensajesEnBloque,
    obtenerMensajes,
    obtenerCanal,
    obtenerServidor,
    obtenerMiembrosServidor,
    obtenerUsuario,
    obtenerMiembro,
    esAdministrador,
};
