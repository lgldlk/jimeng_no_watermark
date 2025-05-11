// 常量定义
const CONTAINERS = [
  '.masonry-layout',
  '[class^="scroll-list-"]', // 匹配所有以 scroll-list- 开头的类名
  '.lv-modal-wrapper',
];

const VIDEO_CONTAINER_SELECTOR = '[class^="videoAndAction-"]'; // 视频容器选择器
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
      // 获取当前的 src（对于视频，在点击时获取）
      const downloadUrl =
        this.type === 'video'
          ? this.mediaElement.querySelector('video')?.src
          : this.mediaElement.src;

      if (!downloadUrl) {
        console.error('No source URL found');
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
    this.observers = new Map();
    this.checkedElements = new WeakSet(); // 用于跟踪已处理的元素
    this.checkInterval = null;
    this.init();
  }

  init() {
    // 初始检查
    this.checkForContainers();
    this.checkForVideoContainers(); // 检查视频容器

    // 设置定期检查
    this.checkInterval = setInterval(() => {
      this.checkForContainers();
      this.checkForVideoContainers(); // 定期检查视频容器
    }, CHECK_INTERVAL);

    // 设置页面观察器
    this.setupPageObserver();
  }

  setupPageObserver() {
    // 监听整个页面的变化
    const pageObserver = new MutationObserver(
      debounce((mutations) => {
        this.checkForContainers();
        this.checkForVideoContainers();
      }, 200)
    );

    pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true, // 监听属性变化
      attributeFilter: ['class'], // 只监听类名变化
    });
  }

  checkForVideoContainers() {
    const videoContainers = document.querySelectorAll(VIDEO_CONTAINER_SELECTOR);
    videoContainers.forEach((container) => {
      if (!this.checkedElements.has(container)) {
        this.checkedElements.add(container);
        this.setupObserverForElement(container);
        this.addVideoDownloadButton(container);
      }
    });
  }

  checkForContainers() {
    CONTAINERS.forEach((containerSelector) => {
      const containers = document.querySelectorAll(containerSelector);
      containers.forEach((container) => {
        // 检查是否已处理过该容器
        if (!this.checkedElements.has(container)) {
          this.checkedElements.add(container);
          this.setupObserverForElement(container);
          this.addDownloadButtonsToElement(container);
        }
      });
    });
  }

  setupObserverForElement(element) {
    if (!this.observers.has(element)) {
      const observer = new MutationObserver(
        debounce((mutations) => {
          // 检查是否有新增节点或者属性变化
          if (
            mutations.some(
              (mutation) =>
                (mutation.type === 'childList' && mutation.addedNodes.length) ||
                (mutation.type === 'attributes' && mutation.attributeName === 'src')
            )
          ) {
            if (element.matches(VIDEO_CONTAINER_SELECTOR)) {
              this.addVideoDownloadButton(element);
            } else {
              this.addDownloadButtonsToElement(element);
            }
          }
        }, 200)
      );

      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true, // 监听属性变化
        attributeFilter: ['src'], // 只监听src属性变化
      });

      this.observers.set(element, observer);
    }
  }

  addVideoDownloadButton(container) {
    if (!container || container.querySelector(`.${BUTTON_CLASS}`)) return;

    // 确保容器有相对定位
    const position = window.getComputedStyle(container).position;
    if (position === 'static') {
      container.style.position = 'relative';
    }

    // 添加下载按钮到视频容器
    const button = new DownloadButton(container, 'video');
    container.appendChild(button.element);
  }

  addDownloadButtonsToElement(container) {
    if (!container) return;

    // 只处理图片，视频由专门的方法处理
    const images = container.querySelectorAll('img');
    images.forEach((image) => {
      if (this.shouldAddButton(image)) {
        const wrapper = this.ensureProperWrapper(image);
        const button = new DownloadButton(image, 'image');
        wrapper.appendChild(button.element);
      }
    });
  }

  ensureProperWrapper(element) {
    const wrapper = element.parentElement;

    // 检查父元素是否已经有相对定位
    const position = window.getComputedStyle(wrapper).position;
    if (position === 'static') {
      wrapper.style.position = 'relative';
    }

    return wrapper;
  }

  shouldAddButton(element) {
    return (
      element.parentElement &&
      !element.parentElement.querySelector(`.${BUTTON_CLASS}`) &&
      element.src
    ); // 确保元素有src属性
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
