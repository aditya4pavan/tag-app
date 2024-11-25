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



import sys
import uuid
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql.functions import col, udf
from pyspark.sql.types import StringType
import boto3

# Initialize Glue Context
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# S3 input path for the CSV
input_path = "s3://kotti-glue/co2.csv"

# DynamoDB table details
dynamodb_table_name = "CarEmissions"
partition_key = "id"  # This will be the generated UUID column

# Initialize DynamoDB client
dynamodb = boto3.client("dynamodb")

# Check if the table exists, create it if not
existing_tables = dynamodb.list_tables()["TableNames"]
if dynamodb_table_name not in existing_tables:
    print(f"Table {dynamodb_table_name} does not exist. Creating...")
    dynamodb.create_table(
        TableName=dynamodb_table_name,
        KeySchema=[
            {"AttributeName": partition_key, "KeyType": "HASH"},  # Partition key
        ],
        AttributeDefinitions=[
            {"AttributeName": partition_key, "AttributeType": "S"},  # String type
        ],
        ProvisionedThroughput={
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5,
        },
    )
    # Wait until the table is active
    print(f"Waiting for table {dynamodb_table_name} to become active...")
    dynamodb.get_waiter("table_exists").wait(TableName=dynamodb_table_name)
    print(f"Table {dynamodb_table_name} is now active.")

# Load CSV data into a Glue DynamicFrame
datasource = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": [input_path]},
    format="csv",
    format_options={"withHeader": True, "separator": ","},
    transformation_ctx="datasource"
)

# Convert DynamicFrame to Spark DataFrame for transformations
dataframe = datasource.toDF()

# Add a UUID column
generate_uuid = udf(lambda: str(uuid.uuid4()), StringType())
dataframe_with_uuid = dataframe.withColumn(partition_key, generate_uuid())

# Convert back to DynamicFrame
dynamic_frame_with_uuid = glueContext.create_dynamic_frame.from_dataframe(
    dataframe_with_uuid, glueContext
)

# Write data to DynamoDB
glueContext.write_dynamic_frame.from_options(
    frame=dynamic_frame_with_uuid,
    connection_type="dynamodb",
    connection_options={"dynamodb.output.tableName": dynamodb_table_name},
    transformation_ctx="datasink"
)

# Commit the job
job.commit()
