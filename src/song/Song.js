const ytdl = require('ytdl-core');

class Song {
  constructor(url) {
    this.url = url;
    this.name = url;
    this.volume = 1;
  }

  streamSong() {
    const song = ytdl(this.url, { format: 'bestaudio' });
    return song;
  }

  getVolume() {
    return this.volume;
  }

}

module.exports = Song;