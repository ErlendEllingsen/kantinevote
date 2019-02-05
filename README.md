<img src="https://i.imgur.com/SmLcicd.jpg">
<a href="http://bit.ly/kantinevote">bit.ly/kantinevote</a>


## Oppsett

    git clone https://github.com/ErlendEllingsen/randomcrap-mat.git kantinevote
    cd ./kantinevote
    npm install

### Få tilsendt `key.json` (mail, hipchat)

Legg denne i kantinevote-mappen

### Kjør kantinevote

`node index.js`

Velg nickname

Deretter start programmet igjen :~)

### Oppdatere klienten
`npm run update`


## Instruksjoner

Kommandoer:

* `/vote <h2|h9>` - stemme på en kantine (én per dag)
* `/delvote` - sletter din stemme

Host-kommandoer:

* `/host <h2|h9> <meal>` - setter dagens rett
* `/host resetvote` - sletter alle votes
* `/host clearevts` - clear events

### Other/misc

Commands used to read info:

* `whoami` - username
* `hostname` - device info
* `realm list` - realm info


