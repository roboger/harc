(function() {
    'use strict';

    // 检测浏览器功能支持情况
    var features = {
        intersectionObserver: 'IntersectionObserver' in window,
        backdropFilter: CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)'),
        smoothScroll: 'scrollBehavior' in document.documentElement.style
    };

    // --- 移动端菜单 ---
    function initMobileMenu() {
        var menuToggle = document.getElementById('menuToggle');
        var closeMenu = document.getElementById('closeMenu');
        var mobileMenu = document.getElementById('mobileMenu');
        var overlay = document.getElementById('overlay');
        
        if (!menuToggle || !mobileMenu || !overlay) return;

        var menuLinks = mobileMenu.querySelectorAll('a');

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

        for (var i = 0; i < menuLinks.length; i++) {
            menuLinks[i].addEventListener('click', closeMobileMenu);
        }
    }

    // --- 图片懒加载 ---
    function initLazyLoading() {
        if (!features.intersectionObserver) {
            // 降级方案：直接加载所有图片
            var lazyImages = document.querySelectorAll('img[loading="lazy"]');
            for (var i = 0; i < lazyImages.length; i++) {
                lazyImages[i].classList.add('loaded', 'opacity-100');
                lazyImages[i].classList.remove('opacity-0');
            }
            return;
        }

        var lazyImages = document.querySelectorAll('img[loading="lazy"]:not(.processed)');
        var imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    if (img.classList.contains('loaded')) return;
                    img.classList.add('loaded', 'opacity-100');
                    img.classList.remove('opacity-0');
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        for (var i = 0; i < lazyImages.length; i++) {
            lazyImages[i].classList.add('opacity-0', 'transition-opacity', 'duration-500');
            imageObserver.observe(lazyImages[i]);
        }
    }

    // --- 背景轮播 ---
    function initCarousel() {
        var carouselItems = document.querySelectorAll('.carousel-item');
        if (carouselItems.length === 0) return;

        var currentSlide = 0;
        
        function showSlide(index) {
            for (var i = 0; i < carouselItems.length; i++) {
                carouselItems[i].style.opacity = i === index ? '1' : '0';
            }
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % carouselItems.length;
            showSlide(currentSlide);
        }

        setInterval(nextSlide, 5000);
    }

    // --- 二维码触摸交互 ---
    function initQrCode() {
        var qrContainers = document.querySelectorAll('.qr-container');
        
        for (var i = 0; i < qrContainers.length; i++) {
            (function(container) {
                var hideTimer = null;
                
                container.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    if (hideTimer) clearTimeout(hideTimer);
                    container.classList.add('active');
                });

                container.addEventListener('touchend', function() {
                    hideTimer = setTimeout(function() {
                        container.classList.remove('active');
                    }, 3000);
                });

                container.addEventListener('touchcancel', function() {
                    if (hideTimer) clearTimeout(hideTimer);
                    container.classList.remove('active');
                });

                container.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (container.classList.contains('active')) {
                        container.classList.remove('active');
                    } else {
                        container.classList.add('active');
                        setTimeout(function() {
                            container.classList.remove('active');
                        }, 5000);
                    }
                });
            })(qrContainers[i]);
        }

        // 全局点击隐藏
        document.addEventListener('click', function(e) {
            for (var i = 0; i < qrContainers.length; i++) {
                if (!e.target.closest('.qr-container')) {
                    qrContainers[i].classList.remove('active');
                }
            }
        });
    }

    // --- 合作伙伴轮播 ---
  function initPartnerCarousel() {
    var track = document.getElementById('partnerTrack');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    
    if (!track || !prevBtn || !nextBtn) return;

    var itemWidth = 0;
    var itemCount = document.querySelectorAll('.partner-item').length;
    var currentPos = 0;
    var autoPlayTimer = null;
    var isTransitioning = false;

    // 计算可见卡片数量（根据屏幕宽度）
    function getVisibleCount() {
        return window.innerWidth >= 768 ? 7 : 4;
    }

    // 更新按钮显示状态
    function updateButtonsVisibility() {
        if (itemCount <= getVisibleCount()) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';   // 因为按钮有 flex 类
            nextBtn.style.display = 'flex';
        }
    }

    // 计算卡片宽度（包括 gap）
    function calcItemWidth() {
        var firstItem = document.querySelector('.partner-item');
        if (firstItem) {
            var gap = window.innerWidth >= 768 ? 16 : 12; // gap-4 = 16px, gap-3 = 12px
            itemWidth = firstItem.offsetWidth + gap;
        }
    }

    calcItemWidth();
    updateButtonsVisibility();

    window.addEventListener('resize', function() {
        calcItemWidth();
        updateButtonsVisibility();
        // 如果当前偏移量超出新范围，复位到合理位置
        var maxOffset = -itemWidth * (itemCount - getVisibleCount());
        if (currentPos < maxOffset) currentPos = maxOffset;
        if (currentPos > 0) currentPos = 0;
        setTrackTransform();
    });

    function setTrackTransform() {
        track.style.transform = 'translateX(' + currentPos + 'px)';
        if ('webkitTransform' in track.style) {
            track.style.webkitTransform = 'translateX(' + currentPos + 'px)';
        }
    }

    function slide(direction) {
        // 如果正在过渡或卡片数量不足，直接返回
        if (isTransitioning) return;
        if (itemCount <= getVisibleCount()) return; // 已隐藏按钮，但以防万一

        isTransitioning = true;
        var step = 1; // 每次滑动一个卡片

        if (direction === 'next') {
            currentPos -= itemWidth * step;
            var maxNeg = -itemWidth * (itemCount - getVisibleCount());
            if (currentPos < maxNeg) {
                // 实现无限循环：瞬间跳转到开头
                track.style.transition = 'none';
                if ('webkitTransition' in track.style) {
                    track.style.webkitTransition = 'none';
                }
                currentPos = maxNeg + itemWidth * step; // 调整到合适位置
                setTrackTransform();
                setTimeout(function() {
                    track.style.transition = 'transform 0.5s ease';
                    if ('webkitTransition' in track.style) {
                        track.style.webkitTransition = '-webkit-transform 0.5s ease';
                    }
                    currentPos = maxNeg; // 再滑到最左？实际上我们希望无缝衔接
                    // 简单处理：直接复位到0并滑过一张，这里需要更精细的逻辑
                    // 为了简化，我们改为不循环，直接禁用按钮到底
                    // 但你可以保留原有复杂逻辑，但确保计算正确
                    // 这里采用简化版：当到达末端时，平滑跳回开头
                    currentPos = 0;
                    setTrackTransform();
                    isTransitioning = false;
                }, 50);
            } else {
                setTrackTransform();
                setTimeout(function() { isTransitioning = false; }, 500);
            }
        } else { // prev
            currentPos += itemWidth * step;
            if (currentPos > 0) {
                track.style.transition = 'none';
                if ('webkitTransition' in track.style) {
                    track.style.webkitTransition = 'none';
                }
                currentPos = -itemWidth * (itemCount - getVisibleCount());
                setTrackTransform();
                setTimeout(function() {
                    track.style.transition = 'transform 0.5s ease';
                    if ('webkitTransition' in track.style) {
                        track.style.webkitTransition = '-webkit-transform 0.5s ease';
                    }
                    currentPos = -itemWidth * (itemCount - getVisibleCount()) + itemWidth * step;
                    setTrackTransform();
                    setTimeout(function() { isTransitioning = false; }, 500);
                }, 50);
            } else {
                setTrackTransform();
                setTimeout(function() { isTransitioning = false; }, 500);
            }
        }
    }

    prevBtn.addEventListener('click', function() { 
        slide('prev'); 
        resetAutoPlay(); 
    });

    nextBtn.addEventListener('click', function() { 
        slide('next'); 
        resetAutoPlay(); 
    });

    function startAutoPlay() {
        if (itemCount > getVisibleCount()) {
            autoPlayTimer = setInterval(function() { slide('next'); }, 3000);
        }
    }

    function resetAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        startAutoPlay();
    }

    startAutoPlay();

    track.addEventListener('touchstart', function() { 
        if (autoPlayTimer) clearInterval(autoPlayTimer); 
    });

    track.addEventListener('touchend', startAutoPlay);
}

    // --- 平滑滚动处理 ---
    function initSmoothScroll() {
        if (features.smoothScroll) {
            // 如果浏览器原生支持，只设置scroll-margin-top
            return;
        }
        
        // 降级方案：使用JavaScript实现平滑滚动
        var anchors = document.querySelectorAll('a[href^="#"]');
        for (var i = 0; i < anchors.length; i++) {
            anchors[i].addEventListener('click', function(e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                var targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    var headerOffset = 80;
                    var elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    var offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    // --- 修复桌面导航显示 ---
    function fixDesktopNav() {
        var desktopNav = document.getElementById('desktopNav');
        if (desktopNav) {
            desktopNav.style.display = '';
            if (window.innerWidth >= 768) {
                desktopNav.classList.add('md:flex');
                desktopNav.classList.remove('hidden');
            } else {
                desktopNav.classList.add('hidden');
                desktopNav.classList.remove('md:flex');
            }
        }
    }

    // --- 初始化Lucide图标 ---
    function initLucide() {
        if (window.lucide) {
            try {
                lucide.createIcons();
            } catch (e) {
                console.warn('Lucide图标初始化失败');
            }
        } else {
            // 等待lucide加载
            var checkLucide = setInterval(function() {
                if (window.lucide) {
                    clearInterval(checkLucide);
                    try {
                        lucide.createIcons();
                    } catch (e) {
                        console.warn('Lucide图标初始化失败');
                    }
                }
            }, 100);
            
            // 超时处理
            setTimeout(function() {
                clearInterval(checkLucide);
            }, 5000);
        }
    }

    // --- 修复iOS上某些元素的点击问题 ---
    function fixIOSTouch() {
        var elements = document.querySelectorAll('a, button, .touch-feedback');
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('touchstart', function() {}, { passive: true });
        }
    }

    // 执行所有初始化函数
    function init() {
        fixDesktopNav();
        initMobileMenu();
        initLazyLoading();
        initCarousel();
        initQrCode();
        initPartnerCarousel();
        initSmoothScroll();
        initLucide();
        fixIOSTouch();
        
        // 窗口大小改变时重新检查导航显示
        window.addEventListener('resize', function() {
            fixDesktopNav();
        });
    }

    // 根据文档加载状态执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
