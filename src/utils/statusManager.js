const client = require('../config/discord');

// Helper functions with safety checks
function getTotalUsers() {
    try {
        return client?.guilds?.cache?.reduce((acc, guild) => acc + (guild.memberCount || 0), 0).toLocaleString() || '0';
    } catch (error) {
        console.error('Error getting total users:', error);
        return '0';
    }
}

function getServerCount() {
    try {
        return client?.guilds?.cache?.size?.toLocaleString() || '0';
    } catch (error) {
        console.error('Error getting server count:', error);
        return '0';
    }
}

// Global counters for statistics
let dailyLookups = 0;

function getTotalLookups() {
    return dailyLookups.toLocaleString();
}

function getUptime() {
    try {
        const uptime = Date.now() - startTime;
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    } catch (error) {
        console.error('Error calculating uptime:', error);
        return '0h';
    }
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

// Reset daily stats at midnight
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        dailyLookups = 0;
    }
}, 60000); // Check every minute

module.exports = {
    incrementLookups
}; 