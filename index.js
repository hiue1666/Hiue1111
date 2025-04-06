require("dotenv").config();

const fs = require("fs");
const GUILD_ID = process.env.GUILD_ID || 'Y1355211228858941591';
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});


const INVENTORY_FILE = 'inventory.json';
const ECONOMY_FILE = 'economy.json';
let economy = {};
let userInventory = {};
const cooldowns = new Map(); // Lưu thời gian cooldown của từng user
const cooldownTime = 5.5 * 1000; // 5 giây cooldown cho tất cả lệnh

const symbols = ['🍒', '🍋', '🍇', '🔔']; // Biểu tượng slot machine
const payouts = { '000': 17, '111': 17, '222': 17, '333': 17 }; // Mốc thưởng
const bauCuaOptions = ['🐓', '🐶', '🦀', '🦑', '🍐', '🍤']; // Biểu tượng bầu cua
const coinFaces = ['⚪', '⚫']; // Mặt đồng xu trong xóc đĩa

// Hàm tính level với số tiền tiêu không giới hạn
function calculateLevel(spent) {
    let level = 1;
    let threshold = 0;

    while (spent >= threshold) {
        level++;
        threshold += 5000000;  // Mỗi cấp cần thêm 5 triệu tiền tiêu
    }

    return level - 1;  // Trả về level thực tế
}


function updateLevel(userId) {
    economy[userId].level = calculateLevel(economy[userId].spent);
    saveEconomy();
}
function formatNumber(number) {
    return number.toLocaleString("en-US"); // Thêm dấu phẩy định dạng số
}



//shop
const shopItems = {
    "Lên mâm 2": { price: 50000000, roleId: "1355539270353420318" },
    "Lên mâm 1": { price: 3000000000, roleId: "1355789708168396909" },
    "Role đặc biệt": { price: 10000000000, roleId: "1355507398185324632" }
};

// Bảng emoji tương ứng với từng giá trị của xúc xắc
const diceEmojis = {
    1: "<:dice1:1355459925245169735>",
    2: "<:dice2:1355459987454951485>",
    3: "<:dice3:1355459978000863302>",
    4: "<:dice4:1355459980211519640>",
    5: "<:dice5:1355459982535168240>",
    6: "<:dice6:1355459985110470821>"
};
// Kiểm tra nếu đủ điều kiện lên level mới
// Hệ thống lootbox với tỷ lệ rớt đồ và giá trị
const lootboxItems2 = [
    { name: "bayonet", emoji: '<:bayonet:1356260051324506143>', chance: 0.0001, value: 19000000 }, 
    { name: "bowie", emoji: '<:bowie:1356260102251745422>', chance: 0.0001, value: 6700000 },
    { name: "canis", emoji: '<:canis:1356260057934725271>', chance: 0.0001, value: 6400000 },
    { name: "defaultkarambit", emoji: '<:defaultkarambit:1356260079237857342>', chance: 0.0001, value: 43000000 },
    { name: "falchion", emoji: '<:falchion:1356260068743577771> ', chance: 0.0001, value: 8200000 },
    { name: "flip", emoji: '<:flip:1356260071390187561>', chance: 0.0001, value: 8750000 },
    { name: "karambitshaphiredopper", emoji: '<:karambitshaphiredopper:1355809962751688716> ', chance: 0.00005, value: 250000000 },
    { name: "huntman", emoji: '<:huntman:1356260105691336756> ', chance: 0.0001, value: 8200000 }, 
    { name: "kukri", emoji: '<:kukri:1356260046576685148> ', chance: 0.0001, value: 8500000 }, 
    { name: "m9", emoji: '<:m9:1356260082635112609> ', chance: 0.0001, value: 35000000 },
    { name: "butterflyknifedopperemeral", emoji: '<:butterflyknifedopperemeral:1355942037094138007>', chance: 0.00005, value: 475000000 },
    { name: "nomad", emoji: '<:nomad:1356260085738897678> ', chance: 0.0001, value: 17000000 },
    { name: "paracord", emoji: '<:paracord:1356260062624223455>', chance: 0.0001, value: 6200000 },
    { name: "shadowdagger", emoji: '<:shadowdagger:1356260088054284491>  ', chance: 0.0001, value: 6000000 },
    { name: "skeletonk", emoji: '<:skeletonk:1356260090394706121> >', chance: 0.0001, value: 23000000 },
    { name: "survival", emoji: '<:survival:1356260065492861152> ', chance: 0.0001, value: 8000000 },
    { name: "talon", emoji: '<:talon:1356260112855073010> ', chance: 0.0001, value: 19000000 },
    { name: "tamxiarang", emoji: '<:tamxiarang:1356260099726774473> ', chance: 0.0001, value: 15000000 },
    { name: "ursus", emoji: '<:ursus:1356260108350521505> ', chance: 0.0001, value: 5800000 },
    { name: "weapon_knife_butterfly", emoji: '<:weapon_knife_butterfly:1356260053270790226>', chance: 0.00005, value: 58000000 },
    { name: "cut", emoji: '<:cut:1356260049189867550> ', chance: 0.998, value: 1 }
];

