This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Accounting Demo Access Setup

The accounting workspace uses Supabase Auth. Demo users sign in anonymously and can read accounting data; database policies only allow writes for staff users with the trusted `app_metadata.accounting_role` claim set to `admin`.

Before deploying the demo login:

1. Enable **Anonymous Sign-Ins** in the Supabase project's Authentication settings.
2. Apply `supabase/migrations/20261113120000_secure_accounting_demo_access.sql` after the accounting tables (`invoices`, `parties`, `items`, `purchase_invoices`, and `leads`) exist.
3. Create staff users in Supabase Auth and set their **app metadata** to include `{"accounting_role":"admin"}`. Do not set this in user metadata or expose an admin/service-role key in the browser.

If the migration has not been applied, or anonymous sign-ins are disabled, the login and data access errors are shown in the UI.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
