#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # 
nvm use 22

if pgrep -f "server.ts" > /dev/null
then
    echo "Zabijam poprzedni proces widgetu..."

    pkill -f "server.ts"
    sleep 2
else
    echo "Nie znaleziono aktywnego procesu widgetu."
fi


echo "Uruchamiam nowego widgetu..."

nohup deno run --allow-net --allow-read ./serwerek/server.ts > serverlogs.txt 2>&1 &

echo "Nowy proces bociaka został uruchomiony w tle."
echo "Logi są zapisywane do pliku bocialogs.txt."


if pgrep -f "bociak.js" > /dev/null
then
    echo "Zabijam poprzedni proces bociak..."

    pkill -f "bociak.js"
    sleep 2
else
    echo "Nie znaleziono aktywnego procesu widgetu."
fi


echo "Uruchamiam nowego widgetu..."

nohup node ./discord-bot/bociak.js > bociaklogs.txt 2>&1 &

echo "Nowy proces bociak został uruchomiony w tle."
echo "Logi są zapisywane do pliku bociaklogs.txt."