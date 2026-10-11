#!/usr/bin/env python3
"""Generate final L'Oréal Israel order findings PDF (Hebrew RTL)."""

from pathlib import Path

from bidi.algorithm import get_display
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
)

OUT = Path(__file__).resolve().parents[2] / "data-import" / "reports" / "loreal-israel-order-findings.pdf"
FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
pdfmetrics.registerFont(TTFont("ArialUnicode", FONT))

# status: exact | fixed | web | verify
# category: raw | color | care | skip
ROWS = [
    # raw materials
    ("INOA", "קרם מפתח 20 Vol (6%)", "3474630417830", 4, "raw", "exact", "חומרי גלם"),
    ("Majirel", "קרם מפתח 20 Vol", "3474637284305", 2, "raw", "web", "חומרי גלם"),
    ("Diactivator", "קרם מפתח 9% (2.7%)", "3474630440432", 6, "raw", "exact", "חומרי גלם"),
    ("Blond Studio", "קרם מפתח שמן 9%", "3474636979172", 1, "raw", "web", "חומרי גלם"),
    ("Blond Studio", "אבקת הבהרה 9 טון Bond Inside", "3474637105761", 1, "raw", "web", "חומרי גלם"),
    # INOA colors
    ("INOA", "3 בסיס", "3474637130992", 3, "color", "exact", "צבע מקצועי"),
    ("INOA", "4 בסיס", "3474637134518", 3, "color", "exact", "צבע מקצועי"),
    ("INOA", "4.15", "3474637128142", 3, "color", "web", "צבע מקצועי"),
    ("INOA", "5 בסיס", "3474637134419", 3, "color", "exact", "צבע מקצועי"),
    ("INOA", "5.4", "3474637133313", 3, "color", "exact", "צבע מקצועי"),
    ("INOA", "5.8", "3474637131746", 3, "color", "web", "צבע מקצועי"),
    ("INOA", "5.17", "3474637131890", 3, "color", "exact", "צבע מקצועי"),
    ("INOA", "7.11", "3474637130237", 3, "color", "exact", "צבע מקצועי"),
    ("INOA", "7.43", "3474637133207", 3, "color", "exact", "צבע מקצועי"),
    ("INOA", "8 בסיס", "3474637134464", 3, "color", "exact", "צבע מקצועי"),
    ("INOA", "8.1", "3474637130183", 3, "color", "exact", "צבע מקצועי"),
    # Majirel
    ("Majirel", "1 בסיס", "3474637283261", 3, "color", "exact", "צבע מקצועי"),
    ("Majirel", "5 בסיס", "3474637283230", 9, "color", "exact", "צבע מקצועי"),
    ("Majirel", "5.8 מוקה", "3474637280635", 3, "color", "exact", "צבע מקצועי"),
    ("Majirel", "5.12 כחול-אפרפר", "3474637282721", 3, "color", "exact", "צבע מקצועי"),
    ("Majirel", "6 בסיס", "3474637283223", 9, "color", "exact", "צבע מקצועי"),
    ("Majirel", "7 בסיס", "3474637283216", 9, "color", "exact", "צבע מקצועי"),
    ("Majirel", "7.18 חום קר", "3474637280994", 3, "color", "exact", "צבע מקצועי"),
    ("Majirel", "8 בסיס", "3474637283209", 3, "color", "exact", "צבע מקצועי"),
    ("Majirel", "8.3 זהב", "3474637281878", 3, "color", "exact", "צבע מקצועי"),
    ("Majirel", "9 בסיס", "3474637283193", 3, "color", "exact", "צבע מקצועי"),
    # Cool Cover
    ("Majirel Cool Cover", "6.1", "3474637279899", 6, "color", "fixed", "צבע מקצועי"),
    ("Majirel Cool Cover", "7.1", "3474637279882", 6, "color", "fixed", "צבע מקצועי"),
    # Dia Light
    ("Dia Light", "0 / Clear", "3474637320423", 6, "color", "fixed", "צבע מקצועי"),
    ("Dia Light", "6.11", "3474637322328", 6, "color", "fixed", "צבע מקצועי"),
    ("Dia Light", "6.28", "3474637322588", 3, "color", "fixed", "צבע מקצועי"),
    ("Dia Light", "7.18", "3474637322472", 3, "color", "fixed", "צבע מקצועי"),
    ("Dia Light", "7.23", "3474637321345", 3, "color", "fixed", "צבע מקצועי"),
    ("Dia Light", "7.43", "3474637321581", 3, "color", "fixed", "צבע מקצועי"),
    ("Dia Light", "8.23", "3474637321338", 3, "color", "fixed", "צבע מקצועי"),
    ("Dia Light", "9.02", "3474637320133", 6, "color", "exact", "צבע מקצועי"),
    ("Dia Light", "10.12", "3474637320669", 3, "color", "fixed", "צבע מקצועי"),
    ("Dia Light", "10.23", "3474637321321", 3, "color", "exact", "צבע מקצועי"),
    ("Dia Light", "10.32", "3474637321123", 3, "color", "exact", "צבע מקצועי"),
    ("Dia Light", "10.82", "3474637156534", 3, "color", "verify", "צבע מקצועי"),
    # Dia Color
    ("Dia Color", "3 בסיס", "3474637206864", 6, "color", "exact", "צבע מקצועי"),
    ("Dia Color", "4 בסיס", "3474637206871", 3, "color", "exact", "צבע מקצועי"),
    ("Dia Color", "6 בסיס", "3474637206895", 3, "color", "exact", "צבע מקצועי"),
    ("Dia Color", "8.34", "3474637208110", 6, "color", "exact", "צבע מקצועי"),
    # care
    ("Tecni.Art", "Flex / פלקס 190 מ״ל", "3474637277765", 3, "care", "web", "טיפוח / מכירה"),
    ("Homme", "Poker Paste 75 מ״ל (נקרא מיקס מיסט במסמך)", "3474630517790", 2, "care", "verify", "טיפוח / מכירה"),
]

