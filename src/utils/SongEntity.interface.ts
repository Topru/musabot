import { entity } from '@google-cloud/datastore/build/src/entity';

export interface SongEntity {
  key: entity.Key;
  data: {
    volume: number,
    name: string
  }
}