// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 1. 移动端菜单交互
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');

    // 打开菜单
    menuToggle?.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    });

    // 关闭菜单
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.add('hidden');
        document.body.style.overflow = ''; // 恢复滚动
    }
    closeMenu?.addEventListener('click', closeMobileMenu);
    overlay?.addEventListener('click', closeMobileMenu);

    // 2. 英雄区背景轮播（自动切换）
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentCarouselIndex = 0;
    
    function rotateCarousel() {
        // 隐藏当前项
        carouselItems[currentCarouselIndex].style.opacity = 0;
        // 切换到下一项
        currentCarouselIndex = (currentCarouselIndex + 1) % carouselItems.length;
        // 显示下一项
        carouselItems[currentCarouselIndex].style.opacity = 1;
    }

    // 启动轮播（5秒切换一次）
    if (carouselItems.length > 1) {
        setInterval(rotateCarousel, 5000);
    }

    // 3. Lucide 图标初始化（确保图标渲染）
    if (window.lucide) {
        lucide.createIcons();
    }

    // 4. 二维码弹出层交互（移动端触摸支持）
    const qrContainers = document.querySelectorAll('.qr-container');
    qrContainers.forEach(container => {
        // 移动端触摸切换
        container.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
        });
    });

    // 5. 平滑滚动增强（兼容低版本浏览器）
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // 首页链接不处理
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                // 移动端点击锚点后关闭菜单
                closeMobileMenu();
            }
        });
    });
});
