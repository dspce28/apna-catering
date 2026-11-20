"""Builds the Apna Catering site (Direction A, "Ivory Palace") into static HTML pages.

Run: python3 build.py
"""
import os
import re
import shutil
import sys

THEME = sys.argv[1] if len(sys.argv) > 1 else "a"
OUT = "durbar" if THEME == "b" else "."

PAGES = [("index.html", "Home"), ("about.html", "About"), ("services.html", "Weddings & Events"),
         ("menus.html", "Menus"), ("contact.html", "Contact")]
FONTS = ("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400"
         + ("&family=Playfair+Display:ital,wght@0,400;0,500;1,400" if THEME == "b" else "")
         + "&family=Manrope:wght@400;500;600&display=swap")


def img(name, sizes="100vw", alt="", lazy=True, extra=""):
    """An <img> with whatever responsive widths exist for this image."""
    cands = [(f"img/{name}.webp", 1200)] + [(f"img/{name}-{w}.webp", w) for w in (2400, 2720, 3840)
                                            if os.path.exists(f"img/{name}-{w}.webp")]
    srcset = ", ".join(f"{p} {w}w" for p, w in cands)
    return (f'<img src="img/{name}.webp" srcset="{srcset}" sizes="{sizes}" alt="{alt}"'
            f'{" loading=\"lazy\"" if lazy else " fetchpriority=\"high\""}{extra}>')


def arch(name, alt="", sizes="(max-width: 900px) 90vw, 40vw", wipe=True, cls="", d=0):
    attrs = f' data-wipe style="--d:{d}s"' if wipe else ""
    return f'<div class="arch {cls}"{attrs}>{img(name, sizes, alt)}</div>'


def rose(pos):
    if THEME == "b":
        return ""
    src = {"tr": "rose-tr", "tl": "rose-tl", "bl": "rose-bl", "br": "rose-br"}[pos]
    return f'<img class="rose {pos}" src="img/{src}.webp" alt="" aria-hidden="true">'


def head(title, desc, preload=""):
    return f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="{"#1c0509" if THEME == "b" else "#faf5ec"}">
<link rel="icon" type="image/png" href="img/favicon.png">
<link rel="apple-touch-icon" href="img/logo-256.png">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="img/b-hall-2400.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
{preload}
<link rel="stylesheet" href="site.css">{'<link rel="stylesheet" href="durbar.css">' if THEME == "b" else ""}
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"FoodEstablishment","name":"Apna Catering","servesCuisine":["Indian","Punjabi"],"foundingDate":"1975","telephone":["+447818478036","+447828218002"],"email":"hello@apnacatering.co.uk","areaServed":"Scotland","address":{{"@type":"PostalAddress","addressLocality":"Glasgow","addressCountry":"GB"}},"url":"https://apnacatering.co.uk"}}
</script>
</head>
'''


def nav(active):
    links = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == active else ""}>{l}</a>' for h, l in PAGES[1:])
    drawer = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == active else ""}>{l}</a>' for h, l in PAGES)
    return f'''<header class="nav">
  <a href="index.html" class="brand" aria-label="Apna Catering, home"><img src="img/logo-256.png" alt="" width="52" height="52"><span>Apna<small>Catering · Est. 1975</small></span></a>
  <nav class="nav-links" aria-label="Main">{links}</nav>
  <a href="contact.html" class="btn">Get a quote</a>
  <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
</header>
<nav class="drawer" aria-label="Mobile">{drawer}<a href="contact.html" class="btn">Get a quote <i>→</i></a></nav>
'''


def footer():
    return '''<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <img src="img/logo-256.png" alt="Apna Catering" width="96" height="96">
      <p class="foot-tag">It’s your day.<br><em>Make it memorable with us.</em></p>
    </div>
    <div><h5>Explore</h5><a href="about.html">Our story</a><a href="services.html">Weddings &amp; events</a><a href="menus.html">Menus</a><a href="contact.html">Get a quote</a></div>
    <div><h5>Talk to us</h5><a href="tel:+447818478036">07818 478036</a><a href="tel:+447828218002">07828 218002</a><a href="mailto:hello@apnacatering.co.uk">hello@apnacatering.co.uk</a><a href="https://wa.me/447818478036" target="_blank" rel="noopener">WhatsApp</a><a href="https://www.instagram.com/desiglasgowcaterer/" target="_blank" rel="noopener">Instagram</a></div>
  </div>
  <div class="wrap foot-base"><span>© <span id="yr">2026</span> Apna Catering, Glasgow</span><span>Indian wedding &amp; event caterers since 1975</span></div>
</footer>
<nav class="mbar" aria-label="Quick contact"><a href="tel:+447818478036">Call</a><a href="https://wa.me/447818478036" target="_blank" rel="noopener">WhatsApp</a><a href="contact.html" class="go">Quote</a></nav>
<a class="picks" href="contact.html"><b>0</b>Dishes picked · enquire</a>
'''


PALPICK = """<div class="palpick" role="group" aria-label="Colour"><span>Colour</span>
<button data-pal="emerald" style="background:#0c3a2c" aria-label="Emerald"></button><button data-pal="wine" style="background:#4e0c1a" aria-label="Wine"></button><button data-pal="sapphire" style="background:#14265c" aria-label="Sapphire"></button><button data-pal="aubergine" style="background:#381444" aria-label="Aubergine"></button><button data-pal="peacock" style="background:#064650" aria-label="Peacock"></button><button data-pal="onyx" style="background:#0e0e10" aria-label="Onyx"></button><output></output></div>
<script>
(function(){var h=document.documentElement,names={emerald:'Emerald',wine:'Wine',sapphire:'Sapphire',aubergine:'Aubergine',peacock:'Peacock',onyx:'Onyx'};
function set(p,save){if(!names[p])p='emerald';h.setAttribute('data-pal',p);
document.querySelectorAll('.palpick button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.pal===p)});
var o=document.querySelector('.palpick output');if(o)o.textContent=names[p];
var m=document.querySelector('meta[name=theme-color]');if(m)m.content=getComputedStyle(h).getPropertyValue('--on-gold').trim();
if(save)try{localStorage.setItem('apna-pal',p)}catch(e){}
window.dispatchEvent(new Event('resize'));}
var q=new URLSearchParams(location.search).get('pal'),s=null;try{s=localStorage.getItem('apna-pal')}catch(e){}
set(q||s||'emerald',!!q);
document.querySelectorAll('.palpick button').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.pal,true)})});})();
</script>
"""


def page(active, title, desc, body, preload=""):
    return (head(title, desc, preload) + f'<body>\n{nav(active)}<main>\n{body}\n</main>\n{footer()}{PALPICK + B_SPINE if THEME == "b" else ""}'
            '<script src="site.js" defer></script>' + ('<script src="durbar.js" defer></script>' if THEME == "b" else '') + '\n</body>\n</html>\n')


def cta(title="Let’s plan <em>your celebration.</em>", text="Tell us your date, guests and traditions. We reply within one working day and invite you to a tasting.", rose_pos="bl"):
    return f'''<section class="sec cta sand">
  {rose(rose_pos)}
  <div class="wrap center">
    <p class="eyebrow" data-fade>It’s your day</p>
    <h2 class="h2" data-fade>{title}</h2>
    <p class="lede" data-fade>{text}</p>
    <div class="ctas" data-fade><a href="contact.html" class="btn">Check your date <i>→</i></a><a href="https://wa.me/447818478036" class="btn line" target="_blank" rel="noopener">WhatsApp us</a></div>
  </div>
