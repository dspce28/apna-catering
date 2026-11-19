"""python3 print/editor/build.py -> print/editor/index.html (editor page with the brochure state embedded)"""
import os
H = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(H, "template.html")).read()
st = open(os.path.join(H, "state.json")).read().replace("<", "\\u003c")
open(os.path.join(H, "index.html"), "w").write(t.replace("/*STATE*/", st))
print("index.html", os.path.getsize(os.path.join(H, "index.html")), "bytes")
