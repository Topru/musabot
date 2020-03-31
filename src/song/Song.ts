import ytdl from 'ytdl-core';
import { Readable } from 'stream';
import { StreamOptions } from 'discord.js';
import * as fs from 'fs';
import { exec } from 'child_process';
import * as events from 'events';
import { insertSong, getSong } from '../utils/Datastore';
import { SongEntity } from '../utils/SongEntity.interface';

export class Song {
  private id: string;
  private url: string;
  private title: string;
  private searchWord: string;
  private volume: number;

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

  streamSong(): Readable {
    const song = ytdl(this.url, { quality: 'highestaudio' });
    return song;
  }

  getVolume(): number {
    return this.volume;
  }
  setVolume(volume): number {
    return this.volume = volume;
  }
  getTitle(): string {
    return this.title;
  }
  getUrl(): string {
    return this.url;
  }
  getId(): string {
    return this.id;
  }
  getSearchWord(): string {
    return this.searchWord;
  }

  async _startVolumeScan(): Promise<void> {
    const song: Song = this;
    const cachedVolume: SongEntity = await getSong(song);
    if(cachedVolume) {
      song.setVolume(cachedVolume.data.volume);
      return;
    }
    return new Promise((resolve, reject) => {
      const fileName: string = song.getId().replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const writeStream: fs.WriteStream = fs.createWriteStream(`./tmp/${fileName}.webm`);
      ytdl(song.getUrl(), { filter: 'audioandvideo', range: { start: 0, end: 19629071 } })
        .pipe(writeStream)
        .on('progress', (length, downloaded, totallength) => {
          const percent: number = downloaded/totallength;
      });
      writeStream.on('close', () => {
        exec(`ffmpeg -i ./tmp/${fileName}.webm -filter:a volumedetect -f null /dev/null`, (err, stdout, stderr) => {
          if (err) {
            // node couldn't execute the command
            return;
          }
          // the *entire* stdout and stderr (buffered)
          const meanVolume: number = parseInt(stderr.split('mean_volume: ')[1].split(' dB')[0]);
          //dB = 20*log( pctg ) so pctg = 100*pow(10,dB/20)
          //get loudness in percentage compared to youtube maximum and convert it to 0-1 for volume to play at.
          const playVolume: number = 1-Math.pow(10, meanVolume/20);
          song.setVolume(playVolume);
          const stats: fs.Stats = fs.statSync(`./tmp/${fileName}.webm`);
          insertSong(song);
          fs.unlink(`./tmp/${fileName}.webm`, () => {
            resolve();
          });
        });
      });
    });
  }

}
