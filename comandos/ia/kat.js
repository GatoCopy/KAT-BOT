const { preguntarIA } = require('../../servicios/groq');

module.exports = {
    nombre: 'kat',
    descripcion: 'Chatea con la Inteligencia Artificial de KAT',
    categoria: 'ia',
    soloAdmin: false,
    ejecutar: async (evento, args, responder) => {
        const pregunta = args.join(' ');

        if (!pregunta) {
            return await responder('❓ **¿Qué quieres preguntarme?**\nEjemplo: `!kat ¿Cómo funcionan los agujeros negros?`');
        }

        await responder('💭 *KAT está pensando...*');

        const { texto, error } = await preguntarIA(pregunta);

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
