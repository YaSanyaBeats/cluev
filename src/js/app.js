const isMobile = document.documentElement.clientWidth < 768;
const isTablet = document.documentElement.clientWidth < 1140;

/* Последовательно накладывает класс на элементы внутри контейнера. */
function staggeredClassAnimation(className, target, delay) {
    let timeouts = [];

    return function ($container, $resetScope) {
        timeouts.forEach(clearTimeout);
        timeouts = [];

        $resetScope.find(target).removeClass(className);
        $container.find(target).removeClass(className);

        $container.find(target).each(function (index) {
            const $element = $(this);
            const timeoutId = setTimeout(function () {
                $element.addClass(className);
            }, index * delay);

            timeouts.push(timeoutId);
        });
    };
}

function initSliders() {
    window.swipers = {};

    const defaultPaginationParams = (el) => {
        return {
            el: el,
            clickable: true,
            bulletClass: 'pagination__elem',
            bulletActiveClass: 'pagination__elem_active',
            modifierClass: 'pagination-',
            renderBullet: function (index, className) {
                return '<div class="' + className + '"></div>';
            }
        }
    };

    const animateHeroSlide = staggeredClassAnimation(
        'uk-animation-slide-bottom-small',
        '.hero__body > *',
        200
    );

    // TODO Refactor
    const HERO_IMAGE_DELAY = 5000;

    const heroSlideAutoplay = (function () {
        let slideTimerId = null;
        let swiperInstance = null;

        function isVideoElement(element) {
            return element instanceof HTMLVideoElement;
        }

        function clearSlideTimer() {
            if (slideTimerId !== null) {
                clearTimeout(slideTimerId);
                slideTimerId = null;
            }
        }

        function pauseAllVideos() {
            clearSlideTimer();
            $('.hero__slider .hero__video').each(function () {
                if (isVideoElement(this)) {
                    this.pause();
                    $(this).off('.heroAutoplay');
                }
            });
        }

        function scheduleImageSlide() {
            clearSlideTimer();
            slideTimerId = setTimeout(function () {
                if (swiperInstance) {
                    swiperInstance.slideNext();
                }
            }, HERO_IMAGE_DELAY);
        }

        function startForActiveSlide() {
            if (!swiperInstance) {
                return;
            }

            clearSlideTimer();
            pauseAllVideos();

            const $activeSlide = $(swiperInstance.slides[swiperInstance.activeIndex]);
            const $video = $activeSlide.find('.hero__video');

            if ($video.length) {
                const video = $video[0];
                
                if(isVideoElement(video)){
                    video.loop = false;
                    video.currentTime = 0;

                    $video.off('.heroAutoplay').on('ended.heroAutoplay', function () {
                        swiperInstance.slideNext();
                    });

                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(scheduleImageSlide);
                    }
                    return;
                }
            }

            scheduleImageSlide();
        }

        return {
            bind: function (swiper) {
                swiperInstance = swiper;
            },
            start: startForActiveSlide,
            pauseVideos: pauseAllVideos,
        };
    })();

    window.swipers.hero = new Swiper('.hero__slider', {
        loop: true,
        pagination: defaultPaginationParams(".hero__pagination"),
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        on: {
            init: function () {
                heroSlideAutoplay.bind(this);
                animateHeroSlide($(this.slides[this.activeIndex]), $(this.el));
                heroSlideAutoplay.start();
            },
            slideChangeTransitionStart: function () {
                heroSlideAutoplay.pauseVideos();
                animateHeroSlide($(this.slides[this.activeIndex]), $(this.el));
            },
            slideChangeTransitionEnd: function () {
                heroSlideAutoplay.start();
            },
            slideResetTransitionStart: function () {
                heroSlideAutoplay.pauseVideos();
                animateHeroSlide($(this.slides[this.activeIndex]), $(this.el));
            },
            slideResetTransitionEnd: function () {
                heroSlideAutoplay.start();
            },
        },
    });

    window.swipers.productSlider = new Swiper('.product-slider__slider', {
        slidesPerView: 'auto'
    })

    window.swipers.productCardGallery = [];
    // TODO Refactor
    document.querySelectorAll('.product-card__gallery').forEach(function (galleryEl) {
        const swiper = new Swiper(galleryEl, {
            slidesPerView: 1,
            allowTouchMove: false,
            speed: 300,
            effect: 'fade',
            pagination: {
                el: galleryEl.querySelector('.product-card__gallery-pagination'),
                clickable: true,
                bulletClass: 'product-card__gallery-pagination-elem',
                bulletActiveClass: 'product-card__gallery-pagination-elem_active',
                modifierClass: 'product-card__gallery-pagination-',
                renderBullet: function (index, className) {
                    return '<div class="' + className + '"></div>';
                },
            },
        });

        window.swipers.productCardGallery.push(swiper);

        const $card = $(galleryEl).closest('.product-card');

        if (!$card.length || swiper.slides.length < 2) {
            return;
        }

        $card.on('mouseenter', function () {
            swiper.slideTo(1);
        });

        $card.on('mouseleave', function () {
            swiper.slideTo(0);
        });
    });

    window.swipers.collectionsSlider = new Swiper('.collections__slider', {
        slidesPerView: 'auto',
        speed: 500,
    })

    window.swipers.ambassadorSlider = new Swiper('.ambassador__slider', {
        slidesPerView: 2,
        spaceBetween: 36,
        direction: 'vertical',
        navigation: {
            prevEl: '.ambassador__nav_up',
            nextEl: '.ambassador__nav_down',
        },
    })

    window.swipers.catalogGridBigCardSlider = new Swiper('.catalog-grid__slider', {
        slidesPerView: 1,
        spaceBetween: 0,
        pagination: defaultPaginationParams('.catalog-grid__pagination'),
    })
}

