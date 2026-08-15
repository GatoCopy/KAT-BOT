const { obtenerCanal } = require('../../../servicios/api');
const { configurarRol, obtenerConfigRoles } = require('../../../servicios/roles');
const { limpiarId } = require('../../../utilidades/parseMencion');
const { invalidar } = require('../../../utilidades/cacheContextoServidor');

module.exports = {
    nombre: 'setrol',
    descripcion: 'Configura qué rol del servidor cuenta como moderador o administrador de KAT',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        const tipo = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (tipo === 'moderador' || tipo === 'administrador') {
            const idRol = limpiarId(args[1]);
            if (!idRol) {
                return await responder(`⚠️ **Uso:** \`!setrol ${tipo} <ID o mención del rol>\``);
            }

            configurarRol(canal.server, tipo, idRol);
            invalidar(canal.server);
            return await responder(
                `✅ Rol de **${tipo}** configurado: <@&${idRol}>.\n` +
                `Cualquiera con ese rol ahora tiene ese nivel de acceso en KAT.`
            );
        }

        if (tipo === 'ver') {
            const config = obtenerConfigRoles(canal.server);
            return await responder(
                'ℹ️ **Configuración actual de roles:**\n' +
                `Moderador: ${config.rol_moderador_id ? `<@&${config.rol_moderador_id}>` : '*no configurado*'}\n` +
                `Administrador: ${config.rol_administrador_id ? `<@&${config.rol_administrador_id}>` : '*no configurado*'}\n\n` +
                '*El dueño del servidor y cualquiera con permisos nativos de Discord (Kick/Ban/Administrator) siempre cuentan como administrador, sin importar esta configuración.*'
            );
        }

        await responder(
            '⚠️ **Uso:**\n' +
            '`!setrol moderador <ID o mención del rol>` — quién puede usar comandos de moderación\n' +
            '`!setrol administrador <ID o mención del rol>` — quién puede usar moderación Y configuración (autoroles, filtros, logs, etc.)\n' +
            '`!setrol ver` — muestra la configuración actual'
        );
    }
};
