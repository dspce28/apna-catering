"""Build the Apna Catering guest brochure (A6 roll-fold) and C6 envelope.

python3 print/build.py        -> writes print/brochure.html, print/envelope.html
node print/render.js          -> writes print/out/*.pdf and proof PNGs

Real photos: drop photo-1.jpg .. photo-4.jpg into print/photos/.
Missing ones fall back to print/photos/_placeholder/ and are stamped "REPLACE".
"""
import math
import os
import random

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- palette
INK = "#2A0F2E"      # aubergine
PLUM = "#3B1840"
MAROON = "#5A2160"
GOLD = "#D6B06A"
GOLD_DK = "#9A7434"
CHAMP = "#F1DFBA"
IVORY = "#FBF5EC"
TEXT = "#3A2A3E"

PHOTOS = {
    1: "Waiter carrying plates (tall)",
    2: "Chef garnishing a plate",
    3: "Tandoor chef with team (tall)",
    4: "Plate handed over at the pass",
}


def photo(n):
    real = os.path.join(HERE, "photos", f"photo-{n}.jpg")
    if os.path.exists(real):
        return f"photos/photo-{n}.jpg", False
    return f"photos/_placeholder/photo-{n}.jpg", True


# ---------------------------------------------------------------- artwork
def feather_svg(seed=7, cls="feather"):
    """Original peacock feather, drawn top (eye) to bottom (quill). viewBox 300x1000."""
    rnd = random.Random(seed)
    out = []
    cx = 150

    def rach(t):  # t: 0 top .. 1 base
        return cx + 18 * math.sin(t * math.pi * 0.9), 40 + 930 * t

    # quill
    pts = [rach(i / 60) for i in range(61)]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)

    eye_cy = 215
    # dense vane round the eye
    t = 0.0
    while t < 0.36:
        x, y = rach(t)
        dy = (y - eye_cy) / 185
        half = 108 * math.sqrt(max(0, 1 - dy * dy)) + 22
        for side in (-1, 1):
            L = half * rnd.uniform(0.9, 1.08)
            ang = math.radians(rnd.uniform(-6, 10)) - (dy * 0.9)
            ex = x + side * L * math.cos(ang)
            ey = y - L * math.sin(ang) * 0.55
            c1x = x + side * L * 0.45
            c1y = y - 6
            col = rnd.choice(["#7FA03A", "#9BAF45", "#5E8F45", "#B9A548", "#4F8B6A"])
            out.append(f'<path d="M{x:.1f},{y:.1f} Q{c1x:.1f},{c1y:.1f} {ex:.1f},{ey:.1f}" stroke="{col}" stroke-width="{rnd.uniform(.8,1.5):.2f}" opacity=".85"/>')
        t += 0.0026
    # wispy lower barbs
    t = 0.36
    while t < 0.94:
        x, y = rach(t)
        prog = (t - 0.36) / 0.58
        for side in (-1, 1):
            L = (125 - 40 * prog) * rnd.uniform(0.75, 1.1)
            ex = x + side * L * 0.92
            ey = y - L * (0.55 + 0.25 * prog)
            c1x = x + side * L * 0.25
            c1y = y - L * 0.05
            c2x = x + side * L * 0.8
            c2y = y - L * 0.25
            col = rnd.choice(["#8FA54A", "#A9B26A", "#6F9550", "#C2B067", "#4E8C7C"])
            out.append(f'<path d="M{x:.1f},{y:.1f} C{c1x:.1f},{c1y:.1f} {c2x:.1f},{c2y:.1f} {ex:.1f},{ey:.1f}" stroke="{col}" stroke-width="{rnd.uniform(.6,1.1):.2f}" opacity="{.75-.35*prog:.2f}"/>')
        t += 0.0075 + 0.006 * prog

    gid = f"g{seed}"
    eye = f"""
    <defs>
      <radialGradient id="{gid}h" cx="50%" cy="58%" r="50%"><stop offset="0" stop-color="#2B4FC9"/><stop offset=".7" stop-color="#1B2C8E"/><stop offset="1" stop-color="#121255"/></radialGradient>
      <radialGradient id="{gid}t" cx="50%" cy="55%" r="50%"><stop offset=".6" stop-color="#1FA3AE"/><stop offset="1" stop-color="#14707F"/></radialGradient>
      <linearGradient id="{gid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3DC9A"/><stop offset=".5" stop-color="#C8A04E"/><stop offset="1" stop-color="#8E6A2A"/></linearGradient>
    </defs>
    <ellipse cx="{cx}" cy="{eye_cy}" rx="96" ry="124" fill="#B89A3E" opacity=".45"/>
    <ellipse cx="{cx}" cy="{eye_cy+4}" rx="80" ry="106" fill="#3E8A50"/>
    <ellipse cx="{cx}" cy="{eye_cy+8}" rx="66" ry="88" fill="#A0682B"/>
    <ellipse cx="{cx}" cy="{eye_cy+10}" rx="66" ry="88" fill="none" stroke="url(#{gid}g)" stroke-width="2.4"/>
    <ellipse cx="{cx}" cy="{eye_cy+12}" rx="52" ry="70" fill="url(#{gid}t)"/>
    <path d="M{cx},{eye_cy-28} C{cx+44},{eye_cy-52} {cx+50},{eye_cy+30} {cx},{eye_cy+62} C{cx-50},{eye_cy+30} {cx-44},{eye_cy-52} {cx},{eye_cy-28}Z" fill="url(#{gid}h)"/>
    <ellipse cx="{cx-10}" cy="{eye_cy-4}" rx="9" ry="14" fill="#fff" opacity=".18"/>
    """
    return (f'<svg class="{cls}" viewBox="0 -40 300 1060" xmlns="http://www.w3.org/2000/svg">'
            f'<g fill="none" stroke-linecap="round">{"".join(out)}</g>'
            f'<path d="{d}" fill="none" stroke="url(#{gid}g)" stroke-width="3.2" stroke-linecap="round"/>'
            f'{eye}</svg>')


