const bcrypt = require('bcryptjs');
const Admin = require('../model/Admin'); // Sử dụng model Admin
const jwt = require('jsonwebtoken');
const { RequestFromUser, User, Replies, Favorite, CommentsVideo, Follow } = require('../model');
const admin = require('firebase-admin');
const NotificationUser = require('../model/NotificationUser');
const { RecommendSongs } = require('./userController');
const RecordedSong = require('../model/RecordedSongs');
const FavoritePost = require('../model/FavoritesPost');
const Comments = require('../model/Comments');
const sequelize = require('../config/database');
const LiveStream = require('../model/LiveStream');
const CommentLiveStream = require('../model/CommentLiveStream');
const Subscription = require('../model/Subscription');
const { Op } = require('sequelize');


const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm admin bằng email
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ errCode: 1, message: 'Admin not found!' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ errCode: 2, message: 'Invalid password!' });
    }

    const token = jwt.sign(
      { email: admin.email},
      process.env.JWT_SECRET, // Khóa bí mật
      { expiresIn: '1h' } // Token hết hạn sau 1 giờ
    )

    return res.status(200).json({
      errCode: 0,
      message: 'Login successful!',
      token: token,
      user: {email: admin.email },
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({ errCode: 3, message: 'Server error!' });
  }
};
const registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra nếu admin đã tồn tại
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ errCode: 1, message: 'Admin already exists!' });
    }

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo admin mới
    const newAdmin = await Admin.create({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      errCode: 0,
      message: 'Admin created successfully!',
      admin: { id: newAdmin.id, email: newAdmin.email },
    });
  } catch (error) {
    console.error('Error during admin registration:', error);
    return res.status(500).json({ errCode: 2, message: 'Server error!' });
  }
};

