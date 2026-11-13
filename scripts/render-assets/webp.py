# webp.py in.png out.webp small  -> writes out.webp (q82) and out@<small>.webp if small>0
import sys; from PIL import Image
src, dst, small = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGB'); im.save(dst, 'WEBP', quality=82, method=6)
if small: im.resize((small, small), Image.LANCZOS).save(dst.replace('.webp', f'@{small}.webp'), 'WEBP', quality=82, method=6)
