const appJson = require('./app.json');

const apiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || 'http://10.0.2.2:8080/api';
const googleExpoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID || '';
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

module.exports = {
  ...appJson.expo,
  extra: {
    ...(appJson.expo.extra || {}),
    API_URL: apiUrl,
    GOOGLE_EXPO_CLIENT_ID: googleExpoClientId,
    GOOGLE_ANDROID_CLIENT_ID: googleAndroidClientId,
    GOOGLE_IOS_CLIENT_ID: googleIosClientId,
    GOOGLE_WEB_CLIENT_ID: googleWebClientId,
  },
  android: {
    ...(appJson.expo.android || {}),
    usesCleartextTraffic: !apiUrl.startsWith('https://'),
  },
};
