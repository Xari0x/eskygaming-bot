const Discord = require('discord.js')
const MySQL = require('mysql')
const request = require('request')
var party_launch = false;

// Connection au bot.
var client = new Discord.Client();
var prefix = "?"
client.login(process.env.TOKEN)

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
});

// Connection a la base de donnée.
const connection = MySQL.createConnection({
    host     : "db4free.net",
    user     : process.env.USER,
    port     : "3306",
    password : process.env.PASSWORD,
    database : process.env.DB
});
connection.connect(err => {
    console.log("Connecté a la base de donnée.");
});

// Guess the number.
client.on('message', msg => {
    if (party_launch && msg.content != null){
        if (Number.isInteger(parseInt(msg.content))){
            if (msg.content > number_random){
                msg.reply("Plus petit !")
            }else if (msg.content < number_random){
                msg.reply("Plus grand !")
            }else{
                connection.query("SELECT * FROM eskygaming WHERE userid = " + msg.author.id, (err, rows) =>{
                let wins = rows[0].wins;
                    msg.reply("Tu a gagné la partie !")
                    party_launch = false;
                    number_random = 0
                    console.log(number_random, party_launch)
                    sql = `UPDATE eskygaming SET wins = ${wins + 1} WHERE userid = '${msg.author.id}'`
                    connection.query(sql, console.log);
                });
            }
        }
    }
});

