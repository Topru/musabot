
const Song = require('../song/Song');
const Playlist = require('./Playlist');

class Player {
  constructor() {
    this.commands = {
      play: this.play.bind(this),
      stop: this.stop.bind(this)
    };
    this.connection = false;
    this.dispatcher = false;
    this.playing = false;

    this.playlist = new Playlist();
  }

  
  async play(msg) {
    try {
      if(!this.connection) {
        this.connection = await msg.member.voiceChannel.join();
      }
      const videoUrl = msg.content.split(" ")[1];
      const song = new Song(videoUrl);
      this.playlist.add(song);
      console.log(this.playlist.getPlaylist());
      if(!this.playing) {
        const streamOptions = { volume: song.getVolume() };
        this.dispatcher = this.connection.playStream(song.streamSong(), streamOptions);
        this._setupDispatcher();
      }
    } catch(e) {
      console.log(e);
    }
  }

  playNext() {
    const song = this.playlist.getNext();
    if(!song) {
      return;
    }
    const streamOptions = { volume: song.getVolume() };
    this.dispatcher = this.connection.playStream(song.streamSong(), streamOptions);    
  }
  
  stop(message) {
    if(this.dispatcher) {
      this.dispatcher.end();
    }
    if(this.connection) {
      this.connection.disconnect();
      this.connection = false;
      this.playing = false;
      console.log('stopped playing');
    }
  }
  
  _setupDispatcher() {
    this.dispatcher.on('start', () => {
      this.playing = true;
      console.log('started playing');
    });
    this.dispatcher.on('end', () => {
      this.playNext();
    });
  }
}

module.exports = Player;