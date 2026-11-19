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
    return ('<g>' + f'<defs><linearGradient id="rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9B1A30"/>'
            f'<stop offset=".5" stop-color="#7A0F22"/><stop offset="1" stop-color="#5C0816"/></linearGradient></defs>'
            f'<path d="M{x0-n},{cy-h/2} H{x1+n} L{x1},{cy} L{x1+n},{cy+h/2} H{x0-n} L{x0},{cy} Z" fill="url(#rib)"/>'
            f'<path d="M{x0-n+1.2},{cy-h/2+.9} H{x1+n-1.2} M{x0-n+1.2},{cy+h/2-.9} H{x1+n-1.2}" stroke="url(#gold)" stroke-width=".35"/>' + '</g>')


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
    return (f'<g><rect x="{x-1.6}" y="{y-1.6}" width="{w+3.2}" height="{h+3.2}" fill="#FFF8EC"/>'
            f'<image href="{href}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="{pos}"/>'
            f'<rect x="{x-1.6}" y="{y-1.6}" width="{w+3.2}" height="{h+3.2}" fill="none" stroke="url(#gold)" stroke-width=".55"/>'
            f'<rect x="{x-.5}" y="{y-.5}" width="{w+1}" height="{h+1}" fill="none" stroke="url(#gold)" stroke-width=".2"/>{t}</g>')


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
    art = svg(DW, DH, rose_frame(DW, 3) + wing_divider(DW / 2, 41, 22) + feather(DW / 2, 116, 22, 72))
    return f"""{art}
      <div class="t caps" style="top:16mm;font-size:6pt;letter-spacing:.24em">Our story</div>
      <div class="t script" style="top:20.5mm;font-size:32pt">Love for Food</div>
      <div class="box calli" style="left:14mm;width:{DW-28}mm;top:46mm;font-size:10.4pt;line-height:1.36">
        Welcome to Apna Catering, Glasgow's wedding &amp; event caterers with a passion for fine food. We specialise in quality
        Indian &amp; Asian delicacies, blessing weddings with an inventive menu of delights. With an incredibly experienced team
        we uphold the values of our customers, creating meal plans of true prestige, and have built a reputation for excellence
        in hospitality.<span style="display:block;height:1.8mm"></span>
        We specialise in Sikh, Hindu and Muslim wedding catering. If you are inspired by authentic Indian food, allow
        Apna Catering to share that passion with you.
      </div>
      <div class="t script" style="top:123mm;font-size:16pt">With love, Apna Catering</div>"""


def roses_bl(x, y, w, flip=""):
    h = w * 742 / 640
    tr = {"": "", "x": f"translate({2*x+w} 0) scale(-1 1)"}[flip]
    return f'<image href="assets/roses-bl.png" x="{x}" y="{y}" width="{w}" height="{h}" transform="{tr}"/>'


def p34_spread():
    W = DW + DF
    pics = ""
    for n, (x, y, w, h) in {1: (12, 28, 35, 92), 2: (55, 84, 41, 36), 4: (111, 84, 41, 36), 3: (160, 28, 35, 92)}.items():
        href, tag = photo(n)
        pics += framed(href, x, y, w, h, tag)
    art = svg(W, DH,
              f'<defs><linearGradient id="fadeB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E8CF" stop-opacity="0"/>'
              f'<stop offset=".45" stop-color="#F7E8CF" stop-opacity=".55"/><stop offset="1" stop-color="#F3DFC0" stop-opacity=".92"/></linearGradient></defs>'
              f'<rect x="-4" y="52" width="{W+8}" height="{DH-48}" fill="url(#fadeB)"/>'
              + f'<defs><filter id="soft"><feGaussianBlur stdDeviation="2.2"/></filter></defs>'
              + f'<rect x="54" y="57" width="99" height="25" rx="5" fill="#FBF0DC" fill-opacity=".9" filter="url(#soft)"/>'
              + f'<rect x="56" y="122" width="95" height="11" rx="4" fill="#FBF0DC" fill-opacity=".85" filter="url(#soft)"/>'
              + rose_frame(W) + ribbon(W / 2, 17, 84) + pics
              + wing_divider(75.5, 76, 22) + wing_divider(131.5, 76, 22))
    return f"""{art}
      <div class="rib" style="left:{W/2-42}mm;top:13.6mm;width:84mm">Wedding Banquets · Served with Love</div>
      <div class="box script" style="left:50mm;width:51mm;top:61mm;font-size:19pt">From our kitchen…</div>
      <div class="box script" style="left:106mm;width:51mm;top:61mm;font-size:19pt">…to your table</div>
      <div class="box script" style="left:50mm;width:{W-100}mm;top:125.5mm;font-size:15pt">Celebrating love, one feast at a time</div>"""


