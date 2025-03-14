# 1. Sử dụng Node.js làm base image
FROM node:18

# 2. Thiết lập thư mục làm việc
WORKDIR /app

# 3. Sao chép file package.json và package-lock.json
COPY package*.json ./

# 4. Cài đặt dependencies
RUN npm install

# 5. Sao chép toàn bộ mã nguồn
COPY . .

# 6. Expose cổng
EXPOSE 3000

# 7. Khởi chạy ứng dụng
CMD ["npm", "start"]
