import { Client } from 'discord.js';
import { Player } from './src/player/Player';
import { getCommands } from './src/utils/decorators';

const config = require('./config.js');
const client: Client = new Client();
client.login(config.token);

const players: Player[] = [];

const commands = getCommands();

console.log("start");
client.on('message', msg => {
  let player: Player = players.find(player => player.getServer() == msg.guild.id);
  if(typeof player == 'undefined') {
    player = new Player(msg.guild.id)
    players.push(player);
  }

  const commandNames = Object.keys(commands);
  if(msg.content.charAt(0) === '!') {
    const msgCommand: string = msg.content.split(" ")[0];
    const command: string = msgCommand.substring(1, msgCommand.length)
    if(commandNames.includes(command)) {
      player[commands[command]](msg);
    }
  }
})