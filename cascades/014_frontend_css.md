Extract all CSS from the prototype into public/css/styles.css.

Read the prototype at `prototype/eacr_response_framework_prototype_v_2.html` and extract ALL CSS from the `<style>` tag into `public/css/styles.css`.

Copy the CSS exactly as-is, including:
1. All CSS custom properties (:root variables with colors, shadows, radius)
2. All component styles (panels, sidebar, main, inspector, cards, etc.)
3. All the section color variables (--color-0 through --color-4, --active-color)
4. All the color-mix() functions for dynamic theming
5. All media queries for responsive layout
6. The form inputs, buttons, typography styles

Also add at the top:
```css
/* Loading state */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-size: 18px;
  color: var(--muted);
}
.loading-overlay.hidden { display: none; }
```

Test: Start server and open the page - it should show the layout structure even without JS.

Commit: "014: Extract all CSS to styles.css"