M = 7          # frame inset (same on every page)
TOPW, BOTW = 34, 28   # corner rose widths


def rose_frame(W, left_bleed=0):
    """Gold double frame with four mirrored rose corners locked to the frame corners."""
    th = TOPW * 470 / 758
    bh = BOTW * 742 / 640
    o = M + 3   # push the cut edge of each cluster out into the bleed
    frame = ('<g>' + f'<rect x="{M}" y="{M}" width="{W-2*M}" height="{DH-2*M}" fill="none" stroke="url(#gold)" stroke-width=".6"/>'
             f'<rect x="{M+1.6}" y="{M+1.6}" width="{W-2*M-3.2}" height="{DH-2*M-3.2}" fill="none" stroke="url(#gold)" stroke-width=".22"/>' + '</g>')
    corners = (roses(M - o, M - o, TOPW, "x") + roses(W - M + o - TOPW, M - o, TOPW)
               + roses_bl(M - o, DH - M + o - bh, BOTW) + roses_bl(W - M + o - BOTW, DH - M + o - bh, BOTW, "x"))
    _cl = f"rf{int(W)}{left_bleed}"
    clip = f'<clipPath id="{_cl}"><rect x="{-left_bleed}" y="-3" width="{W+left_bleed}" height="{DH+6}"/></clipPath>'
    return frame + clip + f'<g clip-path="url(#{_cl})">{corners}</g>'


