# sheet.py out.png img...  -> contact sheet (4 per row, 300px tiles, labelled)
import sys; from PIL import Image, ImageDraw
fs=sys.argv[2:]; n=len(fs); cols=5; t=300; rows=(n+cols-1)//cols
sh=Image.new('RGB',(cols*t,rows*(t+18)),'white'); d=ImageDraw.Draw(sh)
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize((t,t)); x,y=(i%cols)*t,(i//cols)*(t+18); sh.paste(im,(x,y)); d.text((x+4,y+t+3),f.split('/')[-1],fill='black')
sh.save(sys.argv[1])
