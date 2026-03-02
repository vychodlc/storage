/**
 * 数据库设置说明
 *
 * 1. 在 Neon 控制台创建数据库
 * 2. 复制 DATABASE_URL 到 .env 文件
 * 3. 使用 Neon 的 SQL 编辑器执行 src/lib/schema.sql
 * 4. 可选：执行初始化数据脚本
 */

export const DB_SETUP_GUIDE = `
# 数据库设置指南

## 1. 创建 Neon 数据库
访问 https://console.neon.tech/ 创建新项目和数据库

## 2. 配置环境变量
复制 Neon 提供的 DATABASE_URL 到 .env 文件：
\`\`\`
DATABASE_URL="postgresql://..."
\`\`\`

## 3. 执行 Schema
在 Neon 的 SQL Editor 中执行 src/lib/schema.sql 的内容

## 4. 初始化数据（可选）
可以通过页面界面手动添加数据，或创建初始化脚本
`;
