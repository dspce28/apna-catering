"""A6 roll-fold guest brochure styled to match the client's final envelope (print/…/Envelope_design.pdf).

python3 print/brochure_a6.py && node print/render_a6.js

Two outputs from one design (laid out at A6 = 105 x 148 mm per panel):
  a6  : folded 105 x 148 mm  (needs a C6 162 x 114 envelope)
  fit : folded  98 x 140 mm  (fits the client's Canva envelope, ~147.6 x 104 mm inside)
"""
import math
import os
import random

from mockup_art import LEAF, eye_defs, feather_glossy, mandala, paisley_lace, peacock, scroll, velvet_defs, wing_divider

HERE = os.path.dirname(os.path.abspath(__file__))
B = 3
VERSIONS = {"a6": (105, 148), "fit": (98, 140)}
DW, DH, DF = 105, 148, 102          # design panel width / height / tuck-in panel width

GOLD_TXT = "#EBC77E"
CHAMP = "#F3DDB0"
PHOTOS = {1: "Waiter carrying plates (tall)", 2: "Chef garnishing a plate",
          3: "Tandoor chef with team (tall)", 4: "Plate handed over at the pass"}


# ------------------------------------------------------------------ damask to match the envelope
PPETAL = "M0,-.18 C.36,-.36 .38,-.76 0,-1 C-.38,-.76 -.36,-.36 0,-.18Z"


def lotus(x, y, rad, rot=0):
    sw = .24 / rad
    outer = "".join(f'<path d="{PPETAL}" transform="rotate({rot + i*45})" stroke="#4A0008" stroke-width="{sw:.3f}"/>'
                    f'<path d="M0,-.3 L0,-.8" transform="rotate({rot + i*45})" stroke="#5E0C0C" stroke-width="{sw*.8:.3f}" fill="none"/>'
                    for i in range(8))
    inner = "".join(f'<path d="{PPETAL}" transform="rotate({rot + 22.5 + i*60}) scale(.6)" stroke="#4A0008" stroke-width="{sw*1.4:.3f}"/>'
                    for i in range(6))
    dots = "".join(f'<circle cx="{.3*math.cos(i*math.pi/4):.2f}" cy="{.3*math.sin(i*math.pi/4):.2f}" r=".045" fill="#B0442E"/>' for i in range(8))
    return (f'<g transform="translate({x:.2f} {y:.2f}) scale({rad:.2f})" fill="url(#evelvet)">{outer}'
            f'<g fill="url(#evelvet2)">{inner}</g><circle r=".2" fill="#5A1A40"/>{dots}</g>')


def rosette(x, y, rad, rot=0):
    sw = .22 / rad
    pet = "".join(f'<path d="M0,-.2 C.3,-.3 .4,-.8 0,-1 C-.4,-.8 -.3,-.3 0,-.2Z" transform="rotate({rot + i*72})" '
                  f'stroke="#4A0008" stroke-width="{sw:.3f}"/>' for i in range(5))
    return (f'<g transform="translate({x:.2f} {y:.2f}) scale({rad:.2f})" fill="url(#evelvet)">{pet}'
            f'<circle r=".26" fill="#5A1A40"/></g>')


def acanthus(x, y, L, ang):
    sw = .2 / L
    return (f'<g transform="translate({x:.2f} {y:.2f}) rotate({ang:.1f}) scale({L*.55:.2f} {L:.2f})">'
            f'<path d="{LEAF}" fill="url(#evelvet2)" stroke="#4A0008" stroke-width="{sw:.3f}"/>'
            f'<path d="M0,-.05 C.05,-.4 .02,-.7 0,-.92" fill="none" stroke="#5E0C0C" stroke-width="{sw:.3f}"/></g>')


