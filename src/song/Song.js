const ytdl = require('ytdl-core');
const fs = require('fs');
const { exec } = require('child_process');
const events = require('events');


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
      console.log("paskapaskapaskapaskapaska");
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

  _startVolumeScan() {
    return new Promise((resolve, reject) => {
      const song = this;
      const fileName = song.getId().replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const writeStream = fs.createWriteStream(`./tmp/${fileName}.webm`);
      ytdl(song.getUrl(), { filter: 'audioonly' })
        .pipe(writeStream);
  
      writeStream.on('close', () => {
        exec(`ffmpeg -i ./tmp/${fileName}.webm -filter:a volumedetect -f null /dev/null`, (err, stdout, stderr) => {
          if (err) {
            // node couldn't execute the command
            return;
          }
          const meanVolume = stderr.split('mean_volume: ')[1].split(' dB')[0]
          // the *entire* stdout and stderr (buffered)
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          const playVolume = 1/(-25/parseInt(meanVolume));
          console.log(playVolume);
          song.setVolume(playVolume);
          fs.unlink(`./tmp/${fileName}.webm`, () => {
            resolve();
          });
        });
        console.log("aafdsafsdafssdafsd");
      });
    });
  }

}

module.exports = Song;