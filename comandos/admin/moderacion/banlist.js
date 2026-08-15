const { obtenerCanal, listarBaneos } = require('../../../servicios/api');
const { COLOR_SERVER } = require('../../../config/constantes');

module.exports = {
    nombre: 'banlist',
    descripcion: 'Lista los usuarios baneados del servidor',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const resultado = await listarBaneos(canal.server);
        if (!resultado) {
            return await responder('❌ No pude obtener la lista de baneos.');
        }

        if (!resultado.bans?.length) {
            return await responder('📭 No hay usuarios baneados en este servidor.');
        }

        const nombresPorId = new Map((resultado.users || []).map(u => [u._id, u.username]));

        const lineas = resultado.bans.map(ban => {
            const userId = ban._id.user;
            const nombre = nombresPorId.get(userId) || 'Desconocido';
            return `\`${userId}\` — ${nombre}${ban.reason ? ` — *${ban.reason}*` : ''}`;
        });

        await responder({
            embeds: [{
                type: 'Text',
                title: `🔨 Usuarios baneados (${resultado.bans.length})`,
                description: lineas.join('\n'),
                colour: COLOR_SERVER
            }]
        });
    }
};
