import sys; from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB'); W,H=im.size
for fx,fy in [(0.5,0.08),(0.25,0.5),(0.15,0.9),(0.85,0.9),(0.5,0.95),(0.93,0.5)]: print((fx,fy), im.getpixel((int(fx*W),int(fy*H))))
