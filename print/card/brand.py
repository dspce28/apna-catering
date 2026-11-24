"""Brand-led luxury business cards: foil monogram, blind-emboss feather, very little on the front.
python3 print/card/brand.py -> card/brand.html (mockup sheet)
"""
import math
import os
from business import qr, FONTS

HERE = os.path.dirname(os.path.abspath(__file__))
BURG, BURG2, IVORY, INK, GOLD = "#4E0918", "#5E0B1E", "#F6EFE3", "#2E1A1C", "#B08D57"
FONTS2 = FONTS.replace("family=Montserrat", "family=Cinzel:wght@400;500&family=Montserrat")

DEFS = """<defs>
<linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0" stop-color="#E9D29C"/><stop offset=".28" stop-color="#C6A267"/><stop offset=".5" stop-color="#8E6A35"/>
 <stop offset=".72" stop-color="#D9BC82"/><stop offset="1" stop-color="#9C7740"/></linearGradient>
<filter id="emboss" x="-20%" y="-20%" width="140%" height="140%">
 <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" in="SourceAlpha" result="a"/>
 <feOffset dx="-.18" dy="-.18" in="a" result="hi"/><feOffset dx=".2" dy=".2" in="a" result="lo"/>
 <feFlood flood-color="#ffffff" flood-opacity=".09"/><feComposite in2="hi" operator="in" result="H"/>
 <feFlood flood-color="#000000" flood-opacity=".28"/><feComposite in2="lo" operator="in" result="L"/>
 <feMerge><feMergeNode in="L"/><feMergeNode in="H"/></feMerge></filter>
<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="3" numOctaves="2" seed="4"/>
 <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .06 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
</defs>"""


def feather_line(x, y, s=1.0, rot=0, stroke="url(#foil)", w=.22):
    """vector line-art peacock feather (foil-able): quill, eye, barbs."""
    barbs = []
    for i in range(26):
        t = i / 25
        yy = 8 + t * 34
        L = 7 * (1 - t) ** .6 + 1.2
        for sd in (-1, 1):
            barbs.append(f"M0,{yy:.2f} q{sd*L*.6:.2f},{-L*.35:.2f} {sd*L:.2f},{-L*.9:.2f}")
    eye = ("M0,-1 C4.6,1 5.6,7.5 0,12.5 C-5.6,7.5 -4.6,1 0,-1Z "
           "M0,2.2 C2.6,3.6 3,7.4 0,10 C-3,7.4 -2.6,3.6 0,2.2Z")
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s})" fill="none" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round">'
            f'<path d="M0,12 C.3,26 -.4,40 .6,54" stroke-width="{w*1.6}"/><path d="{" ".join(barbs)}"/><path d="{eye}"/>'
            f'<circle cx="0" cy="6.6" r="1.3" fill="{stroke}" stroke="none"/></g>')


def monogram(cx, cy, r, fill="url(#foil)"):
    dots = "".join(f'<circle cx="{cx + (r+1.4)*math.cos(a):.2f}" cy="{cy + (r+1.4)*math.sin(a):.2f}" r=".22" fill="{fill}"/>'
                   for a in [i * math.pi / 18 for i in range(36)])
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{fill}" stroke-width=".35"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r-.9}" fill="none" stroke="{fill}" stroke-width=".12"/>{dots}'
            f'<text x="{cx}" y="{cy + r*.36:.2f}" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" '
            f'font-size="{r*1.18:.2f}" fill="{fill}">A</text>'
            f'<path d="M{cx - r*.42:.2f},{cy + r*.55:.2f} H{cx + r*.42:.2f}" stroke="{fill}" stroke-width=".18"/>')


def card(bg, body, w=85, h=55, label=""):
    tex = f'<rect width="{w}" height="{h}" fill="#fff" filter="url(#paper)"/>'
    return (f'<figure><svg viewBox="0 0 {w} {h}" width="{w*1.25}mm" height="{h*1.25}mm" '
            f'style="filter:drop-shadow(0 2mm 3mm rgba(30,8,8,.38)) drop-shadow(0 .3mm .4mm rgba(30,8,8,.25))">'
            f'{DEFS}<rect width="{w}" height="{h}" fill="{bg}"/>{tex}{body}</svg><figcaption>{label}</figcaption></figure>')


