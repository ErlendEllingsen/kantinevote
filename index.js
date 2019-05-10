#!/usr/bin/env node

// beware of ugly code
// u were warned
// will maybe be fixed later

const fs = require('fs');
const readline = require('readline');
const colors = require('colors');
const uuid = require('uuid/v1');
const firebase = require("firebase");
const notifier = require('node-notifier');

const getCursorPosition = require('get-cursor-position');

const Notifications = require('./components/Notifications');
const UserConfig = require('./components/UserConfig');

const isDev = process.argv[2] === 'dev';

// CONSTS
const EVENT_CHAT = 'EVENT_CHAT';
const EVENT_JOIN = 'EVENT_JOIN';

// MISC vars 
let lastChatTs = undefined;
let isLoaded = false;

const pack = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());


// User config
if (!fs.existsSync(__dirname + '/user.json')) {
    require('./components/ClientConfiguration').setupUserConfig();
    return;
}

if (!fs.existsSync(__dirname + '/key.json')) {
    console.log(
        `
Oppsett av mat-klient:
-----------------------------
${colors.red('^')} Vennligst legg ${colors.bgRed('key.json')} i ${__dirname}
-----------------------------
Denne får du av en annen på teamet`
);
    return;
}

UserConfig.load();
const userCfg = UserConfig.userCfg;

// Load notifications
const notifications = new Notifications(UserConfig);

// FIREBASE STUFF 
firebase.initializeApp({
    serviceAccount: "./key.json",
    databaseURL: "https://kantinebot.firebaseio.com/"
  }); 

const db = firebase.database();

const coreRef = db.ref("/core");
const chatRef = db.ref("/core/chat");  
const h2Ref = db.ref("/core/mat/h2");  
const h9Ref = db.ref("/core/mat/h9");  
const votesRef = db.ref("/core/votes"); 
const eventsRef = db.ref("/events"); 




console.log('Loading...');


let coreData = {};
let eventsData = {};

coreRef.on("value", function(snapshot) {
    coreData = snapshot.val();
    if (coreData == null) coreData = {};
    renderScreen();
});

eventsRef.orderByChild("ts").limitToLast(10).on("value", function(snapshot) {
    eventsData = snapshot.val();
    if (eventsData == null) eventsData = {};
    renderScreen();
});

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
    setTimeout(renderScreen, 3000);
}

const successScreen = (message) => {
    clearScreen();
    console.log(colors.bgGreen(message));
    setTimeout(renderScreen, 3000);
}

const getVotes = () => {
    if (coreData.votes === undefined) {
        return {
            h2: 0,
            h9: 0
        }
    }

    const votes = Object.values(coreData.votes);

    const pollRes = {
        h2: 0,
        h9: 0
    }

    votes.forEach((el) => {
        pollRes[el.vote]++;
    })
    return pollRes;
}

const checkNotification = (evts) => {
    const chatMsgs = 
        evts.filter((el) => { return el.type === EVENT_CHAT })
            .sort((a, b) => { return Number(a.ts) < Number(b.ts) });
    
    // Validate last chat against last notification var
    if (chatMsgs.length > 0 && chatMsgs[0].ts !== lastChatTs) {
        const lastNewChat = chatMsgs[0];
        // Check that notification is on and that this is not initial load, and that is it not from myself
        if (
            notifications.getSetting() 
            && lastChatTs !== undefined 
            && lastNewChat.username !== userCfg.nick
        ) {
            notifier.notify({
                title: '[Kantinevote] Msg from ' + lastNewChat.username,
                message: lastNewChat.payload.msg
              });
        }
        lastChatTs = lastNewChat.ts;
    }
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

async function getCursorPos() {
    return new Promise((resolve, reject) => {
        getCursorPosition.async(function(pos) {
            return resolve({
                row: pos.row,
                col: pos.col
            });
        });
    })
}

const renderScreen = async () => {

    const cursorPos = await getCursorPos();

    const pollRes = getVotes();

    clearScreen();
    process.stdout.write(`
-----------------------------
${colors.bgBlue(`KV ${isDev ? '(dev)' : ''} ${pack.version} - ${new Date().toLocaleDateString()}`)} Help? -> readme.md
Stem med /vote <h2|h9> (Cmds: /notifications <on/off>, /delvote, les README.md)
-----------------------------
${colors.green('Mat h2')} : ${coreData.mat.h2}
${colors.red('Mat h9')} : ${coreData.mat.h9}
Poll   : Votes for h2: ${pollRes.h2} h9: ${pollRes.h9}
-----------------------------
${renderEvtLog()}
-----------------------------
`);

    chatFeature();

    if (isLoaded) {
        process.stdout.cursorTo(cursorPos.col,cursorPos.row);
    } else {
        isLoaded = true;
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });



const voteKantine = (kantine) => {

    const createVote = () => {
        votesRef.push({
            userid: userCfg.userid,
            vote: kantine,
            ts: new Date().toLocaleString()
        })
        successScreen(`Du har stemt på ${colors.bold(kantine)}`);
        return;
    }

    if (coreData.votes === undefined) {
        createVote();
        return;
    }


    const votes = Object.values(coreData.votes);
    const userVotePos = votes.findIndex(((el) => { return el.userid === userCfg.userid }));

    if (userVotePos === -1) {
        createVote();
        return;
    }

    return errorScreen('Du har allerede stemt i dag');

}

const clearMyVote = () => {
    if (coreData.votes === undefined) {
        return errorScreen('Ingen aktive stemmer');
    }

    for (let key in coreData.votes) {
        const o = coreData.votes[key];
        if (o.userid === userCfg.userid) {
            console.log(key);
            votesRef.child(key).remove();
            return successScreen('Du har fjernet din stemme');
        }
    }

    return errorScreen('Du har ingen stemme fra før');


}

const dispatchEvent = (type, payload) => {
    eventsRef.push({
        username: userCfg.nick,
        type: type,
        payload,
        ts: Date.now(),
    })
}

const chatFeature = () => {
    
    rl.question('Enter msg/cmd: ', (answer) => {

        if (answer.startsWith('/vote')) {
            const args = answer.split(' ');
            if (args.length === 1) return errorScreen('Du må spesifisere kantine. Eks /vote <h2|h9>')
            if (args[1] !== 'h2' && args[1] !== 'h9') return errorScreen('Ugyldig kantine. Eks /vote <h2|h9>')
            voteKantine(args[1]);
            return;
        } else if (answer.startsWith('/delvote')) {
            clearMyVote();
            return;
        } else if (answer.startsWith('/notifications')) {
            const args = answer.split(' ');
            if (args.length === 1) return errorScreen('Du må spesifisere innstilling. Eks /notifications <on|off>')
            notifications.setSetting(args[1].toLowerCase() === 'on'.toLowerCase());
            renderScreen();
            return;
        }else if (answer.startsWith('/host')) {
            const args = answer.split(' ');
            switch(args[1]) {
                case 'h2':
                    h2Ref.set(args.slice(2).join(' '));
                    break;
                case 'h9':
                    h9Ref.set(args.slice(2).join(' '));
                    break;
                case 'resetvote':
                    votesRef.set(null);
                    break;
                case 'clearevts':
                    eventsRef.set(null);
                    break;
            }
            renderScreen();
            return;
        }

        if (answer.trim() === '') return errorScreen('Du kan ikke sende tom melding.');
        chatRef.set({
            msg: answer,
            author: userCfg.nick
        });
        dispatchEvent(EVENT_CHAT, {
            msg: answer
        });
        renderScreen();
    });
}

if (!isDev) dispatchEvent(EVENT_JOIN, null);