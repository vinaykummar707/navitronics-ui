const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let backendProcess = null;
const BACKEND_PORT = 5288;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;

// Configurable remote URL for Option 1 (Thin Client with live updates)
// In production, Electron attempts to load this live URL for instant bug fixes,
// and falls back to the bundled dist/index.html if offline.
const REMOTE_WEB_URL = process.env.NAVITRONIX_WEB_URL || 'https://app.navitronix.in';

/**
 * Spawns the .NET 8 BitmapFontApi sidecar background process
 */
function startBackendSidecar() {
  const isWindows = process.platform === 'win32';
  const exeName = isWindows ? 'BitmapFontApi.exe' : 'BitmapFontApi';

  // Candidate paths where the compiled binary might reside
  const candidatePaths = [
    // 1. Packaged Electron extraResources path
    path.join(process.resourcesPath, 'bin', exeName),
    // 2. Local resources/bin in navitronics-ui
    path.join(__dirname, '..', 'resources', 'bin', exeName),
    // 3. Directly inside bitmapapi project build output
    path.join(__dirname, '..', '..', 'bitmapapi', 'bin', 'Release', 'net8.0', 'win-x64', 'publish', exeName),
    path.join(__dirname, '..', '..', 'bitmapapi', 'bin', 'Release', 'net8.0', exeName),
    path.join(__dirname, '..', '..', 'bitmapapi', 'bin', 'Debug', 'net8.0', exeName),
  ];

  const exePath = candidatePaths.find((p) => fs.existsSync(p));

  if (!exePath) {
    console.warn(
      `[Sidecar] BitmapFontApi executable not found in searched locations. Assuming external server or dev environment.`
    );
    return;
  }

  console.log(`[Sidecar] Launching BitmapFontApi from: ${exePath}`);

  try {
    backendProcess = spawn(
      exePath,
      ['--urls', BACKEND_URL],
      {
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    backendProcess.stdout.on('data', (data) => {
      console.log(`[BitmapApi] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[BitmapApi ERROR] ${data.toString().trim()}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`[BitmapApi] Process exited with code ${code}`);
      backendProcess = null;
    });
  } catch (error) {
    console.error('[Sidecar] Failed to start BitmapFontApi:', error);
  }
}

/**
 * Terminate the backend sidecar process cleanly
 */
function stopBackendSidecar() {
  if (!backendProcess) return;

  console.log('[Sidecar] Stopping BitmapFontApi background process...');
  const pid = backendProcess.pid;

  try {
    if (process.platform === 'win32' && pid) {
      // Force kill process tree on Windows to prevent orphan processes
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      backendProcess.kill('SIGTERM');
    }
  } catch {
    try {
      backendProcess.kill('SIGKILL');
    } catch {
      // Ignore if already dead
    }
  }

  backendProcess = null;
}

/**
 * Create the main Electron window
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Navitronix LED Signboard Studio',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // webSecurity is set to false to permit the hosted HTTPS web app
      // to make HTTP requests to local loopback http://127.0.0.1:5288
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    // In local development, connect to Vite dev server
    mainWindow.loadURL('http://localhost:9092').catch(() => {
      console.log('[Electron] Vite dev server not yet ready, retrying...');
      setTimeout(() => mainWindow.loadURL('http://localhost:9092'), 1500);
    });
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production: Try loading the live web app first (Option 1 Thin Client)
    // If the remote server cannot be reached, fallback to the local bundled HTML.
    mainWindow.loadURL(REMOTE_WEB_URL).catch((err) => {
      console.warn(`[Electron] Remote web app unavailable (${err.message}). Loading local fallback...`);
      const localIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
      if (fs.existsSync(localIndexPath)) {
        mainWindow.loadFile(localIndexPath);
      }
    });
  }

  // Setup standard application menu with reload shortcuts
  const menuTemplate = [
    {
      label: 'File',
      submenu: [{ role: 'quit', label: 'Exit' }],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', accelerator: 'CmdOrCtrl+R', label: 'Reload (Fetch Latest Changes)' },
        { role: 'forceReload', accelerator: 'CmdOrCtrl+Shift+R', label: 'Hard Reload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools(),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'API Status Check',
          click: () => {
            const statusWindow = new BrowserWindow({
              width: 600,
              height: 400,
              title: 'Bitmap Engine Status',
              parent: mainWindow,
              modal: true,
            });
            statusWindow.loadURL(`${BACKEND_URL}/swagger`);
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle hooks
app.whenReady().then(() => {
  startBackendSidecar();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('before-quit', () => {
  stopBackendSidecar();
});

app.on('will-quit', () => {
  stopBackendSidecar();
});

app.on('window-all-closed', () => {
  stopBackendSidecar();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('exit', () => {
  stopBackendSidecar();
});

process.on('SIGINT', () => {
  stopBackendSidecar();
  process.exit(0);
});
