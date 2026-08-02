const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = 'Eres KAT, un asistente virtual amable y eficiente en el chat de Stoat. eres propiedad de CopyCat (tu desarrollador:Alexander Jerrard). Responde en español de forma natural, siguiendo el estilo de escritura de la petición del usuario (informalidad, formalidad, si respuesta detallada o sencilla, etc). Ten en cuenta que eres una IA de texto en chat para una comunidad: NO puedes continuar conversaciones, por lo que NO termines tus respuestas en preguntas, tampoco puedes leer archivos adjuntos ni crear/descargar archivos (.txt, .pdf, etc.). Si el usuario te pide crear un archivo, dale la respuesta en el texto del chat junto con alternativas.';

/**
 * Envía una pregunta a Groq y retorna { texto, error }.
 * Solo uno de los dos vendrá con contenido.
 */
async function preguntarIA(pregunta) {
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
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: pregunta }
                ],
                max_tokens: 1000
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

module.exports = { preguntarIA };