def damask(w, h, seed=7):
    r = random.Random(seed)
    TW, TH = 52, 72
    half = []
    # anchored flowers on the mirror axes, the rest scattered in the half tile
    half.append(acanthus(26, 30, 10, 0))
    half.append(acanthus(20, 26, 9, -40))
    half.append(acanthus(2, 64, 9, 200))
    half.append(acanthus(8, 50, 8, -120))
    half.append(scroll(18, 14, 200, 14, r).replace('stroke="#9E1A30" stroke-width=".65"', 'stroke="#7E1E16" stroke-width=".55"'))
    half.append(scroll(6, 40, -60, 13, r).replace('stroke="#9E1A30" stroke-width=".65"', 'stroke="#7E1E16" stroke-width=".55"'))
    half.append(scroll(20, 52, 90, 12, r).replace('stroke="#9E1A30" stroke-width=".65"', 'stroke="#7E1E16" stroke-width=".55"'))
    half.append(lotus(26, 18, 8.2))
    half.append(lotus(0, 54, 7.6, 22.5))
    half.append(lotus(14, 38, 4.6, 10))
    for (x, y, rr) in [(6, 8, 2.8), (21, 44, 2.4), (11, 66, 3.0), (24, 64, 2.2), (3, 28, 2.4), (16, 4, 2.0), (9, 22, 2.6), (19, 58, 2.6), (4, 42, 2.2)]:
        half.append(rosette(x, y, rr, r.uniform(0, 72)))
    for _ in range(22):
        half.append(acanthus(r.uniform(2, 24), r.uniform(2, 70), r.uniform(5, 8), r.uniform(0, 360)))
    core = "".join(half)
    tile = (f'<g id="dtile">'
            f'<g transform="translate(.3 .35)" opacity=".55">{core.replace("url(#evelvet2)", "#3A0006").replace("url(#evelvet)", "#3A0006")}</g>'
            f'{core}<g transform="translate({TW} 0) scale(-1 1)">'
            f'<g transform="translate(.3 .35)" opacity=".55">{core.replace("url(#evelvet2)", "#3A0006").replace("url(#evelvet)", "#3A0006")}</g>{core}</g></g>')
    uses = []
    for i in range(-1, int(w / TW) + 2):
        for j in range(-1, int(h / TH) + 2):
            uses.append(f'<use href="#dtile" x="{i*TW}" y="{j*TH + (TH/2 if i % 2 else 0)}"/>')
    return (f'<defs>{tile}</defs><rect x="-10" y="-10" width="{w+20}" height="{h+20}" fill="#6C000C"/>{"".join(uses)}')


