const { Client, Collection, Intents} = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const fs = require('fs');

const dotenv = require('dotenv');
dotenv.config();

const components = new Collection();
const client = new Client({
    partials: ["CHANNEL", "MESSAGE", "GUILD_MEMBER", "REACTION"],
    intents:32767,
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false
    },  
    restTimeOffset: 0
});

// Setup event listeners
client.once('ready', () => {
	console.log('🟢 Ready');
});

client.once('reconnecting', () => {
	console.log('🟠 Reconnecting');
});

client.once('disconnect', () => {
	console.log('🔴 Disconnected');
});

client.on('interactionCreate', async interaction => {
	if (interaction.isMessageComponent()) {
		const component = components.get(interaction.customId);

		if (!component) return;

		try {
			await component.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this button interaction!', ephemeral: true });
		}
	} else if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Setup commands
function getFiles(path) {
	var files = [];
	getFilesHelper(path, files);
	return files;
}

function getFilesHelper(path, files) {
    fs.readdirSync(path).forEach(function(file){
        var subpath = path + '/' + file;
        if(fs.lstatSync(subpath).isDirectory()){
            getFilesHelper(subpath, files);
        } else {
            files.push(path + '/' + file);
        }
    });     
}

client.commands = new Collection();
const commandFiles = getFiles('./commands').filter(file => file.endsWith('-command.js'));

for (const file of commandFiles) {
	const command = require(file);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
	if (command.hasOwnProperty('components'))
	{
		for (const componentIdx in command.components) {
			const component = command.components[componentIdx];
			components.set(component.id, component);
		}
	}
}

client.login(process.env.DISCORD_TOKEN);