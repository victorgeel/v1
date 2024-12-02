const TELEGRAM_API = 'https://api.telegram.org/bot';
const BOT_TOKEN = "7292124945:AAFSrbllIZ6z1wWc7OZxEe5mxQn7iZUmnxs";
const BASE_URL = `${TELEGRAM_API}${BOT_TOKEN}`;
const REFERRAL_KEYWORDS = ["refer", "air", "joinchat", "invite", "t.me"];
const GREETING_TEXT = "𝐇𝐢! 𝐍𝐢𝐜𝐞 𝐭𝐨 𝐬𝐞𝐞 𝐲𝐨𝐮 𝐡𝐞𝐫𝐞. 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐟𝐫𝐨𝐦 𝐅𝐚𝐬𝐭𝐬𝐬𝐡 𝐌𝐲𝐚𝐧𝐦𝐚𝐫 𝐠𝐫𝐨𝐮𝐩!";

// Helper function for Telegram API requests
async function telegramApi(endpoint, payload) {
    const url = `${BASE_URL}/${endpoint}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!result.ok) throw new Error(result.description);
        return result;
    } catch (error) {
        console.error(`Telegram API error (${endpoint}):`, error);
        throw error;
    }
}

// Send a Telegram message
async function sendTelegramMessage(chatId, text) {
    await telegramApi('sendMessage', { chat_id: chatId, text, parse_mode: 'Markdown' });
}

// Delete a Telegram message
async function deleteTelegramMessage(chatId, messageId) {
    await telegramApi('deleteMessage', { chat_id: chatId, message_id: messageId });
}

// Ban a user and delete their message
async function banUser(chatId, userId, messageId) {
    await deleteTelegramMessage(chatId, messageId);
    await telegramApi('kickChatMember', {
        chat_id: chatId,
        user_id: userId,
        until_date: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // Ban for 1 year
    });
    await sendTelegramMessage(chatId, `**◦•●◉✿ ကဲ  referral links အချတော်တဲ့ ${userId} ကို ဂုဏ်ပြုလိုက်ပါပြီ  ✿◉●•◦ .**`);
}

// Fetch and send subscription data
async function fetchAndSendSubscription(chatId, url) {
    try {
        console.log("Fetching URL:", url);
        const response = await fetch(url);
        console.log("Response status:", response.status);

        if (!response.ok) throw new Error(`Failed to fetch data. HTTP status: ${response.status}`);

        const data = await response.text();
        console.log("Raw data:", data);

        let decodedText;
        try {
            decodedText = atob(data.trim()); // Attempt Base64 decoding
        } catch {
            decodedText = data; // Use raw text if decoding fails
        }

        const lines = decodedText.split("\n").filter(line => line.trim() !== "");
        const selectedKeys = lines.slice(0, 20); // Limit to 20 keys
        if (selectedKeys.length === 0) throw new Error("No valid keys found.");

        const formattedText = `\`\`\`\n${selectedKeys.join("\n")}\n\`\`\``;
        await sendTelegramMessage(chatId, formattedText);
    } catch (error) {
        console.error("Error fetching subscription:", error);
        await sendTelegramMessage(chatId, `Unable to retrieve keys. Error: ${error.message}`);
    }
}

// Handle bot commands
async function handleCommand(command, chatId) {
    switch (command) {
        case '/start':
            await sendTelegramMessage(chatId, '**!(¯`*•.¸,¤°´✿.｡.:* Bot အားအသုံးပြုသည့်အတွက်ကိုဆိုပါတယ်   /help နှိပ်ပြီး ဆက်လက် လုပ်ဆောင်ပါ .:**:.☆*.:｡.✿ .**');
            break;
        case '/help':
            await sendTelegramMessage(chatId, `
\`\`\`
𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐥𝐢𝐬𝐭 𝐨𝐭 𝐭𝐡𝐞 𝐁𝐨𝐭\`\`\`

/key - 
Get free V2RAY keys

/mss - 
Get free VMess keys

/cf - 
Get free Cloudflare keys

/ss - 
Get free Shadowsocks keys

/trj - 
Get free Trojan keys

/lss - 
Get free VLess keys

/jp - 
Get Japan server keys

/sg - 
Get Singapore server keys

\`\`\`
𝐀𝐧𝐭𝐢-𝐫𝐞𝐟𝐞𝐫𝐫𝐚𝐥 𝐬𝐲𝐬𝐭𝐞𝐦 𝐞𝐧𝐚𝐛𝐥𝐞𝐝. 𝐕𝐢𝐨𝐥𝐚𝐭𝐨𝐫𝐬 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐛𝐚𝐧𝐧𝐞𝐝 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐥𝐥𝐲.\`\`\`

𝘽𝙤𝙩 𝙙𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙙 𝙗𝙮 @𝙑𝙞𝙘𝙩𝙤𝙧𝙄𝙨𝙂𝙚𝙚𝙠.

            `);
            break;
        case '/key':
            await fetchAndSendSubscription(chatId, "https://github.com/Memory2314/VMesslinks/raw/main/links/vmess");
            break;
        case '/mss':
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/lagzian/SS-Collector/main/SS/V2rayMix");
            break;
        case '/cf':
            await fetchAndSendSubscription(chatId, "https://testingcf.jsdelivr.net/gh/peasoft/NoMoreWalls@master/list.txt");
            break;
        case '/ss':
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/MhdiTaheri/V2rayCollector/main/sub/ssbase64");
            break;
        case '/trj':
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/MhdiTaheri/V2rayCollector/main/sub/ssbase64");
            break;
        case '/lss':
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/lagzian/SS-Collector/main/backup_B64.txt");
            break;
        case '/jp':
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/lagzian/new-configs-collector/main/countries/jp/mixed");
            break;
        case '/sg':
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/lagzian/new-configs-collector/main/countries/sg/mixed");
            break;
        default:
            await sendTelegramMessage(chatId, "**Unknown command. Use /help to see available commands.**");
    }
}

// Handle incoming messages
async function handleMessage(message) {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const messageId = message.message_id;
    const normalizedText = message.text?.toLowerCase() || '';

    if (normalizedText.startsWith('/')) {
        const command = normalizedText.split(" ")[0].replace(/@[\w_]+$/, "").trim();
        await handleCommand(command, chatId);
    } else if (REFERRAL_KEYWORDS.some(keyword => normalizedText.includes(keyword))) {
        await banUser(chatId, userId, messageId);
    }
}

// Handle Telegram updates
async function handleTelegramUpdate(update) {
    if (update.message?.new_chat_members) {
        const chatId = update.message.chat.id;
        const members = update.message.new_chat_members.map(m => m.username || m.first_name).join(', ');
        await sendTelegramMessage(chatId, `${GREETING_TEXT} @${members}`);
    }

    if (update.message?.text) {
        await handleMessage(update.message);
    }
}

// Cloudflare Worker event handler
addEventListener('fetch', event => {
    event.respondWith((async () => {
        try {
            if (event.request.method === 'POST') {
                const update = await event.request.json();
                await handleTelegramUpdate(update);
                return new Response('OK', { status: 200 });
            }
            return new Response('Bot is online!', { status: 200 });
        } catch (error) {
            console.error('Error processing request:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    })());
});
