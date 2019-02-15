
const ytdl = require('ytdl-core');

class Playlist {
  constructor() {
    this.playlist = [];
    this.currentIndex = 0;
    this.repeat = false;
  }

  add(song) {
    this.playlist.push(song);
  }

  toggleRepeat() {
    this.repeat = !this.repeat;
    return this.repeat;
  }

  getCurrentIndex() {
    return this.current;
  }

  getPlaylist() {
    return this.playlist;
  }

  removeSong(remove) {
    if(!isNaN(remove) && remove != 0) {
      this.playlist.splice(parseInt(remove) + 1, 1);
    } else {
      let index = this.playlist.findIndex(song => song.getTitle == remove);
      if(index == -1) {
        index = this.playlist.findIndex(song => song.getSearchWrod == remove);
      }
      if(index >= 0) {
        this.playlist.splice(index, 1);
      }
    }
  }

  getNext() {
    let next = this.playlist[this.currentIndex + 1];
    if(next) {
      this.currentIndex++;
      return next;
    } else if (this.repeat) {
      this.currentIndex = 0;
      return this.playlist[0];
    } else {
      return false;
    }
  }

}

module.exports = Playlist;