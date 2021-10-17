const { SlashCommandBuilder } = require('@discordjs/builders');
const { defaultEmbed } = require('../constants');
const LobbyMaker = require('../lobby-maker')

function success(channel, players) {
	channel.send({
		embeds: [ defaultEmbed()
			.setTitle("Created lobby with players:")
			.setDescription(players.map((player, index) => `${index + 1}. <@${player.id}>`).join('\n'))
		]
	})
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lobby-testing')
		.setDescription('Creates a lobby.'),
	async execute(interaction) {
		await LobbyMaker.makeLobby(interaction, "Test lobby", 2, 2, 20000, success.bind(null, interaction.channel));
	},
};