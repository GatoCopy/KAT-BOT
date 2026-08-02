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
        const chRes = await fetch(`${API_URL}/channels/${channelId}`, {
            headers: { 'x-bot-token': TOKEN }
        });
        if (!chRes.ok) return false;
        const channelData = await chRes.json();

        if (!channelData.server) return true; // DM / canal privado

        const serverRes = await fetch(`${API_URL}/servers/${channelData.server}`, {
            headers: { 'x-bot-token': TOKEN }
        });
        if (!serverRes.ok) return false;
        const serverData = await serverRes.json();

        if (serverData.owner === userId) return true;

        const memberRes = await fetch(`${API_URL}/servers/${channelData.server}/members/${userId}`, {
            headers: { 'x-bot-token': TOKEN }
        });
        if (!memberRes.ok) return false;

        // NOTA: esto retorna true para cualquier miembro válido, igual que el original.
        // Si luego quieres exigir un rol de admin específico, aquí es donde se revisaría
        // memberRes.roles contra un ID de rol configurado.
        return true;
    } catch (e) {
        console.error('❌ Error verificando permisos:', e);
        return false;
    }
}

module.exports = {
    TOKEN,
    enviarMensaje,
    eliminarMensaje,
    eliminarMensajesEnBloque,
    obtenerMensajes,
    esAdministrador,
};
