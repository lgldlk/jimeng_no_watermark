// 监听DOM变化，添加下载按钮
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      addDownloadButtons();
    }
  });
});

// 开始观察DOM变化
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// 添加下载按钮
function addDownloadButtons() {
  // 监听图片容器
  const imageContainers = document.querySelectorAll('.masonry-layout img, .scroll-list-[xxx] img, .lv-modal-wrapper img');
  imageContainers.forEach((container) => {
    if (!container.parentElement.querySelector('.download-btn')) {
      const downloadBtn = createDownloadButton(container.src, 'image');
      container.parentElement.appendChild(downloadBtn);
    }
  });

  // 监听视频容器
  const videoContainers = document.querySelectorAll('.masonry-layout video, .scroll-list-[xxx] video, .lv-modal-wrapper video');
  videoContainers.forEach((container) => {
    if (!container.parentElement.querySelector('.download-btn')) {
      const downloadBtn = createDownloadButton(container.src, 'video');
      container.parentElement.appendChild(downloadBtn);
    }
  });
}

// 创建下载按钮
function createDownloadButton(url, type) {
  const btn = document.createElement('button');
  btn.className = 'download-btn';
  btn.textContent = '无水印下载';
  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDownload(url, type);
  };
  return btn;
}

// 处理下载
function handleDownload(url, type) {
  // 处理图片URL，替换分辨率
  if (type === 'image') {
    url = url.replace(/\d+:\d+/, '2400:2400');
  }

  // 发送消息给background script处理下载
  chrome.runtime.sendMessage({
    action: 'download',
    url: url,
    type: type,
  });
}

// 初始检查
addDownloadButtons();
