Create the main index.html shell for the EACEA Evaluator frontend.

Read the prototype file at `prototype/eacr_response_framework_prototype_v_2.html` and create `public/index.html` based on it.

The HTML should:
1. Keep the exact same structure: .app grid with .sidebar, .main, and .inspector panels
2. Keep all the HTML elements with their IDs (sidebar, questionTitle, questionSubtitle, intakeCard, projectName, projectType, projectVersion, etc.)
3. Keep the intake card, question config shell, criteria shell, and scoring panel sections
4. Remove ALL inline `<style>` content - reference `css/styles.css` instead
5. Remove ALL inline `<script>` content - add script tags at the bottom for:
   - `<script src="js/state.js"></script>`
   - `<script src="js/api.js"></script>`
   - `<script src="js/ui/sidebar.js"></script>`
   - `<script src="js/ui/intake.js"></script>`
   - `<script src="js/ui/question-config.js"></script>`
   - `<script src="js/ui/criteria.js"></script>`
   - `<script src="js/ui/scoring.js"></script>`
   - `<script src="js/ui/versions.js"></script>`
   - `<script src="js/app.js"></script>` (MUST be last)
6. Keep the lang="es" and charset UTF-8
7. Add a loading indicator div that shows while data is loading

Do NOT add any JavaScript logic yet - just the HTML structure.

Commit: "013: Create index.html shell from prototype"
