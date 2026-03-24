# Statements Page – Design Specification

**Screenshot**: `exports/uL990.png` (2x, 1440x982)

## Page Layout
- **Size**: 1440 x 982px
- **Background**: `#F5F4F1`
- **Layout**: Vertical flexbox, clipped
- **Font**: Outfit throughout

## Color Palette (same as dashboard)
- Primary text: `#1A1918`
- Secondary text: `#6D6C6A`
- Muted text: `#9C9B99`
- Accent green: `#4D9B6A`
- Background: `#F5F4F1`
- Card background: `#FFFFFF`
- Border/divider: `#E5E4E1`
- Card shadow: `0 2px 12px rgba(26, 25, 24, 0.03)`
- Card corner radius: 16px

---

## Top Nav Bar
- **Height**: 56px, full width
- **Background**: `#FFFFFF`
- **Padding**: 0 40px
- **Layout**: Horizontal, space-between, vertically centered

### Left Group (gap: 16px)
1. **Back Button** (gap: 6px, horizontally centered)
   - Arrow-left icon (lucide): 16x16, fill `#6D6C6A`
   - "Dashboard" text: Outfit 13px/500, `#6D6C6A`
   - This navigates back to the dashboard (`/dashboard`)
2. **Page Title**: "Statements", Outfit 18px/600, `#1A1918`

### Right Group (gap: 16px)
- Logout icon (lucide `log-out`): 18x18, fill `#9C9B99`

---

## Metrics Section
- **Padding**: 28px 40px
- **Layout**: Horizontal, gap 20px
- **3 cards**, each `fill_container` width

### Card Style (shared)
- Background: `#FFFFFF`
- Corner radius: 16px
- Padding: 24px
- Shadow: `0 2px 12px rgba(26, 25, 24, 0.03)`
- Layout: Vertical, gap 8px

### Card 1 – Total Statements
- Label: "Total Statements", Outfit 12px/500, `#9C9B99`
- Value: "12", Outfit 32px/700, `#1A1918`, letter-spacing -1
- Subtitle: "+3 this month", Outfit 12px/500, `#4D9B6A`

### Card 2 – This Month
- Label: "This Month", Outfit 12px/500, `#9C9B99`
- Value: "3", Outfit 32px/700, `#1A1918`, letter-spacing -1
- Subtitle: "Uploaded in March", Outfit 12px/500, `#4D9B6A`

### Card 3 – Total Transactions
- Label: "Total Transactions", Outfit 12px/500, `#9C9B99`
- Value: "284", Outfit 32px/700, `#1A1918`, letter-spacing -1
- Subtitle: "Across all statements", Outfit 12px/500, `#6D6C6A`

---

## Statements Table Card
- **Container padding**: 0 40px 40px 40px
- **Card**: fill width, fill height, white, 16px radius, clipped, same shadow
- **Layout**: Vertical

### Table Header
- Padding: 20px 28px
- Layout: Horizontal, space-between, vertically centered
- Bottom border: 1px `#E5E4E1`
- **Title**: "Uploaded Statements", Outfit 16px/600, `#1A1918`
- **Upload Button** (right side):
  - Background: `#1A1918`, corner radius 8px
  - Padding: 8px 14px, gap 6px
  - Upload icon (lucide): 14x14, white
  - "Upload" text: Outfit 13px/500, white

### Column Headers Row
- Padding: 12px 28px
- Bottom border: 1px `#E5E4E1`
- All headers: Outfit 11px/600, `#9C9B99`, uppercase feel
- Columns:
  1. **File Name** – flex fill
  2. **Uploaded** – 100px fixed
  3. **Transactions** – 100px fixed
  4. **Date Range** – 140px fixed

### Table Rows
- Padding: 14px 28px each
- Bottom border: 1px `#E5E4E1` (except last row)
- Vertically centered

#### Row Structure:
1. **File Name cell** (flex fill, horizontal, gap 10px, centered):
   - File icon (lucide `file-text`): 16x16, `#9C9B99`
   - File name: Outfit 13px/500, `#1A1918`
2. **Uploaded**: Outfit 13px/normal, `#9C9B99`, 100px
3. **Transactions**: Outfit 13px/500, `#1A1918`, 100px
4. **Date Range**: Outfit 13px/normal, `#6D6C6A`, 140px

### Sample Data:
| File Name | Uploaded | Transactions | Date Range |
|---|---|---|---|
| chase_feb_2026.pdf | Mar 1 | 48 | Feb 1 – Feb 28, 2026 |
| amex_feb_2026.csv | Feb 28 | 35 | Feb 1 – Feb 28, 2026 |
| wells_fargo_jan_2026.pdf | Feb 15 | 62 | Jan 1 – Jan 31, 2026 |
| chase_jan_2026.pdf | Feb 3 | 52 | Jan 1 – Jan 31, 2026 |
| amex_jan_2026.csv | Feb 1 | 41 | Jan 1 – Jan 31, 2026 |
| wells_fargo_dec_2025.pdf | Jan 15 | 46 | Dec 1 – Dec 31, 2025 |
| chase_dec_2025.pdf | Jan 5 | — | Dec 1 – Dec 31, 2025 |

---

## Implementation Notes
- The data should come from the API (list of uploaded files with metadata)
- The metrics cards should be computed from the file list data
- "Dashboard" back button should navigate to `/dashboard`
- Upload button should trigger file upload (same flow as dashboard upload)
- Logout icon navigates to `/signin`
- Date Range represents the statement period of the credit card statement
- Files are always credit card statements (PDF or CSV)
- The "—" for transactions means the file hasn't been processed yet
- Table should be scrollable if more rows than viewport