const lootboxItems1 = [
    { name: "gut", emoji: '<:gut:1356260074242445333>', chance: 0.0008, value: 15000000 }, 
    { name: "navaja", emoji: '<:navaja:1356260076670816377>', chance: 0.0008, value: 3200000 },
    { name: "paracord", emoji: '<:paracord:1356260062624223455>', chance: 0.0008, value: 6200000 },
    { name: "awpneonoir", emoji: '<:awpneonoir:1356615539417415881> ', chance: 0.04, value: 1000000 },
    { name: "m4temaku", emoji: '<:m4temaku:1356615543972429955> ', chance: 0.04, value: 700000 },
    { name: "uspticket", emoji: '<:uspticket:1356616504459792707> ', chance: 0.0588, value: 25000 },
    { name: "akneon", emoji: '<:akneon:1356616501150355526> ', chance: 0.0588, value: 700000 },
    { name: "crown30", emoji: '<:crown30:1355809955588083843>', chance: 0.05, value: 40000 }, 
    { name: "howl", emoji: '<:howl:1355809960092504265>', chance: 0.05, value: 40000 }, 
    { name: "navi", emoji: '<:navi:1355809952609861642>', chance: 0.1, value: 1000 },
    { name: "fnatic", emoji: '<:fnatic:1355942027874930978>', chance: 0.1, value: 1000 },
    { name: "liet", emoji: '<:liet:1355942943290032419>', chance: 0.1, value: 1000 },
    { name: "heroic", emoji: '<:heroic:1355942048187814148>', chance: 0.1, value: 1000 },
    { name: "ts", emoji: '<:ts:1355942031477837996>', chance: 0.1, value: 1000 },
    { name: "g2", emoji: '<:g2:1355942043448508588>', chance: 0.1, value: 1000 },
    { name: "vitality", emoji: '<:vitality:1355942024817414354>', chance: 0.1, value: 1000 }
];
const lootboxItems3 = [
    { name: "ursusfade", emoji: '<:ursusfade:1356896009581629440>', chance: 0.01, value: 4150000 }, 
    { name: "talonfade", emoji: '<:talonfade:1356896058289946697>', chance: 0.01, value: 33750000 },
    { name: "survivalfade", emoji: '<:survivalfade:1356896088283680798>', chance: 0.01, value: 9000000 },
    { name: "stilettofade", emoji: '<:stilettofade:1356896357436231761> ', chance: 0.01, value: 21500000 },
    { name: "skeletonfade", emoji: '<:skeletonfade:1356896370325328042>', chance: 0.01, value: 34000000 },
    { name: "shadowfade", emoji: '<:shadowfade:1356896384220921909>', chance: 0.01, value: 8750000 },
    { name: "paracordfade", emoji: '<:paracordfade:1356896432321335327>', chance: 0.01, value: 9500000 }, 
    { name: "nomadfade", emoji: '<:nomadfade:1356896449962446921>', chance: 0.01, value: 21250000 }, 
    { name: "navajafade", emoji: '<:navajafade:1356896462642086082>', chance: 0.01, value: 5250000 },
    { name: "m9fade", emoji: '<:m9fade:1356896491180003491>', chance: 0.01, value: 50000000 },
    { name: "kukrifade", emoji: '<:kukrifade:1356896506438746138>', chance: 0.01, value: 14500000 },
    { name: "karambitfade", emoji: '<:karambitfade:1356896513036517448>', chance: 0.01, value: 75000000 },
    { name: "huntsmanfade", emoji: '<:huntsmanfade:1356896520342863994>', chance: 0.01, value: 11250000 },
    { name: "gutfade", emoji: '<:gutfade:1356896528718893157>', chance: 0.01, value: 6250000 },
    { name: "flipfade", emoji: '<:flipfade:1356896550734794792>', chance: 0.01, value: 17250000 },
    { name: "falchionfade", emoji: '<:falchionfade:1356896558003519518>', chance: 0.01, value: 10150000 }, 
    { name: "classicfade", emoji: '<:classicfade:1356896566048329739>', chance: 0.01, value: 16250000 },
    { name: "butterflyfade", emoji: '<:butterflyfade:1356896573875028061>', chance: 0.01, value: 96125000 },
    { name: "bowiefade", emoji: '<:bowiefade:1356896584037695559>', chance: 0.01, value: 10000000 },
    { name: "bayonetfade", emoji: '<:bayonetfade:1356896591876980766>', chance: 0.01, value: 17250000 },
    { name: "awpfade", emoji: '<:awpfade:1356896598881341510>', chance: 0.05, value: 22625000 },
    { name: "m4fade", emoji: '<:m4fade:1356896498725683279>', chance: 0.05, value: 11325000 },
    { name: "glockfade", emoji: '<:glockfade:1356896538982481920>', chance: 0.05, value: 41250000 }, 
    { name: "r8fade", emoji: '<:r8fade:1356896422687019115>', chance: 0.2, value: 450000 }, 
    { name: "mac10fade", emoji: '<:mac10fade:1356896480715341906>', chance: 0.2, value: 1000000 },
    { name: "mp7fade", emoji: '<:mp7fade:1356896472389648555>', chance: 0.2, value: 150000 },
    { name: "umpfade", emoji: '<:umpfade:1356896047175307385>', chance: 0.05, value: 12650000 }
];
const lootboxItems4 = [
    { name: "bayonetemerald", emoji: '<:bayonetemerald:1356958060161011823>', chance: 0.001, value: 97375000 }, 
    { name: "bowieemerald", emoji: '<:bowieemerald:1356958021984718918>', chance: 0.001, value: 30000000 },
    { name: "falchionemerald", emoji: '<:falchionemerald:1356957948206776503>', chance: 0.001, value: 28175000 },
    { name: "flipemerald", emoji: '<:flipemerald:1356957893840339025>', chance: 0.001, value: 78325000 },
    { name: "glockemerald", emoji: '<:glockemerald:1356957833425584128>', chance: 0.001, value: 14850000 },
    { name: "gutemerald", emoji: '<:gutemerald:1356957758871834739>', chance: 0.001, value: 19375000 },
    { name: "huntemerald", emoji: '<:huntemerald:1356957672582418632>', chance: 0.001, value: 36400000 }, 
    { name: "karambitemerald", emoji: '<:karambitemerald:1356957606790562024>', chance: 0.001, value: 372950000 }, 
    { name: "m9emerald", emoji: '<:m9emerald:1356957530529464562>', chance: 0.001, value: 398050000 },
    { name: "shadowemerald", emoji: '<:shadowemerald:1356957481082814505>', chance: 0.001, value: 12250000 },
    { name: "bayonetgammap1", emoji: '<:bayonetgammap1:1356958052741414962>', chance: 0.015, value: 26000000 },
    { name: "bayonetgammap2", emoji: '<:bayonetgammap2:1356958046299099206>', chance: 0.015, value: 30600000 },
    { name: "bayonetgammap3", emoji: '<:bayonetgammap3:1356958034647191625>', chance: 0.015, value: 24200000 },
    { name: "bayonetgammap4", emoji: '<:bayonetgammap4:1356958027974184971>', chance: 0.015, value: 25875000 },
    { name: "bowiegammap1", emoji: '<:bowiegammap1:1356958014103617600>', chance: 0.015, value: 12215000 },
    { name: "bowiegammap2", emoji: '<:bowiegammap2:1356958005635321976>', chance: 0.015, value: 12225000 },
    { name: "bowiegammap3", emoji: '<:bowiegammap3:1356957997422870568>', chance: 0.015, value: 12230000 },
    { name: "bowiegammap4", emoji: '<:bowiegammap4:1356957988811837440>', chance: 0.015, value: 12220000 },
    { name: "butterflygammap1", emoji: '<:butterflygammap1:1356957976518459546>', chance: 0.015, value: 108175000 },
    { name: "butterflygammap2", emoji: '<:butterflygammap2:1356957969538879498>', chance: 0.015, value: 135250000 },
    { name: "butterflygammap3", emoji: '<:butterflygammap3:1356957962878451863>', chance: 0.015, value: 108100000 },
    { name: "butterflygammap4", emoji: '<:butterflygammap4:1356957955404206222>', chance: 0.015, value: 102375000 },
    { name: "falchiongammap1", emoji: '<:falchiongammap1:1356957941739159583>', chance: 0.015, value: 12500000 },
    { name: "falchiongammap2", emoji: '<:falchiongammap2:1356957935342714890>', chance: 0.015, value: 13000000 },
    { name: "falchiongammap3", emoji: '<:falchiongammap3:1356957921484738622>', chance: 0.015, value: 12200000 },
    { name: "falchiongammap4", emoji: '<:falchiongammap4:1356957903042642040>', chance: 0.015, value: 12550000 },
    { name: "flipgammap1", emoji: '<:flipgammap1:1356957886542254140>', chance: 0.015, value: 21325000 },
    { name: "flipgammap2", emoji: '<:flipgammap2:1356957878304505958>', chance: 0.015, value: 25700000 },
    { name: "flipgammap3", emoji: '<:flipgammap3:1356957862621876224>', chance: 0.015, value: 22500000 },
    { name: "flipgammap4", emoji: '<:flipgammap4:1356957852945612902>', chance: 0.015, value: 21250000 },
    { name: "gutgammap1", emoji: '<:gutgammap1:1356957747920371784>', chance: 0.015, value: 8225000 },
    { name: "gutgammap2", emoji: '<:gutgammap2:1356957716098187356>', chance: 0.015, value: 8150000 },
    { name: "gutgammap3", emoji: '<:gutgammap3:1356957704782086177>', chance: 0.015, value: 8050000 },
    { name: "gutgammap4", emoji: '<:gutgammap4:1356957688935743508>', chance: 0.015, value: 8000000 },
    { name: "huntgammap1", emoji: '<:huntgammap1:1356957658501873714>', chance: 0.015, value: 12800000 },
    { name: "huntgammap2", emoji: '<:huntgammap2:1356957649475731456>', chance: 0.015, value: 13775000 },
    { name: "huntgammap3", emoji: '<:huntgammap3:1356957641489907749>', chance: 0.015, value: 12950000 },
    { name: "huntgammap4", emoji: '<:huntgammap4:1356957629750182131>', chance: 0.015, value: 12000000 },
    { name: "karambitgammap1", emoji: '<:karambitgammap1:1356957581968412834>', chance: 0.015, value: 95325000 },
    { name: "karambitgammap2", emoji: '<:karambitgammap2:1356957569905590282>', chance: 0.015, value: 119650000 },
    { name: "karambitgammap3", emoji: '<:karambitgammap3:1356957556555120763>', chance: 0.015, value: 85450000 },
    { name: "karambitgammap4", emoji: '<:karambitgammap4:1356957546522476594>', chance: 0.015, value: 86850000 },
    { name: "m9gammap1", emoji: '<:m9gammap1:1356957519548776460>', chance: 0.015, value: 61175000 },
    { name: "m9gammap2", emoji: '<:m9gammap2:1356957508421423244>', chance: 0.015, value: 88225000 },
    { name: "m9gammap3", emoji: '<:m9gammap3:1356957500087468072>', chance: 0.015, value: 65000000 },
    { name: "m9gammap4", emoji: '<:m9gammap4:1356957490369007632>', chance: 0.015, value: 61500000 },
    { name: "shadowgammap1", emoji: '<:shadowgammap1:1356957470953705512>', chance: 0.015, value: 5525000 },
    { name: "shadowgammap2", emoji: '<:shadowgammap2:1356957461369716899>', chance: 0.015, value: 5525000 },
    { name: "shadowgammap3", emoji: '<:shadowgammap3:1356957452079206451>', chance: 0.015, value: 5625000 },
    { name: "shadowgammap4", emoji: '<:shadowgammap4:1356957441018953798>', chance: 0.015, value: 5725000 },
    { name: "glockgammap1", emoji: '<:glockgammap1:1356957820314189824>', chance: 0.09, value: 2275000 },
    { name: "glockgammap2", emoji: '<:glockgammap2:1356957807521566840>', chance: 0.1, value: 2600000 },
    { name: "glockgammap3", emoji: '<:glockgammap3:1356957793793609789>', chance: 0.1, value: 2150000 },
    { name: "glockgammap4", emoji: '<:glockgammap4:1356957772666769419>', chance: 0.1, value: 2125000 }
];
const lootboxItems5 = [
    { name: "mp7skulls", emoji: '<:mp7skulls:1357980291712421908>', chance: 0.20, value: 525000 },
    { name: "augwings", emoji: '<:augwings:1357980348973191299>', chance: 0.20, value: 575000 },
    { name: "sg553ultraviolet", emoji: '<:sg553ultraviolet:1357980304043802644>', chance: 0.20, value: 950000 },
  
    { name: "uspdarkwater", emoji: '<:uspdarkwater:1357980882023223449>', chance: 0.05, value: 2121000 },
    { name: "m4a1darkwater", emoji: '<:m4a1darkwater:1357980320196067469>', chance: 0.05, value: 2075000 },
    { name: "glockdragontattoo", emoji: '<:glockdragontattoo:1357980372050116670>', chance: 0.05, value: 2375000 },
    { name: "dehypnotic", emoji: '<:dehypnotic:1357980364739707011>', chance: 0.05, value: 2350000 },
  
    { name: "akcase", emoji: '<:akcase:1357980334427340861>', chance: 0.01, value: 8550000 },
    { name: "awplightningstrike", emoji: '<:awplightningstrike:1357980356053303340>', chance: 0.01, value: 13925000 },
    { name: "bayonetcase", emoji: '<:bayonetcase:1357988476829827143>', chance: 0.01, value: 13225000 },
    { name: "bayonetslaughter", emoji: '<:bayonetslaughter:1357988503010672660>', chance: 0.01, value: 15325000 },
    { name: "m9case", emoji: '<:m9case:1357988686456819814>', chance: 0.01, value: 30425000 },
    { name: "m9safarimesh", emoji: '<:m9safarimesh:1357988704408567939>', chance: 0.01, value: 27450000 },
    { name: "gutcase", emoji: '<:gutcase:1357988541384097972>', chance: 0.01, value: 9050000 },
    { name: "gutslaughter", emoji: '<:gutslaughter:1357988573915123853>', chance: 0.01, value: 5950000 },
    { name: "karambitborealforest", emoji: '<:karambitborealforest:1357988628047073351>', chance: 0.01, value: 28255000 },
    { name: "gutcrimsonweb", emoji: '<:gutcrimsonweb:1357988547407122562>', chance: 0.01, value: 34250000 },
  
    { name: "bayonetnight", emoji: '<:bayonetnight:1357988490738012302>', chance: 0.005, value: 22350000 },
    { name: "m9slaughter", emoji: '<:m9slaughter:1357988712444592160>', chance: 0.005, value: 39800000 },
    { name: "gutschorched", emoji: '<:gutschorched:1357988560053211146>', chance: 0.005, value: 6520000 },
    { name: "karambitcase", emoji: '<:karambitcase:1357988642601308251>', chance: 0.005, value: 54900000 },
    { name: "karambitslaughter", emoji: '<:karambitslaughter:1357988663572697329>', chance: 0.005, value: 47775000 },
    { name: "bayonetcrimsonweb", emoji: '<:bayonetcrimsonweb:1357988485239410708>', chance: 0.005, value: 83825000 },
    { name: "karambitcrimsonweb", emoji: '<:karambitcrimsonweb:1357991749212966994>', chance: 0.005, value: 150000000 },
    { name: "bayonetbluegem", emoji: '<:bayonetbluegem:1357988772016291970>', chance: 0.005, value: 78625000 },
    { name: "gutbluegem", emoji: '<:gutbluegem:1357988779918626979>', chance: 0.005, value: 33125000 },
  
    { name: "akbluegems", emoji: '<:akbluegems:1357980342299922493>', chance: 0.01667, value: 25000000000 },
    { name: "karambitbluegem", emoji: '<:karambitbluegem:1357988790458650665>', chance: 0.01667, value: 37500000000 },
    { name: "m9casebluegem", emoji: '<:m9casebluegem:1357988798910304447>', chance: 0.01667, value: 1750000000 }
  ];
  
  
