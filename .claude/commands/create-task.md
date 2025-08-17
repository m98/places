# Create Task

1. Create the directory `.claude/tasks/$ARGUMENTS/` (if it doesn’t exist).
2. Duplicate `.claude/templates/task_template.md` to `.claude/tasks/$ARGUMENTS/task.md`.
3. Parse all `##` headings in `task_template.md` and prompt the user ONE SECTION AT A TIME.
4. Insert each answer into the corresponding section of `task.md`, saving after each update.
5. Iterate refinements based on user feedback until approved, then keep the final file at `.claude/tasks/$ARGUMENTS/task.md`.
6. Refine and improve user response to make it more concise, clear, and actionable, having consistency with rest of tasks defined.
7. Exception: if the user preferred to fill in the task file themselves, then just create the directory and the file, and return the path to the user.
