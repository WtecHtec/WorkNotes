import Swiper from "..";

class LoopPlugin {
	swiper: Swiper | undefined
	orginalSlideSize: number
	delayTime: number
	beforeCount: number
	afterCount: number
	startOffset: number
	cloneGetOffset: ((index: number) => number) | undefined
	loop: boolean
	constructor(delayTime: number = 100) {
		this.orginalSlideSize = 0;
		this.delayTime = delayTime;
		this.beforeCount = 0;
		this.afterCount = 0;
		this.startOffset = 0;
		this.loop = false
	}
	install(swiper: Swiper) {
		this.swiper = swiper

		// 覆盖updateSlideStyles
		const originalUpdateSlideStyles = swiper.updateSlideStyles.bind(swiper);
		swiper.updateSlideStyles = () => {
			originalUpdateSlideStyles();
			setTimeout(() => {
				this.setupInfiniteLoop();
			}, this.delayTime)
		};

		// 覆盖原有的slideTo方法
		const originalSnapToSlide = swiper.slideTo.bind(swiper);
		swiper.slideTo = (index: number) => {
			originalSnapToSlide(index);
			this.loop && this.handleInfiniteLoop();
		};

		// 覆盖 updateTranslateX
		const originalUpdateTranslateX = swiper.updateTranslateX.bind(swiper);
		swiper.updateTranslateX = (deltaX: number) => {
			this.loop ? this.handleupdateTranslateX(deltaX) : originalUpdateTranslateX(deltaX);
		}

		// 覆盖 getRealIndex
		swiper.getRealIndex = () =>  this.handleGetRealIndex();

		this.cloneGetOffset = swiper.getOffset.bind(swiper);


	}

	handleupdateTranslateX(deltaX: number) {
		const offset = this.swiper?.currentOffset || 0;
		let newOffset = (offset - deltaX);
		this.swiper!.wrapper!.style.transform = `translateX(${-newOffset}px)`;
	}

	setupInfiniteLoop() {
		const { container, slides, wrapper } = this.swiper || { slides: [] };
		console.log('setupInfiniteLoop', container!.offsetWidth, wrapper!.offsetWidth)
		if  (container!.offsetWidth >= wrapper!.scrollWidth) {
			return
		}
		this.loop = true
		let slideSize = slides.length as number;
		this.orginalSlideSize = slideSize;
		this.cloneBeforeSlides();
		this.cloneAfterSlides();
		// 刷新 slides
		this.swiper!.slides = Array.from(this.swiper!.container!.querySelectorAll('.swiper-slide'));
	}

	/**
	 * 1、动态计算 克隆首部 填充元素
	 * 2、设置当前偏移、当前索引
	 */
	cloneBeforeSlides() {
		const { container, slides, wrapper, options } = this.swiper || { currentIndex: 0, slides: [] };
		const len = slides.length;
		// 首部克隆
		let startOffset = 0
		let befores = 0
		let lastEl = null
		for (let i = len - 1; i >= 0; i--) {
			if (startOffset > container!.offsetWidth) {
				break;
			}
			lastEl = lastEl || slides[0]
			befores = befores + 1;
			const slide = slides[i]
			const clone = slide.cloneNode(true) as HTMLElement;
			wrapper!.insertBefore(clone, lastEl);
			lastEl = clone;
			startOffset = startOffset + (slide!.offsetWidth || 0) + (options?.spaceBetween || 0)
		}
		lastEl = null
		this.beforeCount = befores;
		this.startOffset = startOffset;
		this.swiper!.currentOffset = startOffset;
		this.swiper!.currentIndex = this.beforeCount;
		wrapper!.style.transform = `translateX(${-startOffset}px)`;
	}

	/**
	 * 末尾克隆填充元素
	 */
	cloneAfterSlides() {
		const { container, slides, wrapper, options } = this.swiper || { currentIndex: 0, slides: [] };
		const len = slides.length;
		// 尾部克隆
		let endOffset = 0
		let after = 0
		let lastEl = null
		for (let i = 0; i < len; i++) {
			if (endOffset > container!.offsetWidth) {
				break;
			}
			lastEl = lastEl || slides[0]
			after = after + 1;
			const slide = slides[i]
			const clone = slide.cloneNode(true) as HTMLElement;
			endOffset = endOffset + (slide!.offsetWidth || 0) + (options?.spaceBetween || 0)
			wrapper!.appendChild(clone);
			lastEl = clone;
		}
		lastEl = null;
		this.afterCount = after;

	}

	handleInfiniteLoop() {
		const { currentIndex, options } = this.swiper || { currentIndex: 0 };
		const lastIndex = this.beforeCount + this.orginalSlideSize ;
		if (currentIndex >= lastIndex) {
			// 当滑动到末尾克隆项时,滑动到第一项
			this.resetTrnsformX(options!.transitionDuration, this.startOffset, this.beforeCount);
		} else if (currentIndex < this.beforeCount) {
			// 当滑动到首部克隆项时,滑动到最后一项
			const index = lastIndex - 1;
			if (this.cloneGetOffset) {
				this.resetTrnsformX(options!.transitionDuration, this.cloneGetOffset(index), index);
			}
		}
	}
	/**
	 * 静默移动到目标项位置，形成无限循环
	 * @param delay 
	 * @param offset 
	 * @param index 
	 */
	resetTrnsformX(delay: number, offset: number, index: number ) {
		this.swiper!.currentIndex = index;
		setTimeout(() => {
			this.swiper!.wrapper!.offsetHeight;
			this.swiper!.wrapper!.style.transition = `none`;
			this.swiper!.currentOffset = offset;
			this.swiper!.wrapper!.style.transform = `translateX(-${offset}px)`;
		}, delay || 300 );
	}
	handleGetRealIndex() {
		return this.swiper!.currentIndex - this.beforeCount
	}
}


export default LoopPlugin