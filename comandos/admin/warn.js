const { obtenerCanal } = require('../../servicios/api');
const { crearWarn, contarWarns } = require('../../servicios/warns');
const { limpiarId } = require('../../utilidades/parseMencion');

const UMBRAL_AVISO = 3; // a partir de cuántos warns se avisa al moderador para que considere acción

module.exports = {
    nombre: 'warn',
    descripcion: 'Agrega una advertencia a un usuario',
    categoria: 'admin',
    soloAdmin: true,

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        if (!idObjetivo) {
            return await responder('⚠️ **Uso:** `!warn <@usuario> [razón]`');
        }

        const razon = args.slice(1).join(' ') || null;

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        crearWarn({
            servidorId: canal.server,
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            razon,
        });

        const total = contarWarns(canal.server, idObjetivo);

        let mensaje = `⚠️ Usuario advertido. Lleva **${total}** warn(s) en este servidor.${razon ? `\n**Razón:** ${razon}` : ''}`;
        if (total >= UMBRAL_AVISO) {
            mensaje += `\n\n🚨 Este usuario ya alcanzó **${total}** advertencias — puede que sea momento de considerar una suspensión o expulsión.`;
        }

        await responder(mensaje);
    }
};
