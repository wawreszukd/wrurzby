const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { DISCORD_BOT_TOKEN, TARGET_CHANNEL_ID } = process.env;

const base_url="http://server:2137/api/"
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});
function transformData(response) {
    const data = response.data;
  return data.map(item => {
    return `\`\`\`
id: ${item.id}  
color: ${item.color}
user: ${item.user}
tekst: ${item.text}\`\`\`
`;
  });
}
client.once('ready', () => {
    console.log(`Bot is online! Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.channelId !== TARGET_CHANNEL_ID) {
        return
    }

    const { commandName } = interaction;

    if (commandName === 'get') {

        const config = {
                method: "get",
                url: base_url + "messages"
            };
        await interaction.deferReply()
        const response = await axios(config);

        let text = transformData(response)
        if(text.length < 1){
            text = "puste jest"
        }
        await interaction.editReply(`${text}`);
    } else if (commandName === 'add') {
        const user = interaction.options.getString('user');
        const bodyString = interaction.options.getString('text');

        try {
            const config = {
                method: 'post',
                url: base_url + "messages",
                data: {
                    user: user,
                    text: bodyString   
                }
            };

            

            await interaction.deferReply(); // Daje botowi czas na odpowiedź
            const response = await axios(config);
            text = `\`\`\`
id: ${response.data.id}
color: ${response.data.color}
user: ${response.data.user}
tekst: ${response.data.text}\`\`\`
            `
            await interaction.editReply(`dodano ${text}`);
        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred while fetching the data: ${error.message}`);
        }
    }else if (commandName === 'remove-id') {
        const id = interaction.options.getString('id');
        const config = {
                method: "delete",
                url: base_url + `messages/${id}`
            };
        try{
            await interaction.deferReply()
            const response = await axios(config);
            await interaction.editReply(`${response.data}`);
        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred while fetching the data: ${error.message}`);
        }
    }else if (commandName === 'remove-gostek') {
        const user = interaction.options.getString('nickname');
        const config = {
                method: "delete",
                url: base_url + `messages/by-user/${user}`
            };
        try{
            await interaction.deferReply()
            const response = await axios(config);
            await interaction.editReply(`${response.data}`);
        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred while fetching the data: ${error.message}`);
        }
    }else if (commandName === 'remove-last') {
        const config = {
                method: "delete",
                url: base_url + `messages/oldest`
            };
        try{
            await interaction.deferReply()
            const response = await axios(config);
            await interaction.editReply(`${response.data}`);
        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred while fetching the data: ${error.message}`);
    }
}
});

client.login(DISCORD_BOT_TOKEN);