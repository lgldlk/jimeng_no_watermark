#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Zip } from 'zip-lib';
import { createRequire } from 'module';
import process from 'node:process';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置路径
const DIST_DIR = path.join(__dirname, '../dist');
const DEST_ZIP_DIR = path.join(__dirname, '../dist-zip');

/**
 * 从manifest和package.json获取插件信息
 * @returns {{name: string, version: string}}
 */
const getExtensionInfo = () => {
  const pkg = require('../package.json');
  return {
    name: pkg.name,
    version: pkg.version,
  };
};

/**
 * 确保输出目录存在
 */
const ensureOutputDir = () => {
  if (!fs.existsSync(DEST_ZIP_DIR)) {
    fs.mkdirSync(DEST_ZIP_DIR, { recursive: true });
  }
};

/**
 * 创建ZIP文件
 * @param {string} srcDir 源目录
 * @param {string} destDir 目标目录
 * @param {string} filename 文件名
 * @returns {Promise<void>}
 */
const createZip = async (srcDir, destDir, filename) => {
  console.log(`开始打包: ${filename}`);

  const zip = new Zip();
  await zip.addFolder(srcDir);

  const outputPath = path.join(destDir, filename);
  await zip.archive(outputPath);

  console.log(`打包完成: ${outputPath}`);
};

/**
 * 主函数
 */
const main = async () => {
  try {
    // 检查dist目录是否存在
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error('dist目录不存在，请先运行 npm run build');
    }

    const { name, version } = getExtensionInfo();
    const zipFilename = `${name}-v${version}.zip`;

    ensureOutputDir();
    await createZip(DIST_DIR, DEST_ZIP_DIR, zipFilename);

    console.log('✨ 打包成功!');
  } catch (error) {
    console.error('❌ 打包失败:', error.message);
    process.exit(1);
  }
};

main();
