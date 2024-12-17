const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { statusRotation } = require('../utils/statusManager');

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