const { REST } = require('discord.js');
const client = require('../config/discord');

let lastStatus = null;
let lastCheck = null;

const monitorUser = async (req, res) => {
    try {
        const userId = '481734993622728715'; // AMWP's user ID
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        // Get user data from Discord API
        const userData = await rest.get(`/users/${userId}`);
        
        // Get presence data if user is in mutual server
        let presence = null;
        client.guilds.cache.some(guild => {
            const member = guild.members.cache.get(userId);
            if (member?.presence) {
                presence = {
                    status: member.presence.status,
                    activities: member.presence.activities?.map(activity => ({
                        name: activity.name,
                        type: activity.type,
                        state: activity.state || null,
                        details: activity.details || null,
                        url: activity.url || null,
                        createdAt: activity.createdAt
                    })) || []
                };
                return true;
            }
            return false;
        });

        const currentStatus = {
            timestamp: new Date(),
            user: {
                id: userData.id,
                username: userData.username,
                globalName: userData.global_name || null,
                avatarURL: userData.avatar ? 
                    `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}${userData.avatar.startsWith('a_') ? '.gif' : '.png'}?size=4096` 
                    : null,
            },
            presence: presence,
            uptime: process.uptime(),
            lastCheck: lastCheck,
            statusChanged: lastStatus?.presence?.status !== presence?.status
        };

        // Update last status
        lastStatus = currentStatus;
        lastCheck = new Date();

        res.json(currentStatus);
    } catch (error) {
        console.error('Monitor error:', error);
        res.status(500).json({
            error: 'Monitor error',
            message: error.message,
            lastStatus: lastStatus,
            lastCheck: lastCheck
        });
    }
};

module.exports = {
    monitorUser
}; 