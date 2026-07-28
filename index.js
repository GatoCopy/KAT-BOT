const WebSocket = require('ws');
require('dotenv').config();

const TOKEN = process.env.BOT_TOKEN ? process.env.BOT_TOKEN.trim() : '';
const API_URL = 'https://api.revolt.chat';

if (!TOKEN) {
    console.error('❌ Error: No se encontró BOT_TOKEN en el archivo .env');
    process.exit(1);
}

// Función universal para enviar mensajes al chat
async function enviarMensaje(channelId, contenido) {
    try {
        const response = await fetch(`${API_URL}/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'x-bot-token': TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: contenido })
        });
        if (!response.ok) {
            const errText = await response.text();
            console.error('❌ Error enviando mensaje HTTP:', response.status, errText);
        } else {
            console.log('✅ Mensaje enviado al chat');
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
    }
}

function conectarBot() {
    const ws = new WebSocket('wss://ws.revolt.chat');
    let miBotId = null; // Guardamos el ID del bot para ignorar sus propios mensajes

    ws.on('open', () => {
        console.log('🔗 Conectando WebSocket a Stoat...');
        ws.send(JSON.stringify({
            type: 'Authenticate',
            token: TOKEN
        }));
    });

    ws.on('message', async (data) => {
        try {
            const evento = JSON.parse(data.toString());

            // Al autenticar, guardamos los datos del bot
            if (evento.type === 'Authenticated') {
                console.log('🤖 ¡KAT está VIVO Y AUTENTICADO EXITOSAMENTE!');
                console.log('📌 Comandos activos: !ping, !hola, !dado, !8ball, !chiste');
            }

            if (evento.type === 'Ready') {
                // Guardamos el ID de nuestro bot para no respondernos a nosotros mismos
                if (evento.users) {
                    const botUser = evento.users.find(u => u.bot);
                    if (botUser) miBotId = botUser._id;
                }
            }

            // Detectar mensajes nuevos
            if (evento.type === 'Message') {
                // Ignorar si el mensaje lo envió el propio bot
                if (evento.author === miBotId) return;

                const texto = typeof evento.content === 'string' ? evento.content.trim() : '';
                console.log(`💬 Mensaje recibido: "${texto}" en canal: ${evento.channel}`);

                // COMANDO: !ping
                if (texto === '!ping') {
                    await enviarMensaje(evento.channel, '¡Pong! 🏓 ¡Estoy vivo y veloz!');
                }

                // COMANDO: !hola
                else if (texto === '!hola') {
                    await enviarMensaje(evento.channel, '¡Holaaa! 👋 ¿Cómo estás?');
                }

                // COMANDO: !dado
                else if (texto === '!dado') {
                    const numero = Math.floor(Math.random() * 6) + 1;
                    await enviarMensaje(evento.channel, `🎲 Sacaste un: **${numero}**`);
                }

                // COMANDO: !8ball
                else if (texto.startsWith('!8ball')) {
                    const respuestas = [
                        'Sí, totalmente. 🔮',
                        'No lo creo... ❌',
                        'Definitivamente sí. ✨',
                        'Pregúntame más tarde, estoy durmiendo. 😴',
                        'Mis fuentes dicen que no. 🤫',
                        '¡Por supuesto que sí! 🔥'
                    ];
                    const aleatorio = respuestas[Math.floor(Math.random() * respuestas.length)];
                    await enviarMensaje(evento.channel, `🎱 **Bola Mágica:** ${aleatorio}`);
                }

                // COMANDO: !chiste
                else if (texto === '!chiste') {
                    const chistes = [
                        '¿Qué le dice un bit a otro? Nos vemos en el bus. 😂',
          '¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter. 🐦',
          'Hay 10 tipos de personas en el mundo: las que entienden binario y las que no. 🤓'
                    ];
                    const chiste = chistes[Math.floor(Math.random() * chistes.length)];
                    await enviarMensaje(evento.channel, `🤖 ${chiste}`);
                }
            }
        } catch (e) {
            console.error('⚠️ Error procesando evento:', e);
        }
    });

    ws.on('close', () => {
        console.log('⚠️ Conexión cerrada. Reintentando en 3 segundos...');
        setTimeout(conectarBot, 3000);
    });

    ws.on('error', (err) => {
        console.error('❌ Error en WebSocket:', err.message);
    });
}

conectarBot();
