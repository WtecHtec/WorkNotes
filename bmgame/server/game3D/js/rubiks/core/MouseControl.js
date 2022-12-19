class MouseControl extends Control {
	constructor(camera, scene, renderer, cube) {
			super(camera, scene, renderer, cube);

			this.mousedownHandle = this.mousedownHandle.bind(this);
			this.mouseupHandle = this.mouseupHandle.bind(this);
			this.mousemoveHandle = this.mousemoveHandle.bind(this);
			this.mouseoutHandle = this.mouseoutHandle.bind(this);

			this.init();
	}
	mousedownHandle(event) {
			event.preventDefault();
			this.operateStart(event.offsetX, event.offsetY);
	}

	mouseupHandle(event) {
			event.preventDefault();
			this.operateEnd();
	}

	mouseoutHandle(event) {
			event.preventDefault();
			this.operateEnd();
	}

	mousemoveHandle(event) {
			event.preventDefault();

			this.operateDrag(event.offsetX, event.offsetY, event.movementX, event.movementY);
	}

	init() {
			this.domElement.addEventListener("mousedown", this.mousedownHandle);
			this.domElement.addEventListener("mouseup", this.mouseupHandle);
			this.domElement.addEventListener("mousemove", this.mousemoveHandle);
			this.domElement.addEventListener("mouseout", this.mouseoutHandle);
	}
	dispose() {
			this.domElement.removeEventListener("mousedown", this.mousedownHandle);
			this.domElement.removeEventListener("mouseup", this.mouseupHandle);
			this.domElement.removeEventListener("mousemove", this.mousemoveHandle);
			this.domElement.removeEventListener("mouseout", this.mouseoutHandle);
	}
}