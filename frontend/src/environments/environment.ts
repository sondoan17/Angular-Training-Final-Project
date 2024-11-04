export const environment = {
  production: true,
  apiUrl: process.env['BACKEND_URL'] || 'http://localhost:3000',
  googleClientId: process.env['GOOGLE_CLIENT_ID'] || '1050818393271-h7sovbi2l89odsg348ik697814lrv3hm.apps.googleusercontent.com',
  serverUrl: process.env['SERVER_URL'] || 'http://localhost:3000',
};
