const client = require('../config/discord');

// Helper functions
function getTotalUsers() {
    return client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString();
}

function getServerCount() {
    return client.guilds.cache.size.toLocaleString();
}

// Global counters for statistics
let dailyLookups = 0;
let apiRequests = 0;
let startTime = Date.now();

function getTotalLookups() {
    return dailyLookups.toLocaleString();
}

function getUptime() {
    const uptime = Date.now() - startTime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
}

function getApiRequests() {
    return apiRequests.toLocaleString();
}

function getAverageResponseTime() {
    // Placeholder - implement actual response time tracking if needed
    return "100";
}

function getApiStatus() {
    return "Operational";
}

// Increment counters
function incrementLookups() {
    dailyLookups++;
}

function incrementApiRequests() {
    apiRequests++;
}

// Reset daily stats at midnight
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        dailyLookups = 0;
    }
}, 60000); // Check every minute

// Status configuration
const statusSuggestions = {
    statistics: {
        users: () => `Watching ${getTotalUsers()} users`,
        servers: () => `Active in ${getServerCount()} servers`,
        lookups: () => `${getTotalLookups()} lookups today`,
        uptime: () => `Online for ${getUptime()}`,
    },
    website: {
        url: "discordlookup.amwp.website",
        features: [
            "User Lookup",
            "Server Lookup",
            "Invite Lookup",
            "API Access"
        ]
    },
    messages: [
        "24/7 Uptime",
        "Fast & Reliable",
        "User-friendly Interface"
    ]
};

const statusRotation = [
    {
        type: 0, // Playing
        name: () => statusSuggestions.website.url,
        interval: 30000
    },
    {
        type: 3, // Watching
        name: () => statusSuggestions.statistics.users(),
        interval: 30000
    },
    {
        type: 2, // Listening
        name: () => statusSuggestions.statistics.lookups(),
        interval: 30000
    },
    {
        type: 0, // Playing
        name: () => statusSuggestions.statistics.servers(),
        interval: 30000
    }
];

module.exports = {
    statusRotation,
    incrementLookups,
    incrementApiRequests
}; 