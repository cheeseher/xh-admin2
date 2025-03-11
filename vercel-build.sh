#!/bin/bash
set -e

# 进入项目目录
cd xinghai-admin

# 安装依赖
echo "Installing dependencies..."
npm install
# 确保安装terser
npm install terser --save-dev

# 构建项目
echo "Building project..."
npm run build

# 复制dist目录到根目录
echo "Copying dist directory to root..."
cp -r dist ../

echo "Build completed successfully!" 