"""Artwork matched to the client's maroon/gold envelope mockup (all vector, mm units).

- velvet_defs(): speckled velvet fills for the tone-on-tone florals, copper/teal/violet eye gradients
- floral(w, h, seed): non-repeating brocade of 8/12-petal daisies, lobed vine leaves, scroll stems, buds
- peacock(x, y, rot, s): flowing gold strand feather with lace bands, teal neck and copper egg eye
- paisley_lace(x, y, rot, s): dotted-border filigree paisley with a spiral tip
"""
import functools
import math
import random

GOLD = "url(#gold)"


def velvet_defs():
    r = random.Random(5)

    def speck(base, dark, light, n=46):
        dots = "".join(
            f'<circle cx="{r.uniform(0,4):.2f}" cy="{r.uniform(0,4):.2f}" r="{r.uniform(.05,.2):.2f}" fill="{dark}" opacity="{r.uniform(.4,.85):.2f}"/>'
            for _ in range(n))
        dots += "".join(
            f'<circle cx="{r.uniform(0,4):.2f}" cy="{r.uniform(0,4):.2f}" r="{r.uniform(.04,.12):.2f}" fill="{light}" opacity=".6"/>'
            for _ in range(n // 3))
        return f'<rect width="4" height="4" fill="{base}"/>{dots}'

    return f"""
  <pattern id="velvet" width="4" height="4" patternUnits="userSpaceOnUse">{speck('#A81F36', '#7C0A1D', '#C2394F')}</pattern>
  <pattern id="velvet2" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(37)">{speck('#94152B', '#6E0718', '#B02A40')}</pattern>
  <radialGradient id="blot"><stop offset="0" stop-color="#3E000A" stop-opacity=".5"/><stop offset="1" stop-color="#3E000A" stop-opacity="0"/></radialGradient>
  <radialGradient id="copper" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#F0BC92"/><stop offset=".55" stop-color="#C47F55"/><stop offset="1" stop-color="#7E4127"/></radialGradient>
  <radialGradient id="turq" cx=".5" cy=".45" r=".55"><stop offset=".55" stop-color="#4FCDDB"/><stop offset="1" stop-color="#1C8BA6"/></radialGradient>
  <radialGradient id="violet" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#6B55D8"/><stop offset=".5" stop-color="#2C2EA4"/><stop offset="1" stop-color="#12135E"/></radialGradient>
  <linearGradient id="neck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F9C82"/><stop offset="1" stop-color="#1B6A5A" stop-opacity="0"/></linearGradient>"""


# ------------------------------------------------------------------ florals
PETAL = "M0,-.2 C.21,-.3 .38,-.78 .21,-.95 C.11,-1.05 -.11,-1.05 -.21,-.95 C-.38,-.78 -.21,-.3 0,-.2Z"
LEAF = ("M0,0 C.18,-.12 .42,-.2 .4,-.42 C.52,-.5 .48,-.68 .32,-.7 C.34,-.86 .18,-1 0,-1.04 "
        "C-.18,-1 -.34,-.86 -.32,-.7 C-.48,-.68 -.52,-.5 -.4,-.42 C-.42,-.2 -.18,-.12 0,0Z")


def daisy(x, y, rad, rot, n=8):
    sx = 1 if n == 8 else .72
    sw = .26 / rad
    pet = "".join(
        f'<path d="{PETAL}" transform="rotate({rot + i*360/n:.1f}) scale({sx} 1)" stroke="#640313" stroke-width="{sw:.3f}"/>'
        f'<path d="M0,-.32 L0,-.82" transform="rotate({rot + i*360/n:.1f})" stroke="#7A0A1C" stroke-width="{sw*.8:.3f}" fill="none"/>'
        for i in range(n))
    centre = (f'<circle r=".24" fill="#7A0A1C"/><circle r=".15" fill="none" stroke="#C2394F" stroke-width="{sw:.3f}"/>'
              f'<circle r=".05" fill="#C2394F"/>')
    return f'<g transform="translate({x:.2f} {y:.2f}) scale({rad:.2f})" fill="url(#velvet)">{pet}{centre}</g>'


def leaf(x, y, L, ang):
    sw = .22 / L
    veins = "M0,-.04 L0,-.92 M0,-.3 L.24,-.46 M0,-.3 L-.24,-.46 M0,-.58 L.2,-.74 M0,-.58 L-.2,-.74"
    return (f'<g transform="translate({x:.2f} {y:.2f}) rotate({ang:.1f}) scale({L:.2f})">'
            f'<path d="{LEAF}" fill="url(#velvet2)" stroke="#640313" stroke-width="{sw:.3f}"/>'
            f'<path d="{veins}" fill="none" stroke="#6E0718" stroke-width="{sw:.3f}"/></g>')


def scroll(x, y, ang, L, r):
    pts, th, k = [(x, y)], math.radians(ang), 0.0
    px, py, s, side = x, y, 0.0, r.choice((-1, 1))
    while s < L:
        s += .5
        k = side * (0.02 + 0.5 * (s / L) ** 3)
        th += k
        px += .5 * math.cos(th)
        py += .5 * math.sin(th)
        pts.append((px, py))
    d = "M" + " L".join(f"{a:.2f},{b:.2f}" for a, b in pts)
    return f'<path d="{d}" fill="none" stroke="#9E1A30" stroke-width=".65" stroke-linecap="round"/>'


@functools.lru_cache(maxsize=None)
def floral(w, h, seed):
    r = random.Random(seed)
    placed = []  # (x, y, radius)

    def free(x, y, rad, k=.92):
        return all(math.hypot(x - a, y - b) > (rad + c) * k for a, b, c in placed)

    big, mid, small, leaves, scrolls, blots = [], [], [], [], [], []
    for _ in range(900):
        x, y, rad = r.uniform(-8, w + 8), r.uniform(-8, h + 8), r.uniform(8, 10.8)
        if free(x, y, rad, 1.12):
            placed.append((x, y, rad)); big.append((x, y, rad))
    for _ in range(1500):
        x, y, rad = r.uniform(-6, w + 6), r.uniform(-6, h + 6), r.uniform(4.2, 6.2)
        if free(x, y, rad, 1.0):
            placed.append((x, y, rad)); mid.append((x, y, rad))
    for x, y, rad in big + mid:
        for _ in range(r.choice((1, 2, 2, 3))):
            a = r.uniform(0, 360)
            L = rad * r.uniform(.7, 1.0)
            lx = x + math.cos(math.radians(a)) * rad * .78
            ly = y + math.sin(math.radians(a)) * rad * .78
            leaves.append(leaf(lx, ly, L, a + 90))
        if r.random() < .6:
            a = r.uniform(0, 360)
            sx = x + math.cos(math.radians(a)) * rad * .95
            sy = y + math.sin(math.radians(a)) * rad * .95
            scrolls.append(scroll(sx, sy, a, r.uniform(6, 11), r))
    for _ in range(2500):
        x, y, rad = r.uniform(-4, w + 4), r.uniform(-4, h + 4), r.uniform(1.6, 2.6)
        if free(x, y, rad, 1.0):
            placed.append((x, y, rad)); small.append((x, y, rad))
    for _ in range(int(w * h / 1400)):
        blots.append(f'<ellipse cx="{r.uniform(0,w):.1f}" cy="{r.uniform(0,h):.1f}" rx="{r.uniform(14,30):.1f}" '
                     f'ry="{r.uniform(10,22):.1f}" fill="url(#blot)"/>')

    flowers = "".join(daisy(x, y, rad, r.uniform(0, 45), r.choice((8, 8, 12))) for x, y, rad in big)
    flowers += "".join(daisy(x, y, rad, r.uniform(0, 45), r.choice((8, 12))) for x, y, rad in mid)
    buds = "".join(daisy(x, y, rad, r.uniform(0, 72), 5) for x, y, rad in small)
    art = "".join(leaves) + "".join(scrolls) + flowers + buds
    return (f'<rect x="-10" y="-10" width="{w+20}" height="{h+20}" fill="#760515"/>'
            f'<g transform="translate(.28 .34)" opacity=".55" filter="none"><g fill="#3A000A" stroke="#3A000A">'
            f'{art.replace("url(#velvet2)", "#3A000A").replace("url(#velvet)", "#3A000A")}</g></g>'
            f'{art}{"".join(blots)}')


# ------------------------------------------------------------------ peacock feather
def _egg(rx, ry, cy=0.0, n=72):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        pts.append((rx * math.cos(t) * (1 + .13 * math.sin(t)), cy + ry * math.sin(t)))
    return "M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in pts) + "Z"


def peacock(x, y, rot, s=1.0, seed=4):
    r = random.Random(seed)
    RX, RY = 10.5, 13.0
    strands, lace, teal = [], [], []
    for side in (-1, 1):
        n = 30 if side > 0 else 26
        for j in range(n):
            u = (j + r.uniform(0, .6)) / n
            d = RX + .8 + (15 if side > 0 else 13) * u
            y0 = 9 + u * 58
            ytop = -(RY + 3 + 24 * u ** .8) * (1.3 if side > 0 else .75) - r.uniform(0, 3)
            flare = (.1 + u) * (.75 if side > 0 else .38)
            ph = r.uniform(0, 6.3)
            pts = []
            yy = y0
            while yy > ytop:
                if yy > 0:
                    sh = math.sin(math.pi / 2 * min(1, (y0 - yy) / (y0 + 1))) ** .75
                else:
                    sh = 1 + flare * (-yy / RY) ** 1.35
                xx = side * (d * sh + .25 * math.sin(yy * .11 + ph))
                pts.append((xx, yy))
                yy -= .8
            # hook curl at the end
            ex, ey = pts[-1]
            ang = math.atan2(ey - pts[-3][1], ex - pts[-3][0])
            for k in range(6):
                ang += side * .3
                ex += .45 * math.cos(ang)
                ey += .45 * math.sin(ang)
                pts.append((ex, ey))
            dd = "M" + " L".join(f"{a:.2f},{b:.2f}" for a, b in pts)
            w = r.uniform(.32, .58)
            strands.append(f'<path d="{dd}" stroke="{GOLD}" stroke-width="{w:.2f}"/>')
            strands.append(f'<path class="color" d="{dd}" stroke="#FFF1C6" stroke-width="{w*.28:.2f}" opacity=".55" transform="translate(-.08 -.1)"/>')
            if u < .3:
                low = [p for p in pts if p[1] > RY * .6]
                if len(low) > 3:
                    teal.append('<path class="color" d="M' + " L".join(f"{a:.2f},{b:.2f}" for a, b in low) +
                                f'" stroke="#2F9A82" stroke-width="{w*.8:.2f}" opacity=".85"/>')
            if (side > 0 and j in (int(n * .5), int(n * .78))) or (side < 0 and j == int(n * .66)):
                core = pts[:-6]
                cd = "M" + " L".join(f"{a:.2f},{b:.2f}" for a, b in core)
                for off in (-.95, .95):
                    od = "M" + " L".join(f"{a + side*off:.2f},{b:.2f}" for a, b in core)
                    lace.append(f'<path d="{od}" stroke="{GOLD}" stroke-width=".26"/>')
                lace.append(f'<path d="{cd}" stroke="{GOLD}" stroke-width=".62" stroke-dasharray="0 1.25"/>')
                lace.append(f'<path d="{cd}" stroke="{GOLD}" stroke-width=".3" stroke-dasharray=".7 2.1" '
                            f'transform="translate({side*.5} 0)"/>')

    fib = "".join(
        f'<path d="M{RX*.5*math.cos(a)*(1+.13*math.sin(a)):.2f},{RY*.5*math.sin(a):.2f} '
        f'L{RX*.97*math.cos(a)*(1+.13*math.sin(a)):.2f},{RY*.97*math.sin(a):.2f}" stroke="#8A4A2B" stroke-width=".11" opacity=".55"/>'
        for a in [i * math.pi / 48 for i in range(96)])
    eye = f"""
      <g class="color">
        <path d="M-4.5,{RY*.8} C-2.5,{RY+5} -1,{RY+10} 0,{RY+16} C1,{RY+10} 2.5,{RY+5} 4.5,{RY*.8}Z" fill="url(#neck)"/>
        <path d="{_egg(RX*1.14, RY*1.1, .6)}" fill="#2C8A6C"/>
        <path d="{_egg(RX, RY)}" fill="url(#copper)"/>
        {fib}
        <circle cx="0" cy="2.7" r="5.7" fill="url(#turq)"/>
        <circle cx="0" cy="2.5" r="4.25" fill="url(#violet)"/>
        <path d="M0,4.6 C1.2,5.6 1.5,6.9 .9,7.6 L-.9,7.6 C-1.5,6.9 -1.2,5.6 0,4.6Z" fill="#45C6D6"/>
        <path d="M-2.6,.4 A3.2,3.2 0 0 1 .4,-1.1" fill="none" stroke="#fff" stroke-width=".35" opacity=".35"/>
      </g>
      <path d="{_egg(RX, RY)}" fill="none" stroke="{GOLD}" stroke-width=".5"/>
      <circle cx="0" cy="2.7" r="5.7" fill="none" stroke="#E8FBFF" stroke-width=".18" opacity=".7" class="color"/>"""
    quill = (f'<path d="M0,{RY} C.8,30 1.2,50 2.6,80" stroke="{GOLD}" stroke-width=".85"/>'
             f'<path class="color" d="M-.2,{RY} C.6,30 1,50 2.4,80" stroke="#FFF1C6" stroke-width=".25" opacity=".55"/>')
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s})" fill="none" stroke-linecap="round" stroke-linejoin="round">'
            f'{"".join(strands)}{"".join(teal)}{"".join(lace)}{quill}{eye}</g>')


