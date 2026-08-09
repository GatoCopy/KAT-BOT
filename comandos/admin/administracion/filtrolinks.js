const { obtenerCanal } = require('../../../servicios/api');
const { obtenerConfigAutomod, actualizarConfigAutomod } = require('../../../servicios/automodConfig');

module.exports = {
    nombre: 'filtrolinks',
    descripcion: 'Activa/desactiva que se bloqueen links fuera de los canales permitidos',
    categoria: 'admin',
    soloAdmin: true,

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (accion === 'on' || accion === 'activar') {
            actualizarConfigAutomod(canal.server, { filtro_links_activado: 1 });
            return await responder(
                '✅ Filtro de links **activado**. Se borrará cualquier link en canales que NO estén en la lista de permitidos.\n' +
                'Usa `!linkscanal permitir` en los canales donde sí quieras que se compartan links.'
            );
        }

        if (accion === 'off' || accion === 'desactivar') {
            actualizarConfigAutomod(canal.server, { filtro_links_activado: 0 });
            return await responder('🔕 Filtro de links **desactivado**.');
        }

        const config = obtenerConfigAutomod(canal.server);
        await responder(`ℹ️ El filtro de links está **${config.filtro_links_activado ? 'activado' : 'desactivado'}**. Usa \`!filtrolinks on\` o \`!filtrolinks off\`.`);
    }
};
