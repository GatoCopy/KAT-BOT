const { getClient } = require('./discordClient');

const TOKEN = process.env.DISCORD_TOKEN || process.env.BOT_TOKEN || process.env.TOKEN;

function colorHexANumero(hex) {
    if (!hex) return null;
    return parseInt(String(hex).replace('#', ''), 16);
}

/**
 * Convierte el objeto "contenido" que ya usan todos los comandos (string plano,
 * o { embeds: [{ type, title, description, colour }] } al estilo Stoat/Revolt)
 * al formato que espera discord.js. Gracias a esto, ningún comando tuvo que
 * reescribirse al migrar de plataforma.
 */
function normalizarContenido(contenido) {
    if (typeof contenido === 'string') return { content: contenido };

    if (contenido?.embeds) {
        const { EmbedBuilder } = require('discord.js');
        const embeds = contenido.embeds.map(e => {
            const embed = new EmbedBuilder();
            if (e.title) embed.setTitle(e.title);
            if (e.description) embed.setDescription(e.description);
            const color = colorHexANumero(e.colour || e.color);
            if (color !== null && !isNaN(color)) embed.setColor(color);
            return embed;
        });
        return { embeds };
    }

    return contenido;
}

async function enviarMensaje(channelId, contenido) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        if (!canal || !canal.isTextBased()) return null;

        const mensaje = await canal.send(normalizarContenido(contenido));
        return { _id: mensaje.id, id: mensaje.id };
    } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        return null;
    }
}

async function editarMensaje(channelId, messageId, contenido) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        const mensaje = await canal.messages.fetch(messageId);
        await mensaje.edit(normalizarContenido(contenido));
        return true;
    } catch (error) {
        console.error('❌ Error editando mensaje:', error);
        return false;
    }
}

async function eliminarMensaje(channelId, messageId) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        const mensaje = await canal.messages.fetch(messageId);
        await mensaje.delete();
        return true;
    } catch (error) {
        console.error('❌ Error eliminando mensaje:', error);
        return false;
    }
}

async function eliminarMensajesEnBloque(channelId, ids) {
    try {
        const canal = await getClient().channels.fetch(channelId);

        // El bulkDelete de Discord solo funciona bien con 2+ mensajes; con 1 o 0
        // (o si algunos ya tienen más de 14 días) caemos al borrado uno por uno.
        if (ids.length >= 2) {
            const borrados = await canal.bulkDelete(ids, true);
            return borrados.size;
        }

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

async function obtenerMensajes(channelId, limite) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        const coleccion = await canal.messages.fetch({ limit: Math.min(limite, 100) });
        return [...coleccion.values()].map(m => ({ _id: m.id }));
    } catch (error) {
        console.error('❌ Error obteniendo mensajes:', error);
        return null;
    }
}

async function obtenerCanal(channelId) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        if (!canal) return null;
        return { _id: canal.id, server: canal.guild?.id };
    } catch (error) {
        return null;
    }
}

async function obtenerServidor(serverId) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        await guild.roles.fetch();
        await guild.channels.fetch();

        const rolesObj = {};
        guild.roles.cache.forEach(rol => { rolesObj[rol.id] = { name: rol.name }; });

        const categorias = guild.channels.cache
            .filter(c => c.type === 4) // 4 = GuildCategory en la API de Discord
            .map(c => c.id);

        return {
            _id: guild.id,
            name: guild.name,
            description: guild.description,
            owner: guild.ownerId,
            channels: [...guild.channels.cache.keys()],
            roles: rolesObj,
            categories: categorias,
            nsfw: guild.nsfwLevel > 0,
        };
    } catch (error) {
        console.error('❌ Error obteniendo servidor:', error);
        return null;
    }
}

async function obtenerMiembrosServidor(serverId) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        const miembros = await guild.members.fetch();
        return {
            members: [...miembros.values()].map(m => ({ _id: { user: m.id } })),
            users: [],
        };
    } catch (error) {
        console.error('❌ Error obteniendo miembros:', error);
        return null;
    }
}

