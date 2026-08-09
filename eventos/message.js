const { PREFIX } = require('../config/constantes');
const { enviarMensaje } = require('../servicios/api');
const { esAdministradorCacheado } = require('../utilidades/cacheAdmins');
const { revisarMensaje } = require('../servicios/automod');
const { commands } = require('../utilidades/cargadorComandos');

module.exports = async function manejarMessage(message) {
    if (message.author.bot) return;   // ignora bots, incluido a nosotros mismos
    if (!message.guild) return;       // ignoramos DMs, igual que antes

    // Normalizamos el objeto nativo de discord.js a la misma forma "evento"
    // que ya usaban todos los comandos (evento.channel, evento.author, etc.)
    const evento = {
        _id: message.id,
        channel: message.channel.id,
        author: message.author.id,
        content: message.content,
        mentions: [...message.mentions.users.keys()],
    };

    const texto = evento.content.trim();
    if (!texto) return;

    // Auto-moderación: revisa TODO mensaje, no solo comandos
    const accionTomada = await revisarMensaje(evento);
    if (accionTomada) return;

    if (!texto.startsWith(PREFIX)) return;

    const args = texto.slice(PREFIX.length).trim().split(/ +/);
    const nombreComando = args.shift().toLowerCase();

    const comando = commands.get(nombreComando);
    if (!comando) return;

    if (comando.soloAdmin) {
        const tienePermiso = await esAdministradorCacheado(evento.channel, evento.author);
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
