require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");
//shop
const shopItems = [
    { name: 'Lên mâm 1', value: 'Lên mâm 1' },
    { name: 'Lên mâm 2', value: 'Lên mâm 2' },
    { name: 'Role đặc biệt', value: 'Role đặc biệt' }
];
const fs = require("fs");
const INVENTORY_FILE = 'inventory.json';
let userInventory = {};
try {
    userInventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
} catch (error) {
    console.error("Không thể đọc file inventory.json, đặt giá trị mặc định.", error);
    userInventory = {};
}
const lootboxItems1 = [
    { name: "karambit", emoji: '<:karambit:1355809962751688716>', chance: 0.001, value: 50000000 }, 
    { name: "karambitchampion", emoji: '<:karambitchampion:1355877381734400030>', chance: 0.002, value: 45000000 },
    { name: "buom", emoji: '<:buom:1355942037094138007>', chance: 0.001, value: 50000000 },
    { name: "m4howl", emoji: '<:m4howl:1355809957907398857>', chance: 0.0125, value: 2000000 },
    { name: "gungnir", emoji: '<:gungnir:1355942940416933918>', chance: 0.0075, value: 5000000 },
    { name: "wl", emoji: '<:wl:1355942947752902686>', chance: 0.0125, value: 2000000 },
    { name: "lore", emoji: '<:lore:1355942997858062528>', chance: 0.0075, value: 5000000 },
    { name: "crown30", emoji: '<:crown30:1355809955588083843>', chance: 0.15, value: 40000 }, 
    { name: "howl", emoji: '<:howl:1355809960092504265>', chance: 0.15, value: 40000 }, 
    { name: "navi", emoji: '<:navi:1355809952609861642>', chance: 0.09371428571, value: 10000 },
    { name: "fnatic", emoji: '<:fnatic:1355942027874930978>', chance: 0.09371428571, value: 10000 },
    { name: "liet", emoji: '<:liet:1355942943290032419>', chance: 0.09371428571, value: 10000 },
    { name: "heroic", emoji: '<:heroic:1355942048187814148>', chance: 0.09371428571, value: 10000 },
    { name: "ts", emoji: '<:ts:1355942031477837996>', chance: 0.09371428571, value: 10000 },
    { name: "g2", emoji: '<:g2:1355942043448508588>', chance: 0.09371428571, value: 10000 },
    { name: "vitality", emoji: '<:vitality:1355942024817414354>', chance: 0.09371428571, value: 10000 }
];
const lootboxItems2 = [
    { name: "bayonet", emoji: '<:bayonet:1356260051324506143>', chance: 0.00005, value: 50000000 }, 
    { name: "bowie", emoji: '<:bowie:1356260102251745422>', chance: 0.00005, value: 45000000 },
    { name: "canis", emoji: '<:canis:1356260057934725271>', chance: 0.00005, value: 35000000 },
    { name: "defaultkarambit", emoji: '<:defaultkarambit:1356260079237857342>', chance: 0.00005, value: 100000000 },
    { name: "falchion", emoji: '<:falchion:1356260068743577771> ', chance: 0.00005, value: 25000000 },
    { name: "flip", emoji: '<:flip:1356260071390187561>', chance: 0.00005, value: 20000000 },
    { name: "gut", emoji: '<:gut:1356260074242445333>', chance: 0.00005, value: 10000000 },
    { name: "huntman", emoji: '<:huntman:1356260105691336756> ', chance: 0.00005, value: 40000000 }, 
    { name: "kukri", emoji: '<:kukri:1356260046576685148> ', chance: 0.00005, value: 40000000 }, 
    { name: "m9", emoji: '<:m9:1356260082635112609> ', chance: 0.00005, value: 100000000 },
    { name: "navaja", emoji: '<:navaja:1356260076670816377>', chance: 0.00005, value: 10000000 },
    { name: "nomad", emoji: '<:nomad:1356260085738897678> ', chance: 0.00005, value: 40000000 },
    { name: "paracord", emoji: '<:paracord:1356260062624223455>', chance: 0.00005, value: 15000000 },
    { name: "shadowdagger", emoji: '<:shadowdagger:1356260088054284491>  ', chance: 0.00005, value: 10000000 },
    { name: "skeletonk", emoji: '<:skeletonk:1356260090394706121> >', chance: 0.00005, value: 45000000 },
    { name: "survival", emoji: '<:survival:1356260065492861152> ', chance: 0.00005, value: 10000000 },
    { name: "talon", emoji: '<:talon:1356260112855073010> ', chance: 0.00005, value: 30000000 },
    { name: "tamxiarang", emoji: '<:tamxiarang:1356260099726774473> ', chance: 0.00005, value: 20000000 },
    { name: "ursus", emoji: '<:ursus:1356260108350521505> ', chance: 0.00005, value: 10000000 },
    { name: "weapon_knife_butterfly", emoji: '<:weapon_knife_butterfly:1356260053270790226>  ', chance: 0.00005, value: 100000000 },
    { name: "cut", emoji: '<:cut:1356260049189867550> ', chance: 0.999, value: 10 }
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
    { name: "bayonetemerald", emoji: '<:bayonetemerald:1356958060161011823>', chance: 0.01, value: 97375000 }, 
    { name: "bowieemerald", emoji: '<:bowieemerald:1356958021984718918>', chance: 0.01, value: 30000000 },
    { name: "falchionemerald", emoji: '<:falchionemerald:1356957948206776503>', chance: 0.01, value: 28175000 },
    { name: "flipemerald", emoji: '<:flipemerald:1356957893840339025>', chance: 0.01, value: 78325000 },
    { name: "glockemerald", emoji: '<:glockemerald:1356957833425584128>', chance: 0.01, value: 14850000 },
    { name: "gutemerald", emoji: '<:gutemerald:1356957758871834739>', chance: 0.01, value: 19375000 },
    { name: "huntemerald", emoji: '<:huntemerald:1356957672582418632>', chance: 0.01, value: 36400000 }, 
    { name: "karambitemerald", emoji: '<:karambitemerald:1356957606790562024>', chance: 0.01, value: 372950000 }, 
    { name: "m9emerald", emoji: '<:m9emerald:1356957530529464562>', chance: 0.01, value: 398050000 },
    { name: "shadowemerald", emoji: '<:shadowemerald:1356957481082814505>', chance: 0.01, value: 12250000 },
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
    { name: "glockgammap1", emoji: '<:glockgammap1:1356957820314189824>', chance: 0.1, value: 2275000 },
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
  
  


const inventoryItems = new Set(
    Object.values(userInventory).flatMap(user => user.items ? Object.keys(user.items) : [])
);

const itemChoices = [
    ...lootboxItems1.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name })),
    ...lootboxItems2.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name })),
    ...lootboxItems3.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name })),
    ...lootboxItems4.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name })),
    ...lootboxItems5.map(item => ({ name: `${item.emoji} ${item.name}`, value: item.name }))

];
const commands = [
    new SlashCommandBuilder()
        .setName("taixiu")
        .setDescription("Chơi tài xỉu")
        .addIntegerOption(option => 
            option.setName("bet")
                .setDescription("Số tiền cược")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("choice")
                .setDescription("Chọn tài hoặc xỉu")
                .setRequired(true)
                .addChoices(
                    { name: "Tài", value: "tai" },
                    { name: "Xỉu", value: "xiu" }
                )),
    
    new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Xem số dư của bạn"),
    new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Cướp tiền từ một người chơi ngẫu nhiên trong server'),
    new SlashCommandBuilder()
        .setName("top")
        .setDescription("Xem top của server"),
    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Xem top 10 người chơi có level cao nhất'),

    new SlashCommandBuilder()
        .setName('slot')
        .setDescription('Chơi slot machine')
        .addIntegerOption(option => option.setName('bet').setDescription('Số tiền cược').setRequired(true)),
    
    new SlashCommandBuilder()
        .setName("thamngan")
        .setDescription("Thăm ngàn để nhận tiền thưởng ngẫu nhiên"),

    new SlashCommandBuilder()
        .setName("level")
        .setDescription("Xem cấp độ hiện tại của bạn"),
    
    new SlashCommandBuilder()
        .setName('baucua')
        .setDescription('Chơi Bầu Cua Tôm Cá')
        .addIntegerOption(option => 
            option.setName('bet')
                .setDescription('Số tiền cược')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('choice')
                .setDescription('Chọn một biểu tượng: 🐓 🐶 🦀 🦑 🍐 🍤')
                .setRequired(true)
                .addChoices(
                    { name: 'Gà', value: '🐓' },
                    { name: 'Chó', value: '🐶' },
                    { name: 'Cua', value: '🦀' },
                    { name: 'Cá', value: '🦑' },
                    { name: 'Bầu', value: '🍐' },
                    { name: 'Tôm', value: '🍤' }
                )),

    new SlashCommandBuilder()
        .setName('xocdia')
        .setDescription('Chơi trò Xóc Đĩa')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Số tiền cược')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Lựa chọn cược')
                .setRequired(true)
                .addChoices(
                    { name: 'Chẵn', value: 'chẵn' },
                    { name: 'Lẻ', value: 'lẻ' },
                    { name: '1 Trắng', value: '1 trắng' },
                    { name: '2 Trắng', value: '2 trắng' },
                    { name: '3 Trắng', value: '3 trắng' },
                    { name: '4 Trắng', value: '4 trắng' },
                    { name: '1 Đen', value: '1 đen' },
                    { name: '2 Đen', value: '2 đen' },
                    { name: '3 Đen', value: '3 đen' },
                    { name: '4 Đen', value: '4 đen' }
                )),
    
    new SlashCommandBuilder()
                .setName('give')
                .setDescription('Chuyển tiền hoặc vật phẩm cho người khác')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Người nhận')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Số tiền muốn chuyển (không chọn nếu chuyển vật phẩm)')
                        .setMinValue(1))
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('Tên vật phẩm muốn chuyển (không chọn nếu chuyển tiền)'))
                .addIntegerOption(option =>
                    option.setName('quantity')
                        .setDescription('Số lượng vật phẩm muốn chuyển (mặc định là 1)')
                        .setMinValue(1)),
            
    new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Xem danh sách vật phẩm có thể mua trong cửa hàng'),

    new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Mua một vật phẩm từ cửa hàng')
        .addStringOption(option => 
            option.setName('item')
                .setDescription('Tên vật phẩm muốn mua')
                .setRequired(true)
                .addChoices(...shopItems)),

    new SlashCommandBuilder()
        .setName("lootbox")
        .setDescription("Mở lootbox để nhận phần thưởng ngẫu nhiên")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Loại lootbox muốn mở")
                .setRequired(true)
                .addChoices(
                    { name: "Lootbox thường", value: "lootbox" },
                    { name: "Lootbox flop", value: "lootbox2" },
                    { name: "Lootbox fade", value: "lootbox3" },
                    { name: "Case Gamma dopper", value: "lootbox4" },
                    { name: "csgo weapon case", value: "lootbox5" }
                ))
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("Số lượng muốn mở (tối đa 30)")
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName("buylootbox")
        .setDescription("Mua lootbox để nhận phần thưởng ngẫu nhiên")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Loại lootbox (1,2 hoặc 3)")
                .setRequired(true)
                .addChoices(
                    { name: "Lootbox thường", value: "lootbox" },
                    { name: "Lootbox flop", value: "lootbox2" },
                    { name: "Lootbox fade", value: "lootbox3" },
                    { name: "Gamma dopper tới chơi", value: "lootbox4" },
                    { name: "csgo weapon case", value: "lootbox5" }
                ))
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("Số lượng lootbox muốn mua")
                .setRequired(true)),
     
    new SlashCommandBuilder()
        .setName("sell")
        .setDescription("Bán vật phẩm từ kho của bạn")
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Chọn vật phẩm để bán")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("Số lượng muốn bán")
                .setRequired(true)
                .setMinValue(1)
        ),
             
             
    new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Xem kho do cua ban'),

    new SlashCommandBuilder()
        .setName('sellall')
        .setDescription('Ban toan bo vat pham'),

    new SlashCommandBuilder()
        .setName("battles")
        .setDescription("Thách đấu người chơi khác trong việc mở lootbox!")
        .addUserOption(option => 
            option.setName("opponent")
                .setDescription("Người chơi bạn muốn thách đấu")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Loại lootbox muốn mở")
                .setRequired(true)
                .addChoices(
                    { name: "Lootbox thường", value: "lootbox" },
                    { name: "Lootbox flop", value: "lootbox2" },
                    { name: "Lootbox fade", value: "lootbox3" },
                    { name: "Gamma dopper", value: "lootbox4" },
                    { name: "csgo weapon case", value: "lootbox5" }
                ))
        .addIntegerOption(option =>
            option.setName("amount")
                .setDescription("Số lượng lootbox muốn mở")
                .setRequired(true)),
    
]

.map(command => command.toJSON());
if (!process.env.TOKEN) {
    console.error("❌ Lỗi: Thiếu biến môi trường TOKEN");
    process.exit(1);
}
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🗑 Xóa tất cả lệnh cũ...");
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });

        console.log('⏳ Đang cập nhật (hoặc đăng ký) lệnh Slash...');
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log('✅ Lệnh Slash đã được cập nhật thành công!');
    } catch (error) {
        console.error('❌ Lỗi khi đăng ký lệnh Slash:', error);
    }
})();


// Xử lý autocomplete cho sell và give
module.exports = {
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const userId = interaction.user.id;
        
        if (focusedOption.name === "item") {
            const userItems = userInventory[userId] ? Object.keys(userInventory[userId].items || {}) : [];
            const itemChoices = [...lootboxItems1, ...lootboxItems2].map(item => item.name);
            const availableChoices = [...new Set([...userItems, ...itemChoices])].slice(0, 25);
            
            await interaction.respond(
                availableChoices.map(item => ({ name: item, value: item }))
            );
        }
    }
};
