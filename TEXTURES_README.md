# Earth Textures Guide

The Scene currently uses **procedurally generated textures** that work immediately. For more realistic Earth visuals, you can add real NASA/Earth textures.

## Adding Real Earth Textures

### Option 1: Download from NASA Visible Earth

1. Visit: https://visibleearth.nasa.gov/
2. Search for "Blue Marble" or "Earth day map"
3. Download these images:
   - **Day Map**: Earth's daytime image
   - **Night Lights**: Earth's city lights at night
   - **Bump Map**: Topography/terrain elevation
   - **Clouds**: Optional cloud layer overlay

### Option 2: Quick Download Links

- **Day Map**: `https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg`
- **Night Lights**: `https://eoimages.gsfc.nasa.gov/images/imagerecords/55000/55167/earth_lights_lrg.jpg`

### Setup Instructions

1. Create a `public/textures/` folder
2. Add the downloaded images as:g
   - `earth-day.jpg` (day map)
   - `earth-night.jpg` (night lights)
   - `earth-bump.jpg` (topography/bump map)
   - `earth-clouds.jpg` (clouds - optional)

3. Update `components/Scene.tsx` to use textures:

```typescript
import { useTexture } from '@react-three/drei'

function Earth() {
  const dayMap = useTexture('/textures/earth-day.jpg')
  const nightMap = useTexture('/textures/earth-night.jpg')
  const bumpMap = useTexture('/textures/earth-bump.jpg')
  
  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <meshPhysicalMaterial
        map={dayMap}
        emissiveMap={nightMap}
        bumpMap={bumpMap}
        bumpScale={0.05}
        // ... rest of material props
      />
    </Sphere>
  )
}
```

## Current Implementation

The current code uses **Canvas-based procedural textures** that:
- ✅ Work immediately without downloads
- ✅ Show continent-like shapes and ocean colors
- ✅ Include night-time city lights
- ✅ Have realistic bump mapping
- ⚠️ Look basic compared to real NASA images

## Recommended Texture Sizes

- **2048x1024** pixels (good performance)
- **4096x2048** pixels (high quality, more VRAM usage)
- Keep file sizes under 5MB each for web optimization

## Texture Formats

- **PNG** for transparency (clouds)
- **JPG** for non-transparent images (smaller file size)
- Optimize images before adding to `/public/textures/`

