const { obtenerCanal, agregarReaccion } = require('../../../servicios/api');
const { crearAutorol, eliminarAutorol, listarAutorolesServidor } = require('../../../servicios/autoroles');
const { COLOR_SERVER } = require('../../../config/constantes');

module.exports = {
    nombre: 'autorol',
    descripcion: 'Configura roles automáticos por reacción a un mensaje',
    categoria: 'admin',
    soloAdmin: true,

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (accion === 'crear') {
            const [, mensajeId, emoji, rolId] = args;

            if (!mensajeId || !emoji || !rolId) {
                return await responder(
                    '⚠️ **Uso:** `!autorol crear <ID del mensaje> <emoji> <ID del rol>`\n' +
                    'Ejecuta este comando en el **mismo canal** donde está el mensaje.\n' +
                    '*Consigue el ID del mensaje con click derecho → Copiar ID (necesitas modo desarrollador activado), y el ID del rol desde Configuración del servidor → Roles.*'
                );
            }

            crearAutorol({
                mensajeId,
                emojiId: emoji,
                rolId,
                servidorId: canal.server,
                canalId: evento.channel,
                creadoPor: evento.author,
            });

            const reaccionOk = await agregarReaccion(evento.channel, mensajeId, emoji);

            return await responder(
                `✅ Autorol configurado: reaccionar con ${emoji} en ese mensaje da el rol \`${rolId}\` (y quitar la reacción lo quita).` +
                (reaccionOk ? '' : '\n⚠️ No pude poner la reacción inicial yo mismo — verifica que el ID del mensaje y el emoji sean correctos, y que el bot tenga permiso `React` en ese canal.')
            );
        }

        if (accion === 'quitar') {
            const [, mensajeId, emoji] = args;
            if (!mensajeId || !emoji) {
                return await responder('⚠️ **Uso:** `!autorol quitar <ID del mensaje> <emoji>`');
            }

            const eliminado = eliminarAutorol(mensajeId, emoji);
            return await responder(eliminado ? '✅ Autorol eliminado.' : '❌ No encontré ningún autorol con ese mensaje y emoji.');
        }

        if (accion === 'lista') {
            const lista = listarAutorolesServidor(canal.server);
            if (!lista.length) {
                return await responder('📭 No hay autoroles configurados en este servidor.');
            }

            const lineas = lista.map(a => `${a.emoji_id} → \`${a.rol_id}\`  *(mensaje \`${a.mensaje_id}\`)*`);
            return await responder({
                embeds: [{
                    type: 'Text',
                    title: '🎭 Autoroles configurados',
                    description: lineas.join('\n'),
                    colour: COLOR_SERVER
                }]
            });
        }

        await responder(
            '⚠️ **Uso:**\n' +
            '`!autorol crear <ID mensaje> <emoji> <ID rol>` — configura uno nuevo\n' +
            '`!autorol quitar <ID mensaje> <emoji>` — elimina uno\n' +
            '`!autorol lista` — muestra los configurados en este servidor'
        );
    }
};
