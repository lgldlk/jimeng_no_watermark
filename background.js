// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download') {
    const url = request.url;
    const type = request.type;

    // 生成文件名
    const timestamp = new Date().getTime();
    const extension = type === 'image' ? '.png' : '.mp4';
    const filename = `jimeng_${timestamp}${extension}`;

    // 下载文件
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true,
    });
  }
});