</section>'''


def phero(crumb, title, lede, image, alt):
    return f'''<section class="phero">
  <div class="hero-media">{img(image, "100vw", alt, lazy=False)}</div>
  <div class="wrap">
    <p class="crumbs" data-fade><a href="index.html">Home</a> &nbsp;/&nbsp; {crumb}</p>
    <h1 class="display" data-fade style="--d:.1s">{title}</h1>
    <p class="lede" data-fade style="--d:.25s">{lede}</p>
  </div>
</section>'''


# ---------------------------------------------------------------- content
EVENTS = [
    ("p-henna", "Sikh weddings", "Anand Karaj", "From the Milni tea at the Gurdwara doors and a vegetarian langar-style breakfast to the full Punjabi reception that night.", "Plan your Anand Karaj", "Sikh wedding"),
    ("b-mandap", "Hindu weddings", "Saat Phere", "Haldi brunch, sangeet chaat stalls and a pure vegetarian, satvik or Jain wedding feast, planned with your family day by day.", "Plan your Hindu wedding", "Hindu wedding"),
    ("px-chaat", "Mehndi &amp; Sangeet", "Live stations", "Chaat counters, a live tandoor and late-night chai that keep the dance floor full until the last song.", "Plan your mehndi", "Mehndi / Sangeet"),
    ("p-banquet", "Receptions", "The grand evening", "Silver buffets or plated service for up to a thousand guests, with fine china, crystal and our own waiting team.", "Plan your reception", "Sikh wedding"),
    ("p-toast", "Celebrations", "Every milestone", "Rokas, birthdays, anniversaries and office Diwali and Vaisakhi parties, from the same family kitchen.", "Plan your event", "Private party"),
]

MENU = [
    ("starters", "Chaat &amp; starters", "Served on arrival and at the mehndi", "px-chaat", [
        ("Gol Gappe", "Crisp puri, spiced potato, tamarind and mint water", "Veg · Live"),
        ("Papdi Chaat", "Yoghurt, chutneys, pomegranate and sev", "Veg"),
        ("Punjabi Samosa", "Spiced potato and pea with mint chutney", "Veg"),
        ("Amritsari Fish", "Gram-flour batter, ajwain and lemon", "Halal")]),
    ("tandoor", "Live tandoor &amp; grill", "Cooked in front of your guests", "px-tandoori", [
        ("Chicken Tikka", "Overnight yoghurt and Kashmiri chilli marinade", "Halal · Live"),
        ("Paneer Tikka", "Charred peppers, onion and chaat masala", "Veg · Live"),
        ("Seekh Kebab", "Minced lamb, ginger, green chilli and coriander", "Halal · Live"),
        ("Haryali Tikka", "Mint, coriander and green chilli chicken", "Halal")]),
    ("mains", "Curries &amp; mains", "The heart of the wedding feast", "p-karahi", [
        ("Butter Chicken", "Tandoori chicken in a silky tomato and butter sauce", "Halal"),
        ("Lamb Rogan Josh", "Slow-cooked Kashmiri lamb with fennel and cardamom", "Halal"),
        ("Dal Makhani", "Black lentils simmered overnight with cream", "Veg"),
        ("Sarson da Saag", "Mustard greens with makki di roti and white butter", "Veg")]),
    ("rice", "Rice &amp; breads", "Made fresh on the day", "px-buffet-gold", [
        ("Lamb Dum Biryani", "Saffron, fried onions and mint, sealed and slow-cooked", "Halal"),
        ("Vegetable Pulao", "Basmati with whole spices and garden vegetables", "Veg"),
        ("Butter Naan", "From the tandoor, brushed with butter", "Veg"),
        ("Bhatura", "Puffed and golden, served with chole", "Veg")]),
    ("desserts", "Desserts &amp; mithai", "For the last dance and the doli", "px-jamun", [
        ("Rasmalai", "Soft paneer dumplings in saffron milk", "Veg"),
        ("Gulab Jamun", "Warm, in rose and cardamom syrup", "Veg"),
        ("Fresh Jalebi", "Made live and served hot", "Veg · Live"),
        ("Mithai Platter", "Kaju katli, barfi and ladoo with silver leaf", "Veg")]),
]


def menu_board(cats=MENU, heading=True):
    photos = "".join(f'<img src="img/{c[3]}-2400.webp" alt="" data-for="{c[0]}"{" class=\"on\"" if i == 0 else " loading=\"lazy\""}>' for i, c in enumerate(cats))
    blocks = ""
    for key, name, sub, _, dishes in cats:
        rows = "".join(f'''
        <div class="dish"{f' data-diet="{DIET.get(d, "veg")}"' if THEME == "b" else ""}><h4>{d}</h4><span class="tags">{diet_tag(d) if THEME == "b" else t}</span><p>{p}</p><button class="add" data-dish="{d}" aria-pressed="false">+ Add</button></div>''' for d, p, t in dishes)
        blocks += f'''
      <div class="cat" data-cat="{key}" data-title="{name.replace('&amp;', '&')}">
        <div class="cat-head"><h3>{name}</h3><span>{sub}</span></div>{rows}
      </div>'''
    head_html = '''
    <div class="center" style="margin-bottom:70px">
      <p class="eyebrow" data-fade>Our menu</p>
      <h2 class="h2" data-fade>Dishes families <em>ask for again.</em></h2>
      <p class="lede" data-fade>Tap “Add” on anything you love and we’ll build your quote around it.</p>
    </div>''' if heading else ""
    if THEME == "b":
        head_html += "\n    " + FILTERS
    return f'''<section class="sec" id="menu">
  <div class="wrap">{head_html}
    <div class="board">
      <div class="board-side"><div class="arch framed board-photo">{photos}</div><p class="board-cap">{cats[0][1].replace('&amp;', '&')}</p></div>
      <div>{blocks}
        <p class="board-note">Every menu is built around your family. Dishes can be swapped, and all can be made vegetarian, satvik, Jain or nut-free on request.</p>
      </div>
    </div>
  </div>
