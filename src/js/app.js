const isMobile = document.documentElement.clientWidth < 768;
const isTablet = document.documentElement.clientWidth < 1140;

function preloadAnimationAssets(section) {
    const slides = section.querySelectorAll('.animation__slide');
    const slideImages = section.querySelectorAll('.animation__slide img');
    const urls = new Set();

    slides.forEach((slide) => {
        const backgroundUrl = slide.dataset.bg;
        if (backgroundUrl) {
            urls.add(backgroundUrl);
        }
    });

    slideImages.forEach((image) => {
        if (image.currentSrc || image.src) {
            urls.add(image.currentSrc || image.src);
        }
    });

    const preloadPromises = Array.from(urls).map((url) => new Promise((resolve) => {
        const image = new Image();

        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = url;
    }));

    return Promise.allSettled(preloadPromises);
}

function initAnimationSlider() {
    const section = document.querySelector('[data-animation]');
    if (!section || typeof Swiper === 'undefined') {
        return;
    }

    const sliderElement = section.querySelector('[data-animation-swiper]');
    if (!sliderElement) {
        return;
    }

    const backgroundLayers = section.querySelectorAll('[data-animation-bg-layer]');
    const subtitleElement = section.querySelector('[data-animation-subtitle]');
    const leftFeatureElement = section.querySelector('[data-animation-feature-left]');
    const rightFeatureElement = section.querySelector('[data-animation-feature-right]');
    const infoTitleElement = section.querySelector('[data-animation-info-title]');
    const infoTextElement = section.querySelector('[data-animation-info-text]');
    const paginationButtons = section.querySelectorAll('[data-animation-pagination-index]');

    let activeBgLayerIndex = 0;
    let bgTransitionToken = 0;

    const normBgPath = (src) => {
        if (!src) {
            return '';
        }

        try {
            const url = new URL(src, window.location.href);
            return url.pathname.replace(/^\//, '');
        } catch {
            return src.replace(/^(\.\/)+/, '').replace(/^\//, '');
        }
    };

    const pathsMatch = (a, b) => normBgPath(a) === normBgPath(b);

    const BG_BURST_MS = '0.34s';
    const BG_REVEAL_MS = '0.4s';
    const BG_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
    const BG_BLUR_PX = 8;
    const BG_SCALE_X = 0.94;
    const BG_TRANSITION_BURST = `filter ${BG_BURST_MS} ${BG_EASE}, transform ${BG_BURST_MS} ${BG_EASE}, opacity ${BG_BURST_MS} ${BG_EASE}`;
    const BG_TRANSITION_REVEAL = `filter ${BG_REVEAL_MS} ${BG_EASE}, transform ${BG_REVEAL_MS} ${BG_EASE}, opacity ${BG_REVEAL_MS} ${BG_EASE}`;

    const resetBgLayerInline = (layer) => {
        layer.style.transition = 'none';
        layer.style.filter = '';
        layer.style.transform = '';
        layer.style.opacity = '';
    };

    const updateBackground = (nextBg, animate) => {
        if (backgroundLayers.length < 2 || !nextBg) {
            return;
        }

        const currentLayer = backgroundLayers[activeBgLayerIndex];
        const incomingLayer = backgroundLayers[1 - activeBgLayerIndex];

        if (!animate || pathsMatch(currentLayer.getAttribute('src'), nextBg)) {
            backgroundLayers.forEach((layer) => {
                resetBgLayerInline(layer);
                layer.style.zIndex = '';
                layer.setAttribute('src', nextBg);
            });
            backgroundLayers[0].style.zIndex = '1';
            backgroundLayers[0].style.opacity = '1';
            backgroundLayers[1].style.zIndex = '0';
            backgroundLayers[1].style.opacity = '0';
            activeBgLayerIndex = 0;
            requestAnimationFrame(() => {
                backgroundLayers.forEach((layer) => {
                    layer.style.transition = '';
                });
            });
            return;
        }

        const token = ++bgTransitionToken;

        incomingLayer.style.zIndex = '0';
        currentLayer.style.zIndex = '1';

        resetBgLayerInline(incomingLayer);
        resetBgLayerInline(currentLayer);
        currentLayer.style.filter = 'blur(0)';
        currentLayer.style.transform = 'scaleX(1)';
        currentLayer.style.opacity = '1';
        incomingLayer.style.opacity = '0';
        currentLayer.style.transition = 'none';

        requestAnimationFrame(() => {
            if (token !== bgTransitionToken) {
                return;
            }

            currentLayer.style.transition = BG_TRANSITION_BURST;

            requestAnimationFrame(() => {
                if (token !== bgTransitionToken) {
                    return;
                }

                currentLayer.style.filter = `blur(${BG_BLUR_PX}px)`;
                currentLayer.style.transform = `scaleX(${BG_SCALE_X})`;
                currentLayer.style.opacity = '0';
            });
        });

        const onPhase1End = (event) => {
            if (event.propertyName !== 'filter' || token !== bgTransitionToken) {
                return;
            }

            currentLayer.removeEventListener('transitionend', onPhase1End);

            incomingLayer.setAttribute('src', nextBg);
            incomingLayer.style.transition = 'none';
            incomingLayer.style.filter = `blur(${BG_BLUR_PX}px)`;
            incomingLayer.style.transform = `scaleX(${BG_SCALE_X})`;
            incomingLayer.style.opacity = '0';
            incomingLayer.style.zIndex = '2';
            currentLayer.style.zIndex = '0';

            requestAnimationFrame(() => {
                if (token !== bgTransitionToken) {
                    return;
                }

                incomingLayer.style.transition = BG_TRANSITION_REVEAL;
                incomingLayer.style.filter = 'blur(0)';
                incomingLayer.style.transform = 'scaleX(1)';
                incomingLayer.style.opacity = '1';

                const onPhase2End = (ev) => {
                    if (ev.propertyName !== 'filter' || token !== bgTransitionToken) {
                        return;
                    }

                    incomingLayer.removeEventListener('transitionend', onPhase2End);

                    activeBgLayerIndex = 1 - activeBgLayerIndex;

                    resetBgLayerInline(currentLayer);
                    currentLayer.style.zIndex = '0';
                    currentLayer.style.opacity = '0';
                    currentLayer.setAttribute('src', nextBg);

                    resetBgLayerInline(incomingLayer);
                    incomingLayer.style.zIndex = '1';
                    incomingLayer.style.opacity = '1';

                    requestAnimationFrame(() => {
                        if (token !== bgTransitionToken) {
                            return;
                        }

                        incomingLayer.style.transition = '';
                        currentLayer.style.transition = '';
                    });
                };

                incomingLayer.addEventListener('transitionend', onPhase2End);
            });
        };

        currentLayer.addEventListener('transitionend', onPhase1End);
    };

    const setSectionContent = (activeSlide, options = {}) => {
        if (!activeSlide) {
            return;
        }

        const { animateBg = false } = options;

        const {
            bg,
            subtitle,
            featureLeft,
            featureRight,
            infoTitle,
            infoText
        } = activeSlide.dataset;

        updateBackground(bg, animateBg);

        if (subtitleElement && subtitle) {
            subtitleElement.textContent = subtitle;
        }

        if (leftFeatureElement && featureLeft) {
            leftFeatureElement.textContent = featureLeft;
        }

        if (rightFeatureElement && featureRight) {
            rightFeatureElement.textContent = featureRight;
        }

        if (infoTitleElement && infoTitle) {
            infoTitleElement.textContent = infoTitle;
        }

        if (infoTextElement && infoText) {
            infoTextElement.textContent = infoText;
        }
    };

    const updatePaginationState = (index) => {
        paginationButtons.forEach((button, buttonIndex) => {
            button.classList.toggle('is-active', buttonIndex === index);
        });
    };

    const firstSlide = sliderElement.querySelector('.animation__slide');
    if (firstSlide) {
        setSectionContent(firstSlide, { animateBg: false });
    }

    preloadAnimationAssets(section).then(() => {
        const animationSwiper = new Swiper(sliderElement, {
            direction: 'vertical',
            slidesPerView: 3,
            centeredSlides: true,
            spaceBetween: 12,
            loop: false,
            virtual: false,
            speed: 620,
            preventInteractionOnTransition: true,
            mousewheel: {
                enabled: true,
                eventsTarget: '[data-animation]',
                releaseOnEdges: true,
                forceToAxis: true,
                sensitivity: 0.9,
                thresholdDelta: 14,
                thresholdTime: 120
            }
        });

        let lastSlideIndex = animationSwiper.activeIndex;

        const syncCurrentSlide = (opts = {}) => {
            const { animateBg = false } = opts;
            const slide = animationSwiper.slides[animationSwiper.activeIndex];
            setSectionContent(slide, { animateBg });
            updatePaginationState(animationSwiper.activeIndex);
        };

        paginationButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const targetIndex = Number(button.dataset.animationPaginationIndex);

                if (!Number.isNaN(targetIndex)) {
                    animationSwiper.slideTo(targetIndex);
                }
            });
        });

        animationSwiper.on('slideChangeTransitionStart', () => {
            const active = animationSwiper.activeIndex;

            if (lastSlideIndex === active) {
                return;
            }

            lastSlideIndex = active;
            syncCurrentSlide({ animateBg: true });
        });
        syncCurrentSlide({ animateBg: false });
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    initAnimationSlider();
})