const { REST } = require('discord.js');
const client = require('../config/discord');

const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.userid;
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        // Fetch detailed user data from Discord API
        const userData = await rest.get(`/users/${userId}`);
        
        // Find mutual guilds with the bot
        const mutualGuilds = client.guilds.cache
            .filter(guild => guild.members.cache.has(userId))
            .map(guild => ({
                id: guild.id,
                name: guild.name,
                icon: guild.iconURL() || null,
                member: {
                    nickname: guild.members.cache.get(userId)?.nickname || null,
                    joinedAt: guild.members.cache.get(userId)?.joinedAt,
                    roles: guild.members.cache.get(userId)?.roles.cache
                        .filter(role => role.id !== guild.id)
                        .map(role => ({
                            id: role.id,
                            name: role.name,
                            color: role.hexColor
                        })) || []
                }
            }));

        // Get user presence if available
        let presence = null;
        mutualGuilds.some(guild => {
            const member = client.guilds.cache.get(guild.id)?.members.cache.get(userId);
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

        const response = {
            id: userData.id,
            username: userData.username,
            globalName: userData.global_name || null,
            discriminator: userData.discriminator || '0',
            avatarURL: userData.avatar ? 
                `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}${userData.avatar.startsWith('a_') ? '.gif' : '.png'}?size=4096` 
                : null,
            bannerURL: userData.banner ? 
                `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}${userData.banner.startsWith('a_') ? '.gif' : '.png'}?size=4096` 
                : null,
            accentColor: userData.accent_color,
            flags: {
                value: userData.flags,
                names: Object.keys(userData.public_flags || {})
            },
            createdAt: new Date(Number((BigInt(userData.id) >> 22n)) + 1420070400000),
            isBot: userData.bot || false,
            presence: presence,
            mutualGuilds: mutualGuilds,
            avatarDecoration: userData.avatar_decoration,
            premiumType: userData.premium_type
        };

        res.json(response);
    } catch (error) {
        handleError(error, res);
    }
};

const lookupUser = async (req, res) => {
    try {
        const userId = req.params.userid;
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        try {
            const userData = await rest.get(`/users/${userId}`);

            const response = {
                id: userData.id,
                username: userData.username,
                globalName: userData.global_name || null,
                discriminator: userData.discriminator || '0',
                avatarURL: userData.avatar ? 
                    `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}${userData.avatar.startsWith('a_') ? '.gif' : '.png'}?size=4096` 
                    : null,
                bannerURL: userData.banner ? 
                    `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}${userData.banner.startsWith('a_') ? '.gif' : '.png'}?size=4096` 
                    : null,
                accentColor: userData.accent_color,
                flags: {
                    value: userData.flags,
                    names: Object.keys(userData.public_flags || {})
                },
                createdAt: new Date(Number((BigInt(userData.id) >> 22n)) + 1420070400000),
                isBot: userData.bot || false,
                avatarDecoration: userData.avatar_decoration,
                premiumType: userData.premium_type,
                isInMutualServer: false
            };

            res.json(response);
        } catch (apiError) {
            if (apiError.code === 10013) {
                return res.status(404).json({
                    error: 'User not found',
                    message: 'The specified user ID does not exist'
                });
            }
            throw apiError;
        }
    } catch (error) {
        handleError(error, res);
    }
};

const handleError = (error, res) => {
    console.error('Error in user controller:', error);
    
    if (error.code === 10013) {
        return res.status(404).json({
            error: 'User not found',
            message: 'The specified user ID does not exist'
        });
    }

    res.status(500).json({
        error: 'Failed to fetch user details',
        message: error.message
    });
};

module.exports = {
    getUserDetails,
    lookupUser
}; 