</section>'''


def stage():
    n = len(EVENTS)
    bgs = "".join(f'<div class="st-bg" style="--z:{i + 1}">{img(e[0], "100vw", "")}</div>' for i, e in enumerate(EVENTS))
    cards = "".join(f'''
        <article class="st-card" style="--z:{i + 1}">
          <div class="arch">{img(e[0], "440px", "")}</div>
          <p class="st-no">0{i + 1} — {e[2]}</p>
          <h3>{e[1]}</h3>
          <p>{e[3]}</p>
          <a href="contact.html" class="link" data-occasion="{e[5]}">{e[4]} <span>→</span></a>
        </article>''' for i, e in enumerate(EVENTS))
    dots = "<i></i>" * n
    return f'''<section class="stage" style="--n:{n}" aria-label="Weddings and events we cater">
  <div class="stage-in">
    {bgs}
    <div class="st-head"><p class="eyebrow">What we cater</p><h2 class="h2">Every ceremony, <em>its own feast.</em></h2></div>
    <div class="st-panel">{cards}
    </div>
    <div class="st-dots" aria-hidden="true">{dots}</div>
  </div>
</section>'''


GLASS = '''<section class="glass" aria-label="Indoor and outdoor catering">
  <img class="glass-img on" data-kind="indoor" src="img/p-banquet-2400.webp" alt="A banquet hall dressed with linen, crystal and flowers">
  <img class="glass-img" data-kind="outdoor" src="img/b-mandap-2400.webp" alt="An outdoor wedding mandap with flowers" loading="lazy">
  <canvas aria-hidden="true"></canvas>
  <div class="glass-copy">
    <p class="eyebrow c">Indoors &amp; outdoors</p>
    <h2 class="h2" data-kind-text="indoor">Step <em>inside.</em></h2>
    <h2 class="h2" data-kind-text="outdoor" hidden>Under <em>open skies.</em></h2>
    <p class="lede" data-kind-text="indoor">Banquet halls, hotels and Gurdwara halls across Scotland, dressed and served by our own team.</p>
    <p class="lede" data-kind-text="outdoor" hidden>Marquees, gardens and country houses, with field kitchens, live grills and full service under canvas.</p>
    <div class="glass-toggle" role="tablist" aria-label="Venue"><button role="tab" aria-selected="true" data-kind="indoor">Indoors</button><button role="tab" aria-selected="false" data-kind="outdoor">Outdoors</button></div>
  </div>
  <p class="glass-hint">✦ Move across the glass to look inside</p>
</section>'''

STEPS = [("team-waiter", "Tell us your date", "Share your date, venue, guest numbers and traditions. We reply within one working day."),
         ("team-chef", "Taste your menu", "Join our chefs for a tasting and try every dish before you decide."),
         ("team-pass", "Meet your manager", "One event manager plans every ceremony with you, from the roka to the reception."),
         ("team-wok", "We serve the day", "Our own chefs and waiting team cook, serve and clear, so your family can celebrate.")]


def process(head_title="Four steps to <em>a perfect day.</em>"):
    items = "".join(f'''
      <li class="step" data-fade style="--d:{i * .12:.2f}s"><div class="arch framed">{img(s[0], "(max-width: 900px) 45vw, 22vw", "")}</div><b>0{i + 1}</b><h3>{s[1]}</h3><p>{s[2]}</p></li>''' for i, s in enumerate(STEPS))
    return f'''<section class="sec">
  <div class="wrap center">
    <p class="eyebrow" data-fade>How it works</p>
    <h2 class="h2" data-fade>{head_title}</h2>
    <ol class="steps"><svg viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M60,40 C220,40 260,110 375,110 S530,40 625,40 S780,110 940,110"/></svg>{items}
    </ol>
  </div>
</section>'''


QUOTES = [("Everyone we’ve talked to has raved about the food! Compliments also to your staff. They were all very kind and helpful.", "Varinderjeet &amp; Dilvar · Wedding"),
          ("Thank you for such a marvellous catering job. Our celebration was a huge success due to your efficiency and the care you took with the presentation.", "Archana &amp; Sanjeev · Wedding celebration"),
          ("Really enjoyed our food. It was delicious and the staff were all friendly. Recommend it!", "Sandeep Shergill · Private event")]


def quotes():
    slides = "".join(f'<div class="quote-slide{" on" if i == 0 else ""}"><blockquote>“{q}”</blockquote><cite>{c}</cite></div>' for i, (q, c) in enumerate(QUOTES))
    dots = "".join(f'<button aria-label="Review {i + 1}"></button>' for i in range(len(QUOTES)))
    return f'''<section class="sec sand">
  <div class="wrap"><div class="quote" data-fade><p class="eyebrow c">Kind words</p>{slides}<div class="quote-dots">{dots}</div></div></div>
