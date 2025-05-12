# 即梦无水印下载插件

这是一个用于下载即梦平台无水印图片和视频的浏览器插件。
![alt text](assets/image.png)
![alt text](assets/image-1.png)
![alt text](assets/image-2.png)

# 插件使用
1. 下载[压缩包](https://github.com/lgldlk/jimeng_no_watermark/archive/refs/tags/1.0.zip) 解压
2. 在浏览器中打开扩展管理页面:
   - Chrome: `chrome://extensions/`
   - Firefox: `about:addons`
   - Edge: `edge://extensions/`
3. 打开开发者模式:
   - Chrome/Edge: 点击右上角的"开发者模式"开关
   - Firefox: 点击齿轮图标,选择"调试附加组件"
4. 加载扩展:
   - Chrome/Edge: 点击"加载已解压的扩展程序"
   - Firefox: 点击"临时加载附加组件"
5. 选择解压后的文件夹
6. 在即梦平台图片或视频预览旁会出现"无水印下载"按钮
7. 点击按钮即可下载原始文件

## 功能特点

- 一键下载无水印图片和视频
- 保持原始分辨率和格式
- 支持Chrome、Firefox和Edge浏览器
- 优化的性能和错误处理
- 代码格式化和质量检查


## 安装说明

1. 克隆此仓库到本地
2. 安装依赖：
   ```bash
   npm install
   ```
3. 构建插件：
   ```bash
   npm run build
   ```
4. 在Chrome浏览器中：
   - 打开扩展程序页面 (chrome://extensions/)
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择此项目的 `dist` 目录

## 使用方法

1. 访问即梦平台 (https://jimeng.jianying.com/)
2. 在图片或视频预览旁会出现"无水印下载"按钮
3. 点击按钮即可下载原始文件

## 开发命令

- `npm run dev` - 启动开发模式，自动重新构建
- `npm run build` - 构建生产版本
- `npm run lint` - 运行代码检查
- `npm run format` - 格式化代码
- `npm run test` - 运行测试
- `npm run zip` - 打包扩展为zip文件

## 项目结构

```
.
├── src/                # 源代码目录
│   ├── content.js     # 内容脚本
│   ├── background.js  # 后台脚本
│   ├── popup.html     # 弹出窗口
│   ├── styles.css     # 样式文件
│   └── manifest.json  # 扩展配置
├── scripts/           # 构建和工具脚本
├── dist/             # 构建输出目录
├── build-zip/        # ZIP包输出目录
└── tests/            # 测试文件
```

## 技术栈

- JavaScript (ES6+)
- Chrome Extension API
- Webpack
- Babel
- ESLint
- Prettier
- Jest

## 代码质量

- ESLint 用于代码质量检查
- Prettier 用于代码格式化
- Jest 用于单元测试
- 持续集成验证

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 提交 Pull Request

## 许可证

MIT 