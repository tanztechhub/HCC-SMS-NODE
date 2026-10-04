const mongoose = require('mongoose');

let hccSmsConnection = null;
let hccSmsConnectionPromise = null;

const connectHccSmsDB = async () => {
  if (hccSmsConnection?.readyState === 1) {
    return hccSmsConnection;
  }

  if (hccSmsConnectionPromise) {
    return hccSmsConnectionPromise;
  }

  const mongoUri = process.env.HCC_SMS_MONGODB_URI;
  const configuredDbName = process.env.HCC_SMS_DB_NAME || 'hcc';
  const dbName = configuredDbName.toLowerCase();

  if (configuredDbName !== dbName) {
    console.warn(`HCC SMS DB name normalized from "${configuredDbName}" to "${dbName}" to avoid MongoDB case-conflict.`);
  }

  if (!mongoUri) {
    throw new Error('Missing MongoDB URI for HCC SMS. Set HCC_SMS_MONGODB_URI in server/.env.');
  }

  hccSmsConnectionPromise = mongoose
    .createConnection(mongoUri, {
      dbName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000
    })
    .asPromise()
    .then((conn) => {
      hccSmsConnection = conn;
      hccSmsConnectionPromise = null;
      console.log('📲 [HCC SMS] MongoDB connected');
      return conn;
    })
    .catch((err) => {
      hccSmsConnectionPromise = null;
      throw err;
    });

  return hccSmsConnectionPromise;
};

const getHccSmsDB = () => {
  if (!hccSmsConnection || hccSmsConnection.readyState !== 1) {
    throw new Error('[HCC SMS] Database not connected yet. Ensure connectHccSmsDB() was called at startup.');
  }
  return hccSmsConnection;
};

module.exports = { connectHccSmsDB, getHccSmsDB };
