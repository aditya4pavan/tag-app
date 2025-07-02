const {
  CognitoIdentityProviderClient,
  AdminSetUserPasswordCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');

const crypto = require('crypto');

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });
const ddbClient = new DynamoDBClient({ region: process.env.REGION });

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

exports.handler = async (event) => {
  try {
    const { username, password } = event.arguments;
    const userPoolId = process.env.AUTH_LVAR78525F17_USERPOOLID;
    const tableName = process.env.API_LVAR_USERPASSWORDAUDITTABLE_NAME;

    // 1. Reset in Cognito
    await cognitoClient.send(new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: false,
    }));

    const hashedPassword = hashPassword(password);
    const timestamp = new Date().toISOString();

    // 2. Check if item exists
    const getResult = await ddbClient.send(new GetItemCommand({
      TableName: tableName,
      Key: { id: { S: username } },
    }));

    if (!getResult.Item) {
      // 3a. Create new item
      await ddbClient.send(new PutItemCommand({
        TableName: tableName,
        Item: {
          id: { S: username },
          userName: { S: username },
          issuedAt: { S: timestamp },
          resetInitiatedByAdmin: { BOOL: true },
          passwordHashes: {
            L: [{
              M: {
                hash: { S: hashedPassword },
                timestamp: { S: timestamp }
              }
            }]
          },
        },
      }));
    } else {
      // 3b. Append to existing item
      await ddbClient.send(new UpdateItemCommand({
        TableName: tableName,
        Key: { id: { S: username } },
        UpdateExpression: `
          SET issuedAt = :ts,
              resetInitiatedByAdmin = :true,
              passwordHashes = list_append(if_not_exists(passwordHashes, :empty), :entry)
        `,
        ExpressionAttributeValues: {
          ':ts': { S: timestamp },
          ':true': { BOOL: true },
          ':empty': { L: [] },
          ':entry': {
            L: [{
              M: {
                hash: { S: hashedPassword },
                timestamp: { S: timestamp }
              }
            }]
          }
        }
      }));
    }

    return `Password reset successfully for user: ${username}`;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error('Failed to reset password: ' + error.message);
  }
};
