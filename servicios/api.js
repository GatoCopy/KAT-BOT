const { getClient } = require('./discordClient');

const TOKEN = process.env.DISCORD_TOKEN || process.env.BOT_TOKEN || process.env.TOKEN;

function colorHexANumero(hex) {
    if (!hex) return null;
    return parseInt(String(hex).replace('#', ''), 16);
}

function normalizarContenido(contenido) {
    if (typeof contenido === 'string') return { content: contenido };

    if (contenido?.embeds) {
        const { EmbedBuilder } = require('discord.js');
        const embeds = contenido.embeds.map(e => {
            const embed = new EmbedBuilder();
            if (e.title) embed.setTitle(e.title);
            if (e.description) embed.setDescription(e.description);
            if (e.image) embed.setImage(e.image);
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
            .filter(c => c.type === 4)
            .map(c => c.id);

        return {
            _id: guild.id,
            name: guild.name,
            description: guild.description,
            owner: guild.ownerId,
            channels: [...guild.channels.cache.keys()],
            roles: rolesObj,
            categories: categorias,
            memberCount: guild.memberCount,
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
 * Cambia (o quita) el apodo de un miembro en el servidor. `apodo` null = quitar apodo.
 */
async function cambiarApodo(serverId, userId, apodo, razon) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        const miembro = await guild.members.fetch(userId);
        await miembro.setNickname(apodo, razon || undefined);
        return true;
    } catch (error) {
        console.error('❌ Error cambiando apodo:', error);
        return false;
    }
}

/**
 * Bloquea o desbloquea un canal de texto para @everyone (quita/restaura el permiso de enviar mensajes).
 * Retorna { ok: true } o { ok: false, motivo }.
 */
async function bloquearCanal(channelId, bloquear, razon) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        if (!canal?.guild || !canal.isTextBased() || canal.isThread() || canal.isDMBased()) {
            return { ok: false, motivo: 'Solo puedo bloquear canales de texto de un servidor.' };
        }

        await canal.permissionOverwrites.edit(
            canal.guild.roles.everyone,
            // false = denegado; null = vuelve a "heredar" (no deja un permiso explícito)
            { SendMessages: bloquear ? false : null },
            { reason: razon || undefined }
        );
        return { ok: true };
    } catch (error) {
        console.error('❌ Error bloqueando/desbloqueando canal:', error);
        return { ok: false, motivo: 'No pude modificar el canal. Revisa que el bot tenga los permisos `Manage Channels` y `Manage Roles` en él.' };
    }
}

/**
 * Configura el modo lento de un canal. `segundos` = 0 lo desactiva (máximo 21600 = 6h).
 */
async function ponerModoLento(channelId, segundos, razon) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        if (!canal?.guild || typeof canal.setRateLimitPerUser !== 'function') return false;
        await canal.setRateLimitPerUser(segundos, razon || undefined);
        return true;
    } catch (error) {
        console.error('❌ Error configurando modo lento:', error);
        return false;
    }
}

/**
 * Da o quita un rol a un miembro respetando la jerarquía de Discord:
 * el invocador solo puede tocar roles que estén POR DEBAJO de su rol más alto
 * (el dueño del servidor puede con todos). Así un moderador no puede darse
 * a sí mismo ni a otros un rol de administrador a través del bot.
 * Retorna { ok: true } o { ok: false, motivo }.
 */
async function gestionarRolMiembro(serverId, invocadorId, userId, rolId, accion, razon) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        const rol = await guild.roles.fetch(rolId);
        if (!rol) return { ok: false, motivo: 'No encontré ese rol en este servidor.' };
        if (rol.id === guild.id) return { ok: false, motivo: 'No se puede dar ni quitar el rol @everyone.' };
        if (rol.managed) return { ok: false, motivo: 'Ese rol lo gestiona una integración o bot y no se puede asignar a mano.' };

        if (guild.ownerId !== invocadorId) {
            const invocador = await guild.members.fetch(invocadorId);
            if (rol.position >= invocador.roles.highest.position) {
                return { ok: false, motivo: 'Solo puedes gestionar roles que estén por debajo de tu rol más alto.' };
            }
        }

        const miembro = await guild.members.fetch(userId);
        if (accion === 'dar') {
            await miembro.roles.add(rol, razon || undefined);
        } else {
            await miembro.roles.remove(rol, razon || undefined);
        }
        return { ok: true, nombreRol: rol.name };
    } catch (error) {
        console.error('❌ Error gestionando rol de miembro:', error);
        return { ok: false, motivo: 'No pude hacerlo. Revisa el ID/mención y que el rol del bot esté por encima de ese rol y tenga `Manage Roles`.' };
    }
}

/**
 * Datos de un rol para !roleinfo.
 */
async function obtenerRol(serverId, rolId) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        const rol = await guild.roles.fetch(rolId);
        if (!rol) return null;
        await guild.members.fetch();
        return {
            id: rol.id,
            nombre: rol.name,
            colorHex: rol.hexColor,
            posicion: rol.position,
            miembros: rol.members.size,
            mencionable: rol.mentionable,
            separado: rol.hoist,
            gestionado: rol.managed,
            creadoEn: rol.createdAt,
        };
    } catch (error) {
        return null;
    }
}

/**
 * ¿Es este usuario el dueño del servidor?
 */
async function esDueno(serverId, userId) {
    try {
        const guild = await getClient().guilds.fetch(serverId);
        return guild.ownerId === userId;
    } catch (error) {
        return false;
    }
}

function obtenerIdBot() {
    return getClient().user?.id || null;
}

async function esAdministrador(channelId, userId) {
    try {
        const canal = await getClient().channels.fetch(channelId);
        if (!canal?.guild) return true;

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
    cambiarApodo,
    bloquearCanal,
    ponerModoLento,
    gestionarRolMiembro,
    obtenerRol,
    esDueno,
    obtenerIdBot,
};
