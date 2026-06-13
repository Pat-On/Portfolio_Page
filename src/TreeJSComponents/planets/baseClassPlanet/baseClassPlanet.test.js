import Planet from './baseClassPlanet';
import * as THREE from 'three';

jest.mock('three');

describe('Planet (baseClassPlanet)', () => {
  describe('build()', () => {
    test('returns a THREE.Mesh instance', () => {
      const planet = new Planet('texture.jpg', 'normal.jpg', { radius: 10, width: 32, height: 32 });
      const mesh = planet.build();
      expect(mesh).toBeInstanceOf(THREE.Mesh);
    });

    test('constructs Mesh with a SphereGeometry using the given sphereParams', () => {
      const planet = new Planet('texture.jpg', 'normal.jpg', { radius: 5, width: 16, height: 16 });
      planet.build();
      expect(THREE.SphereGeometry).toHaveBeenCalledWith(5, 16, 16);
    });

    test('uses MeshStandardMaterial when texture is provided', () => {
      const planet = new Planet('texture.jpg', 'normal.jpg', { radius: 10, width: 32, height: 32 });
      planet.build();
      expect(THREE.MeshStandardMaterial).toHaveBeenCalled();
    });

    test('uses MeshStandardMaterial with color fallback when no texture is provided', () => {
      const planet = new Planet(null, null, { radius: 10, width: 32, height: 32 }, 0xff0000);
      planet.build();
      expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith(
        expect.objectContaining({ color: 0xff0000 })
      );
    });

    test('uses default white color when no texture and no color provided', () => {
      const planet = new Planet(null, null, { radius: 10, width: 32, height: 32 });
      planet.build();
      expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith(
        expect.objectContaining({ color: 0xffffff })
      );
    });
  });
});
