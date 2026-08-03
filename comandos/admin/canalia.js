const { activarCanal, desactivarCanal, esCanalIA } = require('../../servicios/canalesIA');
const { limpiarHistorial } = require('../../utilidades/historialIA');

module.exports = {
    nombre: 'canalia',
    descripcion: 'Activa/desactiva que KAT responda automáticamente (sin !kat) en este canal',
    categoria: 'ia',
    soloAdmin: true, // se fuerza también por estar en comandos/admin/, queda explícito a propósito

    ejecutar: async (evento, args, responder) => {
        const accion = (args[0] || '').toLowerCase();

        if (accion === 'on' || accion === 'activar') {
            activarCanal(evento.channel, evento.author);
            limpiarHistorial(evento.channel); // arrancar con una conversación limpia
            return await responder(
                '✅ **Modo conversación activado** en este canal.\n' +
                'Ahora respondo a todo lo que se escriba aquí, sin necesidad de `!kat`.\n' +
                '*(Los mensajes que empiecen con `!` se siguen tratando como comandos normales.)*'
            );
        }

        if (accion === 'off' || accion === 'desactivar') {
            desactivarCanal(evento.channel);
            limpiarHistorial(evento.channel);
            return await responder('🔕 Modo conversación **desactivado** en este canal.');
        }

        const estaActivo = esCanalIA(evento.channel);
        await responder(
            `ℹ️ Este canal tiene el modo conversación **${estaActivo ? 'activado' : 'desactivado'}**.\n` +
            'Usa `!canalia on` o `!canalia off` para cambiarlo.'
        );
    }
};
