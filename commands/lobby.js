const { SlashCommandBuilder } = require('@discordjs/builders');
const { defaultEmbed } = require('../constants');
const LobbyMaker = require('../lobby-maker')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lobby')
		.setDescription('Created lobby with players to play games together!')
		.addIntegerOption(option => option.setName('min').setDescription('Minimum number of players.').setRequired(true))
		.addIntegerOption(option => option.setName('max').setDescription('Maximum number of players.').setRequired(true))
		.addIntegerOption(option => option.setName('duration').setDescription('Duration of the lobby in seconds.').setRequired(true)),
	async execute(interaction) {
		let min = interaction.options.getInteger('min');
		let max = interaction.options.getInteger('max');
		let duration = interaction.options.getInteger('duration');
		if (min < 0) {
			await interaction.reply({ embeds: [ defaultEmbed('ATTENTION').setDescription('`min` must be >= 0.')], ephemeral: true});
			return;
		}
		if (max <= 0) {
			await interaction.reply({ embeds: [ defaultEmbed('ATTENTION').setDescription('`max` must be > 0.')], ephemeral: true});
			return;
		}
		if (max < min) {
			await interaction.reply({ embeds: [ defaultEmbed('ATTENTION').setDescription('`max` must be >= `min`.')], ephemeral: true});
			return;
		}
		if (duration > 60 * 60) {
			await interaction.reply({ embeds: [ defaultEmbed('ATTENTION').setDescription('`duration` must be <= 3600s.')], ephemeral: true});
			return;
		}

		await LobbyMaker.makeLobby(interaction, `${interaction.user.username}'s`, min, max, duration * 1000);
	},
};