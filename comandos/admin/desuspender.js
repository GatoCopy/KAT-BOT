const { obtenerCanal, editarMiembro } = require('../../servicios/api');
const { limpiarId } = require('../../utilidades/parseMencion');

module.exports = {
    nombre: 'desuspender',
    descripcion: 'Quita la suspensión temporal a un miembro',
    categoria: 'admin',
    soloAdmin: true,

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        if (!idObjetivo) {
            return await responder('⚠️ **Uso:** `!desuspender <@usuario>`');
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const resultado = await editarMiembro(canal.server, idObjetivo, { remove: ['Timeout'] });
        if (!resultado) {
            return await responder('❌ No pude quitar la suspensión. Verifica el ID/mención.');
        }

        await responder('🔊 Suspensión removida.');
    }
};
