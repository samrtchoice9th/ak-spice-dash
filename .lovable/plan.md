

# Theme Color Change — Teal Palette

## Color Palette (from uploaded image)
- **#265073** — Deep navy teal (darkest)
- **#2D9596** — Teal (primary)
- **#9AD0C2** — Soft mint (secondary/accent)
- **#ECF4D6** — Pale lime cream (lightest)

## HSL Conversions
- `#265073` → 207 51% 30% — primary (buttons, headings)
- `#2D9596` → 180 53% 38% — ring, sidebar primary, active states
- `#9AD0C2` → 160 38% 71% — accent, secondary
- `#ECF4D6` → 80 56% 90% — muted, background tints

## Changes — `src/index.css`

### Light mode `:root`
| Variable | New HSL | Mapped from |
|----------|---------|-------------|
| `--primary` | `207 51% 30%` | #265073 — buttons, nav active |
| `--primary-foreground` | `80 56% 90%` | #ECF4D6 — text on primary |
| `--secondary` | `160 38% 92%` | Lighter #9AD0C2 tint |
| `--secondary-foreground` | `207 51% 30%` | #265073 |
| `--accent` | `160 38% 92%` | Light mint |
| `--accent-foreground` | `207 51% 30%` | #265073 |
| `--muted` | `80 30% 94%` | Subtle cream |
| `--muted-foreground` | `207 20% 46%` | Muted teal-gray |
| `--ring` | `180 53% 38%` | #2D9596 |
| `--border` | `160 20% 88%` | Soft mint border |
| `--input` | `160 20% 88%` | Match border |
| `--sidebar-background` | `207 51% 30%` | Deep navy |
| `--sidebar-foreground` | `80 56% 90%` | Cream text |
| `--sidebar-primary` | `180 53% 38%` | Teal highlight |
| `--sidebar-primary-foreground` | `0 0% 100%` | White |
| `--sidebar-accent` | `207 40% 25%` | Darker navy |
| `--sidebar-accent-foreground` | `80 56% 90%` | Cream |
| `--sidebar-border` | `207 30% 35%` | Navy border |
| `--sidebar-ring` | `180 53% 38%` | Teal |

### Dark mode `.dark`
| Variable | New HSL | Notes |
|----------|---------|-------|
| `--background` | `207 51% 8%` | Very dark navy |
| `--foreground` | `80 30% 92%` | Off-white cream |
| `--card` | `207 45% 12%` | Dark card |
| `--primary` | `180 53% 38%` | Teal buttons |
| `--primary-foreground` | `207 51% 8%` | Dark text on teal |
| `--secondary` | `207 30% 18%` | Dark secondary |
| `--accent` | `207 30% 18%` | Dark accent |
| `--muted` | `207 30% 18%` | Dark muted |
| `--muted-foreground` | `160 20% 60%` | Soft mint text |
| `--border` | `207 30% 20%` | Dark border |
| `--ring` | `180 53% 38%` | Teal ring |
| `--sidebar-background` | `207 51% 6%` | Deepest navy |
| `--sidebar-primary` | `180 53% 45%` | Brighter teal |

### Background/foreground/card/popover remain white/dark as base — only accent colors change.

## Files Changed
| File | Change |
|------|--------|
| `src/index.css` | Update all CSS custom properties in `:root` and `.dark` |

One file, no logic changes. Pure color token update.

