This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

Summary: Implement Pagination for Bank Payment Items in the UI

Description:
Currently, the UI displays up to 1000 bank payment items, but each bank can have up to 50,000 records. Update the UI to include pagination functionality, allowing users to view 100 records per page. The API should fetch data in chunks of 100 records to support this pagination mechanism.

Requirements:

Add pagination controls (e.g., next, previous, and page number navigation) to the UI.
Fetch 100 records at a time from the API and display them on the corresponding page.
Ensure smooth navigation between pages without performance degradation.
Handle edge cases such as no records, last page navigation, and error scenarios.
Acceptance Criteria:

Users can navigate between pages to view bank payment items.
Each page displays exactly 100 records unless it is the last page.
API calls fetch data dynamically based on the selected page.
Error handling and loading states are implemented for a seamless user experience.
Priority: High
Assignee: [Assign to appropriate team member]
Labels: Pagination, UI Enhancement, Banking Module

Summary: Improve Test Coverage for results/slice.ts, History.tsx, and search/slice.ts

Description:
The current test coverage for the following files is below 40%:

results/slice.ts
History.tsx
search/slice.ts
Enhance the test suite to increase coverage to at least 80%. This includes writing unit tests, integration tests, and ensuring edge cases are handled properly.

Requirements:

Write unit tests for all critical functions and components in the mentioned files.
Test edge cases, error handling, and data flow.
Verify the tests cover a variety of scenarios (e.g., empty results, successful operations, error states).
Generate a code coverage report to confirm improvements.
Acceptance Criteria:

Test coverage for results/slice.ts, History.tsx, and search/slice.ts is at least 80%.
All new tests are documented and follow the team's testing standards.
No existing functionality is broken by the new tests.
