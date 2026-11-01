const { enviarMensaje, desbanearUsuario } = require('./api');
const { obtenerRecordatoriosVencidos, marcarEnviado } = require('./recordatorios');
const { obtenerTempbansVencidos, marcarTempbanProcesado } = require('./tempbans');
const { registrarAccion } = require('./logs');

const INTERVALO_MS = 15000; // revisa cada 15 segundos

function iniciarSchedulerRecordatorios() {
    setInterval(async () => {
        const vencidos = obtenerRecordatoriosVencidos();

        for (const recordatorio of vencidos) {
            // Marcamos como enviado ANTES de mandar el mensaje, para que si el envío
            // falla o tarda, el siguiente ciclo del intervalo no lo mande duplicado.
            marcarEnviado(recordatorio.id);
            await enviarMensaje(
                recordatorio.canal_id,
                `⏰ <@${recordatorio.usuario_id}> ¡Recordatorio! ${recordatorio.mensaje}`
            );
        }
    }, INTERVALO_MS);

    console.log(`⏰ Scheduler de recordatorios activo (revisa cada ${INTERVALO_MS / 1000}s).`);
}

/**
 * Levanta los baneos temporales (!tempban) cuando se cumple su tiempo.
 * Si el bot estuvo apagado cuando venció uno, se levanta apenas vuelve a arrancar.
 */
function iniciarSchedulerTempbans() {
    setInterval(async () => {
        const vencidos = obtenerTempbansVencidos();

        for (const tempban of vencidos) {
            // Igual que con los recordatorios: se marca antes para no repetir el intento.
            marcarTempbanProcesado(tempban.id);

            const exito = await desbanearUsuario(tempban.servidor_id, tempban.usuario_id, 'Baneo temporal cumplido');
            if (!exito) continue; // ya estaba desbaneado a mano, o el bot perdió el permiso

            await registrarAccion({
                servidorId: tempban.servidor_id,
                tipo: 'unban',
                usuarioId: tempban.usuario_id,
                moderadorId: null,
                detalle: '**Motivo:** baneo temporal cumplido (automático)',
            });
        }
    }, INTERVALO_MS);

    console.log(`⏳ Scheduler de baneos temporales activo (revisa cada ${INTERVALO_MS / 1000}s).`);
}

module.exports = { iniciarSchedulerRecordatorios, iniciarSchedulerTempbans };
