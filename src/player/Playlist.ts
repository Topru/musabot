
import { Song } from '../song/Song';

export class Playlist {
  playlist: Song[];
  currentIndex: number;
  repeat: boolean;
  constructor() {
    this.playlist = [];
    this.currentIndex = 0;
    this.repeat = false;
  }

  add(song: Song) {
    this.playlist.push(song);
  }

  toggleRepeat(): boolean {
    this.repeat = !this.repeat;
    return this.repeat;
  }

  setCurrentIndex(index): void {
    this.currentIndex = index;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getCurrent(): Song {
    return this.playlist[this.currentIndex];
  }

  getPlaylist(): Song[] {
    return this.playlist;
  }

  removeSong(remove): Song {
    if(!isNaN(remove) && remove != 0) {
      return this.playlist.splice(parseInt(remove) - 1, 1)[0];
    } else {
      let index: number = this.playlist.findIndex(song => song.getTitle() == remove);
      if(index == -1) {
        index = this.playlist.findIndex(song => song.getSearchWord() == remove);
      }
      if(index >= 0) {
        return this.playlist.splice(index, 1)[0];
      }
    }
    return null;
  }

  getQueueMsg(): string {
    let queueString: string = "";
    let i: number = this.currentIndex;
    let order: number = 1;
    if(!this.repeat) {
      while(i < this.playlist.length) { 
        queueString = queueString + order + ": " + this.playlist[i].getTitle() + "\n";
        i++;
        order++;
      }
    }
    return "Current queue: ```" + queueString + "```";
  }

  getNext(): Song {
    let next: Song = this.playlist[this.currentIndex + 1];
    if(next) {
      this.currentIndex++;
      return next;
    } else if (this.repeat) {
      this.currentIndex = 0;
      return this.playlist[0];
    } else {
      return null;
    }
  }

}
