import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  sRGBEncoding,
  PMREMGenerator,
  UnsignedByteType
} from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

// renderer setup (replace or insert after renderer is created)
renderer.physicallyCorrectLights = true
renderer.outputEncoding = sRGBEncoding
renderer.toneMapping = ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap

// PMREM generator for better environment reflections
const pmremGenerator = new PMREMGenerator(renderer)
pmremGenerator.compileEquirectangularShader()

// optional: if you have an HDR env file, load it to improve metallic reflections
// new RGBELoader().setDataType(UnsignedByteType).load('/assets/env.hdr', (hdr) => {
//   const envMap = pmremGenerator.fromEquirectangular(hdr).texture
//   scene.environment = envMap
//   hdr.dispose()
//   pmremGenerator.dispose()
// })

// add soft ambient/hemi light to reduce very dark shadows
const ambient = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambient)
const hemi = new THREE.HemisphereLight(0xaaaaff, 0x444422, 0.25)
scene.add(hemi)

// directional light tweaks (adjust intensity to taste)
directionalLight.castShadow = true
directionalLight.intensity = 1.2
directionalLight.shadow.mapSize.set(2048, 2048)
directionalLight.shadow.bias = -0.0005
directionalLight.shadow.radius = 2

// after loading your GLTF model (inside loader callback)
gltf.scene.traverse((node) => {
  if (node.isMesh) {
    node.castShadow = true
    node.receiveShadow = true

    const mat = node.material
    if (mat && mat.isMeshStandardMaterial) {
      // strengthen metallic look and make env reflections more visible
      mat.metalness = Math.min((mat.metalness ?? 0) * 1.4 + 0.05, 1)
      mat.roughness = Math.max((mat.roughness ?? 1) * 0.8, 0.04)
      mat.envMapIntensity = Math.max(mat.envMapIntensity ?? 1, 1.2)
      mat.needsUpdate = true
    }
  }
})