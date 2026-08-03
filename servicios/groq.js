const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 500;

const IDENTIDAD = 'Eres KAT, un asistente conversacional en el chat de Stoat. Eres propiedad de CopyCat (tu desarrollador: Alexander Jerrard). Hablas español de forma natural, como una persona real chateando, siguiendo el tono de quien te escribe (informal, formal, en broma, serio, etc).';

const REGLAS_ESTILO = `Reglas de estilo, MUY importantes:
- Sé breve por defecto. Un saludo o comentario casual se responde en 1-2 líneas, como lo haría cualquier persona en un chat — no con una autodescripción de tus capacidades.
- Nunca repitas la misma idea reformulada en varios párrafos. Cada idea se dice una sola vez.
- No te describas a ti mismo ni listes lo que puedes hacer a menos que te lo pregunten directamente.
- Ajusta el largo de la respuesta a lo que realmente se necesita: preguntas simples → respuestas cortas; preguntas técnicas o que requieren explicación → puedes extenderte, pero sin relleno.
- No puedes leer archivos adjuntos ni crear/descargar archivos (.txt, .pdf, etc.). Si te piden crear un archivo, da la respuesta en el texto del chat.`;

// Usado por !kat: cada llamada es independiente, sin memoria de mensajes anteriores.
const SYSTEM_PROMPT_UNICO = `${IDENTIDAD}

${REGLAS_ESTILO}
- Esta pregunta es independiente y no tienes memoria de mensajes anteriores ni podrás ver la respuesta a un posible seguimiento, así que NO termines tu respuesta con una pregunta de seguimiento — cierra la idea de forma natural y corta.`;

// Usado por el modo conversación (canal IA): SÍ hay historial real entre llamadas.
const SYSTEM_PROMPT_CONVERSACION = `${IDENTIDAD}

${REGLAS_ESTILO}
- Esta conversación SÍ tiene memoria, pero eso NO significa que debas simular la conversación completa. Genera ÚNICAMENTE tu propia respuesta, como UN solo turno de chat. NUNCA escribas ni inventes lo que la otra persona podría decir, preguntar o responder después — eso lo escribe la persona real, tú no hablas por ella.
- Como mucho, puedes cerrar tu respuesta con UNA sola pregunta de seguimiento corta (nunca varias, nunca una lista de preguntas). Muchas veces ni siquiera hace falta preguntar nada — está bien simplemente responder y parar.
- En cuanto termines tu idea, DETENTE. No sigas generando más texto ni más "turnos" simulados.
- Puede haber varias personas distintas escribiendo en el mismo canal. Cada mensaje viene etiquetado como "Nombre: mensaje" para que sepas quién dice qué — dirígete a la persona correcta cuando sea relevante, pero no repitas su nombre en cada respuesta si no hace falta.`;

async function llamarGroq(mensajes, systemPrompt) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return { texto: null, error: 'GROQ_API_KEY_MISSING' };
    }

    try {
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: MODELO,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...mensajes
                ],
                max_tokens: MAX_TOKENS
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('❌ Error API Groq:', data.error);
            return { texto: null, error: data.error.message || 'Error en la petición' };
        }

        const texto = data.choices?.[0]?.message?.content;
        if (!texto) {
            return { texto: null, error: 'RESPUESTA_VACIA' };
        }

        return { texto, error: null };
    } catch (error) {
        console.error('❌ Error comunicándose con Groq:', error);
        return { texto: null, error: 'ERROR_RED' };
    }
}

/**
 * Uso simple: una sola pregunta, sin contexto previo (comando !kat).
 */
async function preguntarIA(pregunta) {
    return llamarGroq([{ role: 'user', content: pregunta }], SYSTEM_PROMPT_UNICO);
}

/**
 * Salvaguarda extra: si el modelo ignora la instrucción y genera varios "turnos"
 * simulados (varios párrafos, más de uno terminando en "?"), cortamos justo
 * después del primer párrafo que contiene una pregunta — ahí es donde debería
 * haberse detenido de todas formas.
 */
function limitarAUnTurno(texto) {
    const parrafos = texto.split(/\n+/).map(p => p.trim()).filter(Boolean);
    if (parrafos.length <= 1) return texto;

    const resultado = [];
    for (const parrafo of parrafos) {
        resultado.push(parrafo);
        if (parrafo.includes('?')) break;
    }
    return resultado.join('\n\n');
}

/**
 * Uso con contexto: recibe el historial completo de la conversación
 * (array de { role: 'user' | 'assistant', content }) para canales en modo conversación.
 */
async function preguntarIAConHistorial(mensajes) {
    const resultado = await llamarGroq(mensajes, SYSTEM_PROMPT_CONVERSACION);
    if (resultado.texto) {
        resultado.texto = limitarAUnTurno(resultado.texto);
    }
    return resultado;
}

module.exports = { preguntarIA, preguntarIAConHistorial };