const inventoryItems = new Set(Object.values(userInventory).flatMap(user => Object.keys(user.items)));
const itemChoices = [
    ...lootboxItems1.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name })),
    ...lootboxItems2.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name })),
    ...lootboxItems3.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name })),
    ...lootboxItems4.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name })),
    ...lootboxItems5.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name }))
];




function getRandomLoot1() {
    let totalChance = lootboxItems1.reduce((sum, item) => sum + item.chance, 0);
    let rand = Math.random() * totalChance;
    let cumulative = 0;

    for (let item of lootboxItems1) {
        cumulative += item.chance;
        if (rand <= cumulative) {
            return item;
        }
    }
}
function getRandomLoot5() {
    let totalChance = lootboxItems5.reduce((sum, item) => sum + item.chance, 0);
    let rand = Math.random() * totalChance;
    let cumulative = 0;

    for (let item of lootboxItems5) {
        cumulative += item.chance;
        if (rand <= cumulative) {
            return item;
        }
    }
}
function getRandomLoot4() {
    let totalChance = lootboxItems4.reduce((sum, item) => sum + item.chance, 0);
    let rand = Math.random() * totalChance;
    let cumulative = 0;

    for (let item of lootboxItems4) {
        cumulative += item.chance;
        if (rand <= cumulative) {
            return item;
        }
    }
}
function getRandomLoot3() {
    let totalChance = lootboxItems3.reduce((sum, item) => sum + item.chance, 0);
    let rand = Math.random() * totalChance;
    let cumulative = 0;

    for (let item of lootboxItems3) {
        cumulative += item.chance;
        if (rand <= cumulative) {
            return item;
        }
    }
}

function getRandomLoot2() {
    let totalChance = lootboxItems2.reduce((sum, item) => sum + item.chance, 0);
    let rand = Math.random() * totalChance;
    let cumulative = 0;

    for (let item of lootboxItems2) {
        cumulative += item.chance;
        if (rand <= cumulative) {
            return item;
        }
    }
}