</section>'''


# ---------------------------------------------------------------- Direction B only: tools and scroll stages
DIET = {  # what each menu dish is, for the filters (Jain = can be made without onion, garlic or root vegetables)
    "Gol Gappe": "veg live", "Papdi Chaat": "veg", "Punjabi Samosa": "veg", "Amritsari Fish": "nonveg",
    "Chicken Tikka": "nonveg live", "Paneer Tikka": "veg jain live", "Seekh Kebab": "nonveg live", "Haryali Tikka": "nonveg",
    "Butter Chicken": "nonveg", "Lamb Rogan Josh": "nonveg", "Dal Makhani": "veg jain", "Sarson da Saag": "veg",
    "Lamb Dum Biryani": "nonveg", "Vegetable Pulao": "veg jain", "Butter Naan": "veg jain", "Bhatura": "veg jain",
    "Rasmalai": "veg jain", "Gulab Jamun": "veg jain", "Fresh Jalebi": "veg jain live", "Mithai Platter": "veg jain",
}


def diet_tag(d):
    s = DIET.get(d, "veg").split()
    t = "Non-veg" if "nonveg" in s else "Veg"
    if "jain" in s:
        t += " · Jain option"
    if "live" in s:
        t += " · Live"
    return t


FILTERS = '''<div class="mfilter" role="group" aria-label="Filter dishes">
      <button aria-pressed="true" data-f="all">All</button><button aria-pressed="false" data-f="veg">Veg</button><button aria-pressed="false" data-f="jain">Jain</button><button aria-pressed="false" data-f="nonveg">Non-veg</button><button aria-pressed="false" data-f="live">Live</button>
    </div>'''


def hero_b():
    return f'''<section class="hx" aria-label="Welcome">
  <div class="hx-pin">
    <div class="hx-media">{img("b-hall", "100vw", "", lazy=False)}</div>
    <div class="hx-copy">
      <p class="eyebrow c">Wedding caterers · Glasgow since 1975</p>
      <h1 class="display">The wedding feast,<br><em>beautifully served.</em></h1>
      <p class="lede">Sikh and Hindu wedding catering from one family kitchen, for a hundred guests or a thousand. Nikah and Walima menus too.</p>
      <div class="ctas"><a href="contact.html" class="btn">Check your date <i>→</i></a><a href="#planner" class="btn line">Plan your feast</a></div>
    </div>
    <p class="hx-side hx-l" aria-hidden="true">Step into</p><p class="hx-side hx-r" aria-hidden="true"><em>the feast</em></p>
    <p class="hx-cue" aria-hidden="true">Scroll</p>
  </div>
</section>'''


CEREMONIES = [("roka", "Roka &amp; Chunni"), ("mehndi", "Mehndi &amp; Sangeet"), ("haldi", "Haldi / Jaggo"),
              ("wedding", "Anand Karaj / Pheras"), ("reception", "Reception")]
EXTRAS = [("chaat", "Live chaat counter"), ("tandoor", "Live tandoor &amp; grill"), ("dessert", "Dessert &amp; mithai bar"), ("bar", "Mocktail bar")]


def planner():
    cer = "".join(f'<label><input type="checkbox" name="cer" value="{k}"{" checked" if k in ("mehndi", "wedding", "reception") else ""}><span>{n}</span></label>' for k, n in CEREMONIES)
    ext = "".join(f'<label><input type="checkbox" name="ext" value="{k}"{" checked" if k == "chaat" else ""}><span>{n}</span></label>' for k, n in EXTRAS)
    return f'''<section class="sec planner" id="planner">
  <div class="wrap">
    <div class="center"><p class="eyebrow" data-fade>Feast planner</p><h2 class="h2" data-fade>Plan your feast <em>in a minute.</em></h2><p class="lede" data-fade>Choose your ceremonies, guests and food. Your plan builds itself as you go.</p></div>
    <form class="pl" onsubmit="return false" data-fade>
      <div class="pl-controls">
        <fieldset><legend>Your ceremonies</legend><div class="chips">{cer}</div></fieldset>
        <fieldset><legend>Guests <output class="pl-guests">300</output></legend><input class="pl-range" type="range" name="guests" min="50" max="1000" step="25" value="300" aria-label="Number of guests"><div class="pl-scale"><span>50</span><span>500</span><span>1,000</span></div></fieldset>
        <fieldset><legend>The food</legend><div class="chips"><label><input type="radio" name="diet" value="veg"><span>Vegetarian</span></label><label><input type="radio" name="diet" value="jain"><span>Jain</span></label><label><input type="radio" name="diet" value="nonveg" checked><span>Veg &amp; non-veg</span></label></div></fieldset>
        <fieldset><legend>Service</legend><div class="chips"><label><input type="radio" name="style" value="buffet" checked><span>Buffet</span></label><label><input type="radio" name="style" value="plated"><span>Plated</span></label></div></fieldset>
        <fieldset><legend>Live stations &amp; extras</legend><div class="chips">{ext}</div></fieldset>
      </div>
      <div class="pl-out" aria-live="polite">
        <p class="eyebrow">Your feast</p>
        <ol class="pl-events"></ol>
        <div class="pl-team"><div><b class="pl-staff">0</b><span>Waiting staff</span></div><div><b class="pl-chefs">0</b><span>Chefs</span></div><div><b class="pl-count">0</b><span>Plates served</span></div></div>
        <div class="pl-price"><span>Indicative total</span><b class="pl-total">£0</b><small class="pl-per"></small></div>
        <p class="pl-note">Indicative only. Your exact per-head quote follows a free tasting.</p>
        <div class="ctas"><button type="button" class="btn pl-send">Send this plan <i>→</i></button><a href="contact.html" class="btn line">Full enquiry</a></div>
      </div>
    </form>
  </div>
