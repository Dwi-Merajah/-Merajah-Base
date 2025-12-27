'use strict'

module.exports = function extended(sock) {
const fs = require('fs')
const path = require('path')

sock.sendMessageModify = async (
  chatId,
  message,
  quoted,
  opts = {},
  extraOptions = {}
) => {
  await sock.sendPresenceUpdate('composing', chatId)
  if (opts) {
    opts.renderLargerThumbnail = opts.largeThumb ?? opts.renderLargerThumbnail
    opts.showAdAttribution = opts.ads ?? opts.showAdAttribution
    opts.sourceUrl = opts.url ?? opts.sourceUrl ?? ''

    delete opts.largeThumb
    delete opts.ads
    delete opts.url
  }

  const tempDir = path.join(process.cwd(), 'temp')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }
  let tempFilePath = null
  if (opts.thumbnail && typeof opts.thumbnail === 'string' && /^https?:\/\//i.test(opts.thumbnail)) {
    opts.thumbnailUrl = opts.thumbnail
    delete opts.thumbnail
  }

  if (opts.thumbnail && Buffer.isBuffer(opts.thumbnail)) {
    const fileName = `thumb_${Date.now()}.jpg`
    tempFilePath = path.join(tempDir, fileName)
    fs.writeFileSync(tempFilePath, opts.thumbnail)
    opts.thumbnail = fs.readFileSync(tempFilePath)
  }

  if (!opts.thumbnail && !opts.thumbnailUrl) {
    opts.thumbnail = await Func.fetchBuffer(global.db.setting.cover)
  }

  const result = await sock.reply(chatId, message, quoted, {
    ...extraOptions,
    contextInfo: {
      mentionedJid: sock.parseMention(message),
      externalAdReply: {
        title: opts.title || '@Merajah/Assistant',
        body: opts.body || '© Dwi-Merajah',
        mediaType: 1,
        previewType: 0,
        ...opts
      }
    }
  })

  if (tempFilePath) {
    setTimeout(() => {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath)
    }, 60_000)
   }

   return result
  }
  sock.getName = (jid, { fallbackPushName = true, pushName = null } = {}) => {

    const isLid = jid.endsWith('@lid')
    const users = global.db.users
    let user
    if (isLid) {
       user = users.find(v => v.lid === jid)
    } else {
       user = users.find(v => v.jid === jid)
    }

    if (!user.name && fallbackPushName) {
      return pushName
    }

    return user.name || null
  }

  return sock
}