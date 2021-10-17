const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');
const { defaultEmbed } = require('../constants');
const LobbyMaker = require('../lobby-maker');
const { channel } = require("diagnostics_channel");

const activeGames = [];

const MoveTypeEnum = {
	NOTHING: 0,
	ROCK: 1,
	PAPER: 2,
	SCISSORS: 3,
}

const MoveTypeToIcon = {
	[MoveTypeEnum.NOTHING]: '🕳️',
	[MoveTypeEnum.ROCK]: '🏔️',
	[MoveTypeEnum.PAPER]: '🧻',
	[MoveTypeEnum.SCISSORS]: '✂️',
}

const MoveTypeToString = {
	[MoveTypeEnum.NOTHING]: 'Nothing',
	[MoveTypeEnum.ROCK]: 'Rock',
	[MoveTypeEnum.PAPER]: 'Paper',
	[MoveTypeEnum.SCISSORS]: 'Scissors',
}

const SuperiorToWeak = {
	[MoveTypeEnum.ROCK]: MoveTypeEnum.NOTHING,
	[MoveTypeEnum.SCISSORS]: MoveTypeEnum.NOTHING,
	[MoveTypeEnum.PAPER]: MoveTypeEnum.NOTHING,
	[MoveTypeEnum.ROCK]: MoveTypeEnum.SCISSORS,
	[MoveTypeEnum.SCISSORS]: MoveTypeEnum.PAPER,
	[MoveTypeEnum.PAPER]: MoveTypeEnum.ROCK,
}

class RockPaperScissorGame {
	constructor(channel, players) {
		this.players = players;
		this.choices = new Array(players.length).fill(MoveTypeEnum.NOTHING);
		this.duration = 10;
		this.durationTimer = this.duration;

		setTimeout(() => {
			const id = setInterval(() => {
				this.durationTimer -= 1;
				if (this.durationTimer <= 0)
					clearInterval(id);
			}, 1000);
		}, 1000);

		channel.send({
			embeds: [ defaultEmbed()
				.setTitle('Rock Paper Scissors')
				.setDescription("Choose your option below.")
				.addField('Time Left', `${this.durationTimer} s`)
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton()
						.setStyle("SECONDARY")
						.setEmoji("⛰️")
						.setCustomId("rock"),
					new MessageButton()
						.setStyle("SECONDARY")
						.setEmoji("✂️")
						.setCustomId("scissors"),
					new MessageButton()
						.setStyle("SECONDARY")
						.setEmoji("🧻")
						.setCustomId("paper")
				)
			],
			fetchReply: true
		})
		.then(message => {
			this.message = message;
			this.collector = message.createMessageComponentCollector({ 
				componentType: 'BUTTON',
				time: this.duration
			});
			this.collector.on('collect', collectorInteraction => this.collectButtonInput(collectorInteraction));
			this.collector.on('end', collected => this.finishGame());
		});
	}

	async collectButtionInput(interaction) {
		if (this.choices.filter(choice => choice !== MoveTypeEnum.NOTHING).length == this.players.length) {
			console.log('stopping early: ')
			console.log(this.choices);
			this.collector.stop();
			return;
		}

		const playerIdx = this.players.indexOf(interaction.user.id);
		if (typeof this.choices[playerIdx] === 'undefined') {
			switch (interaction.customId) {
				case 'rock':
					this.choices[playerIdx] = MoveTypeEnum.ROCK;
					break;
				case 'paper':
					this.choices[playerIdx] = MoveTypeEnum.PAPER;
					break;
				case 'scissors':
					this.choices[playerIdx] = MoveTypeEnum.SCISSORS;
					break;
			}
			await interaction.reply({ 
				embeds: [ 
					defaultEmbed()
						.setTitle('Choice')
						.setDescription(`You chose ${interaction.customId}. Now waiting on opponent.`) 
				],
				ephemeral: true,
			});
		} else {
			await interaction.reply({ 
				embeds: [ 
					defaultEmbed('ATTENTION')
						.setDescription(`You have already chosen a move!`) 
				],
				ephemeral: true,
			});
		}
	}

	finishGame() {
		let result = "";
		if (this.choices[0] == this.choices[1]) {
			result = "Tie!"
		} else {
			let winner;
			let loser;
			if (SuperiorToWeak[this.players[0]] === this.players[1]) {
				winner = this.players[0];
				loser = this.players[1];
			} else {
				loser = this.players[0];
				winner = this.players[1];
			}
			result = `${MoveTypeToString[winner]} beats ${MoveTypeToString[loser]}.\n${winner} wins!`;
		}

		this.message.edit({
			embeds: [ 
				defaultEmbed()
					.setTitle('Rock Paper Scissors')
					.addField(`${this.players[0].username}`, `${MoveTypeToIcon[this.choices[0]]}`, true)
					.addField("VS", "⚡", true)
					.addField(`${this.players[1].username}`, `${MoveTypeToIcon[this.choices[1]]}`, true)
					.addField("Result:", result)
			]
		});

		activeGames.splice(activeGames.indexOf(this));
	}
}

function lobbySuccess(channel, players) {
	const newGame = new RockPaperScissorGame(channel, players);
	activeGames.push(newGame);
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
			const botChoice = ["✌️", "🤜", "✋"][Math.floor(Math.random() * ["✌️", "🤜", "✋"].length)]

			const embed = defaultEmbed()
				.setTitle('Rock Paper Scissors')
				.setDescription("Choose your option below.");

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

			const msg = await interaction.reply({ embeds: [embed], components: [row] })

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
		} else if (interaction.options.getSubcommand() === 'dual') {
			LobbyMaker.makeLobby(interaction, "Rock Paper Scissor", 2, 2, 30 * 1000, lobbySuccess.bind(null, interaction.channel));
		}
    },
}