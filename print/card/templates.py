"""Six more templates in the spirit of A Classic: simple, one premium twist each.
python3 print/card/templates.py -> card/templates.html (same structure as variants.html)
"""
import math
import os
from variants import svg, contacts, word, small, qrbox, G, FEB, FEI, LOGO
from business import BURG, IVORY, GOLD, INK, MAROON, FONTS

HERE = os.path.dirname(os.path.abspath(__file__))
CREAM = "#F3E6CF"


def logo(x, y, s, ring=True):
    r = s / 2 + 1.6
    ring_svg = (f'<circle cx="{x+s/2}" cy="{y+s/2}" r="{r}" fill="none" stroke="{G}" stroke-width=".3"/>' if ring else "")
    return ring_svg + f'<image href="{LOGO}" x="{x}" y="{y}" width="{s}" height="{s}"/>'


def back_classic(dark=False, roses=True):
    """A-style back: name, contacts left, QR right."""
    bg = BURG if dark else IVORY
    col = CREAM if dark else INK
    name = word(9, 13.2, 4.4, G if dark else MAROON, anchor="start", ls=1)
    rose = '<image href="../assets/roses-tr.png" x="62" y="-3" width="26" height="16.1"/>' if roses and not dark else ""
    return svg(85, 55, bg, f"""{rose}
      <image href="{FEB if dark else FEI}" x="-6" y="18" width="34" height="45" transform="rotate(-38 11 40)"/>
      {name}<path d="M9,15.8 H31" stroke="{G}" stroke-width=".2"/>
      {contacts(9, 21.5, col, lab=G if dark else GOLD)}
      <path d="M53,19 V45" stroke="{G}" stroke-width=".18"/>
      {qrbox(59.5, 20, 15, bg=IVORY if dark else "#fff")}{small(67, 41.5, 'SCAN TO VISIT', G, s=1.55)}""")


# F · Split ---------------------------------------------------------------
def F():
    front = svg(85, 55, IVORY, f"""
      <rect width="42.5" height="55" fill="{BURG}"/>
      <image href="{FEB}" x="10" y="2" width="30" height="40" transform="rotate(20 25 22)"/>
      <path d="M42.5,0 V55" stroke="{G}" stroke-width=".45"/>
      <circle cx="42.5" cy="27.5" r="10.4" fill="{IVORY}" stroke="{G}" stroke-width=".35"/>
      <circle cx="42.5" cy="27.5" r="11.6" fill="none" stroke="{G}" stroke-width=".15"/>
      <image href="{LOGO}" x="34" y="19" width="17" height="17"/>
      {word(57, 26, 3.6, MAROON, anchor="start", ls=.7).replace('APNA CATERING','APNA')}
      {word(57, 31, 3.6, MAROON, anchor="start", ls=.7).replace('APNA CATERING','CATERING')}
      <path d="M57,33.6 H71" stroke="{G}" stroke-width=".2"/>
      {small(57, 37.4, 'GLASGOW', GOLD, anchor="start", s=1.7, ls=1)}""")
    return "F · The Split", "Half burgundy, half ivory, joined by a gold hairline; the logo sits in a medallion right on the seam.", front, back_classic(False, roses=False)


# G · Filigree corners ---------------------------------------------------
def corner(x, y, sx, sy):
    d = ("M0,8 V1.6 Q0,0 1.6,0 H8 M2.4,5.6 C2.4,3.6 3.6,2.4 5.6,2.4 "
         "M4.1,4.1 m-.7,0 a.7,.7 0 1,0 1.4,0 a.7,.7 0 1,0 -1.4,0")
    return f'<path transform="translate({x} {y}) scale({sx} {sy})" d="{d}" fill="none" stroke="{G}" stroke-width=".35" stroke-linecap="round"/>'


def Gt():
    front = svg(85, 55, BURG, f"""
      {corner(5,5,1,1)}{corner(80,5,-1,1)}{corner(5,50,1,-1)}{corner(80,50,-1,-1)}
      <image href="{FEB}" x="50" y="0" width="36" height="48" transform="rotate(30 68 24)"/>
      {logo(35, 9, 15)}
      {word(42.5, 37, 5, G, ls=1.3)}
      {small(42.5, 42.6, 'WEDDING &amp; EVENT CATERERS · GLASGOW', G, s=1.75, ls=.7)}""")
    back = svg(85, 55, IVORY, f"""
      {corner(3.5,3.5,.8,.8)}{corner(81.5,3.5,-.8,.8)}{corner(3.5,51.5,.8,-.8)}{corner(81.5,51.5,-.8,-.8)}
      {back_classic(False, roses=False).split('</defs>',1)[1].split('<rect width="85" height="55" fill="#F8F2E7"/>',1)[1].rsplit('</svg>',1)[0]}""")
    return "G · Filigree Corners", "No full frame: four small gold Mughal corner flourishes give a jewellery-box finish.", front, back


# H · Gold band ----------------------------------------------------------
def H():
    front = svg(85, 55, BURG, f"""
      <image href="{FEB}" x="-4" y="6" width="32" height="43" transform="rotate(-25 12 27)"/>
      <rect x="0" y="23.6" width="85" height=".35" fill="{G}"/><rect x="0" y="25.1" width="85" height=".12" fill="{G}"/>
      <circle cx="42.5" cy="24.4" r="10" fill="{BURG}" stroke="{G}" stroke-width=".35"/>
      <image href="{LOGO}" x="34.5" y="16.4" width="16" height="16"/>
      {word(42.5, 43, 5.2, G, ls=1.4)}
      {small(42.5, 48, 'WEDDING &amp; EVENT CATERERS', G, s=1.7, ls=.8)}""")
    return "H · The Gold Band", "A fine double gold band runs edge to edge; the logo medallion sits on it like a seal on a ribbon.", front, back_classic(False)


