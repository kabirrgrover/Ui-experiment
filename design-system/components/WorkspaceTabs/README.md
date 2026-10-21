# WorkspaceTabs

Folder tabs across the top of the workspace. Picking a past chat from the hanging badges opens it here as a new tab, never a new browser tab.

Each tab shows the doc code in small bold caps and a short name (truncates at 220px). The selected tab joins the white sheet below it with an `ink` outline; others sit back on `paper-sunk` with no outline. Use `role="tablist"` / `role="tab"` and `aria-selected`; arrow keys move between tabs. Close with the ×, or middle-click.
