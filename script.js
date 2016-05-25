'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        // prompt: (bot) => bot.say('Beep Bye.'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Hallo, Ich bin BuzzBot.')
                .then(() => 'askName');
        }
    },

    askName: {
        prompt: (bot) => bot.say('Wie ist dein Name?'),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                 .then(() => bot.say(`Freut mich Dich kennenzulernen, ${name}. Gib HILFE ein, um Themen zu sehen über die wir sprechen können. \nDu kannst alles kleinschreiben und lass bitte Satzzeichen wie Punkt, Komma, Ausrufe- und Fragezeichen einfach weg. Die bringen mich nur durcheinandern. :smile: `))
                .then(() => 'speak');  
        }
    },

	
	speak: {
		//prompt: (bot) => bot.say('Um mehr über Sebastian zu erfahren, kannst Du jederzeit folgendes tippen: Beruf, Hobbys, Kontakt, Hilfe'),
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }


			/* getReply randomly*/
            function getReply() {
                var messages = [ "Sorry, ich verstehe noch nicht alles was Du sagst. Schreib mal HILFE um zu sehen was ich alles für Dich tun kann.",
                                 "Sorry, das habe ich leider nicht verstanden. Schreib bitte HILFE um mehr zu erfahren.",
                                 "Äh, wie bitte? Wenn du das Wort HILFE eingibst, erfährst Du mehr!",
                                 "Ups, das habe ich jetzt nicht verstanden. Hast Du schon mal HILFE eingegeben?"
                                ];
                var arrayIndex = Math.floor( Math.random() * messages.length );
                return messages[arrayIndex];                
            }





            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                /*  remove the text in between the () after bot.say and place the function getReply
				
				if (!_.has(scriptRules, upperText)) {
                    return bot.say(`Das habe ich leider nicht verstanden.`).then(() => 'speak');
                }
				*/
				

				if (!_.has(scriptRules, upperText)) {
                    return bot.say( getReply() ).then( () => 'speak');

                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        console.log(line);
                        return bot.say(line);
                    });
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
