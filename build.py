#!/usr/bin/env python3
"""Assemble the static pages from the partials in src/sections.

Run:  python3 build.py
Writes index.html, about.html, services.html, menus.html and contact.html
at the project root. Edit the partials, not the generated pages.
"""
from pathlib import Path

ROOT = Path(__file__).parent
S = ROOT / "src" / "sections"


def part(name):
    return (S / f"{name}.html").read_text()


PAGES = [
    ("index.html", "Home"),
    ("about.html", "About"),
    ("services.html", "Services"),
    ("menus.html", "Menus"),
    ("contact.html", "Contact"),
]


def ss(name, sizes="100vw"):
    return (f'src="img/{name}.webp" srcset="img/{name}.webp 1200w, img/{name}-2400.webp 2400w, '
            f'img/{name}-3840.webp 3840w" sizes="{sizes}"')


def nav(active):
    links = "".join(
        f'<a href="{href}"{" aria-current=\"page\"" if href == active else ""}>{label}</a>'
        for href, label in PAGES
    )
    drawer = "".join(
        f'<a href="{href}"{" aria-current=\"page\"" if href == active else ""}><small>0{i + 1}</small>{label}</a>'
        for i, (href, label) in enumerate(PAGES)
    )
    return f'''<div class="progress" aria-hidden="true"></div>

<header class="nav" id="top">
  <a href="index.html" class="brand" aria-label="Apna Catering home">
    <img class="brand-logo" src="img/logo-256.png" alt="Apna Catering Glasgow" width="56" height="56">
    <span class="brand-text"><span class="brand-mark">Apna</span><span class="brand-sub">Catering · Est. 1975</span></span>
  </a>
  <nav class="nav-links" aria-label="Main">{links}</nav>
  <a href="contact.html#enquire" class="btn btn-gold btn-sm magnetic">Check your date</a>
  <button class="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
</header>

<div class="drawer" aria-hidden="true">
  {drawer}
  <a href="contact.html#enquire" class="btn btn-gold">Check your date</a>
</div>
'''


# ---------------------------------------------------------------------------
# Floral line art (generated so every petal is symmetric)
# ---------------------------------------------------------------------------
import math as _m


def _rot(x, y, cx, cy, a):
    r = _m.radians(a)
    dx, dy = x - cx, y - cy
    return cx + dx * _m.cos(r) - dy * _m.sin(r), cy + dx * _m.sin(r) + dy * _m.cos(r)


def _petal(cx, cy, length, width, angle, inner=0.0):
    """Pointed lotus petal from (cx,cy) outward, as an SVG path."""
    pts = [(cx, cy - inner), (cx - width, cy - inner - length * 0.45), (cx - width * 0.35, cy - inner - length * 0.85),
           (cx, cy - inner - length), (cx + width * 0.35, cy - inner - length * 0.85), (cx + width, cy - inner - length * 0.45)]
    p = [_rot(x, y, cx, cy, angle) for x, y in pts]
    f = lambda q: f"{q[0]:.1f} {q[1]:.1f}"
    return (f"M{f(p[0])} C{f(p[1])} {f(p[2])} {f(p[3])} C{f(p[4])} {f(p[5])} {f(p[0])}Z")


def _flower(cx, cy, n, length, width, inner=0, start=0):
    return "".join(f'<path d="{_petal(cx, cy, length, width, start + i * 360 / n, inner)}"/>' for i in range(n))


def floral_tile():
    t = 180
    c = t / 2
    parts = []
    # centre lotus: two layers of petals + seed ring
    parts.append(_flower(c, c, 8, 30, 11, 6))
    parts.append(_flower(c, c, 8, 18, 6, 4, 22.5))
    parts.append(f'<circle cx="{c}" cy="{c}" r="6"/><circle cx="{c}" cy="{c}" r="2"/>')
    parts.append("".join(f'<circle cx="{c + 44 * _m.cos(_m.radians(a)):.1f}" cy="{c + 44 * _m.sin(_m.radians(a)):.1f}" r="1.6"/>' for a in range(0, 360, 30)))
    # corner rosettes (tile seamlessly)
    for x, y in [(0, 0), (t, 0), (0, t), (t, t)]:
        parts.append(_flower(x, y, 6, 20, 8, 3, 30))
        parts.append(f'<circle cx="{x}" cy="{y}" r="4"/>')
    # buds at the edge midpoints, pointing inward, with two leaves each
    for (x, y, a) in [(c, 0, 180), (c, t, 0), (0, c, 90), (t, c, 270)]:
        parts.append(f'<path d="{_petal(x, y, 22, 7, a)}"/>')
        for da in (-55, 55):
            parts.append(f'<path d="{_petal(x, y, 16, 4, a + da)}"/>')
    # vines from the lotus towards each corner, with small leaves
    for sx, sy in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
        x0, y0 = c + sx * 36, c + sy * 36
        x1, y1 = c + sx * 64, c + sy * 64
        cxp, cyp = c + sx * 60, c + sy * 36
        parts.append(f'<path d="M{x0:.1f} {y0:.1f} Q{cxp:.1f} {cyp:.1f} {x1:.1f} {y1:.1f}"/>')
        mx, my = c + sx * 52, c + sy * 44
        ang = _m.degrees(_m.atan2(sy, sx)) + 90
        parts.append(f'<path d="{_petal(mx, my, 10, 3.5, ang - 50)}"/><path d="{_petal(mx, my, 10, 3.5, ang + 50)}"/>')
    return t, "".join(parts)


