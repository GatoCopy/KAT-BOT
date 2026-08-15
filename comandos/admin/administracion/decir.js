const { enviarMensaje, eliminarMensaje } = require('../../../servicios/api');

// IDs de Discord son "snowflakes": números de 17 a 20 dígitos
const REGEX_ID = /^\d{17,20}$/;

module.exports = {
    nombre: 'decir',
    descripcion: 'El bot envía un mensaje por ti. Útil para anuncios. Uso: !decir [ID de canal] <mensaje>',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        if (!args.length) {
            return await responder(
                '⚠️ **Uso:** `!decir <mensaje>` (lo envía en este mismo canal)\n' +
                'o `!decir <ID de canal> <mensaje>` para enviarlo a otro canal.'
            );
        }

        let canalDestino = evento.channel;
        let mensaje = args.join(' ');

        // Si el primer argumento parece un ID de canal, lo usamos como destino
        if (REGEX_ID.test(args[0]) && args.length > 1) {
            canalDestino = args[0];
            mensaje = args.slice(1).join(' ');
        }

        const enviado = await enviarMensaje(canalDestino, mensaje);
        if (!enviado) {
            return await responder('❌ No pude enviar el mensaje. Verifica el ID del canal y que el bot tenga acceso a él.');
        }

        // Borramos el comando original para que quede como si el bot lo hubiera dicho
        // "de la nada" (limpieza estética). Si falla, no es grave, seguimos igual.
        await eliminarMensaje(evento.channel, evento._id).catch(() => {});

        // Si se envió en otro canal, confirmamos aquí para que el admin sepa que salió bien
        if (canalDestino !== evento.channel) {
            await responder(`✅ Mensaje enviado en <#${canalDestino}>.`);
        }
    }
};
