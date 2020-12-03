import TelegramBot from 'node-telegram-bot-api';
import mongoose from 'mongoose';
import moment from 'moment';
import psl from 'psl';

// helpers
import { getChatId } from './utils/helper';

// Keyboards
import { myProfile, nameServers, myHostings, findDomains, mybalance, start, startUser, buyDomain, agree, mygifts, menu } from './utils/keyboardButtons';

// Constants
import { TelegramToken, StripeToken } from './constants';

// APIs
import { registerDomains, checkDomains, getBalance, getNotifications, putNotifications, getUser, getDomains, getHostings } from './api';

// Mongoose connection
mongoose
  .connect('mongodb://localhost:27017/bot', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error) => handleError(error));

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  console.log('Connection Successful!');
});

// User model
// import User from './models/user.model';

// Bot logic
const bot = new TelegramBot(TelegramToken, { polling: true });

bot.onText(/\/start\s\w/, (msg) => {
  // const jwt = /^Bearer\s+/.test(msg.text.split(' ')[1]);
  console.log(msg.text.split(' ')[1]);
  // new User({ telegramId: id, jwtToken: jwt }).save().catch((e) => console.log(e));

  bot.sendMessage(getChatId(msg), `👌 Perfect name.am account is successfully connected to the bot`, {
    reply_markup: {
      resize_keyboard: true,
      keyboard: startUser,
    },
  });

  // getJwtTokenById(id).then((token) => {
  //   return token;
  // });
  // console.log(token);
});

bot.onText(/\/start$/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content of the message

  const html = `Do you confirm that you have read and agree to the <a href="https://name.am/docs/general-terms.pdf">General Terms</a> and <a href="https://name.am/docs/special-terms.pdf">Special Terms</a>?`;

  bot.sendMessage(getChatId(msg), html, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      resize_keyboard: true,
      keyboard: start,
    },
  });
});

// Domain regexp /Buy (some valid domain)
// bot.onText(/Buy\s[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/, (msg) => {
//   const domain = msg.text.split(' ')[1];
//   registerDomains(getChatId(msg), domain).then((response) => {
//     bot.sendMessage(getChatId(msg), `status: ${response.status}`, {
//       reply_markup: {
//         resize_keyboard: true,
//         keyboard: buyDomain,
//       },
//     });
//   });
//   //register after checking
//   checkDomains(domain).then((response) => {
//     console.log(response.data[0].domain);
//     //   bot.sendInvoice(id, 'Buy Domain', `buying domain - ${response.data[0].domain}`, 'payload', StripeToken, 'random_string', 'AMD', [{ label: response.data[0].domain, amount: response.data[0].price * 100 }]);
//   });
// });

bot.onText(/✅ I totally agree/, (msg) => {
  bot.sendMessage(getChatId(msg), `👌 Perfect`, {
    reply_markup: {
      resize_keyboard: true,
      keyboard: agree,
    },
  });
});

bot.onText(/🤖 Authorization/, (msg) => {
  bot.sendMessage(getChatId(msg), `⬇️ Open the link below to authorize the bot`, {
    reply_markup: {
      inline_keyboard: [[{ text: `➡️ name.am`, url: '192.168.0.22:3000/telegram-token' }]],
    },
  });
});

bot.onText(/\/domain/, (msg) => {
  const MD = `*Find your perfect domain in more than 500 TLDs*
  _The system is not saving your search history_`;

  bot.sendMessage(getChatId(msg), MD, {
    parse_mode: 'Markdown',
  });
  bot.sendMessage(getChatId(msg), 'Type domain name please', {
    reply_markup: {
      force_reply: true,
    },
  });
});

bot.onText(/👱 My Profile/, (msg) => {
  bot.sendMessage(getChatId(msg), 'account get my profile', {
    reply_markup: {
      resize_keyboard: true,
      remove_keyboard: true,
      keyboard: myProfile,
    },
  });
});

