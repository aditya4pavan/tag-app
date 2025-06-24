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

const {
  CognitoIdentityProviderClient,
  AdminSetUserPasswordCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const {
  DynamoDBClient
} = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");

const cognito = new CognitoIdentityProviderClient({});
const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const PASSWORD_AUDIT_TABLE = process.env.PASSWORD_AUDIT_TABLE; // set this in env vars

exports.handler = async (event) => {
  const { username, password } = event.arguments;

  // Step 1: Admin reset password (force change at next login)
  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: process.env.USER_POOL_ID,
    Username: username,
    Password: password,
    Permanent: false // Forces new password challenge on login
  }));

  // Step 2: Update audit table
  const now = new Date().toISOString();

  await ddbClient.send(new UpdateCommand({
    TableName: PASSWORD_AUDIT_TABLE,
    Key: { userName: username }, // assuming this is the partition key
    UpdateExpression: `SET lastReset = :now, resetInitiatedByAdmin = :admin, passwordChanged = :changed`,
    ExpressionAttributeValues: {
      ':now': now,
      ':admin': true,
      ':changed': false
    }
  }));

  return `Password reset initiated for ${username}`;
};

