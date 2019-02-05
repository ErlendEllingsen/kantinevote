#!/usr/bin/env node

// beware of ugly code
// u were warned

const fs = require('fs');
const readline = require('readline');
const { execFile } = require('child_process');
const prompt = require('password-prompt')
const ntlm = require('request-ntlm-lite');
const colors = require('colors');
const uuid = require('uuid/v1');
var striptags = require('striptags');
var firebase = require("firebase");

// CONSTS
const EVENT_CHAT = 'EVENT_CHAT';
const EVENT_JOIN = 'EVENT_JOIN';


const pack = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());

const mos = [
    'januar',
    'februar',
    'mars',
    'april',
    'mai',
    'juni',
    'juli',
    'august',
    'september',
    'oktober',
    'november',
    'desember',
]

const getTodaysDateNorwegian = () => {
    const d = new Date();
    return (`${d.getDate()}. ${mos[d.getMonth()]}`);
}

const parseWebMenu = ((machine, username, password) => {

    const host = JSON.parse(fs.readFileSync(__dirname + '/host.json').toString());

    const {ntlm_domain, url} = host;

    var opts = {
        username: username,
        password: password,
        ntlm_domain,
        workstation: machine,
        url
      };


      var json = {
        // whatever object you want to submit
      };
      
      ntlm.get(opts, json, function(err, response) {
          console.log(response.statusCode);
          findTodaysMeal(response.body);
      });


})

const findTodaysMeal = (bod) => {
    let workbod = bod.toLowerCase(); 
    const today = getTodaysDateNorwegian();
    const meal = workbod.split(today)[1].split('</div>')[0];

    const hotMeal = (meal.split('her og nå varmt</strong>')[1].split('<strong>sandwich</strong>')[0]);
    
    let hotMeals = hotMeal.split('<p>');
    hotMeals = hotMeals.slice(1);
    hotMeals.splice(-1, 1);

    hotMeals = hotMeals.map((el) => {
        const mealArr = el.split('&#160;');
        return {
            name: striptags(mealArr[0]),
            price: striptags(mealArr[1])
        }
    })
    
    console.log(hotMeals);
}


async function getUsername() {
    return new Promise((resolve, reject) => {
        execFile('whoami', [], (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            return resolve(stdout.trim());
        });
    });
}

async function getMachineName() {
    return new Promise((resolve, reject) => {
        execFile('hostname', [], (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            return resolve(stdout.trim());
        });
    });
}

async function getPassword() {
    return prompt('password: ', {
        method: 'hide'
    })
}

async function getTodaysMenu() {
    const username = await getUsername(); 
    const machine = await getMachineName();
    const password = (await getPassword()).trim(); 
    
    parseWebMenu(machine, username, password);
}



async function getNick() {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
    
          rl.question('Velg nick for chat: ', (answer) => {
            // TODO: Log the answer in a database
            rl.close();
            return resolve(answer);
            //console.log(`Thank you for your valuable feedback: ${answer}`);
        });
    })
}

async function setupUserConfig() {
    console.log(
`-----------------------------
${colors.bgBlue(`Hei, velkommen til mat ${pack.version}`)}
-----------------------------
${colors.yellow('*')} Her vil du få muligheten til å se dagens varmmattilbud i H2/H9
${colors.yellow('*')} Og deretter muligheten til å stemme på hvilke kantine du vil til
${colors.yellow('*')} Stemmingen foregår i sanntid
${colors.yellow('*')} Kun en stemme per dag per bruker.
-----------------------------`
    );
    const nick = await getNick();
    const userid = uuid();

    fs.writeFileSync(__dirname + '/user.json', JSON.stringify({
        nick,
        userid
    }))

    process.exit(0);
}


if (!fs.existsSync(__dirname + '/user.json')) {
    setupUserConfig();
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

const userCfg = JSON.parse(fs.readFileSync(__dirname + '/user.json').toString());

// FIREBASE STUFF 

firebase.initializeApp({
    serviceAccount: "./key.json",
    databaseURL: "https://kantinebot.firebaseio.com/"
  });  //by adding your credentials, you get authorized to read and write from the database

var db = firebase.database();
var coreRef = db.ref("/core");  //Set the current directory you are working in
var chatRef = db.ref("/core/chat");  //Set the current directory you are working in
var h2Ref = db.ref("/core/mat/h2");  //Set the current directory you are working in
var h9Ref = db.ref("/core/mat/h9");  //Set the current directory you are working in
var votesRef = db.ref("/core/votes");  //Set the current directory you are working in
var eventsRef = db.ref("/events");  //Set the current directory you are working in
var onlineRef = db.ref("/users");  //Set the current directory you are working in


console.log('Loading...');


let coreData = {};
let eventsData = {};

coreRef.on("value", function(snapshot) {
    coreData = snapshot.val();
    if (coreData == null) coreData = {};
    updateLine();
});

eventsRef.orderByChild("ts").limitToLast(10).on("value", function(snapshot) {
    eventsData = snapshot.val();
    if (eventsData == null) eventsData = {};
    updateLine();
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
    setTimeout(updateLine, 3000);
}

const successScreen = (message) => {
    clearScreen();
    console.log(colors.bgGreen(message));
    setTimeout(updateLine, 3000);
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

const renderEvtLog = () => {
    let lines = [];

    const evts = Object.values(eventsData);

    lines = evts.map((el) => {

        const d = new Date(el.ts);
        const hrs = `${d.getHours()}:${d.getMinutes()}`;

        let line = `${hrs} [${colors.yellow(el.username)}] `;
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
Stem med /vote <h2|h9>
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


    // console.log(systemData.votes);

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
        } else if (answer.startsWith('/host')) {
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
            updateLine();
            return;
        }

        // TODO: Log the answer in a database

        if (answer.trim() === '') return errorScreen('Du kan ikke sende tom melding.');

        chatRef.set({
            msg: answer,
            author: userCfg.nick
        });
        dispatchEvent(EVENT_CHAT, {
            msg: answer
        });
        updateLine();
        //console.log(`Thank you for your valuable feedback: ${answer}`);
    });
}

dispatchEvent(EVENT_JOIN, null);