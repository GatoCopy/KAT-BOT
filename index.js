require('dotenv').config();
const path = require('path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const { setClient } = require('./servicios/discordClient');
const { TOKEN } = require('./servicios/api');
const { cargarComandos } = require('./utilidades/cargadorComandos');
const { iniciarSchedulerRecordatorios } = require('./servicios/scheduler');
const eventos = require('./eventos');

if (!TOKEN) {
    console.error('❌ Error: No se encontró DISCORD_TOKEN (o BOT_TOKEN/TOKEN) en el archivo .env');
    process.exit(1);
}

// Cargar todos los comandos desde la carpeta principal
cargarComandos(path.join(__dirname, 'comandos'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,          // necesario para leer texto de comandos con !prefijo
        GatewayIntentBits.GuildMembers,             // necesario para kick/ban/roles/autoroles
        GatewayIntentBits.GuildMessageReactions,    // necesario para autoroles por reacción
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

setClient(client);

for (const [nombreEvento, handler] of eventos.entries()) {
    client.on(nombreEvento, handler);
}

// El scheduler de recordatorios corre independiente de discord.js — usa la
// API REST directamente, así que sigue funcionando aunque el gateway se
// esté reconectando.
iniciarSchedulerRecordatorios();

client.login(TOKEN);