_T, _TILE = floral_tile()


CURTAIN = """<div class="loader is-on" aria-hidden="true">
  <div class="ld-veil"></div>
  <div class="ld-env">
    <div class="ld-back"></div>
    <div class="ld-letter"><small>You are invited</small><i>Apna Catering</i><small>Glasgow &middot; Since 1975</small></div>
    <div class="ld-front"></div>
    <div class="ld-flap"></div>
    <div class="ld-seal"><div class="l"><img src="img/logo-256.png" alt=""></div><div class="r"><img src="img/logo-256.png" alt=""></div></div>
  </div>
  <canvas class="ld-powder"></canvas>
  <img class="ld-logo" src="img/logo-256.png" alt="" width="132" height="132">
</div>
"""

FILIGREE = ('<div class="filigree" aria-hidden="true">\n    <svg width="100%" height="100%"><defs>'
            f'<pattern id="floral" width="{_T}" height="{_T}" patternUnits="userSpaceOnUse" patternTransform="scale(1.45)">'
            f'<g fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">{_TILE}</g></pattern>'
            '</defs><rect width="100%" height="100%" fill="url(#floral)"/></svg>\n  </div>\n  <div class="lamp-glow" aria-hidden="true"></div>')


def page_hero(kicker, title_html, lede, img, alt):
    return f'''<!-- PAGE HERO -->
<section class="page-hero">
  <div class="ph-media"><img {ss(img)} alt="{alt}" fetchpriority="high"></div>
  {FILIGREE}
  <div class="wrap ph-copy">
    <p class="crumbs"><a href="index.html">Home</a><span>/</span>{kicker}</p>
    <h1 class="ph-title" data-split>{title_html}</h1>
    <p class="ph-lede">{lede}</p>
  </div>
  <div class="ph-scroll" aria-hidden="true"><span></span></div>
</section>
'''


def cta(title_html="Let’s make it <em>memorable.</em>", text="Tell us your date, your guests and your traditions. We’ll take care of the feast.", img="p-banquet"):
    return f'''<!-- CTA -->
<section class="cta-band">
  <div class="cta-media"><img {ss(img, "100vw")} alt="" loading="lazy"></div>
  <div class="wrap cta-inner">
    <p class="eyebrow reveal-up">It’s your day</p>
    <h2 class="h2 reveal-up" data-words>{title_html}</h2>
    <p class="reveal-up">{text}</p>
    <div class="cta-actions reveal-up">
      <a href="contact.html#enquire" class="btn btn-gold magnetic">Check your date <span class="arrow">→</span></a>
      <a href="https://wa.me/447818478036" target="_blank" rel="noopener" class="btn btn-ghost magnetic">WhatsApp us</a>
    </div>
  </div>
</section>
'''


def more(href, label):
    return f'<div class="wrap more-link reveal-up"><a href="{href}" class="link-arrow">{label} →</a></div>'


WHY = '''<!-- WHY APNA -->
<section class="why section">
  <div class="wrap">
    <p class="eyebrow center reveal-up">Why families choose us</p>
    <h2 class="h2 center reveal-up" data-words>Three promises, <em>since 1975.</em></h2>
    <div class="why-grid">
      <article class="why-card reveal-up"><span class="why-no">I</span><svg><use href="#sp-leaf"/></svg><h3>Always fresh ingredients</h3><p>We only work with the best food suppliers, including small local family farms, so every dish starts with the freshest ingredients.</p></article>
      <article class="why-card reveal-up" style="--d:.1s"><span class="why-no">II</span><svg><use href="#sp-anise"/></svg><h3>Friendly, professional staff</h3><p>Our team is our most valuable asset: warm, experienced and calm on the busiest day of your year.</p></article>
      <article class="why-card reveal-up" style="--d:.2s"><span class="why-no">III</span><svg><use href="#sp-cardamom"/></svg><h3>The full package</h3><p>Food, beverages, full china service, staff and equipment. Choose a sample menu or create your own with us.</p></article>
    </div>
  </div>
</section>
'''

