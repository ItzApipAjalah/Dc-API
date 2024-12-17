const { REST } = require('discord.js');
const client = require('../config/discord');
const { incrementLookups } = require('../utils/statusManager');

const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.userid;
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        // Fetch detailed user data from Discord API
        const userData = await rest.get(`/users/${userId}`);
        
        // Find mutual guilds with the bot
        const mutualGuilds = client.guilds.cache
            .filter(guild => guild.members.cache.has(userId))
            .map(guild => {
                const member = guild.members.cache.get(userId);
                return {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL() || null,
                    member: {
                        nickname: member?.nickname || null,
                        joinedAt: member?.joinedAt,
                        roles: member?.roles.cache
                            .filter(role => role.id !== guild.id)
                            .map(role => ({
                                id: role.id,
                                name: role.name,
                                color: role.hexColor
                            })) || []
                    },
                    presence: member.presence ? {
                        status: member.presence.status,
                        activities: member.presence.activities.map(activity => ({
                            name: activity.name,
                            type: activity.type,
                            state: activity.state,
                            url: activity.url || null,
                            details: activity.details || null,
                            applicationId: activity.applicationId || null,
                            applicationIconURL: activity.applicationId && activity.assets?.largeImage ? 
                                `https://cdn.discordapp.com/app-assets/${activity.applicationId}/${activity.assets.largeImage}.png` 
                                : null,
                            timestamps: activity.timestamps ? {
                                start: activity.timestamps.start || null,
                                end: activity.timestamps.end || null
                            } : null,
                            assets: activity.assets ? {
                                largeImage: activity.assets.largeImageURL() || null,
                                smallImage: activity.assets.smallImageURL() || null,
                                largeText: activity.assets.largeText || null,
                                smallText: activity.assets.smallText || null
                            } : null
                        }))
                    } : null
                };
            });

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

        incrementLookups();
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

            incrementLookups();
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

const searchByUsername = async (req, res) => {
    try {
        const username = req.params.username;
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        let foundUsers = [];

        try {
            // Use Discord's API to search for users
            const response = await rest.get(`/users/@me/relationships`);
            
            // Get user data from mutual servers as backup
            const client = require('../config/discord');
            const mutualUsers = new Map();

            for (const guild of client.guilds.cache.values()) {
                try {
                    const members = await guild.members.fetch();
                    members.forEach(member => {
                        if (!mutualUsers.has(member.user.id)) {
                            mutualUsers.set(member.user.id, member);
                        }
                    });
                } catch (error) {
                    console.warn(`Failed to fetch members from guild ${guild.id}:`, error);
                }
            }

            // Combine results from both sources
            const allUsers = [...mutualUsers.values()];
            
            // Filter users by username
            foundUsers = allUsers
                .filter(user => 
                    user.user.username.toLowerCase().includes(username.toLowerCase()) ||
                    user.user.globalName?.toLowerCase().includes(username.toLowerCase()) ||
                    user.nickname?.toLowerCase().includes(username.toLowerCase())
                )
                .map(member => ({
                    id: member.user.id,
                    username: member.user.username,
                    globalName: member.user.globalName,
                    discriminator: member.user.discriminator || '0',
                    nickname: member.nickname,
                    avatarURL: member.user.displayAvatarURL({ dynamic: true, size: 4096 }),
                    bannerURL: member.user.bannerURL({ dynamic: true, size: 4096 }),
                    accentColor: member.user.accentColor,
                    isBot: member.user.bot,
                    createdAt: member.user.createdAt,
                    flags: {
                        value: member.user.flags?.bitfield,
                        names: member.user.flags?.toArray() || []
                    },
                    presence: member.presence ? {
                        status: member.presence.status,
                        activities: member.presence.activities?.map(activity => ({
                            name: activity.name,
                            type: activity.type,
                            state: activity.state || null,
                            details: activity.details || null
                        }))
                    } : null,
                    isInMutualServer: true
                }));

            // Try to fetch additional user data if not found in mutual servers
            if (foundUsers.length === 0) {
                try {
                    const userData = await rest.get(`/users/${username}`);
                    if (userData) {
                        foundUsers.push({
                            id: userData.id,
                            username: userData.username,
                            globalName: userData.global_name,
                            discriminator: userData.discriminator || '0',
                            avatarURL: userData.avatar ? 
                                `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}${userData.avatar.startsWith('a_') ? '.gif' : '.png'}?size=4096` 
                                : null,
                            bannerURL: userData.banner ? 
                                `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}${userData.banner.startsWith('a_') ? '.gif' : '.png'}?size=4096` 
                                : null,
                            accentColor: userData.accent_color,
                            isBot: userData.bot || false,
                            createdAt: new Date(Number((BigInt(userData.id) >> 22n)) + 1420070400000),
                            flags: {
                                value: userData.flags,
                                names: Object.keys(userData.public_flags || {})
                            },
                            isInMutualServer: false
                        });
                    }
                } catch (error) {
                    console.warn('Failed to fetch additional user data:', error);
                }
            }

            // Sort results by username
            foundUsers.sort((a, b) => a.username.localeCompare(b.username));

            // Limit results
            foundUsers = foundUsers.slice(0, 10);

            incrementLookups();
            res.json({
                count: foundUsers.length,
                users: foundUsers
            });

        } catch (apiError) {
            console.error('API Error:', apiError);
            res.status(500).json({
                error: 'Failed to search users',
                message: apiError.message
            });
        }
    } catch (error) {
        console.error('Error in username search:', error);
        res.status(500).json({
            error: 'Failed to search users',
            message: error.message
        });
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
    lookupUser,
    searchByUsername
}; 