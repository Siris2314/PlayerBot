const { MessageEmbed, version: djsversion, Client} = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { defaultEmbed } = require('../constants');
const moment = require("moment");
const version = require("discord.js").version
const { utc } = require("moment");
require("moment-duration-format");
const os = require("os");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('botinfo')
		.setDescription('Info on Bot'),
	async execute(interaction) {
		const client = interaction.client;
		const uptime = moment.duration(client.uptime).format(" D [Days] - H [Hours] - m [Minutes] - s [Seconds]");

		const upvalue = (Date.now() / 1000 - client.uptime / 1000).toFixed(0);

		const core = os.cpus()[0];
		const embed = defaultEmbed()
			.setURL(client.web)
			.setThumbnail(client.user.displayAvatarURL())
			.addField(
				"General",
				`**❯ Client:** ${client.user.tag} (${client.user.id})
				**❯ Commands:** ${client.commands.size}
				**❯ Servers:** ${client.guilds.cache.size.toLocaleString()} 
				**❯ Users:** ${client.guilds.cache
				.reduce((a, b) => a + b.memberCount, 0)
				.toLocaleString()}
				**❯ Channels:** ${client.channels.cache.size.toLocaleString()}
				**❯ Creation Date:** ${utc(client.user.createdTimestamp).format(
				"Do MMMM YYYY HH:mm:ss"
				)}
				**❯ Node.js:** ${process.version}
				**❯ Version:** v${version}
				**❯ Discord.js:** v${djsversion}
				**>Up Since**  <t:${upvalue}:T>
				\u200b`
			)
			.addField(
				"System",
				`**❯ Platform:** ${process.platform}
				
				**❯ CPU:**
				\u3000 Cores: ${os.cpus().length}
				\u3000 Model: ${core.model}
				\u3000 Speed: ${core.speed}MHz`
			)
			.setTimestamp();
		interaction.reply({ embeds: [embed] });
	}
}