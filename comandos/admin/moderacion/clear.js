const { enviarMensaje, obtenerMensajes, eliminarMensajesEnBloque, eliminarMensaje } = require('../../../servicios/api');

module.exports = {
    nombre: 'clear',
    descripcion: 'Elimina una cantidad de mensajes recientes del canal',
    categoria: 'admin',
    soloAdmin: true, // ¡Importante! Solo admins deben poder borrar mensajes

    async ejecutar(evento, args, responder) {
        const cantidad = parseInt(args[0]);

        if (isNaN(cantidad) || cantidad < 1 || cantidad > 100) {
            return await responder('⚠️ Especifica un número de mensajes válido para borrar (entre **1** y **100**).\n*Ejemplo:* `!clear 10`');
        }

        const channelId = evento.channel;

        try {
            await enviarMensaje(channelId, `🧹 Buscando y eliminando los últimos **${cantidad}** mensajes...`);

            // Pedimos 'cantidad + 2' para incluir el comando del usuario y nuestro aviso
            const mensajes = await obtenerMensajes(channelId, cantidad + 2);

            if (!mensajes) {
                return await responder('❌ Ocurrió un error al intentar obtener los mensajes del canal.');
            }

            const idsABorrar = mensajes.map(msj => msj._id);
            const eliminados = await eliminarMensajesEnBloque(channelId, idsABorrar);

            const msjExito = await enviarMensaje(channelId, `✅ Se han eliminado **${eliminados}** mensajes con éxito.`);

            // Borrar el mensaje de éxito automáticamente tras 3 segundos
            if (msjExito?._id) {
                setTimeout(() => {
                    eliminarMensaje(channelId, msjExito._id).catch(() => {});
                }, 3000);
            }

        } catch (error) {
            console.error('Error al ejecutar !clear:', error);
            await responder('❌ Hubo un fallo al intentar borrar los mensajes.');
        }
    }
};
