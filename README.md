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







Description:
As a developer,
I want to replace the AWS Cognito login screen with a custom login screen,
so that I can provide a more tailored user experience for authentication.

Acceptance Criteria:

Given the current LVAR application uses AWS Cognito for login,
When the login screen is accessed,
Then a custom login screen is displayed instead of the default Cognito-hosted UI.

Given a user enters valid credentials on the custom login screen,
When they submit the form,
Then the system authenticates the user using AWS Cognito behind the scenes.

Given a user enters invalid credentials on the custom login screen,
When they attempt to log in,
Then the system displays appropriate error messages.

Given the custom login screen is implemented,
When a user logs in successfully,
Then they should be redirected to the application's main dashboard.







Given the current LVAR application uses standalone tables,
Then replace all tables with a reusable table widget featuring pagination, sorting, and filtering for a consistent user experience.

Given the application makes non-GraphQL network requests,
Then implement a standardized retry mechanism with exponential backoff and user-friendly error handling.
