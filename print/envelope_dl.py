"""DL wallet envelope (220 x 110 mm) rebuilt from the client's maroon/gold peacock mockup.

python3 print/envelope_dl.py && node print/render_envelope_dl.js

All artwork is vector (mm units). Gold is a metallic gradient for CMYK print; the same
file renders a foil mask (gold -> 100% black, everything else removed) for foil blocking.
"""
import math
import os
import random

from mockup_art import floral, paisley_lace, peacock, velvet_defs

HERE = os.path.dirname(os.path.abspath(__file__))

EW, EH = 220, 110          # finished envelope
B = 3                      # bleed
SIDE = 15                  # glue flaps
FLAP = 62                  # flap depth at its point
POCKET = 107               # back panel folds up from the bottom; top edge sits 3 mm under the flap
OX, OY = SIDE + B, FLAP + B
NW, NH = EW + 2 * SIDE + 2 * B, FLAP + EH + POCKET + 2 * B

MAROON = "#7A0515"
TIP = (116, 61)            # flap point, back-view coordinates
# flap edge in back-view coordinates (origin = top-left of the back as you look at it)
FLAP_SEGS = [((26, 22), (62, 41), (99, 48)), ((108, 50), (113, 55), (116, 61)),
             ((119, 55), (124, 50), (134, 48)), ((176, 42), (210, 30), (220, 6))]
FLAP_EDGE = "M0,6 " + " ".join("C" + " ".join(f"{x},{y}" for x, y in seg) for seg in FLAP_SEGS)
FLAP_PATH = "M0,0 L" + FLAP_EDGE[1:] + " L220,0 Z"

rnd = random.Random(11)


# ------------------------------------------------------------------ shared defs
def defs():
    return f"""<defs>
  <linearGradient id="gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="34" y2="20" spreadMethod="reflect">
    <stop class="g" offset="0" stop-color="#F7E2A4"/><stop class="g" offset=".35" stop-color="#D9AE5A"/>
    <stop class="g" offset=".6" stop-color="#A9772E"/><stop class="g" offset="1" stop-color="#EBCB80"/></linearGradient>
  <linearGradient id="goldT" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="90">
    <stop class="g" offset="0" stop-color="#F6DE9C"/><stop class="g" offset=".5" stop-color="#D7A957"/><stop class="g" offset="1" stop-color="#B98A3E"/></linearGradient>
  <linearGradient id="bronze" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#D9AC70"/><stop offset=".5" stop-color="#A86B35"/><stop offset="1" stop-color="#6E3E1A"/></linearGradient>
  <radialGradient id="teal" cx=".5" cy=".55" r=".55"><stop offset=".5" stop-color="#2FA6A2"/><stop offset="1" stop-color="#125E6A"/></radialGradient>
  <radialGradient id="blue" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#3550C4"/><stop offset=".6" stop-color="#1A2A92"/><stop offset="1" stop-color="#0A1250"/></radialGradient>
  <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#2A0006" stop-opacity="0"/><stop offset="1" stop-color="#2A0006" stop-opacity=".55"/></radialGradient>
  {velvet_defs()}
  <pattern id="damask2" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(28) scale(1.9) translate(7 11)">{damask_tile()}</pattern>
  <pattern id="damask" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="scale(1.35)">{damask_tile()}</pattern>
</defs>"""


def flower(cx, cy, r, n, rot=0):
    pet = "".join(
        f'<ellipse cx="{cx:.2f}" cy="{cy - r*.55:.2f}" rx="{r*.2:.2f}" ry="{r*.45:.2f}" transform="rotate({rot + i*360/n:.1f} {cx:.2f} {cy:.2f})"/>'
        for i in range(n))
    return pet + f'<circle cx="{cx}" cy="{cy}" r="{r*.22:.2f}"/>'


def leaf(x, y, ang, L=4.2):
    return (f'<path transform="translate({x} {y}) rotate({ang})" '
            f'd="M0,0 C{L*.35},-{L*.28} {L*.75},-{L*.22} {L},0 C{L*.75},{L*.22} {L*.35},{L*.28} 0,0Z"/>')


