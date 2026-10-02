export function createFortunaStone(T) {
  const group = new T.Group(); group.name = 'fortuna-unknown-object';
  const geometry = new T.OctahedronGeometry(1.25);
  const material = new T.MeshStandardMaterial({ color: '#72ffe0', emissive: '#19bfa2', emissiveIntensity: 1.1, metalness: .65, roughness: .2, flatShading: true });
  const crystal = new T.Mesh(geometry, material); crystal.scale.set(.8, 1.8, .8); crystal.position.y = 3.5;
  const baseGeometry = new T.CylinderGeometry(1.8, 2.3, .5, 7);
  const baseMaterial = new T.MeshStandardMaterial({ color: '#383c40', metalness: .6, roughness: .4 });
  const base = new T.Mesh(baseGeometry, baseMaterial); base.position.y = .25;
  const light = new T.PointLight('#7affdb', 30, 22, 2); light.position.y = 4;
  group.add(base, crystal, light);
  return {
    group,
    update(time, reduced = false) { crystal.rotation.y = reduced ? 0 : time * .35; crystal.position.y = 3.5 + (reduced ? 0 : Math.sin(time * 1.3) * .18); },
    dispose() { group.removeFromParent(); geometry.dispose(); material.dispose(); baseGeometry.dispose(); baseMaterial.dispose(); }
  };
}
