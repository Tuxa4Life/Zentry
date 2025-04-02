const { ipcRenderer } = require('electron')

document.addEventListener('DOMContentLoaded', () => {
    const selectBtn = document.querySelector(".button.select")

    selectBtn.addEventListener('click', () => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            sendData("exe-entry", file.name)
          }
        }
        input.click()
    })
});

const sendData = (key, data) => {
    ipcRenderer.send(key, data);
}

const setLocal = (key, data) => {
    localStorage.setItem(String(key), JSON.stringify(data))
}