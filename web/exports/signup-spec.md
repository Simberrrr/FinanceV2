# Sign Up Page – Design Specification

**Screenshot**: `exports/ODuEE.png` (2880x1800 @2x)

---

## Global Styles

- **Dimensions**: 1440 x 900px
- **Background**: `#F5F4F1` (warm grey)
- **Font**: `Outfit` (Google Font)
- **Card**: centered, 420px wide, 40px padding, 16px corner radius
- **Card shadow**: `0 4px 24px rgba(26, 25, 24, 0.06)`
- **Card fill**: `#FFFFFF`

### Color Palette (same as Sign In page)

| Token | Hex | Usage |
|-------|-----|-------|
| Text primary | `#1A1918` | Headings, labels, button fill |
| Text secondary | `#6D6C6A` | Terms text |
| Text muted | `#9C9B99` | Placeholders, subtitle |
| Accent green | `#4D9B6A` | Logo icon, "Sign in" link |
| Input bg | `#FAFAF9` | Input field background |
| Input border | `#E5E4E1` | Input field stroke |
| Page bg | `#F5F4F1` | Full page background |
| Button fill | `#1A1918` | Create Account button |
| Button text | `#FFFFFF` | Button label |

---

## Layout Structure

```
Page (1440x900, centered, bg #F5F4F1)
└── Card (420px wide, vertical, gap:32, padding:40, cornerRadius:16, white, shadow)
    │
    ├── Header (vertical, gap:8, center-aligned)
    │   ├── Logo Row (horizontal, gap:8)
    │   │   ├── Wallet Icon (lucide "wallet", 24px, #4D9B6A)
    │   │   └── "FinanceV2" (Outfit 20px/700, #1A1918)
    │   ├── "Create an account" (Outfit 28px/700, #1A1918, letterSpacing:-0.5)
    │   └── "Get started with your free account" (Outfit 14px, #9C9B99)
    │
    ├── Form (vertical, gap:16, full-width)
    │   ├── Username Group (vertical, gap:6)
    │   │   ├── "Username" (Outfit 13px/500, #1A1918)
    │   │   └── Input (horizontal, cornerRadius:10, bg:#FAFAF9, border:#E5E4E1, padding:12px 14px)
    │   │       ├── User Icon (lucide "user", 18px, #9C9B99)
    │   │       └── "Choose a username" (Outfit 14px, #9C9B99)
    │   │
    │   ├── Email Group (vertical, gap:6)
    │   │   ├── "Email" (Outfit 13px/500, #1A1918)
    │   │   └── Input (horizontal, cornerRadius:10, bg:#FAFAF9, border:#E5E4E1, padding:12px 14px)
    │   │       ├── Mail Icon (lucide "mail", 18px, #9C9B99)
    │   │       └── "you@example.com" (Outfit 14px, #9C9B99)
    │   │
    │   ├── Password Group (vertical, gap:6)
    │   │   ├── "Password" (Outfit 13px/500, #1A1918)
    │   │   └── Input (horizontal, cornerRadius:10, bg:#FAFAF9, border:#E5E4E1, padding:12px 14px)
    │   │       ├── Lock Icon (lucide "lock", 18px, #9C9B99)
    │   │       ├── "Create a password" (Outfit 14px, #9C9B99, fill-width)
    │   │       └── Eye-off Icon (lucide "eye-off", 18px, #9C9B99)
    │   │
    │   └── Confirm Password Group (vertical, gap:6)
    │       ├── "Confirm Password" (Outfit 13px/500, #1A1918)
    │       └── Input (horizontal, cornerRadius:10, bg:#FAFAF9, border:#E5E4E1, padding:12px 14px)
    │           ├── Lock Icon (lucide "lock", 18px, #9C9B99)
    │           ├── "Confirm your password" (Outfit 14px, #9C9B99, fill-width)
    │           └── Eye-off Icon (lucide "eye-off", 18px, #9C9B99)
    │
    └── Actions (vertical, gap:16, center-aligned, full-width)
        ├── Terms Row (horizontal, gap:8, center-aligned)
        │   ├── Checkbox (18x18, cornerRadius:5, bg:#FAFAF9, border:#E5E4E1)
        │   └── "I agree to the Terms of Service and Privacy Policy" (Outfit 12px, #6D6C6A)
        ├── Create Account Button (full-width, h:44, cornerRadius:10, bg:#1A1918)
        │   ├── "Create Account" (Outfit 15px/600, #FFFFFF)
        │   └── Arrow-right Icon (lucide "arrow-right", 18px, #FFFFFF)
        └── Sign In Row (horizontal, gap:4)
            ├── "Already have an account?" (Outfit 13px, #9C9B99)
            └── "Sign in" (Outfit 13px/600, #4D9B6A)
```

---

## How to Use This Spec

Give Claude the **screenshot image** (`exports/ODuEE.png`) along with this spec file.

**Example prompt:**
> Here is a screenshot of my sign-up page design and its specification. Please generate a React/Next.js component using Tailwind CSS with the Outfit font from Google Fonts. Include form validation (username min length, email format, password strength, confirm match), password visibility toggles, terms checkbox validation, and link routing to the sign-in page. Use lucide-react for icons.
