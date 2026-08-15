const { obtenerCanal } = require('../../../servicios/api');
const { agregarPalabra, quitarPalabra, obtenerPalabrasProhibidas } = require('../../../servicios/palabrasProhibidas');
const { actualizarConfigAutomod } = require('../../../servicios/automodConfig');
const { COLOR_SERVER } = require('../../../config/constantes');

module.exports = {
    nombre: 'palabraprohibida',
    descripcion: 'Administra la lista de palabras prohibidas del servidor (se borran y se avisa, sin warn formal)',
    categoria: 'administracion',

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        if (accion === 'agregar' || accion === 'add') {
            const palabra = args.slice(1).join(' ').trim();
            if (!palabra) {
                return await responder('⚠️ **Uso:** `!palabraprohibida agregar <palabra>`');
            }

            agregarPalabra(canal.server, palabra);
            actualizarConfigAutomod(canal.server, { filtro_palabras_activado: 1 });

            return await responder(`✅ \`${palabra}\` agregada a la lista. El filtro de palabras queda **activado** automáticamente en este servidor.`);
        }

        if (accion === 'quitar' || accion === 'remove') {
            const palabra = args.slice(1).join(' ').trim();
            if (!palabra) {
                return await responder('⚠️ **Uso:** `!palabraprohibida quitar <palabra>`');
            }

            const eliminada = quitarPalabra(canal.server, palabra);
            return await responder(eliminada ? '✅ Palabra eliminada de la lista.' : '❌ Esa palabra no estaba en la lista.');
        }

        if (accion === 'lista' || accion === 'list') {
            const palabras = obtenerPalabrasProhibidas(canal.server);
            if (!palabras.length) {
                return await responder('📭 No hay palabras prohibidas configuradas en este servidor.');
            }

            return await responder({
                embeds: [{
                    type: 'Text',
                    title: '🚫 Palabras prohibidas',
                    description: palabras.map(p => `\`${p}\``).join(', '),
                    colour: COLOR_SERVER
                }]
            });
        }

        await responder(
            '⚠️ **Uso:**\n' +
            '`!palabraprohibida agregar <palabra>`\n' +
            '`!palabraprohibida quitar <palabra>`\n' +
            '`!palabraprohibida lista`'
        );
    }
};
