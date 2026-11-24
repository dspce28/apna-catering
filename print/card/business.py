"""Standard business card 85 x 55 mm (+3 mm bleed), brochure theme, antique gold foil.

python3 print/card/business.py && node print/card/render_business.js
Front: burgundy, gold-foil frame + wordmark, colour logo, tonal gold peacock feather.
Back: ivory, contacts + address, QR to the website, feather watermark, small rose corner.
"""
import os
import segno

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, B = 85, 55, 3
BURG, IVORY, GOLD, INK, MAROON = "#5E0B1E", "#F8F2E7", "#B08D57", "#3B1A1E", "#7A0F22"
URL = "https://apnacatering.co.uk"


def qr(x, y, size, color):
    m = segno.make(URL, error="m").matrix
    s = size / len(m)
    return f'<g fill="{color}" shape-rendering="crispEdges">' + "".join(
        f'<rect x="{x+c*s:.3f}" y="{y+r*s:.3f}" width="{s+.02:.3f}" height="{s+.02:.3f}"/>'
        for r, row in enumerate(m) for c, v in enumerate(row) if v) + "</g>"


def side(name, foil=False):
    G = "#000" if foil else "url(#gf)"
    tg = "#000" if foil else GOLD
    hide = ' style="display:none"' if foil else ""
    no = lambda c: "none" if foil else c
    if name == "front":
        bg = BURG
        body = f"""
  <image href="feather-on-burgundy.png" x="46" y="-6" width="44" height="59" transform="rotate(32 68 24)"{hide}/>
  <rect x="4" y="4" width="77" height="47" fill="none" stroke="{G}" stroke-width=".3"/>
  <rect x="5.1" y="5.1" width="74.8" height="44.8" fill="none" stroke="{G}" stroke-width=".12"/>
  <circle cx="42.5" cy="19" r="8.4" fill="none" stroke="{G}" stroke-width=".3"/>
  <image href="../assets/logo-256.png" x="35" y="11.5" width="15" height="15"{hide}/>
  <text x="42.5" y="36.4" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="6.2" letter-spacing="1.7" fill="{tg}">APNA CATERING</text>
  <path d="M35.5,39 H49.5" stroke="{G}" stroke-width=".2"/>
  <circle cx="42.5" cy="39" r=".55" fill="{G}"/>
  <text x="42.5" y="43.4" text-anchor="middle" font-family="Montserrat" font-size="1.9" letter-spacing=".85" fill="{tg}">WEDDING &amp; EVENT CATERERS · GLASGOW</text>"""
    else:
        bg = IVORY
        lab = lambda y, t: f'<text x="9" y="{y}" font-family="Montserrat" font-weight="500" font-size="1.75" letter-spacing=".9" fill="{tg}">{t}</text>'
        val = lambda y, t, s=2.6, w=500: f'<text x="9" y="{y}" font-family="Montserrat" font-weight="{w}" font-size="{s}" fill="{no(INK)}">{t}</text>'
        body = f"""
  <image href="feather-on-ivory.png" x="-6" y="16" width="36" height="48" transform="rotate(-38 12 40)"{hide}/>
  <image href="../assets/roses-tr.png" x="62" y="-3" width="26" height="16.1"{hide}/>
  <rect x="4" y="4" width="77" height="47" fill="none" stroke="{G}" stroke-width=".22"/>
  <text x="9" y="13.4" font-family="Cormorant Garamond" font-weight="600" font-size="4.6" letter-spacing="1.1" fill="{no(MAROON)}">APNA CATERING</text>
  <path d="M9,15.6 H31" stroke="{G}" stroke-width=".2"/>
  {lab(20.6,'CALL')}{val(24,'07818 478036')}{val(27.3,'07828 218002')}
  {lab(31.8,'EMAIL')}{val(35,'hello@apnacatering.co.uk',2.35,400)}
  {lab(39.5,'VISIT')}{val(42.7,'4 Glebe Street, East Kilbride',2.35,400)}{val(45.7,'Glasgow G74 4LY',2.35,400)}
  <path d="M52,18 V46" stroke="{G}" stroke-width=".2"/>
  <rect x="57.3" y="19.3" width="19.4" height="19.4" fill="#fff"{hide}/>
  <rect x="57.3" y="19.3" width="19.4" height="19.4" fill="none" stroke="{G}" stroke-width=".25"/>
  {'' if foil else qr(58.3, 20.3, 17.4, BURG)}
  <text x="67" y="42.4" text-anchor="middle" font-family="Montserrat" font-weight="500" font-size="1.7" letter-spacing=".8" fill="{tg}">SCAN TO VISIT</text>
  <text x="67" y="45.3" text-anchor="middle" font-family="Montserrat" font-size="1.9" fill="{no(INK)}">apnacatering.co.uk</text>"""
    bgr = "" if foil else f'<rect x="{-B}" y="{-B}" width="{W+2*B}" height="{H+2*B}" fill="{bg}"/>'
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-B} {-B} {W+2*B} {H+2*B}" width="{W+2*B}mm" height="{H+2*B}mm">
<defs><linearGradient id="gf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCC08A"/><stop offset=".45" stop-color="{GOLD}"/>
<stop offset=".75" stop-color="#8C6B3A"/><stop offset="1" stop-color="#CDAE74"/></linearGradient></defs>
{bgr}{body}
<rect class="guides" x="0" y="0" width="{W}" height="{H}" fill="none" stroke="#FF00FF" stroke-width=".2"/>
<rect class="guides" x="3" y="3" width="{W-6}" height="{H-6}" fill="none" stroke="#00B4D8" stroke-width=".15" stroke-dasharray="1 .8"/>
</svg>"""


FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&'
         'family=Montserrat:wght@400;500&display=block" rel="stylesheet">')


def page(svgs, guides):
    w, h = W + 2 * B, H + 2 * B
    css = (f"*{{margin:0;padding:0}}@page{{size:{w}mm {h}mm;margin:0}}body{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}"
           f".p{{width:{w}mm;height:{h}mm;break-after:page;overflow:hidden}}.p:last-child{{break-after:auto}}" + ("" if guides else ".guides{display:none}"))
    return f'<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>{css}</style></head><body>' + "".join(f'<div class="p">{s}</div>' for s in svgs) + "</body></html>"


def mockup(front, back):
    def card(s, rot):
        inner = s.split(">", 1)[1].rsplit("</svg>", 1)[0].replace('class="guides"', 'class="guides" display="none"')
        return (f'<svg viewBox="0 0 {W} {H}" width="{W}mm" height="{H}mm" style="transform:rotate({rot}deg);'
                f'filter:drop-shadow(0 1.6mm 2.4mm rgba(40,10,10,.35));border-radius:.6mm">{inner}</svg>')
    cap = lambda t: f'<div style="font:500 7pt Montserrat;letter-spacing:.22em;color:#8a7360;text-align:center;margin-top:4mm">{t}</div>'
    return (f'<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>*{{margin:0;padding:0}}'
            f'body{{background:#E9E1D5;padding:14mm 16mm;width:max-content}}.r{{display:flex;gap:16mm}}</style></head><body><div class="r">'
            f'<div>{card(front,0)}{cap("FRONT")}</div><div>{card(back,0)}{cap("BACK")}</div></div></body></html>')


if __name__ == "__main__":
    f, b = side("front"), side("back")
    open(os.path.join(HERE, "biz-print.html"), "w").write(page([f, b], False))
    open(os.path.join(HERE, "biz-proof.html"), "w").write(page([f, b], True))
    open(os.path.join(HERE, "biz-foil.html"), "w").write(page([side("front", True), side("back", True)], False))
    open(os.path.join(HERE, "biz-mockup.html"), "w").write(mockup(f, b))
    print("built")