def damask_tile():
    """Tone-on-tone floral like the mockup: lighter flowers, darker outlines, emboss offset."""
    motif = (flower(8, 8, 6.2, 10) + flower(23, 22, 5.4, 12, 8) + flower(24, 6, 2.6, 6) +
             flower(6, 24, 3, 6, 20) + flower(15, 14.5, 1.6, 5) +
             leaf(12, 3, 20) + leaf(2, 15, -60) + leaf(17, 27, 200) + leaf(28, 13, 110) +
             leaf(14, 20, 230, 3.4) + leaf(19, 11, -30, 3.2))
    stems = ('<path d="M13,8 C16,10 17,13 15.5,14.5 M17,17 C19,18 19,20 18,21 M4,15 C3,18 4,21 6,22 '
             'M26,10 C28,13 28,16 27,17" fill="none" stroke-width=".35"/>')
    edge = (f'<g fill="none" stroke-width=".22">{flower(8, 8, 6.2, 10)}{flower(23, 22, 5.4, 12, 8)}</g>')
    return (f'<rect width="30" height="30" fill="{MAROON}"/>'
            f'<g fill="#B4243A" stroke="#B4243A" opacity=".28" transform="translate(-.18 -.18)">{motif}{stems}</g>'
            f'<g fill="#4E0010" stroke="#4E0010" opacity=".45" transform="translate(.18 .18)">{motif}{stems}</g>'
            f'<g fill="#9C1730" stroke="#9C1730" opacity=".92">{motif}{stems}</g>'
            f'<g stroke="#5A000F" opacity=".55">{edge}</g>')


FLORAL_JOBS = {}   # seed -> (w, h, dpi); rasterised by render_envelope_dl.js


def floral_img(w, h, seed, dpi=400):
    FLORAL_JOBS[seed] = (w, h, dpi)
    return (f'<image href="assets/floral-{seed}.jpg" x="-10" y="-10" width="{w+20}" height="{h+20}" '
            f'preserveAspectRatio="none"/>')


def write_floral_svgs():
    for seed, (w, h, dpi) in FLORAL_JOBS.items():
        with open(os.path.join(HERE, "assets", f"floral-{seed}.svg"), "w") as f:
            f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 {w+20} {h+20}" '
                    f'width="{w+20}mm" height="{h+20}mm" data-dpi="{dpi}"><defs>{velvet_defs()}</defs>{floral(w, h, seed)}</svg>')


def background(seed=1):
    return (f'<g class="bg">{floral_img(EW, EH, seed)}'
            f'<rect x="-5" y="-5" width="{EW+10}" height="{EH+10}" fill="url(#vig)"/></g>')


