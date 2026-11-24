"""python3 print/compress_pdf.py in.pdf out.pdf  -> images re-encoded as JPEG q90, capped at 330 dpi (masks kept)."""
import io, subprocess, sys, zlib, os
import pikepdf
from pikepdf import Name, PdfImage
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
ppi = {}
for line in subprocess.run(['pdfimages', '-list', src], capture_output=True, text=True).stdout.splitlines()[2:]:
    f = line.split()
    if f[2] == 'image': ppi[int(f[10])] = max(int(f[12]), int(f[13]))
pdf = pikepdf.open(src); done = set()
for page in pdf.pages:
    for raw in page.images.values():
        obj = raw.objgen[0]
        if obj in done: continue
        done.add(obj)
        im = PdfImage(raw).as_pil_image()
        if im.mode not in ('RGB', 'L'): im = im.convert('RGB')
        k = min(1, 330 / ppi.get(obj, 300))
        if k < 1: im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, 'JPEG', quality=90, subsampling=0, optimize=True)
        sm = raw.get('/SMask')
        if sm is not None and k < 1:
            m = PdfImage(sm).as_pil_image().convert('L').resize(im.size, Image.LANCZOS)
            sm.write(zlib.compress(m.tobytes(), 9), filter=Name.FlateDecode); sm.Width, sm.Height = m.size; sm.BitsPerComponent = 8
            if '/DecodeParms' in sm: del sm['/DecodeParms']
        raw.write(buf.getvalue(), filter=Name.DCTDecode)
        raw.Width, raw.Height = im.size; raw.ColorSpace = Name.DeviceRGB if im.mode == 'RGB' else Name.DeviceGray; raw.BitsPerComponent = 8
        for key in ('/DecodeParms', '/Decode'):
            if key in raw: del raw[key]
pdf.save(dst, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
print(os.path.getsize(src) // 1024, 'KB ->', os.path.getsize(dst) // 1024, 'KB')
