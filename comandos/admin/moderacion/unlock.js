const { obtenerCanal, bloquearCanal } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarIdCanal } = require('../../../utilidades/parseMencion');

module.exports = {
    nombre: 'unlock',
    descripcion: 'Desbloquea un canal bloqueado con !lock (por defecto, el canal actual)',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idCanal = limpiarIdCanal(args[0]) || evento.channel;

        // El canal objetivo tiene que ser del MISMO servidor desde donde se ejecuta el comando;
        // si no, un moderador podría desbloquear canales de otros servidores donde esté el bot.
        const canalActual = await obtenerCanal(evento.channel);
        const canal = idCanal === evento.channel ? canalActual : await obtenerCanal(idCanal);
        if (!canalActual?.server || !canal?.server || canal.server !== canalActual.server) {
            return await responder('⚠️ Ese canal no existe o no es de este servidor.');
        }

        const resultado = await bloquearCanal(idCanal, false);
        if (!resultado.ok) {
            return await responder(`❌ ${resultado.motivo}`);
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'unlock',
            moderadorId: evento.author,
            detalle: `**Canal:** <#${idCanal}>`
        });

        await responder(`🔓 <#${idCanal}> desbloqueado.`);
    }
};