def damask_defs():
    rr = random.Random(9)

    def speck(base, dark, light, n=40):
        return (f'<rect width="4" height="4" fill="{base}"/>' +
                "".join(f'<circle cx="{rr.uniform(0,4):.2f}" cy="{rr.uniform(0,4):.2f}" r="{rr.uniform(.05,.18):.2f}" fill="{dark}" opacity=".7"/>' for _ in range(n)) +
                "".join(f'<circle cx="{rr.uniform(0,4):.2f}" cy="{rr.uniform(0,4):.2f}" r="{rr.uniform(.04,.1):.2f}" fill="{light}" opacity=".55"/>' for _ in range(n // 3)))
    return (f'<pattern id="evelvet" width="4" height="4" patternUnits="userSpaceOnUse">{speck("#8C2A1E", "#6A1410", "#A6402C")}</pattern>'
            f'<pattern id="evelvet2" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(33)">{speck("#7A2016", "#5A0C0C", "#93321F")}</pattern>')


def write_damask(name, w, h, seed, dpi=400):
    with open(os.path.join(HERE, "assets", f"bfloral-{name}.svg"), "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {w} {h}" '
                f'width="{w}mm" height="{h}mm" data-dpi="{dpi}"><defs>{damask_defs()}</defs>{damask(w, h, seed)}</svg>')


# ------------------------------------------------------------------ shared svg defs
def gold_defs():
    return f"""<svg width="0" height="0" style="position:absolute"><defs>
  <linearGradient id="gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="30" y2="18" spreadMethod="reflect">
    <stop class="g" offset="0" stop-color="#FBE7A8"/><stop class="g" offset=".35" stop-color="#E0B25A"/>
    <stop class="g" offset=".62" stop-color="#A8752A"/><stop class="g" offset="1" stop-color="#F1D287"/></linearGradient>
  {velvet_defs()}{eye_defs()}
</defs></svg>"""


def svg(w, h, body, cls=""):
    return f'<svg class="art {cls}" viewBox="0 0 {w} {h}" width="{w}mm" height="{h}mm" overflow="visible">{body}</svg>'


def mirrored(body, axis_x):
    return f'<g transform="translate({2*axis_x} 0) scale(-1 1)">{body}</g>'


def photo(n):
    real = os.path.join(HERE, "photos", f"photo-{n}.jpg")
    if os.path.exists(real):
        return f"photos/photo-{n}.jpg", ""
    return (f"photos/_placeholder/photo-{n}.jpg",
            f'<span class="replace">REPLACE · photo-{n}.jpg · {PHOTOS[n]}</span>')


def ph(n, x, y, w, h, pos="center"):
    src, tag = photo(n)
    return (f'<div class="ph" style="left:{x}mm;top:{y}mm;width:{w}mm;height:{h}mm">'
            f'<img src="{src}" style="object-position:{pos}">{tag}</div>')


# ------------------------------------------------------------------ panels (design coordinates, A6)
def p1_cover():
    art = svg(DW, DH, (
        f'<rect x="6" y="6" width="{DW-12}" height="{DH-12}" fill="none" stroke="url(#gold)" stroke-width=".4"/>'
        f'<rect x="7.4" y="7.4" width="{DW-14.8}" height="{DH-14.8}" fill="none" stroke="url(#gold)" stroke-width=".18"/>'
        + paisley_lace(30, 132, -28, .15)
        + feather_glossy(66, 98, 34, 1.12)
        + wing_divider(52.5, 52, 32)))
    return f"""{art}
      <div class="t script" style="top:17mm;font-size:31pt">Desi Glasgow</div>
      <div class="t script" style="top:30mm;font-size:31pt">Caterer</div>
      <div class="t deco" style="top:57mm;font-size:5.6pt;line-height:1.55">Authentic taste…<br>unforgettable experience</div>"""


def p2_story():
    feather = feather_glossy(15, 34, -6, .9, seed=21)
    art = svg(DW, DH, (
        f'<rect x="33" y="9" width="66" height="131" rx="2" fill="#2A0005" fill-opacity=".62" stroke="url(#gold)" stroke-width=".25"/>'
        + feather + wing_divider(66, 32.5, 22)))
    return f"""{art}
      <div class="box" style="left:35mm;width:62mm;top:13mm">
        <div class="deco" style="font-size:5.4pt;letter-spacing:.18em">Our story</div>
        <div class="script" style="font-size:29pt;margin-top:.5mm">Love for Food</div>
        <div class="body" style="margin-top:9.5mm;font-size:9.3pt;line-height:1.5">
          <p>Welcome to Apna Catering, Glasgow's wedding &amp; event caterers with a passion for fine food. We specialise in quality Indian &amp; Asian delicacies, blessing weddings with an inventive menu of delights.</p>
          <p>With an incredibly experienced team, we work with a mission to uphold the values of our customers, creating meal plans that enthuse in prestigiousness, and have built a reputation for excellence in hospitality.</p>
          <p>We specialise in Sikh, Hindu and Muslim wedding catering. If you are inspired by authentic Indian food, allow us to share that passion with you.</p>
        </div>
        <div class="script" style="font-size:16pt;margin-top:5mm">With love, Apna Catering</div>
      </div>"""


def p34_spread():
    W = DW + DF
    art = svg(W, DH, (
        f'<path d="M6,8 H{W-6} M6,{DH-8} H{W-6}" stroke="url(#gold)" stroke-width=".35"/>'
        f'<path d="M6,9.4 H{W-6} M6,{DH-9.4} H{W-6}" stroke="url(#gold)" stroke-width=".15"/>'
        + wing_divider(75, 102, 18) + wing_divider(134, 51, 18)))
    cap = lambda x, y, w, s, c, t: (
        f'<div class="box" style="left:{x}mm;top:{y}mm;width:{w}mm"><div class="script" style="font-size:21pt">{s}</div>'
        f'<div class="deco" style="font-size:6pt;margin-top:1mm">{c}</div><div class="body small" style="margin-top:2mm">{t}</div></div>')
    return f"""{art}
      {ph(1, 9, 16, 40, 116, '50% 30%')}
      {ph(2, 54, 16, 43, 52, '45% 50%')}
      {cap(52, 74, 47, 'From our kitchen', 'Every plate, finished by hand',
           'Freshly cooked on the day by our own chefs, plated with care and served by a team that treats your guests as family.')}
      {cap(110, 16, 48, 'to your table', 'Served with pride',
           'From the tandoor to the top table, every course reaches your guests hot, on time and beautifully presented.')}
      {ph(4, 112, 58, 44, 74, '60% 50%')}
      {ph(3, 161, 16, 37, 116, '62% 40%')}"""


def p5_flap():
    art = svg(DF, DH, mandala(DF / 2, 20, 10) + wing_divider(DF / 2, 62, 22) + wing_divider(DF / 2, 114, 30))
    items = "".join(f"<li>{s}</li>" for s in ["Weddings", "Anniversaries", "Birthdays", "Corporate events", "Event management"])
    return f"""{art}
      <div class="t script" style="top:32mm;font-size:24pt">It's your day</div>
      <div class="t deco" style="top:45mm;font-size:8.6pt;line-height:1.25">Make it<br>memorable</div>
      <ul class="svc">{items}</ul>
      <div class="t body it" style="top:102mm">Sikh · Hindu · Muslim wedding catering</div>
      <div class="t deco" style="top:119mm;font-size:5.4pt;letter-spacing:.2em">Plan your celebration</div>
      <div class="t body" style="top:124mm;font-size:11pt;color:{GOLD_TXT}">07818 478036 · 07828 218002</div>
      <div class="t body" style="top:130.5mm;font-size:8pt">hello@apnacatering.co.uk · apnacatering.co.uk</div>"""


def p6_back():
    boxes = "".join(f'<rect x="{12 + (i % 3) * 28.3}" y="{70 + (i // 3) * 17}" width="24.5" height="13.5" rx="1" fill="none" '
                    f'stroke="url(#gold)" stroke-width=".25" stroke-dasharray="1 .8"/>' for i in range(6))
    art = svg(DW, DH, boxes + wing_divider(DW / 2, 113, 30))
    labels = "".join(f'<div class="hl" style="left:{12 + (i % 3) * 28.3}mm;top:{70 + (i // 3) * 17}mm">Hotel logo</div>' for i in range(6))
    return f"""{art}
      <img class="logo" src="assets/logo-256.png" style="left:{DW/2-15}mm;top:12mm;width:30mm">
      <div class="t script" style="top:48mm;font-size:20pt">Venues we've served</div>
      {labels}
      <div class="t deco" style="top:119mm;font-size:6pt;letter-spacing:.18em">Apna Catering · Glasgow</div>
      <div class="t body" style="top:124.5mm;font-size:8.5pt">apnacatering.co.uk · 07818 478036</div>"""


# ------------------------------------------------------------------ assemble
FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Luxurious+Script&family=Cinzel+Decorative:wght@400;700&'
         'family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=block" rel="stylesheet">')


def build(version):
    PW, PH = VERSIONS[version]
    FW = PW - 3
    k = PW / DW
    oy = (PH - DH * k) / 2
    SW, SH = 2 * PW + FW + 2 * B, PH + 2 * B

    def place(x, w, content):
        return (f'<div class="content" style="left:{x}mm;top:{B+oy:.3f}mm;width:{w}mm;height:{DH}mm;'
                f'transform:scale({k:.5f})">{content}</div>')

    css = f"""
*{{margin:0;padding:0;box-sizing:border-box}}
body{{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}}
@page{{size:{SW}mm {SH}mm;margin:0}}
.sheet{{position:relative;width:{SW}mm;height:{SH}mm;overflow:hidden;break-after:page;background:#6C000C}}
.bgimg{{position:absolute;left:0;top:0;width:330mm;height:160mm}}
.shade{{position:absolute;background:rgba(32,0,4,.38)}}
.content{{position:absolute;transform-origin:0 0}}
.art{{position:absolute;left:0;top:0}}
.t{{position:absolute;left:0;right:0;text-align:center}}
.box{{position:absolute;text-align:center}}
.script{{font-family:'Luxurious Script',cursive;color:{GOLD_TXT};line-height:1.05}}
.deco{{font-family:'Cinzel Decorative',serif;font-weight:700;color:{GOLD_TXT};text-transform:none;letter-spacing:.06em}}
.body{{font-family:'Cormorant Garamond',serif;font-weight:600;color:{CHAMP};font-size:8.5pt;line-height:1.42}}
.body p+p{{margin-top:2mm}}
.body.small{{font-size:8pt}}
.it{{font-style:italic;font-weight:500;font-size:9.5pt;color:{GOLD_TXT}}}
.svc{{position:absolute;left:0;right:0;top:67mm;list-style:none;text-align:center;font-family:'Cormorant Garamond',serif;
      font-weight:600;font-size:10pt;line-height:1.75;color:{CHAMP}}}
.svc li:before{{content:"\\25C6";color:{GOLD_TXT};font-size:5pt;margin-right:2mm;vertical-align:middle}}
.ph{{position:absolute;overflow:hidden;outline:.35mm solid #D9AE5F;outline-offset:1mm}}
.ph img{{width:100%;height:100%;object-fit:cover;display:block}}
.replace{{position:absolute;left:1.2mm;bottom:1.2mm;background:#E0245E;color:#fff;font:600 5.2pt Arial,sans-serif;padding:.5mm 1mm}}
.hl{{position:absolute;width:24.5mm;height:13.5mm;display:grid;place-items:center;font:500 5pt 'Cinzel Decorative',serif;
     letter-spacing:.08em;color:{CHAMP};opacity:.75}}
.logo{{position:absolute}}
"""
    out_p5, out_p6, out_p1 = B, B + FW, B + FW + PW
    in_p2, in_p3 = B, B + PW
    outside = f"""
<section class="sheet" id="outside">
  <img class="bgimg" src="assets/bfloral-out.jpg">
  {place(out_p5, DF, p5_flap())}
  {place(out_p6, DW, p6_back())}
  {place(out_p1, DW, p1_cover())}
</section>"""
    inside = f"""
<section class="sheet" id="inside">
  <img class="bgimg" src="assets/bfloral-in.jpg">
  <div class="shade" style="left:{in_p3}mm;top:0;width:{PW+FW+B}mm;height:{SH}mm"></div>
  {place(in_p2, DW, p2_story())}
  {place(in_p3, DW + DF, p34_spread())}
</section>"""
    html = (f'<!doctype html><html><head><meta charset="utf-8"><title>Brochure {version}</title>{FONTS}'
            f'<style>{css}</style></head><body>{gold_defs()}{outside}{inside}</body></html>')
    name = f"brochure-{version}.html"
    with open(os.path.join(HERE, name), "w") as f:
        f.write(html)
    meta = dict(PW=PW, PH=PH, FW=FW, SW=SW, SH=SH, B=B)
    print(name, meta)
    return meta


if __name__ == "__main__":
    write_damask("out", 330, 160, 7)
    write_damask("in", 330, 160, 13)
    for v in VERSIONS:
        build(v)
