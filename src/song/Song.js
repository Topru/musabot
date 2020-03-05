const ytdl = require('ytdl-core');
const fs = require('fs');
const { exec } = require('child_process');
const events = require('events');
const { insertSong, getSong } = require('../utils/Datastore');

class Song {
  constructor(id, url, title, searchWord) {
    this.id = id;
    this.url = url;
    this.title = title;
    this.searchWord = searchWord;
    this.volume = 1;
  }

  init(callback) {
    this._startVolumeScan().then(() => {
      callback(this);
    });
  }

  streamSong() {
    const song = ytdl(this.url, { quality: 'highestaudio' });
    return song;
  }

  getVolume() {
    return this.volume;
  }
  setVolume(volume) {
    return this.volume = volume;
  }
  getTitle() {
    return this.title;
  }
  getUrl() {
    return this.url;
  }
  getId() {
    return this.id;
  }
  getSearchWord() {
    return this.searchWord;
  }

  async _startVolumeScan() {
    const song = this;
    const cachedVolume = await getSong(song);
    if(cachedVolume) {
      song.setVolume(cachedVolume.volume);
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
    return new Promise((resolve, reject) => {
      const fileName = song.getId().replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const writeStream = fs.createWriteStream(`./tmp/${fileName}.webm`);
      ytdl(song.getUrl(), { filter: 'audioandvideo', range: { start: 0, end: 19629071 } })
        .pipe(writeStream)
        .on('progress', (length, downloaded, totallength) => {
          const percent = downloaded/totallength;
        });
      writeStream.on('close', () => {
        exec(`ffmpeg -i ./tmp/${fileName}.webm -filter:a volumedetect -f null /dev/null`, (err, stdout, stderr) => {
          if (err) {
            // node couldn't execute the command
            return;
          }
          // the *entire* stdout and stderr (buffered)
          const meanVolume = stderr.split('mean_volume: ')[1].split(' dB')[0];
          //dB = 20*log( pctg ) so pctg = 100*pow(10,dB/20)
          //get loudness in percentage compared to youtube maximum and convert it to 0-1 for volume to play at.
          const playVolume = 1-Math.pow(10, meanVolume/20);
          song.setVolume(playVolume);
          const stats = fs.statSync(`./tmp/${fileName}.webm`);
          insertSong(song);
          fs.unlink(`./tmp/${fileName}.webm`, () => {
            resolve();
          });
        });
      });
    });
  }

}

module.exports = Song;