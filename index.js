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

cargarComandos(path.join(__dirname, 'comandos'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

setClient(client);

for (const [nombreEvento, handler] of eventos.entries()) {
    client.on(nombreEvento, handler);
}

iniciarSchedulerRecordatorios();

client.login(TOKEN);
