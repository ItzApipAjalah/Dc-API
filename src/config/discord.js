const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

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
    
    // Set the bot's activity
    client.user.setPresence({
        activities: [
            {
                name: 'https://discordlookup.amwp.website/',
                type: ActivityType.Playing,
                url: 'https://discordlookup.amwp.website/'
            }
        ],
        status: 'online'
    });

    // Optional: Rotate between multiple statuses
    const activities = [
        {
            name: 'https://discordlookup.amwp.website/',
            type: ActivityType.Playing
        },
        {
            name: `${client.guilds.cache.size} servers`,
            type: ActivityType.Watching
        },
        {
            name: 'User Lookups',
            type: ActivityType.Listening
        }
    ];

    let currentActivity = 0;
    
    // Change activity every 10 seconds
    setInterval(() => {
        const activity = activities[currentActivity];
        client.user.setActivity(activity.name, { type: activity.type });
        currentActivity = (currentActivity + 1) % activities.length;
    }, 10000);
});

module.exports = client; 