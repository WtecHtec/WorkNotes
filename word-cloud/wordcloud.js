const DEFAULT_SETTING = {
  width: 750,
  height: 700,
  list: [],
  fontFamily: '"Trebuchet MS", "Heiti TC", "微軟正黑體", ' +
    '"Arial Unicode MS", "Droid Fallback Sans", sans-serif',
  fontWeight: 'normal',
  color: 'random-dark',
  minSize: 0, // 0 to disable
  weightFactor: 1,
  clearCanvas: true,
  backgroundColor: '#fff',  // opaque white = rgba(255, 255, 255, 1)

  gridSize: 8,
  drawOutOfBound: false,
  origin: null,

  drawMask: false,
  maskColor: 'rgba(255,0,0,0.3)',
  maskGapWidth: 0.3,

  wait: 0,
  abortThreshold: 0, // disabled
  abort: function noop() { },

  minRotation: - Math.PI / 2,
  maxRotation: Math.PI / 2,
  rotationSteps: 0,

  shuffle: true,
  rotateRatio: 0.1,

  shape: 'circle',
  ellipticity: 0.65,
};

class WordCloud {

  constructor(canvas, options) {
    this.fcanvas = canvas
    this.fctx = canvas.getContext('2d')
    this.wordData = []
    this._initSettings(options)

  }
  _initSettings(options) {
    /* Default values to be overwritten by options object */
    this.settings = DEFAULT_SETTING
    this._initOptions(options)
    this._initWeightFactor()
    this._initShape()
    this.settings.gridSize = Math.max(Math.floor(this.settings.gridSize), 4);
    this.g = this.settings.gridSize;
    this.rotationRange = Math.abs(this.settings.maxRotation - this.settings.minRotation);
    this.rotationSteps = Math.abs(Math.floor(this.settings.rotationSteps));
    this.minRotation = Math.min(this.settings.maxRotation, this.settings.minRotation);
    this.grid = []
    this.ngx = Math.ceil(this.settings.width / this.g);
    this.ngy = Math.ceil(this.settings.height / this.g);
    this.center = (this.settings.origin) ?
      [this.settings.origin[0] / this.g, this.settings.origin[1] / this.g] :
      [this.ngx / 2, this.ngy / 2];
    this.maxRadius = Math.floor(Math.sqrt(this.ngx * this.ngx + this.ngy * this.ngy));

    this.escapeTime = null
    this.getTextColor = null
    this._initColor()
    this.getTextFontWeight = null;
    if (typeof this.settings.fontWeight === 'function') {
      this.getTextFontWeight = this.settings.fontWeight;
    }
    this.pointsAtRadius = [];
    this.minFontSize = 0
    this._initGrid()
  }
  _initOptions(options) {
    if (options) {
      for (var key in options) {
        if (key in this.settings) {
          this.settings[key] = options[key];
        }
      }
    }
  }
  _initWeightFactor() {
    if (typeof this.settings.weightFactor !== 'function') {
      let factor = this.settings.weightFactor;
      this.settings.weightFactor = function weightFactor(pt) {
        return pt * factor; //in px
      };
    }
  }
  _initShape() {
    if (typeof this.settings.shape !== 'function') {
      switch (this.settings.shape) {
        case 'circle':
        default:
          this.settings.shape = 'circle';
          break;

        case 'cardioid':
          this.settings.shape = function shapeCardioid(theta) {
            return 1 - Math.sin(theta);
          };
          break;

        case 'diamond':

          this.settings.shape = function shapeSquare(theta) {
            let thetaPrime = theta % (2 * Math.PI / 4);
            return 1 / (Math.cos(thetaPrime) + Math.sin(thetaPrime));
          };
          break;

        case 'square':
          this.settings.shape = function shapeSquare(theta) {
            return Math.min(
              1 / Math.abs(Math.cos(theta)),
              1 / Math.abs(Math.sin(theta))
            );
          };
          break;

        case 'triangle-forward':
          this.settings.shape = function shapeTriangle(theta) {
            let thetaPrime = theta % (2 * Math.PI / 3);
            return 1 / (Math.cos(thetaPrime) +
              Math.sqrt(3) * Math.sin(thetaPrime));
          };
          break;

        case 'triangle':
        case 'triangle-upright':
          this.settings.shape = function shapeTriangle(theta) {
            let thetaPrime = (theta + Math.PI * 3 / 2) % (2 * Math.PI / 3);
            return 1 / (Math.cos(thetaPrime) +
              Math.sqrt(3) * Math.sin(thetaPrime));
          };
          break;

        case 'pentagon':
          this.settings.shape = function shapePentagon(theta) {
            let thetaPrime = (theta + 0.955) % (2 * Math.PI / 5);
            return 1 / (Math.cos(thetaPrime) +
              0.726543 * Math.sin(thetaPrime));
          };
          break;

        case 'star':
          this.settings.shape = function shapeStar(theta) {
            let thetaPrime = (theta + 0.955) % (2 * Math.PI / 10);
            if ((theta + 0.955) % (2 * Math.PI / 5) - (2 * Math.PI / 10) >= 0) {
              return 1 / (Math.cos((2 * Math.PI / 10) - thetaPrime) +
                3.07768 * Math.sin((2 * Math.PI / 10) - thetaPrime));
            } else {
              return 1 / (Math.cos(thetaPrime) +
                3.07768 * Math.sin(thetaPrime));
            }
          };
          break;
      }
    }
  }
  _initColor() {
    switch (this.settings.color) {
      case 'random-dark':
        this.getTextColor = function getRandomDarkColor() {
          return this.random_hsl_color(10, 50);
        };
        break;

      case 'random-light':
        this.getTextColor = function getRandomLightColor() {
          return this.random_hsl_color(50, 90);
        };
        break;

      default:
        if (typeof this.settings.color === 'function') {
          this.getTextColor = settings.color;
        }
        break;
    }
  }
  _initGrid() {
    this.grid = [];
    let gx, gy;
    gx = this.ngx;
    while (gx--) {
      this.grid[gx] = [];
      gy = this.ngy;
      while (gy--) {
        this.grid[gx][gy] = true;
      }
    }
  }
  random_hsl_color(min, max) {
    return 'hsl(' +
      (Math.random() * 360).toFixed() + ',' +
      (Math.random() * 30 + 70).toFixed() + '%,' +
      (Math.random() * (max - min) + min).toFixed() + '%)';
  }
  getPointsAtRadius(pointsAtRadius, radius, center, settings) {
    if (pointsAtRadius[radius]) {
      return pointsAtRadius[radius];
    }
    let T = radius * 8;
    let t = T;
    let points = [];
    if (radius === 0) {
      points.push([center[0], center[1], 0]);
    }
    while (t--) {
      let rx = 1;
      if (settings.shape !== 'circle') {
        rx = settings.shape(t / T * 2 * Math.PI); // 0 to 1
      }
      points.push([
        center[0] + radius * rx * Math.cos(-t / T * 2 * Math.PI),
        center[1] + radius * rx * Math.sin(-t / T * 2 * Math.PI) *
        settings.ellipticity,
        t / T * 2 * Math.PI]);
    }
    pointsAtRadius[radius] = points;
    return points;
  };
  _exceedTime() {
    return ((this.settings.abortThreshold > 0) &&
      ((new Date()).getTime() - this.escapeTime > this.settings.abortThreshold));
  };
  _getRotateDeg() {
    if (this.settings.rotateRatio === 0) {
      return 0;
    }
    if (Math.random() > this.settings.rotateRatio) {
      return 0;
    }
    if (this.rotationRange === 0) {
      return this.minRotation;
    }
    if (this.rotationSteps > 0) {
      return minRotation +
        Math.floor(Math.random() * this.rotationSteps) *
        this.rotationRange / (this.rotationSteps - 1);
    }
    else {
      return this.minRotation + Math.random() * this.rotationRange;
    }
  };
  _canFitText(gx, gy, gw, gh, occupied) {
    let i = occupied.length;
    while (i--) {
      let px = gx + occupied[i][0];
      let py = gy + occupied[i][1];
      if (px >= this.ngx || py >= this.ngy || px < 0 || py < 0) {
        if (!this.settings.drawOutOfBound) {
          return false;
        }
        continue;
      }
      if (!this.grid[px][py]) {
        return false;
      }
    }
    return true;
  };
  _shuffleArray(arr) {
    for (var j, x, i = arr.length; i;
      j = Math.floor(Math.random() * i),
      x = arr[--i], arr[i] = arr[j],
      arr[j] = x) { }
    return arr;
  };

