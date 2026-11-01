const { obtenerCanal } = require('../../../servicios/api');
const { registrarAccion } = require('../../../servicios/logs');
const { limpiarId } = require('../../../utilidades/parseMencion');

const MAX_LARGO = 500;

module.exports = {
    nombre: 'nota',
    descripcion: 'Guarda una nota interna sobre un usuario (aparece en !historial, no le llega al usuario)',
    categoria: 'moderacion',

    ejecutar: async (evento, args, responder) => {
        const idObjetivo = limpiarId(args[0]);
        const texto = args.slice(1).join(' ').trim();

        if (!idObjetivo || !texto) {
            return await responder('⚠️ **Uso:** `!nota <@usuario> <texto>`\nEj: `!nota @Copy Pidió disculpas en privado, dar segunda oportunidad.`');
        }

        if (texto.length > MAX_LARGO) {
            return await responder(`⚠️ La nota es demasiado larga (máximo **${MAX_LARGO}** caracteres).`);
        }

        const canal = await obtenerCanal(evento.channel);
        if (!canal?.server) {
            return await responder('⚠️ Este comando solo funciona dentro de un servidor.');
        }

        await registrarAccion({
            servidorId: canal.server,
            tipo: 'nota',
            usuarioId: idObjetivo,
            moderadorId: evento.author,
            detalle: `**Nota:** ${texto}`
        });

        await responder('📝 Nota guardada. Puedes verla con `!historial`.');
    }
};
