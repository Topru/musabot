import { Datastore, Query } from '@google-cloud/datastore';
import { entity } from '@google-cloud/datastore/build/src/entity';
import { Song } from '../song/Song';
import { CommitResponse } from '@google-cloud/datastore/build/src/request';
import { SongEntity } from './SongEntity.interface';
const config = require('../../config.js');
 
export async function insertSong(Song: Song): Promise<CommitResponse> {
  // Your Google Cloud Platform project ID
  const projectId: string = 'musabot-228223';
 
  // Creates a client
  const datastore: Datastore = new Datastore({
    projectId: projectId
  });
 
  // The kind for the new entity
  const kind: string = 'Song';
  
  // The Cloud Datastore key for the new entity
  const songKey: entity.Key = datastore.key([kind, Song.getId().replace(/[^a-z0-9]/gi, '_')]);
 
  // Prepares the new entity
  const entity: SongEntity = {
    key: songKey,
    data: {
      volume: Song.getVolume(),
      name: Song.getTitle()
    }
  };
 
  // Saves the entity
  return await datastore.save(entity);
}

export async function getSong(Song: Song): Promise<SongEntity> {
  // Your Google Cloud Platform project ID
  const projectId: string = 'musabot-228223';

  // Creates a client
  const datastore: Datastore = new Datastore({
    projectId: projectId  
  });

  const kind: string = 'Song';

  const key: entity.Key = datastore.key([kind, Song.getId().replace(/[^a-z0-9]/gi, '_')]);

  // Gets the entity
  const result = await datastore.get(key);

  return result[0][0];
}