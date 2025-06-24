const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand
} = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  const username = event.userName;
  const tableName = process.env.USER_PASSWORD_AUDIT_TABLE;

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { userName: username }
      })
    );

    const record = result.Item;

    if (record && record.resetInitiatedByAdmin) {
      const lastResetTime = new Date(record.lastReset).getTime();
      const now = Date.now();
      const hoursSinceReset = (now - lastResetTime) / (1000 * 60 * 60);

      if (hoursSinceReset >= 24) {
        // ❌ block login
        throw new Error('Password reset expired. Please contact admin for a new reset.');
      }
    }

    return event; // ✅ allow login

  } catch (err) {
    console.error('PreAuth block reason:', err);
    throw err; // 🔒 blocks login
  }
};
