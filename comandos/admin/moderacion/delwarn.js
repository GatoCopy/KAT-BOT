const { obtenerCanal } = require('../../../servicios/api');
const { eliminarWarn } = require('../../../servicios/warns');
const { registrarAccion } = require('../../../servicios/logs');

module.exports = {
    nombre: 'delwarn',
    descripcion: 'Elimina una advertencia específica por su ID (consíguelo con !warns)',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const id = parseInt(args[0], 10);
        if (isNaN(id)) {
            return await responder('⚠️ **Uso:** `!delwarn <id>`\nConsigue el ID con `!warns @usuario`.');
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const eliminado = eliminarWarn(id, canal.server);
        if (!eliminado) {
            return await responder(`❌ No encontré el warn #${id} en este servidor.`);
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'delwarn',
            moderadorId: evento.author,
            detalle: `**Warn:** #${id}`
        });

        await responder(`✅ Warn #${id} eliminado.`);
    }
};
