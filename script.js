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
                 .then(() => bot.say(`Sehr schön, freut mich Dich kennenzulernen, ${name}`))
                .then(() => 'speak');  
        }
    },
	
	talkRandom: {
        prompt: (bot) => bot.say("I normally don't let go anyone untill they say 'bye'"),
        receive: (bot, message) => {
                let upperText = message.text.trim().toUpperCase();
                if(upperText === "BYE"){
                    return bot.say("Great chatting with you. Have a good day ahead. Bye.");
                }
            }
    },

    tellMore: {
        prompt: (bot) => bot.say("Wenn Du mehr über Sebastian erfahren willst, schreib einfach 'mehr'"),
        receive: (bot, message) => {
                let upperText = message.text.trim().toUpperCase();
                if(upperText === "MEHR"){
                    return bot.say("Sebastian kann noch viel mehr ..."); 
                }
            }
    },
	
	speak: {
		prompt: (bot) => bot.say('Um mehr über Sebastian zu erfahren, kannst Du jederzeit folgendes tippen: Beruf, Hobbys, Kontakt, Hilfe'),
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


/* getReply should allow for some variety in responses for received text messages that 
do not have an entry in the scripts.json file. */
            function getReply() {
                var messages = [ "Sorry. Ich verstehe noch nicht alles was Du sagst. Schreib mal KOMMANDOS um zu sehen was ich alles für Dich tun kann.",
                                 "Hey, das habe ich leider nicht verstanden. Schreib bitte HILFE um mehr zu erfahren.",
                                 "Schreibe BUZZBOT um mehr über mich zu erfahren.",
                                 "Du bist ein ganz angenehmer Gesprächspartner. Wie ich Dir helfen kann erfährst Du mit der Eingabe von HILFE.",
                                 "Yo. Was? Mhm... schreib doch einfach mal HILFE",
                                 "Kannst Du das bitte wiederholen?",
                                 "Das war jetzt ein ganzer Aufsatz den Du geschrieben hast. Ich habe echt keinen Plan. Schreib doch einfach mal KOMMANDOS",
                                 "Ui, Satzzeichen bringen mich durcheinander. Lass sie am besten einfach weg. Hast Du schon mal HILFE probiert?",
                                 "Bitte lass alle Satzzeichen weg. Die bringen mich irgendwie durcheinander."
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
                    //return bot.say( getReply() ).then( () => 'speak');
					return bot.say( getReply() ).then( () => 'tellMore');
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
