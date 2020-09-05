
var app = new Vue({
	el: '#App',
	data: {
		nickName: '',
		surejoin: false,
		toNickName:'',
		style : ["style1", "style2", "style3", "style4"],
		connectionStatus: false,
		socket:null,
		msgDatas:[],
		msg:''
	},
	mounted(){},
	beforeDestroy(){},
	methods: {
		getRandomArbitrary(min, max) {
		  return Math.floor(Math.random() * (max - min)) + min;
		},
		carregarMeteoro(){
		  numeroAleatorio = this.getRandomArbitrary(5000, 10000);
		  var meteoro = "<div class='meteoro "+ this.style[this.getRandomArbitrary(0, 4)] +"'></div>";
		  document.getElementsByClassName('chuvaMeteoro')[0].innerHTML = meteoro;
		  setTimeout(function(){
		    document.getElementsByClassName('chuvaMeteoro')[0].innerHTML = "";
		  }, 1000);
		},
		onInputNickName() {
			$('.nick-name-input').removeClass('wran-btn')
			setTimeout(() => {
				if (!this.nickName) {
					$('.nick-name-input').addClass('wran-btn')
				}
			}, 300)
			if (this.nickName) {
				this.socket = io('http://localhost:3200');
				if ( this.socket ) {
					this.socket.on('chat message', (msg)=>{
						console.log('chat message:' ,msg)
						if(msg.to === this.nickName) {
							let msgObj = {
								type: 'left',
								msg: msg.msg
							}
							this.msgDatas.push(msgObj)
						}
					});
					this.surejoin = true
				}
				
			} 
		},
		onAdd() {
			$('#addbtn').hide()
			$('#anAddbtn').css({'z-index':1})
			anime({
			  targets: '#anAddbtn',
			  rotate: 45,
			  scale:1,
			  left:250,
			  duration: 1000,
			  easing: 'easeInOutQuad',
			  complete: function(anim) {
			     $('#anAddbtn').hide()
			   }
			})
			anime({
			  targets: '.input-div',
			  width:300,
			  duration: 1000,
			  easing: 'easeInOutQuad',
			  complete: function(anim) {
			     $('#anAddbtn').hide()
			   }
			})
			
		},
		handleConnection(){
			$('.nick-name-input').removeClass('wran-btn')
			setTimeout(() => {
				if (!this.toNickName) {
					$('.nick-name-input').addClass('wran-btn')
				}
			}, 300)
			if (this.toNickName) {
				$('#toInputDiv').hide()
				$('.chat-room-title').show()
				this.carregarMeteoro()
				this.connectionStatus = true
			}
		},
		handleSendMsg(event){
			if (event) {
				event.preventDefault() // 阻止浏览器默认换行操作
			}
			 console.log('handleSendMsg')
			 if (!this.msg){ 
				 alert('信息不能为空') 
			     return 
			 } 
			  if(!this.toNickName) {
				  alert('对方名称不能为空') 
				  return
				  }
			 if(this.toNickName
			 && this.nickName && this.socket) {
			 	let msgObj = {
			 		"type":'right',
			 		"from": this.nickName,
			 		"to":this.toNickName,
			 		"msg": this.msg
			 	}
			 	this.msgDatas.push(msgObj)
			 	this.socket.emit('chat message', msgObj);
			 	this.msg = ''
				this.carregarMeteoro()
			 } else {
			 	alert('网络错误,请刷新页面,重新进入.')
			 }
			
			
		}
	}
})
