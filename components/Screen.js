const fs = require('fs');
const blessed = require('blessed');

const pack = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());
const user = JSON.parse(fs.readFileSync(__dirname + '/../user.json').toString());

// Create a screen object.
const screen = blessed.screen({
    smartCSR: true
});

screen.title = `Kantinevote ${pack.version} - Bursting Pulsar`;

// Create a box perfectly centered horizontally and vertically.
const chatBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '95%',
    height: '45%',
    content: 'Communicate with the {bold}world{/bold}:',
    tags: true,
    draggable: false,
    keys: true,
    vi: true,
    alwaysScroll:true,
    scrollable: true,
    // scrollbar: {
    //     style: {
    //         bg: 'yellow'
    //     }
    // },
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        // hover: {
        //     bg: 'green'
        // }
    }
});

const menuBox = blessed.box({
    draggable: false,
    top: 'top',
    left: '3%',
    width: '95%',
    height: '30%',
    content:
        `{center}KV ${pack.version} | Dagens {bold}meny{/bold}{/center}`,
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        // hover: {
        //     bg: 'green'
        // }
    }
});

const h2Box = blessed.box({
    draggable: false,
    parent: menuBox,
    top: '22%',
    left: '0%',
    width: '49%',
    height: '68%',
    content:
        `
`,
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        // hover: {
        //     bg: 'green'
        // }
    }
});

const h9Box = blessed.box({
    draggable: false,
    parent: menuBox,
    top: '22%',
    title: 'test',
    left: '49%',
    width: '50%',
    height: '68%',
    content:
        `
`,
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        // hover: {
        //     bg: 'green'
        // }
    }
});

const helpBox = blessed.box({
    draggable: false,
    top: '75%',
    left: '65%',
    width: '33%',
    height: '25%',
    content: '{center}{bold}Velkommen til KantineVote{/bold}{/center}',
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        // hover: {
        //     bg: 'green'
        // }
    }
});


const chatInputBox = blessed.box({
    top: '75%',
    left: '3%',
    width: '60%',
    height: '25%',
    content: `{bold}${user.nick}{/bold}:`,
    tags: true,
    draggable: false,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        // hover: {
        //     bg: 'green'
        // }
    }
});

screen.append(chatInputBox);
const inputField = blessed.textbox({
    top: '20%',
    parent: chatInputBox,
    mouse: true,
    keys: true,
    inputOnFocus: true,
    style: {
        bg: 'blue'
    },
    width: '98%',
    height: 1,
    name: 'text'
});



screen.append(menuBox);
screen.append(helpBox);
screen.append(chatBox);


module.exports = {
    screen,
    chatBox,
    chatInputBox,
    inputField,
    h2Box,
    h9Box,
    menuBox,
    helpBox
};
