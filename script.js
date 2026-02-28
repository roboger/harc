// 初始化 Lucide 图标
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // 背景轮播图自动切换
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentIndex = 0;

    function changeCarousel() {
        // 隐藏当前图片
        carouselItems[currentIndex].classList.add('opacity-0');
        carouselItems[currentIndex].classList.remove('opacity-100');
        
        // 切换到下一张
        currentIndex = (currentIndex + 1) % carouselItems.length;
        
        // 显示下一张图片
        carouselItems[currentIndex].classList.remove('opacity-0');
        carouselItems[currentIndex].classList.add('opacity-100');
    }

    // 每5秒切换一次背景图
    setInterval(changeCarousel, 5000);

    // 平滑滚动（增强原生 scroll-smooth）
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // 偏移导航栏高度
                    behavior: 'smooth'
                });
            }
        });
    });

    // 导航栏滚动效果
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('shadow-md');
            header.classList.remove('shadow-sm');
        } else {
            header.classList.remove('shadow-md');
            header.classList.add('shadow-sm');
        }
    });
});