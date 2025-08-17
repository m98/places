# Claude Development Guidelines

## Project Overview
This is a highly maintainable and type-safe Next.js application built with TypeScript. All development work should adhere to strict best practices to maintain a clean, efficient, and scalable codebase.

## Special Command Exception
**Important:** These guidelines do NOT apply when working with the `/create-task` custom command. That command follows its own separate workflow.

## Task Execution Workflow

### Phase 1: Understanding & Clarification
When given a new task:

1. **Ask clarifying questions** - Always ask 2 conceptual and 2 technical questions to:
    - Better understand the requirements
    - Clarify any ambiguities or vague aspects
    - Ensure alignment on expected outcomes

2. **Challenge and refine** - After initial questions:
    - Present your understanding and approach
    - Challenge assumptions where appropriate
    - Seek feedback, opinions, and guidance to refine the task scope

### Phase 2: Planning & Implementation
1. **Identify scope** - Determine which files and functions require modification
2. **Create execution plan** - Prepare a detailed step-by-step plan and save it as `execution_plan.md` in the same directory as the task file
3. **Implement incrementally** - Execute the task in small, sequential phases to ensure quality and enable early feedback
4. **Request testing** - Once all phases are complete, ask the user to run tests and verification checks

### Phase 3: Completion & Documentation
1. **Verification** - Ask the user to:
    - Run the appropriate test commands
    - Verify that all functionality works as expected
    - Confirm no regressions were introduced

2. **Document changes** - After successful verification:
    - Write a brief, conceptual summary of changes made
    - Focus on the "what" and "why" rather than technical implementation details
    - Save this summary as `implementation_summary.md` in the same directory as the task file
    - This serves as a memory blueprint for future development cycles

## Development Principles

### Code Quality Standards
- **Minimal changes**: Keep modifications surgical and precise
- **No unnecessary refactoring**: Avoid renaming, restyling, or restructuring unless explicitly requested
- **Respect existing patterns**: Follow established project structure and coding practices
- **Type safety**: Maintain strict TypeScript compliance
- **Testing**: Ensure all changes are properly tested

### File Organization
- Store task-related documentation (`execution_plan.md`, `implementation_summary.md`) alongside task files
- Maintain consistent file naming and directory structure
- Follow existing import/export patterns

### Communication
- Provide clear, actionable feedback requests
- Explain reasoning behind technical decisions when relevant
- Ask for confirmation before making significant architectural changes