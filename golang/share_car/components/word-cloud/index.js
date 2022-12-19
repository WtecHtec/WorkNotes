// components/word-cloud/index.js
import WordCloud from './wordcloud'
const options = {
    "list": [],
    "gridSize": 16, // size of the grid in pixels
    "weightFactor": 8, // number to multiply for size of each word in the list
    "fontWeight": 'normal', // 'normal', 'bold' or a callback
    "fontFamily": 'Times, serif', // font to use
    "color": 'random-light', // 'random-dark' or 'random-light'
    "backgroundColor": '#333', // the color of canvas
    "rotateRatio": 0.2, // probability for the word to rotate. 1 means always 
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: {
      type: Number,
      value: 375
    },
    height: {
      type: Number,
      value: 450
    },
    bgColor: {
      type: String,
      value: '#333',
    },
    list: {
      type: Array,
      value: [],
    }
  },
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      const query = this.createSelectorQuery()
      query.select('#myCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          this.data.canvas = res[0].node
        })
    },
  },
  observers: {
    list(newVal)  {
      if(!newVal || !Array.isArray(newVal) || newVal.length === 0) return
      let { width, height, list,  wordData } = this.data
      list = newVal;
      if (!width || isNaN(Number(width))) {
        width = 375
      } 
      if (!height || isNaN(Number(height))) {
        height = 450
      }
      const dpr = wx.getSystemInfoSync().pixelRatio
      options.height = height * dpr
      options.width = width * dpr
      options.list = list
      setTimeout(()=>{
        if (this.data.canvas) {
          const wordCloud = new WordCloud(this.data.canvas, options)
          wordData = wordCloud.start()
          this.setData({
            wordData,
            width,
            height,
          })
        }
      }, 500)
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    wordData: [],
    canvas: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindWord(event) {
      const { detail }  = event.currentTarget.dataset
      this.triggerEvent('detail', detail);
    },
  }
})
