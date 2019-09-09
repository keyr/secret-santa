var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
var game = false;
var userStart = '';
var members = [];
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'start':
            	if (game === false) {
            		members = [userID];
            		game = true;
            		userStart = userID;
                	bot.sendMessage({
                    	to: channelID,
                    	message: 'A secret Santa game has begun! Register by typing "!register"'
                	});
            	} else {
            		bot.sendMessage({
            			to: channelID,
            			message: 'A secret Santa game is already in session'
            		});
            	}
            break;
            case 'register': 
            	if (game === false) {
            		bot.sendMessage({
            			to: channelID,
            			message: 'You can\'t register in a game that hasn\'t begun! Start a game by typing "!start"'
            		});
            	} else if (members.includes(userID)) {
            		bot.sendMessage({
            			to: channelID,
            			message: 'You can\'t register in a game multiple times!'
            		});
            	} else {
            		members.push(userID);
                    var mes = '<@' + userID + '>' + ' has joined the secret Santa game!'
            		bot.sendMessage({
            			to: channelID,
            			message: mes
            		});
            	}
            break;
            case 'unregister':
            	if (game === false) {
            		bot.sendMessage({
            			to: channelID,
            			message: 'You can\'t unregister in a game that hasn\'t begun! Start a game by typing "!start"'
            		});
            	} else if (userID === userStart) {
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '>' + ' has decided to stop the game. Sorry everyone :('
                    })
                    game = false;
                    userStart = '';
                    members = [];
                } else if (members.includes(userID) === false) {
            		bot.sendMessage({
            			to: channelID,
            			message: 'You can\'t unregister from a game you\'re not in!'
            		});
            	} else {
                    var index = members.indexOf(userID);
                    members.splice(index, 1);
            		var ans = '<@' + userID + '>' + ' has left the secret Santa game!';
            		bot.sendMessage({
            			to: channelID,
            			message: ans
            		});
            	} 
            break;
            case 'stop':
            	if (game === false) {
            		bot.sendMessage({
            			to: channelID,
            			message: 'You can\'t stop registration for a game that hasn\'t begun! Start a game by typing "!start"'
            		});
            	} else if (userID !== userStart) {
            		bot.sendMessage({
            			to: channelID,
            			message: 'You don\'t have the ability to stop registration!'
            		});
            	} else {
            		if (members.length === 1) {
            			bot.sendMessage({
            				to: channelID,
            				message: 'You cannot start a secret Santa game for only one player :( Sorry!'
            			});
            		} else {
            			bot.sendMessage({
            				to: channelID,
            				message: 'LET THE GAMES BEGIN!'
            			})
            			var shuffled = shuffle(members);
            			for (var i = 0; i < shuffled.length - 1; ++i) {
            				var mes = 'Your secret Santa recipient is ' + '<@' + shuffled[i + 1] + '>';
            				bot.sendMessage({
            					to: shuffled[i],
            					message: mes
            				});
            			}
            			var last = 'Your secret Santa recipient is ' + '<@' + shuffled[0] + '>';
            			bot.sendMessage({
            				to: shuffled[shuffled.length - 1],
            				message: last
            			});
                        game = false;
                        userStart = '';
                        members = [];
            		}
            	}
            break;
         }
     }
});