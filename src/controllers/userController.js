const bcrypt = require('bcryptjs');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const RecordedSong = require('../model/RecordedSongs');
const Comments = require('../model/Comments');
const sequelize = require('../config/database');
const Topic = require('../model/Topic');
const Video = require('../model/Video');
const Favorite = require('../model/Favorites');
const Song = require('../model/Song');
const Follow = require('../model/Follow');
const CommentsVideo = require('../model/CommentsVideo');
const Subscription = require('../model/Subscription');
const fs = require('fs');
const streamifier = require('streamifier');
const { google } = require('googleapis');
const Sticker = require('../model/Sticker');
const { Op, fn, col, literal, where } = require('sequelize');
const NotificationUser = require('../model/NotificationUser');
const FavoritePost = require('../model/FavoritesPost');
const LiveStream = require('../model/LiveStream');
const admin = require('firebase-admin');
const serviceAccount = require('../../firebaseAdminSdk.json');
const RequestFromUser = require('../model/RequestFromUser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Kiểm tra đầu vào
  if (!username || !email || !password) {
    return res.status(400).send('Vui lòng cung cấp đầy đủ thông tin');
  }

  try {
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('Email đã được sử dụng');
    }

    const existingUserName = await User.findOne({ where: { username } });
    if (existingUserName) {
      return res.status(400).send('UserName đã được sử dụng');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      active: false,
      role: role || "normal",
    });

    return res.status(200).json({ message: "Đăng ký tài khoản thành công"})
  } catch (error) {
    console.error('Lỗi trong quá trình đăng ký:', error);
    return res.status(500).send('Lỗi máy chủ, vui lòng thử lại sau');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Kiểm tra đầu vào
  if (!email || !password) {
    return res.status(400).send('Vui lòng cung cấp email và mật khẩu');
  }

  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'username', 'email', 'password', 'avatar_url', 'phone', 'role']
    });
    if (!user) {
      return res.status(404).send('Email không tồn tại');
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Mật khẩu không chính xác');
    }
    // Tạo token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role},
      process.env.JWT_SECRET, // Khóa bí mật
      { expiresIn: '1h' } // Token hết hạn sau 1 giờ
  );
    await User.update({ active: 1 }, { where: { id: user.id } });
    return res.status(200).json({ 
      message: "Đăng nhập thành công",
      token: token,
      user:{
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      }});
  } catch (error) {
    console.error('Lỗi trong quá trình đăng nhập:', error);
    return res.status(500).send('Lỗi máy chủ, vui lòng thử lại sau');
  }
};

const forgotPassword = async (req,res) =>{
  try{
   const {email} = req.body
   if (!email) {
    return res.status(400).json({ message: "Vui lòng nhập email." });
  }
   const userToEmail = await User.findOne(
    {
      where:{email: email} 
    }
   )
   if(!userToEmail){
    return res.status(400).json({ message: "Email không tồn tại." });
   }
   const randomPassword  = crypto.randomBytes(4).toString('hex');
   const hashedPassword = await bcrypt.hash(randomPassword, 10);
   userToEmail.password = hashedPassword;
   await userToEmail.save();
   let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.YOUR_ACCOUNT_EMAIL,        
      pass: process.env.YOUR_ACCOUNT_EMAIL_PASSWORD             
    }
   });
   const mailOptions = {
    from: '"Karaoke App" <no-reply@yourdomain.com>',
    to: email,
    subject: 'Đặt lại mật khẩu của bạn',
    text: `Mật khẩu mới của bạn là: ${randomPassword}. Hãy đăng nhập và đổi lại mật khẩu ngay.`,
    html: `
        <p>Mật khẩu mới của bạn là: <strong>${randomPassword}</strong></p>
        <p>Hãy đăng nhập và đổi lại mật khẩu ngay.</p>
      `
   };

    transporter.sendMail(mailOptions, (error, info) =>{
    if (error) {
      console.error("Lỗi gửi email:", error);
      return res.status(500).json({ message: "Lỗi gửi email, vui lòng thử lại sau." });
    }
    return res.status(200).json({ message: "Email đặt lại mật khẩu đã được gửi, vui lòng kiểm tra email của bạn." });
   })
  }catch(error){
    console.error("Lỗi trong quá trình forgotPassword:", error);
    return res.status(500).json({ message: "Lỗi máy chủ, vui lòng thử lại sau." });
  }
}
const updateProfile = async (req, res)=>{

  const userId = req.user.id// Lấy từ JWT
  const { username, slogan, phone, password, date_of_birth, gender, email, avatar_url } = req.body;
  try{
    // Kiểm tra nếu tất cả các trường đều rỗng hoặc thiếu
    if (!username && !phone && !password && !date_of_birth && !gender && !email && !avatar_url && !slogan) {
      return res.status(400).send('Không có dữ liệu nào để cập nhật');
    }

    // Tạo đối tượng chứa các trường cần cập nhật
    const hashedPassword = password ? await bcrypt.hash(password,10) : undefined;
    const updateData = {};
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (hashedPassword) updateData.password = hashedPassword; // Chỉ thêm password nếu có hash
    if (date_of_birth) updateData.date_of_birth = date_of_birth;
    if (gender) updateData.gender = gender;
    if (email) updateData.email = email;
    if (avatar_url) updateData.avatar_url = avatar_url;
    if (slogan) updateData.slogan = slogan

    const updateUser  = await User.update(updateData,{where:{id : userId}})
      if (updateUser[0] === 0) return res.status(404).send('Người dùng không tồn tại');
      return res.status(200).json({message:"cập nhật profile thành công"});
  
  }catch(error){
    console.error(error);
    res.status(500).send('Lỗi máy chủ');
  }
}

