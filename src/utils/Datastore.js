const {Datastore} = require('@google-cloud/datastore');
const config = require('../../config.js');
 
module.exports.insertSong = async (Song) => {
  // Your Google Cloud Platform project ID
  const projectId = 'musabot-228223';
 
  // Creates a client
  const datastore = new Datastore({
    projectId: projectId
  });
 
  // The kind for the new entity
  const kind = 'Song';
  
  // The Cloud Datastore key for the new entity
  const songKey = datastore.key([kind, Song.getId().replace(/[^a-z0-9]/gi, '_')]);
 
  // Prepares the new entity
  const entity = {
    key: songKey,
    data: {
      volume: Song.getVolume(),
      name: Song.getTitle()
    }
  };
 
  // Saves the entity
  await datastore.save(entity);
  console.log(`Saved ${Song.getId()}: ${Song.getVolume()}`);
}

module.exports.getSong = async (Song) => {
  // Your Google Cloud Platform project ID
  const projectId = 'musabot-228223';

  // Creates a client
  const datastore = new Datastore({
    projectId: projectId  
  });

  const kind = 'Song';


  const query = datastore
    .createQuery(kind)
    .filter('__key__', '=', datastore.key([kind, Song.getId().replace(/[^a-z0-9]/gi, '_')]))
    .limit(1);
  // Saves the entity
  const result = await datastore.runQuery(query);

  return new Promise((resolve, reject) => {
    if(result[0].length > 0) {
      resolve(result[0][0])
    } else {
      resolve(false);
    }
  });
}