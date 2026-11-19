"""A6 roll-fold brochure in the theme of the client's invitation (page 1 = the invitation itself).

python3 print/brochure_invite.py && node print/render_a6.js invite
Pages: 1 cover (invitation) | 2 Love for Food + peacock feather | 3+4 wedding table spread |
       5 Special Events | 6 Make it memorable + Apna logo
"""
import os

from brochure_a6 import B, DF, DH, DW, PHOTOS, VERSIONS, gold_defs
from mockup_art import wing_divider

HERE = os.path.dirname(os.path.abspath(__file__))
MAROON = "#7A0F22"
INK = "#4A1A1E"
FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Parisienne&family=Cinzel:wght@500;700&'
         'family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=block" rel="stylesheet">')


def svg(w, h, body):
    return f'<svg class="art" viewBox="0 0 {w} {h}" width="{w}mm" height="{h}mm" overflow="visible">{body.replace("url(#gold)", "url(#goldDk)")}</svg>'


def ribbon(cx, cy, w, h=9):
    x0, x1 = cx - w / 2, cx + w / 2
    n = 3.2
    return (f'<defs><linearGradient id="rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9B1A30"/>'
            f'<stop offset=".5" stop-color="#7A0F22"/><stop offset="1" stop-color="#5C0816"/></linearGradient></defs>'
            f'<path d="M{x0-n},{cy-h/2} H{x1+n} L{x1},{cy} L{x1+n},{cy+h/2} H{x0-n} L{x0},{cy} Z" fill="url(#rib)"/>'
            f'<path d="M{x0-n+1.2},{cy-h/2+.9} H{x1+n-1.2} M{x0-n+1.2},{cy+h/2-.9} H{x1+n-1.2}" stroke="url(#gold)" stroke-width=".35"/>')


def gold_box(x, y, w, h):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="1.2" fill="#FFF8EC" fill-opacity=".78" stroke="url(#gold)" stroke-width=".6"/>'
            f'<rect x="{x+1.4}" y="{y+1.4}" width="{w-2.8}" height="{h-2.8}" rx=".8" fill="none" stroke="url(#gold)" stroke-width=".22"/>'
            + "".join(f'<circle cx="{cx}" cy="{cy}" r=".9" fill="url(#gold)"/>' for cx, cy in
                      [(x, y), (x + w, y), (x, y + h), (x + w, y + h)]))


def photo(n):
    real = os.path.join(HERE, "photos", f"photo-{n}.jpg")
    return (f"photos/photo-{n}.jpg", "") if os.path.exists(real) else \
        (f"photos/_placeholder/photo-{n}.jpg", f"REPLACE photo-{n}.jpg")


def framed(href, x, y, w, h, tag="", pos="xMidYMid slice"):
    t = (f'<rect x="{x+.8}" y="{y+h-4.6}" width="{w-1.6}" height="3.8" fill="#E0245E"/>'
         f'<text x="{x+1.6}" y="{y+h-1.8}" font-size="2" font-family="Arial" font-weight="700" fill="#fff">{tag}</text>') if tag else ""
    return (f'<rect x="{x-1.6}" y="{y-1.6}" width="{w+3.2}" height="{h+3.2}" fill="#FFF8EC"/>'
            f'<image href="{href}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="{pos}"/>'
            f'<rect x="{x-1.6}" y="{y-1.6}" width="{w+3.2}" height="{h+3.2}" fill="none" stroke="url(#gold)" stroke-width=".55"/>'
            f'<rect x="{x-.5}" y="{y-.5}" width="{w+1}" height="{h+1}" fill="none" stroke="url(#gold)" stroke-width=".2"/>{t}')


def roses(x, y, w, flip=""):
    h = w * 470 / 758
    tr = {"": "", "x": f"translate({2*x+w} 0) scale(-1 1)", "y": f"translate(0 {2*y+h}) scale(1 -1)",
          "xy": f"translate({2*x+w} {2*y+h}) scale(-1 -1)"}[flip]
    return f'<image href="assets/roses-tr.png" x="{x}" y="{y}" width="{w}" height="{h}" transform="{tr}"/>'


