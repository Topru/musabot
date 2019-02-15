
const Song = require('../song/Song');
const Playlist = require('./Playlist');
const Search = require('../search/Search');

class Player {
  constructor(serverid) {
    this.commands = {
      play: this.play.bind(this),
      stop: this.stop.bind(this),
      next: this.cmdNext.bind(this),
      repeat: this.toggleLoop.bind(this),
      queue: this.getQueue.bind(this),
      remove: this.removeSong.bind(this)
    };
    this.server = serverid;
    this.connection = false;
    this.dispatcher = false;
    this.playing = false;

    this.playlist = new Playlist();
  }

  toggleLoop(msg) {
    const repeat = this.playlist.toggleRepeat();
    if(repeat) {
      msg.channel.send("Playlist is now looping.")
    } else {
      msg.channel.send("Playlist is now not looping.")
    }
  }

  getQueue(msg) {
    msg.channel.send(this.playlist.getQueueMsg());
  }

  getServer() {
    return this.server;
  }

  removeSong(msg) {
    const currentSong = this.playlist.getCurrent();
    const removed = this.playlist.removeSong(msg.content.substr(msg.content.indexOf(" ") + 1));

    if(removed) {
      msg.channel.send(`\`\`\`\nRemoved:\n[${removed.getTitle()}]\`\`\``)
    } else {
      msg.channel.send("Could not find song to remove");
    }

    if(removed.getId() == currentSong.getId()) {
      this.playlist.setCurrentIndex(this.playlist.getCurrentIndex() - 1);
      this.cmdNext(msg);
    }
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

        this.connection = await msg.member.voiceChannel.join();
      }
      this.playlist.add(song);
      //console.log(this.playlist.getPlaylist());
      if(!this.playing) {
        this.playing = true;
        const streamOptions = { volume: song.getVolume() };
        const stream = song.streamSong();
        this.dispatcher = this.connection.playStream(stream, streamOptions);
        this._setupDispatcher(msg);
        msg.channel.send(`\`\`\`\nNow playing:\n[${song.getTitle()}]\`\`\``);
      } else {
        msg.channel.send(`\`\`\`\nQueued:\n[${song.getTitle()}]\`\`\``);
      }
    } catch(e) {
      console.log(e);
    }
  }

  cmdNext(msg) {
    this.dispatcher.end();
  }

  playNext(msg) {
    const song = this.playlist.getNext();
    if(!song) {
      this.playing = false;
      return;
    }
    const streamOptions = { volume: song.getVolume() };
    this.dispatcher = this.connection.playStream(song.streamSong(), streamOptions);
    this._setupDispatcher(msg);
    msg.channel.send(`\`\`\`\nNow playing:\n[${song.getTitle()}]\`\`\``);
  }
  
  stop(msg) {
    if(this.connection) {
      this.playing = false;
      this.playlist = new Playlist();
      this.connection.disconnect();
      this.connection = false;
      console.log('stopped playing');
    }
    if(this.dispatcher) {
      this.dispatcher.end();
    }
  }
  
  _setupDispatcher(msg) {
    this.dispatcher.on('start', () => {
      console.log('started playing ');
    });
    this.dispatcher.on('end', () => {
      console.log("next!");
      this.playNext(msg);
    });
  }
}

module.exports = Player;