class  ScalePie{
    constructor() {
        this.arcData = []
        this.hasValueFunc =  false
        this.valueFunc = null
    }
    value(fn) {
        this.hasValueFunc = true;
        this.valueFunc = fn
        return this
    }
    getArcs(arr) {
        try {
            if (!Array.isArray(arr)) throw  'getArcs 参数为非数组'
            this.arcData = [...arr]
            this.arcData.sort((a, b) =>{
                if (this.hasValueFunc) return this.valueFunc(b) - this.valueFunc(a)
                return b - a
            })
            let totals  = this.arcData.reduce((total, num) => {
                if ( this.hasValueFunc) return total + this.valueFunc(num)
                return total + num
            },0)
            let result = []
            let resObj = {}
            let resValue = 0
            let lastAngle = 0
            let currentAngle = 0
            this.arcData.forEach((num)=>{
                resValue = num
                if ( this.hasValueFunc)  resValue = this.valueFunc(num)
                currentAngle = lastAngle + resValue / totals * Math.PI * 2
                resObj = {
                    data: num,
                    value: resValue,
                    startAngle: lastAngle,
                    endAngle: currentAngle
                }
                result.push(resObj)
                lastAngle = currentAngle
            })
            return  result
        } catch (e) {
            console.error(e)
        }
        return []
    }

}