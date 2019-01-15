
const Song = require('../song/Song');
const Playlist = require('./Playlist');
const Search = require('../search/Search');

class Player {
  constructor() {
    this.commands = {
      play: this.play.bind(this),
      stop: this.stop.bind(this),
      next: this.playNext.bind(this)
    };
    this.connection = false;
    this.dispatcher = false;
    this.playing = false;

    this.playlist = new Playlist();
  }

  
  async play(msg) {
    try {
      const videoSearch = msg.content.substr(msg.content.indexOf(" ") + 1);
      const song = await new Search().searchYoutube(videoSearch);
      if(song == false) {
        msg.reply("Song not found.")
        return;
      }
      if(!this.connection) {
        console.log("asd");
        this.connection = await msg.member.voiceChannel.join();
      }
      console.log(song);
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
    this.dispatcher.end();
    const song = this.playlist.getNext();
    if(!song) {
      this.playing = false;
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
      this.playlist = new Playlist();
      console.log('stopped playing');
    }
  }
  
  _setupDispatcher() {
    this.dispatcher.on('start', () => {
      this.playing = true;
      console.log('started playing ');
    });
    this.dispatcher.on('end', () => {
      this.playNext();
    });
  }
}

module.exports = Player;