const userProfile = async (req, res)=>{
  try{
    const userId = req.user.id
    if(!userId){
      res.status(401).send("Chưa đăng nhập")
    }else{
      const userInfo = await User.findOne({
        where :{id: userId},
        attributes: ["user_id","username", "email", "slogan", "password", "phone", "date_of_birth", "gender", "avatar_url", "role"],
      });
      if (!userInfo) {
        return res.status(404).json({ message: "Người dùng không tồn tại" }); // Nếu người dùng không tồn tại
      }
      return res.status(200).json(userInfo)
    }

  }catch(error){
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

const logout = async (req, res) => {
  try {
    const userId = req.user.id
    await User.update({ active: 0 }, { where: { id: userId } });
    return res.status(200).json({ message: "Đăng xuất thành công" });
} catch (error) {
    console.error('Lỗi khi xử lý đăng xuất:', error);
    return res.status(500).json({ message: "Đăng xuất thất bại, vui lòng thử lại" });
}
};

const getAllAccount = async(req, res)=>{
  try{
  const users= await User.findAll()
    return res.status(200).json(users) 
  }catch(error){
    return res.status(500).json({ message: "Không có người dùng nào" });
  }
}
// update user dành cho admin
const updateUser =async (req, res) => {
  const userId = req.params.id;
  const { email, username, phone, avatar_url, date_of_birth, gender } = req.body;

  try {
    const user = await User.update(
      { email, username, phone, avatar_url, date_of_birth, gender },
      { where: { id: userId } }
    );

    if (user[0] === 0) {
      return res.status(404).send("Người dùng không tồn tại.");
    }

    res.status(200).send("Cập nhật thành công.");
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    res.status(500).send("Lỗi máy chủ.");
  }
};


const createRecordedSong = async(req, res) => {

  try{
  const user_id = req.user.id;
  const{song_name, recording_path, cover_image_url, title, status} = req.body;

  if (!song_name || !recording_path || !title) {
    return res.status(400).json({
      message: 'Thiếu thông tin cần thiết (song_name, recording_path, !title)!',
    });
  }
  const recordedSong = await RecordedSong.create({
    user_id,
    song_name,
    recording_path,
    cover_image_url,
    title,
    status: status || 'public', // Mặc định là public nếu không được gửi
  });

  return res.status(201).json(recordedSong);
  }catch(error){
    return res.status(500).json({
      message: 'Lỗi khi đăng bài ghi âm!',
      error: error.message,
    });
  }

}

const getRecordedSongList = async(req, res) => {
  try{
    const currentUserId = req.user.id;
    const followings  = await Follow.findAll({
      where:{follower_id: currentUserId},
      attributes:['following_id']
    })
    const followingIds = followings.map(f => f.following_id);
    const record = await RecordedSong.findAll({
      where:{
        [Op.or]:[
          {
            user_id:{[Op.in]: followingIds}
          },
          {
             user_id: currentUserId , 
          },
          where( literal(`(SELECT COUNT(*) FROM favorite_post WHERE favorite_post.post_id = RecordedSong.id)`),
          { [Op.gt]: 5 }
        )
        ]
      },
      attributes: [
        "id",
        "user_id",
        "song_name",
        "title",
        "recording_path",
        "cover_image_url",
        "upload_time",
        "comments_count",
        "likes_count",
        "status",
        // Đếm số lượng bình luận cho bài hát cụ thể
        [sequelize.literal(`(SELECT COUNT(*) FROM Comments WHERE Comments.song_id = RecordedSong.id)`), "comments_count"],
        [sequelize.literal(`(SELECT COUNT(*) FROM favorite_post WHERE favorite_post.post_id = RecordedSong.id)`), "likes_count"]
    ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'avatar_url'] // Lấy thông tin user
        }
      ],
      order: [["upload_time", "DESC"]]
    });
    if (!record || record.length === 0) {
      return res.status(404).json({ message: "Không có bản ghi nào" });
  }
    return res.status(200).json(record) 
  }catch(error){
    console.error("Lỗi lấy danh sách bài hát:", error);
    return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }

}
const CreateComment = async (req, res) =>{
  try{
      const user_id = req.user.id;
      const {song_id, comment_text, url_sticker, url_image} = req.body;
      if(!song_id && !comment_text && !url_sticker && !url_image){
        return res.status(400).json({
          message: 'Chưa bình luận',
        });
      }

      const comment = await Comments.create({
        user_id,
        song_id,
        comment_text: comment_text || "",
        url_sticker: url_sticker || null,
        url_image: url_image || null,
      });
      return res.status(201).json(comment);
  }catch(error){
    return res.status(500).json({
      message: 'Lỗi khi comment',
      error: error.message,
    });
  }
}
const getCommentList = async (req, res) =>{
  try{
      const song_id = req.params.song_id;
      const comment = await Comments.findAll({
        where: {song_id: song_id},
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'avatar_url'] // Lấy thông tin user
          }
        ],
        order: [['comment_time', 'DESC']] // Sắp xếp theo thời gian mới nhất
  });
      return res.status(200).json(comment) 
  }catch(error){
    return res.status(500).json({
      message: 'Lỗi lấy comment',
      error: error.message,
    });
  }
}

