import uuid
import boto3
import csv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# S3 input file details
s3_bucket = "kotti-glue"
s3_key = "co2.csv"

# DynamoDB table details
dynamodb_table_name = "CarEmissions"
partition_key = "id"  # This will be the generated UUID column

# Initialize AWS clients
s3 = boto3.client("s3")
dynamodb = boto3.client("dynamodb")

# Step 1: Check if the DynamoDB table exists and create it if not
def ensure_table_exists():
    existing_tables = dynamodb.list_tables()["TableNames"]
    if dynamodb_table_name not in existing_tables:
        logger.info(f"Table {dynamodb_table_name} does not exist. Creating...")
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
        logger.info(f"Waiting for table {dynamodb_table_name} to become active...")
        dynamodb.get_waiter("table_exists").wait(TableName=dynamodb_table_name)
        logger.info(f"Table {dynamodb_table_name} is now active.")

# Step 2: Read data from S3
def read_s3_csv():
    logger.info(f"Reading CSV from S3 bucket: {s3_bucket}, key: {s3_key}")
    response = s3.get_object(Bucket=s3_bucket, Key=s3_key)
    lines = response['Body'].read().decode('utf-8').splitlines()
    csv_reader = csv.DictReader(lines)
    return list(csv_reader)

# Step 3: Batch write to DynamoDB
def batch_write_to_dynamodb(records):
    batch_size = 25
    batches = [records[i:i + batch_size] for i in range(0, len(records), batch_size)]
    
    for batch in batches:
        items = [
            {
                "PutRequest": {
                    "Item": {key: {"S": str(value)} for key, value in record.items()}
                }
            }
            for record in batch
        ]
        try:
            dynamodb.batch_write_item(RequestItems={dynamodb_table_name: items})
        except Exception as e:
            logger.error(f"Failed to write batch: {e}")
        logger.info(f"Inserted {len(batch)} records into {dynamodb_table_name}")

# Main function
def main():
    # Ensure DynamoDB table exists
    ensure_table_exists()

    # Read data from S3
    records = read_s3_csv()

    # Add UUIDs as partition keys
    for record in records:
        record[partition_key] = str(uuid.uuid4())

    # Write data to DynamoDB
    batch_write_to_dynamodb(records)

if __name__ == "__main__":
    main()
