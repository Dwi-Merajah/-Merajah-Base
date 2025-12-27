'use strict'

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const mime = require('mime-types')
const moment = require('moment-timezone')
const chokidar = require('chokidar')
const util = require('util')
const NodeID3 = require('node-id3')
const { fileTypeFromBuffer } = require('file-type')

class Function {
  greeting() {
    let time = moment.tz('Asia/Makassar').format('HH')
    let res = `Don't forget to sleep`
    if (time >= 3) res = `Good Evening`
    if (time > 6) res = `Good Morning`
    if (time >= 11) res = `Good Afternoon`
    if (time >= 18) res = `Good Night`
    return res
  }
  makeId = (length) => {
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
  }
  formatSize = (size) => {
      function round(value, precision) {
         var multiplier = Math.pow(10, precision || 0)
         return Math.round(value * multiplier) / multiplier
      }
      var megaByte = 1024 * 1024
      var gigaByte = 1024 * megaByte
      var teraByte = 1024 * gigaByte
      if (size < 1024) {
         return size + ' B'
      } else if (size < megaByte) {
         return round(size / 1024, 1) + ' KB'
      } else if (size < gigaByte) {
         return round(size / megaByte, 1) + ' MB'
      } else if (size < teraByte) {
         return round(size / gigaByte, 1) + ' GB'
      } else {
         return round(size / teraByte, 1) + ' TB'
      }
      return ''
   }
  color = (text, color) => {
      return chalk.keyword(color || 'green').bold(text)
  }
  mtype = (data) => {
      function replaceAll(str) {
         let res = str.replace(new RegExp('```', 'g'), '')
            .replace(new RegExp('_', 'g'), '')
            .replace(new RegExp(/[*]/, 'g'), '')
         return res
      }
      let type = (typeof data.text !== 'object') ? replaceAll(data.text) : ''
      return type
   }
   getSize = async (str) => {
      if (!isNaN(str)) return this.formatSize(str)
      let header = await (await axios.get(str)).headers
      return this.formatSize(header['content-length'])
   }
  uuid() {
    return Math.random().toString(36).substr(2, 9)
  }

  toTime(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
  }

  example(isPrefix, command, args) {
    return `📮 Example : ${isPrefix + command} ${args}`
  }

toTime = function (ms = 0) {
  if (typeof ms !== 'number' || isNaN(ms)) return '00:00:00'

  let seconds = Math.floor(ms / 1000)
  if (seconds < 0) seconds = 0

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

  jsonRandom(file) {
    const json = JSON.parse(fs.readFileSync(file))
    return json[Math.floor(Math.random() * json.length)]
  }
  delay = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  jsonFormat = (obj) => {
      return require('util').format(obj)
  }
  
  fetchJson = async (url, options = {}) => {
    try {
      const res = await axios({
        method: 'GET',
        url,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        ...options
      })
      return res.data
    } catch (e) {
      return e
    }
  }

  fetchBuffer = async (url, options = {}) => {
    try {
      const res = await axios({
        method: 'GET',
        url,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        ...options
      })
      return res.data
    } catch (e) {
      return e
    }
  }
  
  Styles(text, style = 1) {
    var xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')
    var yStr = Object.freeze({
      1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
    })
    var replacer = []
    xStr.map((v, i) => replacer.push({
      original: v,
      convert: yStr[style].split('')[i]
    }))
    var str = text.toLowerCase().split('')
    var output = []
    str.map(v => {
      const find = replacer.find(x => x.original == v)
      find ? output.push(find.convert) : output.push(v)
    })
    return output.join('')
  }
  
  getFile = async (input) => {
    if (!input) throw new Error('getFile: input required')

    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    let buffer
    let mimeType = ''
    let ext = ''

    if (Buffer.isBuffer(input)) {
      buffer = input

    } else if (typeof input === 'string' && /^https?:\/\//i.test(input)) {
      const res = await axios.get(input, { responseType: 'arraybuffer' })
      buffer = res.data
      mimeType = res.headers['content-type'] || ''

    } else if (typeof input === 'string' && fs.existsSync(input)) {
      buffer = fs.readFileSync(input)
      mimeType = mime.lookup(input) || ''

    } else {
      throw new Error('getFile: invalid input type')
    }

    const detected = await fileTypeFromBuffer(buffer)
    if (detected) {
      mimeType = detected.mime
      ext = detected.ext
    }

    if (/image/i.test(mimeType)) {
      ext = ext || 'jpg'
    } else if (/audio/i.test(mimeType)) {
      ext = 'mp3'
    } else if (/video/i.test(mimeType)) {
      ext = 'mp4'
    } else {
      ext = ext || 'bin'
    }

    const filename = `${Date.now()}.${ext}`
    const filepath = path.join(tempDir, filename)

    fs.writeFileSync(filepath, buffer)

    return {
      file: filepath,
      filename,
      buffer,
      mime: mimeType,
      ext,
      size: buffer.length
    }
  }
}

module.exports = new Function()