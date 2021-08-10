// index.js
// 获取应用实例
const app = getApp()
import { dateFromat } from './conmon'
Page({
  data: {
    weeks: ['一', '二', '三', '四', '五', '六', '日'],
    dateList: [],
    currentTime: new Date(),
    nowTime: new Date().getTime(),
    windowHeight: 600,
    topM: 35,
    startDate: '2021/08/01',
    endDate: '2021/08/01',
    startTime: '',
    endTime: '',
    scrollInto: '',
    includeDate: [],
    excludeDate: [],
    selectNums: 0,
    refreshering: false,
    isfinish: true,
  },
  // 事件处理函数
  bindPulling(event) {
    console.log('bindPulling===', event)
    let { currentTime, dateList } = this.data;
    let {result , current} =  this.loadDataList(3,currentTime)
    this.data.currentTime = current
    dateList = result.concat(dateList)
    console.log(dateList)
    this.setData({
      dateList
    }, ()=>{
      setTimeout(()=>{
        this.setData({
          refreshering: false
        })
      }, 1000/60)
       
    })


  },
  bindSelectDate(event){
    let { itemday } = event.currentTarget.dataset
    let { selectNums, startTime, endTime, isfinish } = this.data
    if (itemday.disabled || itemday.hidden) {
      return
    } else {
     
      if (selectNums === 0 ||  selectNums === 2) {
        selectNums = 1
        endTime = ''
        startTime = itemday.time
        isfinish = false
      } else if (selectNums === 1 ) {
        selectNums = 2
        if (itemday.time >= startTime) {
          endTime = itemday.time
        } else {
          endTime = startTime;
          startTime = itemday.time
        }  
        isfinish = true
      }
      this.data.selectNums = selectNums
      this.setData({
        startTime,
        endTime,
        isfinish,
      })
    }
  },
  onLoad() {
    let { topM, startDate, endDate } = this.data;
    let {result , current} =  this.loadDataList(3, new Date())
    // console.log('onLoad===', dateList, currentTime)
    
    wx.getSystemInfo({
      success: (result) => {
        console.log(result)
        this.setData({
          windowHeight: result.windowHeight - topM,
          startTime: new Date(startDate).getTime(),
          endTime: new Date(endDate).getTime(),
        })
      },
      fail: (res) => {},
    })
    this.data.currentTime = current
    this.setData({
      dateList: result,
    }, ()=>{
      this.setData({
        scrollInto: 'date_2021_08',
      })
    })
  // console.log(this.data.nowTime)
  },

  loadDataList(num, time) {
    if (time instanceof Date) {
      let dateList = []
      let timeItem = ''
      let year = ''
      let month = ''
      let days = []
      for(let i = 0; i < num; i++) {
        timeItem = new Date(time.getFullYear(), time.getMonth() - i , 1)
        year = timeItem.getFullYear()
        month = timeItem.getMonth() + 1
        days = this.getDaysByMonth(year, month)
        month = month > 9 ? month : '0' + month
        dateList.unshift({
          year,
          month,
          days,
        })
      }
      return {
        result: dateList,
        current:  new Date(time.getFullYear(), time.getMonth() - num , 1),
      }

    } else {
      throw new Error('time 不是 Date 类型')
    }
    
  },
  /**
   *  获取当前年，月天数
   *  
   */
  getDaysByMonth(year,month) {
    let { includeDate, excludeDate, nowTime } = this.data;
    if (!Array.isArray(includeDate)) includeDate = [];
    if (!Array.isArray(excludeDate)) excludeDate = [];
    if (!nowTime) nowTime = new Date().getTime()
    let days = []
    let dateM = new Date(year, month, 0);
    let dateW = new Date(year, month - 1, 1);
    let dayMs = dateM.getDate();
    let week = dateW.getDay();
    let cz = 6 - week - 1;
    dayMs = dayMs + cz
    let total = Math.ceil(dayMs/7) * 7;
    let time = ''
    let m = ''
    let item = {}
    let disabled = false
    if (excludeDate.length > 0) disabled = false
    if (includeDate.length > 0) disabled = true
    for (let i = 0 ; i < total; i++) {
      if (i <= cz) {
        time = new Date(year, month - 1,  -(cz - i) );
      } else {
        time = new Date(year, month - 1,  i - cz );
      }
      m = time.getMonth() + 1
      item = {
        formattdate: dateFromat(time) ,
        time: time.getTime(),
        day: time.getDay(),
        year: time.getFullYear(),
        month: m > 9 ? m : '0' + m,
        date: time.getDate(),
        hidden:  i <= cz || i > dayMs ,
        disabled: time.getTime() > nowTime || disabled,
      }
      if (excludeDate.length > 0 && excludeDate.indexOf(item.formattdate) !== -1) {
        item.disabled = true
      }
      if (includeDate.length > 0 && includeDate.indexOf(item.formattdate) !== -1 ) {
        item.disabled = false
      }
      days.push(item)
    }
    return days;
  }

})
