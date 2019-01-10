
const ytdl = require('ytdl-core');

class Player {
  constructor() {
    this.commands = {
      play: this.play.bind(this),
      stop: this.stop.bind(this)
    };
    this.connection = false;
    this.dispatcher = false;
    this.playing = false;
  }

  
  async play(msg) {
    try {
      this.connection = await msg.member.voiceChannel.join();
      const videoUrl = msg.content.split(" ")[1];
      const video = ytdl(videoUrl, { format: 'bestaudio' });
      this.dispatcher = this.connection.playStream(video);
      this._setupDispatcher();
    } catch(e) {
      console.log(e);
    }
  }
  
  stop(message) {
    if(this.connection) {
      this.dispatcher.end();
      this.connection.disconnect();
    }
  }
  
  _setupDispatcher() {
    this.dispatcher.on('start', () => {
      this.playing = true;
      console.log('started playing');
    });
    this.dispatcher.on('stop', () => {
      this.playing = false;
      console.log('stopped playing');
    });
  }
}

module.exports = Player;