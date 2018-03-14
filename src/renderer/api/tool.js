import { replace, compose } from 'ramda'
import Crypto from 'crypto'
import Path from 'path'
import { URL } from 'url'
import Moment from 'moment'
import { existsSync } from 'fs'
import Message from '@/api/message'

const userAgent = `${process.env.npm_package_build_productName}/${process.env.npm_package_version}`

export const errorHandler = error => {
  if (error && error.response && error.response.data && error.response.data.msg) {
    Message.error(error.response.data.msg)
  } else {
    Message.error(error.message)
  }
  throw error
}

export const mandatory = parameter => {
  throw new Error(parameter ? `Missing parameter ${parameter}` : 'Missing parameter')
}

export const md5sum = data => {
  return Crypto.createHash('md5')
    .update(data, 'utf8')
    .digest('hex')
}

export const hmacSha1 = (secret = mandatory('secret'), data = mandatory('data')) => {
  return Crypto.createHmac('sha1', secret)
    .update(data, 'utf8')
    .digest()
    .toString('base64')
}

export const standardUri = (path = '') => {
  const pathStr = Array.isArray(path) ? path.join('/') : path
  return compose(replace(/(\/*)$/, '/'), replace(/^(\/*)/, '/'))(pathStr)
}

export const makeSign = ({
  method = mandatory('method'),
  uri = mandatory('uri'),
  date = mandatory('date'),
  passwordMd5 = mandatory('passwordMd5'),
  operatorName = mandatory('operatorName'),
} = {}) => {
  return `UPYUN ${operatorName}:${hmacSha1(passwordMd5, [method, uri, date].join('&'))}`
}

// @TODO 实现 Content-MD5 校验
export const getAuthorizationHeader = ({
  method = 'GET',
  url = '',
  passwordMd5 = mandatory('passwordMd5'),
  operatorName = mandatory('operatorName'),
} = {}) => {
  const date = new Date().toGMTString()

  return {
    Authorization: makeSign({
      operatorName,
      passwordMd5,
      date,
      uri: new URL(url).pathname,
      method: method.toUpperCase(),
    }),
    'x-date': date,
  }
}

export const base64 = (str = '') => new Buffer(str).toString('base64')

// 以固定间隔时间立即执行的 throttle,和普通的不一样
export const throttle = (fn, ms) => {
  let time = 0
  return (...args) => {
    const nowTime = +new Date()
    if (nowTime - time > ms) {
      time = nowTime
      fn(...args)
    }
  }
}

export const sleep = (ms = 0) => {
  return new Promise(r => setTimeout(r, ms))
}

export const isDir = (path = '') => {
  return /\/$/.test(path)
}

export const timestamp = (input, pattern = 'YYYY-MM-DD HH:mm:ss') =>
  isNaN(input) ? input : Moment.unix(input).format(pattern)

export const digiUnit = input => {
  if (input === '-') return ''
  if (isNaN(input)) return input
  if (+input === 0) return '0 B'
  const getSizes = () => ['B', 'KB', 'MB', 'GB', 'TB']
  const getByte = input => Number(Math.abs(input))
  const getIndex = byte => Math.floor(Math.log(byte) / Math.log(1024))
  const getUnitIndex = (sizes = []) => index => (index > sizes.length - 1 ? sizes.length - 1 : index)
  const getResult = sizes => byte => index => `${(byte / Math.pow(1024, index)).toFixed(1)} ${sizes[index]}`
  return compose(
    compose(compose(getResult, getSizes)(), getByte)(input),
    compose(compose(getUnitIndex, getSizes)(), getIndex, getByte),
  )(input)
}

export const percent = (input, precision = 0) => {
  const num = parseFloat(input * 100, 10).toFixed(precision)
  return `${num} %`
}

export const uploadStatus = input => {
  return { '0': '未开始', '1': '进行中', '2': '已完成', '-1': '出错', '-2': '已取消' }[input]
}

// 递归获取不重复名字
export const getLocalName = (fileName = '', init = true) => {
  if (!existsSync(fileName)) return fileName
  const match = /\((\d+)\)$/
  if (init && match.test(fileName)) {
    return getLocalName(fileName.replace(match, (match, p1) => `(${parseInt(p1) + 1})`), false)
  } else {
    return getLocalName(fileName + '(1)', false)
  }
}

export const getFileIconClass = (filename = '', folderType) => {
  const extensionName = Path.extname(filename).toLocaleLowerCase()
  return {
    'icon-folder': folderType === 'F' || folderType === 'B',
    'icon-image': ['.bmp', '.gif', '.ico', '.jpg', '.jpeg', '.png', '.svg', '.webp', '.gifv'].includes(extensionName),
    'icon-music': ['.mp3', '.m4a', '.ogg'].includes(extensionName),
    'icon-zip': ['.zip', '.rar', '.7z'].includes(extensionName),
    'icon-movie': ['.avi', '.mp4', '.flv', '.mov', '.3gp', '.asf', '.wmv', '.mpg', '.f4v', '.m4v', '.mkv'].includes(
      extensionName,
    ),
    'icon-html': ['.htm', '.html', '.vue'].includes(extensionName),
    'icon-json': ['.json'].includes(extensionName),
    'icon-javascript': ['.js', '.jsx'].includes(extensionName),
    'icon-style': ['.css', '.sass', '.less', '.stylus'].includes(extensionName),
    'icon-markdown': ['.md', '.markdown'].includes(extensionName),
  }
}
