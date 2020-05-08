require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const leaderboard = require('./app.json');
const fs = require('fs')


var badlist = process.env.blacklist.split(",");
var quotes = process.env.quotes.split("~");

var steamidslocal = process.env.steamids.split(",");
var steamcodeslocal = process.env.steamcodes.split(",");

client.on("ready", () => {
    client.user.setActivity('Life', { type: 'PLAYING' });
    console.log(`client is online!\n${client.users.size} users, in ${client.guilds.size} servers connected.`);
});

client.on("guildCreate", guild => {
    console.log(`I've joined the guild ${guild.name} (${guild.id}), owned by ${guild.owner.user.username} (${guild.owner.user.id}).`);
});

client.on("message", async message => {


    if (message.channel.type === 'dm') {
        return;
    }

    if (message.filter(checker) && message.channel.id != "650556122557710366") {
        message.author.send('Please watch your language in Insurgency AU/NZ, if you believe your message was censored incorrectly, please contact an Admin');
        console.log('Censored' + message.content);
        message.delete();

    }
    
    if (message.author.id != 97605170782826496 && message.author.id != 385166607225323521 && message.author.id != 526514389868871680) {
        return;
    }

    if (message.content.indexOf(process.env.prefix) === 0) {

        let msg = message.content.slice(process.env.prefix.length);

        let args = msg.split(" ");

        let command = args[0].toLowerCase();

        args.shift();

        switch (command) {
            case 'hi' || 'hello':
                message.channel.send(`Hi there ${message.author.toString()}`);
                return;
            case 'filter':
                message.channel.messages.fetch().then(messages => {
                    const botMessages = messages.filter(checker);
                    for (msg in botMessages) {
                        console.log(msg.content);
                    }
                    message.channel.bulkDelete(botMessages);

                }).catch(err => {
                    console.log('Error while doing Bulk Delete');
                });
                return;
            case 'add':
                try {
                    badlist.push(args.join(' ').toLowerCase());
                    process.env.blacklist = badlist.join(",");
                    message.channel.send(`${args} was succesfully added to the blacklist.`);
                } catch (err) {
                    message.channel.send(`${args} was unsuccessfully added to the blacklist.`);
                }
                return;
            case 'remove':
                try {
                    badlist = badlist.filter(e => e !== args.join(' ').toLowerCase());
                    process.env.blacklist = badlist.join(",");
                    message.channel.send(`${args} was successfully removed from the blacklist.`);
                } catch (err) {
                    message.channel.send(`${args} was unsuccessfully removed from the blacklist.`);
                }
                return;
            case 'blacklist':
                try {
                    message.channel.send(`${badlist}`);
                } catch (err) {
                    message.channel.send('Error when displaying blacklist');
                }
                return;
            case 'purge':
                var amount = args[1];
                var messages = await message.channel.messages.fetch({ limit: amount });
                message.channel.bulkDelete(messages);
                return;
            case 'logsteamdetails':
                console.log(steamcodeslocal);
                console.log(steamidslocal);
                message.channel.send('Steamdetails were logged to Heroku.');
                return;
            case 'enum':
                Enumerator(args.join(' '));
                return;
            case 'getcodes':
                if (message.channel.id != 666818300432613395) {
                    return;
                }
                message.channel.messages.fetch().then(oldMessages => {
                    oldMessages.forEach(msg => {
                        if (msg.content.includes(process.env.prefix)) {
                            return;
                        }
                        if (msg.content.length == "76561198071984065".length) {
                            console.log(`New steamid from ${msg.author.username}, id is ${msg.content}`);
                            steamidslocal.push(`${msg.author.id}~${msg.content}`);
                            process.env.steamids = steamidslocal;
                        } else if (msg.content.length == "120844861".length) {
                            console.log(`New friendcode from ${msg.author.username}, code is ${msg.content}`);
                            steamcodeslocal.push(`${msg.author.id}~${msg.content}`);
                            process.env.steamcodeslocal = steamcodeslocal;
                        } else if (msg.content.includes('steamcommunity.com/id/')) {
                            console.log(`New steamid from ${msg.author.username}, id is ${msg.content.split('/id/')[1]}`);
                            steamidslocal.push(`${msg.author.id}~${msg.content.split('/id/')[1]}`);
                            process.env.steamids = steamidslocal;
                        }
                    });
                    console.log(steamidslocal);
                    console.log(steamcodeslocal);
                }).catch(err => {
                    console.log('Error while doing Bulk Delete');
                });
                return;
            case 'fetchprofile':
                var userTest = message.mentions.members.first().fetchProfile();
                console.log(userTest);
                return;
            case 'steamid':
                console.log(steamidslocal);
                for (var i = 0; i < steamidslocal.length; i++) {
                    if (steamidslocal[i].includes(message.mentions.members.first().user.id)) {
                        message.channel.send(`User ${message.mentions.members.first().user.username} -> Steam ID is ${steamidslocal[i].replace("~", "").replace(message.mentions.members.first().user.id, "")}.`);
                        return;
                    }
                }
                message.channel.send(`No ID found for ${message.mentions.members.first().user.username}.`);
                return;
            case 'steamfriendcode':
                console.log(steamcodeslocal);
                for (var i = 0; i < steamcodeslocal.length; i++) {
                    if (steamcodeslocal[i].includes(message.mentions.members.first().user.id)) {
                        message.channel.send(`User ${message.mentions.members.first().user.username} -> Steam Friend Code is ${steamcodeslocal[i].replace("~", "").replace(message.mentions.members.first().user.id, "")}.`);
                        return;
                    }
                }
                message.channel.send(`No friend code found for ${message.mentions.members.first().user.username}.`);
                return;
            case 'quote':
                message.channel.send(quotes[rand(0, quotes.length - 1)]);
                return;
            case 'delete':
                var messages = await message.channel.messages.fetch({ limit: 5 });
                message.channel.bulkDelete(messages);
                return;
            case 'spoil-half-life-alyx-for-me':
                message.channel.send(`||G-Man: Impressive work, Ms. Vance.
                Alyx: Gordon… Freeman?
                G-Man: Gordon, Freeman? Heh, heh. My dear, you wouldn't need all of that to imprison Gordon Freeman.
                Alyx: So, who are you?
                G-Man: Perhaps who I am, is not as important as what I can… offer you, in exchange for coming, all this way. Some believe the fate of our worlds is inflexible. My employers dis-agree. They authorize me to nudge things, hm, in a particular direction from time, to time. What would you want nudged, Ms. Vance?
                Alyx: The Combine off Earth… I want the Combine off Earth.

                G-Man: Ah… that would be a considerably ''large'' nudge. Too large, given the interests of my em-ployers.
                Alyx: Well, you asked.
                G-Man: What if, I could offer you something you don't know, you want? (hands Alyx his briefcase, which she takes)
                (scene changes, showing Alyx crying over her father's body in the ending to Episode 2)
                
                Alyx: Dad? Dad?! Wha-wh? What is this? What's happening?!
                G-Man: We are in the future. This, is the moment, where you watch your father die… unless…
                Alyx: What? Unless what?!
                G-Man: Unless, you were to take matters into your, own, hands.
                (time rewinds to the moment just before Eli's death to the Advisor. Alyx looks to her gloves, crackling with Vortal energy.)
                ||
                `)
                message.channel.send(`||G-Man: Release your father, Ms. Vance. (Alyx fires the Vortal Energy, electrocuting the Advisor and freeing Eli as the scene fades out.) Good. As a consequence of your actions, this entity will continue, and this entity, will not.
                Alyx: Right. So, he's okay? Right? He lives. My dad lives!
                G-Man: You are aware, that you have proven yourself to be of extra-ordinary value (manifests Gordon's crowbar). A previous hire has been unable or unwilling, to per-form the tasks laid before him (steps aside, revealing Gordon Freeman in silhouette). We have struggled to find a suitable replacement, until now.
                Alyx: No! I-I just want to go home. Send me home!
                G-Man: I am afraid, you misunderstand the situation, Ms. Vance. (opens a doorway of pure light, steps through it, and closes it.)
                Alyx: Wait! Hey, wait! Wait!! Wait!!||`)
                message.channel.send(`||Readout: SUBJECT: Alyx Vance
                Readout: STATUS: Hired
                Readout: AWAITING ASSIGNMENT||`)
                return;
        }
    } else {
        if (message.channel.id == 666818300432613395) {
            if (message.content.length == "76561198071984065".length) {
                console.log(`New steamid from ${message.author.username}, id is ${message.content}`);
                steamidslocal.push(`${message.author.id}~${message.content}`);
                process.env.steamids = steamidslocal;
            } else if (message.content.length == "120844861".length) {
                console.log(`New friendcode from ${message.author.username}, code is ${message.content}`);
                steamcodeslocal.push(`${message.author.id}~${message.content}`);
                process.env.steamcodeslocal = steamcodeslocal;
            } else if (message.content.includes('steamcommunity.com/id/')) {
                console.log(`New steamid from ${message.author.username}, id is ${message.content.split('/id/')[1]}`);
                steamidslocal.push(`${message.author.id}~${message.content.split('/id/')[1]}`);
                process.env.steamids = steamidslocal;
            }
        }
    }
    return;
});

function checker(value) {
    var prohibited = badlist;
    checkCont = value.content.toLowerCase();
    for (var i = 0; i < prohibited.length; i++) {
        for (proh in prohibited[i]) {
            if (checkCont.includes(proh)) {
                return true;
            }
        }
        if (checkCont.indexOf(prohibited[i]) > -1) {
            return true;
        }
    }
    return false;
}

function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.login(process.env.token);