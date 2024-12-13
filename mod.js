const TELEGRAM_API = 'https://api.telegram.org/bot';
const BOT_TOKEN = '8148320547:AAFxYwJkhEkGJwtnm2h8n4DxCCLW92ONKds'; // Use environment variable for security
const WEBHOOK_URL = 'https://v1.geek79437.workers.dev/'; // Use environment variable for webhook URL
const REFERRAL_KEYWORDS = ["ref", "joinchat", "tiktok", "airdrop", "share", "invite", "t.me"];

// Commands Map
const COMMANDS = {
    '/start': 'Hello! Free V2RAY Key များယူရန် Bot @geekey_bot .Bot developer @VictorIsGeek!',
    '/help': `**Help Menu**\n\nAvailable Commands:\n\nPsiphon termux cmd: \n\`\`\`/psi\`\`\`\n\nFree VPN Config tool: \n\`\`\`/freecfg\`\`\`\n\nBug & SNI Finder tool: \n\`\`\`/bugsni\`\`\`\n\nX-ray V2RAY Subscription Update Links: \n\`\`\`/sub\`\`\`\n\nSubdomain & Port Scanner: \n\`\`\`/subpt\`\`\``,
    '/subpt': `**Subdomain and Port Scanner Instructions**\n\n*Update Your Termux Pkg*\n\`\`\`python\npkg update\npkg upgrade\`\`\`\n\nClone Repo\n\`\`\`Git\ngit clone https://github.com/victorgeel/SubFinder.git\`\`\`\n\nRun Subfinder\n\`\`\`python\npython Run.py\`\`\`\n\nRun Port Scanner\n\`\`\`python\npython portscan.py\`\`\``,
    '/bugsni': `**Bug & SNI Finder Tool**\n\n\`\`\`python\npkg update && pkg upgrade -y\npkg install golang\`\`\`\n\nClone the repo\n\`\`\`python\ngit clone https://github.com/victorgeel/Sub-BugSNI.git\ncd Sub-BugSNI\nchmod +x *\`\`\`\n\nInstall requirements\n\`\`\`python\npip3 install -r requirements.txt\`\`\`\n\nRun the tool\n\`\`\`python\npython run.py\`\`\``,
    '/psi': `**Psiphon Pro for Android Termux**\n\`\`\`python\npkg update\npkg upgrade -y\npkg install git\npkg install golang\`\`\`\n\nClone the repo\n\`\`\`python\ngit clone https://github.com/victorgeel/Yes.git\ncd Yes\nchmod +x *\`\`\`\n\nRun Psiphon\n\`\`\`./yes\`\`\`\n\nSocks proxy settings\n\`\`\`socks\n127.0.0.1:3080\`\`\``,
    '/sub': `Free V2RAY Keys များယူရန် Bot t.me/geek_bot @geekey_bot,
    '/freecfg': `**Free VPN Config Tool**\n\n*Update Termux Pkg*\n\`\`\`shell\npkg update\npkg upgrade\`\`\`\n\nClone Repo\n\`\`\`shell\ngit clone https://github.com/victorgeel/FreeVpn.git\ncd FreeVpn\`\`\`\n\nRun Tool\n\`\`\`Shell\nbash Sel.sh\`\`\`\n\n•Enter 99 to install the script. Follow further steps as prompted.`,
};

// Function to set the webhook URL
async function setWebhook() {
    const webhookUrl = `${TELEGRAM_API}${BOT_TOKEN}/setWebhook`;

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: WEBHOOK_URL }),
    });

    const result = await response.json();
    if (result.ok) {
        console.log('Webhook set successfully:', result);
    } else {
        console.error('Failed to set webhook:', result);
    }
}

// Function to send a message
async function sendMessage(chatId, text) {
    const sendMessageUrl = `${TELEGRAM_API}${BOT_TOKEN}/sendMessage`;

    const response = await fetch(sendMessageUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
        }),
    });

    if (!response.ok) {
        console.error(`Failed to send message to ${chatId}:`, await response.json());
    }
}

// Function to ban a user
async function banUser(chatId, userId) {
    const banUrl = `${TELEGRAM_API}${BOT_TOKEN}/kickChatMember`;

    const response = await fetch(banUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            user_id: userId,
            until_date: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year ban
        }),
    });

    if (response.ok) {
        await sendMessage(chatId, `User with ID ${userId} has been banned for sending referral links.`);
    } else {
        console.error(`Failed to ban user ${userId}:`, await response.json());
    }
}

// Function to handle new member welcome messages
async function handleNewMembers(chatId, newMembers) {
    const usernames = newMembers.map((member) => `@${member.username || member.first_name}`).join(', ');
    const message = `Welcome ${usernames} to the group!`;
    await sendMessage(chatId, message);
}

// Function to handle commands
async function handleCommand(command, chatId) {
    const response = COMMANDS[command.trim()];
    if (response) {
        await sendMessage(chatId, response);
    } else {
        await sendMessage(chatId, "Unknown command. Please use /help to see the available commands.");
    }
}

// Function to process incoming messages
async function handleMessage(message) {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text;

    if (text.startsWith('/')) {
        await handleCommand(text, chatId);
    } else if (REFERRAL_KEYWORDS.some((keyword) => text.toLowerCase().includes(keyword))) {
        await banUser(chatId, userId);
    }
}

// Function to handle webhook requests
async function handleRequest(request) {
    try {
        const update = await request.json();

        if (update.message) {
            const { new_chat_members, text } = update.message;

            if (new_chat_members) {
                await handleNewMembers(update.message.chat.id, new_chat_members);
            } else if (text) {
                await handleMessage(update.message);
            }
        }

        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return new Response('Invalid request', { status: 400 });
    }
}

// Main entry point for the Cloudflare Worker
addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});
