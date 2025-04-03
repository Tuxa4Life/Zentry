const psList = require('ps-list').default
const { exec } = require("child_process")

let processes = []

const blockProcesses = async (blocked) => {
    try {
        processes = await psList();
    } catch (err) {
        console.log('Error: Failed getting processes.', { err })
    }

    processes.forEach((process) => {
        if (blocked.includes(process.name)) {
            try {
                exec(`taskkill /PID ${process.pid} /F`);
            } catch (err) {
                console.log('Error: Cannot execute taskkill.', { err })
            }
        }
    });
};

module.exports = {
    blockProcesses
}