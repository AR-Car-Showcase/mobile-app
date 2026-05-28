const appJson = require('./app.json');

const apiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || 'http://10.0.2.2:8080/api';

module.exports = {
  ...appJson.expo,
  extra: {
    ...(appJson.expo.extra || {}),
    API_URL: apiUrl,
  },
  android: {
    ...(appJson.expo.android || {}),
    usesCleartextTraffic: !apiUrl.startsWith('https://'),
  },
};