function initUiKit() {
    UIkit.parallax($('.product-slider_animation-flow'), {
        y: '-148, 0',
        scale: '0.8, 1',
        end: '100% + 100'
    });

    UIkit.parallax($('.product-slider__slider'), {
        y: '-180, 0',
        easing: -2,
        end: '100% + 100'
    });

    UIkit.parallax($('.product-slider__item_bottom'), {
        y: '-152, 0',
        easing: -1,
        end: '100%'
    });

    // -- Collection Tabs --
    const $collectionHeroSlides = $('.collections__hero-slide');
    const $collectionHero = $('.collections__hero');
    const $collectionsSwitcherContent = $('.collections__switcher');
    const $collectionTabs = $('.collections__tabs');

    const collectionsSwitcher = UIkit.switcher($collectionTabs, {
        connect: '.collections__switcher',
        animation: 'uk-animation-fade',
        duration: '800'
    });

    UIkit.util.on('.collections__switcher', 'beforehide', function () {
        $collectionHero.addClass('collections__hero_switching');
        setTimeout(() => {
            $collectionHero.removeClass('collections__hero_switching');
            $collectionsSwitcherContent.removeClass('collections__switcher_hidden');
        }, 2500);

        const index = collectionsSwitcher.index();

        $collectionHeroSlides.removeClass('collections__hero-slide_active');
        $collectionHeroSlides.eq(index).addClass('collections__hero-slide_active');
        $collectionsSwitcherContent.addClass('collections__switcher_hidden');
    });

    // TODO Refactor
    const $collectionsSection = $('.collections');
    if ($collectionsSection.length) {
        let collectionsRevealDone = false;

        const revealCollections = function () {
            if (collectionsRevealDone) {
                return;
            }

            collectionsRevealDone = true;
            setTimeout(function () {
                $collectionHero.removeClass('collections__hero_switching');
                $collectionsSwitcherContent.removeClass('collections__switcher_hidden');
            }, 2000);
        };

        const collectionsObserver = new IntersectionObserver(function (entries) {
            $.each(entries, function (_, entry) {
                if (entry.isIntersecting) {
                    collectionsObserver.disconnect();
                    revealCollections();
                }
            });
        }, { threshold: 0.1 });

        collectionsObserver.observe($collectionsSection[0]);
    }
    // -- End Collection Tabs --

    UIkit.switcher($('.services__tabs'), {
        connect: '.services__media, .services__info',
        animation: 'uk-animation-fade',
        duration: '300'
    });

    UIkit.offcanvas($('#modal-filter'), {
        overlay: true,
        flip: true
    });

    UIkit.sticky($('.catalog__filter-btn'), {
        position: 'bottom',
        start: '100vh + 60px',
        end: true,
        animation: 'uk-animation-slide-bottom'
    });

    // UIkit.util.on('.catalog__filter-btn', 'active', function () {
    //     setTimeout(() => {
    //         $('.catalog__filter-btn').addClass('catalog__filter-btn_active');
    //     }, 300);
    // })

    // UIkit.util.on('.catalog__filter-btn', 'inactive', function () {
    //     setTimeout(() => {
    //         $('.catalog__filter-btn').removeClass('catalog__filter-btn_active');
    //     }, 2000)
    // })

}

