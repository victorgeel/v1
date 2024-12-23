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
            await sendTelegramMessage(
                chatId,
                "V2RAY Key များရယူနိုင်ပါပြီ! စတင်ရန် /help ကိုနှိပ်ပြီး command များကြည့်ပါ."
            );
        } else if (command === "/help") {
            const helpMessage = `
*𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗳𝗼𝗿 𝗩2𝗥𝗔𝗬 𝗞𝗘𝗬𝗦:*

/key1 - Get free V2RAY key1  
/key2 - Get free V2RAY key2  
/key3 - Get free V2RAY key3  
/key4 - Get free V2RAY key4  
/key5 - Get free V2RAY key5  
/key6 - Get free V2RAY key6  
/hk   - Get Hong Kong server keys  
/jp   - Get Japan server keys  
/sg   - Get Singapore server keys  
/us   - Get United States server keys  
/tw   - Get Taiwan server keys  
/uk   - Get United Kingdom server keys  

_Servers are updated over time. Developed by @VictorIsGeek._
            `;
            await sendTelegramMessage(chatId, helpMessage);
        } else if (command.startsWith("/")) {
            const urls = {
                "/key1": "https://raw.githubusercontent.com/lagzian/SS-Collector/main/SS/VM_Trinity.txt",
                "/key2": "https://raw.githubusercontent.com/SonzaiEkkusu/V2RayDumper/main/config.txt",
                "/key3": "https://raw.githubusercontent.com/iboxz/free-v2ray-collector/main/main/mix",
                "/key4": "https://raw.githubusercontent.com/roosterkid/openproxylist/main/V2RAY_RAW.txt",
                "/key5": "https://raw.githubusercontent.com/MrMohebi/xray-proxy-grabber-telegram/master/collected-proxies/row-url/actives.txt",
                "/key6": "https://raw.githubusercontent.com/miladtahanian/V2RayCFGDumper/main/config.txt",
                "/hk": "https://raw.githubusercontent.com/SoliSpirit/v2ray-configs/main/Countries/Hong_Kong.txt",
                "/jp": "https://raw.githubusercontent.com/SoliSpirit/v2ray-configs/main/Countries/Japan.txt",
                "/sg": "https://raw.githubusercontent.com/SoliSpirit/v2ray-configs/main/Countries/Singapore.txt",
                "/us": "https://raw.githubusercontent.com/SoliSpirit/v2ray-configs/main/Countries/United_States.txt",
                "/tw": "https://raw.githubusercontent.com/SoliSpirit/v2ray-configs/main/Countries/Taiwan.txt",
                "/uk": "https://raw.githubusercontent.com/SoliSpirit/v2ray-configs/main/Countries/United_Kingdom.txt",
            };

            if (urls[command]) {
                await fetchAndSendMultipleLines(chatId, urls[command]);
            } else {
                await sendTelegramMessage(chatId, "Unknown command. Use /help to see available commands.");
            }
        }
    } catch (error) {
        console.error("Error handling update:", error);
        await sendTelegramMessage(chatId, "An error occurred. Please try again.");
    }
}

async function fetchAndSendMultipleLines(chatId, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch data from URL: ${url}`);

        const data = await response.text();
        const lines = data
            .split("\n")
            .filter(line => line.trim() !== "" && !line.startsWith("#")) // Remove empty lines and those with `#`
            .map(line => line.split("#")[0].trim()); // Remove comments after `#`

        if (lines.length === 0) throw new Error("No valid keys found.");

        // Select 10 random lines
        const selectedLines = [];
        while (selectedLines.length < 10 && lines.length > 0) {
            const randomIndex = Math.floor(Math.random() * lines.length);
            selectedLines.push(lines[randomIndex]);
            lines.splice(randomIndex, 1); // Remove the selected line to avoid duplicates
        }

        const formattedText = selectedLines.join("\n\n");
        await sendTelegramMessage(chatId, `\`\`\`\n${formattedText}\n\`\`\``);
    } catch (error) {
        console.error("Error fetching subscription:", error);
        await sendTelegramMessage(chatId, `Error retrieving data for the provided URL.`);
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