// Commandes.
client.on('message', msg => {
    if (!msg.content.startsWith(prefix)) return;
    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "help"){
        var help_msg = new Discord.RichEmbed()
            .setColor('#8e44ad')
            .addField("General", "`?help | Affiche toutes les commandes.`\n`?info | Affiche des informations sur le serveur Discord.`\n`?xp | Affiche le nombre d'xp que vous avez.`\n`?member | Vous donne le grade Membre.`")
            .addField("Fun", "`?wasted | Génére une image avec votre photo de profil.`\n`?beautiful | Génére une image avec votre photo de profil.`\n`?bob | Génére une image avec votre photo de profil.`")           .addField("Fortnite", "`?shop featured | Affiche les featured du shop Fortnite.`\n`?shop daily | Affiche les daily du shop Fortnite.`")
            .addField("Jeux", "`?guess-number start/stop | Sert a lancée ou a stoppée une partie de guess number.`\n`?guess-number stat | Sert a afficher vos nombres de wins.`")
            .addField("Vocal", "`?room create | Sert a créer un salon privé.`")
            .addField("Roleplay", "`?mine | Sert a miner des minerais.`\n`?inventory | Sert a afficher ton inventaire.`\n`?upgrade info | Sert a t'afficher des informations sur ta base.`\n`?upgrade | Sert a améliorer ta base.`")
            .addField("Modération", "`?ban @membre | Sert a bannir un membre.`\n`?kick @membre | Sert a kick un membre.`")
            .setTimestamp()
            .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
        msg.guild.channels.find("name", "bot").sendEmbed(help_msg)
    }

    if (command === "xp"){
        connection.query(`SELECT * FROM eskygaming WHERE userid = '${msg.author.id}'`, (err, rows) => {
            if (err) throw err;

            let xp = rows[0].xp;

            if (xp > 100){
                var grade_bronze = msg.guild.roles.find("name", "Bronze");
                msg.member.addRole(grade_bronze)
            }
            if (xp > 300){
                var grade_argent = msg.guild.roles.find("name", "Argent");
                msg.member.addRole(grade_argent)
            }
            if (xp > 500){
                var grade_or = msg.guild.roles.find("name", "Or");
                msg.member.addRole(grade_or)
            }
            if (xp > 800){
                var grade_platine = msg.guild.roles.find("name", "Platine");
                msg.member.addRole(grade_platine)
            }
            if (xp > 1000){
                var grade_diamant = msg.guild.roles.find("name", "Diamant");
                msg.member.addRole(grade_diamant)
            }
            if (xp > 2000){
                var grade_maitre = msg.guild.roles.find("name", "Maître");
                msg.member.addRole(grade_maitre)
            }
            if (xp > 5000){
                var grade_challenger = msg.guild.roles.find("name", "Challenger");
                msg.member.addRole(grade_challenger)
            }
            var xp_msg = new Discord.RichEmbed()
                .setColor('#8e44ad')
                .addField(`Niveau de ${msg.author.username}`, xp)
                .setTimestamp()
                .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
            msg.guild.channels.find("name", "bot").sendEmbed(xp_msg)
        });
    }

    if (command === "info"){
        var info_msg = new Discord.RichEmbed()
            .setColor('#8e44ad')
            .addField("Information du Discord", `**Nom du discord:** *${msg.guild.name}*\n**Création du discord le:** *${msg.guild.createdAt}*\n**Tu as rejoins le:** *${msg.member.joinedAt}*\n**Nombre de membres sur le discord:** *${msg.guild.memberCount}*`)
            .setTimestamp()
            .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
        msg.guild.channels.find("name", "bot").sendEmbed(info_msg)
    }

    if (command === "room"){
        var room_user = msg.guild.channels.find("name", "🔒 Room " + msg.author.username)
        if (args[0] === "create"){
            if (room_user === null){
                msg.guild.createChannel(`🔒 Room ${msg.author.username}`, "voice");
                var room_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField("Création d'une room privée ...", `Room ${msg.author.username}`)
                    .setTimestamp()
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                msg.guild.channels.find("name", "bot").sendEmbed(room_msg)
                
            } else {
                var room_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField("Impossible de créer une room privée ...", `Room ${msg.author.username}`)
                    .setTimestamp()
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                msg.guild.channels.find("name", "bot").sendEmbed(room_msg)
            }
            room_user.setParent('456141150852612126')
            
        } else if (args[0] === "delete"){
            if (room_user === null){
                var room_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField("Impossible de supprimer une room privée ...", `Room ${msg.author.username}`)
                    .setTimestamp()
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                msg.guild.channels.find("name", "bot").sendEmbed(room_msg)
            } else {
                var room_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField("Suppression d'une room privée ...", `Room ${msg.author.username}`)
                    .setTimestamp()
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                msg.guild.channels.find("name", "bot").sendEmbed(room_msg)
                room_user.delete()
            }
        }
    }

    if (command === "ban"){
        if (msg.guild.member(msg.author).hasPermission("BAN_MEMBERS")){
            var usertoban = msg.mentions.users.first();
            msg.guild.member(usertoban).ban(7, usertoban);
            var ban_msg = new Discord.RichEmbed()
                .setColor('#8e44ad')
                .addField("Information de bannissement", `**Utilisateur banni:** *${usertoban.tag}*\n**Modérateur:** *${msg.author.tag}*`)
                .setTimestamp()
                .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
            msg.guild.channels.find("name", "mod_log").sendEmbed(ban_msg)
        }
    }

    if (command === "kick"){
        if (msg.guild.member(msg.author).hasPermission("KICK_MEMBERS")){
            var usertokick = msg.mentions.users.first();
            msg.guild.member(usertokick).kick();
            var kick_msg = new Discord.RichEmbed()
                .setColor('#8e44ad')
                .addField("Information de kick", `**Utilisateur kick:** *${usertokick.tag}*\n**Modérateur:** *${msg.author.tag}*`)
                .setTimestamp()
                .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
            msg.guild.channels.find("name", "mod_log").sendEmbed(kick_msg)
        }
    }

    if (command === "shop"){
        if (args[0] === "featured"){
            var options = {
                url: 'https://fnbr.co/api/shop',
                headers: {
                    'x-api-key': process.env.API
                }
            };
            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                var featured0_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField(`**${info.data.featured[0].name}**`, `**Prix:** *${info.data.featured[0].price} v-bucks*\n**Type:** *${info.data.featured[0].type}*\n**Rareté:** *${info.data.featured[0].rarity}*`)
                    .setTimestamp()
                    .setThumbnail(info.data.featured[0].images.icon)
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                var featured1_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField(`**${info.data.featured[1].name}**`, `**Prix:** *${info.data.featured[1].price} v-bucks*\n**Type:** *${info.data.featured[1].type}*\n**Rareté:** *${info.data.featured[1].rarity}*`)
                    .setTimestamp()
                    .setThumbnail(info.data.featured[1].images.icon)
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                msg.guild.channels.find("name", "bot").sendEmbed(featured0_msg)
                msg.guild.channels.find("name", "bot").sendEmbed(featured1_msg)
                }
            }
            request(options, callback);
        }
        if (args[0] === "daily"){
            var options = {
                url: 'https://fnbr.co/api/shop',
                headers: {
                    'x-api-key': process.env.API
                }
            };
            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                var daily0_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField(`**${info.data.daily[0].name}**`, `**Prix:** *${info.data.daily[0].price} v-bucks*\n**Type:** *${info.data.daily[0].type}*\n**Rareté:** *${info.data.daily[0].rarity}*`)
                    .setTimestamp()
                    .setThumbnail(info.data.daily[0].images.icon)
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                var daily1_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField(`**${info.data.daily[1].name}**`, `**Prix:** *${info.data.daily[1].price} v-bucks*\n**Type:** *${info.data.daily[1].type}*\n**Rareté:** *${info.data.daily[1].rarity}*`)
                    .setTimestamp()
                    .setThumbnail(info.data.daily[1].images.icon)
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                var daily2_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField(`**${info.data.daily[2].name}**`, `**Prix:** *${info.data.daily[2].price} v-bucks*\n**Type:** *${info.data.daily[2].type}*\n**Rareté:** *${info.data.daily[2].rarity}*`)
                    .setTimestamp()
                    .setThumbnail(info.data.daily[2].images.icon)
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                var daily3_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField(`**${info.data.daily[3].name}**`, `**Prix:** *${info.data.daily[3].price} v-bucks*\n**Type:** *${info.data.daily[3].type}*\n**Rareté:** *${info.data.daily[3].rarity}*`)
                    .setTimestamp()
                    .setThumbnail(info.data.daily[3].images.icon)
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                var daily4_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField(`**${info.data.daily[4].name}**`, `**Prix:** *${info.data.daily[4].price} v-bucks*\n**Type:** *${info.data.daily[4].type}*\n**Rareté:** *${info.data.daily[4].rarity}*`)
                    .setTimestamp()
                    .setThumbnail(info.data.daily[4].images.icon)
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                var daily5_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField(`**${info.data.daily[5].name}**`, `**Prix:** *${info.data.daily[5].price} v-bucks*\n**Type:** *${info.data.daily[5].type}*\n**Rareté:** *${info.data.daily[5].rarity}*`)
                    .setTimestamp()
                    .setThumbnail(info.data.daily[5].images.icon)
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                msg.guild.channels.find("name", "bot").sendEmbed(daily0_msg)
                msg.guild.channels.find("name", "bot").sendEmbed(daily1_msg)
                msg.guild.channels.find("name", "bot").sendEmbed(daily2_msg)
                msg.guild.channels.find("name", "bot").sendEmbed(daily3_msg)
                msg.guild.channels.find("name", "bot").sendEmbed(daily4_msg)
                msg.guild.channels.find("name", "bot").sendEmbed(daily5_msg)
                }
            }
            request(options, callback);
        }
    }

    if (command === "member"){
        var role1 = msg.guild.roles.find("name", "🤵 Membres 🤵");
        var role2 = msg.guild.roles.find("name", "🚀 Arrivants 🚀");
        msg.member.addRole(role1)
        msg.member.removeRole(role2)
    }

    if (command === "wasted"){
        var wasted_img = "http://www.triggered-api.tk/api/v2/wasted?url=" + msg.author.avatarURL
        var info_msg = new Discord.RichEmbed()
            .setColor('#8e44ad')
            .setImage(wasted_img)
            .setTimestamp()
            .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
        msg.guild.channels.find("name", "bot").sendEmbed(info_msg)
    }

    if (command === "beautiful"){
        var beautiful_img = "http://www.triggered-api.tk/api/v2/beautiful?url=" + msg.author.avatarURL
        var info_msg = new Discord.RichEmbed()
            .setColor('#8e44ad')
            .setImage(beautiful_img)
            .setTimestamp()
            .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
        msg.guild.channels.find("name", "bot").sendEmbed(info_msg)
    }

    if (command === "bob"){
        var bob_img = "http://www.triggered-api.tk/api/v2/bob?url=" + msg.author.avatarURL
        var info_msg = new Discord.RichEmbed()
            .setColor('#8e44ad')
            .setImage(bob_img)
            .setTimestamp()
            .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
        msg.guild.channels.find("name", "bot").sendEmbed(info_msg)
    }

    if (command === "upgrade"){
        connection.query("SELECT * FROM eskygaming WHERE userid = " + msg.author.id, (err, rows) =>{
            let bronze = rows[0].bronze;
            let iron = rows[0].iron;
            let gold = rows[0].gold;
            let diamond = rows[0].diamond;
            let level = rows[0].level;
            if (args[0] === "info") {
                if (level === 1) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**200 Bronze**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 2) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**200 Argent**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 3) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**200 Or**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 4) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**200 Bronze** et **200 Argent**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 5) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**200 Argent** et **200 Or**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 6) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**500 Bronze** et **500 Argent**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 7) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**500 Argent** et **500 Or**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 8) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**800 Or**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 9) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**500 Argent** et **800 Or**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 10) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**1 000 Bronze** et **1 000 Argent**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 11) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**1 000 Argent** et **1 000 Or**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 12) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**1 500 Bronze** et **1 500 Argent**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 13) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**2 000 Bronze**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 14) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**2 000 Bronze** et **2 000 Argent**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 15) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**2 000 Bronze** et **10 Diamants**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 16) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**2 500 Bronze** et **10 Diamants**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 17) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**2 000 Argent** et **10 Diamants**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 18) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**2 500 Argent** et **50 Diamants**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 19) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**2 500 Bronze** et **100 Diamants**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                } else if (level === 20) {
                    var infobase_msg = new Discord.RichEmbed()
                        .setColor('#8e44ad')
                        .addField("Information de la base de " + msg.author.username, `**Ta base est level:** *${level}*`)
                        .addField("Pour passer au prochain level tu doit avoir", "**MAX**")
                        .setTimestamp()
                        .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                    msg.guild.channels.find("name", "bot").sendEmbed(infobase_msg)
                }
            } else {
                if (level === 1) {
                    if (bronze >= 200) {
                        msg.reply("Tu as amélioré ta base level 2 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 200}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 2) {
                    if (iron >= 200) {
                        msg.reply("Tu as amélioré ta base level 3 !")
                        sql = `UPDATE eskygaming SET iron = ${iron - 200}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 3) {
                    if (gold >= 200) {
                        msg.reply("Tu as amélioré ta base level 4 !")
                        sql = `UPDATE eskygaming SET gold = ${gold - 200}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 4) {
                    if (bronze >= 200 && iron >= 200) {
                        msg.reply("Tu as amélioré ta base level 5 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 200}, iron = ${iron - 200}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 5) {
                    if (iron >= 200 && gold >= 200) {
                        msg.reply("Tu as amélioré ta base level 6 !")
                        sql = `UPDATE eskygaming SET iron = ${iron - 200}, gold = ${gold - 200}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 6) {
                    if (bronze >= 500 && iron >= 500) {
                        msg.reply("Tu as amélioré ta base level 7 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 500}, iron = ${iron - 500}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 7) {
                    if (bronze >= 500 && iron >= 500) {
                        msg.reply("Tu as amélioré ta base level 8 !")
                        sql = `UPDATE eskygaming SET iron = ${iron - 500}, gold = ${gold - 500}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 8) {
                    if (gold >= 800) {
                        msg.reply("Tu as amélioré ta base level 9 !")
                        sql = `UPDATE eskygaming SET gold = ${gold - 800}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 9) {
                    if (iron >= 500 && gold >= 800) {
                        msg.reply("Tu as amélioré ta base level 10 !")
                        sql = `UPDATE eskygaming SET iron = ${iron - 500}, gold = ${gold - 800}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 10) {
                    if (bronze >= 1000 && iron >= 1000) {
                        msg.reply("Tu as amélioré ta base level 11 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 1000}, iron = ${iron - 1000}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 11) {
                    if (iron >= 1000 && gold >= 1000) {
                        msg.reply("Tu as amélioré ta base level 12 !")
                        sql = `UPDATE eskygaming SET iron = ${iron - 1000}, gold = ${gold - 1000}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 12) {
                    if (bronze >= 1500 && iron >= 1500) {
                        msg.reply("Tu as amélioré ta base level 13 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 1500}, iron = ${iron - 1500}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 13) {
                    if (bronze >= 2000) {
                        msg.reply("Tu as amélioré ta base level 14 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 2000}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 14) {
                    if (bronze >= 2000 && iron >= 2000) {
                        msg.reply("Tu as amélioré ta base level 15 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 2000}, iron = ${iron - 2000}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 15) {
                    if (bronze >= 2000 && diamond >= 10) {
                        msg.reply("Tu as amélioré ta base level 16 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 2000}, diamond = ${diamond - 10}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 16) {
                    if (bronze >= 2500 && diamond >= 10) {
                        msg.reply("Tu as amélioré ta base level 17 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 2500}, diamond = ${diamond - 10}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 17) {
                    if (iron >= 2000 && diamond >= 10) {
                        msg.reply("Tu as amélioré ta base level 18 !")
                        sql = `UPDATE eskygaming SET diamond = ${diamond - 10}, iron = ${iron - 2000}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 18) {
                    if (iron >= 2500 && diamond >= 50) {
                        msg.reply("Tu as amélioré ta base level 19 !")
                        sql = `UPDATE eskygaming SET iron = ${iron - 2500}, diamond = ${diamond - 50}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 19) {
                    if (bronze >= 2500 && diamond >= 100) {
                        msg.reply("Tu as amélioré ta base level 20 !")
                        sql = `UPDATE eskygaming SET bronze = ${bronze - 2500}, diamond = ${diamond - 100}, level = ${level + 1} WHERE userid = '${msg.author.id}'`
                        connection.query(sql, console.log);
                    } else {
                        msg.reply("Tu n'as pas assez de ressources ...")
                    }
                } else if (level === 20) {
                    msg.reply("Tu as atteins le level max ...")
                }
            }
        });
    }

    if (command === "inventory"){
        connection.query("SELECT * FROM eskygaming WHERE userid = " + msg.author.id, (err, rows) =>{
            let bronze = rows[0].bronze;
            let iron = rows[0].iron;
            let gold = rows[0].gold;
            let diamond = rows[0].diamond;
            var inventaire_msg = new Discord.RichEmbed()
                .setColor('#8e44ad')
                .addField("Inventaire de " + msg.author.username, `**Bronze:** *${bronze}*\n**Argent:** *${iron}*\n**Or:** *${gold}*\n**Diamant:** *${diamond}*`)
                .setTimestamp()
                .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
            msg.guild.channels.find("name", "bot").sendEmbed(inventaire_msg)
        });
    }

    if (command === "mine"){
        minerai_random = Math.floor(Math.random() * (4 - 0) + 0)
        quantite_random = Math.floor(Math.random() * (20 - 1) + 1)
        console.log(minerai_random + " " + quantite_random);
        if (minerai_random === 0) {
            var mine_msg = new Discord.RichEmbed()
                .setColor('#8e44ad')
                .addField("Tu a gagné:", quantite_random + " bronze !")
                .setTimestamp()
                .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
            msg.guild.channels.find("name", "bot").sendEmbed(mine_msg)
            
            connection.query("SELECT * FROM eskygaming WHERE userid = " + msg.author.id, (err, rows) =>{
            if(err) throw err;
            let sql;
            if(rows.length < 1) {
                sql = `INSERT INTO eskygaming (userid, usertag, xp, bronze, iron, gold, diamond, level, wins) VALUES ('${msg.author.id}', '${msg.author.tag}', 1, ${quantite_random}, 0, 0, 0, 1, 0)`
            } else {
                let bronze = rows[0].bronze;
                sql = `UPDATE eskygaming SET bronze = ${bronze + quantite_random} WHERE userid = '${msg.author.id}'`
            }
            connection.query(sql, console.log);
            });
        } else if (minerai_random === 1) {
            var mine_msg = new Discord.RichEmbed()
                .setColor('#8e44ad')
                .addField("Tu a gagné:", quantite_random + " argent !")
                .setTimestamp()
                .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
            msg.guild.channels.find("name", "bot").sendEmbed(mine_msg)

            connection.query("SELECT * FROM eskygaming WHERE userid = " + msg.author.id, (err, rows) =>{
            if(err) throw err;
            let sql;
            if(rows.length < 1) {
                sql = `INSERT INTO eskygaming (userid, usertag, xp, bronze, iron, gold, diamond, level, wins) VALUES ('${msg.author.id}', '${msg.author.tag}', 1, 0, ${quantite_random}, 0, 0, 1, 0)`
            } else {
                let iron = rows[0].iron;
                sql = `UPDATE eskygaming SET iron = ${iron + quantite_random} WHERE userid = '${msg.author.id}'`
            }
            connection.query(sql, console.log);
            });
        } else if (minerai_random === 2) {
            var mine_msg = new Discord.RichEmbed()
                .setColor('#8e44ad')
                .addField("Tu a gagné:", quantite_random + " or !")
                .setTimestamp()
                .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
            msg.guild.channels.find("name", "bot").sendEmbed(mine_msg)
            connection.query("SELECT * FROM eskygaming WHERE userid = " + msg.author.id, (err, rows) =>{
            if(err) throw err;
            let sql;
            if(rows.length < 1) {
                sql = `INSERT INTO eskygaming (userid, usertag, xp, bronze, iron, gold, diamond, level, wins) VALUES ('${msg.author.id}', '${msg.author.tag}', 1, 0, 0, ${quantite_random}, 0, 1, 0)`
            } else {
                let gold = rows[0].gold;
                sql = `UPDATE eskygaming SET gold = ${gold + quantite_random} WHERE userid = '${msg.author.id}'`
            }
            connection.query(sql, console.log);
            });
        } else if (minerai_random === 3) {
            var mine_msg = new Discord.RichEmbed()
                .setColor('#8e44ad')
                .addField("Tu a gagné:", "1 diamant !")
                .setTimestamp()
                .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
            msg.guild.channels.find("name", "bot").sendEmbed(mine_msg)
            connection.query("SELECT * FROM eskygaming WHERE userid = " + msg.author.id, (err, rows) =>{
            if(err) throw err;
            let sql;
            if(rows.length < 1) {
                sql = `INSERT INTO eskygaming (userid, usertag, xp, bronze, iron, gold, diamond, level, wins) VALUES ('${msg.author.id}', '${msg.author.tag}', 1, 0, 0, 0, 1, 1, 0)`
            } else {
                let diamond = rows[0].diamond;
                sql = `UPDATE eskygaming SET diamond = ${diamond + 1} WHERE userid = '${msg.author.id}'`
            }
            connection.query(sql, console.log);
            });
        }

    if (command === "guess-number"){
        if (args[0] === "start"){
            if (party_launch === false){
                msg.reply("Partie lancée !")
                number_random = Math.floor(Math.random() * (5000 - 0) + 0)
                party_launch = true;
                console.log(number_random, party_launch)
            }else{
                msg.reply("Une partie est déja en cours ...")
            }
        }
        if (args[0] === "stop"){
            if (party_launch === true){
                msg.reply("Partie stoppée !")
                number_random = 0
                party_launch = false;
                console.log(number_random, party_launch)
            }else{
                msg.reply("Aucune partie n'est lancée ...")
            }
        }
        if (args[0] === "stat"){
            connection.query("SELECT * FROM eskygaming WHERE userid = " + msg.author.id, (err, rows) =>{
                let wins = rows[0].wins;
                var info_msg = new Discord.RichEmbed()
                    .setColor('#8e44ad')
                    .addField("Tu a gagné", wins + " partie(s).")
                    .setTimestamp()
                    .setFooter("Codé par Xari0x | Commande demandé par " + msg.author.username, "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
                msg.guild.channels.find("name", "bot").sendEmbed(info_msg)
            });
        }
    }
}});

// Systéme de bienvenue.
client.on("guildMemberAdd", member => {
    let role = member.guild.roles.find("name", "🚀 Arrivants 🚀");
    var bienvenue_msg = new Discord.RichEmbed()
        .setColor('#8e44ad')
        .addField("Bienvenue a " + member.user.tag + " !", "Nous sommes désormais " + member.guild.memberCount + " !")
        .addField("#regles", "N'hesite pas aller voir les regles !")
        .setTimestamp()
        .setFooter("Codé par Xari0x", "https://cdn.discordapp.com/avatars/282147518958272512/7fbeab6cdab3222d3a567b53eff434b9.png")
    member.guild.channels.find("name", "bienvenue").sendEmbed(bienvenue_msg)
    member.addRole(role)
})

// Systéme d'XP.
client.on('message', msg => {
    connection.query("SELECT * FROM eskygaming WHERE userid = " + msg.author.id, (err, rows) =>{
        if(err) throw err;

        let sql;

        if(rows.length < 1) {
            sql = `INSERT INTO eskygaming (userid, usertag, xp, bronze, iron, gold, diamond, level, wins) VALUES ('${msg.author.id}', '${msg.author.tag}', 1, 0, 0, 0, 0, 1, 0)`
        } else {
            let xp = rows[0].xp;
            sql = `UPDATE eskygaming SET xp = ${xp + 1} WHERE userid = '${msg.author.id}'`
        }
        
        connection.query(sql, console.log);
    });
});