// Hàm chung để đọc dữ liệu từ JSON
const loadData = (file, defaultData) => {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file));
        }
    } catch (error) {
        console.error(`Lỗi khi đọc ${file}:`, error);
    }
    return defaultData;
};

// Hàm chung để lưu dữ liệu vào JSON
const saveData = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Lỗi khi ghi ${file}:`, error);
    }
};

// Load dữ liệu ban đầu
economy = loadData(ECONOMY_FILE, {});
userInventory = loadData(INVENTORY_FILE, {});


// Hàm lưu dữ liệu
const saveEconomy = () => saveData(ECONOMY_FILE, economy);
const saveInventory = () => saveData(INVENTORY_FILE, userInventory);

// Đảm bảo mọi người chơi có level mặc định
for (const userId in economy) {
    if (economy[userId].level == null) {
        economy[userId].level = 0;
    }
    if (economy[userId].spent == null,NaN) {
        economy[userId].spent = 0;
    }
}

// Lưu lại nếu có cập nhật dữ liệu
saveEconomy();

saveEconomy(); // Lưu lại dữ liệu đã cập nhật

// Hệ thống giới hạn cướp
let crimeCooldown = {};
const loadCrimeCooldown = () => {
    if (fs.existsSync("crimeCooldown.json")) {
        crimeCooldown = JSON.parse(fs.readFileSync("crimeCooldown.json"));
    }
};
const saveCrimeCooldown = () => {
    fs.writeFileSync("crimeCooldown.json", JSON.stringify(crimeCooldown, null, 2));
};
loadCrimeCooldown();

// Xử lý lệnh
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const user = interaction.user;
    const { commandName, options } = interaction;
    const userId = interaction.user.id;

    if (!userInventory[user.id]) {
        userInventory[user.id] = { lootbox: 0, items: {} };
    }
    if (!economy[userId]) {
        economy[userId] = { balance: 10000 };
    }
    if (!crimeCooldown[userId]) {
        crimeCooldown[userId] = { stolenToday: 0, lastCrime: 0 };
    }
    if (cooldowns.has(userId)) {
        const lastUsed = cooldowns.get(userId);
        const timeSince = Date.now() - lastUsed;
        if (timeSince < cooldownTime) {
            const timeLeft = ((cooldownTime - timeSince) / 1000).toFixed(1);
            return interaction.reply({ content: `❌ Vui lòng chờ **${timeLeft} giây** trước khi dùng lệnh tiếp theo!`, ephemeral: true });
        }
    }

    // Cập nhật thời gian cooldown cho người chơi
    cooldowns.set(userId, Date.now());

    if (interaction.commandName === "taixiu") {
        const betAmount = interaction.options.getInteger("bet");
        const userChoice = interaction.options.getString("choice");
        const userId = interaction.user.id;
    
        if (!userChoice || (userChoice !== "tai" && userChoice !== "xiu")) {
            return interaction.reply("Bạn phải chọn 'Tài' hoặc 'Xỉu' để chơi.");
        }
    
        if (betAmount < 100) {
            return interaction.reply("Mức cược tối thiểu là 100 coin.");
        }
    
        if (!economy[userId]) {
            economy[userId] = { balance: 10000, spent: 0, level: 1 };
        }
    
        if (economy[userId].balance < betAmount) {
            return interaction.reply("Nghèo đ đủ tiền.");
        }
    
        let rollMessage = await interaction.reply({ content: "🎲 Đang lắc xí ngầu...", fetchReply: true });
    
        const dice1 = Math.floor(Math.random() * 6) + 1;
        setTimeout(async () => {
            await rollMessage.edit(`🎲 Xúc xắc 1: ${diceEmojis[dice1]}`);
        }, 1000);
    
        const dice2 = Math.floor(Math.random() * 6) + 1;
        setTimeout(async () => {
            await rollMessage.edit(`🎲 Xúc xắc 1: ${diceEmojis[dice1]}\n🎲 Xúc xắc 2: ${diceEmojis[dice2]}`);
        }, 2000);
    
        const dice3 = Math.floor(Math.random() * 6) + 1;
        setTimeout(async () => {
            const total = dice1 + dice2 + dice3;
            const result = total <= 10 ? "xiu" : "tai";
            let outcomeMessage = "";
            let oldLevel = economy[userId].level;
    
            // ✅ Tích hợp betAmount vào tổng số tiền đã tiêu
            economy[userId].spent += betAmount;
    
            if (userChoice === result) {
                economy[userId].balance += betAmount;
                outcomeMessage = `🎉 Húp! Nhận được **${betAmount}** coin.`;
            } else {
                economy[userId].balance -= betAmount;
                outcomeMessage = `💸 Cook! Mất **${betAmount}** coin.`;
            }
    
            // ✅ Cập nhật level sau khi cược
            economy[userId].level = calculateLevel(economy[userId].spent);
            saveEconomy();
    
            let finalMessage = 
                `🎲 **Kết quả:**\n✅ Xúc xắc 1: ${diceEmojis[dice1]}\n✅ Xúc xắc 2: ${diceEmojis[dice2]}\n✅ Xúc xắc 3: ${diceEmojis[dice3]}\n\n` +
                `🔢 Tổng: **${total}** → **${result.toUpperCase()}**\n${outcomeMessage} Số dư hiện tại: **${economy[userId].balance}** coin.`;
    
            if (economy[userId].level > oldLevel) {
                finalMessage += `\n🎉 Chúc mừng! Bạn đã lên **Level ${economy[userId].level}**! 🚀`;
            }
    
            await rollMessage.edit(finalMessage);
        }, 3000);
    }
    if (interaction.isAutocomplete()) {
        await commandHandler.autocomplete(interaction);
    }

    
    

    if (interaction.commandName === "thamngan") {
        const currentDate = new Date().toDateString();
        if (economy[userId].lastThamngan !== currentDate) {
            economy[userId].lastThamngan = currentDate;
            economy[userId].thamnganCount = 0;
        }
        
        if (economy[userId].thamnganCount >= 2) {
            return interaction.reply("❌ Bạn đã thăm ngàn 100 lần hôm nay rồi! Hãy quay lại vào ngày mai.");
        }
        
        const reward = Math.floor(Math.random() * 999900) + 100000;
        economy[userId].balance += reward;
        economy[userId].thamnganCount += 1;
        saveEconomy();
        interaction.reply(`🌲 Bạn đã thăm ngàn và nhận được **${reward}** coin! (Lượt còn lại hôm nay: ${2 - economy[userId].thamnganCount})`);
    }

    if (interaction.commandName === "give") {
        const targetUser = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("amount");
        const itemName = interaction.options.getString("item");
        const itemQuantity = interaction.options.getInteger("quantity") || 1; // Số lượng vật phẩm muốn chuyển
    
        if (!targetUser || targetUser.id === interaction.user.id) {
            return interaction.reply("❌ Bạn không thể tự chuyển cho chính mình.");
        }
    
        if (amount && itemName) {
            return interaction.reply("❌ Bạn chỉ có thể chuyển tiền hoặc vật phẩm, không thể chuyển cả hai cùng lúc.");
        }
    
        if (!economy[interaction.user.id]) economy[interaction.user.id] = { balance: 0 };
        if (!economy[targetUser.id]) economy[targetUser.id] = { balance: 0 };
        if (!userInventory[interaction.user.id]) userInventory[interaction.user.id] = {};
        if (!userInventory[targetUser.id]) userInventory[targetUser.id] = {};
    
        // Trường hợp chuyển tiền
        if (amount) {
            if (economy[interaction.user.id].balance < amount) {
                return interaction.reply("❌ Bạn không có đủ tiền để chuyển.");
            }
    
            economy[interaction.user.id].balance -= amount;
            economy[targetUser.id].balance += amount;
            saveEconomy();
    
            return interaction.reply(`💰 **${interaction.user.username}** đã tặng **${amount}** coin cho **${targetUser.username}**.`);
        }
    
        // Trường hợp chuyển vật phẩm
        if (itemName) {
            if (!userInventory[interaction.user.id][itemName] || userInventory[interaction.user.id][itemName] < itemQuantity) {
                return interaction.reply(`❌ Bạn không có đủ **${itemName}** để chuyển.`);
            }
    
            // Giảm vật phẩm từ người gửi
            userInventory[interaction.user.id][itemName] -= itemQuantity;
            if (userInventory[interaction.user.id][itemName] <= 0) {
                delete userInventory[interaction.user.id][itemName]; // Xóa nếu hết
            }
    
            // Thêm vật phẩm cho người nhận
            if (!userInventory[targetUser.id][itemName]) {
                userInventory[targetUser.id][itemName] = 0;
            }
            userInventory[targetUser.id][itemName] += itemQuantity;
    
            saveInventory();
    
            return interaction.reply(`🎁 **${interaction.user.username}** đã tặng **${itemQuantity}x ${itemName}** cho **${targetUser.username}**.`);
        }
    
        return interaction.reply("❌ Bạn cần nhập số tiền hoặc vật phẩm để chuyển.");
    }
    

    if (interaction.commandName === "balance") {
        const userId = interaction.user.id;
        const balance = economy[userId]?.balance || 0;
        
        await interaction.reply(`💰 Số dư của bạn là **${formatNumber(balance)}** coin.`);
    }
    if (interaction.commandName === 'slot') {
        const betAmount = interaction.options.getInteger('bet');
        if (betAmount <= 0 || isNaN(betAmount)) {
            return interaction.reply('❌ Hãy đặt cược một số hợp lệ!');
        }
        
        const userId = interaction.user.id;
    
        if (!economy[userId]) {
            economy[userId] = { balance: 10000, spent: 0, level: 1 };
        }
    
        if (betAmount > economy[userId].balance) {
            return interaction.reply('❌ Thăm ngàn đi các con, nghèo quá!');
        }
        
        await interaction.reply('🎰 Đang quay...');
    
        let slotResult = [];
        for (let i = 0; i < 3; i++) {
            slotResult.push(Math.floor(Math.random() * symbols.length));
        }
    
        let resultString = slotResult.map(i => symbols[i]).join(' ');
        let payoutMultiplier = payouts[slotResult.join('')] || 0;
        let winnings = betAmount * payoutMultiplier;
    
        // Tính số tiền đã tiêu (spent) và cập nhật cấp độ
        economy[userId].balance -= betAmount;  // Trừ tiền cược ngay từ đầu
        economy[userId].spent += betAmount;    // Cộng tiền vào spent
        updateLevel(userId);                   // Kiểm tra lên cấp độ mới
        if (winnings > 0) {
            economy[userId].balance += winnings; // Cộng tiền nếu thắng
        }
    
        saveEconomy();
    
        let rewardText = winnings > 0 ? `🎉 Bạn nhận được **${winnings}** coins!` : '😢 Không trúng, thử lại nhé!';
        
        // Hiệu ứng từng bước hiển thị slot chính xác
        let animationFrames = [
            '⬜ ⬜ ⬜',
            `${symbols[slotResult[0]]} ⬜ ⬜`,
            `${symbols[slotResult[0]]} ${symbols[slotResult[1]]} ⬜`,
            resultString
        ];
        
        for (let frame of animationFrames) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await interaction.editReply(`🎰 ${frame}`);
        }
    
        if (winnings >= betAmount * 10) {
            rewardText += '\n🔥 CHÚC MỪNG! Bạn đã trúng thưởng lớn! 🔥';
        }
    
        await interaction.editReply(`🎰 | ${resultString} | 🎰\n${rewardText}\n💰 Số dư hiện tại: **${economy[userId].balance}** coins\n🏆 **Level hiện tại:** ${economy[userId].level}`);
    }
    
    if (interaction.commandName === 'baucua') {
        const userId = interaction.user.id;
        const betAmount = interaction.options.getInteger('bet');
    
        const bauCuaOptions = ["🐓", "🐶", "🦀", "🦑", "🍐", "🍤"];
    
        if (!economy[userId]) {
            economy[userId] = { balance: 100000, spent: 0, level: 1 };
        }
    
        if (!betAmount || betAmount <= 0 || isNaN(betAmount)) {
            return interaction.reply({ content: "❌ Hãy đặt cược một số hợp lệ!", ephemeral: true });
        }
    
        if (betAmount > economy[userId].balance) {
            return interaction.reply({ content: "❌ Thăm ngàn đi các con, nghèo quá!", ephemeral: true });
        }
    
        const userChoice = interaction.options.getString('choice');
        if (!bauCuaOptions.includes(userChoice)) {
            return interaction.reply({ content: "❌ Vui lòng chọn một biểu tượng hợp lệ: 🐓 🐶 🦀 🦑 🍐 🍤", ephemeral: true });
        }
    
        // Kết quả random
        const result = [
            bauCuaOptions[Math.floor(Math.random() * bauCuaOptions.length)],
            bauCuaOptions[Math.floor(Math.random() * bauCuaOptions.length)],
            bauCuaOptions[Math.floor(Math.random() * bauCuaOptions.length)]
        ];
    
        let winnings = 0;
        let winCount = result.filter(symbol => symbol === userChoice).length;
    
        if (winCount === 1) {
            winnings = betAmount * 2;
        } else if (winCount === 2) {
            winnings = betAmount * 5;
        } else if (winCount === 3) {
            winnings = betAmount * 50;
        } else {
            economy[userId].balance -= betAmount;
        }
    
        if (winCount > 0) {
            economy[userId].balance += winnings;
        }
    
        saveEconomy();
    
        // **Sửa lỗi InteractionAlreadyReplied bằng deferReply**
        await interaction.deferReply();
    
        // Hiệu ứng quay từng bước
        for (let i = 0; i < result.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await interaction.editReply(`🎲 **Bầu cua tôm cá** 🎲\nKết quả: ${result.slice(0, i + 1).join(' ')}`);
        }
    
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        await interaction.editReply(`🎲 **Bầu cua tôm cá** 🎲\nKết quả: ${result.join(' ')}\nBạn đã chọn: ${userChoice}\n${winCount > 0 ? `🎉 Bạn thắng ${winnings.toLocaleString()} coins!` : `😢 Mất mẹ nó ${betAmount.toLocaleString()} coins rồi con.`}\n💰 Số dư hiện tại: ${economy[userId].balance.toLocaleString()} coins`);
    }
    
    if (interaction.commandName === 'xocdia') {
        const betAmount = interaction.options.getInteger('bet');
        const choice = interaction.options.getString('choice');
        if (betAmount <= 0 || isNaN(betAmount)) {
            return interaction.reply('❌ Hãy đặt cược một số hợp lệ!');
        }
        if (betAmount > economy[userId].balance) {
            return interaction.reply('❌ Thăm ngàn đi các con, nghèo quá!');
        }

        const result = [];
        await interaction.reply('🎲 **Xóc Đĩa** 🎲\nKết quả: ');
        for (let i = 0; i < 4; i++) {
            result.push(coinFaces[Math.floor(Math.random() * coinFaces.length)]);
            await interaction.editReply(`🎲 **Xóc Đĩa** 🎲\nKết quả: ${result.join(' ')}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const whiteCount = result.filter(face => face === '⚪').length;
        let winnings = 0;
        let winCondition = false;

        if ((choice === 'chẵn' && (whiteCount === 0 || whiteCount === 2 || whiteCount === 4)) || 
            (choice === 'lẻ' && (whiteCount === 1 || whiteCount === 3))) {
            winnings = betAmount * 2;
            winCondition = true;
        } else if (choice === `${whiteCount} trắng` || choice === `${4 - whiteCount} đen`) {
            if (whiteCount === 1 || whiteCount === 3) winnings = betAmount * 3;
            if (whiteCount === 2) winnings = betAmount * 5;
            if (whiteCount === 4 || whiteCount === 0) winnings = betAmount * 10;
            winCondition = true;
        }

        if (winCondition) {
            economy[userId].balance += winnings;
            await interaction.followUp(`🎉 Bạn thắng ${winnings} coins! 💰 Số dư hiện tại: ${economy[userId].balance} coins`);
        } else {
            economy[userId].balance -= betAmount;
            await interaction.followUp(`😢 Bạn thua! Bạn đã mất ${betAmount} coins. 💰 Số dư hiện tại: ${economy[userId].balance} coins`);
        }
        saveEconomy();
    }
    
    if (interaction.commandName === 'crime') {
        const guild = interaction.guild;
        const members = await guild.members.fetch();
        const possibleTargets = members.filter(member => member.id !== userId && !member.user.bot).map(member => member.user);
        
        if (possibleTargets.length === 0) {
            return interaction.reply('❌ Không có ai trong server để cướp!');
        }
        
        const targetUser = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        
        if (!economy[targetUser.id]) {
            economy[targetUser.id] = { balance: 10000 };
        }
        
        if (economy[targetUser.id].balance <= 0) {
            return interaction.reply(`❌ ${targetUser.username} không có tiền để cướp!`);
        }
        
        const today = new Date().toDateString();
        if (crimeCooldown[userId].lastCrime !== today) {
            crimeCooldown[userId].stolenToday = 0;
            crimeCooldown[userId].lastCrime = today;
        }
        
        if (crimeCooldown[userId].stolenToday >= 100000) {
            return interaction.reply(`❌ Bạn đã đạt giới hạn 100,000 coins bị cướp trong hôm nay! Hãy thử lại vào ngày mai.`);
        }
        
        let maxSteal = Math.min(50000, economy[targetUser.id].balance, 100000 - crimeCooldown[userId].stolenToday);
        const stealAmount = Math.floor(Math.random() * (maxSteal + 1));
        
        if (stealAmount <= 0) {
            return interaction.reply(`😢 Bạn đã cố cướp từ ${targetUser.username} nhưng thất bại và không lấy được gì!`);
        }
        
        economy[userId].balance += stealAmount;
        economy[targetUser.id].balance -= stealAmount;
        crimeCooldown[userId].stolenToday += stealAmount;
        saveEconomy();
        saveCrimeCooldown();
        
        return interaction.reply(`💰 Bạn đã cướp thành công **${stealAmount} coins** từ **${targetUser.username}**! Số tiền có thể cướp còn lại trong hôm nay: **${200000 - crimeCooldown[userId].stolenToday} coins**.`);
    }
    if (interaction.commandName === 'top') {
        let sortedEconomy = Object.entries(economy).sort((a, b) => b[1].balance - a[1].balance);
        let top10 = sortedEconomy.slice(0, 10);
        let topList = top10.map(([id, data], index) => `**${index + 1}. <@${id}>** - ${data.balance} coins`).join('\n');
        return interaction.reply(`🏆 **10 Thằng giàu nhát server:**\n${topList}`);
    }
    if (interaction.commandName === 'shop') {
        let shopList = Object.entries(shopItems).map(([item, data]) => `**${item}** - ${data.price} coins`).join('\n');
        return interaction.reply(`🛒 **Cửa hàng**:\n${shopList}\n\nDùng "/buy [tên vật phẩm]" để mua!`);
    }
    if (interaction.commandName === 'buy') {
        const itemName = interaction.options.getString('item');
        if (!shopItems[itemName]) {
            return interaction.reply({ content: '❌ Vật phẩm không tồn tại!', ephemeral: true });
        }
        
        const itemData = shopItems[itemName];
        if (economy[userId].balance < itemData.price) {
            return interaction.reply({ content: '❌ Bạn không đủ tiền để mua vật phẩm này!', ephemeral: true });
        }
        
        economy[userId].balance -= itemData.price;
        saveEconomy();
        
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) return interaction.reply({ content: '❌ Không tìm thấy server!', ephemeral: true });
        
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) return interaction.reply({ content: '❌ Không thể tìm thấy người dùng trong server!', ephemeral: true });
        
        const role = guild.roles.cache.get(itemData.roleId);
        if (!role) return interaction.reply({ content: `✅ Bạn đã mua thành công **${itemName}** với giá **${itemData.price} coins**, nhưng không tìm thấy role để cấp!`, ephemeral: true });
        
        await member.roles.add(role).catch(() => {
            return interaction.reply({ content: `✅ Bạn đã mua **${itemName}** với giá **${itemData.price} coins**, nhưng bot không thể cấp role, liên hệ <@689729040726097920> để được cấp role thủ công!`, ephemeral: true });
        });
        
        return interaction.reply({ content: `✅ Bạn đã mua thành công **${itemName}** với giá **${itemData.price} coins** và được cấp role!`, ephemeral: true });
    }
    const type = interaction.options.getString("type");

    if (interaction.commandName === "lootbox") {
        const amount = interaction.options.getInteger("amount") || 1;
        const type = interaction.options.getString("type");
    
        if (amount < 1 || amount > 30) {
            return interaction.reply({ content: "❌ Bạn chỉ có thể mở từ 1 đến 30 lootbox cùng lúc!", ephemeral: true });
        }
    
        if (!["lootbox", "lootbox2", "lootbox3", "lootbox4", "lootbox5"].includes(type)) {
            return interaction.reply({ content: "❌ Loại lootbox không hợp lệ!", ephemeral: true });
        }
    
        if (!userInventory[userId] || !userInventory[userId][type] || userInventory[userId][type] < amount) {
            return interaction.reply({ content: `❌ Bạn không có đủ ${type} để mở!`, ephemeral: true });
        }
    
        // Trừ lootbox đã sử dụng
        userInventory[userId][type] -= amount;
        if (userInventory[userId][type] === 0) delete userInventory[userId][type];
        saveInventory();
    
        let finalRewards = [];
        let lootboxItems = type === "lootbox" ? lootboxItems1 : type === "lootbox2" ? lootboxItems2 : type === "lootbox3" ? lootboxItems3 : type === "lootbox4" ? lootboxItems4 : lootboxItems5
    
        for (let i = 0; i < amount; i++) {
            const loot = type === "lootbox" ? getRandomLoot1() : type === "lootbox2" ? getRandomLoot2() : type === "lootbox3" ? getRandomLoot3() : type === "lootbox4" ? getRandomLoot4() : getRandomLoot5()
            finalRewards.push(loot);
    
            if (!userInventory[userId][loot.name]) userInventory[userId][loot.name] = 0;
            userInventory[userId][loot.name] += 1;
        }
        saveInventory();
    
        // Hiển thị kết quả ngay lập tức
        let finalMessage = finalRewards.map(item => `${item.emoji} **${item.name}**`).join(", ");
        interaction.reply(`🎉 Bạn đã mở **${amount} ${type}** và nhận được:\n${finalMessage}`);
    }
    
    


    if (interaction.commandName === "buylootbox") {
        const amount = interaction.options.getInteger("amount") || 1;
        const type = interaction.options.getString("type")?.toLowerCase();
        const userId = interaction.user.id;
    
        const lootboxPrices = {
            lootbox: 59000,
            lootbox2: 59000,
            lootbox3: 19900000,
            lootbox4: 79900000,
            lootbox5: 2750000
        };
    
        // Kiểm tra loại lootbox hợp lệ
        if (!lootboxPrices.hasOwnProperty(type)) {
            return interaction.reply({ content: "❌ Loại lootbox không hợp lệ! Hãy chọn `lootbox`, `lootbox2` hoặc `lootbox3` hoặc`lootbox4`.", ephemeral: true });
        }
    
        // Kiểm tra số lượng hợp lệ
        if (isNaN(amount) || amount < 1 || amount > 10000) {
            return interaction.reply({ content: "❌ Bạn chỉ có thể mua từ **1** đến **10,000** lootbox mỗi lần!", ephemeral: true });
        }
    
        const cost = lootboxPrices[type] * amount;
    
        // Kiểm tra nếu user chưa có trong economy
        if (!economy[userId]) {
            economy[userId] = { balance: 0, spent: 0, level: 1 };
        }
    
        if (economy[userId].balance < cost) {
            return interaction.reply({ content: "❌ Bạn không có đủ tiền để mua lootbox!", ephemeral: true });
        }
    
        // Trừ tiền
        economy[userId].balance -= cost;
    
        // Kiểm tra nếu userInventory chưa có userId -> Tạo mới
        if (!userInventory[userId]) userInventory[userId] = {};
        if (!userInventory[userId][type]) userInventory[userId][type] = 0;
    
        // Cộng lootbox vào inventory
        userInventory[userId][type] += amount;
    
        // Cập nhật số tiền đã tiêu
        economy[userId].spent = (economy[userId].spent || 0) + cost;
    
        // Cập nhật level nếu có hàm `updateLevel`
        if (typeof updateLevel === "function") {
            updateLevel(userId);
        } else {
            console.error("⚠ Lỗi: Hàm updateLevel không tồn tại!");
        }
    
        // Lưu dữ liệu vào file JSON
        saveInventory();
        saveEconomy();
    
        // Hiển thị tin nhắn xác nhận
        return interaction.reply(`🎁 Bạn đã mua **${amount} ${type}** thành công! 🛒 Dùng lệnh \`/lootbox\` để mở.`);
    }


    if (commandName === "sellall") {
    if (!userInventory[user.id] || Object.keys(userInventory[user.id]).length === 0) {
        return interaction.reply({ content: "Kho đồ của bạn trống!", ephemeral: true });
    }

    let totalEarned = 0;
    let soldItems = [];

    for (const itemName in userInventory[user.id]) {
        if (itemName.toLowerCase().includes("lootbox")) continue; // Bỏ qua lootbox

        const itemData = [...lootboxItems1, ...lootboxItems2, ...lootboxItems3, ...lootboxItems4].find(item => item.name === itemName);
        if (!itemData) continue; // Nếu vật phẩm không thể bán, bỏ qua

        const amount = userInventory[user.id][itemName];
        const totalValue = itemData.value * amount;
        totalEarned += totalValue;

        const emoji = itemData.emoji || "❓";
        soldItems.push(`${amount}x ${emoji} ${itemName}`);
        delete userInventory[user.id][itemName]; // Xóa vật phẩm khỏi kho
    }

    if (soldItems.length === 0) {
        return interaction.reply({ content: "Bạn không có vật phẩm nào có thể bán!", ephemeral: true });
    }

    // Cộng tiền vào economy
    if (!economy[user.id]) economy[user.id] = { balance: 0 };
    economy[user.id].balance += totalEarned;

    saveInventory();
    saveEconomy();

    // Phân trang
    const itemsPerPage = 25;
    let page = 0;
    const totalPages = Math.ceil(soldItems.length / itemsPerPage);

    const generateEmbed = (page) => {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = soldItems.slice(start, end).join("\n");

        return {
            content: `Bạn đã bán toàn bộ vật phẩm và nhận được **${totalEarned}** tiền!\n\n**Vật phẩm đã bán (Trang ${page + 1}/${totalPages}):**\n${pageItems}`,
            ephemeral: false
        };
    };

    interaction.reply(generateEmbed(page)).then(() => {
        return interaction.fetchReply();
    }).then((message) => {
        if (totalPages > 1) {
            message.react("◀️").catch(console.error);
            message.react("▶️").catch(console.error);

            const filter = (reaction, user) => ["◀️", "▶️"].includes(reaction.emoji.name) && user.id === interaction.user.id;
            const collector = message.createReactionCollector({ filter, time: 60000 });

            collector.on("collect", (reaction, user) => {
                reaction.users.remove(user).catch(console.error);
                if (reaction.emoji.name === "▶️" && page < totalPages - 1) page++;
                else if (reaction.emoji.name === "◀️" && page > 0) page--;
                message.edit(generateEmbed(page)).catch(console.error);
            });
        }
    }).catch(console.error);
    }

    
    
    
    
    
    if (commandName === "sell") {
        const itemName = options.getString("item");
        const amount = options.getInteger("amount");

        if (!userInventory[user.id] || !userInventory[user.id][itemName]) {
            return interaction.reply({ content: "Bạn không có vật phẩm này trong kho!", ephemeral: true });
        }

        if (userInventory[user.id][itemName] < amount) {
            return interaction.reply({ content: "Bạn không có đủ số lượng để bán!", ephemeral: true });
        }

        // Lấy giá trị của vật phẩm từ lootboxItems1&2
        const itemData = [...lootboxItems1, ...lootboxItems2, ...lootboxItems3, ...lootboxItems4, ...lootboxItems5].find(item => item.name === itemName);
        if (!itemData) {
            return interaction.reply({ content: "Vật phẩm này không thể bán!", ephemeral: true });
        }

        const totalValue = itemData.value * amount;

        // Trừ số lượng trong inventory
        userInventory[user.id][itemName] -= amount;
        if (userInventory[user.id][itemName] <= 0) {
            delete userInventory[user.id][itemName];
        }
        saveInventory();

        // Cộng tiền vào economy
        if (!economy[user.id]) economy[user.id] = { balance: 0 };
        economy[user.id].balance += totalValue;
        saveEconomy();

        return interaction.reply({ content: `Bạn đã bán ${amount}x ${itemData.emoji} ${itemName} và nhận được ${totalValue} tiền!`, ephemeral: false });
    }

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

