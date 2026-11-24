"""Cloche business card: die-cut serving-dome silhouette, folds along the tray edge.

python3 print/card/cloche.py && node print/card/render.js

Closed 85 x 55 mm. Flat 85 x 110 mm (+3 mm bleed). Fold at y = 55.
Outside sheet (viewed from outside): top = back of card (upright), bottom = front/lid (printed rotated 180).
Inside sheet: exactly what you see when the card is opened: dome with brand on top, lid underside (bowl) below.
"""
import os
import segno

HERE = os.path.dirname(os.path.abspath(__file__))
B = 3
W, HC = 85, 55            # closed card
FOLD = HC
BURG, BURG_DK, IVORY, GOLD, INK = "#5E0B1E", "#470815", "#F8F2E7", "#B08D57", "#3B1A1E"
WEB = "apnacatering.co.uk"
QR_URL = "https://apnacatering.co.uk"


def cloche_top():
    """Upright cloche from (0,55) clockwise to (85,55); knob, dome, tray."""
    return ("M0,55 L0,49 Q0,47 2,47 L3,47 C3,22 20,7.5 39.6,7.1 A3.2,3.2 0 1 1 45.4,7.1 "
            "C65,7.5 82,22 82,47 L83,47 Q85,47 85,49 L85,55")


def cloche_bottom():
    return ("L85,61 Q85,63 83,63 L82,63 C82,88 65,102.5 45.4,102.9 A3.2,3.2 0 1 1 39.6,102.9 "
            "C20,102.5 3,88 3,63 L2,63 Q0,63 0,61 Z")


DIE = cloche_top() + " " + cloche_bottom()
FOLDLINE = f"M0,{FOLD} H{W}"
# gold foil contour inset ~2.2 mm inside the dome, tray line
DOME_LINE = "M6,45.5 C6,24 21.5,10.6 42.5,10.6 C63.5,10.6 79,24 79,45.5"


def qr_svg(x, y, size, color):
    q = segno.make(QR_URL, error="m")
    m = q.matrix
    n = len(m)
    s = size / n
    rects = "".join(f'<rect x="{x+c*s:.3f}" y="{y+r*s:.3f}" width="{s+0.02:.3f}" height="{s+0.02:.3f}"/>'
                    for r, row in enumerate(m) for c, v in enumerate(row) if v)
    return f'<g fill="{color}" shape-rendering="crispEdges">{rects}</g>'


def flip(g):
    """rotate 180 about the centre of the bottom half (the lid), so it reads upright once folded."""
    return f'<g transform="rotate(180 {W/2} {FOLD + HC/2})">{g}</g>'


