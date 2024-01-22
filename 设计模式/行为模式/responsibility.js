/**
 * 责任链模式
 * “当一个业务需要经历一系列业务对象去处理时，我们可以把这些业务对象串联起来成为一条业务责任链，”
 * 例如：财务审批。财务 （无权限，再到）-》经理 （无权限，再到）-》总监
 */

// 审批流程
class Approver {
	constructor(name) {
		this.name = name
		this.nextApprover = null
	}
	setNextApprover(nextApprover) {
		this.nextApprover = nextApprover
		return this.nextApprover
	}
	approve(acount) { console.log('审批金额') }
}

// 专员
class Staff extends Approver {
	constructor(name) {
		super()
		this.name = name
	}
	approve(acount) {
		if (acount < 1000) {
			console.log('专员审批金额通过', acount, this.name)
		} else {
			console.log('金额大，专员无法审批', this.name)
			this.nextApprover.approve(acount)
		}
	}
}

// 经理
class Manager extends Approver {
	constructor(name) {
		super()
		this.name = name
	}
	approve(acount) {
		if (acount < 10000) {
			console.log('经理审批金额通过', acount, this.name)
		} else {
			console.log('金额大，经理无法审批', this.name)
			this.nextApprover.approve(acount)
		}
	}
}

// 总监
class CEO extends Approver {
	constructor(name) {
		super()
		this.name = name
	}
	approve(acount) {
		if (acount < 100000) {
			console.log('CEO审批金额通过', acount, this.name)
		} else {
			console.log('公司倒闭了')
		}
	}
}

const staff = new Staff('李四')
staff.setNextApprover(new Manager('张三')).setNextApprover(new CEO('王五'))

staff.approve(15000)