const createTopic = async (req, res) =>{
   try{
        const {title} = req.body 
        if (!title) {
          return res.status(400).json({ error: "Title không được để trống" });
        }
        const topic = await Topic.create({title: title})
        return res.status(200).json(topic) 
   }catch(error) {
        res.status(500).json({ error: "Lỗi server", details: error.message });
   }
}


const createVideoOfTopic = async (req, res) =>{
  try{
       const {topicId, title, url, thumbnail} = req.body 
       if (!topicId || !title || !url || !thumbnail) {
         return res.status(400).json({ error: "Không được để trống" });
       }
       const topic = await Video.create({topicId: topicId, title: title,  url: url,  thumbnail: thumbnail})
       return res.status(200).json(topic) 
  }catch(error) {
       res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const getAllTopicsWithVideo = async(req, res) =>{
  try{
      const topics = await Topic.findAll(
        {
          include:[
            {
              model: Video,
              as: 'videos',
              attributes:["id", "topicId","title","url","thumbnail"]
            },
          ],
          order: [['id','DESC']]
        }
      );
      return res.status(200).json(topics);
  }catch(error) {
      res.status(500).json({ error: "Lỗi server", details: error.message });
 }
}

const createIsFavorite = async(req, res) =>{
  try{
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }
    const user_id = req.user.id;
    const {song_id} = req.body;
    if (!song_id) {
      return res.status(400).json({ message: "Thiếu song_id" });
    }
    const existingFavorite = await Favorite.findOne({where: {user_id, song_id}});
    if(existingFavorite){
      return res.status(200).json({ message: "Bài hát đã được yêu thích", favorite: existingFavorite });
    }
    const favorite = await Favorite.create({user_id: user_id, song_id: song_id})
    return res.status(200).json(favorite);
  }catch(error){
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const removeIsFavorite = async(req, res)=>{
  try {
    const user_id = req.user.id;
    const { song_id } = req.params;

    // Kiểm tra xem bài hát đã có trong danh sách yêu thích chưa
    const existingFavorite = await Favorite.findOne({ where: { user_id, song_id } });

    if (!existingFavorite) {
      return res.status(404).json({ message: "Bài hát chưa được yêu thích" });
    }
    const favorite = await Favorite.destroy({ where: { user_id, song_id } });
    return res.status(200).json({ message: "Đã bỏ thích bài hát"});
  }catch (error) {
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const getIsFavorite = async(req, res)=>{
  try{
    const user_id = req.user.id;
    const favoriteSongs = await Favorite.findAll({
      where:{user_id},
      include:[
        {
          model: Song,
          attributes: ["title", "subTitle", "url_image", "lyrics", "audio_url", "url_image"],
        },
      ],
    });
    return res.status(200).json({ favoriteSongs });
  }catch (error) {
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}
const getIsFavoriteToSongID = async(req, res)=>{
  try{
    const user_id = req.user.id;
    const songID = await Favorite.findAll({
      where:{user_id},
      attributes: ['song_id']
    });
    const songIDs = songID.map(fav => fav.song_id);
    return res.status(200).json(songIDs);
  }catch (error) {
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const getUserProfile  = async(req, res) =>{
  try{
    const user_id = req.params.user_id
    const user = await User.findOne({
      where:{user_id: user_id},
      attributes:["username", "email", "avatar_url"],
    });
    if (!user) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }
    return res.status(200).json(user);
  }catch(error) {
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const followUser = async(req, res) =>{
  try{
    const {following_id } = req.body // người được theo dõi 
    const follower_id = req.user.id

    if (follower_id === following_id) {
      return res.status(400).json({ error: "Không thể tự follow chính mình!" });
    }

    const alreadyFollowing = await Follow.findOne({ where: { follower_id: follower_id, following_id: following_id } });

    if (alreadyFollowing) {
      return res.status(400).json({ error: "Bạn đã follow người này rồi!" });
    }
    await Follow.create({ follower_id, following_id });
    await NotificationUser.create({
      recipient_id: following_id,
      sender_id: follower_id,
      type: 'follow',
      message: 'Bạn có người mới follow!'
    });
    const recipient = await User.findOne({ where: { id: following_id } });
    const follower = await User.findOne({ where: { id: follower_id } });
    const followerName = follower ? follower.username : "Một người nào đó";
    if (recipient && recipient.device_token) {
      sendFollowNotification(recipient.device_token, followerName);
    }
    res.status(200).json({ message: "Follow thành công!" });
  }catch(error){
    res.status(500).json({ error: "Lỗi server", details: error.message });

  }
}

const unfollowUser  = async(req, res) =>{
  try{
    const {following_id } = req.body // người được theo dõi 
    const follower_id = req.user.id

    const follow  = await Follow.findOne({ where: { follower_id: follower_id, following_id: following_id } });

    if (!follow) {
      return res.status(400).json({ error: "Bạn chưa follow người này!" });
    }
    await Follow.destroy({ where: { follower_id: follower_id, following_id: following_id } })
    res.status(200).json({ message: "Đã bỏ follow!" });
  }catch(error){
    res.status(500).json({ error: "Lỗi server", details: error.message });

  }
}

const checkFollowStatus = async(req, res)=>{
  try{
    const {following_id } = req.params
    const follower_id  = req.user.id

    const isFollowing = await Follow.findOne(
      {
        where: {following_id: following_id, follower_id: follower_id}
      }
    );
    res.status(200).json({ following: !!isFollowing });
  }catch(error){
    res.status(500).json({ error: "Lỗi server", details: error.message });

  }
}

const getFollowers = async(req, res)=>{
  try{
    const {user_id} = req.params
    const followerCount = await Follow.count(
      {
        where: {following_id: user_id}
      }
    )
    const followers = await Follow.findAll({
      where: {following_id: user_id},
      attributes : ["following_id"],
      include:[
        {
          model: User,
          as: "follower",
          attributes:["id", "username", "avatar_url"]
        }
      ],
    }); 
    res.status(200).json({followerCount,followers});
  }catch(error){
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const getFollowing  = async(req, res)=>{ // lấy ra người follow mình
  try{
    const {user_id} = req.params
    const followingCount = await Follow.count(
      {
        where: {follower_id: user_id}
      }
    )
    const following  = await Follow.findAll({
      where: {follower_id: user_id},
      attributes : ["follower_id"],
      include:[
        {
          model: User,
          as: "following",
          attributes:["id", "username", "avatar_url"]
        }
      ],
    }); 
    res.status(200).json({followingCount, following});
  }catch(error){
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const getFollowNotification = async (req, res) =>{
    try{
        const userId = req.user.id
        const notificationUser = await NotificationUser.findAll({
          where:{recipient_id: userId},
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'username', 'avatar_url'] // Lấy thông tin user
            }
          ],
          order : [['createdAt', 'DESC']]
        })
        res.status(200).json({notificationUser});
    }catch(error){
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const unreadNotifications  = async (req, res) =>{
  try{
      const userId = req.user.id
      const notificationUser = await NotificationUser.findAll({
        where:{recipient_id: userId, is_read: false},
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'avatar_url'] // Lấy thông tin user
          }
        ],
        order : [['createdAt', 'DESC']]
      })
      res.status(200).json({notificationUser});
  }catch(error){
  res.status(500).json({ error: "Lỗi server", details: error.message });
}
}

const isReadNotification = async(req, res) =>{
    try{
        const userId = req.user.id
        const { notificationId } = req.params;
        const [updatedRows] = await NotificationUser.update(
          {is_read: true},
          {where:{id: notificationId, recipient_id: userId}},
        )
        if (updatedRows === 0) {
          return res.status(404).json({ message: 'Notification not found or already read' });
        }
        res.status(200).json({ message: "Cập nhật thông báo đã đọc thành công" });
    }catch(error){
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}
const CreateCommentVideo = async (req, res) =>{
  try{
      const user_id = req.user.id;
      const {video_id, comment_text, url_sticker, url_image} = req.body;

      if(!video_id && !comment_text && !url_sticker && !url_image){
        return res.status(400).json({
          message: 'Chưa bình luận',
        });
      }

      const comment = await CommentsVideo.create({
        user_id,
        video_id,
        comment_text: comment_text || "",
        url_sticker: url_sticker || null,
        url_image: url_image || null,
      });
      return res.status(201).json(comment);
  }catch(error){
    return res.status(500).json({
      message: 'Lỗi khi comment',
      error: error.message,
    });
  }
}
const getCommentVideoList = async (req, res) =>{
  try{
      const video_id = req.params.video_id;
      const comment = await CommentsVideo.findAll({
        where: {video_id: video_id},
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'avatar_url'] // Lấy thông tin user
          }
        ],
        order: [['comment_time', 'DESC']] // Sắp xếp theo thời gian mới nhất
  });
      return res.status(200).json(comment) 
  }catch(error){
    return res.status(500).json({
      message: 'Lỗi lấy comment',
      error: error.message,
    });
  }
}

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/androidpublisher'],
});

const androidpublisher = google.androidpublisher({
  version: 'v3',
  auth,
})

const verifyPurchase = async (req, res) => {
  try{
    const {user_id, packageName, productId, purchaseToken} = req.body;
    if (!user_id || !packageName || !productId || !purchaseToken) {
      return res.status(400).json({ error: 'Thiếu thông tin cần thiết' });
    }

    const result  = await androidpublisher.purchases.subscriptions.get({
      packageName: packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });
    const purchaseInfo = result.data;
    if (purchaseInfo.paymentState !== 1) {
      return res.status(400).json({ error: 'Giao dịch không hợp lệ' });
    }
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    const existingToken = await Subscription.findOne({ where: { purchaseToken: purchaseToken } });
    if(existingToken){
    const tokenUserId = Number(existingToken.get('userId'));
    const requestUserId = Number(user_id);
    if (tokenUserId !== requestUserId) {
      return res.status(200).json({ success: false, message: 'Token đã được sử dụng bởi tài khoản khác' });
      }
    }
    let subscription = await Subscription.findOne({ where: { userId: user_id } });
    if(subscription){
      subscription.purchaseToken= purchaseToken
      subscription.orderId = purchaseInfo.orderId;
      subscription.expiryTime = purchaseInfo.expiryTimeMillis;
      subscription.paymentState = purchaseInfo.paymentState;
      await subscription.save();
    }else{
      subscription = await Subscription.create({
        userId: user_id,
        purchaseToken: purchaseToken,
        orderId: purchaseInfo.orderId,
        expiryTime: purchaseInfo.expiryTimeMillis,
        paymentState: purchaseInfo.paymentState,
      });
      console.log("check vip",subscription)
    }
    user.role = 'vip';
    await user.save();
    return res.status(200).json({ success: true});
  }catch (err) {
    console.error('Lỗi xác minh giao dịch:', err);
    return res.status(500).json({ error: 'Xác minh giao dịch thất bại', details: err.message });
  }
}

const authFile = new google.auth.GoogleAuth({
  keyFile: process.env.SERVICE_ACCOUNT_FILE,
  scopes: ['https://www.googleapis.com/auth/drive'],
})

const drive = google.drive({
  version: 'v3',
  auth: authFile,
});

const uploadAvatar = async(req, res)=>{
  try{
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Chưa xác thực người dùng' });
    }
    const folderId = process.env.YOUR_FOLDER_ID;
    // Thiết lập metadata cho file trên Drive
    const fileMetadata = {
      //đặt tên file = tên gốc
      name: req.file.originalname,
      parents: [folderId],
    };
    const media = {
      mimeType: req.file.mimetype,
      body: streamifier.createReadStream(req.file.buffer),
    };
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name',
    });
    const fileId = response.data.id;
    const fileUrl = `https://drive.google.com/uc?id=${fileId}`;
    await User.update(
      { avatar_url: fileUrl },
      { where: { id: userId } }
    )
    return res.status(200).json({
      message: 'Upload ảnh đại diện thành công',
      avatar_url: fileUrl,
    });
  }catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

  const uploadImagePost = async(req, res)=>{
    try{
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
      const folderId = process.env.YOUR_FOLDER_ID;
      // Thiết lập metadata cho file trên Drive
      const fileMetadata = {
        //đặt tên file = tên gốc
        name: req.file.originalname,
        parents: [folderId],
      };
      const media = {
        mimeType: req.file.mimetype,
        body: streamifier.createReadStream(req.file.buffer),
      };
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name',
      });
      const fileId = response.data.id;
      const fileUrl = `https://drive.google.com/uc?id=${fileId}`;
      return res.status(200).json({
        message: 'Upload ảnh thành công',
        avatar_url: fileUrl,
      });
    }catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
}
const createSticker = async (req, res) => {
  try {
    const { sticker_url, title, category } = req.body;
    if (!sticker_url) {
      return res.status(400).json({ error: 'Sticker URL is required.' });
    }
    const sticker = await Sticker.create({
      sticker_url,
      title: title || null,
      category: category || null,
    });
    return res.status(201).json(sticker);
  } catch (error) {
    console.error("Error creating sticker:", error);
    return res.status(500).json({ error: error.message });
  }
};
const getSticker = async(req,res) =>{
  try {
    const stickers = await Sticker.findAll();
    return res.status(200).json(stickers);
  } catch (error) {
    console.error('Error fetching stickers:', error);
    return res.status(500).json({ error: error.message });
  }
}

const search = async(req,res) =>{
  try{
    const keyword = req.query.q
    const type = req.query.type
    if (!keyword) {
      return res.status(400).json({ error: 'Tham số tìm kiếm không được để trống' });
    }
    if(type === 'user'){
      const users = await User.findAll({
        where: {
          username: {
            [Op.like]: `%${keyword}%`
          }
        },
        attributes: ['id', 'username', 'avatar_url', 'slogan']
      });
      return res.status(200).json({ users });
    }else if (type === 'song') {
      const songs = await Song.findAll({
        where: {
          title: {
            [Op.like]: `%${keyword}%`
          }
        },
        attributes: ['id', 'title', 'subTitle', 'url_image', "audio_url", "lyrics", "artist_id" ]
      });
      return res.status(200).json({ songs });
    }else{
      const [users, songs] = await Promise.all([
        User.findAll({
          where: {
            username: {
              [Op.like]: `%${keyword}%`
            }
          },
          attributes: ['id', 'username', 'avatar_url', 'slogan']
      }),
      Song.findAll({
        where: {
          title: {
            [Op.like]: `%${keyword}%`
          }
        },
        attributes: ['id', 'title', 'subTitle', 'url_image', "audio_url", "lyrics", "artist_id" ]
      })
      ]);
    return res.status(200).json({ users, songs });
    }
  } catch (error) {
    console.error("Error search:", error);
    return res.status(500).json({ error: error.message });
  }
}

const createIsFavoritePost = async(req, res) =>{
  try{
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }
    const user_id = req.user.id;
    const {post_id} = req.body;
    if (!post_id) {
      return res.status(400).json({ message: "Thiếu post_id" });
    }
    const existingFavorite = await FavoritePost.findOne({where: {user_id:user_id, post_id:post_id}});
    if(existingFavorite){
      return res.status(200).json({ message: "Bài viết đã được yêu thích", favorite: existingFavorite });
    }
    const favorite = await FavoritePost.create({user_id: user_id, post_id: post_id})
    return res.status(200).json(favorite);
  }catch(error){
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const removeIsFavoritePost = async(req, res)=>{
  try {
    const user_id = req.user.id;
    const { post_id } = req.params;
    const existingFavorite = await FavoritePost.findOne({ where: { user_id: user_id, post_id: post_id } });

    if (!existingFavorite) {
      return res.status(404).json({ message: "Bài viết chưa được yêu thích" });
    }
    const favorite = await FavoritePost.destroy({ where: { user_id: user_id, post_id: post_id } });
    return res.status(200).json({ message: "Đã bỏ thích bài viết"});
  }catch (error) {
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const getIsFavoritePostToSongID = async(req, res)=>{
  try{
    const user_id = req.user.id;
    const postId = await FavoritePost.findAll({
      where:{user_id},
      attributes: ['post_id']
    });
    const postIdss = postId.map(fav => fav.post_id);
    return res.status(200).json(postIdss);
  }catch (error) {
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const getStarAccount = async(req, res) =>{
  try{
      const account = await Follow.findAll({
        attributes:[
          'following_id',
          [fn('COUNT', col('follower_id')), 'followersCount']
        ],
        group: ['following_id'],
        having: where(fn('COUNT', col('follower_id')), '>', 2),
        include: [
          {
            model: User,
            as: 'following',
            attributes: ['user_id', 'username', 'avatar_url'],
            include:[
              {
                model: LiveStream, 
                as: 'liveStream', 
                where: { status: 'active' },
                required: false, 
                attributes: ['stream_id', 'title', 'status']
              }
            ]
          }
        ]
      });
      return res.status(200).json(account);
  }catch (error) {
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const updateDeviceToken = async (req,res)=>{
  const userId = req.user.id
  const { deviceToken } = req.body;
  try {
    await User.update(
      { device_token: deviceToken }, 
      {where:{user_id:userId}},
    );
    res.status(200).json({ message: "Cập nhật token thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật token" });
  }
}

function sendFollowNotification(deviceToken, followerName){
    const message  = {
      notification: {
        title: 'Có người theo dõi bạn',
        body: `${followerName} đã theo dõi bạn.`
      },
      token: deviceToken
    }
    admin.messaging().send(message)
    .then((response) => {
      console.log("Thông báo đã được gửi thành công:", response);
    })
    .catch((error) => {
      console.error("Lỗi khi gửi thông báo:", error);
    });
}

const SongRequestFromUser = async (req,res) =>{
  try{
      const user_id= req.user.id
      if(!user_id){
        return res.status(400).json({ message: "Không tồn tại người dùng" });
      }
      const {title, content, contactInformation} = req.body 
      if(!title || !content || !contactInformation){
        return res.status(400).json({ message: "Thiếu dữ liệu" });
      }
      const requestFromUser = await RequestFromUser.create({
        user_id: user_id,
        title: title,
        content: content,
        contactInformation: contactInformation
      })
      return res.status(200).json({ message: "Gửi yêu cầu thành công" })
  }catch (error){
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const getSongRequestFromUser = async(req,res)=>{
  try{
      const requestFromUser = await RequestFromUser.findAll({
        order: [['createdAt', 'DESC']],
        attributes:['title','content','contactInformation', 'status'],
        include: [
          {
            model: User,
            as: 'requestUser',
            attributes: ['user_id', 'username', 'avatar_url']
          }
        ]
      });
      return res.status(200).json(requestFromUser);
  }catch (error){
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

module.exports = {
  register,
  login,
  logout,
  updateProfile,
  userProfile,
  getAllAccount,
  updateUser,
  createRecordedSong,
  getRecordedSongList,
  CreateComment,
  getCommentList,
  createTopic,
  getAllTopicsWithVideo,
  createVideoOfTopic,
  createIsFavorite,
  removeIsFavorite,
  getIsFavorite,
  getIsFavoriteToSongID,
  getUserProfile,
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowers,
  getFollowing,
  CreateCommentVideo,
  getCommentVideoList,
  verifyPurchase,
  uploadAvatar,
  uploadImagePost,
  createSticker,
  getSticker,
  search,
  getFollowNotification,
  isReadNotification,
  unreadNotifications,
  createIsFavoritePost,
  removeIsFavoritePost,
  getIsFavoritePostToSongID,
  getStarAccount,
  updateDeviceToken,
  SongRequestFromUser,
  getSongRequestFromUser,
  forgotPassword
};
