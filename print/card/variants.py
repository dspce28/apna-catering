"""More business-card layouts (B-E) for comparison with A (business.py). Mockup sheet only.
python3 print/card/variants.py  -> card/variants.html
"""
import os
from business import qr, side as side_a, FONTS, BURG, IVORY, GOLD, INK, MAROON

HERE = os.path.dirname(os.path.abspath(__file__))
GF = """<defs><linearGradient id="gf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCC08A"/><stop offset=".45" stop-color="#B08D57"/>
<stop offset=".75" stop-color="#8C6B3A"/><stop offset="1" stop-color="#CDAE74"/></linearGradient></defs>"""
G = "url(#gf)"
FEB, FEI = "feather-on-burgundy.png", "feather-on-ivory.png"
LOGO = "../assets/logo-256.png"


def svg(w, h, bg, body):
    return (f'<svg viewBox="0 0 {w} {h}" width="{w}mm" height="{h}mm" style="filter:drop-shadow(0 1.6mm 2.4mm rgba(40,10,10,.35))">'
            f'{GF}<rect width="{w}" height="{h}" fill="{bg}"/>{body}</svg>')


def contacts(x, y, col, lab=GOLD, anchor="start", gap=1.0):
    a = f'text-anchor="{anchor}"'
    L = lambda yy, t: f'<text x="{x}" y="{yy}" {a} font-family="Montserrat" font-weight="500" font-size="1.7" letter-spacing=".9" fill="{lab}">{t}</text>'
    V = lambda yy, t, s=2.4, w=400: f'<text x="{x}" y="{yy}" {a} font-family="Montserrat" font-weight="{w}" font-size="{s}" fill="{col}">{t}</text>'
    return (L(y, "CALL") + V(y + 3.2, "07818 478036 · 07828 218002", 2.4, 500)
            + L(y + 7.8, "EMAIL") + V(y + 11, "hello@apnacatering.co.uk")
            + L(y + 15.6, "VISIT") + V(y + 18.8, "4 Glebe Street, East Kilbride, G74 4LY", 2.25))


def word(x, y, size, fill, anchor="middle", ls=1.6):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Cormorant Garamond" font-weight="600" font-size="{size}" letter-spacing="{ls}" fill="{fill}">APNA CATERING</text>'


def small(x, y, t, fill, anchor="middle", s=1.85, ls=.85):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Montserrat" font-size="{s}" letter-spacing="{ls}" fill="{fill}">{t}</text>'


def qrbox(x, y, s, bg="#fff", fg=BURG):
    return f'<rect x="{x-1}" y="{y-1}" width="{s+2}" height="{s+2}" fill="{bg}"/><rect x="{x-1}" y="{y-1}" width="{s+2}" height="{s+2}" fill="none" stroke="{G}" stroke-width=".25"/>' + qr(x, y, s, fg)


# B · Portrait: tall feather, stacked
def B():
    f = svg(55, 85, BURG, f"""
      <image href="{FEB}" x="-4" y="18" width="46" height="62" transform="rotate(-8 19 49)"/>
      <rect x="4" y="4" width="47" height="77" fill="none" stroke="{G}" stroke-width=".3"/>
      <circle cx="27.5" cy="21" r="9" fill="none" stroke="{G}" stroke-width=".3"/><image href="{LOGO}" x="19.5" y="13" width="16"/>
      {word(27.5, 64, 4.1, G, ls=.7)}<path d="M20,67 H35" stroke="{G}" stroke-width=".2"/>
      {small(27.5, 71.5, 'WEDDING &amp; EVENT CATERERS', G, s=1.7, ls=.7)}{small(27.5, 74.6, 'GLASGOW', G, s=1.7, ls=.9)}""")
    b = svg(55, 85, IVORY, f"""
      <image href="../assets/roses-tr.png" x="33" y="-3" width="25" height="15.5"/>
      <rect x="4" y="4" width="47" height="77" fill="none" stroke="{G}" stroke-width=".22"/>
      {word(27.5, 15, 3.9, MAROON, ls=.7)}<path d="M18,17.5 H37" stroke="{G}" stroke-width=".2"/>
      <g transform="translate(0 0)">{contacts(27.5, 23, INK, anchor="middle")}</g>
      {qrbox(19, 50, 17)}{small(27.5, 73.2, 'SCAN TO VISIT', GOLD, s=1.6)}{small(27.5, 76.2, 'apnacatering.co.uk', INK, s=1.9, ls=.1)}""")
    return "B · Portrait", "Tall card: logo at the top, feather sweeping up behind, everything stacked and centred.", f, b


