const { obtenerCanal, desbanearUsuario } = require('../../servicios/api');
const { limpiarId } = require('../../utilidades/parseMencion');

module.exports = {
    nombre: 'unban',
    descripcion: 'Quita el baneo a un usuario por su ID',
    categoria: 'admin',
    soloAdmin: true,

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        if (!idObjetivo) {
            return await responder('⚠️ **Uso:** `!unban <ID de usuario>`\n*(No puedes mencionar a alguien baneado, necesitas su ID — revísalo con `!banlist` o desde el panel del servidor.)*');
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const exito = await desbanearUsuario(canal.server, idObjetivo);
        if (!exito) {
            return await responder('❌ No pude quitar el baneo. Verifica el ID y que el bot tenga permiso `BanMembers`.');
        }

        await responder('✅ Baneo removido.');
    }
};
