const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController')
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/createSong',songController.createSong);
router.delete('/deleteSong',songController.deleteSong);
router.get('/getSong',authenticateToken, songController.getSong);
router.get('/getSongAdmin', songController.getSongAdmin);
router.post('/createArtist', songController.createArtist)
router.patch('/updateArtist/:id', songController.updateArtist)
router.delete('/deleteArtist', songController.deleteArtist)
router.post('/createAlbum', songController.createAlbum)
router.patch('/updateAlbum/:id', songController.updateAlbum)
router.delete('/deleteAlbum', songController.deleteAlbum)
router.get('/getAllAlbum', songController.getAllAlbum)
router.get('/getAllArtist', songController.getAllArtist)
router.post('/createDuetLyric',songController.createDuetLyric)
router.get('/getSongDuet',songController.getSongDuet)
router.get('/getDuetLyric',songController.getDuetLyric)
router.post('/createFavorite',authenticateToken,songController.createFavorite)
router.delete('/deleteFavorite/:songId',authenticateToken,songController.deleteFavorite)
router.post('/addSongToAlbum',songController.addSongToAlbum)
router.delete('/removeSongFromAlbum',songController.removeSongFromAlbum)
router.get('/getSongsByAlbum/:album_id', songController.getSongsByAlbum)
router.get('/getTopSong',authenticateToken, songController.getTopSong)
module.exports= router; 