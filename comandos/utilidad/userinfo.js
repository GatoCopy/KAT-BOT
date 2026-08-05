const { obtenerCanal, obtenerUsuario, obtenerMiembro } = require('../../servicios/api');
const { COLOR_SERVER } = require('../../config/constantes');
const { limpiarId } = require('../../utilidades/parseMencion');

const PRESENCIA_EMOJI = {
    Online: '🟢 En línea',
    Idle: '🌙 Ausente',
    Busy: '⛔ Ocupado',
    Invisible: '⚪ Invisible',
    Offline: '⚫ Desconectado',
};

module.exports = {
    nombre: 'userinfo',
    descripcion: 'Muestra información de un usuario. Ej: !userinfo @usuario',
    categoria: 'utilidad',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        // Prioridad: menciones reales del mensaje > argumento como ID/mención de texto > el propio autor
        const idObjetivo = evento.mentions?.[0] || limpiarId(args[0]) || evento.author;

        const usuario = await obtenerUsuario(idObjetivo);
        if (!usuario) {
            return await responder('❌ No encontré a ese usuario. Verifica el ID o la mención.');
        }

        const nombre = usuario.display_name || usuario.username;
        const esBot = Boolean(usuario.bot);
        const presencia = PRESENCIA_EMOJI[usuario.status?.presence] || (usuario.online ? '🟢 En línea' : '⚫ Desconectado');
        const textoEstado = usuario.status?.text ? `\n*"${usuario.status.text}"*` : '';

        let lineaMiembro = '';
        const canal = await obtenerCanal(evento.channel);
        if (canal?.server) {
            const miembro = await obtenerMiembro(canal.server, idObjetivo);
            if (miembro?.joined_at) {
                const fechaUnion = new Date(miembro.joined_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                lineaMiembro = `\n**Se unió al servidor:** ${fechaUnion}`;
            }
        }

        await responder({
            embeds: [{
                type: 'Text',
                title: `👤 ${nombre}`,
                description:
                    `**Usuario:** ${usuario.username}\n` +
                    `**ID:** \`${usuario._id}\`\n` +
                    `**Tipo:** ${esBot ? '🤖 Bot' : '🧑 Usuario'}\n` +
                    `**Estado:** ${presencia}${textoEstado}` +
                    lineaMiembro,
                colour: COLOR_SERVER
            }]
        });
    }
};
