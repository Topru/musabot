const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');

const config = require('./config.js');
const client = new Discord.Client();

client.login(config.token);

client.on('message', msg => {
  if (msg.content.includes('a')) {
    console.log("asd");
    if(msg.member.voiceChannel) {
      msg.member.voiceChannel.join()
        .then(connection => {
          msg.reply("Joined");
          const streamOptions = { seek: 0, volume: 100 };
          const dispatcher = connection.playFile('./asd.mp3', streamOptions);
          dispatcher.on('error', e => {
            console.log(e);
          })
          dispatcher.on('start', () => {
            // The song has finished
            console.log("start");
          });
          dispatcher.on('end', () => {
            // The song has finished
            console.log("end");
          });
        });
    }
  }
})