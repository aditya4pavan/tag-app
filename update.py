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



const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

exports.handler = async (event) => {
  const username = event.userName;
  const tableName = process.env.API_LVAR_USERPASSWORDAUDITTABLE_NAME;
  const now = Date.now();

  try {
    // 1. Get audit record
    const { Item } = await ddbClient.send(new GetItemCommand({
      TableName: tableName,
      Key: { id: { S: username } }
    }));

    if (!Item) {
      console.warn(`Audit record not found for ${username}, allowing login.`);
      return event; // no record → allow login (or optionally deny)
    }

    // 2. Extract values
    const parseTime = (val) => val?.S ? new Date(val.S).getTime() : null;
    const issuedAt = parseTime(Item.issuedAt);
    const lastReset = parseTime(Item.lastReset);
    const accountLocked = Item.accountLocked?.BOOL || false;
    const failedAttempts = Item.failedAttempts?.N ? parseInt(Item.failedAttempts.N) : 0;

    // 3. Business rules
    if (accountLocked) {
      throw new Error('Your account is locked due to multiple failed login attempts.');
    }

    if (issuedAt && !lastReset && now - issuedAt > 24 * 60 * 60 * 1000) {
      throw new Error('Temporary password expired. Please contact support.');
    }

    if (lastReset && now - lastReset > 180 * 24 * 60 * 60 * 1000) {
      throw new Error('Your password has expired. Please reset your password.');
    }

    // 4. Increment failed attempts
    const newAttempts = failedAttempts + 1;
    const lockUser = newAttempts >= 6;

    await ddbClient.send(new UpdateItemCommand({
      TableName: tableName,
      Key: { id: { S: username } },
      UpdateExpression: `
        SET failedAttempts = :fa,
            accountLocked = :al
      `,
      ExpressionAttributeValues: {
        ':fa': { N: newAttempts.toString() },
        ':al': { BOOL: lockUser }
      }
    }));

    return event;

  } catch (error) {
    console.error(`Pre-auth failure for ${username}:`, error.message);
    throw error;
  }
};
