const appJson = require('./app.json');

const apiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || 'http://10.0.2.2:8080/api';
const googleExpoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID || '';
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || '';
const googleAndroidRedirectScheme = googleAndroidClientId
  ? `com.googleusercontent.apps.${googleAndroidClientId.replace(/\.apps\.googleusercontent\.com$/, '')}`
  : '';
const nativeRedirectScheme = appJson.expo.android?.package || appJson.expo.scheme || 'arcarshowcase';

const intentFilters = [
  {
    action: 'VIEW',
    autoVerify: false,
    data: [
      {
        scheme: appJson.expo.scheme || 'arcarshowcase',
      },
      {
        scheme: appJson.expo.scheme || 'arcarshowcase',
        host: 'oauthredirect',
      },
    ],
  },
  {
    action: 'VIEW',
    autoVerify: false,
    data: [
      {
        scheme: nativeRedirectScheme,
        pathPrefix: '/oauthredirect',
      },
      {
        scheme: nativeRedirectScheme,
        host: 'oauthredirect',
      },
    ],
  },
  ...(googleAndroidRedirectScheme ? [{
    action: 'VIEW',
    autoVerify: false,
    data: [
      {
        scheme: googleAndroidRedirectScheme,
        pathPrefix: '/oauthredirect',
      },
      {
        scheme: googleAndroidRedirectScheme,
        host: 'oauthredirect',
      },
    ],
  }] : []),
];

module.exports = {
  ...appJson.expo,
  extra: {
    ...(appJson.expo.extra || {}),
    API_URL: apiUrl,
    GOOGLE_EXPO_CLIENT_ID: googleExpoClientId,
    GOOGLE_ANDROID_CLIENT_ID: googleAndroidClientId,
    GOOGLE_IOS_CLIENT_ID: googleIosClientId,
    GOOGLE_WEB_CLIENT_ID: googleWebClientId,
    GOOGLE_ANDROID_REDIRECT_SCHEME: googleAndroidRedirectScheme,
    SUPPORT_EMAIL: supportEmail,
  },
  android: {
    ...(appJson.expo.android || {}),
    intentFilters,
    usesCleartextTraffic: !apiUrl.startsWith('https://'),
  },
};
