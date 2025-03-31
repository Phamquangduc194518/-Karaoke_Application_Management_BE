const bcrypt = require('bcryptjs');
const Admin = require('../model/Admin'); // Sử dụng model Admin
const jwt = require('jsonwebtoken');
const { RequestFromUser, User, Replies } = require('../model');

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
            attributes:["id", "content", "createdAt", "is_admin"]
          }
        ]
      });
      return res.status(200).json(requestFromUser);
  }catch (error){
    return res.status(500).json({ error: "Lỗi server", details: error.message });
  }
}

const createReplie = async(req, res) =>{
  try{
    const { request_id, content, is_admin } = req.body;
    if (!request_id || !content) {
      return res.status(400).json({ message: "Thiếu dữ liệu phản hồi" });
    }
    const newReply = await Replies.create({
      request_id,
      content,
      is_admin: is_admin ?? true,
    });
    res.status(200).json({ message: "Phản hồi thành công", reply: newReply });
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


module.exports = {
  loginAdmin,
  registerAdmin,
  getSongRequestFromUser,
  createReplie,
  updateStatus
};
