"""'Jharokha' A6 roll-fold brochure: ivory silk outside, tapestry reveal inside, Mughal-arch windows.

Uses the client's own envelope assets (assets/tapestry-*.jpg from the tapestry, assets/feather-gold.png).
python3 print/brochure_unique.py && node print/render_a6.js unique
"""
import os

from brochure_a6 import B, DF, DH, DW, FONTS, PHOTOS, VERSIONS, damask, damask_defs, gold_defs
from mockup_art import mandala, wing_divider

HERE = os.path.dirname(os.path.abspath(__file__))
MAROON = "#6C000C"
INK = "#4A1218"
GOLD_TXT = "#EBC77E"

IVORY_MAP = {"#6C000C": "#F6ECD8", "#8C2A1E": "#EFDFC2", "#6A1410": "#E6D2AE", "#A6402C": "#FBF4E4",
             "#7A2016": "#ECDCBC", "#5A0C0C": "#DDC69E", "#93321F": "#F7ECD6", "#4A0008": "#DCC59C",
             "#5E0C0C": "#D6BD92", "#5A1A40": "#D9BC88", "#B0442E": "#CBAB6E", "#3A0006": "#D2BA90",
             "#7E1E16": "#E2CDA6"}


def write_ivory():
    body = f'<defs>{damask_defs()}</defs>{damask(330, 160, 31)}'
    for a, b in IVORY_MAP.items():
        body = body.replace(a, b)
    with open(os.path.join(HERE, "assets", "bfloral-ivory.svg"), "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 160" width="330mm" height="160mm" data-dpi="300">{body}</svg>')


# ------------------------------------------------------------------ arch helpers
def arch(x, y, w, h, sp=None):
    sp = sp if sp is not None else min(w * .62, h * .42)
    return (f"M{x},{y+h} L{x},{y+sp} C{x},{y+sp*.45} {x+w*.3},{y+sp*.3} {x+w*.42},{y+sp*.12} "
            f"Q{x+w*.48},{y+sp*.03} {x+w/2},{y-1.2} Q{x+w*.52},{y+sp*.03} {x+w*.58},{y+sp*.12} "
            f"C{x+w*.7},{y+sp*.3} {x+w},{y+sp*.45} {x+w},{y+sp} L{x+w},{y+h} Z")


def gold_arch(x, y, w, h, sp=None, fill="none"):
    o1, o2 = 1.3, 2.6
    sp_ = sp if sp is not None else min(w * .62, h * .42)
    return (f'<path d="{arch(x-o2, y-o2, w+2*o2, h+2*o2, sp_+o2)}" fill="none" stroke="url(#gold)" stroke-width=".55" stroke-dasharray="0 1.3" stroke-linecap="round"/>'
            f'<path d="{arch(x-o1, y-o1, w+2*o1, h+2*o1, sp_+o1)}" fill="none" stroke="url(#gold)" stroke-width=".22"/>'
            f'<path d="{arch(x, y, w, h, sp)}" fill="{fill}" stroke="url(#gold)" stroke-width=".6"/>'
            f'<circle cx="{x+w/2}" cy="{y-o2-2.2}" r="1.1" fill="url(#gold)"/>'
            f'<path d="M{x+w/2},{y-o2-6} l.9,2.4 -.9,1.1 -.9,-1.1Z" fill="url(#gold)"/>')


_cid = [0]


def arch_image(href, x, y, w, h, sp=None, pos="xMidYMid slice", tag=""):
    _cid[0] += 1
    cid = f"ac{_cid[0]}"
    t = ""
    if tag:
        t = (f'<rect x="{x+1}" y="{y+h-6}" width="{w-2}" height="4.6" fill="#E0245E"/>'
             f'<text x="{x+2}" y="{y+h-2.6}" font-size="2.1" font-family="Arial" font-weight="700" fill="#fff">{tag}</text>')
    return (f'<clipPath id="{cid}"><path d="{arch(x, y, w, h, sp)}"/></clipPath>'
            f'<image href="{href}" x="{x}" y="{y-1.5}" width="{w}" height="{h+1.5}" preserveAspectRatio="{pos}" clip-path="url(#{cid})"/>'
            f'{gold_arch(x, y, w, h, sp)}{t}')


def photo(n):
    real = os.path.join(HERE, "photos", f"photo-{n}.jpg")
    if os.path.exists(real):
        return f"photos/photo-{n}.jpg", ""
    return f"photos/_placeholder/photo-{n}.jpg", f"REPLACE photo-{n}.jpg"


def feather_img(x, y, w, rot):
    h = w * 578 / 432
    return (f'<image href="assets/feather-gold.png" x="{-w/2}" y="{-h/2}" width="{w}" height="{h}" '
            f'transform="translate({x} {y}) rotate({rot})"/>')


def svg(w, h, body, ivory=False):
    if ivory:
        body = body.replace("url(#gold)", "url(#goldDk)")
    return f'<svg class="art" viewBox="0 0 {w} {h}" width="{w}mm" height="{h}mm" overflow="visible">{body}</svg>'


def band(x, y, w, h):
    """sari-border strip of tapestry with gold rules"""
    _cid[0] += 1
    cid = f"bd{_cid[0]}"
    return (f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath>'
            f'<image href="assets/tapestry-tile.jpg" x="{x}" y="{y - 20}" width="{w}" height="{h + 40}" preserveAspectRatio="xMidYMid slice" clip-path="url(#{cid})"/>'
            f'<path d="M{x},{y} H{x+w} M{x},{y+h} H{x+w}" stroke="url(#gold)" stroke-width=".6"/>'
            f'<path d="M{x},{y-1.3} H{x+w} M{x},{y+h+1.3} H{x+w}" stroke="url(#gold)" stroke-width=".2"/>')


# ------------------------------------------------------------------ panels (design coords, A6)
def p1_cover():
    art = svg(DW, DH,
              arch_image("assets/tapestry-tile.jpg", 16, 16, 73, 80, 34)
              + feather_img(80, 76, 40, 18)
              + wing_divider(DW / 2, 117, 30), ivory=True)
    return f"""{art}
      <div class="t script maroon" style="top:99mm;font-size:24pt">Desi Glasgow Caterer</div>
      <div class="t deco maroon" style="top:121.5mm;font-size:5.6pt;line-height:1.6">Authentic taste…<br>unforgettable experience</div>"""


def p6_back():
    boxes = "".join(f'<rect x="{12 + (i % 3) * 28.3}" y="{69 + (i // 3) * 17}" width="24.5" height="13.5" rx="1" fill="#FFF9EE" fill-opacity=".7" '
                    f'stroke="url(#gold)" stroke-width=".3" stroke-dasharray="1 .8"/>' for i in range(6))
    art = svg(DW, DH,
              f'<circle cx="{DW/2}" cy="27" r="17.5" fill="#FFF9EE" stroke="url(#gold)" stroke-width=".55"/>'
              f'<circle cx="{DW/2}" cy="27" r="19.4" fill="none" stroke="url(#gold)" stroke-width=".5" stroke-dasharray="0 1.3" stroke-linecap="round"/>'
              + boxes, ivory=True) + svg(DW, DH, band(0, 126, DW, 13))
    labels = "".join(f'<div class="hl" style="left:{12 + (i % 3) * 28.3}mm;top:{69 + (i // 3) * 17}mm">Hotel logo</div>' for i in range(6))
    return f"""{art}
      <img class="logo" src="assets/logo-256.png" style="left:{DW/2-15.5}mm;top:11.5mm;width:31mm">
      <div class="t script maroon" style="top:50mm;font-size:20pt">Venues we've served</div>
      {labels}
      <div class="t deco maroon" style="top:106mm;font-size:6pt;letter-spacing:.18em">Apna Catering · Glasgow</div>
      <div class="t body ink" style="top:111.5mm;font-size:8.6pt">apnacatering.co.uk · 07818 478036</div>"""


def p5_flap():
    items = "".join(f"<li>{s}</li>" for s in ["Weddings", "Anniversaries", "Birthdays", "Corporate events", "Event management"])
    art = svg(DF, DH, arch_image("assets/tapestry-tile.jpg", 33, 12, 36, 34, 18, "xMidYMid slice")
              + mandala(DF / 2, 32, 8.5) + wing_divider(DF / 2, 72, 22) + wing_divider(DF / 2, 118, 30), ivory=True)
    return f"""{art}
      <div class="t script maroon" style="top:49mm;font-size:22pt">It's your day</div>
      <div class="t deco maroon" style="top:61mm;font-size:7.6pt">Make it memorable</div>
      <ul class="svc">{items}</ul>
      <div class="t body it" style="top:106.5mm">Sikh · Hindu · Muslim wedding catering</div>
      <div class="t deco maroon" style="top:122mm;font-size:5.4pt;letter-spacing:.2em">Plan your celebration</div>
      <div class="t body ink" style="top:127mm;font-size:10.5pt;font-weight:600">07818 478036 · 07828 218002</div>
      <div class="t body ink" style="top:133mm;font-size:7.8pt">hello@apnacatering.co.uk · apnacatering.co.uk</div>"""


def p2_story():
    peacock_text = """<text x="52.5" y="35" text-anchor="middle" font-family="Luxurious Script" font-size="13.5" fill="url(#peacockT)">Love for Food</text>"""
    art = svg(DW, DH,
              '<defs><linearGradient id="peacockT" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0E6E7E"/>'
              '<stop offset=".45" stop-color="#1D3FA6"/><stop offset=".75" stop-color="#5A1A60"/><stop offset="1" stop-color="#A27420"/></linearGradient></defs>'
              + gold_arch(9, 12, 87, 127, 30, "#FBF4E6")
              + peacock_text + wing_divider(52.5, 41.5, 22).replace('url(#gold)', 'url(#goldDk)')
              + feather_img(17, 122, 30, 28))
    return f"""{art}
      <div class="t deco maroon" style="top:18.5mm;font-size:5.4pt;letter-spacing:.2em">Our story</div>
      <div class="box body ink" style="left:17mm;width:71mm;top:46mm;font-size:8.7pt;line-height:1.46">
        <p>Welcome to Apna Catering, Glasgow's wedding &amp; event caterers with a passion for fine food. We specialise in quality Indian &amp; Asian delicacies, blessing weddings with an inventive menu of delights.</p>
        <p>With an incredibly experienced team, we work with a mission to uphold the values of our customers, creating meal plans that enthuse in prestigiousness, and have built a reputation for excellence in hospitality.</p>
        <p>We specialise in Sikh, Hindu and Muslim wedding catering. If you are inspired by authentic Indian food, allow us to share that passion with you.</p>
      </div>
      <div class="box script maroon" style="left:38mm;width:56mm;top:121mm;font-size:15pt">With love, Apna Catering</div>"""


def p34_spread():
    W = DW + DF
    imgs = ""
    for n, (x, y, w, h, sp, pos) in {1: (9, 15, 40, 117, 22, "xMidYMid slice"), 2: (55, 15, 42, 68, 21, "xMidYMid slice"),
                                     4: (110, 58, 44, 74, 22, "xMidYMid slice"), 3: (159, 15, 39, 117, 21, "xMidYMid slice")}.items():
        href, tag = photo(n)
        imgs += arch_image(href, x, y, w, h, sp, pos, tag)
    cards = (f'<rect x="53" y="92" width="46" height="40" rx="1.6" fill="#FBF4E6" stroke="url(#gold)" stroke-width=".45"/>'
             f'<rect x="109" y="13" width="47" height="35" rx="1.6" fill="#FBF4E6" stroke="url(#gold)" stroke-width=".45"/>')
    divs = (wing_divider(76, 107.6, 13) + wing_divider(132.5, 28.6, 13)).replace('url(#gold)', 'url(#goldDk)')
    art = svg(W, DH, imgs + cards + divs)
    cap = lambda x, y, w, s, c, t: (
        f'<div class="box" style="left:{x}mm;top:{y}mm;width:{w}mm"><div class="script maroon" style="font-size:18pt">{s}</div>'
        f'<div class="deco maroon" style="font-size:5.4pt;margin-top:.6mm">{c}</div>'
        f'<div class="body ink" style="font-size:7.8pt;line-height:1.38;margin-top:6.2mm">{t}</div></div>')
    return f"""{art}
      {cap(54, 94, 44, 'From our kitchen', 'Every plate, finished by hand',
           'Freshly cooked on the day by our own chefs, plated with care and served by a team that treats your guests as family.')}
      {cap(110, 15.5, 45, 'to your table', 'Served with pride',
           'From the tandoor to the top table, every course reaches your guests hot, on time and beautifully presented.')}"""


# ------------------------------------------------------------------ assemble
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
.sheet{{position:relative;width:{SW}mm;height:{SH}mm;overflow:hidden;break-after:page}}
.bgimg{{position:absolute;left:0;top:0;width:330mm;height:160mm}}
.shade{{position:absolute;inset:0;background:rgba(40,0,6,.22)}}
.content{{position:absolute;transform-origin:0 0}}
.art{{position:absolute;left:0;top:0}}
.t{{position:absolute;left:0;right:0;text-align:center}}
.box{{position:absolute;text-align:center}}
.script{{font-family:'Luxurious Script',cursive;line-height:1.05}}
.deco{{font-family:'Cinzel Decorative',serif;font-weight:700;letter-spacing:.06em}}
.body{{font-family:'Cormorant Garamond',serif;font-weight:600;line-height:1.42}}
.body p+p{{margin-top:1.8mm}}
.maroon{{color:{MAROON}}}
.ink{{color:{INK}}}
.it{{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;font-size:9.5pt;color:#7A4A12}}
.svc{{position:absolute;left:0;right:0;top:76mm;list-style:none;text-align:center;font-family:'Cormorant Garamond',serif;
      font-weight:600;font-size:9.6pt;line-height:1.7;color:{INK}}}
.svc li:before{{content:"\\25C6";color:#B48834;font-size:5pt;margin-right:2mm;vertical-align:middle}}
.hl{{position:absolute;width:24.5mm;height:13.5mm;display:grid;place-items:center;font:700 4.8pt 'Cinzel Decorative',serif;
     letter-spacing:.08em;color:#9A7A4A}}
.logo{{position:absolute}}
"""
    outside = f"""
<section class="sheet" id="outside">
  <img class="bgimg" src="assets/bfloral-ivory.jpg">
  {place(B, DF, p5_flap())}
  {place(B + FW, DW, p6_back())}
  {place(B + FW + PW, DW, p1_cover())}
</section>"""
    inside = f"""
<section class="sheet" id="inside">
  <img class="bgimg" src="assets/tapestry-bg.jpg">
  <div class="shade"></div>
  {place(B, DW, p2_story())}
  {place(B + PW, DW + DF, p34_spread())}
</section>"""
    html = (f'<!doctype html><html><head><meta charset="utf-8"><title>Jharokha brochure {version}</title>{FONTS}'
            f'<style>{css}</style></head><body>{gold_defs()}{outside}{inside}</body></html>')
    with open(os.path.join(HERE, f"brochure-unique-{version}.html"), "w") as f:
        f.write(html)
    print(f"brochure-unique-{version}.html", SW, "x", SH, "mm")


if __name__ == "__main__":
    write_ivory()
    for v in VERSIONS:
        build(v)
