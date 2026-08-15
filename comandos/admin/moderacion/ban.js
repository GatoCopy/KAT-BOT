const { obtenerCanal, banearUsuario } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarId } = require('../../../utilidades/parseMencion');

module.exports = {
    nombre: 'ban',
    descripcion: 'Banea a un usuario del servidor (no puede volver a entrar con invitación)',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        if (!idObjetivo) {
            return await responder('⚠️ **Uso:** `!ban <@usuario> [razón]`');
        }

        const razon = args.slice(1).join(' ') || null;

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const exito = await banearUsuario(canal.server, idObjetivo, razon);
        if (!exito) {
            return await responder('❌ No pude banear a ese usuario. Verifica el ID/mención y que el bot tenga permiso `BanMembers`.');
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'ban',
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            detalle: `**Razón:** ${razon || 'Sin razón especificada'}`
        });

        await responder(`🔨 Usuario baneado.${razon ? `\n**Razón:** ${razon}` : ''}`);
    }
};
