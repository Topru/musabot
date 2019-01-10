
const ytdl = require('ytdl-core');

class Playlist {
  constructor() {
    this.playlist = [];
    this.currentIndex = 0;
  }

  add(song) {
    this.playlist.push(song);
  }

  getCurrentIndex() {
    return this.current;
  }

  getPlaylist() {
    return this.playlist;
  }

  getNext() {
    if(this.currentIndex + 1 > this.playlist.length) {
      return false;
    }
    return this.playlist[this.currentIndex + 1];
  }

}

module.exports = Playlist;