PAISLEY_D = ("M100,295 C35,295 0,240 5,180 C10,110 60,70 95,50 C120,35 130,15 120,5 "
             "C112,-2 100,5 105,15 C150,25 200,90 195,170 C190,245 155,295 100,295Z")


def paisley_svg(cls="paisley", fill="url(#pg)", stroke="#F1DFBA"):
    """Original paisley (boteh) with filigree. viewBox 0 0 200 300."""
    rosette = "".join(
        f'<ellipse cx="100" cy="199" rx="5.5" ry="10" transform="rotate({a} 100 214)" />'
        for a in range(0, 360, 45))
    return f"""<svg class="{cls}" viewBox="-12 -16 224 326" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#F6E3A8"/><stop offset=".45" stop-color="#D6B06A"/><stop offset="1" stop-color="#9A7434"/></linearGradient></defs>
  <g fill="none" stroke="{fill}" stroke-linecap="round" stroke-linejoin="round">
    <path d="{PAISLEY_D}" stroke-width="5"/>
    <path d="{PAISLEY_D}" transform="translate(100 190) scale(1.07) translate(-100 -190)" stroke-width="5" stroke-dasharray="0 11"/>
    <path d="{PAISLEY_D}" transform="translate(100 195) scale(.82) translate(-100 -195)" stroke-width="2.4"/>
    <path d="{PAISLEY_D}" transform="translate(100 200) scale(.7) translate(-100 -200)" stroke-width="3.5" stroke-dasharray="0 8"/>
    <path d="{PAISLEY_D}" transform="translate(100 205) scale(.56) translate(-100 -205)" stroke-width="2"/>
    <g stroke-width="2.2">{rosette}</g>
    <circle cx="100" cy="214" r="7" fill="{fill}"/>
    <path d="M100,150 C92,128 96,108 112,92 M100,150 C116,134 128,120 128,100" stroke-width="2"/>
    <circle cx="112" cy="92" r="3.5" fill="{fill}"/><circle cx="128" cy="100" r="3.5" fill="{fill}"/>
  </g></svg>"""


def divider(color=GOLD):
    return (f'<div class="divider"><i style="background:{color}"></i>'
            f'<b style="background:{color}"></b><i style="background:{color}"></i></div>')