# I · Arch window --------------------------------------------------------
def I():
    arch = "M10,47 V22 C10,14 16,11 20.5,8 Q22.7,6.4 23.5,5 Q24.3,6.4 26.5,8 C31,11 37,14 37,22 V47 Z"
    front = svg(85, 55, BURG, f"""
      <path d="{arch}" fill="#470815" stroke="{G}" stroke-width=".35"/>
      <path d="{arch}" fill="none" stroke="{G}" stroke-width=".12" transform="translate(23.5 26) scale(1.08) translate(-23.5 -26)"/>
      <image href="{LOGO}" x="16" y="19" width="15" height="15"/>
      {word(44, 24.5, 4, G, anchor="start", ls=.8).replace('APNA CATERING','APNA')}
      {word(44, 30, 4, G, anchor="start", ls=.8).replace('APNA CATERING','CATERING')}
      <path d="M44,33 H62" stroke="{G}" stroke-width=".2"/>
      {small(44, 37.2, 'WEDDING &amp; EVENT CATERERS', G, anchor="start", s=1.5, ls=.35)}
      {small(44, 40, 'GLASGOW', G, anchor="start", s=1.5, ls=.8)}
      <image href="{FEB}" x="62" y="26" width="26" height="35" transform="rotate(35 75 44)"/>""")
    return "I · The Window", "The logo sits inside a small Mughal arch on the left; the name is set beside it, left-aligned and modern.", front, back_classic(False)


# J · Feather edge -------------------------------------------------------
def J():
    front = svg(85, 55, BURG, f"""
      <rect x="0" y="0" width="17" height="55" fill="#470815"/>
      <image href="feather-foil.png" x="-6" y="3" width="28" height="37.5" transform="rotate(8 8 22)" opacity=".95"/>
      <path d="M17,0 V55" stroke="{G}" stroke-width=".35"/>
      {logo(25, 10, 13, ring=False)}
      {word(25, 33.5, 4.6, G, anchor="start", ls=1.05)}
      <path d="M25,36.4 H50" stroke="{G}" stroke-width=".2"/>
      {small(25, 40.6, 'WEDDING &amp; EVENT CATERERS · GLASGOW', G, anchor="start", s=1.6, ls=.45)}""")
    return "J · The Feather Edge", "A darker side panel holds a single gold peacock feather; logo and name sit left-aligned beside it.", front, back_classic(False)


# K · Cartouche ----------------------------------------------------------
def K():
    jaali = "".join(f'<path d="M{x},{y} l3,3 -3,3 -3,-3Z" fill="none" stroke="#6E1426" stroke-width=".25"/>'
                    for x in range(0, 90, 6) for y in range(-3, 58, 6))
    front = svg(85, 55, BURG, f"""
      {jaali}
      <ellipse cx="42.5" cy="27.5" rx="25" ry="20" fill="{IVORY}"/>
      <ellipse cx="42.5" cy="27.5" rx="25" ry="20" fill="none" stroke="{G}" stroke-width=".45"/>
      <ellipse cx="42.5" cy="27.5" rx="26.6" ry="21.6" fill="none" stroke="{G}" stroke-width=".15"/>
      <image href="{LOGO}" x="36" y="11" width="13" height="13"/>
      {word(42.5, 31.2, 3.5, MAROON, ls=.75)}
      <path d="M36,34.2 H49" stroke="{G}" stroke-width=".2"/>
      {small(42.5, 38.2, 'WEDDING &amp; EVENT CATERERS', GOLD, s=1.55, ls=.6)}
      {small(42.5, 41, 'GLASGOW', GOLD, s=1.55, ls=.8)}""")
    return "K · The Cartouche", "A fine tonal jaali (lattice) pattern on burgundy with an ivory oval cartouche framing the logo and name.", front, back_classic(False)


if __name__ == "__main__":
    rows = ""
    for fn in (F, Gt, H, I, J, K):
        t, d, f, b = fn()
        rows += f'<div class="row"><div class="lab"><b>{t}</b><span>{d}</span></div><div class="cards">{f}{b}</div></div>'
    html = (f'<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>*{{margin:0;padding:0}}'
            f'body{{background:#E9E1D5;padding:10mm 12mm;width:250mm;font-family:Montserrat}}'
            f'.row{{display:grid;grid-template-columns:48mm 1fr;gap:8mm;align-items:center;padding:7mm 0;border-top:.3mm solid #cdb593}}'
            f'.row:first-child{{border-top:0}}.lab b{{display:block;font:600 11pt "Cormorant Garamond";color:#5E0B1E;letter-spacing:.06em}}'
            f'.lab span{{display:block;font:400 7.4pt/1.45 Montserrat;color:#5a4a42;margin-top:1.5mm}}.cards{{display:flex;gap:10mm;align-items:center}}</style></head>'
            f'<body>{rows}</body></html>')
    open(os.path.join(HERE, "templates.html"), "w").write(html)
    print("ok")
