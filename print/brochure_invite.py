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


def roses_bl(x, y, w, flip=""):
    h = w * 742 / 640
    tr = {"": "", "x": f"translate({2*x+w} 0) scale(-1 1)"}[flip]
    return f'<image href="assets/roses-bl.png" x="{x}" y="{y}" width="{w}" height="{h}" transform="{tr}"/>'


def p34_spread():
    W = DW + DF
    pics = ""
    for n, (x, y, w, h) in {1: (10, 30, 37, 104), 2: (53, 98, 45, 36), 4: (109, 98, 45, 36), 3: (160, 30, 37, 104)}.items():
        href, tag = photo(n)
        pics += framed(href, x, y, w, h, tag)
    art = svg(W, DH,
              f'<defs><linearGradient id="fadeB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E8CF" stop-opacity="0"/>'
              f'<stop offset=".3" stop-color="#F7E8CF" stop-opacity=".9"/><stop offset="1" stop-color="#F3DFC0" stop-opacity=".97"/></linearGradient></defs>'
              f'<rect x="-4" y="66" width="{W+8}" height="{DH-62}" fill="url(#fadeB)"/>'
              + ribbon(W / 2, 15, 84)
              + pics
              + wing_divider(75.5, 89, 22) + wing_divider(131.5, 89, 22)
              + roses_bl(0, DH - 40, 30) + roses_bl(W - 26, DH - 40, 30, "x")
              + f'<path d="M48,{DH-7} H{W-48}" stroke="url(#gold)" stroke-width=".4"/>')
    return f"""{art}
      <div class="rib" style="left:{W/2-42}mm;top:11.6mm;width:84mm">Wedding Banquets · Served with Love</div>
      <div class="box script" style="left:50mm;width:51mm;top:73mm;font-size:18pt">From our kitchen…</div>
      <div class="box script" style="left:106mm;width:51mm;top:73mm;font-size:18pt">…to your table</div>"""


def p5_special():
    events = ["Weddings", "Mehndi &amp; Sangeet", "Anniversaries", "Birthdays", "Corporate events", "Religious functions"]
    li = "".join(f"<li>{e}</li>" for e in events)
    oval = (f'<clipPath id="ov"><ellipse cx="{DF/2}" cy="58" rx="25" ry="17"/></clipPath>'
            f'<image href="../img/p-mandap-2400.webp" x="{DF/2-25}" y="41" width="50" height="34" preserveAspectRatio="xMidYMid slice" clip-path="url(#ov)"/>'
            f'<ellipse cx="{DF/2}" cy="58" rx="25" ry="17" fill="none" stroke="url(#gold)" stroke-width=".7"/>'
            f'<ellipse cx="{DF/2}" cy="58" rx="27.2" ry="19.2" fill="none" stroke="url(#gold)" stroke-width=".5" stroke-dasharray="0 1.25" stroke-linecap="round"/>')
    frame = (f'<rect x="6" y="6" width="{DF-12}" height="{DH-12}" fill="none" stroke="url(#gold)" stroke-width=".5"/>'
             f'<rect x="7.6" y="7.6" width="{DF-15.2}" height="{DH-15.2}" fill="none" stroke="url(#gold)" stroke-width=".2"/>')
    art = svg(DF, DH, frame + oval + wing_divider(DF / 2, 84, 24)
              + roses(DF - 54, -4, 54) + roses_bl(-6, DH - 52, 42)
              + roses(-8, -6, 30, "x") + roses_bl(DF - 30, DH - 34, 30, "x")
              + ribbon(DF / 2, 128, 64, 10))
    return f"""{art}
      <div class="t script" style="top:13mm;font-size:30pt">Celebrate</div>
      <div class="t caps" style="top:28.5mm;font-size:11.5pt;letter-spacing:.06em">Special Events</div>
      <div class="box body it" style="left:13mm;width:{DF-26}mm;top:87.5mm;font-size:9.4pt;line-height:1.35">
        Every family celebrates in its own way. We tailor each menu to your traditions, your guests and your day.</div>
      <ul class="evl">{li}</ul>
      <div class="rib" style="left:{DF/2-32}mm;top:125.6mm;width:64mm;font-size:6.6pt">Menus tailored to your day</div>"""


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
.evl{{position:absolute;left:16mm;right:12mm;top:104mm;list-style:none;columns:2;column-gap:4mm;font-family:'Cormorant Garamond',serif;font-weight:700;font-size:8.6pt;line-height:1.55;color:{INK};text-align:left}}
.evl li:before{{content:'\\25C6';color:#A8752A;font-size:5pt;margin-right:1.6mm;vertical-align:middle}}
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
