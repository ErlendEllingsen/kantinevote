<img src="https://i.imgur.com/SmLcicd.jpg">
<a href="http://bit.ly/kantinevote">bit.ly/kantinevote</a>


## Oppsett

    git clone https://github.com/ErlendEllingsen/kantinevote.git
    cd ./kantinevote
    npm install
    vim ./key.json
    # legg inn nøkelen du mottar av en på teamet
    node index.js

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
* `/notifications <on|off>` - skru varsler av/på (på default), kun aktivt med program oppe 
* `/exit` - exit programmet 

For å exite programmet: q, exit, eller /exit

Host-kommandoer:

* `/host <h2|h9> <meal>` - setter dagens rett
* `/host resetvote` - sletter alle votes
* `/host clearevts` - clear events

### Other/misc

Commands used to read info:

* `whoami` - username
* `hostname` - device info
* `realm list` - realm info


