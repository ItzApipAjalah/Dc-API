const client = require('../config/discord');
const { REST } = require('discord.js');

const getServers = (req, res) => {
    try {
        const servers = client.guilds.cache.map(guild => ({
            name: guild.name,
            id: guild.id,
            memberCount: guild.memberCount,
            icon: guild.iconURL() || 'No icon',
            owner: guild.ownerId,
            createdAt: guild.createdAt
        }));
        
        res.json({
            totalServers: servers.length,
            servers: servers
        });
    } catch (error) {
        handleError(error, res);
    }
};

const getServerDetails = async (req, res) => {
    try {
        const guild = client.guilds.cache.get(req.params.id);
        
        if (!guild) {
            return res.status(404).json({
                error: 'Server not found',
                message: 'No server found with the provided ID'
            });
        }

        // Get detailed channel information
        const channels = guild.channels.cache.map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            position: channel.position,
            parentName: channel.parent?.name || null,
            isNSFW: channel.nsfw || false,
            createdAt: channel.createdAt
        }));

        // Get detailed ban information
        const bans = await guild.bans.fetch();
        const banList = bans.map(ban => ({
            userId: ban.user.id,
            username: ban.user.username,
            reason: ban.reason
        }));

        // Get webhook information (if bot has permission)
        let webhooks = [];
        try {
            const fetchedWebhooks = await guild.fetchWebhooks();
            webhooks = fetchedWebhooks.map(webhook => ({
                name: webhook.name,
                channelId: webhook.channelId,
                createdAt: webhook.createdAt
            }));
        } catch (error) {
            webhooks = ['No permission to view webhooks'];
        }

        // Construct detailed response
        const detailedInfo = {
            general: {
                name: guild.name,
                id: guild.id,
                icon: guild.iconURL() || 'No icon',
                banner: guild.bannerURL(),
                description: guild.description,
                createdAt: guild.createdAt,
                preferredLocale: guild.preferredLocale
            },
            stats: {
                totalMembers: guild.memberCount,
                onlineMembers: guild.members.cache.filter(m => m.presence?.status === 'online').size,
                botCount: guild.members.cache.filter(m => m.user.bot).size,
                humanCount: guild.members.cache.filter(m => !m.user.bot).size,
                boostLevel: guild.premiumTier,
                boostCount: guild.premiumSubscriptionCount,
                verificationLevel: guild.verificationLevel
            },
            channels: {
                total: channels.length,
                categories: channels.filter(ch => ch.type === 4),
                text: channels.filter(ch => ch.type === 0),
                voice: channels.filter(ch => ch.type === 2),
                announcement: channels.filter(ch => ch.type === 5),
                stage: channels.filter(ch => ch.type === 13),
                forum: channels.filter(ch => ch.type === 15),
                fullList: channels
            },
            roles: guild.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor,
                position: role.position,
                memberCount: role.members.size,
                permissions: role.permissions.toArray(),
                mentionable: role.mentionable,
                managed: role.managed
            })),
            emojis: guild.emojis.cache.map(emoji => ({
                id: emoji.id,
                name: emoji.name,
                animated: emoji.animated,
                available: emoji.available,
                url: emoji.url
            })),
            stickers: guild.stickers.cache.map(sticker => ({
                id: sticker.id,
                name: sticker.name,
                description: sticker.description,
                format: sticker.format,
                available: sticker.available
            })),
            moderation: {
                bans: banList,
                explicitContentFilter: guild.explicitContentFilter,
                mfaLevel: guild.mfaLevel,
                afkTimeout: guild.afkTimeout,
                afkChannelId: guild.afkChannelId
            },
            features: guild.features,
            owner: {
                id: guild.ownerId,
                tag: guild.members.cache.get(guild.ownerId)?.user.tag,
                joinedAt: guild.members.cache.get(guild.ownerId)?.joinedAt
            },
            webhooks: webhooks,
            vanityURL: guild.vanityURLCode,
            maximumMembers: guild.maximumMembers,
            maximumPresences: guild.maximumPresences,
            systemChannelFlags: guild.systemChannelFlags.toArray()
        };

        res.json(detailedInfo);
    } catch (error) {
        handleError(error, res);
    }
};

