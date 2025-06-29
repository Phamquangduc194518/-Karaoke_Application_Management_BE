const express = require('express');
const router = express.Router();
const Admin = require('../controllers/authController')
const User = require('../controllers/userController')

router.post('/login',Admin.loginAdmin);
router.post('/register',Admin.registerAdmin);
router.get('/getAllAccount',User.getAllAccount)
router.get('/getSongRequestFromUser', Admin.getSongRequestFromUser)
router.post('/createReplie', Admin.createReplie)
router.patch('/updateStatus', Admin.updateStatus)
router.get('/getRecordedSongsForAdmin', Admin.getRecordedSongsForAdmin)
router.delete('/deleteRecordedSongByAdmin/:songId', Admin.deleteRecordedSongByAdmin)
router.patch('/approveRecordedSong/:songId', Admin.ApproveRecordedSong)
router.patch('/rejectRecordedSong/:songId', Admin.RejectRecordedSong)
router.delete('/deleteAccount/:userId', Admin.deleteAccount)
module.exports = router;