</section>'''


THALI_DISHES = [  # cut-out, name, diet
    ("butter-chicken", "Butter Chicken", "nonveg"), ("tandoori", "Tandoori Chicken", "nonveg"), ("chicken-tikka", "Malai Tikka", "nonveg"),
    ("karahi", "Chicken Tikka Masala", "nonveg"), ("biryani", "Chicken Biryani", "nonveg"), ("lamb-biryani", "Lamb Biryani", "nonveg"),
    ("paneer-masala", "Paneer Makhani", "veg jain"), ("palak-paneer", "Palak Paneer", "veg jain"), ("dal-makhani", "Malai Kofta", "veg"),
    ("chaat", "Dahi Puri Chaat", "veg"), ("gol-gappe", "Gol Gappe", "veg"), ("samosa", "Samosa", "veg"),
    ("rice", "Jeera Rice", "veg jain"), ("naan", "Butter Naan", "veg jain"), ("gulab-jamun", "Gulab Jamun", "veg jain"), ("gajar-halwa", "Gajar Halwa", "veg"),
]


def thali():
    slots = "".join(f'<button type="button" class="kt kt{i}" data-slot="{i}" aria-label="Bowl {i + 1}, empty"><span class="kt-in"></span></button>' for i in range(7))
    tokens = "".join(f'<button type="button" class="tok" data-cut="{c}" data-name="{n}" data-diet="{d}" draggable="false"><img src="img/cut/{c}.webp" alt="" width="64" height="64" loading="lazy"><span>{n}</span><i class="dot {"nv" if "nonveg" in d else "v"}" aria-hidden="true"></i></button>' for c, n, d in THALI_DISHES)
    return f'''<section class="sec thali-sec" id="thali">
  <div class="wrap">
    <div class="center"><p class="eyebrow" data-fade>Design your thali</p><h2 class="h2" data-fade>Fill the plate <em>your way.</em></h2><p class="lede" data-fade>Drag a dish into a bowl, or tap to add it. Tap a bowl to empty it.</p></div>
    <div class="th" data-fade>
      <div class="th-stage"><div class="thali" aria-label="Your thali">{slots}</div><p class="th-count"><b>0</b> of 7 bowls filled</p></div>
      <div class="th-tray">
        <div class="mfilter th-filter" role="group" aria-label="Filter dishes"><button aria-pressed="true" data-f="all">All</button><button aria-pressed="false" data-f="veg">Veg</button><button aria-pressed="false" data-f="jain">Jain</button><button aria-pressed="false" data-f="nonveg">Non-veg</button></div>
        <div class="toks">{tokens}</div>
        <div class="ctas"><button type="button" class="btn th-add">Add my thali to my enquiry <i>→</i></button><button type="button" class="btn line th-clear">Clear</button></div>
        <p class="th-msg" role="status"></p>
      </div>
    </div>
  </div>
</section>'''


def countdown():
    return '''<section class="sec cd sand" id="countdown">
  <div class="wrap center">
    <p class="eyebrow" data-fade>Your countdown</p>
    <h2 class="h2" data-fade>When is <em>the big day?</em></h2>
    <label class="cd-pick" data-fade><span>Wedding date</span><input type="date" class="cd-date" aria-label="Wedding date"></label>
    <div class="cd-clock" aria-live="polite" hidden><div><b class="cd-d">0</b><span>Days</span></div><div><b class="cd-h">0</b><span>Hours</span></div><div><b class="cd-m">0</b><span>Minutes</span></div><div><b class="cd-s">0</b><span>Seconds</span></div></div>
    <ol class="cd-steps" hidden></ol>
    <div class="ctas" data-fade style="margin-top:34px"><a href="contact.html" class="btn">Check your date <i>→</i></a><a href="https://wa.me/447818478036" class="btn line" target="_blank" rel="noopener">WhatsApp us</a></div>
  </div>
</section>'''


B_SPINE = '<div class="spine" aria-hidden="true"><i class="spine-fill"></i><i class="spine-flame"></i></div><div class="diya" aria-hidden="true"></div>'


# ---------------------------------------------------------------- pages
HERO_A = f'''<section class="hero">
  <div class="hero-media">{img("b-hall", "100vw", "", lazy=False)}</div>
  <div>
    <p class="eyebrow c" data-fade>Wedding caterers · Glasgow since 1975</p>
    <h1 class="display" data-fade style="--d:.1s">The wedding feast,<br><em>beautifully served.</em></h1>
    <p class="lede" data-fade style="--d:.25s">Sikh and Hindu wedding catering from one family kitchen, for a hundred guests or a thousand. Nikah and Walima menus too.</p>
    <div class="ctas" data-fade style="--d:.4s"><a href="contact.html" class="btn">Check your date <i>→</i></a><a href="#menu" class="btn line">See the menu</a></div>
    <div class="hero-foot" data-fade style="--d:.55s"><span><b>1975</b>Family kitchen</span><span><b>1,000+</b>Guests at one wedding</span><span><b>5</b>Ceremonies, five menus</span></div>
  </div>
</section>'''

HOME = f'''{hero_b() if THEME == "b" else HERO_A}

<section class="sec">
  {rose("tr")}
  <div class="wrap intro-grid">
    <div>
      <p class="eyebrow" data-fade>Our promise</p>
      <h2 class="h2"{" data-candle" if THEME == "b" else " data-fade"}>Every plate leaves our kitchen as if it were going to <em>our own table.</em></h2>
      <p class="lede" data-fade>Three generations of one Glasgow family have cooked for Scotland’s biggest days, from an intimate roka to a thousand-guest reception. We use fresh ingredients from trusted suppliers and serve them with the care your guests will notice.</p>
      <div class="stats" data-fade><div><b>50</b><span>Years of weddings</span></div><div><b>3</b><span>Faith traditions, deeply understood</span></div><div><b>1</b><span>Team from first call to last plate</span></div></div>
      <p style="margin-top:34px" data-fade><a href="about.html" class="link">Read our story <span>→</span></a></p>
    </div>
    <div class="intro-figs">{arch("p-tablesetting", "A table set with fine china and crystal", cls="framed")}{arch("px-jamun", "Gulab jamun", d=.3)}</div>
  </div>
</section>

{stage()}{"\n\n" + planner() if THEME == "b" else ""}

{menu_board()}{"\n\n" + thali() if THEME == "b" else ""}

{GLASS}

{process()}

{quotes()}

{countdown() if THEME == "b" else cta()}'''

ABOUT = f'''{phero("Our story", "Love for food, <em>since 1975.</em>", "A Glasgow family kitchen that has grown up with the city’s Asian community, one celebration at a time.", "p-tablesetting", "")}

