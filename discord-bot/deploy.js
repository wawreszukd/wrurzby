const { REST, Routes } = require('discord.js');
require('dotenv').config();

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commands = [
    {
        name:"get",
        description: "liste calomd aje ez"
    },
    {
        name: 'add',
        description: 'no dodaje a co ma robic',
        options: [
            {
                name: 'user',
                description: 'gostek',
                type: 3, 
                required: true,
            },
            {
                name: 'text',
                description: 'nom tekst jaki tam jest nie',
                type: 3, 
                required: true,
            },
        ],
    },
    {
        name: 'remove-id',
        description: 'usowa po aj di.',
        options: [
            {
                name: 'id',
                description: 'zgadnij',
                type: 3, 
                required: true,
            },
        ],
    },
     
    {
        name: 'remove-gostek',
        description: 'usowa po gostku.',
        options: [
            {
                name: 'nickname',
                description: 'zgadnij',
                type: 3,
                required: true,
            },
        ],
        
    },
    {
        name: 'remove-last',
        description: 'usowa ostatniom.',
    },
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();