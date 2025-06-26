// @name: 91Porn视频源
// @webSite: https://91porn.com
// @version: 1
// @remark: 91Porn源 by XieGui
// @isAV: 1
// @deprecated: 0

import {
  VideoClass,
  RepVideoClassList,
  RepVideoList,
  RepVideoDetail,
  RepVideoPlayUrl,
  UZArgs
} from '../core/uzVideo.js'

import {
  req,
  ReqResponseType,
} from '../core/uzUtils.js'

import { cheerio } from '../core/uz3lib.js'

const BASE_URL = "https://91porn.com"

async function getClassList(args) {
  const backData = new RepVideoClassList()
  try {
    backData.classList = [
      new VideoClass("hot", "🔥 本月最佳"),
      new VideoClass("recent", "🆕 最近更新"),
      new VideoClass("top", "🌟 最受欢迎"),
    ]
  } catch (e) {
    backData.error = e.toString()
  }
  return JSON.stringify(backData)
}

async function getVideoList(args) {
  const backData = new RepVideoList()
  try {
    const page = args.page || 1
    const url = `${BASE_URL}/v.php?next=watch&page=${page}`
    const resp = await req.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      responseType: ReqResponseType.TEXT
    })
    const $ = cheerio.load(resp.data)
    $("div.video-box").each((i, el) => {
      const title = $(el).find(".video-title").text().trim()
      const href = $(el).find("a").attr("href")
      const id = href?.split("?")[1] || ""
      const cover = $(el).find("img").attr("src")
      backData.videoList.push({
        id,
        name: title,
        pic: cover.startsWith("http") ? cover : BASE_URL + "/" + cover,
      })
    })
  } catch (e) {
    backData.error = e.toString()
  }
  return JSON.stringify(backData)
}

async function getVideoDetail(args) {
  const backData = new RepVideoDetail()
  try {
    const viewKey = args.id || ""
    const url = `${BASE_URL}/view_video.php?viewkey=${viewKey}`
    const resp = await req.get(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Referer": BASE_URL },
      responseType: ReqResponseType.TEXT
    })
    const $ = cheerio.load(resp.data)
    const title = $("h4").first().text().trim()
    const cover = $("video").attr("poster") || ""
    const info = $("div[class^='video-details']").text()
    const time = info.match(/时长[:： ]*(\d{2}:\d{2})/)?.[1] || "未知"
    const author = info.match(/添加者[:： ]*([^\n]+)/)?.[1] || "未知"
    const date = info.match(/添加时间[:： ]*([^\n]+)/)?.[1] || "未知"
    backData.name = title
    backData.pic = cover.startsWith("http") ? cover : BASE_URL + "/" + cover
    backData.desc = `时长: ${time}\n上传者: ${author}\n时间: ${date}`
    backData.playUrl = [{ name: "在线播放", url: viewKey }]
  } catch (e) {
    backData.error = e.toString()
  }
  return JSON.stringify(backData)
}

async function getVideoPlayUrl(args) {
  const backData = new RepVideoPlayUrl()
  try {
    const viewKey = args.id || ""
    const url = `${BASE_URL}/view_video.php?viewkey=${viewKey}`
    const resp = await req.get(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Referer": BASE_URL },
      responseType: ReqResponseType.TEXT
    })
    const $ = cheerio.load(resp.data)
    const videoUrl = $("video > source").attr("src")
    if (videoUrl) {
      backData.url = videoUrl
      backData.header = {
        "Referer": BASE_URL,
        "User-Agent": "Mozilla/5.0",
      }
    } else {
      backData.error = "未能获取视频地址"
    }
  } catch (e) {
    backData.error = e.toString()
  }
  return JSON.stringify(backData)
}

async function searchVideo(args) {
  const backData = new RepVideoList()
  try {
    const keyword = args.keyword || ""
    const resp = await req.get(`${BASE_URL}/search_result.php?search_id=${encodeURIComponent(keyword)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      responseType: ReqResponseType.TEXT,
    })
    const $ = cheerio.load(resp.data)
    $("div.video-box").each((i, el) => {
      const title = $(el).find(".video-title").text().trim()
      const href = $(el).find("a").attr("href")
      const id = href?.split("?")[1] || ""
      const cover = $(el).find("img").attr("src")
      backData.videoList.push({
        id,
        name: title,
        pic: cover.startsWith("http") ? cover : BASE_URL + "/" + cover,
      })
    })
  } catch (e) {
    backData.error = e.toString()
  }
  return JSON.stringify(backData)
}

export {
  getClassList,
  getVideoList,
  getVideoDetail,
  getVideoPlayUrl,
  searchVideo
}