<section class="sec">
  {rose("tr")}
  <div class="wrap split">
    <div>{arch("p-karahi", "A rich curry in a brass karahi", cls="framed")}</div>
    <div>
      <p class="eyebrow" data-fade>Who we are</p>
      <h2 class="h2" data-fade>A family kitchen that grew up with <em>Glasgow’s Asian community.</em></h2>
      <p class="lede" data-fade>Since 1975 we have cooked quality Indian and Punjabi dishes for the biggest days in families’ lives, blessing weddings with an inventive menu of delights.</p>
      <p class="lede" data-fade>Our team works with one mission: to uphold the values of every family we cook for. We use fresh ingredients from trusted suppliers, including small local family farms.</p>
      <p class="pull" data-fade>“There is no sincerer love than the love of food.”<small>George Bernard Shaw</small></p>
    </div>
  </div>
</section>

<section class="sec sand">
  <div class="wrap center">
    <p class="eyebrow" data-fade>The people behind the plates</p>
    <h2 class="h2" data-fade>From our kitchen <em>to your table.</em></h2>
    <div class="team">
      <figure>{arch("team-waiter", "An Apna waiter carrying plated dishes", "(max-width: 900px) 45vw, 22vw")}<figcaption>Served with care</figcaption></figure>
      <figure>{arch("team-chef", "An Apna chef plating at the pass", "(max-width: 900px) 45vw, 22vw", d=.1)}<figcaption>Finished by hand</figcaption></figure>
      <figure>{arch("team-pass", "Apna chefs preparing dishes together", "(max-width: 900px) 45vw, 22vw", d=.2)}<figcaption>One team</figcaption></figure>
      <figure>{arch("team-wok", "An Apna chef cooking over a live flame", "(max-width: 900px) 45vw, 22vw", d=.3)}<figcaption>Cooked fresh</figcaption></figure>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap center">
    <p class="eyebrow" data-fade>Why families choose us</p>
    <h2 class="h2" data-fade>Three promises, <em>since 1975.</em></h2>
    <div class="values" style="text-align:left">
      <div data-fade><b>i.</b><h3>Always fresh</h3><p>Every dish is cooked on the day from fresh ingredients, never reheated or bought in.</p></div>
      <div data-fade style="--d:.12s"><b>ii.</b><h3>Your traditions first</h3><p>Gurdwara rules, satvik and Jain kitchens, halal meat: agreed with your family and respected throughout.</p></div>
      <div data-fade style="--d:.24s"><b>iii.</b><h3>One team</h3><p>Food, staff, china, equipment and event management from one family business, start to finish.</p></div>
    </div>
  </div>
</section>

{process("From first call <em>to final course.</em>")}

{quotes()}

{cta("Your celebration, <em>our kitchen.</em>", "Fifty years of weddings, rokas and receptions. Let’s plan yours.")}'''

TRAD = [
    ("sikh", "Sikh weddings", "p-henna", "Anand Karaj &amp; reception", "From the Roka and Chunni to the Jaggo, the Milni and the Anand Karaj, then the reception that night. We plan every event and respect Gurdwara customs.",
     ["Vegetarian Gurdwara breakfast and langar-style service, with no meat, eggs or alcohol", "Milni tea with pakoras, samosas and fresh mithai", "Jaggo-night chaat and live tandoor stations", "Full Punjabi reception: makki di roti, sarson da saag, butter chicken"], "Sikh wedding"),
    ("hindu", "Hindu weddings", "b-mandap", "Haldi, sangeet, pheras &amp; reception", "A Hindu wedding runs over several days, and every day deserves its own menu, with your family’s dietary customs at the centre.",
     ["Pure vegetarian, satvik and Jain menus, with no onion or garlic where needed", "Haldi brunch: puri chole, kachori and fresh jalebi", "Sangeet chaat stalls: gol gappe, papdi chaat, aloo tikki", "Thali or buffet in Punjabi, Gujarati and South Indian styles"], "Hindu wedding"),
    ("events", "Parties &amp; corporate", "p-toast", "Celebrations of every size", "Rokas, milestone birthdays, anniversaries and office Diwali, Eid and Vaisakhi events, with the same kitchen scaled to your guest list.",
     ["Canapé receptions and bowl food", "Office Diwali, Eid and Vaisakhi events", "Birthdays, anniversaries and family reunions", "Delivered buffets or full service"], "Private party"),
    ("muslim", "Nikah &amp; Walima", "p-biryanibowl", "Nikah &amp; Walima", "Generous menus for the Nikah and Walima, with requirements agreed with your family at the first consultation and respected throughout.",
     ["Lamb rogan josh, biryani, seekh and chapli kebabs", "Elegant plated or banquet-style service", "Dessert buffets with rasmalai and kulfi"], "Muslim wedding"),
]


def traditions():
    tabs = "".join(f'<button role="tab" id="t-{k}" aria-controls="p-{k}" aria-selected="{"true" if i == 0 else "false"}">{n}</button>' for i, (k, n, *_r) in enumerate(TRAD))
    panels = ""
    for i, (k, n, im, h, p, ticks, occ) in enumerate(TRAD):
        lis = "".join(f"<li>{t}</li>" for t in ticks)
        panels += f'''
    <div class="tpanel split" id="p-{k}" role="tabpanel" aria-labelledby="t-{k}"{"" if i == 0 else " hidden"}>
      <div>{arch(im, "", cls="framed")}</div>
      <div><h3 class="h2" style="font-size:clamp(34px,3.6vw,52px)">{h}</h3><p class="lede">{p}</p><ul class="ticks">{lis}</ul><a href="contact.html" class="btn" data-occasion="{occ}">Plan your celebration <i>→</i></a></div>
    </div>'''
    return f'''<section class="sec" id="traditions">
  {rose("tl")}
  <div class="wrap">
    <div class="center"><p class="eyebrow" data-fade>Weddings</p><h2 class="h2" data-fade>Sikh and Hindu weddings, <em>done properly.</em></h2></div>
    <div class="tabs" role="tablist" aria-label="Wedding tradition">{tabs}</div>{panels}
  </div>