const getSongRequestFromUser = async(req,res)=>{
  try{
      const requestFromUser = await RequestFromUser.findAll({
        order: [['createdAt', 'DESC']],
        attributes:['id','title','content','contactInformation', 'status', 'priority','createdAt'],
        include: [
          {
            model: User,
            as: 'requestUser',
            attributes: ['user_id', 'email', 'username', 'avatar_url']
          },
          {
            model: Replies,
            as: 'replies',
            attributes:["id", "content", "createdAt"]
          }
        ]
      });
      return res.status(200).json(requestFromUser);
  }catch (error){
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}
const updateStatus = async (req, res) =>{
  try{
      const {request_id, status} = req.body
      if(!request_id || !status){
        return res.status(400).json({ message: "Thiếu dữ liệu phản hồi" });
      }
      const request = await RequestFromUser.findByPk(request_id);
      if(!request){
        return res.status(404).json({ message: "Không tìm thấy phản hồi" });
      }
      request.status = status;
      await request.save();
      return res.status(200).json({ message: "Cập nhật trạng thái thành công", request });
  }catch (error){
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

function sendAdminReplyNotification(deviceToken, replyContent) {
  const message = {
    notification: {
      title: 'Phản hồi từ Admin',
      body: replyContent
    },
    token: deviceToken
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log("Thông báo admin đã được gửi thành công:", response);
    })
    .catch((error) => {
      console.error("Lỗi khi gửi thông báo từ admin:", error);
    });
}

const createReplie = async(req, res) =>{
  try{
    const { request_id, content} = req.body;
    if (!request_id || !content) {
      return res.status(400).json({ message: "Thiếu dữ liệu phản hồi" });
    }
    const request = await RequestFromUser.findOne({ where: { id: request_id } });
    const newReply = await Replies.create({
      request_id,
      content
    });
    const notification = await NotificationUser.create({
      recipient_id: request.user_id,
      sender_id: 18, 
      type: 'Replies',
      message: content
    })
    const recipient = await User.findOne({ where: { id: request.user_id } });
    if (recipient && recipient.device_token) {
      sendAdminReplyNotification(recipient.device_token);
    }
    return res.status(200).json({ message: "Phản hồi thành công", reply: newReply });
  }catch (error){
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

function sendAdminReplyNotification2(deviceToken, rejectReason) {
  const message = {
    notification: {
      title: 'Phản hồi từ Admin về Bài Đăng của Bạn',
      body: rejectReason
    },
    token: deviceToken
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log("Thông báo admin đã được gửi thành công:", response);
    })
    .catch((error) => {
      console.error("Lỗi khi gửi thông báo từ admin:", error);
    });
}

const getRecordedSongsForAdmin = async (req, res)=>{
  try{
    const recordedSongs = await RecordedSong.findAll({
      attributes: [
        'id',
        'title',
        'cover_image_url',
        'recording_path',
        'likes_count',
        'comments_count',
        'statusFromAdmin',
        'upload_time',
        'rejectReason'
      ],
      include:[{
        model: User,
        as: 'user',
        attributes: ['user_id', 'username', 'avatar_url'],
        order: [['upload_time', 'DESC']]
    }]
    })
    return res.status(200).json(recordedSongs);
  }catch (error) {
    console.error("Lỗi khi lấy danh sách bài thu âm:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
}

const deleteRecordedSongByAdmin = async(req,res) =>{
  try{
    const { songId } = req.params;
    await FavoritePost.destroy({ where: { post_id: songId } });
    const deleted = await RecordedSong.destroy({
      where: { id: songId }
    });
    if(deleted == 0){
      return res.status(404).json({ message: "Không tìm thấy bài thu âm để xoá" });
    }
    return res.status(200).json({ message: "Đã xoá bài thu âm thành công" });
  }catch (error) {
    console.error("Lỗi khi xoá bài thu âm:", error);
    return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
}

const ApproveRecordedSong= async(req, res) =>{
  try{
    const { songId } = req.params;
    const [updated] = await RecordedSong.update(
      { statusFromAdmin: "approved"},
      { where: { id: songId } }
    )
    if (updated === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài thu âm" });
    }
     return res.status(200).json({ message: `Trạng thái đã được cập nhật thành approved` });
  }catch (error) {
    console.error("Lỗi cập nhật trạng thái bài thu âm:", error);
    return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
}

const RejectRecordedSong= async(req, res) =>{
  try{
    const { songId } = req.params;
    const {reason} = req.body;
    const [updated] = await RecordedSong.update(
      { statusFromAdmin: "rejected",
        rejectReason: reason},
      { where: { id: songId } },
    )
    if (updated === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài thu âm" });
    }
    const user_id = await RecordedSong.findOne({
      where: {id: songId},
      attributes:['user_id']
    })
    const notification = await NotificationUser.create({
      recipient_id: user_id.dataValues.user_id,
      sender_id: 18, 
      type: 'RejectReason',
      message: reason
    })  
    const recipient = await User.findOne({ where: { id: user_id.dataValues.user_id } });
    if (recipient && recipient.device_token) {
      sendAdminReplyNotification2(recipient.device_token);
    }
     return res.status(200).json({ message: `Trạng thái đã được cập nhật thành rejected` });
  }catch (error) {
    console.error("Lỗi cập nhật trạng thái bài thu âm:", error);
    return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
}

const deleteAccount = async (req, res) => {
  try{
    const {userId} = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    await Favorite.destroy({ where: { user_id: userId } });
    await FavoritePost.destroy({ where: { user_id: userId } });
    await Comments.destroy({ where: { user_id: userId } });
    await CommentsVideo.destroy({ where: { user_id: userId } });
    await NotificationUser.destroy({ where: { recipient_id: userId } });
    await Follow.destroy({ where: { [Op.or]: [{ follower_id: userId }, { following_id: userId }] } });
    await RequestFromUser.destroy({ where: { user_id: userId } });
    await Replies.destroy({
      where: {
        request_id: {
          [Op.in]: sequelize.literal(`(SELECT id FROM request_from_users WHERE user_id = ${userId})`)
        }
      }
    });
    await LiveStream.destroy({ where: { host_user_id: userId } });
    await CommentLiveStream.destroy({ where: { user_id: userId } });
    await RecordedSong.destroy({ where: { user_id: userId } });
    await Subscription.destroy({ where: { userId: userId } });
    await User.destroy({ where: { user_id: userId } });
    return res.status(200).json({ message: "Đã xóa người dùng và các dữ liệu liên quan thành công" });
  }catch (error) {
    console.error("Lỗi khi remove user:", error);
    return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
}


module.exports = {
  loginAdmin,
  registerAdmin,
  getSongRequestFromUser,
  createReplie,
  updateStatus,
  getRecordedSongsForAdmin,
  deleteRecordedSongByAdmin,
  ApproveRecordedSong,
  RejectRecordedSong,
  deleteAccount
};
