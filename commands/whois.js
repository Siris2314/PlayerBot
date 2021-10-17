const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { defaultEmbed } = require('../constants');
const axios = require('axios')
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.DISCORD_TOKEN;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('whois')
		.setDescription('Returns Advanced Userinfo')
        .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true)),

    async execute(interaction) {

    const flags = {
            DISCORD_EMPLOYEE: 'Discord Employee',
            DISCORD_PARTNER: 'Discord Partner',
            BUGHUNTER_LEVEL_1: 'Bug Hunter (Level 1)',
            BUGHUNTER_LEVEL_2: 'Bug Hunter (Level 2)',
            HYPESQUAD_EVENTS:'HypeSquad Events',
            HOUSE_BRAVERY: 'House of Bravery',
            HOUSE_BALANCE: 'House of Balance',
            HOUSE_BRILLIANCE: 'House of Brilliance',
            EARLY_SUPPORTER: 'Early Supporter',
            TEAM_USER: 'Team User',
            SYSTEM: 'System',
            VERIFIED_BOT: 'Verified Bot',
            VERIFIED_DEVELOPER: 'Verified Bot Developer'
        };

        const status = {
            online: "Online",
            idle: "Idle",
            dnd: "Do Not Disturb",
            offline: "Offline/Invisible"
        };

        function trimArray(arr, maxLen = 10){
            if(arr.length > maxLen){
                const len = arr.length - maxLen;
                arr = arr.slice(0, maxLen);
                arr.push(`${len} more...`)
            }
            return arr;
        }

        function getRoles(rls) {
            if(!rls.length) return "None";
            if(rls.length <= 10) return rls.join(", ")
            return trimArray(rls)
         }


        let url = '';

        let user = interaction.options.getUser('target');

        if (!user) user = interaction.user;
        let member = await interaction.guild.members.fetch(user.id).catch(() => {});


        const roles = member.roles.cache 
            .sort((a,b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0,-1);
        
        let userflags = [];
        if(member.user.flags !== null)
            userflags = member.user.flags.toArray();
        
        const deviceEntries = Object.entries(member.presence?.clientStatus || {});
        const deviceEntriesText = Object.entries(deviceEntries)
            .map((value,index) => `${index + 1}) ${value[0][0].toUpperCase()}${value[0].slice(1)}`)
            .join("\n");
        const activeGames = member.presence.activities.filter(x=>x.type === "PLAYING");

        const userInfoEmbed = defaultEmbed()
            .setThumbnail(member.user.displayAvatarURL({dynamic: true, size:512}))
            .setAuthor("Information about " + member.user.username + "#" + member.user.discriminator, member.user.displayAvatarURL({dynamic: true}))
            .addField('**Username:**', `${member.user.username}#${member.user.discriminator}`,true)
            .addField('**ID:**',`${member.id}`,true)
            .addField('**Avatar:**',`[Link to avatar](${member.user.displayAvatarURL({dynamic: true})})`,true)
            .addField('**Registered Date:**',`${moment(member.user.createdTimestamp).format('LL')} ${moment(member.user.createdTimestamp).format('LT')}, ${moment(member.user.createdTimestamp).fromNow()} `, true)
            .addField('**Date Joined Server:**',`${moment(member.joinedAt).format('LL LTS')}`,true)
            .addField('**Flags:**',`${userflags.length > 0 ? userflags.map(flag => flags[flag]).join(', ') : 'None'}`, true)
            .addField('**Status:**',`${status[member.presence] ? status[member.presence.status] : 'Offline'}`,true)
            .addField('Devices Currently Using: ',`${deviceEntries.length}`)
            .addField('Currently On Device(s)', `${deviceEntries.length > 0 ? deviceEntriesText : 'None'}`)
            .addField('**Game**:',`${activeGames.length > 0 ? activeGames[0].name : 'Not playing any games.'}`,true)
            .addField('**Highest Role:**',`${member.roles.highest.id === interaction.guild.id ? 'None' : member.roles.highest}`,true)
            .addField(`${roles.length} **Roles:**`,`${getRoles(roles)}`)
            .setTimestamp();
        
        let color = member.displayHexColor;
        if (color === '#000000' && member.roles.hoist !== null)
            color = member.roles.hoist.hexColor;
        if (color !== '#000000')
            userInfoEmbed.setColor(color);
        
        if (user.banner)
            userInfoEmbed.setImage(user.banner);

        await interaction.reply({embeds:[userInfoEmbed]});
    }
}
