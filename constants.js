const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
	defaultEmbed(type) {
		const embed = new MessageEmbed()
			.setColor('#52A42B')
			.setTimestamp()
			.setFooter('Player2', 'https://cdn.discordapp.com/avatars/898684090021212272/fb9b735c7ca100d1b573512be5685925.png');
		if (typeof type === 'string') {
			switch (type.toUpperCase()) {
				case 'ATTENTION':
					embed.setTitle('‼️ Attention')
					break;
			}
		}
		return embed;
	}
}