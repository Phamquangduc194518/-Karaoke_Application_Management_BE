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
const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');


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

const updateProfile = async (req, res)=>{

  const userId = req.user.id// Lấy từ JWT
  const { username, phone, password, date_of_birth, gender, email, avatar_url } = req.body;
  try{
    // Kiểm tra nếu tất cả các trường đều rỗng hoặc thiếu
    if (!username && !phone && !password && !date_of_birth && !gender && !email && !avatar_url) {
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
        attributes: ["user_id","username", "email", "password", "phone", "date_of_birth", "gender", "avatar_url"]
      });
      if (!userInfo) {
        return res.status(404).json({ message: "Người dùng không tồn tại" }); // Nếu người dùng không tồn tại
      }
      return res.status(200).json({userInfo})
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
    const record = await RecordedSong.findAll({
      attributes: [
        "id",
        "user_id",
        "song_name",
        "title",
        "recording_path",
        "cover_image_url",
        "upload_time",
        "likes_count",
        "status",
        // Đếm số lượng bình luận cho bài hát cụ thể
        [sequelize.literal(`(SELECT COUNT(*) FROM Comments WHERE Comments.song_id = RecordedSong.id)`), "comments_count"]
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
      const {song_id, comment_text} = req.body;

      if(!comment_text || !song_id){
        return res.status(400).json({
          message: 'Chưa bình luận',
        });
      }

      const comment = await Comments.create({
        user_id,
        song_id,
        comment_text
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
          attributes: ["title", "subTitle", "url_image"],
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

const CreateCommentVideo = async (req, res) =>{
  try{
      const user_id = req.user.id;
      const {video_id, comment_text} = req.body;

      if(!comment_text || !video_id){
        return res.status(400).json({
          message: 'Chưa bình luận',
        });
      }

      const comment = await CommentsVideo.create({
        user_id,
        video_id,
        comment_text
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
    console.log('Purchase info:', purchaseInfo);
    if (purchaseInfo.purchaseState !== 0) {
      return res.status(400).json({ error: 'Giao dịch không hợp lệ' });
    }
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    let subscription = await Subscription.findOne({ where: { userId: user_id } });
    if(subscription){
      subscription.purchaseToken= purchaseToken
      subscription.orderId = purchaseInfo.orderId;
      subscription.expiryTime = purchaseInfo.expiryTimeMillis;
      subscription.purchaseState = purchaseInfo.purchaseState;
      await subscription.save();
    }else{
      subscription = await Subscription.create({
        userId: user_id,
        purchaseToken: purchaseToken,
        orderId: purchaseInfo.orderId,
        expiryTime: purchaseInfo.expiryTimeMillis,
        purchaseState: purchaseInfo.purchaseState,
      });
    }
    return res.status(200).json({ success: true, subscription });
  }catch (err) {
    console.error('Lỗi xác minh giao dịch:', err);
    return res.status(500).json({ error: 'Xác minh giao dịch thất bại', details: err.message });
  }
}

const storage  = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); 
  },
  filename: function (req, file, cb) {
    // Đặt tên file theo timestamp + random number và phần mở rộng của file gốc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
const uploadAvatar  = async (req, res)=>{
  console.log('req.file:', req.file);
  try{
    if(!req.file){
      return res.status(400).json({ error: 'Không có file được upload' });
    }
    const baseUrl = process.env.BASE_URL;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Chưa xác thực người dùng' });
    }
    // Cập nhật avatar_url cho user trong MySQL
    const updateResult = await User.update(
      { avatar_url: fileUrl },
      { where: { id: userId } }
    );
    if (updateResult[0] === 0) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }
    return res.status(200).json({
      message: 'Upload ảnh đại diện thành công',
      avatar_url: fileUrl
    });
  }catch (error) {
    console.error('Lỗi upload ảnh đại diện:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ', details: error.message });
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
  upload,
  uploadAvatar
};
