interface ISwiperOptions {
    slidesPerView: 'auto' | number;
    spaceBetween: number;
    transitionDuration?: number;
    loop?: boolean;
    autoplay?: boolean;
    autoplayDelay?: number;
}
class Swiper {
    container: HTMLElement;
    wrapper: HTMLElement | null;
    slides: HTMLElement[];
    currentIndex: number;
    isDragging: boolean;
    startTranslateX: number;
    maxOffset: number;
    options: ISwiperOptions;
    startX: number;
    endX: number;
    autoplayTimer: NodeJS.Timer | null;
    constructor(container: HTMLElement | null, options: ISwiperOptions = { slidesPerView: 1, spaceBetween: 0 }) {
        if (!container) { 
            throw new Error('container is error');
        }
        this.container = container;
        this.wrapper = container.querySelector('.swiper-wrapper');
        if (!this.wrapper) { 
            throw new Error('wrapper is error');
        }
        this.slides = Array.from(container.querySelectorAll('.swiper-slide'));
        this.currentIndex = 0;
        this.isDragging = false;
        this.startTranslateX = 0;
        this.maxOffset = 0;
        this.startX = 0;
        this.autoplayTimer = null;
        this.endX = 0;

        this.options = Object.assign({
            slidesPerView: 1,
            spaceBetween: 0,
            transitionDuration: 300,
            loop: false,
            autoplay: false,
            autoplayDelay: 3000,
        }, options);

        this.init();
    }

    init() {
        this.updateSlideStyles();
        this.attachEvents();
        this.setMaxOffset();
        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }

    /**
     * 更新容器flex样式、每个slide的样式
     */
    updateSlideStyles() {
        this.wrapper!.style.display = 'flex';
        if (this.options.slidesPerView === 'auto') {
            this.slides.forEach(slide => {
                slide.style.flex = '0 0 auto';
                slide.style.marginRight = `${this.options.spaceBetween}px`;
            });
        } else {
            const slideWidth = (100 / this.options.slidesPerView) - (this.options.spaceBetween / this.container?.clientWidth * 100);
            this.slides.forEach(slide => {
                slide.style.flex = `0 0 ${slideWidth}%`;
                slide.style.marginRight = `${this.options.spaceBetween}px`;
            });
        }
    }

    attachEvents() {
        this.container.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
        this.container.addEventListener('touchmove', (e) => this.onTouchMove(e), false);
        this.container.addEventListener('touchend', (e) => this.onTouchEnd(e), false);

        this.container.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        this.container.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        this.container.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
        this.container.addEventListener('mouseleave', (e) => this.onMouseLeave(e), false);

        window.addEventListener('resize', () => this.updateSlideStyles());
    }

    next() {
        if (this.currentIndex < this.slides.length - 1 || this.options.loop) {
            this.slideTo(this.currentIndex + 1);
        }
    }

    prev() {
        if (this.currentIndex > 0 || this.options.loop) {
            this.slideTo(this.currentIndex - 1);
        }
    }
    /**
     * 跳转到第几项
    */
    slideTo(index: number) {
        if (this.options.loop) {
            index = (index + this.slides.length) % this.slides.length;
        } else {
            index = Math.max(0, Math.min(index, this.slides.length - 1));
        }
        const offset = this.getOffset(index);
        this.wrapper!.style.transition = `transform ${this.options.transitionDuration}ms`;
        this.wrapper!.style.transform = `translateX(-${offset}px)`;
        this.currentIndex = index;
    }
    /**
     * 获取第几项的偏移距离
     * @param {*} index 
     * @returns 
     */
    getOffset(index: number) {
        return this.slides.slice(0, index).reduce((total, slide) => {
            return total + slide.offsetWidth + parseInt(slide.style.marginRight);
        }, 0);
    }

    onTouchStart(e: TouchEvent) {
        this.startX = e.touches[0].clientX;
        this.wrapper!.style.transition = 'none';
        this.currentSlideTransformX()
    }

    onTouchMove(e: TouchEvent) {
        const deltaX = e.touches[0].clientX - this.startX;
        this.updateTranslateX(deltaX);
    }

    onTouchEnd(e: TouchEvent) {
        this.endX = e.changedTouches[0].clientX;
        this.switchSlide();
    }

    onMouseDown(e: MouseEvent) {
        this.isDragging = true;
        this.startX = e.clientX;
        this.wrapper!.style.transition = 'none';
        this.currentSlideTransformX();
    }

    onMouseMove(e: MouseEvent) {
        if (!this.isDragging) return;
        const deltaX = e.clientX - this.startX;
        this.updateTranslateX(deltaX);

    }
    onMouseUp(e: MouseEvent) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.endX = e.clientX;
        this.switchSlide();
    }

    onMouseLeave(e: MouseEvent) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.endX = e.clientX;
        this.switchSlide();
    }

    /**
     * 获取当前slide的偏移
     */
    currentSlideTransformX() { 
        this.startTranslateX = this.getWrapperTranslateX();
    }
    /**
     * 触发滑动
     * @param {*} deltaX  X轴移动的距离
     */
    updateTranslateX(deltaX: number) {
        const offset = this.slides.slice(0, this.currentIndex).reduce((total, slide) => {
            return total + slide.offsetWidth + parseInt(slide.style.marginRight);
        }, 0);
        this.wrapper!.style.transform = `translateX(-${offset - deltaX}px)`;
        if (offset === 0) {
            this.wrapper!.style.transform = `translateX(${deltaX}px)`;
        }
    }
    /**
     * 获取wrapper的偏移
     * @returns 
     */
    getWrapperTranslateX() {
        if (this.wrapper!.style.transform.match(/-?\d+/g)) {
            return (this.wrapper!.style.transform.match(/-?\d+/g)![0] || 0) as number
        }
        return 0;
    }
    /**
     * 处理滑动切换
     * @returns 
     */
    switchSlide() {
        const threshold = this.container.clientWidth / 4;
        if (this.wrapper!.style.transform.match(/-?\d+/g)) {
            const newTranslateX = this.getWrapperTranslateX();
            const deltaX = this.endX - this.startX;
            console.log('newTranslateX', this.endX, this.startX,  newTranslateX, 'startTranslateX', this.startTranslateX, 'deltaX', deltaX)
            // 当前的移动距离为正时，不允许下一项操作
            if (newTranslateX > 0) {
                this.slideTo(this.currentIndex);
                return
            }
            // 判当前的移动距离超出最大移动距离，跳转到最后一项
            if (Math.abs(newTranslateX) > this.maxOffset) {
                this.slideTo(this.slides.length - 1);
                return
            }
            console.log('deltaX this.currentIndex', this.currentIndex, deltaX, threshold)
            if (Math.abs(deltaX) >= threshold) {
                if (Math.abs(newTranslateX) < Math.abs(this.startTranslateX)) {
                    this.prev();
                } else if (Math.abs(newTranslateX) > Math.abs(this.startTranslateX)) {
                    this.next();
                } else {
                    this.slideTo(this.currentIndex);
                }
            } else {
                this.slideTo(this.currentIndex);
            }
        } else {
            this.slideTo(this.currentIndex);
        }
    }
    startAutoplay() {
        this.autoplayTimer = setInterval(() => this.next(), this.options.autoplayDelay);
    }

    stopAutoplay() {
        this.autoplayTimer && clearInterval(this.autoplayTimer);
    }

    /**
     * 最大偏移
     */
    setMaxOffset() {
        this.maxOffset = this.getOffset(this.slides.length - 1);
    }
}

export default Swiper;
