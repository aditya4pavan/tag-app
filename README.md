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



Certainly! Here's a rephrased and more elaborate version along with a table for clarity:

---

Using AWS Lambda to perform data aggregation introduces some performance considerations. Currently, the Lambda function is configured to process 1,000 records per batch from the incoming data insertions. When a large number of records—approximately 5,000—are inserted, it takes around **15 to 20 seconds** for the aggregated results to reflect on the user interface (UI). This delay is primarily due to the time taken by Lambda to process multiple batches and update the aggregated results accordingly. Optimizing batch size, Lambda timeout configurations, or using other aggregation strategies might help mitigate this delay.

---

### Performance Metrics of AWS Lambda Aggregation:

| **Scenario**             | **Batch Size** | **Total Records Inserted** | **Time Taken to Update UI** | **Remarks**                         |
|---------------------------|----------------|-----------------------------|-----------------------------|--------------------------------------|
| Small insert              | 1,000          | 1,000                      | 3-5 seconds                | Minimal delay observed.             |
| Medium insert             | 1,000          | 3,000                      | 8-12 seconds               | Performance is acceptable.          |
| Large insert (current case)| 1,000          | 5,000                      | 15-20 seconds              | Delay noticeable; optimization needed.|

---

Possible areas for improvement include:

1. **Increase Batch Size**: Configuring Lambda to process more than 1,000 records per batch could reduce the total processing time, though it might increase memory usage.
   
2. **Parallel Processing**: Utilize parallel invocations of Lambda for different partitions of data to speed up the aggregation process.

3. **Intermediate Storage Solutions**: Use AWS services like DynamoDB Streams or Kinesis for real-time processing and aggregation.

4. **Pre-Aggregation**: Perform partial aggregations at the data insertion point to reduce the processing load on Lambda.

Would you like me to explore any specific optimization technique in detail?
