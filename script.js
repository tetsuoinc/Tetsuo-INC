'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Hallo, wie geht es Dir?')
                .then(() => 'speak');
        }
    },

    speak: {
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
                                 "Yo. Was? Mhm... schreib doch einfach mal HALLO",
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

                if (!_.has(scriptRules, upperText)) {
                    return bot.say(`Das habe ich leider nicht verstanden.`).then(() => 'speak');
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
