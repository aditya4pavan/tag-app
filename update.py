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



const {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  PutItemCommand
} = require('@aws-sdk/client-dynamodb');

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

exports.handler = async (event) => {
  const username = event.userName;
  const tableName = process.env.API_LVAR_USERPASSWORDAUDITTABLE_NAME;
  const now = Date.now();

  try {
    // 1. Fetch audit record
    const { Item } = await ddbClient.send(new GetItemCommand({
      TableName: tableName,
      Key: { id: { S: username } }
    }));

    if (!Item) {
      // 2. If audit record doesn't exist, create one with failedAttempts = 1
      await ddbClient.send(new PutItemCommand({
        TableName: tableName,
        Item: {
          id: { S: username },
          userName: { S: username },
          failedAttempts: { N: '1' },
          accountLocked: { BOOL: false },
          resetInitiatedByAdmin: { BOOL: false },
        }
      }));

      console.warn(`Audit record not found for ${username}, created new record with failedAttempts = 1.`);
      return event;
    }

    // 3. Parse existing data
    const parseTime = (val) => val?.S ? new Date(val.S).getTime() : null;
    const issuedAt = parseTime(Item.issuedAt);
    const lastReset = parseTime(Item.lastReset);
    const failedAttempts = Item.failedAttempts?.N ? parseInt(Item.failedAttempts.N) : 0;
    const accountLocked = Item.accountLocked?.BOOL || false;

    // 4. Security checks
    if (accountLocked) {
      throw new Error("Your account is locked due to multiple failed login attempts.");
    }

    if (issuedAt && !lastReset && now - issuedAt > 24 * 60 * 60 * 1000) {
      throw new Error("Temporary password has expired. Please contact your administrator.");
    }

    if (lastReset && now - lastReset > 180 * 24 * 60 * 60 * 1000) {
      throw new Error("Your password has expired. Please reset your password.");
    }

    // 5. Increment failedAttempts and lock if >= 6
    const newFailedAttempts = failedAttempts + 1;
    const shouldLock = newFailedAttempts >= 6;

    await ddbClient.send(new UpdateItemCommand({
      TableName: tableName,
      Key: { id: { S: username } },
      UpdateExpression: `
        SET failedAttempts = :fa,
            accountLocked = :locked
      `,
      ExpressionAttributeValues: {
        ':fa': { N: newFailedAttempts.toString() },
        ':locked': { BOOL: shouldLock }
      }
    }));

    console.log(`Failed attempt ${newFailedAttempts} for ${username}. AccountLocked: ${shouldLock}`);
    return event;

  } catch (error) {
    console.error(`Pre-auth error for ${username}:`, error.message);
    throw error;
  }
};


const updateUserPasswordAudit = async (authUser) => {
  const {
    DynamoDBClient,
    GetItemCommand,
    UpdateItemCommand
  } = require('@aws-sdk/client-dynamodb');

  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const tableName = process.env.API_LVAR_USERPASSWORDAUDITTABLE_NAME;
  const username = authUser.username;
  const now = new Date().toISOString();

  try {
    const { Item } = await ddbClient.send(new GetItemCommand({
      TableName: tableName,
      Key: { id: { S: username } }
    }));

    if (!Item) {
      console.warn(`No UserPasswordAudit record found for ${username}`);
      return;
    }

    const issuedAt = Item.issuedAt?.S;
    const lastReset = Item.lastReset?.S;
    const isFirstLogin = issuedAt && !lastReset;

    const updateExpr = ['SET failedAttempts = :zero'];
    const exprVals = {
      ':zero': { N: '0' }
    };

    if (isFirstLogin) {
      updateExpr.push('lastReset = :ts', 'userChanged = :uc');
      exprVals[':ts'] = { S: now };
      exprVals[':uc'] = { BOOL: true };
    }

    await ddbClient.send(new UpdateItemCommand({
      TableName: tableName,
      Key: { id: { S: username } },
      UpdateExpression: updateExpr.join(', '),
      ExpressionAttributeValues: exprVals
    }));

    console.log(`Audit updated for ${username}: failedAttempts reset${isFirstLogin ? ', first login completed' : ''}`);
  } catch (error) {
    console.error('Failed to update UserPasswordAudit:', error.message);
  }
};






function hashPassword(password) {
  return crypto
    .pbkdf2Sync(password, 'fixed_salt', 100000, 64, 'sha512')
    .toString('hex');
}

export const handler = async (event) => {
  const { userName, newPassword } = event.arguments;

  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const twoYearsAgoISO = twoYearsAgo.toISOString();

  try {
    const result = await ddb.send(
      new GetItemCommand({
        TableName: TABLE_NAME,
        Key: {
          userName: { S: userName }
        }
      })
    );

    const record = result.Item;
    if (!record || !record.passwordHashes?.L) {
      return false;
    }

    const newHash = hashPassword(newPassword);

    for (const entry of record.passwordHashes.L) {
      const storedHash = entry.M?.hash?.S;
      const timestamp = entry.M?.timestamp?.S;

      if (!storedHash || !timestamp) continue;
      if (timestamp < twoYearsAgoISO) continue;

      if (newHash === storedHash) {
        return true; // Reused
      }
    }

    return false;
  } catch (err) {
    console.error("Error checking password reuse:", err);
    throw new Error("Internal error");
  }
};


const crypto = require('crypto'); // Ensure this is at the top

const currentPasswordHash = crypto.createHash('sha256').update(password).digest('hex');
const nowISO = new Date().toISOString();
const now = new Date();
const twoYearsAgo = new Date(now.setFullYear(now.getFullYear() - 2));

// Get existing hashes
const existingHashes = Item.passwordHashes || [];

// Check if this hash was used in the last 2 years
const usedRecently = existingHashes.some(entry => {
  const usedAt = new Date(entry.timestamp);
  return entry.hash === currentPasswordHash && usedAt >= twoYearsAgo;
});

// Add if:
if (!usedRecently) {
  existingHashes.push({ hash: currentPasswordHash, timestamp: nowISO });

  updateExpr.push('passwordHashes = :ph');
  exprVals[':ph'] = {
    L: existingHashes.map(entry => ({
      M: {
        hash: { S: entry.hash },
        timestamp: { S: entry.timestamp }
      }
    }))
  };
}

