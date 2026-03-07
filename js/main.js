(function() {
    'use strict';

    // 等待DOM解析完成
    function initApp() {
        // --- 移动端菜单 ---
        const menuToggle = document.getElementById('menuToggle');
        const closeMenu = document.getElementById('closeMenu');
        const mobileMenu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('overlay');
        const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

        if (menuToggle && mobileMenu && overlay) {
            function openMenu() {
                mobileMenu.classList.add('active');
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
            function closeMobileMenu() {
                mobileMenu.classList.remove('active');
                overlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
            menuToggle.addEventListener('click', openMenu);
            if (closeMenu) closeMenu.addEventListener('click', closeMobileMenu);
            overlay.addEventListener('click', closeMobileMenu);
            menuLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
        }

        // --- 图片懒加载增强 (IntersectionObserver) ---
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]:not(.processed)');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        // 如果已加载过就不再处理
                        if (img.classList.contains('loaded')) return;
                        img.classList.add('loaded', 'opacity-100');
                        img.classList.remove('opacity-0');
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '200px' }); // 提前加载

            lazyImages.forEach(img => {
                img.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                imageObserver.observe(img);
            });
        }

        // --- 背景轮播 ---
        const carouselItems = document.querySelectorAll('.carousel-item');
        if (carouselItems.length > 0) {
            let currentSlide = 0;
            function showSlide(index) {
                carouselItems.forEach((item, i) => {
                    item.style.opacity = i === index ? '1' : '0';
                });
            }
            function nextSlide() {
                currentSlide = (currentSlide + 1) % carouselItems.length;
                showSlide(currentSlide);
            }
            setInterval(nextSlide, 5000);
        }

        // --- 二维码触摸交互 (移动端长按显示) ---
        const qrContainers = document.querySelectorAll('.qr-container');
        qrContainers.forEach(container => {
            let hideTimer = null;
            container.addEventListener('touchstart', (e) => {
                e.preventDefault();
                clearTimeout(hideTimer);
                container.classList.add('active');
            });
            container.addEventListener('touchend', () => {
                hideTimer = setTimeout(() => {
                    container.classList.remove('active');
                }, 3000); // 保持3秒方便扫码
            });
            container.addEventListener('touchcancel', () => {
                clearTimeout(hideTimer);
                container.classList.remove('active');
            });
            // 点击切换 (可选)
            container.addEventListener('click', (e) => {
                e.preventDefault();
                if (container.classList.contains('active')) {
                    container.classList.remove('active');
                } else {
                    container.classList.add('active');
                    setTimeout(() => container.classList.remove('active'), 5000);
                }
            });
        });
        // 全局点击隐藏所有二维码
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.qr-container')) {
                qrContainers.forEach(c => c.classList.remove('active'));
            }
        });

        // --- 无限循环轮播 (合作伙伴) ---
        const track = document.getElementById('partnerTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (track && prevBtn && nextBtn) {
            let itemWidth = 0;
            let itemCount = document.querySelectorAll('.partner-item').length;
            let currentPos = 0;
            let autoPlayTimer = null;
            let isTransitioning = false;

            function calcItemWidth() {
                const firstItem = document.querySelector('.partner-item');
                if (firstItem) {
                    itemWidth = firstItem.offsetWidth + (window.innerWidth >= 768 ? 16 : 12);
                }
            }
            calcItemWidth();
            window.addEventListener('resize', () => {
                if (!isTransitioning) {
                    calcItemWidth();
                    track.style.transform = `translateX(${currentPos}px)`;
                }
            });

            function getVisibleCount() {
                return window.innerWidth >= 768 ? 7 : 4;
            }

            function slide(direction) {
                if (isTransitioning || itemCount <= getVisibleCount()) return;
                isTransitioning = true;
                const step = 1;
                if (direction === 'next') {
                    currentPos -= itemWidth * step;
                    if (Math.abs(currentPos) >= itemWidth * (itemCount - getVisibleCount())) {
                        track.style.transform = `translateX(-${itemWidth * itemCount}px)`;
                        setTimeout(() => {
                            track.style.transition = 'none';
                            currentPos = 0;
                            track.style.transform = `translateX(0)`;
                            setTimeout(() => track.style.transition = 'transform 0.5s ease', 50);
                            isTransitioning = false;
                        }, 500);
                    } else {
                        track.style.transform = `translateX(${currentPos}px)`;
                        setTimeout(() => isTransitioning = false, 500);
                    }
                } else {
                    currentPos += itemWidth * step;
                    if (currentPos > 0) {
                        track.style.transition = 'none';
                        currentPos = -itemWidth * (itemCount - getVisibleCount());
                        track.style.transform = `translateX(${currentPos}px)`;
                        setTimeout(() => {
                            track.style.transition = 'transform 0.5s ease';
                            currentPos += itemWidth * step;
                            track.style.transform = `translateX(${currentPos}px)`;
                            setTimeout(() => isTransitioning = false, 500);
                        }, 50);
                    } else {
                        track.style.transform = `translateX(${currentPos}px)`;
                        setTimeout(() => isTransitioning = false, 500);
                    }
                }
            }

            prevBtn.addEventListener('click', () => { slide('prev'); resetAutoPlay(); });
            nextBtn.addEventListener('click', () => { slide('next'); resetAutoPlay(); });

            function startAutoPlay() {
                if (itemCount > getVisibleCount()) {
                    autoPlayTimer = setInterval(() => slide('next'), 3000);
                }
            }
            function resetAutoPlay() {
                clearInterval(autoPlayTimer);
                startAutoPlay();
            }

            // 初始化克隆卡片（简易无缝）
            function initCloneItems() {
                if (itemCount <= getVisibleCount()) return;
                const items = document.querySelectorAll('.partner-item');
                // 简单处理：这里只做位置初始化
                currentPos = 0;
                track.style.transform = `translateX(0)`;
            }
            initCloneItems();
            startAutoPlay();

            track.addEventListener('touchstart', (e) => { clearInterval(autoPlayTimer); });
            track.addEventListener('touchend', startAutoPlay);
        }

        // --- 初始化 Lucide 图标 (确保图标渲染) ---
        if (window.lucide) {
            lucide.createIcons();
        } else {
            // 如果lucide未加载，等待它
            window.addEventListener('load', function() {
                if (window.lucide) lucide.createIcons();
            });
        }

        // --- 平滑滚动处理 ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault(); // 阻止默认跳转
                    const headerOffset = 80; // 固定头部高度
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // 如果DOM已加载则立即执行，否则监听事件
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
