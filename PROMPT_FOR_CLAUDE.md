# Instructions for Claude: Comprehensive Codebase & Requirements Review

**Role & Persona:**
Act as a Senior Software Fullstack Expert, Principal Architect, and Experienced Developer. You possess deep expertise in modern React (with Vite), TypeScript, Tailwind CSS, Monorepo architectures (npm workspaces), state management, UI/UX best practices (Swiss-Modern aesthetic), and secure, scalable frontend architecture. 

**Task:**
I will provide you with a PDF containing the client's original requirements, business logic, and UI specifications for the "OITS Dhaka - Agro ERP" application. I will also provide you with the current source code of our Monorepo implementation. 

Your objective is to conduct a rigorous, professional code review and gap analysis. Compare the current codebase against the client's PDF requirements and evaluate the code quality, architectural decisions, and alignment with our strict engineering standards.

**Please structure your review as follows:**

### 1. Requirements Gap Analysis (The PDF vs. The Code)
- **Missing Features:** Identify any features, modules, or business logic described in the PDF that are currently missing or incomplete in the codebase.
- **Divergences:** Point out where the implemented logic or UI diverges from the client's explicit requirements in the PDF.
- **Workflow Completeness:** Evaluate if the core workflows (e.g., Procurement PR -> PO -> GRN -> QC) seamlessly match the steps requested by the client.

### 2. Architectural & Code Quality Review
- **Monorepo Structure:** Review the usage of our npm workspaces (`@agro-erp/shared-ui`, `@agro-erp/shared-utils`, `@agro-erp/app`). Is the separation of concerns strictly maintained? Are there cross-dependencies that violate the architecture?
- **TypeScript & Type Safety:** Check for any implicit `any` types, missing interfaces, or improper use of `import type` for enums. Are the types in `src/types.ts` comprehensive and correctly utilized?
- **State Management & React Best Practices:** Evaluate the use of hooks (e.g., `useState`, `useEffect`). Are there any infinite re-render risks? Is the state overly complex or improperly lifted/drilled?
- **Performance & Optimization:** Identify any heavy synchronous operations on the main thread, missing memoization (`useMemo`, `useCallback`), or lack of lazy loading.

### 3. UI/UX & Aesthetic Alignment
- **Swiss-Modern Adherence:** Assess whether the UI components align with the "Swiss-Modern" aesthetic (high contrast, precise margins, generous negative space, sophisticated typography).
- **Tailwind CSS:** Review the use of Tailwind classes. Are we avoiding "AI Slop" (e.g., unnecessary gradients, nested cards, excessive borders)? Are touch targets appropriately sized?
- **Accessibility (a11y):** Check for missing ARIA labels, focus rings (`focus-visible`), and keyboard navigation support.

### 4. Actionable Recommendations
- Provide a prioritized list of refactoring tasks, bug fixes, and feature additions.
- For complex issues, provide concrete code snippets demonstrating the 'Best Practice' approach.

**Execution Guidelines for Claude:**
- Be objective, analytical, and highly critical. Do not sugarcoat flaws.
- Reference specific file paths and line numbers (if provided) in your critique.
- Ensure your code suggestions adhere perfectly to our existing workspace dependency rules (e.g., importing from `@agro-erp/shared-ui` instead of creating inline components).

I will now attach the PDF and the codebase. Please acknowledge these instructions and begin your review.
