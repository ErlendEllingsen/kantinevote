var blessed = require('blessed');

// Create a screen object.
const screen = blessed.screen({
    smartCSR: true
});

screen.title = 'Kantinevote - Bursting Pulsar';

// Create a box perfectly centered horizontally and vertically.
const chatBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '95%',
    height: '45%',
    content: 'Communicate with the {bold}world{/bold}:',
    tags: true,
    draggable: true,
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
        hover: {
            bg: 'green'
        }
    }
});

const menuBox = blessed.box({
    draggable: true,
    top: 'top',
    left: '3%',
    width: '95%',
    height: '25%',
    content:
        `{center}Dagens {bold}meny{/bold}{/center}
{center}--------------------{/center}
{bold}{green-fg}H2:{/green-fg}{/bold} (0 stemmer) Something something something
{bold}{red-fg}H9:{/red-fg}{/bold} (0 stemmer) Something Something 
{center}--------------------{/center}
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
        hover: {
            bg: 'green'
        }
    }
});

const helpBox = blessed.box({
    draggable: true,
    top: '75%',
    left: '65%',
    width: '33%',
    height: '25%',
    content: '{center}{bold}Hjelp{/bold}.{/center}',
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
        hover: {
            bg: 'green'
        }
    }
});


const chatInputBox = blessed.box({
    top: '75%',
    left: '3%',
    width: '60%',
    height: '25%',
    content: '{bold}Erlend{/bold}:',
    tags: true,
    draggable: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        hover: {
            bg: 'green'
        }
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
    menuBox,
    helpBox
};