def t(x, y, s, txt, fill, fam="Montserrat", wgt=400, ls=0, anchor="middle", style=""):
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{fam}" font-weight="{wgt}" font-size="{s}" '
            f'letter-spacing="{ls}" fill="{fill}" {style}>{txt}</text>')


F = "url(#foil)"


def back_details(bg_dark, x0=10):
    col = "#EFE3CF" if bg_dark else INK
    lab = F
    rows = [("TELEPHONE", "07818 478036  ·  07828 218002"), ("EMAIL", "hello@apnacatering.co.uk"),
            ("ADDRESS", "4 Glebe Street, East Kilbride, Glasgow G74 4LY")]
    out = ""
    y = 24.5
    for k, v in rows:
        out += t(x0, y, 1.55, k, lab, ls=.95, anchor="start", wgt=500) + t(x0, y + 3.1, 2.25, v, col, anchor="start")
        y += 7.6
    return out


def qr_block(x, y, s, dark):
    bgc = IVORY if dark else "#ffffff"
    return (f'<rect x="{x-1.2}" y="{y-1.2}" width="{s+2.4}" height="{s+2.4}" fill="{bgc}"/>'
            f'<rect x="{x-1.9}" y="{y-1.9}" width="{s+3.8}" height="{s+3.8}" fill="none" stroke="{F}" stroke-width=".2"/>'
            + qr(x, y, s, BURG) + t(x + s / 2, y + s + 4.6, 1.5, "SCAN TO VISIT", F, ls=.9, wgt=500))


# 1 · The Seal ----------------------------------------------------------
def seal():
    front = card(BURG, f"""
      <image href="../assets/feather-gold.png" x="54" y="-8" width="34" height="45.5" transform="rotate(24 71.0 14.7)" filter="url(#emboss)"/>
      {monogram(42.5, 21, 8.2)}
      {t(42.5, 40.5, 5.4, "APNA", F, "Cormorant Garamond", 600, 3.2)}
      {t(42.5, 45.6, 1.75, "CATERING  ·  GLASGOW", F, ls=1.5, wgt=500)}""", label="Front · foil seal, blind-embossed feather")
    back = card(IVORY, f"""
      <image href="feather-on-ivory.png" x="-4" y="30" width="22" height="29.4" transform="rotate(-32 7 44)"/>
      {t(10, 14.5, 4.2, "Apna Catering", BURG2, "Cormorant Garamond", 500, .2, "start", 'font-style="italic"')}
      <path d="M10,17.4 H40" stroke="{F}" stroke-width=".2"/>
      {back_details(False)}
      {qr_block(62, 18, 13.5, False)}
      <image href="../assets/logo-256.png" x="73.5" y="4.5" width="7"/>""", label="Back · ivory")
    return ("1 · The Seal", "A round gold-foil monogram as the brand mark, APNA set large and spaced like a fashion house. "
            "The peacock feather is blind-embossed (raised, no ink) so it only shows when light catches it.", front, back)


