import AutoPlayPlugin from "./plugins/autoPlay";
import LoopPlugin from "./plugins/loopPlugin";

interface ISwiperOptions {
	slidesPerView: 'auto' | number;
	spaceBetween: number;
	transitionDuration: number;
}
type IPlugin = AutoPlayPlugin | LoopPlugin
class Swiper {
	container: HTMLElement;
	wrapper: HTMLElement | null;
	slides: HTMLElement[];
	currentIndex: number;
	isDragging: boolean;
	options: ISwiperOptions;
	startX: number;
	endX: number;
	currentOffset: number;
	autoplay: { start: () => void; stop: () => void; } | undefined;
	plugins: IPlugin[];
	isMove: boolean;
	constructor(container: HTMLElement | null,
		options: ISwiperOptions = { slidesPerView: 1, spaceBetween: 0, transitionDuration: 300 },
		plugins: any = []) {
		if (!container) {
			throw new Error('container not found');
		}
		this.container = container;
		this.wrapper = container.querySelector('.swiper-wrapper');
		if (!this.wrapper) {
			throw new Error('.swiper-wrapper not found');
		}
		this.slides = Array.from(container.querySelectorAll('.swiper-slide'));
		this.currentIndex = 0;
		this.isDragging = false;
		this.startX = 0;
		this.endX = 0;
		this.currentOffset = 0;
		this.options = Object.assign({
			slidesPerView: 1,
			spaceBetween: 0,
			transitionDuration: 300,
		}, options);
		this.isMove = false;
		this.plugins = plugins;
		this.init();
	}

	init() {
		this.use(this.plugins);
		this.updateSlideStyles();
		this.attachEvents();
	}

	use(plugins: any) {
    if (!Array.isArray(plugins)) {
      plugins = [plugins];
    }
    plugins.forEach((plugin: any) => {
      if (typeof plugin === 'function') {
        plugin(this);
      } else if (typeof plugin === 'object' && typeof plugin.install === 'function') {
        plugin.install(this);
      }
    });
    return this;
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
			const spaceBetween = (this.options.spaceBetween / this.container?.clientWidth * 100)
			const slideWidth = (100 - spaceBetween * (this.options.slidesPerView - 1)) / this.options.slidesPerView;
			this.slides.forEach(slide => {
				slide.style.flex = `0 0 ${slideWidth}%`;
				slide.style.marginRight = `${this.options.spaceBetween}px`;
			});
		}
	}

	attachEvents() {
		this.container.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
		this.container.addEventListener('touchmove', (e) => this.onTouchMove(e), false);
		this.container.addEventListener('touchend', () => this.onTouchEnd(), false);
		this.container.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
		this.container.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
		this.container.addEventListener('mouseup', () => this.onMouseUp(), false);
		this.container.addEventListener('mouseleave', () => this.onMouseLeave(), false);
		this.container.addEventListener('dragstart', (e) => e.preventDefault(), false);
		this.container.addEventListener('click', (e) => this.onClick(e), true);
		window.addEventListener('resize', () => this.updateSlideStyles());
	}

	onClick(e: MouseEvent) {
		if (this.isMove) {
			e.stopPropagation();
			e.preventDefault();
			this.isMove = false;
			return false;
		}
	}
	onTouchStart(e: TouchEvent) {
		this.startX = e.touches[0].clientX;
		this.wrapper!.style.transition = 'none';
	}

	onTouchMove(e: TouchEvent) {
		this.endX = e.touches[0].clientX;
		const deltaX = e.touches[0].clientX - this.startX;
		this.updateTranslateX(deltaX);
	}

	onTouchEnd() {
		this.switchSlide();
	}

	onMouseDown(e: MouseEvent) {
		this.isDragging = true;
		this.startX = e.clientX;
		this.wrapper!.style.transition = 'none';
	}

	onMouseMove(e: MouseEvent) {
		if (!this.isDragging) return;
		const deltaX = e.clientX - this.startX;
		this.endX = e.clientX;
		this.updateTranslateX(deltaX);

	}
	onMouseUp() {
		if (!this.isDragging) return;
		this.isDragging = false;
		this.switchSlide();
	}

	onMouseLeave() {
		if (!this.isDragging) return;
		this.isDragging = false;
		this.switchSlide();
	}

	next() {
		if (this.currentIndex < this.slides.length - 1) {
			this.slideTo(this.currentIndex + 1);
		} else {
			this.slideTo(this.slides.length - 1);
		}
	}

	prev() {
		if (this.currentIndex > 0) {
			this.slideTo(this.currentIndex - 1);
		} else {
			this.slideTo(0);
		}
	}
	/**
	 * 跳转到第几项
	*/
	slideTo(index: number) {
		if (this.container!.offsetWidth >= this.wrapper!.scrollWidth) {
			this.wrapper!.style.transition = `transform ${this.options.transitionDuration}ms`;
			this.wrapper!.style.transform = `translateX(0)`;
			return
		}
		index = Math.max(0, Math.min(index, this.slides.length - 1));
		let offset = this.getOffset(index);
		this.wrapper!.style.transition = `transform ${this.options.transitionDuration}ms`;
		this.wrapper!.style.transform = `translateX(${-offset}px)`;
		this.currentOffset = offset;
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

	/**
	 * 更新滑动效果
	 * @param {*} deltaX  X轴移动的距离
	 */
	updateTranslateX(deltaX: number) {
		this.isMove = !!deltaX;
		const offset = this.currentOffset;
		let newOffset = (offset - deltaX);
		const maxOffset = this.getMaxOffset();
		// 增加阻力
		if (newOffset <= 0) {
			newOffset = (newOffset / 3);
		} else if (newOffset > maxOffset) {
			newOffset = maxOffset + (newOffset - maxOffset) / 4;
		}
		this.wrapper!.style.transform = `translateX(${-newOffset}px)`;
	}
	/**
	 * 处理滑动切换
	 * @returns 
	 */
	switchSlide() {
		const threshold = this.container.clientWidth / 4;
		if (this.wrapper!.style.transform.match(/-?\d+/g) && this.endX > 0) {
			const deltaX = this.endX - this.startX;
			if (Math.abs(deltaX) >= threshold) {
				if (deltaX > 0) {
					this.prev();
				} else if (deltaX < 0) {
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
		// this.endX = 0;
	}
	// 获取最大偏移距离
	getMaxOffset() {
		return this.getOffset(this.slides.length - 1);
	}
	// 真实索引
	getRealIndex() {
		return this.currentIndex;
	}

}

export default Swiper;
