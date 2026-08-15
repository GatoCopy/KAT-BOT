const { permitirCanal, quitarCanal, listarCanalesPermitidos } = require('../../../servicios/canalesLinks');
const { obtenerCanal } = require('../../../servicios/api');

module.exports = {
    nombre: 'linkscanal',
    descripcion: 'Administra en qué canales se permite compartir links (requiere !filtrolinks on)',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (accion === 'permitir') {
            permitirCanal(canal.server, evento.channel);
            return await responder('✅ Este canal ahora permite links, aunque el filtro esté activado en el resto del servidor.');
        }

        if (accion === 'quitar') {
            const eliminado = quitarCanal(canal.server, evento.channel);
            return await responder(eliminado ? '✅ Este canal ya no está en la lista de permitidos.' : 'ℹ️ Este canal no estaba en la lista.');
        }

        if (accion === 'lista') {
            const canales = listarCanalesPermitidos(canal.server);
            if (!canales.length) {
                return await responder('📭 No hay canales en la lista de permitidos todavía.');
            }
            return await responder(`✅ Canales donde se permiten links:\n${canales.map(c => `<#${c}>`).join('\n')}`);
        }

        await responder(
            '⚠️ **Uso** (ejecútalo dentro del canal que quieras afectar):\n' +
            '`!linkscanal permitir` — permite links en este canal\n' +
            '`!linkscanal quitar` — quita este canal de la lista de permitidos\n' +
            '`!linkscanal lista` — muestra todos los canales permitidos del servidor'
        );
    }
};
