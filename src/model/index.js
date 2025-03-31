const User = require('./User');
const Song = require('./Song');
const Artist = require('./Artist');
const Album = require('./Album');
const AlbumSong = require('./AlbumSong');
const Favorite = require('./Favorites');
const Follow = require('./Follow');
const Video = require('./Video')
const CommentsVideo = require('./CommentsVideo');
const NotificationUser = require('./NotificationUser');
const LiveStream = require('./LiveStream');
const CommentLiveStream = require('./CommentLiveStream');
const RequestFromUser = require('./RequestFromUser');
const Replies = require('./Replies');

// Thiết lập quan hệ giữa các model

// belongsTo	1-1 hoặc N-1	
// hasMany	1-N	
// belongsToMany	N-N	

// User - Favorites - Song
User.belongsToMany(Song, { through: Favorite, foreignKey: 'user_id', as: 'favoriteSongs' });
Song.belongsToMany(User, { through: Favorite, foreignKey: 'song_id', as: 'usersWhoFavorited' });

User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

Song.hasMany(Favorite, { foreignKey: 'song_id' });
Favorite.belongsTo(Song, { foreignKey: 'song_id' });

// Artist - Songs
Artist.hasMany(Song, { foreignKey: 'artist_id', as: 'songs' });
Song.belongsTo(Artist, { foreignKey: 'artist_id', as: 'songArtist' });

// Artist - Albums
Artist.hasMany(Album, { foreignKey: 'artist_id', as: 'albums' });
Album.belongsTo(Artist, { foreignKey: 'artist_id', as: 'albumArtist' });

// Album - Songs (many-to-many)
Album.belongsToMany(Song, { through: AlbumSong, foreignKey: 'album_id', as: 'songs' });
Song.belongsToMany(Album, { through: AlbumSong, foreignKey: 'song_id', as: 'albums' });

User.hasMany(Follow, { foreignKey: "follower_id", as: "following" });
User.hasMany(Follow, { foreignKey: "following_id", as: "followers" });
Follow.belongsTo(User, { foreignKey: "follower_id", as: "follower" });
Follow.belongsTo(User, { foreignKey: "following_id", as: "following" });

AlbumSong.belongsTo(Album, { foreignKey: 'album_id', as: 'album' });
AlbumSong.belongsTo(Song, { foreignKey: 'song_id', as: 'song' });

CommentsVideo.belongsTo(Video, {foreignKey:'video_id'})
CommentsVideo.belongsTo(User,{foreignKey:'user_id', as: 'user'})

NotificationUser.belongsTo(User, { foreignKey: 'sender_id', as: 'user' });

User.hasOne(LiveStream, { foreignKey: 'host_user_id', as: 'liveStream' });
LiveStream.belongsTo(User, { foreignKey: 'host_user_id', as: 'host' });

CommentLiveStream.belongsTo(User, { foreignKey: 'user_id', as: 'userCommentLive'})
User.hasMany(CommentLiveStream,{foreignKey: 'user_id',as: 'comments'})

User.hasMany(RequestFromUser,{foreignKey: 'user_id', as: 'userRequest'})
RequestFromUser.belongsTo(User, { foreignKey: 'user_id', as: 'requestUser' });

RequestFromUser.hasMany(Replies, { foreignKey: 'request_id', as: 'replies'});
Replies.belongsTo(RequestFromUser, { foreignKey: 'request_id', as: 'replie' });


// Export các model
module.exports = {
  User,
  Song,
  Artist,
  Album,
  AlbumSong,
  Favorite,
  Follow,
  Video,
  CommentsVideo,
  RequestFromUser,
  Replies,
  AlbumSong
};
