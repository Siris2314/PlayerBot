const { Collection, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { defaultEmbed } = require('./constants');

const activeLobbies = [];
// Key: UserID to represnt a player
// Value: Lobby that the player is currently in
const playerToLobby = new Collection();

async function replyAlreadyInLobby(interaction) {
	await interaction.reply({ 
		embeds: [ 
			defaultEmbed('ATTENTION')
				.setDescription(`You are already in a [lobby](${playerToLobby.get(interaction.user.id).message.url})!`)
		],
		ephemeral: true,
	});
}

class Lobby {
	constructor(interaction, lobbyName, minPlayers, maxPlayers, duration, successfulCallback) {
		this.lobbyName = lobbyName;
		this.minPlayers = minPlayers;
		this.maxPlayers = maxPlayers;
		this.duration = duration;
		this.durationTimer = duration;
		this.players = [];
		this.message = null;
		this.successfulCallback = successfulCallback;

		// Initialize the queue
		this.addPlayer(interaction.user);
		interaction.reply(this.getMessageContent());
		interaction.fetchReply()
			.then(message => {
				this.message = message;
				this.collector = message.createMessageComponentCollector({ 
					componentType: 'BUTTON',
					time: this.duration 
				});
				this.collector.on('collect', collectorInteraction => this.collectButtonInput(collectorInteraction));
				this.collector.on('end', collected => this.finishLobby());
				setTimeout(() => {
					const intervalID = setInterval(() => {
						this.durationTimer -= 1000;
						if (this.durationTimer <= 0) {
							clearInterval(intervalID);
							return;
						}
						this.updateMessageContent();
					}, 1000);
				}, 1000);
			})
			.catch(console.log);
	}
	
	addPlayer(player) {
		this.players.push(player);
		playerToLobby.set(player.id, this);
		this.updateMessageContent();
	}

	removePlayer(player) {
		const index = this.players.findIndex(lobbyPlayer => lobbyPlayer.id === player.id);
		if (index > -1)
			this.players.splice(index, 1);
		playerToLobby.delete(player.id);

		if (this.players.length === 0) {
			this.collector.stop();
			return;
		}

		this.updateMessageContent();
	}

	updateMessageContent() {
		if (this.message !== null)
			this.message.edit(this.getMessageContent());
	}

	getMessageContent() {
		return {
			embeds: [ defaultEmbed()
				.setTitle(`${this.lobbyName} Lobby`)
				.addField('Players', this.players.map((user, index) => `${index + 1}. <@${user.id}>`).join('\n'))
				.addField('Count', `${this.players.length}/${this.maxPlayers}`, true)
				.addField('Requires', `≥ ${this.minPlayers}`, true)
				.addField((this.players.length >= this.minPlayers && typeof this.successfulCallback !== 'undefined') ? 
					'🟢 Starts in' : '‼️ Expires in', `${this.durationTimer / 1000} s`)
			],
			components: [
				new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId('join-lobby')
						.setStyle('SUCCESS')
						.setLabel(this.players.length === this.maxPlayers ? 'Full' : 'Join')
						.setDisabled(this.players.length === this.maxPlayers),
					new MessageButton()
						.setCustomId('leave-lobby')
						.setStyle('DANGER')
						.setLabel('Leave')
				)
			]
		}
	}

	async collectButtonInput(interaction) {
		if (interaction.customId === 'join-lobby') {
			if (typeof playerToLobby.get(interaction.user.id) === 'undefined') {
				this.addPlayer(interaction.user);
				await interaction.reply({
					embeds: [ defaultEmbed('SUCESSS')
						.setDescription(`You have been added to the [lobby](${this.message.url}).`)
					],
					ephemeral: true,
				})
			} else {
				await replyAlreadyInLobby(interaction);
			}
		} else if (interaction.customId === 'leave-lobby') {
			if (playerToLobby.get(interaction.user.id) === this) {
				this.removePlayer(interaction.user);
				await interaction.reply({
					embeds: [ defaultEmbed('SUCESSS')
						.setDescription(`You have been removed from the [lobby](${this.message.url}).}`)
					],
					ephemeral: true,
				})
			} else {
				await interaction.reply({
					embeds: [ defaultEmbed('ATTENTION')
						.setDescription(`You are not inside [this lobby](${this.message.url}).`)
					],
					ephemeral: true,
				})
			}
		}
	}

	finishLobby() {
		this.durationTimer = 0;
		
		if (this.players.length >= this.minPlayers && typeof this.successfulCallback !== 'undefined')
			this.successfulCallback(this.players)

		for (const i in this.players)
			playerToLobby.delete(this.players[i].id);
				
		activeLobbies.splice(activeLobbies.indexOf(this), 1);
		this.message.delete();
	}
}

module.exports = {
	async makeLobby(interaction, lobbyName, maxPlayers, minPlayers, duration, successfulCallback) {
		if (typeof playerToLobby.get(interaction.user.id) !== 'undefined') {
			await replyAlreadyInLobby(interaction);
			return;
		}
		
		const newActiveLobby = new Lobby(interaction, lobbyName, maxPlayers, minPlayers, duration, successfulCallback);
		activeLobbies.push(newActiveLobby);
	}
}