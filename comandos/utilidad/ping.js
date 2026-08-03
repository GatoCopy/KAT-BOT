const { editarMensaje } = require('../../servicios/api');

module.exports = {
    nombre: 'ping',
    descripcion: 'Muestra la latencia actual del bot',
    categoria: 'utilidad',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        const inicio = Date.now();
        const mensajeEnviado = await responder('🏓 Calculando...');
        const latencia = Date.now() - inicio;

        if (mensajeEnviado?._id) {
            await editarMensaje(evento.channel, mensajeEnviado._id, `🏓 **Pong!** Latencia: \`${latencia}ms\``);
        }
    }
};
