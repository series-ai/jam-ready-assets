import * as THREE from 'three'

/** A local opening in foreground structure keeps the game camera on its chosen side. */
export class ForegroundCutaway {
  private readonly focusView = { value: new THREE.Vector3() }
  private readonly radius = { value: new THREE.Vector2(1, 1) }
  private readonly active = { value: 0 }
  private readonly perspective = { value: 1 }
  private readonly floor = { value: 0 }
  private readonly depth = { value: 0 }
  private strength = 0
  private readonly secondaryFocus = { value: new THREE.Vector3() }
  private readonly secondaryRadius = { value: new THREE.Vector2(1, 1) }
  private readonly secondaryActive = { value: 0 }
  private readonly secondaryFloor = { value: 0 }
  private readonly secondaryDepth = { value: 0 }
  private readonly secondaryWorld = new THREE.Vector3()

  apply(root: THREE.Object3D): void {
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.LineSegments)) return
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        material.onBeforeCompile = (shader: Parameters<THREE.Material['onBeforeCompile']>[0]) => {
          shader.uniforms.cutFocus = this.focusView
          shader.uniforms.cutRadius = this.radius
          shader.uniforms.cutActive = this.active
          shader.uniforms.cutPerspective = this.perspective
          shader.uniforms.cutFloor = this.floor
          shader.uniforms.cutDepth = this.depth
          shader.uniforms.cutSecondaryFocus = this.secondaryFocus
          shader.uniforms.cutSecondaryRadius = this.secondaryRadius
          shader.uniforms.cutSecondaryActive = this.secondaryActive
          shader.uniforms.cutSecondaryFloor = this.secondaryFloor
          shader.uniforms.cutSecondaryDepth = this.secondaryDepth
          shader.vertexShader = 'varying vec3 cutView; varying float cutWorldY;\n' + shader.vertexShader
          shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
            #include <project_vertex>
            cutView = mvPosition.xyz;
            cutWorldY = (modelMatrix * vec4(transformed, 1.0)).y;
          `)
          shader.fragmentShader = `varying vec3 cutView; varying float cutWorldY;
            uniform vec3 cutFocus; uniform vec2 cutRadius;
            uniform float cutActive; uniform float cutPerspective; uniform float cutFloor; uniform float cutDepth;
            uniform vec3 cutSecondaryFocus; uniform vec2 cutSecondaryRadius;
            uniform float cutSecondaryActive; uniform float cutSecondaryFloor; uniform float cutSecondaryDepth;\n` + shader.fragmentShader
          shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', `
            #include <clipping_planes_fragment>
            if (cutActive > 0.01 && cutView.z > cutFocus.z - cutDepth && cutWorldY > cutFloor) {
              float scaleToFocus = mix(1.0, cutFocus.z / min(-0.001, cutView.z), cutPerspective);
              vec2 aperture = (cutView.xy * scaleToFocus - cutFocus.xy) / (cutRadius * cutActive);
              if (dot(aperture, aperture) < 1.0) discard;
            }
            if (cutSecondaryActive > 0.01 && cutSecondaryFocus.z < 0.0 && cutView.z > cutSecondaryFocus.z - cutSecondaryDepth && cutWorldY > cutSecondaryFloor) {
              float scaleToFocus = mix(1.0, cutSecondaryFocus.z / min(-0.001, cutView.z), cutPerspective);
              vec2 aperture = (cutView.xy * scaleToFocus - cutSecondaryFocus.xy) / (cutSecondaryRadius * cutSecondaryActive);
              if (dot(aperture, aperture) < 1.0) discard;
            }
          `)
        }
        material.customProgramCacheKey = () => 'inkline-foreground-cutaway-v2'
        material.needsUpdate = true
      }
    })
  }

  update(camera: THREE.Camera, focus: THREE.Vector3, height: number, delta: number): void {
    this.strength = THREE.MathUtils.damp(this.strength, 1, 24, delta)
    this.active.value = this.strength
    camera.updateMatrixWorld()
    this.focusView.value.copy(focus).applyMatrix4(camera.matrixWorldInverse)
    this.radius.value.set(height * .78, height * .72)
    this.depth.value = height * .55
    this.perspective.value = camera instanceof THREE.PerspectiveCamera ? 1 : 0
    this.floor.value = focus.y - height * .5 + .015
  }
  /** Keep a fixed envelope around one reacting target. It cannot change camera motion. */
  updateSecondary(camera: THREE.Camera, root: THREE.Vector3 | null, height: number, floorY: number, delta: number): void {
    this.secondaryActive.value = THREE.MathUtils.damp(this.secondaryActive.value, root ? 1 : 0, root ? 24 : 8, delta)
    if (root) {
      this.secondaryWorld.copy(root); this.secondaryWorld.y += height * .45
      this.secondaryRadius.value.set(height * 1.05, height * .65)
      this.secondaryDepth.value = height * 1.05
      this.secondaryFloor.value = floorY + .015
    }
    this.secondaryFocus.value.copy(this.secondaryWorld).applyMatrix4(camera.matrixWorldInverse)
  }
  reset(): void { this.strength = 0; this.active.value = 0; this.secondaryActive.value = 0 }
  get secondaryAmount(): number { return this.secondaryActive.value }
  get amount(): number { return this.strength }
}
