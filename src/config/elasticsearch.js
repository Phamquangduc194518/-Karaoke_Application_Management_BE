require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL,
    auth: {
      username: process.env.ELASTIC_USERNAME,
      password: process.env.ELASTIC_PASSWORD
    },
    sniffOnStart: false
  });

async function indexUser(user) {
    await esClient.index({
        index: 'users',
        id: user.id.toString(),
        body: {
          username:  user.username,
          slogan:    user.slogan,
          avatar_url:user.avatar_url,
          email:     user.email
        }
    });
}

async function indexSong(song) {
    await esClient.index({
      index: 'songs',
      id: song.id.toString(),
      body: {
        title:    song.title,
        subTitle: song.subTitle,
        lyrics:   song.lyrics,
        artist_id:song.artist_id
      }
    });
}

module.exports = { esClient, indexUser, indexSong };


