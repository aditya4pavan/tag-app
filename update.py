const { DynamoDBClient, BatchGetItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({});

exports.handler = async (event) => {
  const tableName = process.env.TABLE_NAME || "LvarPaymentItem-dev"; // Update as needed
  const keys = event.arguments.keys;

  const keysFormatted = keys.map(k => ({
    businessDate: { S: k.businessDate },
    SSN: { S: k.SSN }
  }));

  const command = new BatchGetItemCommand({
    RequestItems: {
      [tableName]: {
        Keys: keysFormatted
      }
    }
  });

  const result = await client.send(command);
  const existing = result.Responses?.[tableName] || [];

  return existing.map(item => ({
    businessDate: item.businessDate.S,
    SSN: item.SSN.S
  }));
};
