'use strict'

const {
  yellow,
  gray,
  green,
  blueBright,
  black,
  cyanBright
} = require('chalk')

const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

module.exports = async function logs(client, m, prefix, isCmd) {
  try {
    const who = m.fromMe ? 'Self' : m.pushName || 'No Name'
    const time = m.messageTimestamp
    const isPrivate = !m.isGroup

    const timeStr = moment(time * 1000).format('DD/MM/YY HH:mm:ss')
    const sender = m.sender?.split('@')[0] || '-'
    const mtype = m.mtype || 'unknown'

    // ================= CMD LOG =================
    if (isCmd) {
      if (isPrivate) {
        return console.log(
          '\n' + yellow('[ CMD ]'),
          cyanBright(timeStr),
          gray.bgGreen(` ${black(mtype)} `),
          green('from'),
          `[${sender}]`,
          gray.bgYellow(` ${black(who)} `),
          green('in'),
          `[${m.sender}]`,
          `\n${m.text || ''}`
        )
      }

      const subject =
        client.store.groups[m.chat].subject
        
      return console.log(
        '\n' + yellow('[ CMD ]'),
        cyanBright(timeStr),
        gray.bgGreen(` ${black(mtype)} `),
        green('from'),
        `[${sender}]`,
        gray.bgYellow(` ${black(who)} `),
        green('in'),
        gray.bgYellow(` ${black(subject)} `),
        `\n${m.text || ''}`
      )
    }

    // ================= MESSAGE LOG =================
    if (isPrivate) {
      return console.log(
        '\n' + blueBright('[ MSG ]'),
        cyanBright(timeStr),
        gray.bgGreen(` ${black(mtype)} `),
        green('from'),
        `[${sender}]`,
        gray.bgYellow(` ${black(who)} `),
        green('in'),
        `[${m.sender}]`,
        `\n${m.text || ''}`
      )
    }

    const subject = client.store.groups[m.chat].subject
      
    console.log(
      '\n' + blueBright('[ MSG ]'),
      cyanBright(timeStr),
      gray.bgGreen(` ${black(mtype)} `),
      green('from'),
      `[${sender}]`,
      gray.bgYellow(` ${black(who)} `),
      green('in'),
      gray.bgYellow(` ${black(subject)} `),
      `\n${m.text || ''}`
    )
  } catch (e) {
    console.error('[LOG ERROR]', e)
  }
}