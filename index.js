const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const Player = require('./src/player/Player');

const config = require('./config.js');
const client = new Discord.Client();
client.login(config.token);

const player = new Player();

const commands = player.commands;
const commandNames = Object.keys(commands);

client.on('message', msg => {
  if(msg.content.charAt(0) === '!') {
    const msgCommand = msg.content.split(" ")[0];
    const command = msgCommand.substring(1, msgCommand.length)
    if(commandNames.includes(command)) {
      commands[command](msg);
    }
  }
})