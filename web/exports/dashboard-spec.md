# Final Dashboard – Minimal: Design Specification

**Screenshot**: `exports/aMHVy.png` (2880x1964 @2x)

---

## Global Styles

- **Dimensions**: 1440 x 982px
- **Background**: `#F5F4F1` (warm grey)
- **Font**: `Outfit` (Google Font)
- **Border radius**: 16px on all cards
- **Card shadow**: `0 2px 12px rgba(26, 25, 24, 0.03)`
- **Card fill**: `#FFFFFF`

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Text primary | `#1A1918` | Headings, values, names |
| Text secondary | `#6D6C6A` | Category labels, descriptions |
| Text muted | `#9C9B99` | Labels, dates, subtitles |
| Positive | `#4D9B6A` | Positive change indicators |
| Negative | `#D08068` | Negative change indicators |
| Link/Action | `#3D8A5A` | "View All" link |
| Divider | `#E5E4E1` | Table row borders |
| Background | `#F5F4F1` | Page background |

### Pie Chart Colors

| Category | Hex |
|----------|-----|
| Dining | `#E8B4A0` |
| Shopping | `#B5CCE2` |
| Transport | `#C4D9B8` |
| Groceries | `#D5C7A3` |
| Entertainment | `#C9B8D9` |
| Other | `#DADAD8` |

### Bar Chart Color

- Fill: `#C4D9B8` (sage green), opacity 0.7 (highest bar = opacity 1.0)
- Corner radius: 6px top-left, 6px top-right, 0 bottom

---

## Layout Structure

```
Root (vertical, 1440x982, bg #F5F4F1)
├── Top Nav (horizontal, h:56, bg:#FFF, padding:0 40px)
│   ├── "February 2026" (Outfit 18px/600, #1A1918)
│   └── Right Group (horizontal, gap:16)
│       ├── "Upload statement" (Outfit 13px/500, #6D6C6A)
│       └── Logout Icon (lucide "log-out", 18px, #9C9B99)
│
├── Metrics Section (horizontal, gap:20, padding:28px 40px)
│   ├── Card 1: Total Spent
│   │   ├── Label: "Total Spent" (Outfit 12px/500, #9C9B99)
│   │   ├── Value: "$4,230.00" (Outfit 32px/700, #1A1918, letterSpacing:-1)
│   │   └── Change: "+12.5% from Jan" (Outfit 12px/500, #4D9B6A)
│   ├── Card 2: Avg Per Day
│   │   ├── Label: "Avg Per Day" (Outfit 12px/500, #9C9B99)
│   │   ├── Value: "$151.07" (Outfit 32px/700, #1A1918, letterSpacing:-1)
│   │   └── Change: "-3.2% from Jan" (Outfit 12px/500, #D08068)
│   ├── Card 3: Transactions
│   │   ├── Label: "Transactions" (Outfit 12px/500, #9C9B99)
│   │   ├── Value: "48" (Outfit 32px/700, #1A1918, letterSpacing:-1)
│   │   └── Change: "+8 from Jan" (Outfit 12px/500, #4D9B6A)
│   └── Card 4: Top Category
│       ├── Label: "Top Category" (Outfit 12px/500, #9C9B99)
│       ├── Value: "Dining" (Outfit 32px/700, #1A1918, letterSpacing:-1)
│       └── Subtext: "$1,280 · 30%" (Outfit 12px/500, #6D6C6A)
│
├── Chart Section (h:320, padding:0 40px)
│   └── Card (vertical, gap:16, padding:24px 28px, cornerRadius:16)
│       ├── Header (horizontal, space-between)
│       │   ├── "Daily Spending" (Outfit 16px/600, #1A1918)
│       │   └── "Feb 1–28, 2026" (Outfit 12px, #9C9B99)
│       └── Bar Chart (horizontal, gap:5, align:end, fill-height)
│           └── 28 bars, varying heights (35–140px), fill:#C4D9B8 @ 0.7 opacity
│
└── Bottom Section (horizontal, gap:20, padding:20px 40px 40px 40px, fill-height)
    ├── Category Card (w:440, vertical, gap:20, padding:24px 28px)
    │   ├── "Spending by Category" (Outfit 16px/600, #1A1918)
    │   └── Content (horizontal, gap:24, center-aligned)
    │       ├── Donut Chart (180x180)
    │       │   ├── Dining: 30% (#E8B4A0)
    │       │   ├── Shopping: 21% (#B5CCE2)
    │       │   ├── Transport: 15% (#C4D9B8)
    │       │   ├── Groceries: 12% (#D5C7A3)
    │       │   ├── Entertainment: 11% (#C9B8D9)
    │       │   ├── Other: 11% (#DADAD8)
    │       │   └── Center: "$4,230 total" (Outfit 16px/700 + 11px/500)
    │       └── Legend (vertical, gap:14)
    │           └── 6 rows: [dot] [name] [amount]
    │               (Outfit 13px/500 #1A1918 + 13px/500 #6D6C6A)
    │
    └── Transactions Card (fill-width, vertical, cornerRadius:16)
        ├── Header (horizontal, space-between, padding:20px 28px, bottom-border)
        │   ├── "Recent Transactions" (Outfit 16px/600, #1A1918)
        │   └── "View All" (Outfit 12px/500, #3D8A5A)
        └── Table
            ├── Column Headers: Description | Category (w:110) | Date (w:80) | Amount (w:80, right-aligned)
            │   (Outfit 11px/600, #9C9B99, padding:12px 28px)
            └── Rows (padding:14px 28px, bottom-border #E5E4E1):
                1. Sushi Palace | Dining | Feb 28 | -$85.40
                2. Amazon Order | Shopping | Feb 27 | -$124.99
                3. Uber Ride | Transport | Feb 26 | -$32.50
                4. Whole Foods | Groceries | Feb 25 | -$67.23
                5. Netflix | Entertainment | Feb 24 | -$15.99
                6. Starbucks | Dining | Feb 23 | -$6.75
                7. Gas Station | Transport | Feb 22 | -$45.00
                (Name: Outfit 13px/500 #1A1918, Category: 13px #6D6C6A, Date: 13px #9C9B99, Amount: 13px/500 #1A1918 right-aligned)
```

---

## How to Use This Spec

Give Claude the **screenshot image** (`exports/aMHVy.png`) along with this spec file.

**Example prompt:**
> Here is a screenshot of my dashboard design and its specification. Please generate a React/Next.js component that implements this dashboard using Tailwind CSS. Use the Outfit font from Google Fonts. The data should come from props. Include the donut/pie chart using a charting library like recharts or a custom SVG implementation.
