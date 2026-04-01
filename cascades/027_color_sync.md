Ensure the color context synchronization works correctly across all UI elements.

The active section color must dynamically update these elements:
1. Sidebar section chip (active state)
2. Question config shell border and background
3. Criteria shell border and background
4. Scoring shell border and background
5. Toolbar background gradient
6. Total score box

Review and fix the CSS to ensure:
1. All shells use `var(--active-color)` with `color-mix()` for backgrounds and borders
2. The `updateActiveColor()` function in state.js properly sets `--active-color` on document root
3. When switching sections, all colored elements update immediately

Check that the CSS has these rules (from prototype):
```css
.criteria-shell {
  background: linear-gradient(180deg, color-mix(in srgb, var(--active-color) 14%, white) 0%, color-mix(in srgb, var(--active-color) 5%, white) 100%);
  border: 2px solid var(--active-color);
}

.question-config-shell {
  background: linear-gradient(180deg, color-mix(in srgb, var(--active-color) 14%, white) 0%, color-mix(in srgb, var(--active-color) 5%, white) 100%);
  border: 2px solid var(--active-color);
}

.card.scoring-shell {
  background: linear-gradient(180deg, color-mix(in srgb, var(--active-color) 14%, white) 0%, color-mix(in srgb, var(--active-color) 5%, white) 100%);
  border: 2px solid var(--active-color);
}

.toolbar {
  background: linear-gradient(180deg, color-mix(in srgb, var(--active-color) 10%, white) 0%, color-mix(in srgb, var(--active-color) 4%, white) 100%);
}

.totals {
  background: color-mix(in srgb, var(--active-color) 10%, white);
  border: 1px solid color-mix(in srgb, var(--active-color) 28%, white);
}
```

Also ensure the intake card keeps its special blue styling when active (section 0).

Commit: "027: Fix and verify color context synchronization"
