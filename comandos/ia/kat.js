const { preguntarIA, preguntarIAConHistorial } = require('../../servicios/groq');
const { esCanalIA } = require('../../servicios/canalesIA');
const { obtenerHistorial, agregarMensaje } = require('../../utilidades/historialIA');
const { obtenerNombreUsuario } = require('../../utilidades/cacheUsuarios');
const { obtenerCanal } = require('../../servicios/api');
const { obtenerContextoCacheado } = require('../../utilidades/cacheContextoServidor');

module.exports = {
    nombre: 'kat',
    descripcion: 'Chatea con la Inteligencia Artificial de KAT. Con !canalia activado, recuerda la conversación en ese canal.',
    categoria: 'ia',
    soloAdmin: false,
    ejecutar: async (evento, args, responder) => {
        const pregunta = args.join(' ');

        if (!pregunta) {
            return await responder('❓ **¿Qué quieres preguntarme?**\nEjemplo: `!kat ¿Cómo funcionan los agujeros negros?`');
        }

        await responder('💭 *KAT está pensando...*');

        // Si el mensaje viene de un servidor, le damos a la IA el contexto base
        // (reglas configuradas + admins/mods actuales) para que pueda responder
        // preguntas sobre el server sin decir "no sé de qué hablas".
        const canal = await obtenerCanal(evento.channel);
        const contextoServidor = canal?.server ? await obtenerContextoCacheado(canal.server) : null;

        const conMemoria = esCanalIA(evento.channel);
        let resultado;

        if (conMemoria) {
            // El canal tiene memoria activada: agregamos la pregunta al historial
            // (etiquetada con quién la hizo, por si varias personas usan !kat aquí)
            // y le pasamos toda la conversación reciente, no solo esta pregunta.
            const nombreUsuario = await obtenerNombreUsuario(evento.author);
            agregarMensaje(evento.channel, 'user', `${nombreUsuario}: ${pregunta}`);

            const historial = obtenerHistorial(evento.channel);
            resultado = await preguntarIAConHistorial(historial, contextoServidor);

            if (resultado.texto) {
                agregarMensaje(evento.channel, 'assistant', resultado.texto);
            }
        } else {
            // Sin memoria: comportamiento clásico, pregunta y respuesta aisladas.
            resultado = await preguntarIA(pregunta, contextoServidor);
        }

        const { texto, error } = resultado;

        if (error === 'GROQ_API_KEY_MISSING') {
            return await responder('❌ Error: No se ha configurado la GROQ_API_KEY en el .env');
        }
        if (error === 'RESPUESTA_VACIA') {
            return await responder('⚠️ No recibí una respuesta válida de la IA.');
        }
        if (error === 'ERROR_RED') {
            return await responder('⚠️ Ocurrió un error al intentar comunicarme con la IA.');
        }
        if (error) {
            return await responder(`⚠️ Error de la IA: ${error}`);
        }

        if (texto.length > 1900) {
            await responder(texto.substring(0, 1900) + '...\n*(Recortado por límite)*');
        } else {
            await responder(texto);
        }
    }
};
