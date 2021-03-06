module.exports = {
    name: 'filter',
    description: 'Filters out blacklisted words \nSyntax is ```$filter```',
    execute(message, args) {
        const storage = require('../storage.json');

        var serverFilter = storage.filters.get(message.guild.id);

        if (!serverFilter) {
            storage.filters.set(message.guild.id, []);
            serverFilter = storage.filters.get(message.guild.id);
            return message.channel.send('There is no blacklist present in this server!');
        }
        
        var censorCount = 0;

        message.channel.messages.fetch().then(messages => {
            const filterMessages = messages.filter(value => {
                var filterWords = serverFilter;
                checkValue = value.content.toLowerCase().split(' ');
                for (var i = 0; i < filterWords.length; i++) {
                    for (var x = 0; x < checkValue.length; x++) {
                        if (checkValue[x].includes(filterWords[i])) {
                            censorCount += 1;
                            console.log(`${value.author.username} censored for message ${value.content} : ${filterWords[i]}`);
                            return true;
                        }
                    }
                }
            });
            message.channel.bulkDelete(filterMessages);
            message.channel.send(`${censorCount} messages were filtered.`)

        }).catch(err => {
            console.log(err);
            console.log('Error while doing Bulk Delete');
        });
    }
};