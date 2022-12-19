let camera, scene, renderer;



function init() {
  /** 渲染器 */
  renderer = new THREE.WebGLRenderer();
  // renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor('#ffffff', 1.0);//设置背景颜色


  /** 摄像头 */
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 20000 );
  camera.position.set(200, 400, 600);//设置相机位置
  camera.lookAt( {x:0, y:0, z:0 } );//设置视野的中心坐标
  /*** 场景 */
  scene = new THREE.Scene();

    //点光源
  var pointLight = new THREE.PointLight( 0xffffff, 1, 2000 );
  pointLight.position.set(70, 112, 98);
    //环境光
   var ambientLight = new THREE.AmbientLight( 0x333333 );
   scene.add(pointLight);
   scene.add(ambientLight);


  const teapotGeometry = new THREE.TorusGeometry( 10, 1, 16, 100 );;
  const sphereGeometry = new THREE.SphereGeometry( 50, 130, 16 );
  const geometry = new THREE.BufferGeometry();

  const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  const torus = new THREE.Mesh( teapotGeometry, material );
  scene.add( torus );


  const speed = [];
  const intensity = [];
  const size = [];
  const positionAttribute = teapotGeometry.getAttribute( 'position' );
  const particleCount = positionAttribute.count;
  for ( let i = 0; i < particleCount; i ++ ) {
    speed.push( 20 + Math.random() * 50 );
    intensity.push( Math.random() * .15 );
    size.push( 30 + Math.random() * 230 );
  }

  geometry.setAttribute( 'position', positionAttribute );
  geometry.setAttribute( 'targetPosition', sphereGeometry.getAttribute( 'position' ) );
  geometry.setAttribute( 'particleSpeed', new THREE.Float32BufferAttribute( speed, 1 ) );
  geometry.setAttribute( 'particleIntensity', new THREE.Float32BufferAttribute( intensity, 1 ) );
  geometry.setAttribute( 'particleSize', new THREE.Float32BufferAttribute( size, 1 ) );


  const fireMap = new THREE.TextureLoader().load( './img/firetorch_1.jpg' );



  /** 控制器 */
  new THREE.OrbitControls( camera, renderer.domElement);

  document.body.appendChild( renderer.domElement );

}
/** 帧刷新 */
function animate() {
  requestAnimationFrame( animate );
  render();
}
/** 渲染 */
function render() {
  renderer.render( scene, camera );
}
window.onload = () => {
  init()
  animate()
}