FLORAL_PATTERN = """<svg class="tonal" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
 <defs><pattern id="fl" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="scale(.9)">
  <g fill="#ffffff" opacity=".07">
   <circle cx="9" cy="9" r="1.6"/>
   <ellipse cx="9" cy="5.6" rx="1.4" ry="2.4"/><ellipse cx="9" cy="12.4" rx="1.4" ry="2.4"/>
   <ellipse cx="5.6" cy="9" rx="2.4" ry="1.4"/><ellipse cx="12.4" cy="9" rx="2.4" ry="1.4"/>
   <circle cx="0" cy="0" r=".9"/><circle cx="18" cy="0" r=".9"/><circle cx="0" cy="18" r=".9"/><circle cx="18" cy="18" r=".9"/>
  </g></pattern></defs>
 <rect width="100%" height="100%" fill="url(#fl)"/></svg>"""


# ---------------------------------------------------------------- shared CSS
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Playfair+Display:wght@400;500&'
         'family=Montserrat:wght@400;500;600&display=block" rel="stylesheet">')

BASE_CSS = f"""
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{background:#fff}}
body{{font-family:Montserrat,sans-serif;color:{TEXT};-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.script{{font-family:'Pinyon Script',cursive;font-weight:400;line-height:1}}
.caps{{font-family:'Playfair Display',serif;font-weight:400;text-transform:uppercase;letter-spacing:.02em;line-height:1.02}}
.divider{{display:flex;align-items:center;justify-content:center;gap:2.2mm;margin:3mm auto}}
.divider i{{display:block;width:9mm;height:.25mm}}
.divider b{{display:block;width:1.4mm;height:1.4mm;border-radius:50%}}
.tonal{{position:absolute;inset:0;width:100%;height:100%}}
.replace{{position:absolute;left:1.5mm;bottom:1.5mm;background:#E0245E;color:#fff;font:600 5.5pt Montserrat;padding:.6mm 1.2mm;letter-spacing:.04em;z-index:5}}
"""

BLEED = 3  # mm


