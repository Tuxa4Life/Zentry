const { app, BrowserWindow, ipcMain, Menu, shell, Tray, nativeImage } = require("electron")
const path = require("node:path")
const psList = require("ps-list").default
const { exec } = require("child_process")

let processes = []
let blocked = {exes: [], windows: []}

if (require("electron-squirrel-startup")) {
    app.quit()
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
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
          label: "File",
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

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

ipcMain.on("message-from-renderer", (event, data) => {
    blocked = data
})

app.whenReady().then(async () => {
    createWindow()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    try {
        processes = await psList()  
    } catch (error) {
        console.error("Failed to get process list.")
    }

    

    setInterval(async () => {
        blockProcesses(blocked.exes)
    }, 5000)
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

const blockProcesses = async (blocked) => {
    const processes = await psList()

    processes.forEach((process) => {
        if (blocked.includes(process.name)) {
            exec(`taskkill /PID ${process.pid} /F`)
        }
    })
}