  _getTextInfo(word, weight, rotateDeg) {
    let fontSize = this.settings.weightFactor(weight);
    if (fontSize <= this.settings.minSize) {
      return false;
    }
    let mu = 1;
    if (fontSize < this.minFontSize) {
      mu = (function calculateScaleFactor() {
        var mu = 2;
        while (mu * fontSize < this.minFontSize) {
          mu += 2;
        }
        return mu;
      })();
    }
    let fontWeight;
    if (this.getTextFontWeight) {
      fontWeight = this.getTextFontWeight(word, weight, fontSize);
    } else {
      fontWeight = this.settings.fontWeight;
    }
    this.fctx.font = fontWeight + ' ' +
      (fontSize * mu).toString(10) + 'px ' + this.settings.fontFamily;
    let fw = this.fctx.measureText(word).width / mu;
    let fh = Math.max(fontSize * mu,
      this.fctx.measureText('m').width,
      this.fctx.measureText('\uFF37').width) / mu;
    let boxWidth = fw + fh * 2;
    let boxHeight = fh * 2;
    let fgw = Math.ceil(boxWidth / this.g);
    let fgh = Math.ceil(boxHeight / this.g);
    boxWidth = fgw * this.g;
    boxHeight = fgh * this.g;
    let fillTextOffsetX = - fw / 2;
    let fillTextOffsetY = - fh * 0.4;
    let cgh = Math.ceil((boxWidth * Math.abs(Math.sin(rotateDeg)) +
      boxHeight * Math.abs(Math.cos(rotateDeg))) / this.g);
    let cgw = Math.ceil((boxWidth * Math.abs(Math.cos(rotateDeg)) +
      boxHeight * Math.abs(Math.sin(rotateDeg))) / this.g);
    let width = cgw * this.g;
    let height = cgh * this.g;
    this.fcanvas.width = width
    this.fcanvas.height = height
    this.fctx.scale(1 / mu, 1 / mu);
    this.fctx.translate(width * mu / 2, height * mu / 2);
    this.fctx.rotate(- rotateDeg);
    this.fctx.font = fontWeight + ' ' +
      (fontSize * mu).toString(10) + 'px ' + this.settings.fontFamily;
    this.fctx.fillStyle = '#000';
    this.fctx.textBaseline = 'middle';
    this.fctx.fillText(word, fillTextOffsetX * mu,
      (fillTextOffsetY + fontSize * 0.5) * mu);
    //    获取文本像素
    let imageData = this.fctx.getImageData(0, 0, width, height).data;
    if (this._exceedTime()) {
      return false;
    }
    let occupied = [];
    let gx = cgw, gy, x, y;
    let bounds = [cgh / 2, cgw / 2, cgh / 2, cgw / 2];
    while (gx--) {
      gy = cgh;
      while (gy--) {
        y = this.g;
        singleGridLoop: {
          while (y--) {
            x = this.g;
            while (x--) {
              if (imageData[((gy * this.g + y) * width +
                (gx * this.g + x)) * 4 + 3]) {
                occupied.push([gx, gy]);

                if (gx < bounds[3]) {
                  bounds[3] = gx;
                }
                if (gx > bounds[1]) {
                  bounds[1] = gx;
                }
                if (gy < bounds[0]) {
                  bounds[0] = gy;
                }
                if (gy > bounds[2]) {
                  bounds[2] = gy;
                }
                break singleGridLoop;
              }
            }
          }

        }
      }
    }
    return {
      mu: mu,
      occupied: occupied,
      bounds: bounds,
      gw: cgw,
      gh: cgh,
      fillTextOffsetX: fillTextOffsetX,
      fillTextOffsetY: fillTextOffsetY,
      fillTextWidth: fw,
      fillTextHeight: fh,
      fontSize: fontSize
    };
  };
  _fillGridAt(x, y, drawMask, dimension, item) {
    if (x >= this.ngx || y >= this.ngy || x < 0 || y < 0) {
      return;
    }
    this.grid[x][y] = false;
  };
  _drawText(gx, gy, info, word, weight,
    distance, theta, rotateDeg, item) {
    let fontSize = info.fontSize;
    let color;
    if (this.getTextColor) {
      color = this.getTextColor(word, weight, fontSize, distance, theta);
    } else {
      color = this.settings.color;
    }
    let fontWeight;
    if (this.getTextFontWeight) {
      fontWeight = this.getTextFontWeight(word, weight, fontSize);
    } else {
      fontWeight = this.settings.fontWeight;
    }
    let dimension;
    let bounds = info.bounds;
    dimension = {
      x: (gx + bounds[3]) * this.g,
      y: (gy + bounds[0]) * this.g,
      w: (bounds[1] - bounds[3] + 1) * this.g,
      h: (bounds[2] - bounds[0] + 1) * this.g
    };
    let transformRule = '';
    transformRule = 'rotate(' + (- rotateDeg / Math.PI * 180) + 'deg) ';
    if (info.mu !== 1) {
      transformRule +=
        'translateX(-' + (info.fillTextWidth / 4) + 'px) ' +
        'scale(' + (1 / info.mu) + ')';
    }
    let styleRules = {
      'position': 'absolute',
      'display': 'block',
      'font': fontWeight + ' ' +
        (fontSize * info.mu) + 'rpx ' + this.settings.fontFamily,
      'fontSize': (fontSize * info.mu),
      'left': ((gx + info.gw / 2) * this.g + info.fillTextOffsetX),
      'top': ((gy + info.gh / 2) * this.g + info.fillTextOffsetY),
      'width': info.fillTextWidth,
      'height': info.fillTextHeight,
      'lineHeight': fontSize,
      'whiteSpace': 'nowrap',
      'transform': transformRule,
      'webkitTransform': transformRule,
      'msTransform': transformRule,
      'transformOrigin': '50% 40%',
    };
    if (color) {
      styleRules.color = color;
    } 
    if (Array.isArray(item)) {
      color = item[3] || color;
      styleRules.color = color;
    } else {
      color = item.color || color ;
      styleRules.color = color;
    }
    let result = { word, ...info, ...styleRules, target: item }
    this.wordData.push(result)
    return result
  };

