/**
 * Used for the host to gather information about todays meals.
 * Machine, username and password is needed to authenticate using NTLM over intranet.
 */

const { execFile } = require('child_process');
const prompt = require('password-prompt')
const ntlm = require('request-ntlm-lite');
const striptags = require('striptags');

module.exports = (() => {

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
})();