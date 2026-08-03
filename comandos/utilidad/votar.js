const { obtenerEncuesta, votar } = require('../../servicios/encuestas');

module.exports = {
    nombre: 'votar',
    descripcion: 'Vota en una encuesta. Ej: !votar 3 2',
    categoria: 'utilidad',
    soloAdmin: false,

    ejecutar: async (evento, args, responder) => {
        const idEncuesta = parseInt(args[0], 10);
        const opcion = parseInt(args[1], 10);

        if (isNaN(idEncuesta) || isNaN(opcion)) {
            return await responder('⚠️ **Uso:** `!votar <id_encuesta> <número_opción>`');
        }

        const encuesta = obtenerEncuesta(idEncuesta);
        if (!encuesta) {
            return await responder(`❌ No encontré la encuesta #${idEncuesta}.`);
        }
        if (encuesta.cerrada) {
            return await responder('🔒 Esta encuesta ya está cerrada.');
        }
        if (opcion < 1 || opcion > encuesta.opciones.length) {
            return await responder(`⚠️ Opción inválida. Elige un número entre 1 y ${encuesta.opciones.length}.`);
        }

        votar(idEncuesta, evento.author, opcion);
        await responder(`✅ Tu voto por **${encuesta.opciones[opcion - 1]}** quedó registrado. *(Puedes cambiarlo votando de nuevo.)*`);
    }
};
