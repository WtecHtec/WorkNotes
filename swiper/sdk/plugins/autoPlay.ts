import Swiper from "..";

interface IAutoPlayPluginOptions {
	delay?: number
	disableOnInteraction: boolean
};
class AutoPlayPlugin {
	options: IAutoPlayPluginOptions
	timeout: number | null;
	swiper: Swiper | null;
	constructor(options: IAutoPlayPluginOptions = {
		delay: 3000,
		disableOnInteraction: false
	}) {
		this.options = {
			delay: options.delay || 3000,
			...options
		};
		this.timeout = null;
		this.swiper = null;
	}
	install(swiper: Swiper) {
		this.swiper = swiper;
		swiper.autoplay = {
      start: this.start.bind(this),
      stop: this.stop.bind(this)
    };
		// 用户交互时停止自动播放
		if (this.options.disableOnInteraction) {
			['mousedown', 'touchstart'].forEach(eventName => {
				swiper.container.addEventListener(eventName, () => {
					this.stop();
				});
			});
		}
	}
	start() {
		if (!this.swiper) return;
		this.stop();
		this.timeout = setTimeout(() => {
			if (this.swiper!.currentIndex < this.swiper!.slides.length - 1) {
				this.swiper!.currentIndex++;
			} else {
				this.swiper!.currentIndex = 0;
			}
			this.swiper!.slideTo(this.swiper!.currentIndex);
			this.start();
		}, this.options.delay);
	}
	stop() {
		if (this.timeout !== null) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	}

}

export default AutoPlayPlugin;