import { Message, VoiceChannel, VoiceConnection, StreamDispatcher, StreamOptions } from 'discord.js';
import { Readable } from 'stream';
import { Playlist } from './Playlist';
import { Command } from '../utils/decorators';
import { Song } from '../song/Song';
import { searchYoutube } from '../search/Search';

export class Player {
  server: string;
  connection: VoiceConnection;
  dispatcher: StreamDispatcher;
  playing: boolean;
  playlist: Playlist;
  constructor(serverid) {
    this.server = serverid;
    this.connection = null;
    this.dispatcher = null;
    this.playing = false;

    this.playlist = new Playlist();
  }

  @Command('repeat')
  toggleLoop(msg: Message): void {
    const repeat: boolean = this.playlist.toggleRepeat();
    if(repeat) {
      msg.channel.send("Playlist is now looping.")
    } else {
      msg.channel.send("Playlist is now not looping.")
    }
  }

  @Command('queue')
  getQueue(msg: Message): void {
    msg.channel.send(this.playlist.getQueueMsg());
  }

  getServer(): string {
    return this.server;
  }

  @Command('remove')
  removeSong(msg: Message): void {
    const currentSong: Song = this.playlist.getCurrent();
    const removed: Song | false = this.playlist.removeSong(msg.content.substr(msg.content.indexOf(" ") + 1));

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
  
  @Command()
  async play(msg: Message): Promise<void> {
    try {
      const videoSearch: string = msg.content.substr(msg.content.indexOf(" ") + 1);
      const song: Song = await searchYoutube(videoSearch);
      if(!song) {
        msg.reply("Song not found.")
        return;
      }
      if(!this.connection) {
        this.connection = await msg.member.voice.channel.join();
      }
      this.playlist.add(song);
      if(!this.playing) {
        this.playing = true;
        const streamOptions: StreamOptions = { volume: song.getVolume() };
        const stream: Readable = song.streamSong();
        this.dispatcher = this.connection.play(stream, streamOptions);
        this._setupDispatcher(msg);
        msg.channel.send(`\`\`\`\nNow playing:\n[${song.getTitle()}]\`\`\``);
      } else {
        msg.channel.send(`\`\`\`\nQueued:\n[${song.getTitle()}]\`\`\``);
      }
    } catch(e) {
      console.log(e);
    }
  }

  @Command('next')
  cmdNext(msg: Message): void {
    this.dispatcher.end();
  }

  playNext(msg: Message): void {
    const song: Song = this.playlist.getNext();
    if(!song) {
      this.playing = false;
      return;
    }
    const streamOptions: StreamOptions = { volume: song.getVolume() };
    this.dispatcher = this.connection.play(song.streamSong(), streamOptions);
    this._setupDispatcher(msg);
    msg.channel.send(`\`\`\`\nNow playing:\n[${song.getTitle()}]\`\`\``);
  }
  
  @Command('stop')
  stop(msg: Message): void {
    if(this.connection) {
      this.playing = false;
      this.playlist = new Playlist();
      this.connection.disconnect();
      this.connection = null;
      console.log('stopped playing');
    }
    if(this.dispatcher) {
      this.dispatcher.end();
    }
  }
  
  _setupDispatcher(msg: Message) {
    this.dispatcher.on('start', () => {
      console.log('started playing ');
    });
    this.dispatcher.on('end', () => {
      console.log("next!");
      this.playNext(msg);
    });
  }
}