import os
import re

dest_dir = r"C:\Users\HP\.gemini\antigravity\scratch\f1-race-intelligence\frontend\js\libs"
os.makedirs(dest_dir, exist_ok=True)

src = r"C:\Users\HP\AppData\Local\Packages\12030rocksdanister.LivelyWallpaper_97hta09mmv6hy\LocalCache\Local\Lively Wallpaper\Library\wallpapers\mylulkt4.dn1\js\threejs\jsm\controls\OrbitControls.js"
dest = os.path.join(dest_dir, "OrbitControls.js")

with open(src, "r", encoding="utf-8") as f:
    code = f.read()

# Replace ES6 import with extraction from THREE
code = re.sub(
    r"import\s*\{[^}]*\}\s*from\s*['\"]three['\"];",
    """
const {
    EventDispatcher,
    MOUSE,
    Quaternion,
    Spherical,
    TOUCH,
    Vector2,
    Vector3
} = THREE;
""",
    code
)

# Replace export { OrbitControls }; with attaching to THREE
code = re.sub(
    r"export\s*\{\s*OrbitControls\s*\};",
    "if (typeof THREE !== 'undefined') { THREE.OrbitControls = OrbitControls; }",
    code
)

with open(dest, "w", encoding="utf-8") as f:
    f.write(code)

print("Generated OrbitControls.js successfully!")
