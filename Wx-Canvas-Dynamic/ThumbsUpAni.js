/**
 *  随机两个数值之间
 * @param min
 * @param max
 */
function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1))
}

function ThumbsUpAni(canvasObj, contextObj) {
    this.imgsList = [];
    this.context = null;
    this.width = 0;
    this.height = 0;
    this.scanning = false;
    this.renderList=[];
    this.scaleTime = 0.1;// 百分比
    const canvas = canvasObj;
    this.canvas = canvas;
    this.context = contextObj;
    this.width = canvas.width;
    this.height = canvas.height;
    this.loadImages();


  
}

/**
 *  加载图片资源
 */
ThumbsUpAni.prototype.loadImages = function() {
    const images = [
        '../../asset/imgs/01.png',
        '../../asset/imgs/01.png',
        '../../asset/imgs/01.png',
        '../../asset/imgs/01.png',
    ];
    console.log('加载图片')
    const promiseAll = [];
    let img = null;
    let canvas = this.canvas;
    images.forEach((src) => {
        const p = new Promise(function (resolve) {
            console.log('src', src)
            img = canvas.createImage()
            img.src = src
            img.onload = ()=>{
                resolve(img)
            }
        });
        promiseAll.push(p);
    });
    console.log('加载图片')
    Promise.all(promiseAll).then((imgsList) => {
        console.log('加载图片', imgsList)
        this.imgsList = imgsList;
        console.log('imgsList', imgsList)
        if (this.imgsList.length == 0) {
            dLog('error', 'imgsList load all error');
            return;
        }
    })
}
ThumbsUpAni.prototype.createRender = function() {
    if (this.imgsList.length == 0) return null;
    const basicScale = [0.4, 0.8, 1.0][getRandom(0, 1)];

    const getScale = (diffTime) => {
        if (diffTime < this.scaleTime) {
            return +((diffTime/ this.scaleTime).toFixed(2)) * basicScale;
        } else {
            return basicScale;
        }
    };
    const context = this.context;
    // 随机读取一个图片来渲染
    const image = this.imgsList[getRandom(0, this.imgsList.length - 1)]
    const offset = 20;
    const basicX = this.width / 2 + getRandom(-offset, offset);
    const angle = getRandom(2, 10);
    let ratio = getRandom(10,30)*((getRandom(0, 1) ? 1 : -1));
    const getTranslateX = (diffTime) => {
        if (diffTime < this.scaleTime) {// 放大期间，不进行摇摆位移
            return basicX;
        } else {
            return basicX + ratio*Math.sin(angle*(diffTime - this.scaleTime));
        }
    };

    const getTranslateY = (diffTime) => {
        return image.height / 2 + (this.height - image.height / 2) * (1-diffTime);
    };

    const fadeOutStage = getRandom(14, 18) / 100;
    const getAlpha = (diffTime) => {
        let left = 1 - +diffTime;
        if (left > fadeOutStage) {
            return 1;
        } else {
            return 1 - +((fadeOutStage - left) / fadeOutStage).toFixed(2);
        }
    };

    return (diffTime) => {
        // 差值满了，即结束了 0 ---》 1
        if(diffTime>=1) return true;
        context.save();
        const scale = getScale(diffTime);
        // const rotate = getRotate();
        const translateX = getTranslateX(diffTime);
        const translateY = getTranslateY(diffTime);
        context.translate(translateX, translateY);
        context.scale(scale, scale);
        // context.rotate(rotate * Math.PI / 180);
        context.globalAlpha = getAlpha(diffTime);
        context.drawImage(
            image,
            -image.width / 2,
            -image.height / 2,
            image.width,
            image.height,
        );
        context.restore();
    };
}
ThumbsUpAni.prototype.scan = function() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = "rgba(255,255,255,0)";
    this.context.fillRect(0,0,200,400);
    let index = 0;
    let length = this.renderList.length;
    if (length > 0) {
        requestFrame(this.scan.bind(this))
        this.scanning = true;
    } else {
        this.scanning = false;
    }
    while (index < length) {
        const child = this.renderList[index];
        if (!child || !child.render || child.render.call(null, (Date.now() - child.timestamp) / child.duration)) {
            // 结束了，删除该动画
            this.renderList.splice(index, 1);
            length--;
        } else {
            // continue
            index++;
        }
    }
}
ThumbsUpAni.prototype.start = function() {
    const render = this.createRender();
    const duration = getRandom(1500, 3000);
    this.renderList.push({
        render,
        duration,
        timestamp: Date.now(),
    });
    if (!this.scanning) {
        this.scanning = true;
        requestFrame(this.scan.bind(this))
    }
    return this;
}


function requestFrame(cb) {
    return (
        function(callback) {
            setTimeout(callback, 1000 / 60);
        }
    )(cb);
}
export {
    ThumbsUpAni
}

