const { REST, Routes } = require('discord.js');
const lookupCommands = require('./commands/lookupCommands');
require('dotenv').config();

const commands = [];

// Add all commands to the array
Object.values(lookupCommands).forEach(command => {
    commands.push(command.data.toJSON());
});

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})(); 