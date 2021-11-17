const {
	MessageEmbed,
	MessageActionRow,
	MessageButton
} = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');
const { defaultEmbed } = require('../constants');
const LobbyMaker = require('../lobby-maker');

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
				if (this.durationTimer <= 0) {
					clearInterval(id);
					return;
				}
				this.message.edit(this.getMessageContent());
			}, 1000);
		}, 1000);

		const content = this.getMessageContent();
		content.fetchReply = true;
		channel.send(content)
		.then(message => {
			this.message = message;
			this.collector = message.createMessageComponentCollector({ 
				componentType: 'BUTTON',
				time: this.duration * 1000
			});
			this.collector.on('collect', collectorInteraction => this.collectButtonInput(collectorInteraction));
			this.collector.on('end', collected => this.finishGame());
		});
	}

	getMessageContent() {
		return {
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
						.setEmoji("🧻")
						.setCustomId("paper"),
					new MessageButton()
						.setStyle("SECONDARY")
						.setEmoji("✂️")
						.setCustomId("scissors"),
				)
			]
		}
	}

	async collectButtonInput(interaction) {
		const playerIdx = this.players.findIndex(player => player.id === interaction.user.id);
		if (this.choices[playerIdx] === MoveTypeEnum.NOTHING) {
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

		if (this.choices.filter(choice => choice !== MoveTypeEnum.NOTHING).length == this.players.length) {
			this.collector.stop();
			return;
		}
	}

	finishGame() {
		this.durationTimer = 0;

		let result = "";
		if (this.choices[0] === this.choices[1]) {
			result = "Tie!"
		} else {
			let winnerIdx;
			let loserIdx;
			if (SuperiorToWeak[this.choices[0]] === this.choices[1]) {
				winnerIdx = 0;
				loserIdx = 1;
			} else {
				loserIdx = 0;
				winnerIdx = 1;
			}
			result = `${MoveTypeToString[this.choices[winnerIdx]]} beats ${MoveTypeToString[this.choices[loserIdx]]}.\n${this.players[winnerIdx]} wins!`;
		}

		this.message.edit({
			embeds: [ 
				defaultEmbed()
					.setTitle('Rock Paper Scissors')
					.addField(`${this.players[0].username}`, `${MoveTypeToIcon[this.choices[0]]}`, true)
					.addField("VS", "⚡", true)
					.addField(`${this.players[1].username}`, `${MoveTypeToIcon[this.choices[1]]}`, true)
					.addField("Result:", result)
			],
			components: []
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
		.setDescription('Play a game of rock paper scissors against another user.'),
    async execute (interaction) {
		LobbyMaker.makeLobby(interaction, "Rock Paper Scissor", 2, 2, 30 * 1000, lobbySuccess.bind(null, interaction.channel));
    },
}