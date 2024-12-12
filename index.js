const express = require('express');
const { Client, GatewayIntentBits, REST } = require('discord.js');
require('dotenv').config();

const app = express();
app.use(express.static('public'));

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

// Express route to get servers list
app.get('/servers', (req, res) => {
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
        console.error('Error fetching servers:', error);
        res.status(500).json({
            error: 'Failed to fetch servers',
            message: error.message
        });
    }
});

// New endpoint for detailed server information
app.get('/servers/:id/detail', async (req, res) => {
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
        console.error('Error fetching server details:', error);
        res.status(500).json({
            error: 'Failed to fetch server details',
            message: error.message
        });
    }
});

// New endpoint for member list
app.get('/servers/:id/members', async (req, res) => {
    try {
        const guild = client.guilds.cache.get(req.params.id);
        
        if (!guild) {
            return res.status(404).json({
                error: 'Server not found',
                message: 'No server found with the provided ID'
            });
        }

        // Get query parameters with fixed limit of 5
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Fixed limit of 5 members per page
        
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Get only the members we need for this page
        const members = await guild.members.fetch({ 
            limit: limit,
            after: startIndex > 0 ? startIndex - 1 : '0'
        });

        const memberArray = Array.from(members.values());

        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        const memberDetails = await Promise.all(memberArray.map(async member => {
            try {
                // Fetch detailed user data
                const userData = await rest.get(`/users/${member.user.id}`);
                const presence = member.presence;
                
                return {
                    id: member.id,
                    username: userData.username || member.user.username,
                    globalName: userData.global_name || member.user.globalName || null,
                    nickname: member.nickname,
                    discriminator: userData.discriminator || member.user.discriminator,
                    joinedAt: member.joinedAt,
                    isBot: userData.bot || member.user.bot,
                    avatarURL: member.user.displayAvatarURL({ 
                        dynamic: true, 
                        size: 4096 
                    }),
                    bannerURL: userData.banner ? 
                        `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}.${userData.banner.startsWith('a_') ? 'gif' : 'png'}?size=4096` 
                        : null,
                    accentColor: userData.accent_color || null,
                    status: presence?.status || 'offline',
                    activities: presence?.activities?.map(activity => ({
                        name: activity.name,
                        type: activity.type,
                        state: activity.state || null
                    })) || []
                };
            } catch (error) {
                console.warn(`Failed to fetch detailed data for user ${member.user.id}:`, error);
                // Return basic data if detailed fetch fails
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
                    })) || []
                };
            }
        }));

        const response = {
            total: guild.memberCount,
            page,
            limit,
            totalPages: Math.ceil(guild.memberCount / limit),
            members: memberDetails
        };

        if (endIndex < guild.memberCount) {
            response.nextPage = page + 1;
        }

        if (startIndex > 0) {
            response.previousPage = page - 1;
        }

        res.json(response);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({
            error: 'Failed to fetch members',
            message: error.message
        });
    }
});

// New endpoint for detailed user information
app.get('/users/:userid', async (req, res) => {
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
                        .filter(role => role.id !== guild.id) // Exclude @everyone role
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
        console.error('Error fetching user details:', error);
        
        // Handle specific error cases
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
    }
});

// Discord bot events
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Login the bot
client.login(process.env.DISCORD_TOKEN);

// Add the root endpoint
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
}); 