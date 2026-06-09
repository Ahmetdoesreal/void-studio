# Editable Sprites

These sprites are plain SVG files so they can be edited by hand or in a vector editor.

Every sprite declares power-of-two dimensions:

- `64x64` for floor/path/blackhole/player tile sprites
- `64x128` for office department sprites
- `128x128` for larger gate/portal sprites

Furniture footprint sample textures live under `furni_samples/` and also keep
power-of-two dimensions so they stay easy to edit and reuse during placement
tuning.

The game imports these files directly from `client/src/assets/sprites/`.
