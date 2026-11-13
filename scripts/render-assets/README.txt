Wortox asset renders (three.js in headless Chrome via playwright-core + ffmpeg). No external images.
Setup:   npm i three playwright-core   (needs /usr/bin/google-chrome, ffmpeg with libx264/libvpx-vp9, python3 + Pillow)
Products: N=40 node render-products.mjs [key ...]      (no args = all keys + hero-family; ~1 min/key on SwiftShader)
Loops:    node render-loops.mjs [hero-loop|ambient-loop]
Manifest: python3 gen-manifest.py lib/catalogue.json
Files: studio.js (lights, sweep, accumulation renderer, framing), models.js (all product models), products.html,
       loops.html (2-D canvas loops, pure functions of t), serve.mjs, webp.py, sheet.py/cal.py (review helpers).
