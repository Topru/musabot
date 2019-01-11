const ytdl = require('ytdl-core');

class Song {
  constructor(id, url, title, searchWord) {
    this.id = id;
    this.url = url;
    this.title = title;
    this.searchWord = searchWord;
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