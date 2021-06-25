class  MyScaleOrdinal {
    constructor() {
        this.domainVal = []
        this.rangeVal = []
    }
    domain(arr) {
        try {
            if (!Array.isArray(arr)) throw 'domain 参数不是一个数组。'
            this.domainVal = [...arr]
        } catch (e) {
            console.error(e)
        }
        return this
    }
    range(arr) {
        try {
            if (!Array.isArray(arr)) throw 'range 参数不是一个数组。'
            this.rangeVal = [...arr]
        } catch (e) {
            console.error(e)
        }
        return this.findRange.bind(this);
    }
    findRange(val){
        let index = this.domainVal.findIndex((item) => item === val);
        let rlen = this.rangeVal.length
        if (rlen > index) return this.rangeVal[index]
        return this.rangeVal[index % rlen];
    }

}