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









Here’s a JIRA ticket-style write-up with all the fixes implemented specifically in the `next.config.js` file:

---

### **JIRA Ticket**

**Ticket Title**: Fix Security Issues in Next.js Application

**Ticket Type**: Bug

**Priority**: High

---

#### **Description**

Address security vulnerabilities identified in the Next.js application. The following issues must be resolved:

1. **Clickjacking Vulnerability**: Prevent the application from being embedded in iframes on third-party websites.
2. **Insufficient Cache Control Headers**: Add appropriate headers to prevent sensitive data from being cached.
3. **Server Type and Version Leakage**: Remove or obfuscate server information from response headers.

---

#### **Acceptance Criteria**
1. All identified security vulnerabilities are resolved using configuration in the `next.config.js` file.
2. Security headers should be applied globally to all routes.

---

#### **Proposed Fix (Code Implementation)**

Update the `next.config.js` file as follows:

```javascript
module.exports = {
    async headers() {
        return [
            {
                source: '/(.*)', // Apply to all routes
                headers: [
                    // Clickjacking Protection
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY', // Prevent embedding in iframes
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "frame-ancestors 'none';", // Explicit CSP rule for iframes
                    },

                    // Cache Control for Sensitive Data
                    {
                        key: 'Cache-Control',
                        value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    },
                    {
                        key: 'Pragma',
                        value: 'no-cache',
                    },
                    {
                        key: 'Expires',
                        value: '0',
                    },

                    // Obfuscate Server Type and Version
                    {
                        key: 'Server',
                        value: 'SecureServer', // Replace with a generic value
                    },
                ],
            },
        ];
    },
};
```

---

#### **Testing Instructions**
1. **Clickjacking**:
   - Attempt to load the application in an iframe on a third-party website.
   - Confirm that the iframe refuses to load due to the `X-Frame-Options` and `Content-Security-Policy` headers.
   
2. **Cache Control**:
   - Inspect the HTTP response headers in the browser’s developer tools.
   - Verify that `Cache-Control`, `Pragma`, and `Expires` headers are correctly set to prevent caching.

3. **Server Information Leakage**:
   - Inspect the HTTP response headers.
   - Confirm that the `Server` header is set to `SecureServer` and `X-Powered-By` is not present.

---

#### **Done Criteria**
- All identified vulnerabilities are mitigated.
- Security headers are added and verified across all routes.
- Changes are reviewed and tested before merging into production.

---

Let me know if further changes are required!