# ------------------------------------------------------------------ paisley
PAISLEY_D = ("M100,295 C35,295 0,240 5,180 C10,110 60,70 95,50 C120,35 130,15 120,5 "
             "C112,-2 100,5 105,15 C150,25 200,90 195,170 C190,245 155,295 100,295Z")


def paisley_lace(x, y, rot, s, seed=8):
    r = random.Random(seed)

    def sc(f, cy=200):
        return f'transform="translate(100 {cy}) scale({f}) translate(-100 -{cy})"'

    fil = []
    for _ in range(46):
        a, rr = r.uniform(0, 2 * math.pi), math.sqrt(r.random())
        px, py = 100 + 55 * rr * math.cos(a), 205 + 62 * rr * math.sin(a)
        k = r.uniform(.7, 1.3)
        rotc = r.uniform(0, 360)
        fil.append(f'<path transform="translate({px:.1f} {py:.1f}) rotate({rotc:.0f}) scale({k:.2f})" '
                   f'd="M0,0 c4,-7 13,-5 11,3 c-1,5 -7,5 -7,0" stroke-width="2.4"/>')
    for _ in range(40):
        a, rr = r.uniform(0, 2 * math.pi), math.sqrt(r.random())
        fil.append(f'<circle cx="{100 + 58*rr*math.cos(a):.1f}" cy="{205 + 66*rr*math.sin(a):.1f}" r="{r.uniform(1.5,3):.1f}" fill="{GOLD}" stroke="none"/>')
    # spiral at the tip
    sp, th, rad = [], 0.0, 26.0
    while rad > 2:
        sp.append((92 + rad * math.cos(th), 26 + rad * math.sin(th)))
        th += .18
        rad *= .975
    spd = "M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in sp)
    return f"""<g transform="translate({x} {y}) rotate({rot}) scale({s}) translate(-100 -214)" fill="none" stroke="{GOLD}" stroke-linecap="round" stroke-linejoin="round">
      <path d="{PAISLEY_D}" {sc(1.1)} stroke-width="7.5" stroke-dasharray="0 12.5"/>
      <path d="{PAISLEY_D}" stroke-width="2.2"/>
      <path d="{PAISLEY_D}" {sc(.9)} stroke-width="11" stroke-dasharray="1.3 4"/>
      <path d="{PAISLEY_D}" {sc(.9)} stroke-width="3.5" stroke-dasharray="0 7" transform="translate(0 0)"/>
      <path d="{PAISLEY_D}" {sc(.8)} stroke-width="2"/>
      <path d="{PAISLEY_D}" {sc(.73,205)} stroke-width="5" stroke-dasharray="0 9"/>
      {''.join(fil)}
      <path d="{spd}" stroke-width="3"/>
      <path d="{spd}" stroke-width="6" stroke-dasharray="0 10" transform="translate(92 26) scale(1.22) translate(-92 -26)"/>
    </g>"""
