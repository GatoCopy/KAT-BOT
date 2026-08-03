const { enviarMensaje } = require('./api');
const { obtenerRecordatoriosVencidos, marcarEnviado } = require('./recordatorios');

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

module.exports = { iniciarSchedulerRecordatorios };