function initSmoothScroll() {
    new Lenis({
        allowNestedScroll: true,
        autoRaf: true,
        anchors: true,
        autoResize: true,
        autoToggle: true,
        naiveDimensions: true,
        stopInertiaOnNavigate: true,
        lerp: 0.1,
    });
}

function initModalMenu() {
    UIkit.offcanvas($('#modal-menu'), {
        overlay: true
    });
    const $links = $('.modal-menu__nav-list a');
    const $layouts = $('.modal-menu__expand-layout');
    const $menu = $('.modal-menu');

    UIkit.util.on('#modal-menu', 'beforehide', function () {
        $menu.removeClass('modal-menu_expand');
    });

    $links.on('click', function (event) {
        const index = $links.index(this);
        const $layout = $layouts.eq(index);

        if (!$layout.length) {
            return;
        }

        event.preventDefault();
        console.log(index);
        $links.removeClass('active');
        $(this).addClass('active');
        $layouts.removeClass('modal-menu__expand-layout_active');
        $layout.addClass('modal-menu__expand-layout_active');
        $menu.addClass('modal-menu_expand');
    })
}

function initLookbookDebug() {
    const $lookbook = $('.lookbook_debug');

    if (!$lookbook.length) {
        return;
    }

    const $tooltip = $('<div class="lookbook__tooltip"></div>').appendTo('body');

    const offsetX = 0;
    const offsetY = 0;

    function getLookbookCoords(col, event) {
        const rect = col.getBoundingClientRect();
        const x = (((event.clientX - rect.left - offsetX) / rect.width) * 100).toFixed(2);
        const y = (((event.clientY - rect.top - offsetY) / rect.height) * 100).toFixed(2);

        return `${x}%, ${y}%`;
    }

    let copiedTimeoutId = null;
    let isCopiedShown = false;

    $lookbook.find('.lookbook__col').on('mousemove', function (event) {
        if (!isCopiedShown) {
            $tooltip.text(getLookbookCoords(this, event));
        }

        $tooltip.css({
            left: event.clientX + 12,
            top: event.clientY + 12,
        }).addClass('lookbook__tooltip_visible');
    });

    $lookbook.find('.lookbook__col').on('click', function (event) {
        event.preventDefault();

        const coords = getLookbookCoords(this, event);

        navigator.clipboard.writeText(coords);

        clearTimeout(copiedTimeoutId);
        isCopiedShown = true;

        $tooltip.text('Скопировано!').css({
            left: event.clientX + 12,
            top: event.clientY + 12,
        }).addClass('lookbook__tooltip_visible');

        copiedTimeoutId = setTimeout(function () {
            isCopiedShown = false;
        }, 1000);
    });

    $lookbook.find('.lookbook__col').on('mouseleave', function () {
        clearTimeout(copiedTimeoutId);
        isCopiedShown = false;
        $tooltip.removeClass('lookbook__tooltip_visible');
    });
}