# C · Ivory front, single big gold feather, asymmetric
def C():
    f = svg(85, 55, IVORY, f"""
      <image href="../assets/feather-gold.png" x="47" y="-10" width="40" height="53.5" transform="rotate(28 67 17)" opacity=".95"/>
      <image href="{LOGO}" x="8" y="8" width="13"/>
      {word(8, 40, 5.2, MAROON, anchor="start", ls=1.1)}
      <path d="M8,43.2 H40" stroke="{G}" stroke-width=".3"/>
      {small(8, 47.4, 'WEDDING &amp; EVENT CATERERS · GLASGOW', GOLD, anchor="start", s=1.8, ls=.75)}""")
    b = svg(85, 55, BURG, f"""
      <image href="{FEB}" x="58" y="18" width="30" height="40" transform="rotate(30 73 38)"/>
      {word(8, 12.5, 3.9, G, anchor="start", ls=.8)}
      {contacts(8, 20, '#F3E6CF', lab='url(#gf)')}
      {qrbox(61, 17, 16, bg=IVORY)}{small(70, 39, 'SCAN TO VISIT', G, s=1.6)}""")
    return "C · The gold feather", "Ivory front led by one large real gold peacock feather; logo and name sit quietly bottom-left. Burgundy back.", f, b


# D · Mughal arch frame
def D():
    arch = "M24,47 V22 C24,14 32,11 38,7.5 Q41.5,5.5 42.5,4 Q43.5,5.5 47,7.5 C53,11 61,14 61,22 V47 Z"
    f = svg(85, 55, BURG, f"""
      <image href="{FEB}" x="-6" y="8" width="30" height="40" transform="rotate(-30 9 28)"/>
      <image href="{FEB}" x="61" y="8" width="30" height="40" transform="translate(152 0) scale(-1 1) rotate(-30 76 28)"/>
      <path d="{arch}" fill="none" stroke="{G}" stroke-width=".35"/>
      <path d="M22.8,48 V22 C22.8,13 31,10 37.5,6.3 Q41.4,4 42.5,2.3 Q43.6,4 47.5,6.3 C54,10 62.2,13 62.2,22 V48" fill="none" stroke="{G}" stroke-width=".15"/>
      <image href="{LOGO}" x="35" y="12" width="15"/>
      {word(42.5, 35, 3.5, G, ls=.55)}<path d="M35,37.6 H50" stroke="{G}" stroke-width=".2"/>
      {small(42.5, 41.4, 'WEDDING &amp; EVENT', G, s=1.6, ls=.6)}{small(42.5, 44.2, 'CATERERS · GLASGOW', G, s=1.6, ls=.6)}
      <path d="M18,48 H67" stroke="{G}" stroke-width=".3"/>""")
    b = svg(85, 55, IVORY, f"""
      <path d="M60,51 V26 C60,19 66,16.5 70.5,13.5 Q72.6,12 73.3,10.8 Q74,12 76.1,13.5 C80.6,16.5 86.6,19 86.6,26 V51" fill="none" stroke="{G}" stroke-width=".25" transform="translate(-6 0)"/>
      {word(8, 12, 3.9, MAROON, anchor="start", ls=.8)}<path d="M8,14.6 H30" stroke="{G}" stroke-width=".2"/>
      {contacts(8, 21, INK)}
      {qrbox(58.8, 26, 15)}{small(67.3, 46, 'SCAN TO VISIT', GOLD, s=1.5)}""")
    return "D · The jharokha", "A gold-foil Mughal arch frames the logo like a palace window, feathers mirrored either side. Arch repeats on the back around the QR.", f, b


