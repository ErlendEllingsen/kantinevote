const fs = require('fs');
const readline = require('readline');
const uuid = require('uuid/v1');
const colors = require('colors');
const pack = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());

async function getNick() {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
    
          rl.question('Velg nick for chat: ', (answer) => {
            rl.close();
            return resolve(answer);
        });
    })
}

async function setupUserConfig() {
    console.log(
`-----------------------------
${colors.bgBlue(`Hei, velkommen til KV  ${pack.version}`)}
-----------------------------
${colors.yellow('*')} Her vil du få muligheten til å se dagens varmmattilbud i H2/H9
${colors.yellow('*')} Og deretter muligheten til å stemme på hvilke kantine du vil til
${colors.yellow('*')} Avstemningen foregår i sanntid
${colors.yellow('*')} Kun en stemme per dag per bruker.
-----------------------------`
    );
    const nick = await getNick();
    const userid = uuid();

    fs.writeFileSync(__dirname + '/../user.json', JSON.stringify({
        nick,
        userid
    }))

    process.exit(0);
}

module.exports = {
    getNick,
    setupUserConfig
};