FOOTER_LINKS = '<div><h4>Explore</h4>' + "".join(f'<a href="{h}">{l}</a>' for h, l in PAGES) + '</div>'


def footer():
    f = part("footer")
    start = f.index('<div><h4>Visit</h4>')
    end = f.index('</div>', start) + len('</div>')
    f = f[:start] + FOOTER_LINKS + f[end:]
    return f


def shell(active, title, description, body, preload=""):
    head = part("head").replace("{{title}}", title).replace("{{description}}", description).replace("{{preload}}", preload)
    page_class = active.replace(".html", "")
    return (head + f'<body class="page-{page_class}">\n' + CURTAIN + part("sprites") + nav(active)
            + "\n<main>\n" + body + "\n</main>\n\n" + footer() + "\n" + part("mobilebar")
            + '\n<script src="main.js" defer></script>\n</body>\n</html>\n')


HERO_PRELOAD = '<link rel="preload" as="image" href="img/hero.webp" imagesrcset="img/hero.webp 1200w, img/hero-2400.webp 2400w, img/hero-3840.webp 3840w" imagesizes="(max-width: 900px) 82vw, 480px">'


def hero_with_filigree():
    h = part("hero")
    return h.replace('<div class="hero-glow" aria-hidden="true"></div>', '<div class="hero-glow" aria-hidden="true"></div>\n  ' + FILIGREE, 1)


def build():
    pages = {
        "index.html": shell(
            "index.html",
            "Apna Catering — Indian Wedding & Event Caterers, Glasgow · Since 1975",
            "Apna Catering: Glasgow's Indian & Asian wedding caterers since 1975. Sikh, Hindu and Muslim weddings, engagements, birthdays and corporate events across Scotland.",
            hero_with_filigree() + part("marquee") + part("heritage") + more("about.html", "Read our story")
            + part("occasions") + part("menus") + more("menus.html", "Explore menus and build your own")
            + part("quotes") + cta(),
            HERO_PRELOAD,
        ),
        "about.html": shell(
            "about.html",
            "Our Story — Apna Catering, Glasgow · Since 1975",
            "Since 1975 Apna Catering has cooked for Glasgow's biggest celebrations. Meet the family kitchen behind the food.",
            page_hero("Our story", "Love for food,<br><em>since 1975.</em>", "A Glasgow family kitchen that has grown up with the city's Asian community, one celebration at a time.", "p-tablesetting", "An elegant table set with fine china and silver cutlery")
            + part("heritage") + WHY + part("process") + part("quotes")
            + cta("Your celebration, <em>our kitchen.</em>", "Fifty years of weddings, walimas and reunions. Let’s plan yours.", "p-toast"),
        ),
        "services.html": shell(
            "services.html",
            "Our Services — Wedding & Event Catering, Glasgow | Apna Catering",
            "Sikh, Hindu and Muslim wedding catering, live stations, dessert buffets, bar service and complete event management across Scotland.",
            page_hero("Our services", "Every tradition,<br><em>beautifully served.</em>", "Weddings, mehndis, walimas, birthdays and corporate events, with live stations and full event service from one team.", "p-banquet", "A banquet hall dressed with crystal, linen and flowers")
            + part("traditions") + part("experiences")
            + cta("Theatre your guests <em>will remember.</em>", "From chaat stalls to chocolate fountains, tell us what you imagine.", "p-chefflame"),
        ),
        "menus.html": shell(
            "menus.html",
            "Menus — Signature Indian Wedding Menus | Apna Catering Glasgow",
            "Four signature Indian wedding menus, an interactive menu builder and a gallery from the Apna Catering kitchen.",
            page_hero("Our menus", "Start with a classic,<br><em>make it yours.</em>", "Four signature menus our families return to, and a builder to design your own in sixty seconds.", "p-darkcurry", "Curry served in a dark ceramic bowl")
            + part("menus") + part("builder") + part("gallery")
            + cta("Your menu is <em>ready to taste.</em>", "Send us your selection and we’ll arrange a tasting.", "p-patisserie"),
        ),
        "contact.html": shell(
            "contact.html",
            "Contact — Check Your Date | Apna Catering Glasgow",
            "Check your date with Apna Catering. Call 07818 478036 or 07828 218002, email hello@apnacatering.co.uk, or send an enquiry in four quick steps.",
            page_hero("Contact", "Is your date<br><em>still available?</em>", "Share a few details and we’ll confirm availability and arrange a tasting.", "p-mandap", "A floral wedding mandap")
            + part("enquire").replace('Is your date<br><em>still available?</em>', 'Tell us about <em>your celebration.</em>'),
        ),
    }
    for name, html in pages.items():
        (ROOT / name).write_text(html)
        print("wrote", name, len(html) // 1024, "KB")


if __name__ == "__main__":
    build()