</section>'''


STATIONS = [("px-panipuri", "Chaat &amp; street-food stations", "Gol gappe, papdi chaat and aloo tikki, made fresh in front of your guests."),
            ("px-tandoori", "Live tandoor &amp; grill", "Chefs at the tandoor and grill, bringing the kitchen to the party."),
            ("px-jamun", "Dessert &amp; mithai bars", "Rasmalai, gulab jamun, jalebi made live, kulfi and a chocolate fountain."),
            ("p-tablesetting", "Table service", "Fine china, polished cutlery, linen and a waiting team who set and clear."),
            ("px-buffet-gold", "Banquet buffets", "Polished chafing dishes and dressed buffet tables for any number of guests."),
            ("p-cocktails", "Drinks &amp; mocktail bars", "Juice bars, mocktails and drinks fountains, plus ice cream and candyfloss.")]

SERVICES = f'''{phero("Weddings &amp; events", "Every tradition, <em>beautifully served.</em>", "Sikh and Hindu weddings at the heart of it, with live stations, desserts and full event service from one team.", "b-mandap", "")}

{traditions()}

<section class="sec sand">
  <div class="wrap center">
    <p class="eyebrow" data-fade>Live stations &amp; extras</p>
    <h2 class="h2" data-fade>Theatre your guests <em>will remember.</em></h2>
    <div class="stations" style="text-align:left">''' + "".join(f'''
      <article class="station" data-fade style="--d:{(i % 3) * .12:.2f}s">{arch(s[0], "", "(max-width: 900px) 45vw, 30vw", wipe=False)}<b>0{i + 1}</b><h3>{s[1]}</h3><p>{s[2]}</p></article>''' for i, s in enumerate(STATIONS)) + f'''
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="center"><p class="eyebrow" data-fade>Every occasion</p><h2 class="h2" data-fade>Every chapter <em>deserves a feast.</em></h2></div>
    <ul class="occ">
      <li data-fade><a href="contact.html" data-occasion="Engagement / Roka"><b>i.</b><h3>Engagements &amp; roka</h3><span>Canapés, chaat and mithai for both families.</span></a></li>
      <li data-fade><a href="contact.html" data-occasion="Mehndi / Sangeet"><b>ii.</b><h3>Mehndi &amp; sangeet</h3><span>Chaat stalls and live grills that keep the dance floor going.</span></a></li>
      <li data-fade><a href="contact.html" data-occasion="Birthday"><b>iii.</b><h3>Milestone birthdays</h3><span>From first birthdays to eightieths.</span></a></li>
      <li data-fade><a href="contact.html" data-occasion="Anniversary"><b>iv.</b><h3>Anniversaries</h3><span>Intimate dinners or family gatherings.</span></a></li>
      <li data-fade><a href="contact.html" data-occasion="Corporate event"><b>v.</b><h3>Corporate events</h3><span>Client dinners and Diwali, Eid and Vaisakhi parties.</span></a></li>
    </ul>
  </div>
</section>{"\n\n" + planner() if THEME == "b" else ""}

{GLASS}

{cta(rose_pos="br")}'''

SIG = [("p-karahi", "The Classic", "Aloo papdi chaat · Chicken tikka &amp; lamb seekh kebab · Lamb aloo curry · Chicken desi style · Dal makhani · Rasmalai"),
       ("px-tandoori", "Chaat &amp; Grill", "Chaat stall: gol gappe, papdi &amp; fruit chaat · Mixed kebab platter · Lamb rogan josh · Chicken bhuna · Palak paneer"),
       ("p-tablesetting", "The Reception", "Canapés · Haryali tikka · Amritsari fish · Punjabi turka chicken · Bread basket · Kulfi selection"),
       ("px-buffet-gold", "The Punjab Table", "Baingan palak pakora · Fish masala · Lamb saag · Tinda masala · Makki di roti &amp; bhatura · Boondi raita")]

MENUS = f'''{phero("Menus", "Start with a classic, <em>make it yours.</em>", "Four signature menus our families return to, and every dish we cook, ready to mix and match.", "px-buffet-gold", "")}

<section class="sec">
  {rose("tr")}
  <div class="wrap center">
    <p class="eyebrow" data-fade>Signature menus</p>
    <h2 class="h2" data-fade>Four menus families <em>love.</em></h2>
    <p class="lede" data-fade>Each can be changed dish by dish. Prices depend on guest numbers and service style; ask for a per-head quote.</p>
    <div class="sig">''' + "".join(f'''
      <article data-fade style="--d:{i * .12:.2f}s">{arch(s[0], "", "(max-width: 1000px) 45vw, 22vw", wipe=False)}<b>{["i.", "ii.", "iii.", "iv."][i]}</b><h3>{s[1]}</h3><p>{s[2]}</p></article>''' for i, s in enumerate(SIG)) + f'''
    </div>
  </div>
</section>

<div class="sand">{menu_board()}</div>{"\n\n" + thali() if THEME == "b" else ""}

{cta("Your menu is <em>ready to taste.</em>", "Send us the dishes you picked and we’ll arrange a tasting with our chefs.")}'''

FAQ = [("How much should we budget per guest?", "It depends on the menu, the number of events and the style of service. Tell us your date, guest numbers and traditions and we’ll send a clear per-head quote, with no hidden extras for staff, china or equipment."),
       ("Do you cater at Gurdwaras?", "Yes. For the Anand Karaj we serve a vegetarian breakfast and langar-style meal with no meat, eggs or alcohol, and we follow each Gurdwara’s own rules on kitchen use and service."),
       ("Can you do pure vegetarian, satvik or Jain menus?", "Yes. We cook fully vegetarian menus for Hindu ceremonies, and satvik and Jain menus with no onion or garlic, prepared separately."),
       ("Do you offer a tasting before we book?", "Yes. Once you’ve shortlisted a menu, you’re invited to a tasting with our chefs so the family can try every dish before deciding."),
       ("Do you cater outdoors and outside Glasgow?", "Yes. We cater marquees, gardens and country-house venues across Scotland, with our own field kitchens, live grills and full waiting team.")]

OCCASIONS = ["Sikh wedding", "Hindu wedding", "Engagement / Roka", "Mehndi / Sangeet", "Reception", "Birthday", "Anniversary", "Corporate event", "Private party", "Muslim wedding"]
OCC_LABEL = {"Muslim wedding": "Nikah / Walima"}

CONTACT = f'''{phero("Contact", "Is your date <em>still available?</em>", "Wedding season dates go early. Share a few details and we’ll confirm availability and arrange a tasting.", "p-mandap", "")}

