const { contextBridge } = require('electron');

// Expose safe desktop bridge APIs to the React renderer window
contextBridge.exposeInMainWorld('navitronixDesktop', {
  isDesktop: true,
  platform: process.platform,
  backendUrl: 'http://127.0.0.1:5288/api/bitmap',
  enginePort: 5288,
});
