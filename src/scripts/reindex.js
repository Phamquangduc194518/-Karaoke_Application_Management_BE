const { indexUser, indexSong } = require('../config/elasticsearch');
const User = require('../model/User');
const Song = require('../model/Song');

async function reindexAll() {
  const users = await User.findAll();
  for (let u of users) await indexUser(u);

  const songs = await Song.findAll();
  for (let s of songs) await indexSong(s);

  console.log('Reindex xong!');
  process.exit(0);
}
reindexAll();
