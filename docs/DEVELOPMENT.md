# Tour Web - Development Guide

## 🎨 Design System

### Color Palette (Orange-Blue Theme)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Orange | `#F97316` | CTAs, Highlights, Prices |
| Primary Orange Dark | `#EA580C` | Hover states |
| Primary Orange Light | `#FFF7ED` | Backgrounds |
| Secondary Blue | `#2563EB` | Links, Info |
| Secondary Blue Dark | `#1D4ED8` | Hover states |
| Secondary Blue Light | `#EFF6FF` | Backgrounds |
| Text Primary | `#1F2937` | Main text |
| Text Secondary | `#6B7280` | Subtitles |
| Background | `#FFFFFF` | Main background |
| Background Alt | `#F9FAFB` | Section backgrounds |

### Typography

- **Headings:** Font-bold, tracking-tight
- **Body:** Font-normal, leading-relaxed
- **Thai Font:** Noto Sans Thai (Google Fonts)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── tours/              # Tour pages
│   ├── about/              # About page
│   └── contact/            # Contact page
├── components/
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Navbar.tsx
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   └── home/               # Homepage specific
│       ├── Hero.tsx
│       ├── FeaturedTours.tsx
│       └── ...
├── lib/                    # Utilities
│   ├── api.ts
│   └── utils.ts
└── types/                  # TypeScript types
    └── index.ts
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Extra large |

## ⚡ Performance Guidelines

1. **Images:** Use `next/image` with proper sizing
2. **Fonts:** Use `next/font` for Google Fonts
3. **Static Pages:** Use SSG where possible
4. **Dynamic Pages:** Use ISR with revalidate
5. **Components:** Lazy load below-fold content

## 🔍 SEO Checklist

- [ ] Meta titles & descriptions
- [ ] Open Graph tags
- [ ] Structured data (JSON-LD)
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Canonical URLs
