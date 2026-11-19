"""Generate a realistic peacock feather as SVG (print/assets/feather.svg).

The eye is not drawn as shapes: every barb is coloured segment by segment from the
eye's ring field, the way a real eyespot is built, so the ring edges come out fibrous.
render.js rasterises it to a transparent 900 x 3000 px PNG (~760 dpi at 100 mm tall).
"""
import math
import os
import random

W, H = 600, 2000
rnd = random.Random(2026)


def lerp(a, b, t):
    return a + (b - a) * t


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(c1, c2, t, jitter=0.0):
    a, b = hexrgb(c1), hexrgb(c2)
    j = rnd.uniform(-jitter, jitter)
    return "#%02x%02x%02x" % tuple(
        max(0, min(255, int(lerp(a[i], b[i], t) * (1 + j)))) for i in range(3))


# smooth 1-D noise for vane splits and length variation
PH = [(rnd.uniform(0, 6.3), rnd.uniform(.01, .09)) for _ in range(6)]


def noise(x):
    return sum(math.sin(x * f + p) for p, f in PH) / len(PH)


def rachis_x(y):
    t = (1960 - y) / 1880
    return 300 + 16 * math.sin(t * math.pi * 0.85)


CX, CY = rachis_x(370), 370      # eye centre
A, B = 150, 205                  # eye half-width / half-height


def eye_field(x, y):
    dx, dy = (x - CX) / A, (y - CY) / B
    d = math.hypot(dx, dy)
    # inner heart sits lower and has a notch at the top
    hx, hy = (x - CX) / A, (y - (CY + 32)) / B
    dh = math.hypot(hx, hy)
    ang = math.atan2(hx, -hy)  # 0 = towards the tip
    dh /= (1 - 0.30 * math.exp(-(ang ** 2) / 0.10))
    return d, dh


def eye_colour(x, y, j):
    d, dh = eye_field(x, y)
    if dh < 0.33:
        return mix("#0B1048", "#2438AE", (dh / 0.33) ** 1.5, j), 1.0
    if dh < 0.47:
        return mix("#1FA9B0", "#127F92", (dh - .33) / .14, j), 1.0
    if d < 0.52:
        return mix("#1F5F5C", "#3A5A2E", .5, j), 1.0
    if d < 0.66:
        return mix("#7A4219", "#B87A35", (d - .52) / .14, j), 1.0
    if d < 0.72:
        return mix("#D9B64C", "#C9A93F", (d - .66) / .06, j), 1.0
    if d < 0.95:
        return mix("#3E8F3A", "#86B03E", (d - .72) / .23, j), 1.0
    if d < 1.12:
        return mix("#9A8B3C", "#6F7F35", (d - .95) / .17, j), 0.75
    return None, 0


def poly(pts, col, w, op):
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    return f'<path d="{d}" stroke="{col}" stroke-width="{w:.2f}" opacity="{op:.2f}"/>'


herl, eye, sparkle = [], [], []