bot.onText(/🔔 notifications/, (msg) => {
  getNotifications(getChatId(msg)).then((response) => {
    const {
      data: {
        notifications: { expiringDomainsEmail, expiringDomainsSMS, expiringHostingsEmail, expiringHostingsSMS },
      },
    } = response;
    let html = `<b>Domains</b>
✉ Domains Email: <b><i>${expiringDomainsEmail ? 'enabled 🔔' : 'disabled 🔕'}</i></b>
📞 Domains SMS: <b><i>${expiringDomainsSMS ? 'enabled 🔔' : 'disabled 🔕'}</i></b>-------------------------------------
<b>Hostings</b>
✉ Hostings Email: <b><i>${expiringHostingsEmail ? 'enabled 🔔' : 'disabled 🔕'}</i></b>
📞 Hostings SMS: <b><i>${expiringHostingsSMS ? 'enabled 🔔' : 'disabled 🔕'}</i></b>`;
    bot.sendMessage(getChatId(msg), html, {
      parse_mode: 'HTML',
      reply_markup: {
        resize_keyboard: true,
        inline_keyboard: [
          [
            {
              text: `${expiringDomainsEmail ? '❌' : '✅'}  Notify about expiring domains via email`,
              callback_data: `DE-${expiringDomainsEmail}`,
            },
          ],
          [
            {
              text: `${expiringDomainsSMS ? '❌' : '✅'}  Notify about expiring domains via sms`,
              callback_data: `DS-${expiringDomainsSMS}`,
            },
          ],
          [
            {
              text: `${expiringHostingsEmail ? '❌' : '✅'}  Notify about expiring hostings via email`,
              callback_data: `HE-${expiringHostingsEmail}`,
            },
          ],
          [
            {
              text: `${expiringHostingsSMS ? '❌' : '✅'}  Notify about expiring hostings via sms`,
              callback_data: `HS-${expiringHostingsSMS}`,
            },
          ],
        ],
      },
    });
  });
});

bot.onText(/💻 name servers/, (msg) => {
  getUser(getChatId(msg)).then((response) => {
    let text = '';
    response.data.nameServers.forEach((element) => {
      return (text += `hostname: ${element.hostname},\n`);
    });

    bot.sendMessage(getChatId(msg), text, {
      reply_markup: {
        resize_keyboard: true,
        keyboard: nameServers,
      },
    });
  });
});

bot.onText(/💰 balance/, (msg) => {
  getBalance(getChatId(msg), 'AMD').then((response) => {
    const {
      data: { balance, currency },
    } = response;
    let text = `${balance > 0 ? '😊' : '😟'} Your balance is ${balance} ${currency}`;

    bot.sendMessage(getChatId(msg), text, {
      reply_markup: {
        resize_keyboard: true,
        keyboard: mybalance,
      },
    });
  });
});

bot.onText(/🎁 gifts/, (msg) => {
  getUser(getChatId(msg)).then((response) => {
    const {
      data: { gifts },
    } = response;
    bot.sendMessage(getChatId(msg), `You have ${gifts[0].quantity} gift 🎁 . ${gifts[0].type},${gifts[0].productName}`, {
      reply_markup: {
        resize_keyboard: true,
        keyboard: mygifts,
      },
    });
  });
});

bot.onText(/🏠 Menu/, (msg) => {
  bot.sendMessage(getChatId(msg), 'menu', {
    reply_markup: {
      resize_keyboard: true,
      keyboard: menu,
    },
  });
});

bot.onText(/🕵 Find Domain\(s\)/, (msg) => {
  const MD = `*Find your perfect domain in more than 500 TLDs*
  _The system is not saving your search history_`;

  bot.sendMessage(getChatId(msg), MD, {
    parse_mode: 'Markdown',
  });
  bot.sendMessage(getChatId(msg), 'Type domain name please', {
    reply_markup: {
      force_reply: true,
    },
  });
});

bot.onText(/☁️ My Hostings/, (msg) => {
  getHostings(getChatId(msg)).then((response) => {
    let text = '';
    response.data.docs.forEach((el, i) => {
      return (text += `${i + 1}) ${el.domain} Status - <b><i>${el.status}</i></b>, Auto Renew - <b><i>${el.autoRenew ? 'enabled' : 'disabled'}</i></b>\n ip - ${el.ip}\n  Expiration - <b><i>${moment(el.expiration).format('MMMM Do YYYY')}</i></b>\n`);
    });
    bot.sendMessage(getChatId(msg), text, {
      parse_mode: 'HTML',
      reply_markup: {
        resize_keyboard: true,
        keyboard: myHostings,
      },
    });
  });
});

bot.onText(/🌐 My Domain\(s\)/, (msg) => {
  getDomains(getChatId(msg)).then((response) => {
    let text = '';
    response.data.docs.forEach((el, i) => {
      text += `${i + 1}) ${el.domain} ${el.collaborators.length ? '👥' : ''}\n Status - <b><i>${el.status}</i></b>, Auto Renew - <b><i>${el.autoRenew ? 'enabled' : 'disabled'}</i></b>\n Expiration - <b><i>${moment(el.expiration).format('MMMM Do YYYY')}</i></b> . \n`;
    });
    bot.sendMessage(getChatId(msg), text, {
      parse_mode: 'HTML',
    });
  });
});

bot.onText(/test/, (msg) => {
  bot.sendMessage(getChatId(msg), 'test', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `TEST TEST TEST TEST`,
            callback_data: `TEST`,
          },
        ],
      ],
    },
  });
});

