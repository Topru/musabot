const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const Song = require('../song/Song');

const config = require('../../config.js');

class Search {
  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: config.youtubeToken
    })
  }

  async searchYoutube(query) {
    try {
      if(this._isYouTubeUrl(query)) {
        const results = await this.youtube.videos.list({
          id: query.split('v=')[1],
          part: 'snippet',
          maxResults: 5
        });
        if(results.data.items.length < 1) {
          return false;
        }
        const songResult = results.data.items[0];
        return new Promise((resolve, reject) => {
          const song = new Song(songResult.id, `https://www.youtube.com/watch?v=${songResult.id}`, songResult.snippet.title, query);
          song.init((initsong) => {
            console.log("asdgfdsafasdfasdfdsaf");
            console.log(initsong);
            resolve(initsong);
          })
        })

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
          return false;
        }
        const songResult = video;
        return new Promise((resolve, reject) => {
          const song = new Song(songResult.id.videoId, `https://www.youtube.com/watch?v=${songResult.id.videoId}`, songResult.snippet.title, query);
          song.init((initsong) => {
            console.log("asdgfdsafasdfasdfdsaf");
            console.log(initsong);
            resolve(initsong);
          })
        })

      }
    } catch(e) {
      console.log(e);
    }
  }

  _isYouTubeUrl(url) {
    if (url != undefined || url != '') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length == 11) {
        return true;
      }
      else {
        return false;
      }
    }
  }

}

module.exports = Search;