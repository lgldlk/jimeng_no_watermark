// 常量定义
const FILE_TYPES = {
  image: {
    extension: '.png',
    prefix: 'image',
  },
  video: {
    extension: '.mp4',
    prefix: 'video',
  },
};

// 生成文件名
function generateFilename(type) {
  const { prefix, extension } = FILE_TYPES[type] || FILE_TYPES.image;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `jimeng_${prefix}_${timestamp}${extension}`;
}

// 处理下载
async function handleDownload(url, type) {
  try {
    const filename = generateFilename(type);
    await chrome.downloads.download({
      url,
      filename,
      saveAs: true,
    });
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download') {
    handleDownload(request.url, request.type)
      .then((success) => {
        sendResponse({ success });
      })
      .catch((error) => {
        console.error('Download error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道开放
  }
});