# ---------------------------------------------------------------- brochure
def brochure():
    W = 312 + 2 * BLEED
    H = 148 + 2 * BLEED
    ph = {n: photo(n) for n in PHOTOS}

    def img(n, pos="center"):
        src, ph_ = ph[n]
        tag = f'<span class="replace">REPLACE · photo-{n}.jpg · {PHOTOS[n]}</span>' if ph_ else ""
        return f'<div class="ph"><img src="{src}" style="object-position:{pos}">{tag}</div>'

    feather = feather_svg

    css = BASE_CSS + f"""
@page{{size:{W}mm {H}mm;margin:0}}
.sheet{{position:relative;width:{W}mm;height:{H}mm;overflow:hidden;page-break-after:always;break-after:page}}
.panel{{position:absolute;top:0;height:{H}mm;overflow:hidden}}
/* panel x positions include bleed; trim panels: 102 | 105 | 105 (outside) and 105 | 105 | 102 (inside) */
.dark{{background:{INK};color:{CHAMP}}}
.light{{background:{IVORY}}}

/* p1 front */
.p1 .frame{{position:absolute;inset:{BLEED+5}mm;border:.35mm solid {GOLD};}}
.p1 .frame{{z-index:0}}
.p1 .frame:after{{content:"";position:absolute;inset:1.2mm;border:.2mm solid {GOLD};opacity:.6}}
.p1 .logo{{position:absolute;left:50%;top:{BLEED+15}mm;width:40mm;transform:translateX(-50%)}}
.p1 .t{{position:absolute;left:0;right:0;top:{BLEED+60}mm;text-align:center}}
.p1 .t .script{{font-size:26pt;color:{GOLD}}}
.p1 .t .caps{{font-size:15pt;color:{IVORY};margin-top:1mm}}
.p1 .t .sub{{font-size:5.6pt;letter-spacing:.32em;text-transform:uppercase;color:{CHAMP};opacity:.85}}
.p1 .feather{{position:absolute;width:17mm;left:calc(50% - 8.5mm);bottom:{BLEED+9}mm;transform:rotate(44deg);transform-origin:50% 96%}}
.p1 .feather.f2{{transform:rotate(-44deg)}}

/* p2 love for food */
.p2 .feather{{position:absolute;width:38mm;left:-13mm;top:-2mm;transform:rotate(-9deg);transform-origin:top center}}
.p2 .copy{{position:absolute;left:{BLEED+31}mm;right:7mm;top:{BLEED+9}mm;text-align:center}}
.p2 .script-svg{{width:100%;height:15mm;display:block}}
.p2 .caps{{font-size:14pt;color:{INK};margin-top:.5mm}}
.p2 p{{font-size:6.9pt;line-height:1.62;color:{TEXT};margin-top:2.2mm}}
.p2 p.lead{{margin-top:0}}
.p2 .sig{{margin-top:3mm;font-size:13pt;color:{MAROON}}}

/* p3 + p4 spread */
.spread .tonal{{opacity:1}}
.spread .ph{{position:absolute;inset:0;overflow:hidden;outline:.3mm solid {GOLD};outline-offset:1mm}}
.spread .ph img{{width:100%;height:100%;object-fit:cover;display:block}}
.spread .cap{{position:absolute;text-align:center;color:{CHAMP}}}
.spread .cap .script{{font-size:19pt;color:{GOLD}}}
.spread .cap .caps{{font-size:8pt;color:{IVORY};letter-spacing:.06em;margin-top:1mm}}
.spread .cap p{{font-size:6.4pt;line-height:1.6;margin-top:2mm;color:{CHAMP};opacity:.9}}
.spread .rule{{position:absolute;height:.3mm;background:linear-gradient(90deg,transparent,{GOLD} 12%,{GOLD} 88%,transparent)}}
.spread .feather{{position:absolute;width:26mm;opacity:.9}}

/* p5 flap */
.p5 .copy{{position:absolute;left:{BLEED+8}mm;right:8mm;top:{BLEED+12}mm;text-align:center}}
.p5 .script{{font-size:24pt;color:{MAROON}}}
.p5 .caps{{font-size:15pt;color:{INK};margin-top:1mm}}
.p5 ul{{list-style:none;font-size:7pt;line-height:2;color:{TEXT};margin-top:1mm}}
.p5 ul li:before{{content:"";display:inline-block;width:1.3mm;height:1.3mm;border-radius:50%;background:{GOLD_DK};margin-right:2mm;vertical-align:middle}}
.p5 .faith{{font-family:'Playfair Display',serif;font-style:italic;font-size:8.4pt;color:{MAROON};margin-top:3mm;line-height:1.4}}
.p5 .contact{{position:absolute;left:{BLEED+8}mm;right:8mm;bottom:{BLEED+10}mm;text-align:center;border-top:.25mm solid {GOLD};padding-top:3.5mm}}
.p5 .contact small{{display:block;font-size:5.4pt;letter-spacing:.3em;text-transform:uppercase;color:{GOLD_DK};font-weight:600}}
.p5 .contact b{{display:block;font-family:'Playfair Display',serif;font-weight:400;font-size:10pt;color:{INK};margin-top:1.2mm}}
.p5 .contact span{{display:block;font-size:6.6pt;margin-top:1.2mm}}
.p5 .paisley{{position:absolute;width:13mm;left:calc(50% - 6.5mm);top:{BLEED+86}mm;opacity:.9}}

/* p6 closing */
.p6 .logo{{position:absolute;left:50%;top:{BLEED+12}mm;width:34mm;transform:translateX(-50%)}}
.p6 .copy{{position:absolute;left:{BLEED+8}mm;right:{BLEED+8}mm;top:{BLEED+52}mm;text-align:center}}
.p6 .script{{font-size:18pt;color:{GOLD}}}
.p6 .caps{{font-size:9.5pt;color:{IVORY};margin-top:1mm}}
.p6 .grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:2.6mm;margin-top:4mm}}
.p6 .grid div{{height:13mm;border:.25mm dashed rgba(214,176,106,.7);display:grid;place-items:center;font-size:4.8pt;letter-spacing:.14em;text-transform:uppercase;color:{CHAMP};opacity:.75}}
.p6 .foot{{position:absolute;left:0;right:0;bottom:{BLEED+9}mm;text-align:center;font-size:6.4pt;color:{CHAMP};letter-spacing:.06em;line-height:1.7}}
.p6 .foot b{{font-weight:500;color:{GOLD};letter-spacing:.2em}}
"""

    # x positions (mm from sheet left edge, bleed included)
    # outside: p5 (0..105) | p6 (105..210) | p1 (210..318)
    # inside : p2 (0..108) | p3 (108..213) | p4 (213..318)
    peacock_text = f"""<svg class="script-svg" viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="pk" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#14707F"/><stop offset=".35" stop-color="#1F3FA6"/>
        <stop offset=".65" stop-color="#5A2160"/><stop offset="1" stop-color="#9A7434"/></linearGradient></defs>
      <text x="120" y="44" text-anchor="middle" font-family="Pinyon Script" font-size="46" fill="url(#pk)">Our story</text></svg>"""

    outside = f"""
<section class="sheet" id="outside">
  <div class="panel p5 light" style="left:0;width:105mm">
    {paisley_svg()}
    <div class="copy">
      <div class="script">It's your day</div>
      <div class="caps">Make it<br>memorable</div>
      {divider(GOLD_DK)}
      <ul><li>Weddings</li><li>Anniversaries</li><li>Birthdays</li><li>Corporate events</li><li>Event management</li></ul>
      <div class="faith">Sikh, Hindu &amp; Muslim<br>wedding catering</div>
    </div>
    <div class="contact">
      <small>Plan your celebration</small>
      <b>07818 478036</b>
      <span>07828 218002</span>
      <span>hello@apnacatering.co.uk · apnacatering.co.uk</span>
    </div>
  </div>
  <div class="panel p6 dark" style="left:105mm;width:105mm">
    {FLORAL_PATTERN}
    <img class="logo" src="assets/logo-256.png">
    <div class="copy">
      <div class="script">Trusted by</div>
      <div class="caps">Glasgow's finest venues</div>
      <div class="grid">{''.join('<div>Hotel logo</div>' for _ in range(6))}</div>
    </div>
    <div class="foot"><b>APNA CATERING · GLASGOW</b><br>apnacatering.co.uk · 07818 478036</div>
  </div>
  <div class="panel p1 dark" style="left:210mm;width:108mm">
    {FLORAL_PATTERN}
    <div class="frame" style="left:5mm;right:{BLEED+5}mm"></div>
    {feather(11, 'feather f2')}
    {feather(7)}
    <img class="logo" src="assets/logo-256.png">
    <div class="t">
      <div class="script">Glasgow's</div>
      <div class="caps">Wedding &amp; Event<br>Caterers</div>
      {divider()}
      <div class="sub">Weddings · Anniversaries · Birthdays</div>
    </div>
  </div>
</section>"""

    inside = f"""
<section class="sheet" id="inside">
  <div class="panel p2 light" style="left:0;width:108mm">
    {feather(3)}
    <div class="copy">
      {peacock_text}
      <div class="caps">Love for food</div>
      {divider(GOLD_DK)}
      <p class="lead">Welcome to Apna Catering, Glasgow's wedding &amp; event caterers with a passion for fine food. We specialise in quality Indian &amp; Asian delicacies, blessing weddings with an inventive menu of delights.</p>
      <p>With an incredibly experienced team, we work with a mission to uphold the values of our customers, creating meal plans that enthuse in prestigiousness, and have built a reputation for excellence in hospitality.</p>
      <p>We specialise in Sikh, Hindu and Muslim wedding catering. If you are inspired by authentic Indian food, allow Apna Catering to share that passion with you.</p>
    </div>
  </div>
  <div class="panel spread dark" style="left:108mm;width:210mm">
    {FLORAL_PATTERN}
    <div class="rule" style="left:6mm;right:6mm;top:{BLEED+6}mm"></div>
    <div class="rule" style="left:6mm;right:6mm;bottom:{BLEED+6}mm"></div>
    <!-- p3: fold at 105mm from this panel's left edge -->
    <div style="position:absolute;left:8mm;top:{BLEED+13}mm;width:41mm;height:117mm">{img(1,'50% 30%')}</div>
    <div style="position:absolute;left:54mm;top:{BLEED+13}mm;width:44mm;height:50mm">{img(2,'45% 50%')}</div>
    <div class="cap" style="left:52mm;width:48mm;top:{BLEED+72}mm">
      <div class="script">From our kitchen</div>
      <div class="caps">Every plate, finished by hand</div>
      <p>Freshly cooked on the day by our own chefs, plated with care and served by a team that treats your guests as family.</p>
    </div>
    <!-- p4 -->
    <div class="cap" style="left:112mm;width:48mm;top:{BLEED+13}mm">
      <div class="script">to your table</div>
      <div class="caps">Served with pride</div>
      <p>From the tandoor to the top table, every course reaches your guests hot, on time and beautifully presented.</p>
    </div>
    <div style="position:absolute;left:112mm;top:{BLEED+80}mm;width:46mm;height:50mm">{img(4,'60% 50%')}</div>
    <div style="position:absolute;left:162mm;top:{BLEED+13}mm;width:38mm;height:117mm">{img(3,'62% 40%')}</div>
  </div>
</section>"""

    html = f"""<!doctype html><html><head><meta charset="utf-8"><title>Apna Catering brochure</title>{FONTS}
<style>{css}</style></head><body>{outside}{inside}</body></html>"""
    with open(os.path.join(HERE, "brochure.html"), "w") as f:
        f.write(html)


