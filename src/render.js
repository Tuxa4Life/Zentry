const { ipcRenderer } = require('electron')

let items = []
let blocked = []

document.addEventListener('DOMContentLoaded', () => {
    sendData('initial-items')
    renderItems(items)

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

    const inputBtn = document.querySelector('.button.inp')
    inputBtn.addEventListener('click', () => {
        
    })

});

const sendData = (key, data) => {
    ipcRenderer.send(key, data);
}

ipcRenderer.on('render-items', (_, exes) => {
    items = exes
    renderItems(items)
})

ipcRenderer.on('render-blocked', (_, blocks) => {
    blocked = blocks
    renderItems(items)
})

const renderItems = (items) => {
    const $items = document.querySelector('.item-wrapper')

    $items.innerHTML = ``
    for (let i = 0; i < items.length; i++) {
        let content = String(items[i]).split('.exe')[0].substring(0, 15)

        $items.innerHTML += `
            <div onmouseover="this.querySelector('i').style.display = 'block'" onmouseout="this.querySelector('i').style.display = 'none'" class="item" style="position: relative; width: 97px; height: 90px; background-color: gray; margin: 14px; border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <i style="cursor: pointer; position: absolute; display: none; top: -10px; right: -13px; font-size: 20px; color: black;" class="times circle outline icon"></i>
                <h3 style="margin: 0; color: white; font-size: min(20px, 12vw); word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;">${content}</h3>
                <input onchange="handleCheckbox(this, '${items[i]}')" ${blocked.includes(items[i]) ? ' checked ' : ''} type="checkbox" style="transform: scale(2); margin-top: 10px; cursor: pointer;">
            </div>
        `
    }
}

const addInBlocks = (item) => {
    if (!blocked.includes(item)) {
        blocked.push(item)
        sendData('blocked-changed', blocked)
    }
}

const removeFromBlocks = (item) => {
    blocked = blocked.filter(e => e !== item);
    sendData('blocked-changed', blocked)
};

const handleCheckbox = (checkbox, item) => {
    if (checkbox.checked) addInBlocks(item)
    else removeFromBlocks(item)
}