const { REST } = require('discord.js');
const client = require('../config/discord');

const getInviteInfo = async (req, res) => {
    try {
        const inviteCode = req.params.code;
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        // Get invite information from Discord API
        const invite = await rest.get(`/invites/${inviteCode}?with_counts=true&with_expiration=true`);

        const response = {
            code: invite.code,
            guild: {
                id: invite.guild.id,
                name: invite.guild.name,
                icon: invite.guild.icon ? 
                    `https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}.${invite.guild.icon.startsWith('a_') ? 'gif' : 'png'}` 
                    : null,
                description: invite.guild.description,
                features: invite.guild.features,
                memberCount: invite.approximate_member_count,
                onlineCount: invite.approximate_presence_count,
                verificationLevel: invite.guild.verification_level
            },
            channel: {
                id: invite.channel.id,
                name: invite.channel.name,
                type: invite.channel.type
            },
            inviter: invite.inviter ? {
                id: invite.inviter.id,
                username: invite.inviter.username,
                globalName: invite.inviter.global_name,
                avatar: invite.inviter.avatar ? 
                    `https://cdn.discordapp.com/avatars/${invite.inviter.id}/${invite.inviter.avatar}.png` 
                    : null
            } : null,
            expiresAt: invite.expires_at || null,
            maxAge: invite.max_age || 0,
            maxUses: invite.max_uses || 0,
            temporary: invite.temporary || false,
            createdAt: invite.created_at ? new Date(invite.created_at).toISOString() : null
        };

        res.json(response);
    } catch (error) {
        if (error.status === 404) {
            return res.status(404).json({
                error: 'Invite not found',
                message: 'The invite code is invalid or has expired'
            });
        }

        console.error('Error getting invite info:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching invite information'
        });
    }
};

module.exports = {
    getInviteInfo
}; 