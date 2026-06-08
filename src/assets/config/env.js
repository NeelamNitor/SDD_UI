(function (window) {
  window['__env'] = window['__env'] || {};

  // API URLs
  window['__env'].apiURL = 'https://localhost:44351';
  window['__env'].production = false;

  // Azure AD Configuration (Optional - Configure with your credentials)
  window['__env'].clientId = '';
  window['__env'].tenantId = '';
  window['__env'].tokenClientId = '';
  window['__env'].accessScope = 'access_as_user';
  window['__env'].redirectURI = 'http://localhost:4200';

  // Feature flags
  window['__env'].enableServiceWorker = false;
  window['__env'].enableMSAL = false;
})(this);
