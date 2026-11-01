const { obtenerCanal, obtenerRol } = require('../../servicios/api');
const { COLOR_SERVER } = require('../../config/constantes');
const { limpiarId } = require('../../utilidades/parseMencion');

module.exports = {
    nombre: 'roleinfo',
    descripcion: 'Muestra información de un rol. Ej: !roleinfo @rol',
    categoria: 'utilidad',

    ejecutar: async (evento, args, responder) => {
        const idRol = limpiarId(args[0]);
        if (!idRol) {
            return await responder('⚠️ **Uso:** `!roleinfo <@rol o ID>`');
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        const rol = await obtenerRol(canal.server, idRol);
        if (!rol) {
            return await responder('❌ No encontré ese rol en este servidor.');
        }

        const si = (v) => (v ? 'Sí' : 'No');
        const creado = rol.creadoEn.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

        await responder({
            embeds: [{
                title: `🎭 ${rol.nombre}`,
                description:
                    `**ID:** \`${rol.id}\`\n` +
                    `**Color:** ${rol.colorHex}\n` +
                    `**Miembros:** ${rol.miembros}\n` +
                    `**Posición:** ${rol.posicion}\n` +
                    `**Mencionable:** ${si(rol.mencionable)}\n` +
                    `**Se muestra por separado:** ${si(rol.separado)}\n` +
                    `**Gestionado por integración:** ${si(rol.gestionado)}\n` +
                    `**Creado:** ${creado}`,
                colour: COLOR_SERVER
            }]
        });
    }
};
