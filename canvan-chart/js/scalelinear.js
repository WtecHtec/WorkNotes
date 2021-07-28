class MyScaleLinear {
    constructor() {
        this.domainVal = []
        this.rangeVal = []
    }
    domain(arr) {
        try {
            if (!Array.isArray(arr)) throw 'domain 参数不是一个数组!';
            if (arr.length !== 2)    throw 'domain 数组长度不为2';
            this.domainVal = [...arr];
        }
        catch (e) {
            console.error(e)
        }
        return this;
    }
    range(arr) {
        try {
            if (!Array.isArray(arr)) throw 'domain 参数不是一个数组!';
            if (arr.length !== 2)    throw 'domain 数组长度不为2';
            this.rangeVal = [...arr];
        }
        catch (e) {
            console.error(e)
        }
        return this.findRange.bind(this);
    }

    findRange(val){
        let  result = (val - this.domainVal[0]) / (this.domainVal[1] - this.domainVal[0]) *  (this.rangeVal[1] - this.rangeVal[0]) +  this.rangeVal[0];
        return result
    }

}