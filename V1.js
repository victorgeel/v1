const TELEGRAM_BOT_TOKEN = "7168523391:AAH-Ow7IK3aulE2adNQE3vjPJn2TuXNhIBo";
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function handleTelegramUpdate(update) {
    if (!update.message) return;

    const chatId = update.message.chat.id;
    const text = update.message.text;

    if (update.message.chat.type === "group" || update.message.chat.type === "supergroup") {
        if (!text.startsWith("/") || !text.includes(`@${update.message.bot_username}`)) {
            return;
        }
    }

    const commandText = text.split(" ")[0];
    const command = commandText.replace(/@[\w_]+$/, "").trim();

    try {
        if (command === "/start") {
            await sendTelegramMessage(chatId, "Welcome to the bot! Use /help to see available commands.");
        } else if (command === "/help") {
            const helpMessage = `
\`\`\`
𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗼𝗳 𝘁𝗵𝗲 𝘃2𝗿𝗮𝘆  𝗞𝗘𝗬 𝗕𝗼𝘁 ....\`\`\`

/key - Get free V2RAY keys

/mss - Get free VMess keys

/cf - Get free Cloudflare keys

/ss - Get free Shadowsocks keys

/trj - Get free Trojan keys

/lss - Get free VLess keys

/jp - Get Japan server keys

/sg - Get Singapore server keys

\`\`\`
ဆာဗာများသည်အချိန်နှင့် အမျှ 𝚞𝚙𝚍𝚊𝚝𝚎 ပြောင်းလဲပါသည် 

Bot develope by.............. @VictorIsGeek\`\`\`


            `;
            await sendTelegramMessage(chatId, helpMessage);
        } else if (command === "/key") {
            await fetchAndSendSubscription(chatId, "https://9527521.xyz/pubconfig/OsngjqRzWSAmPadi");
        } else if (command === "/mss") {
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/lagzian/SS-Collector/main/SS/VM_Trinity");
        } else if (command === "/cf") {
            await fetchAndSendSubscription(chatId, "https://testingcf.jsdelivr.net/gh/peasoft/NoMoreWalls@master/list.txt");
        } else if (command === "/ss") {
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/MhdiTaheri/V2rayCollector/main/sub/ssbase64");
        } else if (command === "/trj") {
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/MhdiTaheri/V2rayCollector/main/sub/ssbase64");
        } else if (command === "/lss") {
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/lagzian/SS-Collector/main/backup_B64.txt");
        } else if (command === "/jp") {
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/lagzian/new-configs-collector/main/countries/jp/mixed");
        } else if (command === "/sg") {
            await fetchAndSendSubscription(chatId, "https://raw.githubusercontent.com/lagzian/new-configs-collector/main/countries/sg/mixed");
        } else {
            await sendTelegramMessage(chatId, "Unknown command. Use /help to see available commands.");
        }
    } catch (error) {
        console.error("Error handling update:", error);
        await sendTelegramMessage(chatId, "An error occurred. Please try again.");
    }
}

async function fetchAndSendSubscription(chatId, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch data.");

        const data = await response.text();

        // Decode Base64 if applicable; fallback to raw
        let decodedText;
        try {
            decodedText = atob(data);
        } catch {
            decodedText = data;
        }

        const lines = decodedText.split("\n").filter(line => line.trim() !== "");
        const selectedKeys = lines.slice(0, 15); // Limit to 15 keys
        if (selectedKeys.length === 0) throw new Error("No valid keys found.");

        const formattedText = `\`\`\`\n${selectedKeys.join("\n")}\n\`\`\``;
        await sendTelegramMessage(chatId, formattedText);
    } catch (error) {
        console.error("Error fetching subscription:", error);
        await sendTelegramMessage(chatId, "Unable to retrieve keys. Please check the source URL or try again later.");
    }
}

async function sendTelegramMessage(chatId, text) {
    const url = `${BASE_URL}/sendMessage`;
    const payload = { chat_id: chatId, text, parse_mode: "Markdown" };

    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export default {
    async fetch(request) {
        if (request.method === "POST") {
            const update = await request.json();
            await handleTelegramUpdate(update);
            return new Response("OK", { status: 200 });
        }
        return new Response("Bot is online!", { status: 200 });
    },
};
