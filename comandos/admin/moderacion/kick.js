const { obtenerCanal, expulsarMiembro } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarId } = require('../../../utilidades/parseMencion');

module.exports = {
    nombre: 'kick',
    descripcion: 'Expulsa a un miembro del servidor (puede volver a unirse con invitación)',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        if (!idObjetivo) {
            return await responder('⚠️ **Uso:** `!kick <@usuario> [razón]`');
        }

        const razon = args.slice(1).join(' ') || null;

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const exito = await expulsarMiembro(canal.server, idObjetivo, razon);
        if (!exito) {
            return await responder('❌ No pude expulsar a ese usuario. Verifica el ID/mención y que el bot tenga permiso `KickMembers`.');
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'kick',
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            detalle: `**Razón:** ${razon || 'Sin razón especificada'}`
        });

        await responder(`👢 Usuario expulsado.${razon ? `\n**Razón:** ${razon}` : ''}`);
    }
};