def side(name, foil=False):
    G = "#000" if foil else "url(#goldFoil)"
    gtext = "#000" if foil else GOLD
    hide = 'display:none' if foil else ''
    if name == "outside":
        # top half: BACK of card (upright)
        back = f"""
          <image href="feather-on-burgundy.png" x="44" y="6" width="34" height="45" transform="rotate(28 61 28)" style="{hide}"/>
          <path d="{DOME_LINE}" fill="none" stroke="{G}" stroke-width=".35"/>
          <circle cx="42.5" cy="4.4" r="2.1" fill="none" stroke="{G}" stroke-width=".35"/>
          <rect x="1.6" y="48.6" width="81.8" height="4.8" rx="1.2" fill="none" stroke="{G}" stroke-width=".35"/>
          <text x="42.5" y="31" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="6.2" fill="{gtext}">Your feast awaits</text>
          <text x="42.5" y="38.2" text-anchor="middle" font-family="Montserrat" font-weight="500" font-size="2.3" letter-spacing=".7" fill="{gtext}">{WEB.upper()}</text>"""
        # bottom half: FRONT / lid, drawn upright in 0..55 then moved below the fold and rotated
        front = f"""
          <image href="feather-on-burgundy.png" x="6" y="4" width="36" height="48" transform="rotate(-24 24 28)" style="{hide}"/>
          <path d="{DOME_LINE}" fill="none" stroke="{G}" stroke-width=".45"/>
          <circle cx="42.5" cy="4.4" r="2.3" fill="{G}"/>
          <rect x="0" y="47" width="85" height="8" fill="{G}"/>
          <text x="42.5" y="29.5" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="6.4" letter-spacing="1.6" fill="{gtext}">APNA CATERING</text>
          <path d="M33,33.2 H52" stroke="{G}" stroke-width=".25"/>
          <text x="42.5" y="37.8" text-anchor="middle" font-family="Montserrat" font-weight="400" font-size="2.05" letter-spacing=".9" fill="{gtext}">WEDDING &amp; EVENT CATERING</text>"""
        body = back + flip(f'<g transform="translate(0 {FOLD})">{front}</g>')
        bg = BURG
    else:
        dome = f"""
          <image href="feather-on-ivory.png" x="50" y="5" width="30" height="40" transform="rotate(26 65 25)" style="{hide}"/>
          <image href="../assets/logo-256.png" x="36.5" y="12" width="12" height="12" style="{hide}"/>
          <text x="42.5" y="31.2" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="6" letter-spacing="1.5" fill="{BURG if not foil else 'none'}">APNA CATERING</text>
          <path d="M34,34.2 H51" stroke="{G}" stroke-width=".25"/>
          <text x="42.5" y="38.6" text-anchor="middle" font-family="Montserrat" font-weight="400" font-size="2" letter-spacing=".8" fill="{INK if not foil else 'none'}">WEDDINGS · CORPORATE · PRIVATE EVENTS</text>
          <text x="42.5" y="42.4" text-anchor="middle" font-family="Montserrat" font-weight="400" font-size="2" letter-spacing=".8" fill="{INK if not foil else 'none'}">GLASGOW</text>
          <rect x="1.6" y="48.6" width="81.8" height="4.8" rx="1.2" fill="none" stroke="{G}" stroke-width=".35"/>"""
        # lid underside (bowl): y 55..110, widest at the fold
        lid = f"""
          <image href="feather-on-ivory.png" x="8" y="64" width="26" height="35" transform="rotate(-30 21 81)" style="{hide}"/>
          <g font-family="Montserrat" fill="{INK if not foil else 'none'}">
            <text x="10" y="63.6" font-size="1.9" letter-spacing=".9" fill="{GOLD if not foil else 'none'}">CALL</text>
            <text x="10" y="67.4" font-size="3" font-weight="500">07818 478036</text>
            <text x="10" y="71.2" font-size="3" font-weight="500">07828 218002</text>
            <text x="10" y="76.4" font-size="1.9" letter-spacing=".9" fill="{GOLD if not foil else 'none'}">EMAIL</text>
            <text x="10" y="79.8" font-size="2.6">hello@apnacatering.co.uk</text>
            <text x="10" y="85" font-size="1.9" letter-spacing=".9" fill="{GOLD if not foil else 'none'}">VISIT</text>
            <text x="10" y="88.4" font-size="2.6">4 Glebe Street, East Kilbride</text>
            <text x="10" y="91.6" font-size="2.6">Glasgow G74 4LY</text>
          </g>
          <path d="M53.5,60.5 V92" stroke="{G}" stroke-width=".25"/>
          <rect x="57" y="59.6" width="20" height="20" fill="#fff" style="{hide}"/>
          {'' if foil else qr_svg(58, 60.6, 18, BURG)}
          <text x="67" y="84" text-anchor="middle" font-family="Montserrat" font-size="1.9" letter-spacing=".8" fill="{GOLD if not foil else 'none'}">SCAN FOR MENUS</text>
          <text x="42.5" y="99.4" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="4.6" fill="{BURG if not foil else 'none'}">Your feast awaits</text>"""
        body = dome + lid
        bg = IVORY
    bgrect = "" if foil else f'<rect x="{-B}" y="{-B}" width="{W+2*B}" height="{2*HC+2*B}" fill="{bg}"/>'
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-B} {-B} {W+2*B} {2*HC+2*B}" width="{W+2*B}mm" height="{2*HC+2*B}mm">
  <defs><linearGradient id="goldFoil" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#D8BC86"/><stop offset=".45" stop-color="{GOLD}"/><stop offset=".75" stop-color="#8C6B3A"/><stop offset="1" stop-color="#C9A86E"/></linearGradient></defs>
  {bgrect}{body}
  <g class="guides"><path d="{DIE}" fill="none" stroke="#FF00FF" stroke-width=".25"/><path d="{FOLDLINE}" fill="none" stroke="#00B4D8" stroke-width=".25" stroke-dasharray="1.5 1"/></g>
