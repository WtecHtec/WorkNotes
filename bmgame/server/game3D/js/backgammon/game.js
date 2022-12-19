class BMGame {
	constructor(socket, roomId) {
		const container = document.getElementById('game')
		this.socket = socket
		this.roomId = roomId

		this.shareUrl = null;

		if (this.socket) {
			this.initGame()
			this.watchWs()
		}

		this.renderer = this.createRender();
		this.camera = this.createCamera()
		this.scene = this.createScene(0xf0f0f0)

		this.pointer = new THREE.Vector2();
		// 判断事件是否在某个元素之内
		this.raycaster = new THREE.Raycaster();
		this.objects = []
		this.plane = null
		/** 判断是否在旋转视角 */
		this.optTime = 0;

		/** 初始化棋局 */
		this.piece = new Piece()
		/** 玩家信息 */
		this.player = null;

		this._currentCube = null
		/** 
		 * 状态
		 *  init: 初始化状态
		 *  wait: 等待
		 *  end:结束
		 *  running： 是否正在下棋
		 *  downing: 正在落棋
		 */
		this._state = 'init'

		this.createLight()
		this.setSize(container, this.camera, this.renderer)
		this.createMapBoard()
		container.appendChild(this.renderer.domElement);//把渲染器放置到页面中
		this.initEvent()
		new THREE.OrbitControls(this.camera, this.renderer.domElement )

		this.cubeGeo = new THREE.SphereGeometry( 25, 50, 50 );
		// this.redCubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.TextureLoader().load( './textures/square-outline.png' ) } );
		this.whiteCubeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		// this.blackCubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.TextureLoader().load( './textures/square-outline-textured.png' ) } );
		this.blackCubeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );

		this._torus = null;

		this.render()
		this.startAnimation()
	}
	/**
	 * 创建渲染器
	 * */
	createRender() {
		const renderer = new THREE.WebGLRenderer({antialias: true}); //抗锯齿开启
		return renderer
	}
	/**
	 * 创建摄像机
	 * */
	createCamera() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const camera = new THREE.PerspectiveCamera(
			45,
			width / height,
			0.1,
			10000
		);
		camera.position.set(300, 300, 300);
		camera.lookAt( 0, 0, 0 );
		return camera;
	}
	/**
	 * 创建场景
	 */
	createScene(bgColor){
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(bgColor);
		return scene;
	}
 
	/**
	 * 设置环境光
	 */
	createLight() {
		const ambientLight = new THREE.AmbientLight( 0x606060 );
		this.scene.add( ambientLight );
		const directionalLight = new THREE.DirectionalLight( 0xffffff );
		directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
		this.scene.add( directionalLight );
	}
	/**
	 * 设置场景大小
	 * @param {*} container 元素
	 * @param {*} camera 摄像机
	 * @param {*} renderer 渲染器
	 */
	setSize(container, camera, renderer) {
		// 设置相机的纵横比
		camera.aspect = container.clientWidth / container.clientHeight;
		camera.updateProjectionMatrix();
		// 设置渲染器宽度和高度
		renderer.setSize(container.clientWidth, container.clientHeight);

		// 设置设备像素比
		renderer.setPixelRatio(window.devicePixelRatio);
	};
  /**
	 * 渲染器加载 场景、摄像头
	 */
	render() {
		this.renderer.render(this.scene, this.camera);
	}
	/**
	 * 加载棋盘
	 */
	createMapBoard() {
		const gridHelper = new THREE.GridHelper( 1000, 20 );
		this.scene.add( gridHelper );

		const geometry = new THREE.PlaneGeometry( 1000, 1000 );
		// 移动位置在上方
		geometry.rotateX( - Math.PI / 2 );

		this.plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
		this.scene.add( this.plane );
		this.objects.push( this.plane );
	}

	initEvent() {
		document.addEventListener( 'pointermove', this.onPointerMove.bind(this) );
		document.addEventListener( 'pointerdown',  this.onPointerDown.bind(this) );
		document.addEventListener( 'pointerup',  this.onPointerUp.bind(this) );
	}
	/**
	 * 帧刷新
	 */
	startAnimation() {
		const animation = (time) => {
				time /= 1000; // convert to seconds
				if ( this._currentCube 
						&& ['downing' , 'running', 'beforend'].includes(this._state)) {
					this._currentCube.position.y -= 10;
					if(this._currentCube.position.y <= 25) {
						this._currentCube.position.y = 25
						this._currentCube = null
						if (this._state === 'beforend') {
							$('#status').html('游戏结束')
							this._state = 'end'
						} else {
							this._state = this._state === 'downing' ? 'wait' : 'running'
							$('#status').html(this._state === 'running' ? '落棋ing' : '等待对手落棋ing')
						}
					}
				}
				this.render();
				requestAnimationFrame(animation);
		};
	
		requestAnimationFrame(animation);
	}
	/**
	 * 鼠标移动
	 * @param {*} event 
	 */
	onPointerMove( event ) {
		this.pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
		this.raycaster.setFromCamera( this.pointer, this.camera );
		const intersects = this.raycaster.intersectObjects( this.objects, false );
		if ( intersects.length > 0 ) {
			if (!this.rollOverMesh) {
				this.createRollOverMesh()
			}
			const intersect = intersects[ 0 ];
			this.rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
			this.rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
		}
	}
	/**
	 * 鼠标按下事件
	 * @param {*} event
	 */
	onPointerDown(event) {
		this.optTime = new Date().getTime()
	}
	/**
	 * 鼠标弹起
	 * @param {} event 
	 */
	onPointerUp( event ) {
		const upTiem = new  Date().getTime();
		if (upTiem - this.optTime > 500 || this._state !== 'running') {
			return
		}
		this.pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

		this.raycaster.setFromCamera( this.pointer, this.camera );

		const intersects = this.raycaster.intersectObjects( this.objects, false );

		if ( intersects.length > 0 ) {
			const intersect = intersects[ 0 ];
			if ( intersect.object === this.plane) {
				const voxel = new THREE.Mesh( this.cubeGeo, this.player.pieceType === 'w' ? this.whiteCubeMaterial : this.blackCubeMaterial );
				voxel.position.copy( intersect.point ).add( intersect.face.normal );
				voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
				voxel.position.y = 200;
				const { x, z} = voxel.position;
				this._currentCube = voxel;
			  const st = this.piece.setPices(x, z, this.player.pieceType)
				if (st) {
					this._state = 'downing'
					this.scene.add( this._currentCube );
					this.socket.emit('battle', {
						roomId: this.roomId,
						position: {x, y: 200, z},
						player: this.player,
					});
				}
			}
		}
	}
	/**
	 * 创建影子方块
	 */
	createRollOverMesh() {
		const rollOverGeo = new THREE.SphereGeometry( 25, 50, 50 );
		const rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
		this.rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
		this.scene.add( this.rollOverMesh );
	}
	initGame() {
		this.socket.emit('game', this.roomId || '')
	}
	watchWs() {
		this.socket.on('msg', msg => {
			console.log(msg)
			const { type , data } = msg || {}
			if (type === 'system') {
				const { code , data: sysMsg } = data || {};
				// 初始化
				if (code === -1) {
					this.player = new Player(sysMsg.player);
					this.roomId = sysMsg.room
					this.shareUrl = sysMsg.share
					console.log('邀请好友参与游戏', this.shareUrl)
					$('#status').html('等待对手.....')
					$('#own').html(sysMsg.player)
					$('#share').html(this.shareUrl)
				} else if (code === 0) {
					// 游戏准备中
					this._state = 'wait'
					this.player = new Player(sysMsg.player);
					this.roomId = sysMsg.room
					$('#own').html(sysMsg.player)
					$('#status').html('对手已出现, 游戏准备中.....')
				} else if ( code === 1) {
					// 游戏开始
					const state = this.player.name === sysMsg.faster
					this._state =  state ? 'running' : 'wait'
					this.player.pieceType = sysMsg.players[this.player.name]
					$('#status').html(this._state === 'running' ? '落棋ing' : '等待对手落棋ing')
					this.piece.pieces = sysMsg.pieces
				} else if (code === 3) {
					this._state = 'beforend'
					if (sysMsg.winor) {
						alert( this.player.name === sysMsg.winor ? '你赢了' : '你输了')
					} else {
						alert('无棋可下,游戏结束...')
					}
				} else if(code === 404) {
					// 游戏异常
					this._state = 'end'
					alert('游戏异常')
				}
			} else if (type === 'battle') {
				const { data: sysMsg } = data || {};
					this.piece.pieces = sysMsg.pieces
					// 游戏对弈中
					const state = this.player.name !== sysMsg.current
					this._state =  state ? 'running' : 'wait'
					$('#status').html(this._state === 'running' ? '落棋ing' : '等待对手落棋ing')
					this._currentCube = new THREE.Mesh( this.cubeGeo, sysMsg.pieceType === 'w' ? this.whiteCubeMaterial : this.blackCubeMaterial );
					this._currentCube.position.copy( sysMsg.position )
					this.scene.add(this._currentCube)
			}
		})
	}
}