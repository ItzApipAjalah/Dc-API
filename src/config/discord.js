const { Client, GatewayIntentBits, ActivityType, Collection } = require('discord.js');
const { statusRotation } = require('../utils/statusManager');
const lookupCommands = require('../commands/lookupCommands');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent
    ]
});

// Add commands collection
client.commands = new Collection();

// Register commands
Object.values(lookupCommands).forEach(command => {
    client.commands.set(command.data.name, command);
});

// Handle interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error executing this command!',
            ephemeral: true
        });
    }
});

// Set bot status when ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Set initial status
    client.user.setPresence({
        activities: [
            {
                name: 'discordlookup.amwp.website',
                type: ActivityType.Playing
            }
        ],
        status: 'online'
    });

    // Start status rotation
    let currentIndex = 0;
    
    function updateStatus() {
        const status = statusRotation[currentIndex];
        client.user.setActivity(status.name(), { type: status.type });
        currentIndex = (currentIndex + 1) % statusRotation.length;
        setTimeout(updateStatus, status.interval);
    }

    updateStatus();
});

module.exports = client; 