# ------------------------------------------------------------------ peacock feather (gold line + coloured eye)
def feather(cx, cy, rot, s=1.0, seed=3, plume=True):
    r = random.Random(seed)
    RX, RY = 10.5, 12.5
    lines = []

    def g(d, w, op):
        lines.append(f'<path d="{d}" stroke="url(#gold)" stroke-width="{w:.2f}" opacity="{op:.2f}"/>')

    # eye barbs + long plume strands (the gold "fronds" of the mockup)
    y0 = -16.0
    while y0 < 14:
        for side in (-1, 1):
            t = (y0 + 16) / 30
            phi = math.radians(lerp(78, 22, t) + r.uniform(-5, 5))
            k = 1.18 + r.uniform(0, .28)
            if plume and r.random() < (.45 if side > 0 else .32):
                k = r.uniform(1.7, 3.3 if side > 0 else 2.4)
            # march until outside the scaled ellipse
            sx, sy, sd = 0.0, y0, 0.0
            pts = []
            while sd < 90:
                sd += .6
                ph = phi + sd / 26
                sx += side * .6 * math.cos(ph)
                sy -= .6 * math.sin(ph)
                pts.append((sx, sy))
                if (sx / (RX * k)) ** 2 + ((sy - 1) / (RY * k)) ** 2 > 1:
                    break
            if len(pts) > 2:
                m = pts[len(pts) // 2]
                e = pts[-1]
                g(f"M0,{y0:.2f} Q{m[0]*1.05:.2f},{m[1]:.2f} {e[0]:.2f},{e[1]:.2f}", r.uniform(.1, .2), r.uniform(.65, .95))
                if k > 1.55:  # curl the long strands at their tips
                    g(f"M{e[0]:.2f},{e[1]:.2f} q{side*1.6:.2f},-1.2 {side*1.1:.2f},-2.6 t{-side*1.3:.2f},.4", .12, .8)
        y0 += .2
    # herl barbs down the quill
    y0 = 13.0
    while y0 < 70:
        for side in (-1, 1):
            t = (y0 - 13) / 57
            L = 21 * (1 - .35 * t) * r.uniform(.8, 1.2)
            a0 = math.radians(30 + 10 * t + r.uniform(-4, 4))
            ex, ey = side * L * math.cos(a0), y0 - L * math.sin(a0) * 1.15
            c1x, c1y = side * L * .25, y0 - L * .02
            c2x, c2y = side * L * .75, y0 - L * .25
            g(f"M0,{y0:.2f} C{c1x:.2f},{c1y:.2f} {c2x:.2f},{c2y:.2f} {ex:.2f},{ey:.2f}", .13, .82 - .3 * t)
        y0 += .6 + r.uniform(0, .35)
    quill = (f'<path d="M0,-12 C.6,10 -.6,40 .8,72" stroke="url(#gold)" stroke-width=".75"/>'
             f'<path class="color" d="M-.15,-10 C.45,10 -.75,40 .65,72" stroke="#FFF1C4" stroke-width=".22" opacity=".6"/>')

    fib = "".join(
        f'<path d="M{RX*.66*math.cos(a):.2f},{1+RY*.66*math.sin(a):.2f} L{RX*.96*math.cos(a):.2f},{1+RY*.96*math.sin(a):.2f}" '
        f'stroke="#7A4418" stroke-width=".09" opacity=".55"/>' for a in [i * math.pi / 40 for i in range(80)])
    heart = "M0,-2.2 C2.4,-5.4 5.4,-1.4 3.6,2.4 C2.6,4.6 1,6.2 0,7.2 C-1,6.2 -2.6,4.6 -3.6,2.4 C-5.4,-1.4 -2.4,-5.4 0,-2.2Z"
    eye = f"""
      <g class="color">
        <ellipse cx="0" cy="1" rx="{RX}" ry="{RY}" fill="url(#bronze)"/>
        {fib}
        <ellipse cx="0" cy="2.6" rx="{RX*.58}" ry="{RY*.6}" fill="url(#teal)"/>
        <path d="{heart}" transform="translate(0 2.4) scale(.68 .66)" fill="url(#blue)"/>
        <ellipse cx="-1" cy="1.6" rx=".7" ry="1.1" fill="#fff" opacity=".18"/>
      </g>
      <ellipse cx="0" cy="1" rx="{RX}" ry="{RY}" fill="none" stroke="url(#gold)" stroke-width=".45"/>
      <ellipse cx="0" cy="2.6" rx="{RX*.58}" ry="{RY*.6}" fill="none" stroke="url(#gold)" stroke-width=".3"/>"""
    return (f'<g transform="translate({cx} {cy}) rotate({rot}) scale({s})" fill="none" stroke-linecap="round">'
            f'{"".join(lines)}{quill}{eye}</g>')


def lerp(a, b, t):
    return a + (b - a) * t


# ------------------------------------------------------------------ paisley (gold filigree)
PAISLEY_D = ("M100,295 C35,295 0,240 5,180 C10,110 60,70 95,50 C120,35 130,15 120,5 "
             "C112,-2 100,5 105,15 C150,25 200,90 195,170 C190,245 155,295 100,295Z")


def paisley(x, y, rot, s):
    """(x, y) is where the paisley's belly centre lands."""
    def sc(f, cy=190):
        return f'transform="translate(100 {cy}) scale({f}) translate(-100 -{cy})"'
    rosette = "".join(
        f'<ellipse cx="100" cy="198" rx="6" ry="13" transform="rotate({a} 100 214)"/>' for a in range(0, 360, 30))
    swirls = "".join(
        f'<path d="M100,214 C{100+40*math.cos(a):.1f},{214+40*math.sin(a):.1f} {100+70*math.cos(a+.6):.1f},{214+70*math.sin(a+.6):.1f} '
        f'{100+58*math.cos(a+1.1):.1f},{214+58*math.sin(a+1.1):.1f}" stroke-width="2.2"/>'
        for a in [i * math.pi / 3 for i in range(6)])
    return f"""<g transform="translate({x} {y}) rotate({rot}) scale({s}) translate(-100 -214)" fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
      <path d="{PAISLEY_D}" stroke-width="6"/>
      <path d="{PAISLEY_D}" {sc(1.1)} stroke-width="7" stroke-dasharray="0 13"/>
      <path d="{PAISLEY_D}" {sc(.9)} stroke-width="13" stroke-dasharray="1.6 4.2"/>
      <path d="{PAISLEY_D}" {sc(.78)} stroke-width="2.6"/>
      <path d="{PAISLEY_D}" {sc(.7,200)} stroke-width="4.5" stroke-dasharray="0 9"/>
      <path d="{PAISLEY_D}" {sc(.58,205)} stroke-width="2.2"/>
      <path d="{PAISLEY_D}" {sc(.5,205)} stroke-width="8" stroke-dasharray="1.2 3.4"/>
      {swirls}
      <g stroke-width="2">{rosette}</g>
      <circle cx="100" cy="214" r="8" fill="url(#gold)"/>
      <path d="M104,120 C90,100 96,80 112,70 M104,120 C120,104 132,96 136,80 M112,70 c6,-6 14,-2 10,6" stroke-width="2.4"/>
      <circle cx="136" cy="80" r="3.4" fill="url(#gold)"/><circle cx="96" cy="150" r="3" fill="url(#gold)"/>
    </g>"""


# ------------------------------------------------------------------ ornaments
def ornament(cx, cy, s=1.0):
    half = ("M0,-6 C1.7,-4 2.4,-1.4 0,1.6 "
            "M0,-6.4 C.9,-7.6 .5,-8.8 0,-9.8 "
            "M.9,1.6 C3.2,2 5.2,.1 4.8,-2.4 C4.5,-4.3 2.7,-4.4 2.5,-3 C2.3,-1.8 3.7,-1.5 3.9,-2.4 "
            "M1.3,2.5 C4.2,4.2 7.8,3.2 8.8,0 C9.5,-2.3 7.9,-3.5 6.9,-2.5 C6.1,-1.7 6.9,-.4 7.7,-1 "
            "M0,2.4 C.9,3.8 .9,5.2 0,6.8 "
            "M2.2,-5 C3.2,-7 5.2,-7.2 5.8,-5.8")
    dots = '<circle cx="5.8" cy="3.4" r=".4"/><circle cx="9.8" cy="1.4" r=".32"/><circle cx="6.2" cy="-6.6" r=".35"/>'
    body = f'<path d="{half}" fill="none" stroke-width=".42"/>{dots}'
    return (f'<g transform="translate({cx} {cy}) scale({s})" stroke="url(#gold)" fill="url(#gold)" stroke-linecap="round">'
            f'<path d="M0,-6 C1.7,-4 2.4,-1.4 0,1.6 C-2.4,-1.4 -1.7,-4 0,-6Z" stroke="none"/>'
            f'{body}<g transform="scale(-1 1)">{body}</g></g>')


# ------------------------------------------------------------------ faces
def back_art(mode):
    global PAISLEY, HERO
    PAISLEY = paisley_lace(163, 103, -76, .19)
    HERO = peacock(186, 63, -7, 1.05)
    """mode: 'flap' (net flap piece), 'pocket' (net back panel), 'preview' (as seen sealed)."""
    art = [background()]
    art.append(PAISLEY)
    art.append(HERO)
    if mode in ("flap", "preview"):
        flap_items = (f'<path d="{FLAP_EDGE}" fill="none" stroke="url(#gold)" stroke-width="1.7"/>'
                      + ornament(TIP[0], TIP[1] - 11, 1.35))
        if mode == "preview":
            shadow = (f'<path d="{FLAP_EDGE}" fill="none" stroke="#1A0004" stroke-width="2.6" '
                      f'opacity=".55" transform="translate(.5 1.6)" filter="url(#blur)"/>')
            art.append(f'<defs><filter id="blur"><feGaussianBlur stdDeviation=".9"/></filter>'
                       f'<clipPath id="fl"><path d="{FLAP_PATH}"/></clipPath></defs>')
            # flap sits on top of the back panel: re-draw the art inside the flap shape over the shadow
            art.append(shadow)
            art.append(f'<g clip-path="url(#fl)">{background()}{PAISLEY}{HERO}</g>')
        art.append(flap_items)
    return f'<svg class="face" viewBox="0 0 {EW} {EH}" width="{EW}mm" height="{EH}mm" overflow="visible">{"".join(art)}</svg>'


def front_art():
    divider = (f'<path d="M62,76 H102 M118,76 H158" stroke="url(#gold)" stroke-width=".35"/>'
               + ornament(110, 72.6, .62).replace('translate(110 72.6)', 'translate(110 75.8) rotate(90)'))
    return f"""<svg class="face" viewBox="0 0 {EW} {EH}" width="{EW}mm" height="{EH}mm" overflow="visible">
      {background(2)}
      <g fill="url(#goldT)" text-anchor="middle">
        <text x="110" y="45" font-family="Great Vibes" font-size="17.5">Desi Glasgow</text>
        <text x="111" y="63.5" font-family="Great Vibes" font-size="17.5">Caterer</text>
        <text x="110" y="88" font-family="Cinzel" font-weight="500" font-size="3.9" letter-spacing=".25">AUTHENTIC TASTE… UNFORGETTABLE EXPERIENCE</text>
      </g>
      {divider}
    </svg>"""


# ------------------------------------------------------------------ net + preview
FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@500&display=block" rel="stylesheet">')


def die_paths():
    def P(x, y):  # back-view -> net (flap, rotated 180 about the top fold)
        return f"{OX + EW - x:.2f},{OY - y:.2f}"
    pts = [(0, 6)] + [p for seg in FLAP_SEGS for p in seg]          # forward control polygon
    rev = pts[::-1]                                                   # walk it backwards from (220,6)
    flap = f"M{OX},{OY} L{P(*rev[0])} " + " ".join(
        "C" + " ".join(P(*q) for q in rev[i:i + 3]) for i in range(1, len(rev), 3)) + f" L{OX+EW},{OY}"
    right = f"L{OX+EW+SIDE},{OY+8} L{OX+EW+SIDE},{OY+EH-8} L{OX+EW},{OY+EH}"
    pocket = f"L{OX+EW-2},{OY+EH+POCKET} L{OX+2},{OY+EH+POCKET} L{OX},{OY+EH}"
    left = f"L{OX-SIDE},{OY+EH-8} L{OX-SIDE},{OY+8} Z"
    cut = flap + " " + right + " " + pocket + " " + left
    folds = f"M{OX},{OY} H{OX+EW} M{OX},{OY+EH} H{OX+EW} M{OX},{OY} V{OY+EH} M{OX+EW},{OY} V{OY+EH}"
    return cut, folds


def build():
    cut, folds = die_paths()
    css = f"""
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
@page{{size:{NW}mm {NH}mm;margin:0}}
.sheet{{position:relative;width:{NW}mm;height:{NH}mm;overflow:hidden;break-after:page}}
.piece{{position:absolute;width:{EW}mm;height:{EH}mm}}
.piece svg{{display:block}}
.rot{{transform:rotate(180deg)}}
.die{{position:absolute;inset:0;width:100%;height:100%}}
.preview{{background:#EFE7DE;height:{2*EH+50}mm}}
.preview .piece{{box-shadow:0 1.2mm 3.5mm rgba(60,20,20,.3);overflow:hidden}}
/* foil mask: gold -> solid black, everything else removed */
body.foil .bg, body.foil .color, body.foil .sheetbg{{display:none}}
body.foil stop.g{{stop-color:#000 !important}}
"""
    sheetbg = (f'<svg class="die sheetbg" viewBox="0 0 {NW} {NH}">'
               f'<g transform="translate(10 10)">{floral_img(NW, NH, 3, 300)}</g></svg>')
    net = f"""
<section class="sheet" id="net">
  {sheetbg}
  <div class="piece" style="left:{OX}mm;top:{OY}mm">{front_art()}</div>
  <div class="piece rot" style="left:{OX}mm;top:{OY-EH}mm">{back_art('flap')}</div>
  <div class="piece rot" style="left:{OX}mm;top:{OY+EH}mm">{back_art('pocket')}</div>
  <svg class="die guides" viewBox="0 0 {NW} {NH}" style="display:none">
    <path d="{cut}" fill="none" stroke="#FF00FF" stroke-width=".3"/>
    <path d="{folds}" fill="none" stroke="#00B4D8" stroke-width=".3" stroke-dasharray="2 1.4"/></svg>
</section>"""
    preview = f"""
<section class="sheet preview" id="preview" style="width:{EW+30}mm">
  <div class="piece" style="left:15mm;top:12mm">{back_art('preview')}</div>
  <div class="piece" style="left:15mm;top:{EH+30}mm">{front_art()}</div>
</section>"""
    html = (f'<!doctype html><html><head><meta charset="utf-8"><title>DL envelope</title>{FONTS}'
            f'<style>{css}</style></head><body><svg width="0" height="0" style="position:absolute">{defs()}</svg>{net}{preview}</body></html>')
    with open(os.path.join(HERE, "envelope-dl.html"), "w") as f:
        f.write(html)
    with open(os.path.join(HERE, "envelope-dl-cutter.svg"), "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" width="{NW}mm" height="{NH}mm" viewBox="0 0 {NW} {NH}">'
                f'<path id="CutContour" d="{cut}" fill="none" stroke="#FF00FF" stroke-width=".25"/>'
                f'<path id="Crease" d="{folds}" fill="none" stroke="#00B4D8" stroke-width=".25" stroke-dasharray="2 1.4"/></svg>')
    write_floral_svgs()
    print(f"envelope-dl.html: net {NW} x {NH} mm, finished {EW} x {EH} mm")


if __name__ == "__main__":
    build()