async function obtenerUsuario(userId) {
    try {
        const usuario = await getClient().users.fetch(userId);
        return {
            _id: usuario.id,
            username: usuario.username,
            display_name: usuario.globalName || usuario.username,
            bot: usuario.bot,
            // Discord no da presencia (en línea/ausente/etc) sin el intent privilegiado
            // de Presences, que no pedimos por defecto — se muestra como desconocido.
            status: { presence: null, text: null },
            online: null,
        };
    } catch (error) {
        console.error('❌ Error obteniendo usuario:', error);
        return null;
    }
}

async function obtenerMiembro(serverId, userId) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        const miembro = await guild.members.fetch(userId);
        return {
            // Se excluye el rol @everyone (su ID es igual al ID del servidor)
            roles: [...miembro.roles.cache.keys()].filter(id => id !== serverId),
            joined_at: miembro.joinedAt ? miembro.joinedAt.toISOString() : null,
        };
    } catch (error) {
        return null;
    }
}

async function expulsarMiembro(serverId, userId, razon) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        await guild.members.kick(userId, razon || undefined);
        return true;
    } catch (error) {
        console.error('❌ Error expulsando miembro:', error);
        return false;
    }
}

async function banearUsuario(serverId, userId, razon) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        await guild.members.ban(userId, { reason: razon || undefined });
        return true;
    } catch (error) {
        console.error('❌ Error baneando usuario:', error);
        return false;
    }
}

async function desbanearUsuario(serverId, userId, razon) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        await guild.members.unban(userId, razon || undefined);
        return true;
    } catch (error) {
        console.error('❌ Error desbaneando usuario:', error);
        return false;
    }
}

async function listarBaneos(serverId) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        const baneos = await guild.bans.fetch();
        return {
            users: [...baneos.values()].map(b => ({ _id: b.user.id, username: b.user.username })),
            bans: [...baneos.values()].map(b => ({ _id: { user: b.user.id }, reason: b.reason })),
        };
    } catch (error) {
        console.error('❌ Error listando baneos:', error);
        return null;
    }
}

/**
 * Edita un miembro: roles y/o timeout (suspensión). `data` sigue el mismo
 * formato que ya usaban los comandos: { roles: [...] }, { timeout: isoString },
 * o { remove: ['Timeout'] } para quitar la suspensión.
 */
async function editarMiembro(serverId, userId, data, razon) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        const miembro = await guild.members.fetch(userId);

        if (data.roles) {
            await miembro.roles.set(data.roles, razon || undefined);
        }
        if (data.timeout) {
            const ms = new Date(data.timeout).getTime() - Date.now();
            await miembro.timeout(Math.max(ms, 0), razon || undefined);
        }
        if (data.remove?.includes('Timeout')) {
            await miembro.timeout(null, razon || undefined);
        }

        return { _id: miembro.id };
    } catch (error) {
        console.error('❌ Error editando miembro:', error);
        return null;
    }
}

async function agregarReaccion(channelId, messageId, emoji) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        const mensaje = await canal.messages.fetch(messageId);
        await mensaje.react(emoji);
        return true;
    } catch (error) {
        console.error('❌ Error agregando reacción:', error);
        return false;
    }
}

/**
 * Verifica si un usuario puede considerarse "administrador/moderador" del
 * servidor: dueño del servidor, o tiene permiso de KickMembers, BanMembers
 * o Administrator. En DMs no hay restricción (igual que antes).
 *
 * NOTA: esto es el chequeo temporal mientras migramos — el sistema de roles
 * configurables (moderador vs administrador, !setrol) quedó pausado a medio
 * construir cuando cambiamos de plataforma y se retoma después de esto.
 */
async function esAdministrador(channelId, userId) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        if (!canal?.guild) return true; // DM / sin servidor

        if (canal.guild.ownerId === userId) return true;

        const { PermissionFlagsBits } = require('discord.js');
        const miembro = await canal.guild.members.fetch(userId);

        return miembro.permissions.has(PermissionFlagsBits.Administrator)
            || miembro.permissions.has(PermissionFlagsBits.KickMembers)
            || miembro.permissions.has(PermissionFlagsBits.BanMembers);
    } catch (error) {
        console.error('❌ Error verificando permisos:', error);
        return false;
    }
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
    expulsarMiembro,
    banearUsuario,
    desbanearUsuario,
    listarBaneos,
    editarMiembro,
    agregarReaccion,
};
