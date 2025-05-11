// 常量定义
const CONTAINERS = [
  '.masonry-layout',
  '[class^="scroll-list-"]', // 匹配所有以 scroll-list- 开头的类名
  '.lv-modal-wrapper',
];

const VIDEO_CONTAINER_SELECTOR = '[class^="videoAndAction-"]'; // 视频容器选择器
const IMAGE_CONTAINER_SELECTOR = '[class^="imageContainer-"]'; // 图片容器选择器
const BUTTON_CLASS = 'download-btn';
const CHECK_INTERVAL = 1000; // 检查间隔（毫秒）

// 工具函数
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 下载按钮类
class DownloadButton {
  constructor(mediaElement, type) {
    this.mediaElement = mediaElement; // 存储媒体元素引用
    this.type = type;
    this.element = this.createElement();
  }

  createElement() {
    const btn = document.createElement('button');
    btn.className = BUTTON_CLASS;
    btn.textContent = '无水印下载';
    btn.onclick = this.handleClick.bind(this);
    return btn;
  }

  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.download();
  }

  download() {
    try {
      // 获取当前的 src
      let downloadUrl;
      if (this.type === 'video') {
        downloadUrl = this.mediaElement.querySelector('video')?.src;
      } else if (this.type === 'image') {
        downloadUrl = this.mediaElement.querySelector('img')?.src;
      }

      if (!downloadUrl) {
        console.error(
          'No source URL found',
          this.mediaElement,
          this.mediaElement.querySelector('video'),
          this.type
        );
        return;
      }

      chrome.runtime.sendMessage({
        action: 'download',
        url: downloadUrl,
        type: this.type,
      });
    } catch (error) {
      console.error('Download failed:', error);
    }
  }
}

// 主要功能类
class MediaDownloader {
  constructor() {
    this.checkedElements = new WeakSet();
    this.checkInterval = null;
    this.init();
  }

  init() {
    // 保持原有的页面检查
    this.checkForContainers();
    this.checkForVideoContainers();
    this.checkForImageContainers();

    // 设置定期检查
    this.checkInterval = setInterval(() => {
      this.checkForContainers();
      this.checkForVideoContainers();
      this.checkForImageContainers();
    }, CHECK_INTERVAL);

    // 监听body变化，检查模态框
    const bodyObserver = new MutationObserver((mutations) => {
      const modalWrapper = document.querySelector('.lv-modal-wrapper');
      if (!modalWrapper) return;

      const mediaTypes = [
        { type: 'video', selector: 'video' },
        { type: 'image', selector: 'img' },
      ];

      mediaTypes.forEach(({ type, selector }) => {
        const mediaElement = modalWrapper.querySelector(selector);
        if (!mediaElement) return;

        const container = mediaElement.closest('[class^="left-"]') || mediaElement.parentElement;
        if (container && !container.querySelector(`.${BUTTON_CLASS}`)) {
          this.addMediaDownloadButton(container, type);
        }
      });
    });

    // 观察body的变化
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  checkForContainers() {
    CONTAINERS.forEach((containerSelector) => {
      const containers = document.querySelectorAll(containerSelector);
      containers.forEach((container) => {
        if (!this.checkedElements.has(container)) {
          this.checkedElements.add(container);
        }
      });
    });
  }

  addMediaDownloadButton(container, type) {
    if (!container || container.querySelector(`.${BUTTON_CLASS}`)) return;

    // 确保容器有相对定位
    const position = window.getComputedStyle(container).position;
    if (position === 'static') {
      container.style.position = 'relative';
    }

    const button = new DownloadButton(container, type);

    // 如果是在模态框中，确保按钮始终可见
    if (container.closest('.lv-modal-wrapper')) {
      button.element.style.opacity = '1';
    }

    container.appendChild(button.element);
  }

  // 清理方法
  destroy() {
    // 清除定时器
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // 断开所有观察器
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.checkedElements = new WeakSet();
  }

  checkForVideoContainers() {
    const videoContainers = document.querySelectorAll(VIDEO_CONTAINER_SELECTOR);
    videoContainers.forEach((container) => {
      if (!this.checkedElements.has(container)) {
        this.checkedElements.add(container);
        this.addMediaDownloadButton(container, 'video');
      }
    });
  }

  checkForImageContainers() {
    const imageContainers = document.querySelectorAll(IMAGE_CONTAINER_SELECTOR);
    imageContainers.forEach((container) => {
      if (!this.checkedElements.has(container)) {
        this.checkedElements.add(container);
        this.addMediaDownloadButton(container, 'image');
      }
    });
  }
}

// 初始化
let downloader = null;
try {
  downloader = new MediaDownloader();

  // 添加清理代码
  window.addEventListener('unload', () => {
    if (downloader) {
      downloader.destroy();
    }
  });
} catch (error) {
  console.error('Extension initialization failed:', error);
}