document.addEventListener('DOMContentLoaded', (event) => {
    initSliders();
    initUiKit();
    initSmoothScroll();
    initModalMenu();
    initLookbookDebug();
    initMap();
})


    
let map;
let currentMarkers = [];
async function initMap() {
    await ymaps3.ready;

    const {
        YMap,
        YMapDefaultSchemeLayer,
        YMapDefaultFeaturesLayer,
        YMapMarker
    } = ymaps3;

    window.YMapMarker = YMapMarker;

    map = new YMap(
        document.getElementById('map'),
        {
            location: {
                center: [37.6179, 55.7636],
                zoom: 14
            }
        }
    );

    map.addChild(new YMapDefaultSchemeLayer());
    map.addChild(new YMapDefaultFeaturesLayer());

    renderMarkers('butik');

    initLocations();

    initTabs();

    document.getElementById('map').classList.add('my-black-white-map');
}

function createMarker(item, type) {
    const coordinates = item.dataset.coordinates
        .split(',')
        .map(Number);

    const title =
        item.querySelector('.boutique__list-item-title')
            ?.textContent
            .trim() || '';

    const subtitle =
        item.querySelector('.boutique__list-item-town')
            ?.textContent
            .trim() || '';

    const markerElement = document.createElement('div');
    markerElement.className = 'map-marker';

    // ДИЛЕР
    if (type === 'diler') {
        markerElement.innerHTML = `
            <div class="dealer-pin"></div>
            <div class="map-card">
                <div class="map-card__title">
                    ${title}
                    <span class="map-card__rating">★ 4.8</span>
                </div>

                <div class="map-card__subtitle">
                    ${subtitle}
                </div>
            </div>
        `;
    } else {
        markerElement.innerHTML = `
            <div class="map-card">
                <div class="map-card__title">
                    ${title}
                    <span class="map-card__rating">★ 4.8</span>
                </div>

                <div class="map-card__subtitle">
                    ${subtitle}
                </div>
            </div>

            <div class="map-card__image">
                <img
                    class="map-marker__icon"
                    src="images/icons/logo-key.svg"
                    alt=""
                >
            </div>
        `;
    }

    return new YMapMarker(
        { coordinates },
        markerElement
    );
}

function renderMarkers(tabId) {

    currentMarkers.forEach(marker => {
        map.removeChild(marker);
    });

    currentMarkers = [];

    const items = document.querySelectorAll(
        `#${tabId} .boutique__list-item`
    );

    items.forEach(item => {

        const marker = createMarker(item, tabId);

        map.addChild(marker);

        currentMarkers.push(marker);
    });

    const firstItem = items[0];

    if (firstItem) {

        const coordinates =
            firstItem.dataset.coordinates
                .split(',')
                .map(Number);

        map.update({
            location: {
                center: coordinates,
                zoom: 14,
                duration: 300
            }
        });
    }
}

function initTabs() {

    const tabs =
        document.querySelectorAll('.boutique__tabs-tab');

    const contents =
        document.querySelectorAll('.boutique__list-content');

    tabs.forEach(tab => {

        tab.addEventListener('click', () => {

            if (tab.classList.contains('active')) {
                return;
            }

            tabs.forEach(item => {
                item.classList.remove('active');
            });

            tab.classList.add('active');

            const target = tab.dataset.tab;

            contents.forEach(content => {

                content.classList.toggle(
                    'active',
                    content.id === target
                );
            });

            renderMarkers(target);
        });

    });
}

function initLocations() {

    document.addEventListener('click', (e) => {

        const item = e.target.closest('.boutique__list-item');

        if (!item) return;

        const content = item.closest('.boutique__list-content');

        content
            .querySelectorAll('.boutique__list-item')
            .forEach(el => {
                el.classList.remove('active');
            });

        item.classList.add('active');

        const coordinates = item.dataset.coordinates
            .split(',')
            .map(Number);

        map.update({
            location: {
                center: coordinates,
                zoom: 16,
                duration: 500
            }
        });
    });
}