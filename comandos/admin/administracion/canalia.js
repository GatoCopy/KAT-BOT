const { activarCanal, desactivarCanal, esCanalIA } = require('../../../servicios/canalesIA');
const { limpiarHistorial } = require('../../../utilidades/historialIA');

module.exports = {
    nombre: 'canalia',
    descripcion: 'Activa/desactiva que !kat recuerde la conversación en este canal (hasta 20 peticiones)',
    categoria: 'ia',
    soloAdmin: true, // se fuerza también por estar en comandos/admin/, queda explícito a propósito

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        if (accion === 'on' || accion === 'activar') {
            activarCanal(evento.channel, evento.author);
            limpiarHistorial(evento.channel); // arrancar con memoria limpia
            return await responder(
                '✅ **Memoria activada** en este canal.\n' +
                'A partir de ahora, `!kat` recordará hasta las últimas **20 peticiones** de la conversación aquí, en vez de responder cada pregunta de forma aislada.'
            );
        }

        if (accion === 'off' || accion === 'desactivar') {
            desactivarCanal(evento.channel);
            limpiarHistorial(evento.channel);
            return await responder('🔕 Memoria **desactivada** en este canal. `!kat` vuelve a responder cada pregunta sin recordar nada anterior.');
        }

        const estaActivo = esCanalIA(evento.channel);
        await responder(
            `ℹ️ Este canal tiene la memoria de \`!kat\` **${estaActivo ? 'activada' : 'desactivada'}**.\n` +
            'Usa `!canalia on` o `!canalia off` para cambiarlo.'
        );
    }
};