# ---------------------------------------------------------------- lower herl barbs
y = 1900.0
while y > 470:
    prog = min(1, (1900 - y) / 1360)            # 0 at base, 1 near eye
    for side in (-1, 1):
        if rnd.random() < 0.12:
            continue
        L = (150 + 150 * prog) * rnd.uniform(.8, 1.12)
        phi0 = math.radians(28 + 14 * prog + 8 * noise(y * .7 + side * 40))
        x0 = rachis_x(y)
        pts, s = [(x0, y)], 0.0
        px, py = x0, y
        while s < L:
            s += 6
            phi = phi0 + math.radians(26) * (s / L) ** 1.4
            px += side * 6 * math.cos(phi)
            py -= 6 * math.sin(phi)
            pts.append((px, py))
        n = len(pts)
        base_c = mix("#A88B3E", "#8C7A36", rnd.random(), .07)
        mid_c = mix("#6FA046", "#4F8E4A", rnd.random(), .08)
        tip_c = mix("#7DB38C", "#5FA07A", rnd.random(), .08)
        a1, a2 = n // 3, 2 * n // 3
        op = .9 - .25 * (1 - prog)
        herl.append(poly(pts[:a1 + 1], base_c, 2.0, op))
        herl.append(poly(pts[a1:a2 + 1], mid_c, 1.7, op * .9))
        herl.append(poly(pts[a2:], tip_c, 1.25, op * .7))
        # barbules: the fine hairs that make the lower feather look fluffy
        for k in range(max(2, n // 4), n - 1, 2):
            bx, by = pts[k]
            nx, ny = pts[k + 1]
            ang = math.atan2(ny - by, nx - bx)
            col = base_c if k < a1 else mid_c if k < a2 else tip_c
            fo = op * (.32 if k < a2 else .22)
            for sgn in (-1, 1):
                ln = rnd.uniform(6, 14) * (1 - .3 * k / n)
                ex = bx + ln * math.cos(ang + sgn * .65)
                ey = by + ln * math.sin(ang + sgn * .65)
                herl.append(f'<path d="M{bx:.1f},{by:.1f} L{ex:.1f},{ey:.1f}" stroke="{col}" stroke-width=".55" opacity="{fo:.2f}"/>')
    y -= 6.5 + 7 * (1 - prog) * rnd.uniform(.5, 1.6)

# ---------------------------------------------------------------- eye vane barbs
y = 600.0
while y > 100:
    t = (600 - y) / 500                 # 0 bottom of eye, 1 tip
    split = noise(y * 1.3) > 0.72       # occasional vane splits
    for side in (-1, 1):
        x0 = rachis_x(y) if y > 130 else rachis_x(130)
        phi0 = math.radians(18 + 62 * t ** 1.3 + (14 if split else 0) * side * 0 + rnd.uniform(-3, 3))
        if split and rnd.random() < .5:
            phi0 += math.radians(9)
        j = .07
        px, py, s = x0, y, 0.0
        run, run_col, run_op = [(px, py)], None, 1
        while s < 420:
            s += 3
            phi = phi0 + math.radians(14) * (s / 300)
            px += side * 3 * math.cos(phi)
            py -= 3 * math.sin(phi)
            col, op = eye_colour(px, py, j)
            d, _ = eye_field(px, py)
            if col is None or d > 1.04 + .09 * noise(y * 2 + side * 13) + rnd.uniform(0, .05):
                break
            if run_col is None:
                run_col, run_op = col, op
            if col != run_col and len(run) > 1:
                eye.append(poly(run + [(px, py)], run_col, 2.3, .95 * run_op))
                run, run_col, run_op = [(px, py)], col, op
            else:
                run.append((px, py))
                run_col = col
        if len(run) > 1 and run_col:
            eye.append(poly(run, run_col, 1.6, .75 * run_op))
    y -= 0.85

# ---------------------------------------------------------------- glitter
for _ in range(420):
    a = rnd.uniform(0, 2 * math.pi)
    r = math.sqrt(rnd.random()) * 1.02
    x, y = CX + A * r * math.cos(a), CY + B * r * math.sin(a)
    if rnd.random() < .35:
        x, y = rachis_x(y), y
        x += rnd.uniform(-90, 90)
        y = rnd.uniform(560, 1500)
    c = rnd.choice(["#F6DF9A", "#E8C66A", "#FFF0BF"])
    sparkle.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rnd.uniform(.5,1.6):.2f}" fill="{c}" opacity="{rnd.uniform(.25,.8):.2f}"/>')

# ---------------------------------------------------------------- quill (tapered)
quill = []
ys = [1965 - i * 9 for i in range(200) if 1965 - i * 9 > 140]
for i in range(len(ys) - 1):
    y1, y2 = ys[i], ys[i + 1]
    w = lerp(9, 1.6, (1965 - y1) / 1825)
    quill.append(f'<path d="M{rachis_x(y1):.1f},{y1} L{rachis_x(y2):.1f},{y2}" stroke="url(#qg)" stroke-width="{w:.2f}"/>')
    quill.append(f'<path d="M{rachis_x(y1)-w*.18:.1f},{y1} L{rachis_x(y2)-w*.18:.1f},{y2}" stroke="#FFF4D2" stroke-width="{w*.28:.2f}" opacity=".55"/>')

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs>
  <linearGradient id="qg" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#8A6A2A"/><stop offset=".5" stop-color="#E7CF8E"/><stop offset="1" stop-color="#9C7A34"/></linearGradient>
  <radialGradient id="glow" cx="{CX/W:.3f}" cy="{(CY+30)/H:.3f}" r=".09" gradientTransform="translate({CX/W:.3f} {(CY+30)/H:.3f}) scale(1 .3) translate({-CX/W:.3f} {-(CY+30)/H:.3f})">
    <stop offset="0" stop-color="#7FD9FF" stop-opacity=".35"/><stop offset="1" stop-color="#7FD9FF" stop-opacity="0"/></radialGradient>
</defs>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
  {''.join(herl)}
  {''.join(quill)}
  {''.join(eye)}
</g>
<ellipse cx="{CX}" cy="{CY+30}" rx="{A*.42}" ry="{B*.42}" fill="url(#glow)"/>
{''.join(sparkle)}
</svg>"""

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "feather.svg")
with open(out, "w") as f:
    f.write(svg)
print("feather.svg", len(herl) + len(eye) + len(sparkle), "elements,", round(len(svg) / 1e6, 1), "MB")
