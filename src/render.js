const { ipcRenderer } = require('electron')

document.addEventListener('DOMContentLoaded', () => {
    console.log("Hello World!")
});

const sendData = (data) => {
    ipcRenderer.send("message-from-renderer", data);
}

const setLocal = (key, data) => {
    localStorage.setItem(String(key), JSON.stringify(data))
}