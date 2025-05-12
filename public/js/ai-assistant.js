// public/js/ai-assistant.js
import { Chatbot } from './chat-widget.js';
const bot = new Chatbot('#ai-assistant', {
  avatar: 'img/8bitbot.png',
  greet: 'Need a tip?'
});
bot.on('message', msg=>{/* handle user */});