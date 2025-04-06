require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⏳ Đang xóa toàn bộ lệnh Slash...');
        
        // Xóa lệnh Global
        const globalCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
        for (const command of globalCommands) {
            await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, command.id));
            console.log(`🗑 Đã xóa Global Command: ${command.name}`);
        }

        // Xóa lệnh trong Guild (nếu có)
        const guildCommands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID));
        for (const command of guildCommands) {
            await rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id));
            console.log(`🗑 Đã xóa Guild Command: ${command.name}`);
        }

        console.log('✅ Hoàn tất xóa lệnh Slash cũ. Bây giờ có thể deploy lệnh mới!');
    } catch (error) {
        console.error('❌ Lỗi khi xóa lệnh:', error);
    }
})();