def feather(x, y, w, rot):
    h = w * 578 / 432
    return (f'<image href="assets/feather-gold.png" x="{-w/2}" y="{-h/2}" width="{w}" height="{h}" '
            f'transform="translate({x} {y}) rotate({rot})"/>')


# ------------------------------------------------------------------ pages (design coords, A6)
def p2_love():
    art = svg(DW, DH, roses(46, -3, 56) + wing_divider(DW / 2 - 6, 39, 24) + feather(19, 124, 30, -18))
    return f"""{art}
      <div class="t caps" style="top:13mm;font-size:6pt;letter-spacing:.24em;left:-12mm">Our story</div>
      <div class="t script" style="top:18mm;font-size:34pt;left:-12mm">Love for Food</div>
      <div class="box calli" style="left:10mm;width:85mm;top:44mm">
        Welcome to Apna Catering, Glasgow's wedding &amp; event caterers with a passion for fine food. We specialise in quality
        Indian &amp; Asian delicacies, blessing weddings with an inventive menu of delights. With an incredibly experienced team
        we uphold the values of our customers, creating meal plans of true prestige, and have built a reputation for excellence
        in hospitality.<br><span style="display:block;height:2.2mm"></span>
        We specialise in Sikh, Hindu and Muslim wedding catering. If you are inspired by authentic Indian food, allow
        Apna Catering to share that passion with you.
      </div>
      <div class="box script" style="left:42mm;width:56mm;top:127mm;font-size:17pt">With love, Apna Catering</div>"""


def p34_spread():
    W = DW + DF
    insets = ""
    slots = [(9, 99, 38, 34, "img/thali-2400.webp", ""), (54, 99, 38, 34, None, 1),
             (114, 99, 38, 34, None, 4), (159, 99, 38, 34, "img/p-biryanibowl-2400.webp", "")]
    for x, y, w, h, src, n in slots:
        if src:
            insets += framed("../" + src, x, y, w, h)
        else:
            href, tag = photo(n)
            insets += framed(href, x, y, w, h, tag)
    art = svg(W, DH,
              f'<defs><linearGradient id="fadeB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E8CF" stop-opacity="0"/>'
              f'<stop offset=".35" stop-color="#F7E8CF" stop-opacity=".88"/><stop offset="1" stop-color="#F3DFC0" stop-opacity=".97"/></linearGradient></defs>'
              f'<rect x="-4" y="78" width="{W+8}" height="{DH-74}" fill="url(#fadeB)"/>'
              + ribbon(52.5, 15, 64) + ribbon(W - 51, 15, 64) + insets
              + wing_divider(52.5, 92, 26) + wing_divider(W - 51, 92, 26)
              + f'<path d="M8,{DH-7} H{W-8}" stroke="url(#gold)" stroke-width=".4"/>')
    return f"""{art}
      <div class="rib" style="left:{52.5-32}mm;top:11.6mm;width:64mm">Wedding Banquets</div>
      <div class="rib" style="left:{W-51-32}mm;top:11.6mm;width:64mm">Served with Love</div>
      <div class="box script" style="left:5mm;width:95mm;top:81mm;font-size:17pt">From our kitchen…</div>
      <div class="box script" style="left:{W-98.5}mm;width:95mm;top:81mm;font-size:17pt">…to your table</div>"""


def p5_special():
    art = svg(DF, DH, roses(DF - 50, -3, 50) + wing_divider(DF / 2, 41, 26))
    return f"""{art}
      <div class="t script" style="top:12mm;font-size:30pt">Catering</div>
      <div class="t caps" style="top:27mm;font-size:13pt;letter-spacing:.05em">Special Events</div>
      <div class="t bul" style="top:46mm">Weddings &nbsp;◆&nbsp; Anniversaries &nbsp;◆&nbsp; Birthdays</div>
      <div class="box body" style="left:10mm;width:{DF-20}mm;top:55mm">
        At Apna Catering we display a hunger to provide a sophisticated catering service to the Asian community, crafting
        innovative menus that are admirably diverse.<span style="display:block;height:2mm"></span>
        With Asian weddings we understand that religious traditions must be adhered to, with each family celebrating in
        their own fashion. We offer our unique services to Muslims, Sikhs, Hindus and those who simply adore the beauty of
        Asian cuisine.
      </div>
      {svg(DF, DH, framed('../img/occ-anniv-2400.webp', 12, 104, 36, 28) + framed('../img/occ-cake-2400.webp', 54, 104, 36, 28))}"""


