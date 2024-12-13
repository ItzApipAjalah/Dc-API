const express = require('express');
const client = require('./src/config/discord');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.static('public'));

// Routes
app.use('/', require('./src/routes/index'));
app.use('/users', require('./src/routes/users'));
app.use('/servers', require('./src/routes/servers'));

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