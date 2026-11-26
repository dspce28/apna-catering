"""One house look for every photo on the site: candlelit warmth, softened contrast, gentle saturation.

Each photo is first pulled part of the way towards a common warm white balance (so a cool, grey shot and an
orange one meet in the middle), then the same grade is applied to all of them. Cut-outs, textures and logos are
left alone; build.py decides which files are photos.
"""
from PIL import Image, ImageEnhance, ImageOps, ImageStat

WARM = (1.08, 1.0, 0.84)   # target colour balance relative to green: warm candlelight, not orange
PULL = 0.75                # how far each photo moves towards that balance (1 = all the way)


def grade(im):
    im = im.convert("RGB")
    r, g, b = ImageStat.Stat(im.resize((64, 64))).mean
    g = max(g, 1)
    gains = []
    for mean, target in ((r, WARM[0] * g), (g, g), (b, WARM[2] * g)):
        k = (target / max(mean, 1)) ** PULL
        gains.append(min(1.14, max(0.88, k)))
    ch = [c.point(lambda v, k=k: min(255, round(v * k))) for c, k in zip(im.split(), gains)]
    im = Image.merge("RGB", ch)
    im = ImageEnhance.Color(im).enhance(0.92)
    im = ImageEnhance.Contrast(im).enhance(0.97)
    # split tone: shadows lean wine, highlights lean candlelight; blended lightly so food colours stay true
    tone = ImageOps.colorize(ImageOps.grayscale(im), black=(46, 8, 18), mid=(176, 112, 74), white=(255, 238, 212))
    im = Image.blend(im, tone, 0.2)
    # lift the deepest shadows a touch towards wine, so blacks sit in the page rather than punch holes in it
    lut = [round(18 + v * (255 - 18) / 255) for v in range(256)]
    lut_g = [round(8 + v * (255 - 8) / 255) for v in range(256)]
    lut_b = [round(12 + v * (255 - 12) / 255) for v in range(256)]
    return im.point(lut + lut_g + lut_b)