// Listen for any kind of message. There are different kinds of messages.
bot.on('message', (msg) => {
  if (msg.reply_to_message && msg.reply_to_message.text === 'Type domain name please') {
    const { tld, domain, error, listed } = psl.parse(msg.text);
    if (error && error.message) {
      bot.sendMessage(getChatId(msg), `${error.message}`, {
        reply_markup: {
          resize_keyboard: true,
          keyboard: findDomains,
        },
      });
    } else if (!listed) {
      bot.sendMessage(getChatId(msg), `Sorry, unavailable TLD`, {
        reply_markup: {
          resize_keyboard: true,
          keyboard: findDomains,
        },
      });
    } else {
      checkDomains(domain, tld).then((response) => {
        if (response.data[0].available) {
          bot.sendMessage(getChatId(msg), `😋 Yes! the searched domain is available \n Price - ${response.data[0].price} \n Price Renew - ${response.data[0].priceRenew}`).then(
            bot.sendMessage(getChatId(msg), 'Do you want to buy?', {
              reply_markup: {
                resize_keyboard: true,
                keyboard: [[`Buy ${response.data[0].domain}`], [`🕵 Find Domain(s)`], [`🏠 Menu`]],
              },
            })
          );
        } else {
          bot.sendMessage(getChatId(msg), `🙁 ${domain} is not available`, {
            reply_markup: {
              resize_keyboard: true,
              keyboard: findDomains,
            },
          });
        }
      });
    }
  }
});

bot.on('callback_query', (query) => {
  const {
    message: {
      chat: { id },
    },
  } = query;
  const {
    message: { message_id },
  } = query;

  let data;

  switch (query.data) {
    case 'TEST':
      bot.answerCallbackQuery(query.id, 'TEST message');
      break;
    case 'DE-true':
      data = {
        expiringDomainsEmail: false,
      };
      break;
    case 'DE-false':
      data = {
        expiringDomainsEmail: true,
      };
      break;
    case 'DS-true':
      data = {
        expiringDomainsSMS: false,
      };
      break;
    case 'DS-false':
      data = {
        expiringDomainsSMS: true,
      };
      break;
    case 'HE-true':
      data = {
        expiringHostingsEmail: false,
      };
      break;
    case 'HE-false':
      data = {
        expiringHostingsEmail: true,
      };
      break;
    case 'HS-true':
      data = {
        expiringHostingsSMS: false,
      };
      break;
    case 'HS-false':
      data = {
        expiringHostingsSMS: true,
      };
      break;
    default:
      data = '';
  }
  if (date) {
    putNotifications(id, data).then((response) => {
      const {
        data: {
          notifications: { expiringDomainsEmail, expiringDomainsSMS, expiringHostingsEmail, expiringHostingsSMS },
        },
      } = response;
      let html = `<b>Domains</b>
✉ Domains Email: <b><i>${expiringDomainsEmail ? 'enabled 🔔' : 'disabled 🔕'}</i></b>
📞 Domains SMS: <b><i>${expiringDomainsSMS ? 'enabled 🔔' : 'disabled 🔕'}</i></b>-------------------------------------
<b>Hostings</b>
✉ Hostings Email: <b><i>${expiringHostingsEmail ? 'enabled 🔔' : 'disabled 🔕'}</i></b>
📞 Hostings SMS: <b><i>${expiringHostingsSMS ? 'enabled 🔔' : 'disabled 🔕'}</i></b>`;
      bot.editMessageText(html, {
        chat_id: id,
        message_id: message_id,
        parse_mode: 'HTML',
        reply_markup: {
          resize_keyboard: true,
          inline_keyboard: [
            [
              {
                text: `${expiringDomainsEmail ? '❌' : '✅'}  Notify about expiring domains via email`,
                callback_data: `DE-${expiringDomainsEmail}`,
              },
            ],
            [
              {
                text: `${expiringDomainsSMS ? '❌' : '✅'}  Notify about expiring domains via sms`,
                callback_data: `DS-${expiringDomainsSMS}`,
              },
            ],
            [
              {
                text: `${expiringHostingsEmail ? '❌' : '✅'}  Notify about expiring hostings via email`,
                callback_data: `HE-${expiringHostingsEmail}`,
              },
            ],
            [
              {
                text: `${expiringHostingsSMS ? '❌' : '✅'}  Notify about expiring hostings via sms`,
                callback_data: `HS-${expiringHostingsSMS}`,
              },
            ],
          ],
        },
      });
    });
  }
});

bot.on('pre_checkout_query', (query) => {
  // console.log('pre_checkout_query', query);
  bot.answerPreCheckoutQuery(query.id.toString(), true);
});
bot.on('successful_payment', (msg) => {
  // console.log('successful_payment', msg);
  console.log(`${msg.from.first_name} (${msg.from.username}) just payed ${msg.successful_payment.total_amount / 100} €.`);
});
