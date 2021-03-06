require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const storage = require('./app.json');

const fs = require('fs');
const ytdl = require('ytdl-core');
const Reddit = require('reddit')
const fetch = require("node-fetch");
const opusscript = require("opusscript");

var ffmpeg = require('ffmpeg');

var badlist = process.env.blacklist.split(",");
var quotes = process.env.quotes.split("~");

var steamidslocal = process.env.steamids.split(",");
var steamcodeslocal = process.env.steamcodes.split(",");

const YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey('AIzaSyAA1d3H-fhkfSS9O9f0pwpAXImsoxLVgoQ');

client.on("ready", () => {
    client.user.setActivity('Server Management...', { type: 'CUSTOM_STATUS' })
    client.user.setActivity('Servers', { type: 'WATCHING' });
    console.log(`I am online. ${client.guilds.cache.size} servers are online as well!`);
});

client.on("message", async message => {


    if (message.channel.type === 'dm') {
        return;
    }

    if (message.author.id != 97605170782826496 && message.author.id != 385166607225323521 && message.author.id != 526514389868871680) {
        return;
    }

    let msg = message.content.slice(process.env.prefix.length);

    let args = msg.split(" ");

    let command = args[0].toLowerCase();

    args.shift();

    if (message.content.indexOf(process.env.prefix) === 0) {
        switch (command) {
            case 'browse':
                function GrabPosts() {
                    fetch(`https://www.reddit.com/r/${args[0]}.json?limit=100&?sort=top&t=today`)
                        .then(res => res.json())
                        .then(json => {
                            isNSFW = json.data.children.map(o => o.data.over_18);
                            urls = json.data.children.map(v => v.data.url);
                            titles = json.data.children.map(s => s.data.title);
                            links = json.data.children.map(d => d.data.permalink);
                            console.log(isNSFW);
                            RedditToDiscord(urls, titles, links, args[1], isNSFW);
                        })
                }

                function RedditToDiscord(urls, titles, links, limit, checkSFW) {
                    var randSelector = Math.floor(Math.random() * urls.length) + 1;
                    console.log(checkSFW);
                    for (var i = 0; i < limit; i++) {
                        try {
                            var randomTITLE = titles[i];
                            var randomURL = urls[i];
                            var randomLINK = links[i];
                            var embed = new Discord.MessageEmbed({
                                title: randomTITLE,
                                url: `https://www.reddit.com${randomLINK}`,
                                image: {
                                    url: randomURL
                                }
                            });
                            console.log(message.channel.nsfw, checkSFW[i].nsfw);
                            if (!message.channel.nsfw && checkSFW[i] == true) {
                                message.channel.send('Removed for NSFW content [Sorry!]')
                                break;
                            } else {
                                message.channel.send(embed);
                            }
                            message.channel.send(embed);
                        } catch {
                            message.channel.send('No more posts were found')
                            break;
                        }
                    }
                }
                GrabPosts();
                return;
            case 'hi' || 'hello':
                message.channel.send(`Hi there ${message.author.toString()}`);
                return;
            case 'yt':
                findVideo(args.join(' '), message);
                return;
            /*====================================================*/
            case 'filter':
                message.channel.messages.fetch().then(messages => {
                    const botMessages = messages.filter(checker);
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
            /*====================================================*/
            /*====================================================*/
            case 'logsteamdetails':
                console.log(steamcodeslocal);
                console.log(steamidslocal);
                message.channel.send('Steamdetails were logged to Heroku.');
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
            /*====================================================*/
            /*====================================================*/
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
            /*====================================================*/
        }
    } else {
        /*====================================================*/
        if (message.channel.id == 666818300432613395) {
            if (message.content.length == "76561198071984065".length) {
                console.log(`New steamid from ${message.author.username}, id is ${message.content}`);
                steamidslocal.push(`${message.author.id}~${message.content}`);
                process.env.steamids = steamidslocal;
            } else if (message.content.length == "120844861".length) {
                console.log(`New friendcode from ${message.author.username}, code is ${message.content}`);
                steamcodeslocal.push(`${message.author.id}~${message.content}`);
                process.env.steamcodeslocal = steamcodeslocal;
            } else if (message.content.toLowerCase().includes('steamcommunity.com/id/')) {
                console.log(`New steamid from ${message.author.username}, id is ${message.content.split('/id/')[1]}`);
                steamidslocal.push(`${message.author.id}~${message.content.split('/id/')[1]}`);
                process.env.steamids = steamidslocal;
            } else if (message.content.toLowerCase().includes('friend code:')) {
                console.log(`New steamid from ${message.author.username}, id is ${message.content.split('friend code:')[1]}`);
                steamidslocal.push(`${message.author.id}~${message.content.split('friend code:')[1]}`);
                process.env.steamids = steamidslocal;
            }
        }
        var whitelistedids = [""]
        if (checker(message) && message.channel.id != "650556122557710366" && message.author.id != "97605170782826496" && message.author.id != "267543637024440320" && message.author.id != "473070880155631636" && message.author.id != "526514389868871680" && message.author.id != "262886590949359616") {
            message.author.send(`Please watch your language in ${message.guild.name}.\n'${message.content}' was the censored message.`);
            message.delete();
        }
        /*====================================================*/
    }
    return;
});

function checker(value) {
    let prohibited = badlist;
    checkCont = value.content.toLowerCase().split(' ');
    for (var i = 0; i < prohibited.length; i++) {
        for (var x = 0; x < checkCont.length; x++) {
            if (checkCont[x].includes(prohibited[i])) {
                console.log(`Censored ${value.content} by ${value.author.username} with id ${value.author.id} in server ${value.guild.name}.`);
                console.log(`The detected word was ${prohibited[i]} in ${checkCont[x]}`);
                return true;
            }
        }
    }
    return false;
}

function findVideo(term, messageTerm) {
    youTube.search(term, 1, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            console.log(result.items[0]);
            if (result.items[0].id.videoId) {
                messageTerm.channel.send(`https://youtube.com/watch?v=${result.items[0].id.videoId}`);
                return;
            }
        }
        return;
    });
}

function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.login(process.env.token);