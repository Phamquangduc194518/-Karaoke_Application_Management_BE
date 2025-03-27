const { where } = require('sequelize');
const { Artist, Album, Favorite, AlbumSong, User } = require('../model');
const Song = require('../model/Song');
const Lyrics = require('../model/DuetLyrics');
const sequelize = require('../config/database');

const createSong = async(req, res) => {
    const {title, subTitle, artist_id, genre, lyrics, audio_url, url_image} = req.body
        try{ 
        if (!title || !artist_id || !audio_url || !url_image) {
          return res.status(400).send({ message: 'Title, artist, and audio URL are required' });
        }
          const newSong = await Song.create({
            title,
            subTitle,
            artist_id,
            genre,
            lyrics,
            audio_url,
            url_image,
        });
            res.status(201).send({message: 'Tạo bài hát thành công', newSong});
        }catch(error){
            res.status(500).send("Lưu bài hát gặp sự cố")
        };
    };

const getSong = async(req, res)=>{
    const userRole = req.user.role
    try{
        let song;
        if(userRole === 'normal'){
            song = await Song.findAll({
                where:{is_duet: false},
                limit: 10
            });
        }else if(userRole === 'vip'){
            song = await Song.findAll({
                where: { is_duet: false }
            });
        }else {
            // Trường hợp vai trò không hợp lệ
            return res.status(403).json({ message: 'Invalid user role' });
        }
        res.status(200).json(song)
    }catch(error){
        console.error('Error fetching songs:', error);
        res.status(500).send({ message: 'Failed to fetch songs', error: error.message });
    }
};

const getSongAdmin = async(req, res)=>{
    try{
        const song = await Song.findAll()
        res.status(200).json(song)
    }catch(error){
        console.error('Error fetching songs:', error);
        res.status(500).send({ message: 'Failed to fetch songs', error: error.message });
    }
};

const createArtist = async (req, res)=>{
    const {name, bio, avatar_url} = req.body
    try{
        const artist = await Artist.create({name, bio, avatar_url})
        res.status(201).send({message: 'Tạo ca sĩ thành công', artist});
    }catch(error){
        console.error('Error create artist:', error);
        res.status(500).send({ message: 'Tạo ca sĩ chưa thành công', error: error.message });
    }
}

const updateArtist = async (req, res)=>{
    const artistId = req.params.id;
    const {name, bio, avatar_url} = req.body
    try{
        const artist = await Artist.update({name, bio, avatar_url}, {where:{id: artistId}})
        res.status(201).send({message: 'Thay đổi thông tin ca sĩ thành công', artist});
    }catch(error){
        console.error('Error create artist:', error);
        res.status(500).send({ message: 'Thay đổi ca sĩ chưa thành công', error: error.message });
    }
}

const deleteArtist = async (req, res)=>{
    const artistId = req.params.id;
    try{
        const artist = await Artist.findByIdAndDelete(artistId)
        if (!artist) {
            return res.status(404).send({ message: 'Ca sĩ không tồn tại!' });
        }
        res.status(201).send({message: 'Xóa ca sĩ thành công', artist});
    }catch(error){
        console.error('Error create artist:', error);
        res.status(500).send({ message: 'Xóa ca sĩ chưa thành công', error: error.message });
    }
}

const createAlbum = async (req, res)=>{
    const {title, subTitle, artist_id, cover_url}= req.body
    try{
        const album = await Album.create({title, subTitle, artist_id, cover_url})
        res.status(201).json({ message: 'Tạo Album thành công', album: album });
    }catch(error){
        console.error('Error create album:', error);
        res.status(500).send({ message: 'Xóa Album chưa thành công', error: error.message });
    }
}

const updateAlbum = async (req, res)=>{
    const AlbumId = req.params.id
    const {title, subTitle, artist_id, cover_url}= req.body
    try{
        const updatedAlbum  = await Album.update({title, subTitle, artist_id, cover_url},{where:{id:AlbumId}})
        if (updatedAlbum[0] === 0) {
            return res.status(404).send({ message: 'Album không tồn tại!' });
          }
          res.status(200).send({ message: 'Album được cập nhật thành công!', album: updatedAlbum });
    }catch(error){
        console.error('Error editing album:', error);
        res.status(500).send({ message: 'Cập nhật album không thành công', error: error.message });
    }
}

const deleteAlbum = async (req, res)=>{
    const AlbumId = req.params.AlbumId
    try{
        const deleteAlbum = await Album.findByIdAndDelete(AlbumId)
        if(!deleteAlbum) {
            return res.status(404).send({ message: 'Album không tồn tại!' });
          }
          res.status(200).send({ message: 'Album đã được xóa thành công!', album: deleteAlbum });
    }catch(error){
        console.error('Error deleting album:', error);
        res.status(500).send({ message: 'Xóa album không thành công', error: error.message });
    }
}

const getAllArtist = async(req, res)=>{
    try{
        const artist = await Artist.findAll();
        res.status(200).json(artist)
    }catch(error){
        console.error('Error fetching:', error);
        res.status(500).send({ message: 'Lỗi khi lấy danh sách ca sĩ', error: error.message });
    }
}

const getAllAlbum = async(req, res)=>{
    try{
        const album = await Album.findAll({
            include:[
                {
                    model: Artist,
                    as: 'albumArtist',
                    attributes: ['id', 'name']
                }
            ]
        });
        res.status(200).json(album)
    }catch(error){
        console.error('Error fetching:', error);
        res.status(500).send({ message: 'Lỗi khi lấy danh sách album', error: error.message });
    }
}

const createDuetLyric = async(req, res) =>{
    try {
        const { song, start, end, text, singer } = req.body;
        const newLyric = await Lyrics.create({ song, start, end, text, singer });
        res.status(201).json({ message: "Lyric added successfully", data: newLyric });
      } catch (err) {
        res.status(500).json({ error: "Failed to add lyric", details: err });
      }
} 

