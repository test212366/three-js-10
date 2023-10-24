import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
 
import t0 from './1.jpg'
import t1 from './2.jpg'
import t2 from './3.jpg'
import maskURL from './mask.png'
const createInputEvents = require('simple-input-events');


import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'
import { CurtainShader } from './effect1'
import { RGBAShader } from './effect2'

export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0x000000, 1)
		this.renderer.useLegacyLights = true
		//this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 
 

		this.camera = new THREE.PerspectiveCamera( 60,
			 this.width / this.height,
			 1,
			 10000
		)
 
		this.camera.position.set(0, 0, 900) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0
		this.mouse = new THREE.Vector2()
		this.mouseTarget = new THREE.Vector2()

		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true
		this.initPost()
		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()

		// let canvas = document.createElement('canvas')
		// document.body.appendChild(canvas)
		// let ctx = canvas.getContext('2d')
		// canvas.width = 1920
		// canvas.height = 1080

		// let img = new Image()
		// let mask = new Image()
		// img.src = t0
 
		// img.onload = () => {
		// 	ctx.drawImage(img, 0,0)
		// 	let data = ctx.getImageData(0,0, 1920, 1080)
		// 	mask.scr = mask
		// 	mask.onload = () => {

		// 	}
		// }
		this.event = createInputEvents(this.renderer.domElement)
		this.events()
		this.settings()
	}
	initPost() {
		this.composer = new EffectComposer(this.renderer)

		const renderPass = new RenderPass(this.scene, this.camera)
		this.composer.addPass(renderPass)	
		
		this.effectPass = new ShaderPass(CurtainShader)
	 



		this.composer.addPass(this.effectPass)


		this.effectPass1 = new ShaderPass(RGBAShader)
		this.composer.addPass(this.effectPass1)
	}
	events() {
		this.event.on('move', ({uv}) => {
			this.mouse.x = uv[0] - 0.5
			this.mouse.y = uv[1] - 0.5
		})
	}


	settings() {
		let that = this
		this.settings = {
			progress: 0,
			progress1: 0,
			runAnimation: () => {
				this.runAnimation()
			},
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
		this.gui.add(this.settings, 'progress', 0, 1, 0.01).onChange(val => {
			this.effectPass.uniforms.uProgress.value = val
		}) 
		this.gui.add(this.settings, 'runAnimation')
	}
	runAnimation() {
		let tl = gsap.timeline()

		tl.to(this.camera.position, {
			x: 2500,
			duration: 1.5,
			ease: 'power4.inOut'
		})
		tl.to(this.camera.position, {
			z: 700,
			duration: 1,
			ease: 'power4.inOut'
		}, 0)
		tl.to(this.camera.position, {
			z: 900,
			duration: 1,
			ease: 'power4.inOut'
		}, 1)


		tl.to(this.effectPass.uniforms.uProgress, {
			value: 1,
			duration: 1,
			ease: 'power3.inOut'
		}, 0)


		tl.to(this.effectPass.uniforms.uProgress, {
			value: 0,
			duration: 1,
			ease: 'power3.inOut'
		}, 1)


		tl.to(this.effectPass1.uniforms.uProgress, {
			value: 1,
			duration: 1,
			ease: 'power3.inOut'
		}, 0)


		tl.to(this.effectPass1.uniforms.uProgress, {
			value: 0,
			duration: 1,
			ease: 'power3.inOut'
		}, 1)
	}
	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.composer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 853/1280
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) * this.imageAspect
		} 


		// this.material.uniforms.resolution.value.x = this.width
		// this.material.uniforms.resolution.value.y = this.height
		// this.material.uniforms.resolution.value.z = a1
		// this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		// this.material = new THREE.ShaderMaterial({
		// 	extensions: {
		// 		derivatives: '#extension GL_OES_standard_derivatives : enable'
		// 	},
		// 	side: THREE.DoubleSide,
		// 	uniforms: {
		// 		time: {value: 0},
		// 		resolution: {value: new THREE.Vector4()}
		// 	},
		// 	vertexShader,
		// 	fragmentShader
		// })
		
		this.textures = [t0, t1, t2]
		this.maskTexture = new THREE.TextureLoader().load(maskURL)
		this.textures = this.textures.map(t => new THREE.TextureLoader().load(t))

		// this.material = new THREE.MeshBasicMaterial({
		// 	map: this.textures[2]
		// })
		this.geometry = new THREE.PlaneGeometry(1920,1080,1,1)
		this.groups = []

		this.textures.forEach((t,index) => {
			
			let group = new THREE.Group()
			this.scene.add(group)
			this.groups.push(group)
			for(let i = 0; i < 6; i++) {
	
				let m = new THREE.MeshBasicMaterial({
					map: t
				})



				if(i>0) {
					m = new THREE.MeshBasicMaterial({
						map: t,
						alphaMap: this.maskTexture,
						transparent: true
					})
				}




				let mesh = new THREE.Mesh(this.geometry, m)
				
				
				mesh.position.z = (i+ 1) * 100
				
				group.add(mesh)
				group.position.x = index * 2500
			}
		}) 

 
		
	 
		// this.plane = new THREE.Mesh(this.geometry, this.material)
 
		// this.scene.add(this.plane)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.oscilator = Math.sin(this.time * 0.1) * 0.5 + 0.5
		this.mouseTarget.lerp(this.mouse, 0.1)

		this.groups.forEach(g => {
			g.rotation.x = -this.mouse.y * 0.3
			g.rotation.y = -this.mouse.x * 0.3

			g.children.forEach((m, i) => {
				m.position.z = (i + 1) * 100 - this.oscilator * 200
			})
		})

		// this.material.uniforms.time.value = this.time
 
		//this.renderer.setRenderTarget(this.renderTarget)
		//  this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
		this.composer.render()
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 