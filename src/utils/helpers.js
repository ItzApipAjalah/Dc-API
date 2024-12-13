const formatDiscordTimestamp = (snowflake) => {
    return new Date(Number((BigInt(snowflake) >> 22n)) + 1420070400000);
};

const formatDiscordImage = (id, hash, type = 'avatars', animated = false) => {
    if (!hash) return null;
    const extension = animated || hash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/${type}/${id}/${hash}.${extension}?size=4096`;
};

const getStatusIcon = (status) => {
    const icons = {
        online: '🟢',
        idle: '🟡',
        dnd: '🔴',
        offline: '⚫'
    };
    return icons[status] || '⚫';
};

const getActivityTypeIcon = (type) => {
    const icons = {
        PLAYING: '🎮',
        STREAMING: '🎥',
        LISTENING: '🎵',
        WATCHING: '📺',
        COMPETING: '🏆',
        CUSTOM: '🎯'
    };
    return icons[type] || '⚡';
};

module.exports = {
    formatDiscordTimestamp,
    formatDiscordImage,
    getStatusIcon,
    getActivityTypeIcon
}; 