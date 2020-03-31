import { google } from 'googleapis';

import { Song } from '../song/Song';

const config = require('../../config.js');


const youtube = google.youtube({
  version: 'v3',
  auth: config.youtubeToken
});

export async function searchYoutube(query: String): Promise<Song>{
    try {
      if(this._isYouTubeUrl(query)) {
        const results = await this.youtube.videos.list({
          id: query.split('v=')[1],
          part: 'snippet',
          maxResults: 5
        });

        if(results.data.items.length < 1) {
          return null;
        }

        const songResult = results.data.items[0];
        return new Promise((resolve, reject) => {
          const song = new Song(songResult.id, `https://www.youtube.com/watch?v=${songResult.id}`, songResult.snippet.title, query);
          song.init((initsong) => {
            resolve(initsong);
          })
        });
      } else {
        const results = await this.youtube.search.list({
          q: query,
          part: 'snippet',
          maxResults: 5
        });
        let video = null;
        for (let result of results.data.items) {
          if(result.id.kind == "youtube#video") {
            video = result;
            break;
          }
        }
        if(video === null) {
          return null;
        }
        const songResult = video;

        return new Promise((resolve, reject) => {
          const song = new Song(songResult.id.videoId, `https://www.youtube.com/watch?v=${songResult.id.videoId}`, songResult.snippet.title, query);
          song.init((initsong) => {
            resolve(initsong);
          })
        })

      }
    } catch(e) {
      console.log(e);
    }
}

function _isYouTubeUrl(url): boolean {
    if (url != undefined || url != '') {
      const regExp: RegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      const match: string = url.match(regExp);
      if (match && match[2].length == 11) {
        return true;
      }
      else {
        return false;
      }
    }
}