if (commandName === "inventory") {
    if (!userInventory[user.id] || Object.keys(userInventory[user.id]).length === 0) {
        return interaction.reply("📦 **Kho đồ của bạn trống!**");
    }

    const inventoryItems = userInventory[user.id];
    const allItems = Object.keys(inventoryItems).map(item => {
        const lootItem = [...lootboxItems1, ...lootboxItems2, ...lootboxItems3, ...lootboxItems4, ...lootboxItems5].find(l => l.name === item);
        const emoji = lootItem ? lootItem.emoji : "📦";
        return `${emoji} **${item}** x${inventoryItems[item]}`;
    });

    const itemsPerPage = 25;
    let currentPage = 0;
    const totalPages = Math.ceil(allItems.length / itemsPerPage);

    const generatePage = (page) => {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = allItems.slice(start, end).join("\n");

        return `📦 **Kho đồ của bạn (Trang ${page + 1}/${totalPages})**\n${pageItems || "Không có vật phẩm nào!"}`;
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("prev_page").setLabel("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId("next_page").setLabel("➡️").setStyle(ButtonStyle.Secondary).setDisabled(currentPage === totalPages - 1)
    );

    interaction.reply({ content: generatePage(currentPage), components: totalPages > 1 ? [row] : [] }).then((msg) => {
        if (totalPages <= 1) return;

        const collector = msg.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", (interaction) => {
            if (interaction.user.id !== user.id) {
                return interaction.reply({ content: "❌ Bạn không thể điều khiển kho đồ của người khác!", ephemeral: true });
            }

            if (interaction.customId === "next_page" && currentPage < totalPages - 1) {
                currentPage++;
            } else if (interaction.customId === "prev_page" && currentPage > 0) {
                currentPage--;
            }

            row.components[0].setDisabled(currentPage === 0);
            row.components[1].setDisabled(currentPage === totalPages - 1);

            interaction.update({ content: generatePage(currentPage), components: [row] });
        });

        collector.on("end", () => msg.edit({ components: [] }).catch(console.error));
    });
}

    
    if (interaction.commandName === "level") {
        const userId = interaction.user.id;
    
        // Kiểm tra và khởi tạo dữ liệu nếu người chơi chưa có
        if (!economy[userId]) {
            economy[userId] = { balance: 10000, spent: 0, level: 1 };
            saveEconomy(); // Lưu lại dữ liệu để tránh lỗi sau này
        }
    
        const level = economy[userId].level;
        const spent = economy[userId].spent;
    
        interaction.reply(`📊 **Level của bạn:** ${level}\n💰 **Tiền đã tiêu:** ${spent} coin`);
    }
    
    if (interaction.commandName === "rank") {
        // Sắp xếp người chơi theo cấp độ (level) từ cao xuống thấp
        const sortedPlayers = Object.entries(economy)
            .filter(([id, data]) => data.level) // Chỉ lấy những người có cấp độ
            .sort((a, b) => b[1].level - a[1].level) // Sắp xếp theo level giảm dần
            .slice(0, 5); // Chỉ lấy top 5 người chơi
    
        if (sortedPlayers.length === 0) {
            return interaction.reply("🚫 Không có ai trong bảng xếp hạng.");
        }
    
        let leaderboard = "**🏆 Bảng Xếp Hạng Level - Top 5 🏆**\n";
        
        // Dùng Promise.all để lấy toàn bộ tên người chơi trước khi gửi tin nhắn
        const promises = sortedPlayers.map(async ([id, data], index) => {
            const user = await interaction.client.users.fetch(id).catch(() => null);
            const username = user ? user.username : "Người chơi ẩn danh";
            return `**#${index + 1}** | ${username} - **Level ${data.level}**`;
        });
    
        const results = await Promise.all(promises);
        leaderboard += results.join("\n");
    
        interaction.reply(leaderboard);
    }
    
    if (interaction.commandName === "battles") {
        const challengerId = interaction.user.id;
        const opponent = interaction.options.getUser("opponent");
        const type = interaction.options.getString("type");
        const amount = interaction.options.getInteger("amount");
    
        if (!opponent || opponent.bot) {
            return interaction.reply({ content: "❌ Bạn phải chọn một người chơi hợp lệ!", ephemeral: true });
        }
    
        if (challengerId === opponent.id) {
            return interaction.reply({ content: "❌ Bạn không thể thách đấu chính mình!", ephemeral: true });
        }
    
        if (!["lootbox", "lootbox2", "lootbox3", "lootbox4", "lootbox5"].includes(type)) {
            return interaction.reply({ content: "❌ Loại lootbox không hợp lệ!", ephemeral: true });
        }
    
        if (amount < 1 || amount > 10) {
            return interaction.reply({ content: "❌ Bạn chỉ có thể chọn từ 1 đến 10 lootbox để mở!", ephemeral: true });
        }
    
        if (!userInventory[challengerId]?.[type] || userInventory[challengerId][type] < amount) {
            return interaction.reply({ content: "❌ Bạn không có đủ lootbox để thách đấu!", ephemeral: true });
        }
    
        if (!userInventory[opponent.id]?.[type] || userInventory[opponent.id][type] < amount) {
            return interaction.reply({ content: `❌ ${opponent.username} không có đủ lootbox để tham gia!`, ephemeral: true });
        }
    
        const battleMessage = await interaction.reply({ 
            content: `⚔️ **${opponent.username}**, bạn đã được **${interaction.user.username}** thách đấu mở **${amount} ${type}**!
    Nhấn 🏆 trong vòng **30 giây** để chấp nhận!`,
            fetchReply: true
        });
    
        await battleMessage.react("🏆").catch(console.error);
    
        const filter = (reaction, user) => reaction.emoji.name === "🏆" && user.id === opponent.id;
        
        const collector = battleMessage.createReactionCollector({ filter, time: 30000 });
    
        collector.on("collect", async () => {
            await battleMessage.edit({ content: `✅ **${opponent.username}** đã chấp nhận thách đấu!\n\n⏳ Đang mở lootbox...` });
            collector.stop();
            startBattle();
        });
    
        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await battleMessage.edit({ content: `❌ **${opponent.username}** không chấp nhận thách đấu!` });
            }
        });
    
        async function startBattle() {
            userInventory[challengerId][type] -= amount;
            userInventory[opponent.id][type] -= amount;
            saveInventory();
    
            function getRandomLoot(type) {
                if (type === "lootbox") return lootboxItems1[Math.floor(Math.random() * lootboxItems1.length)];
                if (type === "lootbox2") return lootboxItems2[Math.floor(Math.random() * lootboxItems2.length)];
                if (type === "lootbox3") return lootboxItems3[Math.floor(Math.random() * lootboxItems3.length)];
                if (type === "lootbox4") return lootboxItems4[Math.floor(Math.random() * lootboxItems4.length)];
                return lootboxItems5[Math.floor(Math.random() * lootboxItems5.length)];
            }
    
            let challengerRewards = [];
            let opponentRewards = [];
            let challengerValue = 0;
            let opponentValue = 0;
    
            let battleLog = `⚔️ **Trận đấu Lootbox**\n\n`;
            battleLog += `🎖️ **${interaction.user.username}**:\n`;
            battleLog += `🎖️ **${opponent.username}**:\n`;
    
            await battleMessage.edit({ content: battleLog });
    
            for (let i = 0; i < amount; i++) {
                let challengerLoot = getRandomLoot(type);
                let opponentLoot = getRandomLoot(type);
    
                challengerRewards.push(challengerLoot);
                opponentRewards.push(opponentLoot);
    
                challengerValue += challengerLoot.value;
                opponentValue += opponentLoot.value;
    
                battleLog = `⚔️ **Trận đấu Lootbox**\n\n`;
                battleLog += `🎖️ **${interaction.user.username}**:\n${challengerRewards.map(item => `${item.emoji} **${item.name}** (+${item.value})`).join("\n") || "Chưa có vật phẩm nào"}\n\n`;
                battleLog += `🎖️ **${opponent.username}**:\n${opponentRewards.map(item => `${item.emoji} **${item.name}** (+${item.value})`).join("\n") || "Chưa có vật phẩm nào"}\n`;
    
                await battleMessage.edit({ content: battleLog });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Chờ 1 giây giữa mỗi lần mở
            }
    
            let winner;
            if (challengerValue > opponentValue) {
                winner = interaction.user;
            } else if (challengerValue < opponentValue) {
                winner = opponent;
            } else {
                winner = null;
            }
    
            battleLog += `\n🎖️ **Tổng giá trị**:\n`;
            battleLog += `- **${interaction.user.username}**: ${challengerValue}\n`;
            battleLog += `- **${opponent.username}**: ${opponentValue}\n\n`;
    
            if (winner) {
                battleLog += `🏆 **${winner.username}** chiến thắng và nhận toàn bộ vật phẩm!\n`;
    
                const allRewards = [...challengerRewards, ...opponentRewards];
                allRewards.forEach(loot => {
                    userInventory[winner.id][loot.name] = (userInventory[winner.id][loot.name] || 0) + 1;
                });
            } else {
                battleLog += `⚔️ Trận đấu hòa, vật phẩm được trả lại!\n`;
    
                challengerRewards.forEach(loot => {
                    userInventory[challengerId][loot.name] = (userInventory[challengerId][loot.name] || 0) + 1;
                });
    
                opponentRewards.forEach(loot => {
                    userInventory[opponent.id][loot.name] = (userInventory[opponent.id][loot.name] || 0) + 1;
                });
            }
    
            saveInventory();
            await battleMessage.edit({ content: battleLog });
        }
    }
    
    
    
    
    
    
    
    
    

    
});

client.once("ready", () => {
    console.log(`✅ Bot đã đăng nhập thành công với tên: ${client.user.tag}`);
    
});

client.login(process.env.TOKEN)