SKIPPED = [
    ("סטינר מסלסל 25 מ״מ", "5907882191565", "כמות 0"),
    ("LP Black Timer 2023", "3474637203047", "כמות 0"),
    ("INOA 5.17", "3474637131890", "לא במלאי (כבר סופר בהגעה)"),
    ("Majirel 5.8 מוקה", "3474637280635", "לא במלאי (כבר סופר בהגעה)"),
    ("Dia Color 6 בסיס", "3474637206895", "לא במלאי (כבר סופר בהגעה)"),
    ("Majirel 5.12", "3474637282721", "לא במלאי (כבר סופר בהגעה)"),
]

STATUS_HE = {
    "exact": "מאומת מהמסמך/קטלוג",
    "fixed": "תוקן (ספרת ביקורת EAN)",
    "web": "מאומת ברשת",
    "verify": "מומלץ לאמת פיזית",
}


def he(text: str) -> str:
    if text is None:
        return ""
    return get_display(str(text))


def style_sheet():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="HTitle",
            fontName="ArialUnicode",
            fontSize=18,
            leading=24,
            alignment=TA_CENTER,
            spaceAfter=6,
            textColor=colors.HexColor("#1a1a1a"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="HSub",
            fontName="ArialUnicode",
            fontSize=10,
            leading=14,
            alignment=TA_CENTER,
            spaceAfter=12,
            textColor=colors.HexColor("#555555"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="HHead",
            fontName="ArialUnicode",
            fontSize=13,
            leading=18,
            alignment=TA_RIGHT,
            spaceBefore=14,
            spaceAfter=6,
            textColor=colors.HexColor("#111111"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="HBody",
            fontName="ArialUnicode",
            fontSize=9,
            leading=13,
            alignment=TA_RIGHT,
            spaceAfter=4,
            textColor=colors.HexColor("#222222"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="Cell",
            fontName="ArialUnicode",
            fontSize=8,
            leading=11,
            alignment=TA_CENTER,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CellR",
            fontName="ArialUnicode",
            fontSize=8,
            leading=11,
            alignment=TA_RIGHT,
        )
    )
    styles.add(
        ParagraphStyle(
            name="FooterNote",
            fontName="ArialUnicode",
            fontSize=8,
            leading=11,
            alignment=TA_RIGHT,
            textColor=colors.HexColor("#666666"),
        )
    )
    return styles


def p(text, styles, name="Cell"):
    return Paragraph(he(text), styles[name])


def make_table(headers, rows, styles, col_widths):
    data = [[p(h, styles) for h in headers]]
    for row in rows:
        data.append([p(c, styles) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "ArialUnicode"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cccccc")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f7f7")]),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 3),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return t


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    styles = style_sheet()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        rightMargin=12 * mm,
        leftMargin=12 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
        title="L'Oréal Israel Order Findings",
        author="Spectra Salon",
    )

    story = []
    story.append(Paragraph(he("סיכום הזמנת לוריאל ישראל — ממצאים סופיים"), styles["HTitle"]))
    story.append(
        Paragraph(
            he("חילוץ מתעודות משלוח · אימות ברקודים מול קטלוג ואתרים · אוגוסט 2026"),
            styles["HSub"],
        )
    )
    story.append(
        Paragraph(
            he(
                "המסמך כולל: גוון/שם מוצר, ברקוד EAN, כמות שהגיעה, סדרה, "
                "סיווג (חומרי גלם / צבע מקצועי / טיפוח-מכירה), וסטטוס אימות ברקוד."
            ),
            styles["HBody"],
        )
    )

    delivered = [r for r in ROWS if r[3] > 0]
    total_qty = sum(r[3] for r in delivered)
    by_cat = {}
    by_series = {}
    for series, shade, bc, qty, kind, status, cat in delivered:
        by_cat[cat] = by_cat.get(cat, 0) + qty
        by_series[series] = by_series.get(series, 0) + qty

    story.append(Paragraph(he("1. סיכום כמויות"), styles["HHead"]))
    summary_rows = [[cat, str(qty)] for cat, qty in by_cat.items()]
    summary_rows.append(["סה״כ יחידות שהגיעו", str(total_qty)])
    story.append(
        make_table(
            ["קטגוריה", "כמות"],
            summary_rows,
            styles,
            [120 * mm, 50 * mm],
        )
    )

    story.append(Paragraph(he("2. סיכום לפי סדרה"), styles["HHead"]))
    series_rows = [[s, str(q)] for s, q in by_series.items()]
    story.append(
        make_table(
            ["סדרה", "כמות"],
            series_rows,
            styles,
            [120 * mm, 50 * mm],
        )
    )

    story.append(Paragraph(he("3. מקרא סטטוס ברקוד"), styles["HHead"]))
    legend = [[k, v] for k, v in [
        ("exact", STATUS_HE["exact"]),
        ("fixed", STATUS_HE["fixed"]),
        ("web", STATUS_HE["web"]),
        ("verify", STATUS_HE["verify"]),
    ]]
    story.append(make_table(["קוד", "משמעות"], legend, styles, [30 * mm, 140 * mm]))

    # Full inventory table - RTL column order: rightmost first visually in Hebrew docs
    # In PDF LTR flow: put Hebrew-priority cols; user reads with Hebrew headers
    story.append(Paragraph(he("4. טבלת מלאי מלאה — כל הפריטים שהגיעו"), styles["HHead"]))

    headers = ["סטטוס", "סיווג", "כמות", "ברקוד", "גוון / שם", "סדרה"]
    # For RTL feel, reverse column order so series is on the right
    headers_rtl = list(reversed(headers))
    full_rows = []
    for series, shade, bc, qty, kind, status, cat in delivered:
        row = [
            STATUS_HE[status],
            cat,
            str(qty),
            bc,
            shade,
            series,
        ]
        full_rows.append(list(reversed(row)))

    col_w = [28 * mm, 32 * mm, 38 * mm, 14 * mm, 28 * mm, 46 * mm]
    story.append(make_table(headers_rtl, full_rows, styles, col_w))

    story.append(PageBreak())

    # Section by category
    for cat_name, kinds in [
        ("5. חומרי גלם", {"raw"}),
        ("6. צבע מקצועי — לפי סדרה", {"color"}),
        ("7. מוצרי טיפוח / מכירה", {"care"}),
    ]:
        story.append(Paragraph(he(cat_name), styles["HHead"]))
        subset = [r for r in delivered if r[4] in kinds]
        if cat_name.startswith("6"):
            # group by series
            series_order = []
            for r in subset:
                if r[0] not in series_order:
                    series_order.append(r[0])
            for ser in series_order:
                ser_rows = [r for r in subset if r[0] == ser]
                ser_qty = sum(r[3] for r in ser_rows)
                block = [Paragraph(he(f"{ser} — סה״כ {ser_qty} יח׳"), styles["HBody"])]
                rows = [
                    list(reversed([STATUS_HE[st], str(q), bc, sh]))
                    for _, sh, bc, q, _, st, _ in ser_rows
                ]
                block.append(
                    make_table(
                        list(reversed(["סטטוס", "כמות", "ברקוד", "גוון"])),
                        rows,
                        styles,
                        [40 * mm, 45 * mm, 18 * mm, 63 * mm],
                    )
                )
                block.append(Spacer(1, 6))
                story.append(KeepTogether(block))
        else:
            rows = [
                list(reversed([STATUS_HE[st], cat, str(q), bc, sh, ser]))
                for ser, sh, bc, q, _, st, cat in subset
            ]
            story.append(
                make_table(
                    list(reversed(["סטטוס", "סיווג", "כמות", "ברקוד", "שם", "סדרה"])),
                    rows,
                    styles,
                    [28 * mm, 32 * mm, 38 * mm, 14 * mm, 28 * mm, 46 * mm],
                )
            )

    story.append(Paragraph(he("8. לא הגיעו / לא במלאי"), styles["HHead"]))
    skip_rows = [list(reversed([note, bc, name])) for name, bc, note in SKIPPED]
    story.append(
        make_table(
            list(reversed(["הערה", "ברקוד", "מוצר"])),
            skip_rows,
            styles,
            [55 * mm, 45 * mm, 66 * mm],
        )
    )

    story.append(Paragraph(he("9. ברקודים שתוקנו / דורשים תשומת לב"), styles["HHead"]))
    story.append(
        Paragraph(
            he(
                "Cool Cover ו־Dia Light: ספרת הביקורת האחרונה תוקנה לפי אלגוריתם EAN-13 "
                "והוצלבה לקטלוג L'Oréal Professionnel (סדרת DIA LIGHT 60g / MAJIREL FUNDA)."
            ),
            styles["HBody"],
        )
    )
    story.append(
        Paragraph(
            he(
                "INOA 4.15 ו־5.8: הברקוד מהתעודה/EU מעודכן יותר מגרסת הקטלוג הישנה."
            ),
            styles["HBody"],
        )
    )
    story.append(
        Paragraph(
            he(
                "פריט \"מיקס מיסט\": לפי EAN 3474630517790 ברשת = Homme Poker Paste 75ml — "
                "מומלץ לאמת מול האריזה שהגיעה."
            ),
            styles["HBody"],
        )
    )
    story.append(
        Paragraph(
            he(
                "Dia Light 10.82: הברקוד מהתעודה תקין כ־EAN אך קיימים גם ברקודים חלופיים "
                "לאריזות ישנות/חדשות — מומלץ סריקה פיזית."
            ),
            styles["HBody"],
        )
    )

    story.append(Paragraph(he("10. מיפוי לפורמט טעינה במערכת"), styles["HHead"]))
    map_rows = [
        ["צבע מקצועי (טיובים)", "color", "חומרי עבודה"],
        ["מפתחים / הבהרה", "developer / bleach", "חומרי עבודה"],
        ["טיפוח / עיצוב", "treatment / accessory", "מוצרי מכירה"],
    ]
    story.append(
        make_table(
            ["במסמך", "type אצלכם", "סגמנט מלאי"],
            [list(reversed(r)) for r in map_rows],
            styles,
            [55 * mm, 55 * mm, 56 * mm],
        )
    )

    story.append(Spacer(1, 10))
    story.append(
        Paragraph(
            he(
                "מקורות: תעודות משלוח L'Oréal Israel · קטלוג l-oreal-professionnel.json · "
                "אימות EAN ואתרי Partner Shop / ספקים מקצועיים. "
                f"סה״כ שורות שהגיעו: {len(delivered)} · סה״כ יחידות: {total_qty}."
            ),
            styles["FooterNote"],
        )
    )

    doc.build(story)
    print(f"Wrote {OUT}")
    return OUT


if __name__ == "__main__":
    build()
