require('dotenv').config();
const { Client } = require('@opensearch-project/opensearch');

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
  sniffOnStart: false,
});

async function ensureIndex(indexName, mapping) {
  const exists = await esClient.indices.exists({ index: indexName });
  if (!exists.body) {
    await esClient.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: mapping
        }
      }
    });
    console.log(`Index "${indexName}" đã được tạo.`);
  }
}

async function indexUser(user) {
  await ensureIndex('users', {
    username:    { type: 'text' },
    slogan:      { type: 'text' },
    avatar_url:  { type: 'keyword' },
    email:       { type: 'keyword' }
  });

  await esClient.index({
    index: 'users',
    id: user.id.toString(),
    body: {
      username:    user.username,
      slogan:      user.slogan,
      avatar_url:  user.avatar_url,
      email:       user.email
    }
  });
}

async function indexSong(song) {
  await ensureIndex('songs', {
    title:     { type: 'text' },
    subTitle:  { type: 'text' },
    lyrics:    { type: 'text' },
    artist_id: { type: 'keyword' }
  });

  await esClient.index({
    index: 'songs',
    id: song.id.toString(),
    body: {
      title:     song.title,
      subTitle:  song.subTitle,
      lyrics:    song.lyrics,
      artist_id: song.artist_id
    }
  });
}

module.exports = { esClient, indexUser, indexSong };