<section class="sec">
  {rose("tr")}
  <div class="wrap contact-grid">
    <div>
      <p class="eyebrow" data-fade>Talk to us</p>
      <h2 class="h2" data-fade>We reply within <em>one working day.</em></h2>
      <div class="lines" data-fade>
        <a href="tel:+447818478036"><small>Call</small>07818 478036</a>
        <a href="tel:+447828218002"><small>Or call</small>07828 218002</a>
        <a href="mailto:hello@apnacatering.co.uk"><small>Email</small>hello@apnacatering.co.uk</a>
        <a href="https://wa.me/447818478036" target="_blank" rel="noopener"><small>WhatsApp</small>Message us</a>
      </div>
    </div>
    <div class="form" data-fade style="--d:.15s">
      <form id="enquiry" novalidate onsubmit="return false">
        <fieldset><legend>What are you celebrating?</legend><div class="chips">''' + "".join(
    f'<label><input type="radio" name="occasion" value="{o}"><span>{OCC_LABEL.get(o, o)}</span></label>' for o in OCCASIONS) + '''</div></fieldset>
        <fieldset><legend>The details</legend>
          <div class="fields">
            <label class="field"><span>Date</span><input type="date" name="date"></label>
            <label class="field"><span>Guests</span><input type="number" name="guests" min="10" step="10" placeholder="250"></label>
            <label class="field full"><span>Venue or town</span><input type="text" name="venue" placeholder="e.g. Glasgow Gurdwara, or a marquee in Perthshire"></label>
            <label class="field"><span>Your name</span><input type="text" name="name" autocomplete="name"></label>
            <label class="field"><span>Phone</span><input type="tel" name="phone" autocomplete="tel"></label>
            <label class="field full"><span>Email (optional)</span><input type="email" name="email" autocomplete="email"></label>
            <label class="field full"><span>Anything else?</span><textarea name="message" placeholder="Number of events, dietary needs, style of service…"></textarea></label>
          </div>
        </fieldset>
        <p class="form-picks"></p>
        <p class="form-err" role="alert"></p>
        <div class="form-actions"><button type="button" class="btn" data-send="whatsapp">Send on WhatsApp <i>→</i></button><button type="button" class="btn line" data-send="email">Send by email</button></div>
      </form>
      <div class="form-done"><h3 class="h2" style="font-size:44px">Thank you.</h3><p class="lede" style="margin:0 auto">Your message is ready to send. We’ll be in touch within one working day.</p></div>
    </div>
  </div>
</section>

<section class="sec sand">
  <div class="wrap center">
    <p class="eyebrow" data-fade>Questions</p>
    <h2 class="h2" data-fade>Families often <em>ask us.</em></h2>
    <div class="faq" style="text-align:left">''' + "".join(f'<details data-fade{" open" if i == 0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i, (q, a) in enumerate(FAQ)) + '''</div>
  </div>
</section>'''

PRELOAD_HOME = ('<link rel="preload" as="image" href="img/b-hall.webp" imagesrcset="img/b-hall.webp 1200w, img/b-hall-2400.webp 2400w, '
                'img/b-hall-3840.webp 3840w" imagesizes="100vw">')

SITE = {
    "index.html": ("Apna Catering — Sikh & Hindu Wedding Caterers, Glasgow", "Glasgow’s family wedding caterers since 1975. Sikh and Hindu weddings, mehndis and receptions for a hundred guests or a thousand.", HOME, PRELOAD_HOME),
    "about.html": ("Our Story — Apna Catering, Glasgow", "A Glasgow family kitchen cooking for weddings and celebrations since 1975.", ABOUT, ""),
    "services.html": ("Weddings & Events — Apna Catering", "Sikh and Hindu wedding catering, live stations, dessert bars and full event service across Scotland.", SERVICES, ""),
    "menus.html": ("Menus — Apna Catering", "Signature wedding menus and every dish we cook, ready to mix and match.", MENUS, ""),
    "contact.html": ("Get a Quote — Apna Catering", "Check your date and get a per-head quote for your wedding or celebration.", CONTACT, ""),
}

NIGHT = {"b-hall": "gw-buffet", "p-banquet": "gw-buffet", "p-henna": "gw-sikh", "b-mandap": "gw-mandap", "p-mandap": "gw-mandap"}


def night(html):
    def sub(m):
        name, size = m.group(1), m.group(2) or ""
        if name not in NIGHT:
            return m.group(0)
        new = NIGHT[name]
        if size == "-3840":
            size = "-2720"
        return f"img/{new}{size}.webp"
    return re.sub(r"img/([a-z0-9-]+?)(-2400|-2720|-3840)?\.webp", sub, html)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for fn, (title, desc, body, pre) in SITE.items():
        html = page(fn, title, desc, body, pre)
        if THEME == "b":
            html = night(html).replace("The wedding feast,<br><em>beautifully served.</em>", "A feast fit for<br><em>the maharaja.</em>")
        with open(os.path.join(OUT, fn), "w") as f:
            f.write(html)
        print("wrote", os.path.join(OUT, fn))
    if THEME == "b":
        # a self-contained folder: its own copies of the code and only the images it uses
        for f in ("site.css", "site.js", "durbar.css", "durbar.js"):
            shutil.copy(f, os.path.join(OUT, f))
        used = set()
        for fn in os.listdir(OUT):
            if fn.endswith((".html", ".css")):
                used |= set(re.findall(r"img/[A-Za-z0-9._/-]+?\.(?:webp|png|jpg)", open(os.path.join(OUT, fn)).read()))
        os.makedirs(os.path.join(OUT, "img", "cut"), exist_ok=True)
        for u in sorted(used):
            if os.path.exists(u):
                shutil.copy(u, os.path.join(OUT, u))
            else:
                print("missing", u)
        print("copied", len(used), "images")