# ---------------------------------------------------------------- envelope
def envelope():
    """C6 wallet envelope (162 x 114 mm, opens on the long top edge)."""
    EW, EH = 162, 114
    SIDE = 16      # glued side flaps
    TOP = 48       # sealing flap
    BOT = 78       # bottom pocket flap
    B = BLEED
    NW = EW + 2 * SIDE + 2 * B
    NH = TOP + EH + BOT + 2 * B
    ox, oy = SIDE + B, TOP + B  # front panel origin

    # dieline outline (mm), drawn in an SVG overlay for the proof copy
    die = (f"M{ox},{oy} L{ox},{oy} "
           f"C{ox+20},{oy-TOP+6} {ox+EW/2-30},{oy-TOP} {ox+EW/2},{oy-TOP} "
           f"C{ox+EW/2+30},{oy-TOP} {ox+EW-20},{oy-TOP+6} {ox+EW},{oy} "
           f"L{ox+EW+SIDE},{oy+6} L{ox+EW+SIDE},{oy+EH-6} L{ox+EW},{oy+EH} "
           f"L{ox+EW-4},{oy+EH+BOT} L{ox+4},{oy+EH+BOT} L{ox},{oy+EH} "
           f"L{ox-SIDE},{oy+EH-6} L{ox-SIDE},{oy+6} Z")
    folds = (f"M{ox},{oy} H{ox+EW} M{ox},{oy+EH} H{ox+EW} "
             f"M{ox},{oy} V{oy+EH} M{ox+EW},{oy} V{oy+EH}")

    face = f"""
      <div class="face">
        {paisley_svg('pz big')}
        {paisley_svg('pz small')}
        <div class="to">
          <div class="script">For our honoured guest</div>
          <div class="line"></div>
        </div>
        <div class="mark">APNA CATERING · GLASGOW</div>
      </div>"""
    flap = f"""
      <div class="flapart">
        <div class="seal"><img src="assets/logo-256.png"></div>
      </div>"""
    pocket = f"""
      <div class="pocketart">
        <div class="script">With love from our kitchen to your table</div>
      </div>"""

    css = BASE_CSS + f"""
@page{{size:{NW}mm {NH}mm;margin:0}}
.sheet{{position:relative;width:{NW}mm;height:{NH}mm;overflow:hidden;break-after:page;background:{MAROON}}}
.sheet.preview{{background:#ece6df;height:{2*EH+44}mm}}
.paper{{position:absolute;background:{MAROON};overflow:hidden}}
.face{{position:absolute;left:{ox}mm;top:{oy}mm;width:{EW}mm;height:{EH}mm}}
.pz{{position:absolute}}
.pz.big{{width:42mm;right:6mm;top:8mm;transform:rotate(14deg)}}
.pz.small{{width:16mm;right:46mm;top:62mm;transform:rotate(-24deg);opacity:.75}}
.to{{position:absolute;left:14mm;top:44mm;width:84mm}}
.to .script{{font-size:20pt;color:{CHAMP}}}
.to .line{{height:.25mm;background:{GOLD};margin-top:12mm;opacity:.8}}
.mark{{position:absolute;left:14mm;bottom:9mm;font-size:5.6pt;letter-spacing:.34em;color:{GOLD}}}
/* flaps are printed rotated 180deg on the net so they read upright once folded to the back */
.flapart{{position:absolute;left:{ox}mm;top:{B}mm;width:{EW}mm;height:{TOP}mm}}
.seal{{position:absolute;left:50%;top:6mm;width:22mm;height:22mm;margin-left:-11mm;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F6E3A8,{GOLD} 55%,{GOLD_DK});display:grid;place-items:center;box-shadow:0 0 0 .6mm {MAROON},0 0 0 .9mm {GOLD}}}
.seal img{{width:18mm}}
.pocketart{{position:absolute;left:{ox}mm;top:{oy+EH}mm;width:{EW}mm;height:{BOT}mm}}
.pocketart .script{{position:absolute;left:0;right:0;top:30mm;text-align:center;font-size:15pt;color:{GOLD}}}
.rot{{transform:rotate(180deg)}}
.die{{position:absolute;inset:0;width:100%;height:100%}}
.preview .card{{position:absolute;width:{EW}mm;height:{EH}mm;background:{MAROON};overflow:hidden;box-shadow:0 1.5mm 4mm rgba(0,0,0,.25)}}
.preview .lbl{{position:absolute;font-size:7pt;letter-spacing:.2em;text-transform:uppercase;color:#6a5670}}
"""

    tonal = FLORAL_PATTERN
    net = f"""
<section class="sheet" id="net">
  {tonal}
  {face}
  <div class="rot" style="position:absolute;left:0;top:0;width:{NW}mm;height:{oy}mm;transform-origin:center"><div style="position:absolute;left:0;top:0;width:100%;height:100%">{flap.replace(f'top:{B}mm', 'top:0')}</div></div>
  <div class="rot" style="position:absolute;left:0;top:{oy+EH}mm;width:{NW}mm;height:{BOT+B}mm;transform-origin:center">
    <div class="pocketart" style="top:{B}mm"><div class="script">With love from our kitchen to your table</div></div></div>
</section>"""

    die_svg = f"""<svg class="die" viewBox="0 0 {NW} {NH}" xmlns="http://www.w3.org/2000/svg">
  <path d="{die}" fill="none" stroke="#E0245E" stroke-width=".3"/>
  <path d="{folds}" fill="none" stroke="#00A3C4" stroke-width=".3" stroke-dasharray="2 1.4"/></svg>"""

    # finished-look preview: front and back of the closed envelope
    back_flap = f"""<svg style="position:absolute;left:0;top:0;width:{EW}mm;height:{EH}mm" viewBox="0 0 {EW} {EH}">
      <path d="M0,{EH} L4,{EH-BOT+6} L{EW-4},{EH-BOT+6} L{EW},{EH}Z" fill="#000" opacity=".12"/>
      <path d="M0,0 C20,{TOP-6} {EW/2-30},{TOP} {EW/2},{TOP} C{EW/2+30},{TOP} {EW-20},{TOP-6} {EW},0Z" fill="{MAROON}" stroke="{GOLD}" stroke-width=".35"/></svg>"""
    preview = f"""
<section class="sheet preview" id="preview">
  <div class="lbl" style="left:16mm;top:8mm">Front</div>
  <div class="card" style="left:16mm;top:14mm">{tonal}<div style="position:absolute;left:-{ox}mm;top:-{oy}mm">{face}</div></div>
  <div class="lbl" style="left:16mm;top:{14+EH+8}mm">Back (sealed)</div>
  <div class="card" style="left:16mm;top:{14+EH+14}mm">{tonal}
     <div style="position:absolute;left:0;top:{EH-BOT+6}mm;width:100%;height:{BOT}mm"><div class="script" style="position:absolute;left:0;right:0;top:24mm;text-align:center;font-size:15pt;color:{GOLD}">With love from our kitchen to your table</div></div>
     {back_flap}
     <div class="seal" style="top:{TOP-14}mm"><img src="assets/logo-256.png"></div>
  </div>
</section>"""

    html = f"""<!doctype html><html><head><meta charset="utf-8"><title>Apna Catering envelope</title>{FONTS}
<style>{css}</style></head><body>{net}
<section class="sheet" id="net-proof" style="background:none">{net.replace('<section class="sheet" id="net">','<div style="position:absolute;inset:0;background:'+MAROON+'">').replace('</section>','</div>')}{die_svg}</section>
{preview}</body></html>"""
    with open(os.path.join(HERE, "envelope.html"), "w") as f:
        f.write(html)
    return NW, NH


if __name__ == "__main__":
    brochure()
    nw, nh = envelope()
    print("built brochure.html, envelope.html; envelope net", nw, "x", nh, "mm")
