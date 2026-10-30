import Planet from './baseClassPlanet';
import * as THREE from 'three';

jest.mock('three');

describe('Planet (baseClassPlanet)', () => {
  // The auto-mocked loader returns undefined; a real one returns a texture
  beforeEach(() => {
    THREE.TextureLoader.prototype.load.mockImplementation(() => ({}));
  });

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

    test('tags the colour map sRGB and leaves the normal map linear', () => {
      const planet = new Planet('texture.jpg', 'normal.jpg', { radius: 10, width: 32, height: 32 });
      planet.build();
      const params = THREE.MeshStandardMaterial.mock.calls.at(-1)[0];
      expect(params.map.colorSpace).toBe(THREE.SRGBColorSpace);
      expect(params.normalMap?.colorSpace).not.toBe(THREE.SRGBColorSpace);
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
