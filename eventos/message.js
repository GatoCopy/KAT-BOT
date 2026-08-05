const { PREFIX } = require('../config/constantes');
const { enviarMensaje, esAdministrador } = require('../servicios/api');

module.exports = async function manejarMessage(evento, ctx) {
    // Ignorar mensajes enviados por el propio bot
    if (ctx.getBotId() && evento.author === ctx.getBotId()) return;

    const texto = evento.content ? evento.content.trim() : '';
    if (!texto.startsWith(PREFIX)) return;

    const args = texto.slice(PREFIX.length).trim().split(/ +/);
    const nombreComando = args.shift().toLowerCase();

    const comando = ctx.commands.get(nombreComando);
    if (!comando) return;

    if (comando.soloAdmin) {
        const tienePermiso = await esAdministrador(evento.channel, evento.author);
        if (!tienePermiso) {
            return await enviarMensaje(
                evento.channel,
                '🚫 **Acceso denegado:** Solo administradores pueden usar este comando.'
            );
        }
    }

    try {
        await comando.ejecutar(evento, args, (msj) => enviarMensaje(evento.channel, msj));
    } catch (error) {
        console.error(`⚠️ Error ejecutando el comando "${nombreComando}":`, error);
        await enviarMensaje(evento.channel, '❌ Ocurrió un error inesperado al ejecutar ese comando.');
    }
};