# 2 · The Quill --------------------------------------------------------
def quill():
    front = card(IVORY, f"""
      <image href="feather-foil.png" x="3" y="3" width="32" height="42.8" transform="rotate(-14 19 24)"/>
      <path d="M33,10 V45" stroke="{F}" stroke-width=".18"/>
      {t(40, 26, 7.2, "Apna", BURG2, "Cormorant Garamond", 500, .3, "start", 'font-style="italic"')}
      {t(40.4, 32.4, 2.6, "C A T E R I N G", F, "Cinzel", 500, .6, "start")}
      {t(40.4, 43.5, 1.55, "WEDDINGS · EVENTS · CORPORATE", "#7c6a5a", ls=.55, anchor="start", wgt=500)}""",
                 label="Front · foil feather quill")
    back = card(BURG, f"""
      <image href="../assets/feather-gold.png" x="62" y="26" width="24" height="32.1" transform="rotate(22 74.0 42.1)" filter="url(#emboss)"/>
      {t(10, 14.5, 4.2, "Apna Catering", F, "Cormorant Garamond", 500, .2, "start", 'font-style="italic"')}
      <path d="M10,17.4 H40" stroke="{F}" stroke-width=".2"/>
      {back_details(True)}
      {qr_block(62, 18, 13.5, True)}""", label="Back · burgundy")
    return ("2 · The Quill", "Ivory front: a single fine-line peacock feather in foil becomes the brand symbol, beside an italic "
            "Apna wordmark, like a couture label. Burgundy back.", front, back)


# 3 · The Minimal -------------------------------------------------------
def minimal():
    front = card(BURG, f"""
      <image href="../assets/feather-gold.png" x="22" y="-14" width="44" height="58.9" transform="rotate(-12 44.0 15.4)" filter="url(#emboss)"/>
      {monogram(42.5, 27.5, 5.6)}""", label="Front · only the monogram")
    back = card(IVORY, f"""
      {t(42.5, 13.5, 4.6, "APNA", BURG2, "Cormorant Garamond", 600, 2.6)}
      {t(42.5, 17.6, 1.55, "WEDDING &amp; EVENT CATERERS", F, ls=1.2, wgt=500)}
      <path d="M36,20.2 H49" stroke="{F}" stroke-width=".2"/>
      {t(26, 27, 1.5, "TELEPHONE", F, ls=.9, wgt=500)}{t(26, 30.2, 2.3, "07818 478036", INK)}{t(26, 33.4, 2.3, "07828 218002", INK)}
      {t(26, 38.6, 1.5, "EMAIL", F, ls=.9, wgt=500)}{t(26, 41.8, 2.1, "hello@apnacatering.co.uk", INK)}
      {t(26, 46.6, 1.5, "ADDRESS", F, ls=.9, wgt=500)}{t(26, 49.6, 1.95, "4 Glebe Street, East Kilbride G74 4LY", INK)}
      <path d="M50,25 V50" stroke="{F}" stroke-width=".15"/>
      {qr_block(56.5, 26, 13, False).replace('y="' + str(26 + 13 + 4.6) + '"', 'y="44"')}""", label="Back · everything else")
    return ("3 · The Statement", "The boldest luxury move: the front carries nothing but the foil monogram on deep burgundy, "
            "with a large feather blind-embossed behind it. All information lives on the back.", front, back)


if __name__ == "__main__":
    rows = "".join(
        f'<section><div class="lab"><b>{n}</b><span>{d}</span></div><div class="cards">{f}{b}</div></section>'
        for n, d, f, b in (seal(), quill(), minimal()))
    html = (f'<!doctype html><html><head><meta charset="utf-8">{FONTS2}<style>*{{margin:0;padding:0}}'
            f'body{{background:radial-gradient(ellipse at 40% 20%,#EFE8DD,#DCD2C3);padding:12mm 14mm;width:290mm;font-family:Montserrat}}'
            f'section{{display:grid;grid-template-columns:52mm 1fr;gap:8mm;align-items:center;padding:9mm 0;border-top:.3mm solid #c9b48f}}'
            f'section:first-child{{border-top:0}}.lab b{{display:block;font:500 15pt "Cormorant Garamond";color:#4E0918}}'
            f'.lab span{{display:block;font:400 7.4pt/1.5 Montserrat;color:#5a4a42;margin-top:2mm}}'
            f'.cards{{display:flex;gap:10mm}}figcaption{{font:500 6pt Montserrat;letter-spacing:.2em;text-transform:uppercase;color:#8a7360;text-align:center;margin-top:4mm}}'
            f'</style></head><body>{rows}</body></html>')
    open(os.path.join(HERE, "brand.html"), "w").write(html)
    print("ok")
