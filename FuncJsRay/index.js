function runWebWork() {
  new WebWork().sendMessage({
    func: "hello",
    parmas: {}
  }, (res)=> {
    console.log(res)
  })
}