const fs = require('fs');
const readline = require('readline');
const { execFile } = require('child_process');
const prompt = require('password-prompt')
const ntlm = require('request-ntlm-lite');
const colors = require('colors');
const uuid = require('uuid/v1');
var striptags = require('striptags');
var firebase = require("firebase");

const pack = JSON.parse(fs.readFileSync('./package.json').toString());

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

    const host = JSON.parse(fs.readFileSync('./host.json').toString());

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

    fs.writeFileSync('./user.json', JSON.stringify({
        nick,
        userid
    }))

    process.exit(0);
}


if (!fs.existsSync('./user.json')) {
    setupUserConfig();
    return;
}

if (!fs.existsSync('./key.json')) {
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

const userCfg = JSON.parse(fs.readFileSync('./user.json').toString());








// FIREBASE STUFF 

firebase.initializeApp({
    serviceAccount: "./key.json",
    databaseURL: "https://kantinebot.firebaseio.com/"
  });  //by adding your credentials, you get authorized to read and write from the database

var db = firebase.database();
var ref = db.ref("/");  //Set the current directory you are working in

console.log('Loading...');

ref.on("value", function(snapshot) {
    var data = snapshot.val();   //Data is in JSON format.
    updateLine(data);
  });


const updateLine = (value) => {

    process.stdout.moveCursor(0,-1);
    process.stdout.clearLine();
    process.stdout.moveCursor(0,-1);
    process.stdout.clearLine();
    process.stdout.moveCursor(0,-1);
    process.stdout.clearLine();
    process.stdout.moveCursor(0,-1);
    process.stdout.clearLine();
    process.stdout.moveCursor(0,-1);
    process.stdout.clearLine();
    process.stdout.moveCursor(0,-1);
    process.stdout.clearLine();
    process.stdout.moveCursor(0,-1);
    process.stdout.clearLine();
    process.stdout.moveCursor(0,-1);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`
-----------------------------
${colors.bgBlue(`Mat ${pack.version} - ${new Date().toLocaleDateString()}`)}
-----------------------------
Mat : omething something something
Chat: ${colors.yellow(value.chat.author)}: ${colors.grey(value.chat.msg)}
Poll: Votes for h9: ${value.h9} h2: ${value.h2}\n`);
    chatFeature();
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


const chatFeature = () => {
    
    rl.question('Enter chat msg: ', (answer) => {
        // TODO: Log the answer in a database
        ref.set({
            chat: {
                msg: answer,
                author: userCfg.nick
            }
        })
        //console.log(`Thank you for your valuable feedback: ${answer}`);
    });
}


//getTodaysMenu();
