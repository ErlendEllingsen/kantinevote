
const clearScreen = () => {

    // Must clear each line used
    const chatLines = 13;
    const misc = 8;

    const linesToClear = (chatLines + misc);

    for (let i = 0; i < linesToClear; i++) {
        process.stdout.clearLine();
        process.stdout.moveCursor(0,-1);
    }

    // Clear final line
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
}

const errorScreen = (message) => {
    clearScreen(); 
    console.log(colors.bgRed(message));
    setTimeout(updateLine, 3000);
}

const successScreen = (message) => {
    clearScreen();
    console.log(colors.bgGreen(message));
    setTimeout(updateLine, 3000);
}


const renderEvtLog = () => {
    let lines = [];
    const evts = Object.values(eventsData);

    // Check if we should send notifications
    if (notifications.getSetting()) checkNotification(evts);

    lines = evts.map((el) => {
        const d = new Date(el.ts);
        const hrs = d.getHours();
        const mns = d.getMinutes();
        const hrsMns = `${hrs >= 10 ? hrs : '0' + hrs}:${mns >= 10 ? mns : '0' + mns}`;
        let line = `${hrsMns} [${colors.yellow(el.username)}] `;
        switch(el.type) {
            case EVENT_JOIN:
                line += colors.cyan('logget på');
                break;
            case EVENT_CHAT:
                line += colors.white(el.payload.msg);
                break;
            default:
                line += el.type;
                break;
        }
        return line;
    });
    for (let i = lines.length; i < 10; i++) {
        lines.push('');
    }
    return lines.join('\n');
}

const updateLine = () => {

    const pollRes = getVotes();

    clearScreen();
    process.stdout.write(`
-----------------------------
${colors.bgBlue(`Mat ${pack.version} - ${new Date().toLocaleDateString()}`)} Help? -> readme.md
Stem med /vote <h2|h9> (Cmds: /notifications <on/off>, /delvote, les README.md)
-----------------------------
${colors.green('Mat h2')} : ${coreData.mat.h2}
${colors.red('Mat h9')} : ${coreData.mat.h9}
Poll   : Votes for h9: ${pollRes.h9} h2: ${pollRes.h2}
-----------------------------
${renderEvtLog()}
-----------------------------
`);

    chatFeature();
}