const getServerMembers = async (req, res) => {
    try {
        const guild = client.guilds.cache.get(req.params.id);
        
        if (!guild) {
            return res.status(404).json({
                error: 'Server not found',
                message: 'No server found with the provided ID'
            });
        }

        // Get query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Fixed limit of 5 members per page

        // Fetch all members first (if not already cached)
        await guild.members.fetch();
        
        // Get total members for pagination
        const totalMembers = guild.members.cache.size;
        
        // Sort members by highest role position
        const sortedMembers = Array.from(guild.members.cache.values())
            .sort((a, b) => {
                // Get highest role position for each member
                const aHighestRole = a.roles.cache.size > 1 
                    ? Math.max(...a.roles.cache.map(role => role.position))
                    : 0;
                const bHighestRole = b.roles.cache.size > 1 
                    ? Math.max(...b.roles.cache.map(role => role.position))
                    : 0;
                
                // Sort by role position (highest first)
                if (bHighestRole !== aHighestRole) {
                    return bHighestRole - aHighestRole;
                }
                
                // If same role position, sort by username
                return a.user.username.localeCompare(b.user.username);
            });

        // Calculate pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        // Get paginated members
        const memberArray = sortedMembers.slice(startIndex, endIndex);

        const memberDetails = await Promise.all(memberArray.map(async member => {
            try {
                const userData = await member.user.fetch();
                const presence = member.presence;
                
                // Get member's roles (excluding @everyone)
                const roles = member.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => ({
                        id: role.id,
                        name: role.name,
                        color: role.hexColor,
                        position: role.position
                    }));

                return {
                    id: member.id,
                    username: userData.username,
                    globalName: userData.globalName || null,
                    nickname: member.nickname,
                    discriminator: userData.discriminator,
                    joinedAt: member.joinedAt,
                    isBot: userData.bot,
                    avatarURL: userData.displayAvatarURL({ 
                        dynamic: true, 
                        size: 4096 
                    }),
                    bannerURL: userData.bannerURL({ 
                        dynamic: true, 
                        size: 4096 
                    }),
                    accentColor: userData.accentColor,
                    status: presence?.status || 'offline',
                    activities: presence?.activities?.map(activity => ({
                        name: activity.name,
                        type: activity.type,
                        state: activity.state || null
                    })) || [],
                    roles: roles,
                    highestRole: roles[0] || null
                };
            } catch (error) {
                console.warn(`Failed to fetch detailed data for user ${member.user.id}:`, error);
                return {
                    id: member.id,
                    username: member.user.username,
                    globalName: member.user.globalName,
                    nickname: member.nickname,
                    discriminator: member.user.discriminator,
                    joinedAt: member.joinedAt,
                    isBot: member.user.bot,
                    avatarURL: member.user.displayAvatarURL({ dynamic: true, size: 4096 }),
                    status: member.presence?.status || 'offline',
                    activities: member.presence?.activities?.map(activity => ({
                        name: activity.name,
                        type: activity.type,
                        state: activity.state
                    })) || [],
                    roles: [],
                    highestRole: null
                };
            }
        }));

        const totalPages = Math.ceil(totalMembers / limit);

        const response = {
            total: totalMembers,
            page,
            limit,
            totalPages,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
            members: memberDetails
        };

        res.json(response);
    } catch (error) {
        handleError(error, res);
    }
};

const getServerInfo = async (req, res) => {
    try {
        const serverId = req.params.id;
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        // Use Discord's public API endpoint
        const guildPreview = await rest.get(`/guilds/${serverId}/preview`);

        const response = {
            id: guildPreview.id,
            name: guildPreview.name,
            icon: guildPreview.icon ? 
                `https://cdn.discordapp.com/icons/${guildPreview.id}/${guildPreview.icon}.${guildPreview.icon.startsWith('a_') ? 'gif' : 'png'}` 
                : null,
            splash: guildPreview.splash ? 
                `https://cdn.discordapp.com/splashes/${guildPreview.id}/${guildPreview.splash}.jpg` 
                : null,
            discoverySplash: guildPreview.discovery_splash,
            description: guildPreview.description,
            features: guildPreview.features,
            approximateMemberCount: guildPreview.approximate_member_count,
            approximatePresenceCount: guildPreview.approximate_presence_count,
            emojis: guildPreview.emojis,
            stickers: guildPreview.stickers
        };

        res.json(response);
    } catch (error) {
        // Handle specific Discord API errors
        if (error.status === 404) {
            return res.status(404).json({
                error: 'Server not found',
                message: 'The server does not exist or is not public'
            });
        }

        console.error('Error getting server info:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching server information'
        });
    }
};

const handleError = (error, res) => {
    console.error('Error in server controller:', error);
    res.status(500).json({
        error: 'Failed to fetch server details',
        message: error.message
    });
};

module.exports = {
    getServers,
    getServerDetails,
    getServerMembers,
    getServerInfo
}; 