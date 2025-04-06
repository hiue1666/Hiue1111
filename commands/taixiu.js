const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const dataFile = './data.json';
const minBet = 2000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('taixiu')
        .setDescription('Chơi trò tài xỉu với 3 xúc xắc!')
        .addIntegerOption(option => 
            option.setName('bet')
            .setDescription('Số tiền bạn muốn cược')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('choice')
            .setDescription('Chọn "tài" hoặc "xỉu"')
            .setRequired(true)
            .addChoices(
                { name: 'Tài', value: 'tai' },
                { name: 'Xỉu', value: 'xiu' }
            )
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const bet = interaction.options.getInteger('bet');
        const choice = interaction.options.getString('choice');

        // Đọc dữ liệu
        let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        if (!data[userId]) {
            data[userId] = { balance: 10000 }; // Mặc định có 10,000 khi chưa có tài khoản
        }

        if (bet < minBet) {
            return interaction.reply(`⚠️ Bạn phải cược ít nhất **${minBet}** tiền!`);
        }
        
        if (data[userId].balance < bet) {
            return interaction.reply('❌ Bạn không đủ tiền để cược!');
        }

        // Tung 3 xúc xắc
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const dice3 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2 + dice3;

        const result = total <= 10 ? 'xiu' : 'tai';
        const resultText = result === 'xiu' ? 'Xỉu 🎲' : 'Tài 🎲';

        let message = `🎲 Kết quả: **${dice1} + ${dice2} + ${dice3} = ${total}** → **${resultText}**\n`;

        // Kiểm tra thắng / thua
        if (choice === result) {
            const winnings = bet * 2;
            data[userId].balance += bet;
            message += `✅ Bạn đã thắng! Nhận được **${winnings}** tiền.\n💰 Số dư mới: **${data[userId].balance}**`;
        } else {
            data[userId].balance -= bet;
            message += `❌ Bạn đã thua! Mất **${bet}** tiền.\n💰 Số dư mới: **${data[userId].balance}**`;
        }

        // Lưu lại dữ liệu
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

        return interaction.reply(message);
    }
};
