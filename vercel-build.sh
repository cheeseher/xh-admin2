#!/bin/bash
set -e

# 进入项目目录
cd xinghai-admin

# 安装依赖
echo "Installing dependencies..."
npm install

# 构建项目
echo "Building project..."
npm run build

echo "Build completed successfully!" 