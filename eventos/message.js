const { PREFIX } = require('../config/constantes');
const { enviarMensaje, esAdministrador } = require('../servicios/api');
const { esCanalIA } = require('../servicios/canalesIA');
const { preguntarIAConHistorial } = require('../servicios/groq');
const { obtenerHistorial, agregarMensaje } = require('../utilidades/historialIA');
const { obtenerNombreUsuario } = require('../utilidades/cacheUsuarios');

module.exports = async function manejarMessage(evento, ctx) {
    // Ignorar mensajes enviados por el propio bot
    if (ctx.getBotId() && evento.author === ctx.getBotId()) return;

    const texto = evento.content ? evento.content.trim() : '';
    if (!texto) return;

    // Los comandos con prefijo siempre se procesan como comando,
    // incluso dentro de un canal en modo conversación.
    if (texto.startsWith(PREFIX)) {
        return await procesarComando(evento, ctx, texto);
    }

    // Si no es un comando y el canal tiene activado el modo conversación,
    // se trata como un mensaje más de un chat continuo con la IA.
    if (esCanalIA(evento.channel)) {
        await responderComoIA(evento);
    }
};

async function procesarComando(evento, ctx, texto) {
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
}

async function responderComoIA(evento) {
    const nombreUsuario = await obtenerNombreUsuario(evento.author);
    agregarMensaje(evento.channel, 'user', `${nombreUsuario}: ${evento.content.trim()}`);

    const historial = obtenerHistorial(evento.channel);
    const { texto: respuesta, error } = await preguntarIAConHistorial(historial);

    if (error) {
        // No respondemos con un mensaje de error en cada intento fallido para no
        // spamear el canal (imagina que se acabó la GROQ_API_KEY: cada mensaje
        // de la gente dispararía un error visible). Solo lo dejamos en el log.
        console.error('⚠️ Error de IA en canal en modo conversación:', error);
        return;
    }

    agregarMensaje(evento.channel, 'assistant', respuesta);

    const contenidoFinal = respuesta.length > 1900
        ? respuesta.substring(0, 1900) + '...\n*(Recortado por límite)*'
        : respuesta;

    await enviarMensaje(evento.channel, contenidoFinal);
}
