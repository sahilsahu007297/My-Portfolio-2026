import sys, json, shutil
from pathlib import Path
from xml.sax.saxutils import escape
sys.path.insert(0, str(Path(__file__).parent / "python-libs"))
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

for name, filename in [("Book","georgia.ttf"),("BookBold","georgiab.ttf"),("Sans","arial.ttf"),("SansBold","arialbd.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(Path("C:/Windows/Fonts") / filename)))
pdfmetrics.registerFontFamily("Book", normal="Book", bold="BookBold", italic="Book", boldItalic="BookBold")
pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="SansBold", italic="Sans", boldItalic="SansBold")
ink = HexColor("#293b31")
body = ParagraphStyle("Body", fontName="Book", fontSize=10.5, leading=16.8, spaceAfter=9, textColor=ink, allowWidows=0, allowOrphans=0)
styles = {
    "Heading1": ParagraphStyle("Chapter", parent=body, fontSize=22, leading=28, spaceBefore=26, spaceAfter=16, keepWithNext=True),
    "Heading2": ParagraphStyle("Section", parent=body, fontSize=15, leading=21, spaceBefore=18, spaceAfter=10, keepWithNext=True),
    "Heading3": ParagraphStyle("Subsection", parent=body, fontName="BookBold", fontSize=11, leading=17, spaceBefore=12, keepWithNext=True),
    "ListParagraph": ParagraphStyle("Bullet", parent=body, leftIndent=13, bulletIndent=0),
    "Title": ParagraphStyle("Title", parent=body, fontSize=18, leading=24, spaceAfter=18),
}
small = ParagraphStyle("Small", fontName="Sans", fontSize=9, leading=14.5, textColor=HexColor("#596b56"), spaceAfter=12)
cell = ParagraphStyle("Cell", fontName="Sans", fontSize=8, leading=11.8, textColor=ink)
headcell = ParagraphStyle("HeadCell", parent=cell, fontName="SansBold")
title = ParagraphStyle("Cover", parent=body, fontSize=39, leading=44, spaceAfter=24)
deck = ParagraphStyle("Deck", parent=body, fontSize=16, leading=25, spaceAfter=28)
toc = ParagraphStyle("Contents", parent=small, fontSize=10, leading=15, spaceAfter=9)
safe = lambda s: escape(s).replace("\n", "<br/>")
studies = json.loads(Path("src/data/caseStudies.json").read_text(encoding="utf8"))
Path("output/pdf").mkdir(parents=True, exist_ok=True)

for study in studies:
    if len(sys.argv) > 1 and study["id"] not in sys.argv[1:]:
        continue
    blocks = json.loads(Path(f"public/case-studies/{study['id']}.json").read_text(encoding="utf8"))["blocks"]
    flow = [Spacer(1, 45), Paragraph(safe(study["category"].upper()), small), Spacer(1, 50),
        Paragraph(safe(study["title"]), title), Paragraph(safe(study["overview"]), deck),
        HRFlowable(width="100%", color=HexColor("#a8b39f")), Spacer(1, 18),
        Paragraph("Sahil Sahu / Product design &amp; strategy", small),
        Paragraph(safe(study["note"]), small)]
    if study.get("app"):
        flow.append(Paragraph(f'<link href="{study["app"]}" color="#355c45">Explore the prototype</link>', small))
    flow += [PageBreak(), Paragraph("Inside this study", styles["Heading1"])]
    for i, block in enumerate(blocks):
        if block.get("style") == "Heading1":
            flow.append(Paragraph(f'<link href="#b{i}" color="#355c45">{safe(block["text"])}</link>', toc))
    flow.append(PageBreak())
    for i, block in enumerate(blocks):
        if block["type"] == "table":
            data = [[Paragraph(safe(text), headcell if r == 0 else cell) for text in row] for r,row in enumerate(block["rows"])]
            cols = max(len(row) for row in data)
            table = Table(data, colWidths=[(A4[0]-108)/cols]*cols, repeatRows=1, hAlign="LEFT")
            table.setStyle(TableStyle([
                ("BACKGROUND",(0,0),(-1,0),HexColor("#e9ede3")),
                ("GRID",(0,0),(-1,-1),0.4,HexColor("#c5cebc")),
                ("VALIGN",(0,0),(-1,-1),"TOP"),
                ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
                ("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),
            ]))
            flow += [Spacer(1, 8), table, Spacer(1, 15)]
        elif block["text"].strip():
            text = safe(block["text"])
            if block["style"] == "Heading1": text = f'<a name="b{i}"/>' + text
            flow.append(Paragraph(text, styles.get(block["style"],body), bulletText="•" if block["style"] == "ListParagraph" else None))
    flow += [Spacer(1,20), HRFlowable(width="100%", color=HexColor("#a8b39f")), Spacer(1,12), Paragraph("End of field note / Sahil Sahu", small)]
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Sans", 8)
        canvas.setFillColor(HexColor("#66735d"))
        canvas.drawString(54, 29, f"Sahil Sahu / {study['id']}")
        canvas.drawRightString(A4[0]-54,29,str(doc.page))
        canvas.restoreState()
    target = Path("output/pdf") / (study["id"] + ".pdf")
    doc = SimpleDocTemplate(str(target), pagesize=A4, leftMargin=54, rightMargin=54, topMargin=50, bottomMargin=54, title=study["title"], author="Sahil Sahu")
    doc.build(flow, onFirstPage=footer, onLaterPages=footer)
    shutil.copyfile(target, Path("public/case-studies") / target.name)
    print(study["id"], target.stat().st_size, "bytes")
