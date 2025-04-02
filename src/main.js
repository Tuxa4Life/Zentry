const { app, BrowserWindow, ipcMain, Menu, shell, Tray, nativeImage } = require("electron")
const path = require("node:path")
const psList = require("ps-list").default
const { exec } = require("child_process")

let mainWindow = null
let tray = null
let isQuitting = false

if (require("electron-squirrel-startup")) {
    app.quit()
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 520,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, '../assets/icons/Zentry Logo.ico')
    })

    const menuTemplate = [
        {
          label: "App",
          submenu: [
            { label: "Exit", role: "quit" }
          ]
        },
        {
          label: "Edit",
          submenu: [
            { label: "Add .exe file", click: () => console.log('Adding .exe file') },
            { label: "Input .exe", click: () => console.log('Adding via input') },
            { type: 'separator' },
            { label: "Remove item", click: () => console.log('Removing item') },
          ]
        },
        {
            label: "Docs",
            submenu: [
                { label: "Github Repository", click: () => shell.openExternal("https://github.com/Tuxa4Life/Zentry") },
                { label: "License", click: () => shell.openExternal("https://github.com/Tuxa4Life/Zentry?tab=MIT-1-ov-file") }
            ]
        }
    ]

    mainWindow.loadFile(path.join(__dirname, "index.html"))

    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    mainWindow.on('close', (e) => {
        e.preventDefault()
        mainWindow.hide()
    });
}

ipcMain.on("message-from-renderer", (event, data) => {
    blocked = data
})

app.whenReady().then(async () => {
    createWindow()
    createTray()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        } else if (!mainWindow) createWindow();
    })
})

app.on('before-quit', () => {
    isQuitting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

const createTray = () => {
    const iconPath = path.join(__dirname, '../assets/icons/Zentry Logo.ico')
    const icon = nativeImage.createFromPath(iconPath);

    tray = new Tray(icon);
    tray.setToolTip('Zentry');

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open', click: () => mainWindow.show() },
        { label: 'Hide' },
        { label: 'Exit', click: () => {
            mainWindow.destroy();
            app.quit();
        } }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          createWindow();
        }
        mainWindow.show();
    });
}