def p6_memorable():
    art = svg(DW, DH, roses(DW - 50, -3, 53) + wing_divider(DW / 2, 41, 26)
              + f'<circle cx="{DW/2}" cy="87" r="16.5" fill="#FFF8EC" stroke="url(#gold)" stroke-width=".55"/>'
              + f'<circle cx="{DW/2}" cy="87" r="18.3" fill="none" stroke="url(#gold)" stroke-width=".45" stroke-dasharray="0 1.25" stroke-linecap="round"/>'
              + ribbon(DW / 2, 124, 70, 13))
    return f"""{art}
      <div class="t script" style="top:12mm;font-size:30pt">It's your day</div>
      <div class="t caps" style="top:27mm;font-size:12.5pt;letter-spacing:.05em">Make it memorable</div>
      <div class="t bul" style="top:46mm">Special events &nbsp;◆&nbsp; Corporate events<br>Event management</div>
      <div class="box body it" style="left:12mm;width:{DW-24}mm;top:58.5mm">Celebrate your special event with the beautiful food of Apna Catering.</div>
      <img class="logo" src="assets/logo-256.png" style="left:{DW/2-14.5}mm;top:72.5mm;width:29mm">
      <div class="rib" style="left:{DW/2-35}mm;top:118.6mm;width:70mm;line-height:1.35">Book your celebration<br>
        <span style="font-size:7.8pt;letter-spacing:.04em">07818 478036 · 07828 218002</span></div>
      <div class="t body" style="top:134mm;font-size:8pt">hello@apnacatering.co.uk · apnacatering.co.uk</div>"""


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
.full{{position:absolute;top:0;height:{SH}mm;object-fit:cover}}
.content{{position:absolute;transform-origin:0 0}}
.art{{position:absolute;left:0;top:0}}
.t{{position:absolute;left:0;right:0;text-align:center}}
.box{{position:absolute;text-align:center}}
.script{{font-family:'Great Vibes',cursive;color:{MAROON};line-height:1.1}}
.caps{{font-family:'Cinzel',serif;font-weight:700;color:{MAROON};text-transform:uppercase}}
.calli{{font-family:'Parisienne',cursive;color:{INK};font-size:11.3pt;line-height:1.36}}
.body{{font-family:'Cormorant Garamond',serif;font-weight:600;color:{INK};font-size:9.4pt;line-height:1.45}}
.it{{font-style:italic;font-size:10pt;color:{MAROON}}}
.bul{{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:700;color:#8A5A18;font-size:9.6pt;line-height:1.5}}
.rib{{position:absolute;text-align:center;font-family:'Cinzel',serif;font-weight:700;color:#FBEFD6;font-size:7.2pt;letter-spacing:.08em;text-transform:uppercase}}
.logo{{position:absolute}}
"""
    outside = f"""
<section class="sheet" id="outside">
  <img class="bgimg" src="assets/cream-bg.jpg">
  {place(B, DF, p5_special())}
  {place(B + FW, DW, p6_memorable())}
  <img class="full" src="assets/invitation-cover.jpg" style="left:{B+FW+PW}mm;width:{PW+B}mm;object-position:50% 30%">
</section>"""
    inside = f"""
<section class="sheet" id="inside">
  <img class="bgimg" src="assets/cream-bg.jpg">
  <img class="full" src="../img/p-banquet-3840.webp" style="left:{B+PW}mm;width:{PW+FW+B}mm;object-position:50% 40%">
  {place(B, DW, p2_love())}
  {place(B + PW, DW + DF, p34_spread())}
</section>"""
    html = (f'<!doctype html><html><head><meta charset="utf-8"><title>Invitation-theme brochure {version}</title>{FONTS}'
            f'<style>{css}</style></head><body>{gold_defs()}{outside}{inside}</body></html>')
    with open(os.path.join(HERE, f"brochure-invite-{version}.html"), "w") as f:
        f.write(html)
    print(f"brochure-invite-{version}.html", SW, "x", SH)


if __name__ == "__main__":
    for v in VERSIONS:
        build(v)
