const bcrypt = require('bcryptjs');
const Admin = require('../model/Admin'); // Sử dụng model Admin
const jwt = require('jsonwebtoken');

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



module.exports = {
  loginAdmin,
  registerAdmin
};
