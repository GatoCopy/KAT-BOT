const { obtenerCanal, bloquearCanal } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarIdCanal } = require('../../../utilidades/parseMencion');

module.exports = {
    nombre: 'lock',
    descripcion: 'Bloquea un canal para que nadie pueda escribir (por defecto, el canal actual)',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        // `!lock`  `!lock <razón>`  `!lock #canal`  `!lock #canal <razón>`
        const idCanalArg = limpiarIdCanal(args[0]);
        const idCanal = idCanalArg || evento.channel;
        const razon = args.slice(idCanalArg ? 1 : 0).join(' ') || null;

        // El canal objetivo tiene que ser del MISMO servidor desde donde se ejecuta el comando;
        // si no, un moderador podría bloquear canales de otros servidores donde esté el bot.
        const canalActual = await obtenerCanal(evento.channel);
        const canal = idCanal === evento.channel ? canalActual : await obtenerCanal(idCanal);
        if (!canalActual?.server || !canal?.server || canal.server !== canalActual.server) {
            return await responder('⚠️ Ese canal no existe o no es de este servidor.');
        }

        const resultado = await bloquearCanal(idCanal, true, razon);
        if (!resultado.ok) {
            return await responder(`❌ ${resultado.motivo}`);
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'lock',
            moderadorId: evento.author,
            detalle: `**Canal:** <#${idCanal}>\n**Razón:** ${razon || 'Sin razón especificada'}`
        });

        await responder(`🔒 <#${idCanal}> bloqueado.${razon ? `\n**Razón:** ${razon}` : ''}\nUsa \`!unlock\` para reabrirlo.`);
    }
};
