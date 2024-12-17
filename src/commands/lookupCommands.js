const { SlashCommandBuilder } = require('discord.js');
const { incrementLookups } = require('../utils/statusManager');

const lookupCommands = {
    // User Lookup Command
    user: {
        data: new SlashCommandBuilder()
            .setName('user')
            .setDescription('Look up a Discord user by ID')
            .addStringOption(option =>
                option.setName('userid')
                    .setDescription('The Discord User ID to look up')
                    .setRequired(true)),
        async execute(interaction) {
            await interaction.deferReply();
            const userId = interaction.options.getString('userid');

            try {
                const response = await fetch(`https://discordlookup.amwp.website/users/api/${userId}`);
                const userData = await response.json();

                if (!response.ok) {
                    throw new Error(userData.message || 'Failed to fetch user data');
                }

                const embed = {
                    color: userData.accentColor || 0x5865F2,
                    author: {
                        name: userData.globalName || userData.username,
                        icon_url: userData.avatarURL
                    },
                    thumbnail: {
                        url: userData.avatarURL
                    },
                    fields: [
                        { name: 'Username', value: userData.username, inline: true },
                        { name: 'User ID', value: userData.id, inline: true },
                        { name: 'Created At', value: new Date(userData.createdAt).toLocaleString(), inline: true },
                        { name: 'Bot', value: userData.isBot ? 'Yes' : 'No', inline: true }
                    ],
                    image: {
                        url: userData.bannerURL || null
                    },
                    footer: {
                        text: 'Discord Lookup'
                    },
                    timestamp: new Date()
                };

                incrementLookups();
                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                await interaction.editReply({
                    content: `Error: ${error.message}`,
                    ephemeral: true
                });
            }
        }
    },

    // Server Lookup Command
    server: {
        data: new SlashCommandBuilder()
            .setName('server')
            .setDescription('Look up a Discord server by ID')
            .addStringOption(option =>
                option.setName('serverid')
                    .setDescription('The Discord Server ID to look up')
                    .setRequired(true)),
        async execute(interaction) {
            await interaction.deferReply();
            const serverId = interaction.options.getString('serverid');

            try {
                const response = await fetch(`https://discordlookup.amwp.website/servers/api/${serverId}/info`);
                const serverData = await response.json();

                if (!response.ok) {
                    throw new Error(serverData.message || 'Failed to fetch server data');
                }

                const embed = {
                    color: 0x5865F2,
                    title: serverData.name,
                    description: serverData.description || 'No description',
                    thumbnail: {
                        url: serverData.icon
                    },
                    fields: [
                        { name: 'Server ID', value: serverData.id, inline: true },
                        { name: 'Members', value: serverData.approximateMemberCount.toString(), inline: true },
                        { name: 'Online', value: serverData.approximatePresenceCount.toString(), inline: true },
                        { name: 'Features', value: serverData.features.join(', ') || 'None', inline: false }
                    ],
                    image: {
                        url: serverData.splash || null
                    },
                    footer: {
                        text: 'Discord Lookup'
                    },
                    timestamp: new Date()
                };

                incrementLookups();
                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                await interaction.editReply({
                    content: `Error: ${error.message}`,
                    ephemeral: true
                });
            }
        }
    },

    // Invite Lookup Command
    invite: {
        data: new SlashCommandBuilder()
            .setName('invite')
            .setDescription('Look up a Discord invite link')
            .addStringOption(option =>
                option.setName('code')
                    .setDescription('The invite code or full URL')
                    .setRequired(true)),
        async execute(interaction) {
            await interaction.deferReply();
            const inviteCode = interaction.options.getString('code')
                .replace('https://discord.gg/', '')
                .replace('https://discord.com/invite/', '');

            try {
                const response = await fetch(`https://discordlookup.amwp.website/invites/api/${inviteCode}`);
                const inviteData = await response.json();

                if (!response.ok) {
                    throw new Error(inviteData.message || 'Failed to fetch invite data');
                }

                const embed = {
                    color: 0x5865F2,
                    title: inviteData.guild.name,
                    description: inviteData.guild.description || 'No description',
                    thumbnail: {
                        url: inviteData.guild.icon
                    },
                    fields: [
                        { name: 'Server ID', value: inviteData.guild.id, inline: true },
                        { name: 'Channel', value: `#${inviteData.channel.name}`, inline: true },
                        { name: 'Members', value: inviteData.guild.memberCount.toString(), inline: true },
                        { name: 'Online', value: inviteData.guild.onlineCount.toString(), inline: true },
                        { name: 'Expires', value: inviteData.expiresAt ? new Date(inviteData.expiresAt).toLocaleString() : 'Never', inline: true },
                        { name: 'Created By', value: inviteData.inviter ? inviteData.inviter.username : 'Unknown', inline: true }
                    ],
                    footer: {
                        text: 'Discord Lookup'
                    },
                    timestamp: new Date()
                };

                incrementLookups();
                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                await interaction.editReply({
                    content: `Error: ${error.message}`,
                    ephemeral: true
                });
            }
        }
    }
};

module.exports = lookupCommands; 