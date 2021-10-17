const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
	defaultEmbed(type) {
		const embed = new MessageEmbed()
			.setColor('#52A42B')
			.setTimestamp()
			.setFooter('Player2', 'https://cdn.discordapp.com/app-icons/898684090021212272/de6ad4593d272f5b1b4035069e808860.png');
		if (typeof type === 'string') {
			switch (type.toUpperCase()) {
				case 'ATTENTION':
					embed.setTitle('‼️ Attention')
					break;
			}
		}
		return embed;
	},
	fillerButton(number = 0) {
		return new MessageButton()
			.setStyle('SECONDARY')
			.setLabel(' ')
			.setCustomId(`filler-${number}`)
			.setDisabled(true);
	}
}