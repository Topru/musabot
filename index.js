const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const Player = require('./src/player/Player');

const config = require('./config.js');
const client = new Discord.Client();
client.login(config.token);

const players = [];


client.on('message', msg => {
  let player = players.find(player => player.getServer() == msg.guild.id);
  if(typeof player == 'undefined') {
    player = new Player(msg.guild.id)
    players.push(player);
  }
  const commands = player.commands;
  const commandNames = Object.keys(commands);
  if(msg.content.charAt(0) === '!') {
    const msgCommand = msg.content.split(" ")[0];
    const command = msgCommand.substring(1, msgCommand.length)
    if(commandNames.includes(command)) {
      commands[command](msg);
    }
  }
})