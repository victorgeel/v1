const TELEGRAM_API = 'https://api.telegram.org/bot';
const BOT_TOKEN = '7292124945:AAFSrbllIZ6z1wWc7OZxEe5mxQn7iZUmnxs'; // Replace with the actual bot token
const BASE_URL = `${TELEGRAM_API}${BOT_TOKEN}`;
const ADMIN_USER_ID = '1441910304'; // Replace with the admin's Telegram user ID
const REFERRAL_KEYWORDS = ["refer", "air", "joinchat", "invite", "t.me"];
const GREETING_TEXT = "𝐇𝐢! 𝐍𝐢𝐜𝐞 𝐭𝐨 𝐬𝐞𝐞 𝐲𝐨𝐮 𝐡𝐞𝐫𝐞. 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐟𝐫𝐨𝐦 𝐅𝐚𝐬𝐭𝐬𝐬𝐡 𝐌𝐲𝐚𝐧𝐦𝐚𝐫 𝐠𝐫𝐨𝐮𝐩!";

// Helper function for Telegram API requests
async function telegramApi(endpoint, payload) {
    const url = `${BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.description || 'Unknown error');
    }
    return response.json();
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
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch data. HTTP status: ${response.status}`);

        const data = await response.text();
        const decodedText = atob(data.trim());
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

// Handle commands from admin
async function handleCommand(command, chatId) {
    const links = {
        '/key': "https://github.com/Memory2314/VMesslinks/raw/main/links/vmess",
        '/key1': "https://raw.githubusercontent.com/lagzian/SS-Collector/main/SS/V2rayMix",
        '/key2': "https://testingcf.jsdelivr.net/gh/peasoft/NoMoreWalls@master/list.txt",
        '/key3': "https://raw.githubusercontent.com/MhdiTaheri/V2rayCollector/main/sub/ssbase64",
        '/key4': "https://raw.githubusercontent.com/MhdiTaheri/V2rayCollector/main/sub/ssbase64",
        '/key5': "https://raw.githubusercontent.com/lagzian/SS-Collector/main/backup_B64.txt",
        '/key6': "https://raw.githubusercontent.com/lagzian/new-configs-collector/main/countries/jp/mixed",
        '/key7': "https://raw.githubusercontent.com/lagzian/new-configs-collector/main/countries/sg/mixed"
    };

    if (links[command]) {
        await fetchAndSendSubscription(chatId, links[command]);
    } else {
        await sendTelegramMessage(chatId, "**Unknown command. Use a valid subscription command (e.g., /key, /key1, ..., /key7).**");
    }
}

// Handle incoming messages
async function handleMessage(message) {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text?.toLowerCase() || '';

    // Check for referral links
    if (REFERRAL_KEYWORDS.some(keyword => text.includes(keyword))) {
        await banUser(chatId, userId, message.message_id);
        return;
    }

    // Welcome new members
    if (message.new_chat_members) {
        const members = message.new_chat_members.map(m => m.username ? `@${m.username}` : m.first_name).join(', ');
        await sendTelegramMessage(chatId, `${GREETING_TEXT} Hi ${members}!`);
        return;
    }

    // Handle commands from admin
    if (text.startsWith('/')) {
        if (userId.toString() === ADMIN_USER_ID) {
            await handleCommand(text, chatId);
        } else {
            await sendTelegramMessage(chatId, "You do not have permission to use this command.");
        }
    }
}

// Cloudflare Worker event handler
addEventListener('fetch', event => {
    event.respondWith((async () => {
        try {
            const request = event.request;
            if (request.method === 'POST') {
                const update = await request.json();
                if (update.message) {
                    await handleMessage(update.message);
                }
                return new Response('OK', { status: 200 });
            }

            return new Response('Bot is online and running!', { status: 200 });
        } catch (error) {
            console.error('Error processing request:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    })());
});
