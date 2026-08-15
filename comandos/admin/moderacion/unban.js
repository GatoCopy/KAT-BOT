const { obtenerCanal, desbanearUsuario } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarId } = require('../../../utilidades/parseMencion');

module.exports = {
    nombre: 'unban',
    descripcion: 'Quita el baneo a un usuario por su ID',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        if (!idObjetivo) {
            return await responder('⚠️ **Uso:** `!unban <ID de usuario>`\n*(No puedes mencionar a alguien baneado, necesitas su ID — revísalo con `!banlist`.)*');
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const exito = await desbanearUsuario(canal.server, idObjetivo);
        if (!exito) {
            return await responder('❌ No pude quitar el baneo. Verifica el ID y que el bot tenga permiso `BanMembers`.');
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'unban',
            usuarioId: idObjetivo,
            moderadorId: evento.author,
        });

        await responder('✅ Baneo removido.');
    }
};
