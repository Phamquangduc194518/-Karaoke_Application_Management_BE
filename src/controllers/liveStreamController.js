const { User } = require("../model");
const CommentLiveStream = require("../model/CommentLiveStream");
const LiveStream = require("../model/LiveStream");

const createLiveStream = async(req, res) =>{
    try{
    const host_user_id = req.user.id
    const{title} = req.body
    if(!title){
        return res.status(400).json({
            message: 'Chưa có tiêu đề',
          });
    }
    const live = await LiveStream.create({
        host_user_id:host_user_id,
        title
    });
    return res.status(201).json(live);
}catch(error){
    return res.status(500).json({
        message: 'Lỗi khi live',
        error: error.message,
      });
}
}

const updateLiveStream = async(req, res)=>{
    try{
        const host_user_id = req.user.id
         // Kiểm tra xem bản ghi có tồn tại không
         const live = await LiveStream.findOne({
            where: { host_user_id: host_user_id },
        });
        if (!live) {
            return res.status(404).json({
                message: 'Không tìm thấy buổi live với host_user_id này.',
            });
        }

        await LiveStream.update(
            { status: 'ended' },
            {where:{host_user_id: host_user_id}},
           
        );
        res.status(200).json({
            message: `Cập nhật trạng thái buổi live thành công`,
        });
    }catch(error){
        return res.status(500).json({
            message: 'Lỗi khi updatelive',
            error: error.message,
        })
    }
}

const getLiveStream = async (req, res)=>{
    try{
    const live = await LiveStream.findOne({
        where : {
            status: 'active'
        },
        attributes:["stream_id","title","description","host_user_id","status", "participants_count"]
    })
    if (live.length === 0) {
        return res.status(404).json({ message: 'Không có ai live stream' });
    }
    res.status(200).json(live);
    }catch(error){
        res.status(500).json({
            message: 'Lỗi khi luồng trực tiếp đang hoạt động',
            error: error.message,
        });
    }
}

const createCommentLiveStream = async(req, res) =>{
    try{
        const user_id = req.user.id
        const {stream_id, comment_text , url_sticker, url_image} = req.body
        if (!stream_id || !user_id || !comment_text && !url_sticker && !url_image) {
            return res.status(400).json({ message: 'Thiếu trường dữ liệu' });
        }

        const liveStream  = await LiveStream.findOne({where:{stream_id: stream_id}});
        if(!liveStream){
            return res.status(404).json({message: 'Live stream not found'})
        }
        const newComment = await CommentLiveStream.create({
            stream_id,
            user_id,
            comment_text: comment_text || "",
            url_sticker: url_sticker || null,
            url_image: url_image || null,
        });
        res.status(201).json({
            message: 'Comment created successfully',
            comment: newComment,
        });
    }catch(error){
        res.status(500).json({
            message: 'Error creating comment',
            error: error.message,
        });
    }
}

const getCommentsByStream  = async(req, res) =>{
    try{
        const { stream_id } = req.params;
        if (!stream_id) {
            return res.status(400).json({ message: 'thiếu tham số Stream_id ' });
        }
        const comments = await CommentLiveStream.findAll({
            where: { stream_id: stream_id},
            order: [['created_at', 'DESC']],
            attributes:['live_comment_id','stream_id','user_id','comment_text' , 'url_sticker', 'url_image','status', 'created_at'],
            include:[
                {
                    model: User,
                    as: 'userCommentLive',
                    attributes: ['user_id', 'username', 'avatar_url']
                }
            ]
        });
        if (comments.length === 0) {
            return res.status(404).json({ message: 'Không có bình luận nào trong buổi live' });
        }
        res.status(200).json(comments);
    }catch(error){
        res.status(500).json({
            message: 'Error fetching comments.',
            error: error.message,
        });
    }
}
module.exports = {
    createLiveStream,
    updateLiveStream,
    getLiveStream,
    createCommentLiveStream,
    getCommentsByStream,
}