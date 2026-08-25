# INFO.WORLD — BUILD 2.2

Critical fix: the previous build stopped at 0% because `updateUI()` was referenced but missing.
This build adds a complete `updateUI()` implementation and initializes the boot sequence even if UI rendering throws.

Files must be named exactly `index.html`, `style.css`, `script.js`.


BUILD 2.3: keyboard handling uses physical KeyW/KeyA/KeyS/KeyD/KeyE codes, so WASD and E work regardless of the active keyboard layout. Arrow keys remain supported.
