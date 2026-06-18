const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const TOKEN = 'MTUxNzA2NzcyODMyODg1NTU2Mg.GCqfRr.Hfu78N7H2NAnyAhDNt-hsFXJO3LCEYXD-GhDxE';

// خريطة لتتبع الرسائل لمنع السبام
const spamMap = new Map();

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // 1. حماية الروابط
    const linkPattern = /(https?:\/\/[^\s]+|discord\.gg\/[^\s]+)/gi;
    if (linkPattern.test(message.content)) {
        await message.delete();
        return message.channel.send(`🚫 **تم حذف الرابط:** لا يُسمح بإرسال روابط في هذا السيرفر يا ${message.author}`);
    }

    // 2. حماية السبام (Anti-Spam)
    if (spamMap.has(message.author.id)) {
        const userData = spamMap.get(message.author.id);
        const { lastMessage, timer } = userData;
        const difference = message.createdTimestamp - lastMessage.createdTimestamp;

        if (difference < 2000) { // إذا أرسل رسالتين في أقل من ثانيتين
            message.delete();
            return message.channel.send(`⚠️ **تنبيه:** تم حذف رسالتك بسبب السبام يا ${message.author}`);
        }
    }
    
    spamMap.set(message.author.id, { lastMessage: message });
});

client.login("MTUxNzA2NzcyODMyODg1NTU2Mg.GCqfRr.Hfu78N7H2NAnyAhDNt-hsFXJO3LCEYXD-GhDxE");

// قائمة الرتب أو الأشخاص الذين لا يجب طردهم (حط آيدياتهم هنا)
const WHITELISTED_IDS = ['آيدي_حسابك_1', 'آيدي_حسابك_2']; 
const PROTECTED_ROLES = ['آيدي_رتبة_الأدمن', 'آيدي_رتبة_المشرف']; 

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    // التحقق إذا تغيرت الرتب
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    // إذا كانت الرتب لم تتغير، لا تفعل شيئاً
    if (oldRoles.size === newRoles.size) return;

    // الحصول على الشخص الذي قام بالتعديل (المدقق)
    const auditLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: 25 }); // 25 = MEMBER_ROLE_UPDATE
    const logEntry = auditLogs.entries.first();
    const executor = logEntry.executor;

    // إذا كان الشخص الذي عدل الرتب هو أنت (أو في الوايت ليست) فلا تفعل شيئاً
    if (WHITELISTED_IDS.includes(executor.id)) return;

    // إذا كان البوت هو من عدل الرتب، لا تطرده
    if (executor.id === client.user.id) return;

    // هنا منطق الطرد (إذا لم يكن في الوايت ليست)
    // يمكنك إضافة شروط هنا إذا كنت تريد منع أشخاص معينين فقط
});