Ensure mobile-first responsive layout works correctly.

Review and fix the CSS media queries in `public/css/styles.css`:

1. Verify these breakpoints exist:
```css
@media (max-width: 1200px) {
  .app { grid-template-columns: 280px 1fr; }
  .inspector { grid-column: 1 / -1; min-height: auto; }
}

@media (max-width: 820px) {
  .app { grid-template-columns: 1fr; }
  .sidebar, .main, .inspector { min-height: auto; }
  .inline-grid, .intake-grid { grid-template-columns: 1fr; }
}
```

2. Add additional mobile improvements:
```css
@media (max-width: 820px) {
  .sidebar-summary { grid-template-columns: repeat(3, 1fr); }
  .section-chip { padding: 8px; }
  .section-chip-number { font-size: 14px; }
  .section-chip-name { font-size: 11px; }
  .toolbar { padding: 12px; }
  .toolbar-title h2 { font-size: 18px; }
  .panel-header { padding: 14px; }
  .mini-point { padding: 12px; }
}

@media (max-width: 480px) {
  .app { padding: 8px; gap: 8px; }
  .sidebar-summary { grid-template-columns: repeat(2, 1fr); }
}
```

3. Ensure all text inputs and textareas have proper sizing on mobile (min width, no overflow)
4. Ensure buttons are tap-friendly (min 44px touch target)

Commit: "028: Mobile-first responsive layout fixes"