def gold_ring(cx, cy, r):
    return ('<g>' + f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#FFF8EC" stroke="url(#gold)" stroke-width=".6"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r+1.9}" fill="none" stroke="url(#gold)" stroke-width=".5" stroke-dasharray="0 1.25" stroke-linecap="round"/>' + '</g>')


def p5_special():
    events = ["Weddings", "Mehndi &amp; Sangeet", "Engagements", "Anniversaries", "Birthdays", "Corporate events"]
    li = "".join(f"<li>{e}</li>" for e in events)
    cx = DF / 2
    oval = ('<g>' + f'<clipPath id="ov"><ellipse cx="{cx}" cy="63" rx="29" ry="20"/></clipPath>'
            f'<image href="../img/p-mandap-2400.webp" x="{cx-29}" y="43" width="58" height="40" preserveAspectRatio="xMidYMid slice" clip-path="url(#ov)"/>'
            f'<ellipse cx="{cx}" cy="63" rx="29" ry="20" fill="none" stroke="url(#gold)" stroke-width=".75"/>'
            f'<ellipse cx="{cx}" cy="63" rx="31.3" ry="22.3" fill="none" stroke="url(#gold)" stroke-width=".55" stroke-dasharray="0 1.25" stroke-linecap="round"/>' + '</g>')
    art = svg(DF, DH, rose_frame(DF, 3) + wing_divider(cx, 38.5, 22) + oval + wing_divider(cx, 90, 22))
    return f"""{art}
      <div class="t script" style="top:15mm;font-size:31pt">Celebrate</div>
      <div class="t caps" style="top:28.5mm;font-size:10.5pt;letter-spacing:.12em">Special Events</div>
      <div class="box body it" style="left:15mm;width:{DF-30}mm;top:93mm;font-size:9.8pt;line-height:1.32">
        Every family celebrates in its own way. We tailor each menu to your traditions and your day.</div>
      <ul class="evl">{li}</ul>
      <div class="t script" style="top:126mm;font-size:14pt">Menus tailored to your day</div>"""


def p6_memorable():
    cx = DW / 2      # centred on the page
    L, Wd = cx - 32, 64
    art = svg(DW, DH, wing_divider(cx, 41, 26) + gold_ring(cx, 61.5, 17.5) + wing_divider(cx, 84, 26))
    col = f"left:{L}mm;width:{Wd}mm"
    return f"""{art}
      <div class="box script" style="{col};top:15.5mm;font-size:32pt">It's your day</div>
      <div class="box caps" style="{col};top:30.5mm;font-size:11pt;letter-spacing:.1em">Make it memorable</div>
      <img class="logo" src="assets/logo-256.png" style="left:{cx-15}mm;top:46.5mm;width:30mm">
      <div class="box caps" style="{col};top:88mm;font-size:7pt;letter-spacing:.22em">Book your celebration</div>
      <div class="box body" style="{col};top:92.5mm;font-size:14.5pt;font-weight:700;color:{MAROON};line-height:1.25">07818 478036<br>07828 218002</div>
      <div class="box body" style="{col};top:106.5mm;font-size:9.5pt">hello@apnacatering.co.uk</div>
      <div class="box script" style="{col};top:111mm;font-size:16pt">apnacatering.co.uk</div>"""


def extra_roses(PW, SH):
    """Soft-edged mirrored rose mound that completes the page-6 bouquet; base runs into the bleed."""
    w = 64
    h = w * 1110 / 1040
    return (f'<img src="assets/roses-mound.png" style="position:absolute;left:{PW-21-w/2}mm;top:{SH+1-h}mm;'
            f'width:{w}mm;height:{h}mm">')


def fold_bouquet(fold_x, PW, SH):
    """Rose pyramid centred on the back/cover fold, at exactly the cover image's scale and position:
    its right half coincides with the cover's own roses, its left half is their mirror."""
    mmpp = (PW + B) / 2048
    top = -((PW + B) * 1.5 - SH) * 0.3 + 1700 * mmpp
    return (f'<img class="span" src="assets/roses-fold.png" style="position:absolute;left:{fold_x - 1000*mmpp:.3f}mm;top:{top:.3f}mm;'
            f'width:{2000*mmpp:.3f}mm;height:{1372*mmpp:.3f}mm">')


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
.evl{{position:absolute;left:19mm;right:12mm;top:104.5mm;list-style:none;columns:2;column-gap:4mm;font-family:'Cormorant Garamond',serif;font-weight:700;font-size:9.4pt;line-height:1.5;color:{INK};text-align:left}}
.evl li:before{{content:'\\25C6';color:#A8752A;font-size:5pt;margin-right:1.6mm;vertical-align:middle}}
"""
    outside = f"""
<section class="sheet" id="outside">
  <img class="bgimg" src="assets/cream-bg.jpg">
  {place(B, DF, p5_special())}
  <div style="position:absolute;left:{B+FW}mm;top:0;width:{PW}mm;height:{SH}mm;overflow:hidden;
       background:radial-gradient(ellipse 75% 55% at 62% 50%,#FCE7CB 0%,#F8DDBE 55%,#F2D0AC 100%)">
    <img src="assets/cover-mirror.png" style="position:absolute;left:{PW-(PW+B)}mm;top:{-((PW+B)*1.5-SH)*0.3:.3f}mm;width:{PW+B}mm;height:{(PW+B)*1.5}mm">
  </div>
  {place(B + FW, DW, p6_memorable())}
  <img class="full" src="assets/invitation-cover.jpg" style="left:{B+FW+PW}mm;width:{PW+B}mm;object-position:50% 30%">
  {fold_bouquet(B + FW + PW, PW, SH)}
</section>"""
    inside = f"""
<section class="sheet" id="inside">
  <img class="bgimg" src="assets/cream-bg.jpg">
  <img class="full" src="../img/occ-anniv-3840.webp" style="left:{B+PW}mm;width:{PW+FW+B}mm;object-position:50% 45%">
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