# E · Rose corners, ivory front (closest to the brochure pages)
def E():
    f = svg(85, 55, IVORY, f"""
      <image href="../assets/roses-tr.png" x="58" y="-4" width="31" height="19.2"/>
      <image href="../assets/roses-bl.png" x="-3" y="28" width="24" height="27.8"/>
      <image href="{FEI}" x="54" y="20" width="30" height="40" transform="rotate(35 69 40)"/>
      <rect x="4" y="4" width="77" height="47" fill="none" stroke="{G}" stroke-width=".25"/>
      <image href="{LOGO}" x="35.5" y="9" width="14"/>
      {word(42.5, 33, 5.6, MAROON, ls=1.5)}
      <path d="M33,36 H40 M45,36 H52" stroke="{G}" stroke-width=".25"/><path d="M42.5,34.6 l1,1.4 -1,1.4 -1,-1.4Z" fill="{G}"/>
      {small(42.5, 40.6, 'WEDDING &amp; EVENT CATERERS · GLASGOW', GOLD, s=1.75, ls=.7)}""")
    b = svg(85, 55, BURG, f"""
      <rect x="4" y="4" width="77" height="47" fill="none" stroke="{G}" stroke-width=".3"/>
      <image href="{FEB}" x="-2" y="24" width="28" height="37" transform="rotate(-30 12 42)"/>
      {word(9, 13, 3.9, G, anchor="start", ls=.8)}<path d="M9,15.6 H31" stroke="{G}" stroke-width=".2"/>
      {contacts(9, 21.5, '#F3E6CF', lab='url(#gf)')}
      {qrbox(61, 15, 15, bg=IVORY)}{small(69, 37, 'SCAN TO VISIT', G, s=1.6)}""")
    return "E · Rose corners", "Ivory front with the brochure's rose clusters in opposite corners: the most wedding-like. Burgundy back with gold details.", f, b


def A():
    strip = lambda s: s.split(">", 1)[1].rsplit("</svg>", 1)[0].replace('class="guides"', 'class="guides" display="none"')
    f = f'<svg viewBox="0 0 85 55" width="85mm" height="55mm" style="filter:drop-shadow(0 1.6mm 2.4mm rgba(40,10,10,.35))">{strip(side_a("front"))}</svg>'
    b = f'<svg viewBox="0 0 85 55" width="85mm" height="55mm" style="filter:drop-shadow(0 1.6mm 2.4mm rgba(40,10,10,.35))">{strip(side_a("back"))}</svg>'
    return "A · Classic (current)", "Burgundy front, centred logo and name in a double gold frame; ivory back.", f, b


if __name__ == "__main__":
    rows = ""
    for fn in (A, B, C, D, E):
        t, d, f, b = fn()
        rows += (f'<div class="row"><div class="lab"><b>{t}</b><span>{d}</span></div>'
                 f'<div class="cards">{f}{b}</div></div>')
    html = (f'<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>*{{margin:0;padding:0}}'
            f'body{{background:#E9E1D5;padding:10mm 12mm;width:250mm;font-family:Montserrat}}'
            f'.row{{display:grid;grid-template-columns:48mm 1fr;gap:8mm;align-items:center;padding:7mm 0;border-top:.3mm solid #cdb593}}'
            f'.row:first-child{{border-top:0}}.lab b{{display:block;font:600 11pt "Cormorant Garamond";color:#5E0B1E;letter-spacing:.06em}}'
            f'.lab span{{display:block;font:400 7.4pt/1.45 Montserrat;color:#5a4a42;margin-top:1.5mm}}.cards{{display:flex;gap:10mm;align-items:center}}</style></head>'
            f'<body>{rows}</body></html>')
    open(os.path.join(HERE, "variants.html"), "w").write(html)
    print("ok")
