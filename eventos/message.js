const { PREFIX } = require('../config/constantes');
const { enviarMensaje } = require('../servicios/api');
const { obtenerNivelCacheado } = require('../utilidades/cacheNiveles');
const { revisarMensaje } = require('../servicios/automod');
const { commands } = require('../utilidades/cargadorComandos');

module.exports = async function manejarMessage(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const evento = {
        _id: message.id,
        channel: message.channel.id,
        author: message.author.id,
        content: message.content,
        mentions: [...message.mentions.users.keys()],
    };

    const texto = evento.content.trim();
    if (!texto) return;

    const accionTomada = await revisarMensaje(evento);
    if (accionTomada) return;

    if (!texto.startsWith(PREFIX)) return;

    const args = texto.slice(PREFIX.length).trim().split(/ +/);
    const nombreComando = args.shift().toLowerCase();

    const comando = commands.get(nombreComando);
    if (!comando) return;

    if (comando.nivel && comando.nivel !== 'publico') {
        const nivelUsuario = await obtenerNivelCacheado(evento.channel, evento.author);
        const suficiente =
            nivelUsuario === 'administrador' ||
            (nivelUsuario === 'moderador' && comando.nivel === 'moderador');

        if (!suficiente) {
            return await enviarMensaje(
                evento.channel,
                `🚫 **Acceso denegado:** este comando requiere nivel **${comando.nivel}**.`
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