const getDuetLyric = async(req, res) =>{
    const songName = req.query.title;
    console.log("Fetching lyrics for:", songName);
    if (!songName) {
        return res.status(400).json({ error: "Missing 'title' query parameter" });
    }
    try {
    const lyrics = await Lyrics.findAll({ where: { song: songName } });
    if (lyrics.length === 0) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(lyrics);
    } catch (err) {
    res.status(500).json({ error: "Failed to fetch lyrics", details: err });
    }
}

const getSongDuet = async(req, res)=>{
    try{
        const song = await Song.findAll({where:{is_duet: true}});
        res.status(200).json(song)
    }catch(error){
        console.error('Error fetching songs:', error);
        res.status(500).send({ message: 'Failed to fetch songs', error: error.message });
    }
};

const createFavorite = async (req, res)=>{
    const userId = req.user.id;
    console.log(userId)
    const { songId } = req.body;
    if (!songId) {
        return res.status(400).json({ error: "Thiếu thông tin songId" });
    }
    try{
        const favorite = await Favorite.create({user_id: userId, song_id: songId})
        res.status(200).json({ message: "Đã thích bài hát!" });
    }catch (error) {
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
}

const deleteFavorite = async (req, res)=>{
    const userId = req.user.id;
    const { songId } = req.params;
    if (!songId) {
        return res.status(400).json({ error: "Thiếu thông tin songId" });
    }
    try{
        const Unfavorite = await Favorite.destroy({where:{user_id: userId, song_id: songId}});
        res.status(200).json({ message: "Đã bỏ thích bài hát!" });
    }catch (error) {
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
}

const addSongToAlbum = async(req, res) =>{
    try{
        const {album_id, song_id} = req.body
        if (!album_id || !song_id) {
            return res.status(400).json({ message: "Thiếu album_id hoặc song_id" });
          }
        const existingEntry = await AlbumSong.findOne({where:{album_id ,song_id}})
        if (existingEntry) {
            return res.status(400).json({ message: "Bài hát đã tồn tại trong album" });
          }
        const newSongtoAlbum = await AlbumSong.create({album_id:album_id, song_id:song_id })
        return res.status(201).json({ message: "Đã thêm bài hát vào album",newSongtoAlbum});
    }catch (error) {
    console.error("Lỗi khi thêm bài hát vào album:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
}

const removeSongFromAlbum = async (req,res) =>{
    try {
        const { album_id, song_id } = req.body;
    
        if (!album_id || !song_id) {
          return res.status(400).json({ message: "Thiếu album_id hoặc song_id" });
        }
    
        // Kiểm tra xem bài hát có tồn tại trong album không
        const albumSong = await AlbumSong.findOne({
          where: { album_id, song_id }
        });
    
        if (!albumSong) {
          return res.status(404).json({ message: "Bài hát không tồn tại trong album" });
        }
    
        // Xóa bài hát khỏi album
        await albumSong.destroy();
    
        return res.status(200).json({ message: "Đã xóa bài hát khỏi album" });
      } catch (error) {
        console.error("Lỗi khi xóa bài hát khỏi album:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
      }
}

const getSongsByAlbum = async(req, res) =>{
    try{
        const {album_id} = req.params
        if (!album_id) {
            return res.status(400).json({ message: "Thiếu album_id" });
          }
        const albumSongs = await AlbumSong.findAll({
            where:{album_id},
            attributes:[],
            include:[
                {
                    model: Album,
                    as:"album",
                    attributes: ["id", "title", "subTitle", "artist_id", "cover_url"],
                    include:[{
                        model: Artist, 
                        as: "albumArtist",
                        attributes: ["id", "name"]
                    }]
                },
                {
                    model: Song,
                    as:"song"
                }
            ]
        });
        if (albumSongs.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy bài hát nào trong album này" });
          }
        const formattedData ={
            id: albumSongs[0].album_id,
            title: albumSongs[0].album.title,
            subTitle: albumSongs[0].album.subTitle,
            cover_url: albumSongs[0].album.cover_url,
            artist: {
                id: albumSongs[0].album.albumArtist.id,
                name: albumSongs[0].album.albumArtist.name
            },
            songs: albumSongs.map(item =>({
               ...item.song.dataValues
            }))
        }
          return res.status(200).json(formattedData);
    }catch (error) {
    console.error("Lỗi khi lấy danh sách bài hát của album:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
}

const getTopSong = async(req, res) =>{
    try{
        const userRole = req.user.role
        const songWhereCondition = userRole === 'vip' ? {} : { vip_required: false };
        const topSong = await Favorite.findAll({
          attributes:[
            'song_id',
            [sequelize.fn('COUNT', sequelize.col('song_id')),'favoriteCount']
          ],
          include:[{
            model: Song,
            attributes: ['id', 'title','subTitle', 'artist_id', 'lyrics', 'audio_url', 'url_image'],
            where: songWhereCondition
          }],
          group:['song_id'],
          order:[[sequelize.literal('favoriteCount'),'DESC']],
          limit:5
        })
        return res.status(200).json(topSong);
    }catch (error) {
    console.error("Lỗi khi lấy danh sách top bài hát yêu thích nhất:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}
module.exports={
    createSong,
    getSong,
    createArtist,
    updateArtist,
    deleteArtist,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    getAllArtist,
    getAllAlbum,
    createDuetLyric,
    getDuetLyric,
    getSongDuet,
    createFavorite,
    deleteFavorite,
    addSongToAlbum,
    removeSongFromAlbum,
    getSongsByAlbum,
    getTopSong,
    getSongAdmin
}