</svg>"""


FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&'
         'family=Montserrat:wght@400;500&display=block" rel="stylesheet">')


def page(svgs, w, h, guides):
    css = (f"*{{margin:0;padding:0}}@page{{size:{w}mm {h}mm;margin:0}}body{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}"
           f".p{{width:{w}mm;height:{h}mm;break-after:page;overflow:hidden}}.p:last-child{{break-after:auto}}"
           + ("" if guides else ".guides{display:none}"))
    return f'<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>{css}</style></head><body>' + \
        "".join(f'<div class="p">{s}</div>' for s in svgs) + "</body></html>"


def mockup():
    """closed front, closed back, opened."""
    clip = f'<clipPath id="cut"><path d="{DIE}"/></clipPath>'
    out = side("outside").replace('<g class="guides">', '<g class="guides" style="display:none">')
    ins = side("inside").replace('<g class="guides">', '<g class="guides" style="display:none">')

    def card(svg, vb, w, h, clipd):
        inner = svg.split('>', 1)[1].rsplit('</svg>', 1)[0]
        return (f'<svg viewBox="{vb}" width="{w}mm" height="{h}mm" style="filter:drop-shadow(0 1.4mm 2mm rgba(40,10,10,.35))">'
                f'<defs><clipPath id="c{abs(hash(vb))}"><path d="{clipd}"/></clipPath></defs>'
                f'<g clip-path="url(#c{abs(hash(vb))})">{inner}</g></svg>')
    top = cloche_top() + " Z"
    # front: bottom half of outside rotated -> show region y 55..110 rotated back
    front_svg = out.replace('<g class="guides"', '<g class="guides"')
    front = (f'<svg viewBox="0 0 85 55" width="85mm" height="55mm" style="filter:drop-shadow(0 1.4mm 2mm rgba(40,10,10,.35))">'
             f'<defs><clipPath id="cf"><path d="{top}"/></clipPath></defs><g clip-path="url(#cf)">'
             f'<g transform="rotate(180 42.5 27.5) translate(0 -55)">{front_svg.split(">",1)[1].rsplit("</svg>",1)[0]}</g></g></svg>')
    back = card(out, "0 0 85 55", 85, 55, top)
    opened = card(ins, "0 0 85 110", 85, 110, DIE)
    cap = lambda t: f'<div style="font:500 7pt Montserrat;letter-spacing:.2em;color:#8a7360;text-align:center;margin-top:3mm">{t}</div>'
    return (f'<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>*{{margin:0;padding:0}}body{{background:#ECE4D8;padding:12mm;width:max-content}}'
            f'.row{{display:flex;gap:14mm;align-items:flex-start}}</style></head><body><div class="row">'
            f'<div>{front}{cap("CLOSED · FRONT")}<div style="height:10mm"></div>{back}{cap("CLOSED · BACK")}</div>'
            f'<div>{opened}{cap("OPENED")}</div></div></body></html>')


if __name__ == "__main__":
    out, ins = side("outside"), side("inside")
    fo, fi = side("outside", foil=True), side("inside", foil=True)
    for fn, s in [("outside.svg", out), ("inside.svg", ins)]:
        open(os.path.join(HERE, fn), "w").write(s)
    W2, H2 = W + 2 * B, 2 * HC + 2 * B
    open(os.path.join(HERE, "print.html"), "w").write(page([out, ins], W2, H2, False))
    open(os.path.join(HERE, "proof.html"), "w").write(page([out, ins], W2, H2, True))
    open(os.path.join(HERE, "foil.html"), "w").write(page([fo, fi], W2, H2, False))
    open(os.path.join(HERE, "die.svg"), "w").write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-B} {-B} {W2} {H2}" width="{W2}mm" height="{H2}mm">'
        f'<path id="CutContour" d="{DIE}" fill="none" stroke="#FF00FF" stroke-width=".25"/>'
        f'<path id="Crease" d="{FOLDLINE}" fill="none" stroke="#00B4D8" stroke-width=".25" stroke-dasharray="1.5 1"/></svg>')
    open(os.path.join(HERE, "mockup.html"), "w").write(mockup())
    print("built: print.html proof.html foil.html die.svg mockup.html")
