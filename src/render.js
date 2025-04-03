const { ipcRenderer } = require('electron')

let items = { exe: [], blocked: [] }

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
        alert('Input')
    })

});

const sendData = (key, data) => {
    ipcRenderer.send(key, data);
}


const renderItems = (items) => {
    const $items = document.querySelector('.item-wrapper');
    let names = items.exe;

    $items.innerHTML = '';
    for (let i = 0; i < names.length; i++) {
        let content = String(names[i]).split('.exe')[0].substring(0, 15);

        let itemDiv = createItemContainer();
        let closeIcon = createCloseIcon();
        let header = createHeader(content);
        let checkbox = createCheckbox();

        if (items.blocked.includes(names[i])) checkbox.checked = true

        itemDiv.addEventListener('mouseover', () => closeIcon.style.display = 'block');
        itemDiv.addEventListener('mouseout', () => closeIcon.style.display = 'none');

        itemDiv.appendChild(closeIcon);
        itemDiv.appendChild(header);
        itemDiv.appendChild(checkbox);
        $items.appendChild(itemDiv);

        closeIcon.addEventListener('click', () => sendData('remove-item', names[i]))
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) sendData('add-blocked', names[i]) 
            else sendData('remove-blocked', names[i])
        })
    }
};

ipcRenderer.on('render-items', (_, itemsFromMain) => {
    items = itemsFromMain
    renderItems(items)
})

// Element Functions
const createItemContainer = () => {
    let itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    Object.assign(itemDiv.style, {
        position: 'relative', width: '97px', height: '90px', backgroundColor: 'gray',
        margin: '14px', borderRadius: '3px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center'
    });
    return itemDiv;
};

const createCloseIcon = () => {
    let closeIcon = document.createElement('i');
    closeIcon.className = 'times circle outline icon';
    Object.assign(closeIcon.style, {
        cursor: 'pointer', position: 'absolute', display: 'none', top: '-10px',
        right: '-13px', fontSize: '20px', color: 'black'
    });
    return closeIcon;
};

const createHeader = (content) => {
    let header = document.createElement('h3');
    header.textContent = content;
    Object.assign(header.style, {
        margin: '0', color: 'white', fontSize: '14px',
        wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%'
    });
    return header;
};

const createCheckbox = () => {
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    Object.assign(checkbox.style, {
        transform: 'scale(2)', marginTop: '10px', cursor: 'pointer'
    });
    return checkbox;
};