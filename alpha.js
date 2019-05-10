var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'Kantinevote - Bursting Pulsar';

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '95%',
  height: '45%',
  content: 'Communicate with the {bold}world{/bold}:',
  tags: true,
  draggable: true,
  alwaysScroll: true,
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

var boxMenu = blessed.box({
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

var helpMenu = blessed.box({
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


var chatBox = blessed.box({
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

screen.append(chatBox);

// var form = blessed.form({
//   parent: screen,
//   name: 'form',
//   top: '85%',
//   left: 'center',
//   width: '100%',
//   height: '100%',
// });


var text = blessed.textbox({
  top: '20%',
  parent: chatBox,
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



screen.append(boxMenu);
screen.append(helpMenu);
// screen.append(prompt);

// Append our box to the screen.
screen.append(box);

// Add a png icon to the box
/*var icon = blessed.image({
  parent: box,
  top: 0,
  left: 0,
  type: 'overlay',
  width: 'shrink',
  height: 'shrink',
  file: __dirname + '/my-program-icon.png',
  search: false
});
*/

// If our box is clicked, change the content.
box.on('click', function(data) {
  box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
  screen.render();
});

// If box is focused, handle `enter`/`return` and give us some more content.
box.key('enter', function(ch, key) {
  box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  box.setLine(1, 'bar');
  box.insertLine(1, 'foo');
  screen.render();
});

setTimeout(() =>  {
  box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  box.setLine(1, 'bar');
  box.insertLine(1, 'foo');
  screen.render();
}, 10000);

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();

// prompt.input('Erlend:', '', function() {});
text.focus();