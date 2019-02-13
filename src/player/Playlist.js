
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

  getQueueMsg() {
    let queueString = "";
    let i = this.currentIndex;
    let order = 1;
    if(!this.repeat) {
      while(i < this.playlist.length) { 
        queueString = queueString + order + ": " + this.playlist[i].getTitle() + "\n";
        i++;
        order++;
      }
    }
    return "Current queue: ```" + queueString + "```";
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