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

        function calcItemWidth() {
            var firstItem = document.querySelector('.partner-item');
            if (firstItem) {
                var gap = window.innerWidth >= 768 ? 16 : 12;
                itemWidth = firstItem.offsetWidth + gap;
            }
        }

        calcItemWidth();

        window.addEventListener('resize', function() {
            if (!isTransitioning) {
                calcItemWidth();
                track.style.transform = 'translateX(' + currentPos + 'px)';
                if ('webkitTransform' in track.style) {
                    track.style.webkitTransform = 'translateX(' + currentPos + 'px)';
                }
            }
        });

        function getVisibleCount() {
            return window.innerWidth >= 768 ? 7 : 4;
        }

        function slide(direction) {
            if (isTransitioning || itemCount <= getVisibleCount()) return;
            isTransitioning = true;
            var step = 1;

            if (direction === 'next') {
                currentPos -= itemWidth * step;
                if (Math.abs(currentPos) >= itemWidth * (itemCount - getVisibleCount())) {
                    track.style.transition = 'none';
                    if ('webkitTransition' in track.style) {
                        track.style.webkitTransition = 'none';
                    }
                    track.style.transform = 'translateX(-' + (itemWidth * itemCount) + 'px)';
                    if ('webkitTransform' in track.style) {
                        track.style.webkitTransform = 'translateX(-' + (itemWidth * itemCount) + 'px)';
                    }
                    
                    setTimeout(function() {
                        track.style.transition = 'transform 0.5s ease';
                        if ('webkitTransition' in track.style) {
                            track.style.webkitTransition = '-webkit-transform 0.5s ease';
                        }
                        currentPos = 0;
                        track.style.transform = 'translateX(0)';
                        if ('webkitTransform' in track.style) {
                            track.style.webkitTransform = 'translateX(0)';
                        }
                        isTransitioning = false;
                    }, 50);
                } else {
                    track.style.transform = 'translateX(' + currentPos + 'px)';
                    if ('webkitTransform' in track.style) {
                        track.style.webkitTransform = 'translateX(' + currentPos + 'px)';
                    }
                    setTimeout(function() { isTransitioning = false; }, 500);
                }
            } else {
                currentPos += itemWidth * step;
                if (currentPos > 0) {
                    track.style.transition = 'none';
                    if ('webkitTransition' in track.style) {
                        track.style.webkitTransition = 'none';
                    }
                    currentPos = -itemWidth * (itemCount - getVisibleCount());
                    track.style.transform = 'translateX(' + currentPos + 'px)';
                    if ('webkitTransform' in track.style) {
                        track.style.webkitTransform = 'translateX(' + currentPos + 'px)';
                    }
                    
                    setTimeout(function() {
                        track.style.transition = 'transform 0.5s ease';
                        if ('webkitTransition' in track.style) {
                            track.style.webkitTransition = '-webkit-transform 0.5s ease';
                        }
                        currentPos += itemWidth * step;
                        track.style.transform = 'translateX(' + currentPos + 'px)';
                        if ('webkitTransform' in track.style) {
                            track.style.webkitTransform = 'translateX(' + currentPos + 'px)';
                        }
                        setTimeout(function() { isTransitioning = false; }, 500);
                    }, 50);
                } else {
                    track.style.transform = 'translateX(' + currentPos + 'px)';
                    if ('webkitTransform' in track.style) {
                        track.style.webkitTransform = 'translateX(' + currentPos + 'px)';
                    }
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

        function initCloneItems() {
            if (itemCount <= getVisibleCount()) return;
            currentPos = 0;
            track.style.transform = 'translateX(0)';
            if ('webkitTransform' in track.style) {
                track.style.webkitTransform = 'translateX(0)';
            }
        }

        initCloneItems();
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
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
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
        });
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
        document.querySelectorAll('a, button, .touch-feedback').forEach(function(el) {
            el.addEventListener('touchstart', function() {}, { passive: true });
        });
    }

    // 执行所有初始化函数
    function init() {
        initMobileMenu();
        initLazyLoading();
        initCarousel();
        initQrCode();
        initPartnerCarousel();
        initSmoothScroll();
        initLucide();
        fixIOSTouch();
    }

    // 根据文档加载状态执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
