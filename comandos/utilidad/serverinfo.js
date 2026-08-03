const { obtenerCanal, obtenerServidor, obtenerMiembrosServidor, obtenerUsuario } = require('../../servicios/api');
const { COLOR_SERVER } = require('../../config/constantes');

module.exports = {
    nombre: 'serverinfo',
    descripcion: 'Muestra información general del servidor',
    categoria: 'utilidad',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        const canal = await obtenerCanal(evento.channel);

        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const server = await obtenerServidor(canal.server);
        if (!server) {
            return await responder('❌ No pude obtener la información del servidor.');
        }

        const dueño = await obtenerUsuario(server.owner);
        const nombreDueño = dueño ? (dueño.display_name || dueño.username) : 'Desconocido';

        const miembros = await obtenerMiembrosServidor(canal.server);
        const totalMiembros = miembros?.members?.length ?? '—';

        const totalCanales = server.channels?.length ?? 0;
        const totalRoles = server.roles ? Object.keys(server.roles).length : 0;
        const totalCategorias = server.categories?.length ?? 0;

        await responder({
            embeds: [{
                type: 'Text',
                title: `🏠 ${server.name}`,
                description:
                    (server.description ? `${server.description}\n\n` : '') +
                    `**Dueño:** ${nombreDueño}\n` +
                    `**ID:** \`${server._id}\`\n` +
                    `**Miembros:** ${totalMiembros}\n` +
                    `**Canales:** ${totalCanales}\n` +
                    `**Categorías:** ${totalCategorias}\n` +
                    `**Roles:** ${totalRoles}\n` +
                    `**NSFW:** ${server.nsfw ? 'Sí' : 'No'}`,
                colour: COLOR_SERVER
            }]
        });
    }
};