  _putWord(item,) {
    let word, weight;
    if (Array.isArray(item)) {
      word = item[0];
      weight = item[1];
    } else {
      word = item.word;
      weight = item.weight;
    }
    let rotateDeg = this._getRotateDeg();
    let info = this._getTextInfo(word, weight, rotateDeg);
    if (!info) {
      return false;
    }
    if (this._exceedTime()) {
      return false;
    }
    if (!this.settings.drawOutOfBound) {
      let bounds = info.bounds;
      if ((bounds[1] - bounds[3] + 1) > this.ngx ||
        (bounds[2] - bounds[0] + 1) > this.ngy) {
        return false;
      }
    }
    let r = this.maxRadius + 1;
    let that = this
    let tryToPutWordAtPoint = function (gxy) {
      let gx = Math.floor(gxy[0] - info.gw / 2);
      let gy = Math.floor(gxy[1] - info.gh / 2);
      let gw = info.gw;
      let gh = info.gh;
      if (!that._canFitText(gx, gy, gw, gh, info.occupied)) {
        return false;
      }
      that._drawText(gx, gy, info, word, weight,
        (that.maxRadius - r), gxy[2], rotateDeg, item);
        that._updateGrid(gx, gy, gw, gh, info, item);
      return true;
    };
    while (r--) { 
      let points = this.getPointsAtRadius(this.pointsAtRadius, this.maxRadius - r, this.center, this.settings);
      if (this.settings.shuffle) {
        points = [].concat(points);
        this._shuffleArray(points);
      }
      let drawn = points.some(tryToPutWordAtPoint);

      if (drawn) {
        return true;
      }
    }
    return false;
  }


  _updateGrid(gx, gy, gw, gh, info, item) {
    let occupied = info.occupied;
    let drawMask = this.settings.drawMask;
    let dimension;
    let i = occupied.length;
    while (i--) {
      let px = gx + occupied[i][0];
      let py = gy + occupied[i][1];
      if (px >= this.ngx || py >= this.ngy || px < 0 || py < 0) {
        continue;
      }
      this._fillGridAt(px, py, drawMask, dimension, item);
    }
  };

  start() {
    let that = this
    this.settings.list.forEach(function(item) {
      that._putWord(item);
    })
    console.log(this.wordData)
    return this.wordData
  };
}

export default WordCloud