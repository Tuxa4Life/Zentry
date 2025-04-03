const { app, BrowserWindow, ipcMain, Menu, shell, Tray, nativeImage } = require("electron")
const path = require("node:path")
const fs = require('fs')
const items = require('../items.json')
const { blockProcesses } = require('./utils/processes.js')

let mainWindow = null
let tray = null

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

    mainWindow.webContents.openDevTools()
    const menuTemplate = [
        {
          label: "App",
          submenu: [
            { label: 'Hide', click: () => mainWindow.hide() },
            { type: 'separator' },
            { label: "Exit", click: () => quitApplication() }
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
    })
}

app.whenReady().then(async () => {
    createWindow()
    createTray()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        } else if (!mainWindow) createWindow()
    })

    setInterval(() => {
        blockProcesses(items.blocked)
    }, 1500)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

const createTray = () => {
    const iconPath = path.join(__dirname, '../assets/icons/Zentry Logo.ico')
    const icon = nativeImage.createFromPath(iconPath)

    tray = new Tray(icon)
    tray.setToolTip('Zentry')

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show', click: () => mainWindow.show() },
        { label: 'Hide', click: () => mainWindow.hide() },
        { label: 'Exit', click: () => quitApplication() }
    ])

    tray.setContextMenu(contextMenu)

    tray.on('click', () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          createWindow()
        }
        mainWindow.show()
    })
}

const quitApplication = () => {
    mainWindow.destroy()
    app.quit()
}

const writeInFile = (data) => {
    fs.writeFile('./items.json', JSON.stringify(data, null, 4), (err) => { if (err) console.log(err)})
}

const updateGlobally = (event, items) => {
    writeInFile(items)
    event.reply('render-items', items)
}

ipcMain.on("exe-entry", (event, newItem) => {
    let exes = [...items.exe]

    if (!exes.includes(newItem)) {
        exes.push(newItem)

        let output = items
        output.exe = exes

        updateGlobally(event, output)
    }
})

ipcMain.on('initial-items', (event) => {
    event.reply('render-items', items)
})

ipcMain.on('remove-item', (event, item) => {
    let output = items
    output.blocked = output.blocked.filter(e => e !== item)
    output.exe = output.exe.filter(e => e !== item)

    updateGlobally(event, output)
})

ipcMain.on('add-blocked', (event, item) => {
    let output = items
    output.blocked.push(item)

    updateGlobally(event, output)
})

ipcMain.on('remove-blocked', (event, item) => {
    let output = items
    output.blocked = output.blocked.filter(e => e !== item)

    updateGlobally(event, output)
})