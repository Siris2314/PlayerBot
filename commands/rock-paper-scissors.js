const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');
const { defaultEmbed } = require('../constants');
const LobbyMaker = require('../lobby-maker');

const activeGames = [];

function lobbySuccess(players, channel) {
	
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rock-paper-scissors')
		.setDescription('Play a game of rock paper scissors.')
		.addSubcommand(subCommand =>
			subCommand	
				.setName('bot')
				.setDescription('Play against Player2.'))
		.addSubcommand(subCommand =>
			subCommand	
				.setName('dual')
				.setDescription('Play against a real player.')),
    async execute (interaction) {
		if (interaction.options.getSubcommand() === 'bot') {
			const client = interaction.client;
			const message = interaction.message;
			const botChoice = ["✌️", "🤜", "✋"][Math.floor(Math.random() * ["✌️", "🤜", "✋"].length)]

			const embed = defaultEmbed().setDescription("Choose in the buttons `Scissors` `Stone` `Paper`.")

			const row = new MessageActionRow().addComponents(
				new MessageButton()
					.setStyle("SECONDARY")
					.setEmoji("✂️")
					.setCustomId("scissors"),
				new MessageButton()
					.setStyle("SECONDARY")
					.setEmoji("⛰️")
					.setCustomId("stone"),
				new MessageButton()
					.setStyle("SECONDARY")
					.setEmoji("🧻")
					.setCustomId("paper"),
			)

			const msg = await message.reply({ embeds: [embed], components: [row] })

			const filter = (interaction) => interaction.user.id === message.author.id

			const collector = message.channel.createMessageComponentCollector({
				filter,
				componentType: "BUTTON",
				time: 120000,
				max: 1
			})

			collector.on("collect", async (collected) => {

				if (collected.customId === "scissors") {
					let result

					switch(botChoice) {
						case "✌️":
							result = "It is a tie!"
							break;
						case "🤜":
							result = "You have lost!"
							break
						case "✋":
							result = "You have won!"
					}

					const emb = defaultEmbed()
						.addField(message.author.username, "✌️", true)
						.addField("VS", "⚡", true)
						.addField(client.user.username, botChoice, true)
						.addField("Result:", result)
						.setFooter(client.user.username, client.user.avatarURL())
						.setTimestamp()

					await msg.edit({ embeds: [emb], components: [row] })
				}

				if (collected.customId === "stone") {
					let result

					if (botChoice === "✌️") result = "You have won!"
					if (botChoice === "🤜") result = "It is a tie!"
					if (botChoice === "✋") result = "You have lost!"

					const emb = defaultEmbed()
						.addField(message.author.username, "🤜", true)
						.addField("VS", "⚡", true)
						.addField(client.user.username, botChoice, true)
						.addField("Result:", result)
						.setFooter(client.user.username, client.user.avatarURL())
						.setTimestamp()

					await msg.edit({ embeds: [emb], components: [row] })
				}

				if (collected.customId === "paper") {
					let result

						switch(botChoice) {
						case "✌️":
							result = "It is a tie!"
							break;
						case "🤜":
							result = "You have lost!"
							break
						case "✋":
							result = "You have won!"
					}

					const emb = defaultEmbed()
						.addField(message.author.username, "✋", true)
						.addField("VS", "⚡", true)
						.addField(client.user.username, botChoice, true)
						.addField("Result:", result)
						.setFooter(client.user.username, client.user.avatarURL())
						.setTimestamp()

					await msg.edit({ embeds: [emb], components: [row] })
				}

				collected.deferUpdate()
			});
		} else if (subCommand.options.getSubcommand() === 'dual') {
			
		}
    },
}