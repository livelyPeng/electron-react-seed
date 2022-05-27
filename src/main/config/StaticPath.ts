/*
 * @Author: penglei
 * @Date: 2022-05-25 20:47:23
 * @LastEditors: penglei
 * @LastEditTime: 2022-05-26 19:32:58
 * @Description:
 */
// 这里定义了静态文件路径的位置
import { join } from 'path'

let __static: string
if (process.env.NODE_ENV !== 'development') {
  __static = join(__dirname, '/static').replace(/\\/g, '\\\\')
}

export const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}` : `file://${__dirname}/index.html`
console.log(process.env.NODE_ENV, __dirname, 12345)
export const loadingURL = process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}/static/loader.html` : `file://${__static}/loader.html`
