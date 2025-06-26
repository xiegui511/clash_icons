//@name:91Porn视频源
//@webSite:https://91porn.com
//@version:1
//@remark:91Porn视频源 by ChatGPT
//@isAV:1
//@deprecated:0

import {
    VideoClass,
    RepVideoClassList,
    RepVideoSubclassList,
    RepVideoList,
    RepVideoDetail,
    RepVideoPlayUrl,
    UZArgs,
    UZSubclassVideoListArgs,
} from '../core/uzVideo.js'

import {
    req,
    ReqResponseType,
} from '../core/uzUtils.js'

import { cheerio } from '../core/uz3lib.js'

const BASE_URL = "https://91porn.com"

const appConfig = {
    _webSite: '',
    get webSite() { return this._webSite },
    set webSite(value) { this._webSite = value },
    _uzTag: '',
    get uzTag() { return this._uzTag },
    set uzTag(value) { this._uzTag = value },
}

async function getClassList(args) {
    var backData = new RepVideoClassList()
    try {
        backData.list = [
            new VideoClass("hot", "🔥 本月最佳"),
            new VideoClass("recent", "🆕 最近更新"),
            new VideoClass("top", "🌟 最受欢迎"),
        ]
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

async function getSubclassList(args) {
    // 91Porn无二级分类，直接返回空列表
    var backData = new RepVideoSubclassList()
    try {
        backData.list = []
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

async function getVideoList(args) {
    var backData = new RepVideoList()
    try {
        let page = args.page || 1
        let classid = args.classid || "recent"  // 默认分类
        let url = `${BASE_URL}/v.php?next=watch&page=${page}`

        // 91Porn分类页面URL示例（具体可根据需求改）
        // 注意91Porn分类参数不是classid，需要你根据实际站点URL适配
        if (classid === 'hot') url = `${BASE_URL}/v.php?next=watch&order=hot&page=${page}`
        else if (classid === 'top') url = `${BASE_URL}/v.php?next=watch&order=top&page=${page}`
        else url = `${BASE_URL}/v.php?next=watch&page=${page}`

        const resp = await req.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            responseType: ReqResponseType.TEXT
        })

        const $ = cheerio.load(resp.data)
        backData.list = []
        $("div.video-box").each((i, el) => {
            const title = $(el).find(".video-title").text().trim()
            const href = $(el).find("a").attr("href") || ""
            // 从href取viewkey参数
            const viewkeyMatch = href.match(/viewkey=([^&]+)/)
            const vid = viewkeyMatch ? viewkeyMatch[1] : ""

            const cover = $(el).find("img").attr("src") || ""
            backData.list.push({
                vod_id: vid,
                vod_name: title,
                vod_pic: cover.startsWith("http") ? cover : BASE_URL + "/" + cover,
                remark: '',
            })
        })
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

async function getSubclassVideoList(args) {
    // 91Porn无二级分类，直接复用getVideoList
    return getVideoList(args)
}

async function getVideoDetail(args) {
    var backData = new RepVideoDetail()
    try {
        const vid = args.vod_id || ""
        if (!vid) throw "视频ID为空"
        const url = `${BASE_URL}/view_video.php?viewkey=${vid}`

        const resp = await req.get(url, {
            headers: { "User-Agent": "Mozilla/5.0", "Referer": BASE_URL },
            responseType: ReqResponseType.TEXT
        })
        const $ = cheerio.load(resp.data)

        const title = $("h4").first().text().trim()
        const cover = $("video").attr("poster") || ""
        const infoText = $("div[class^='video-details']").text()
        const time = infoText.match(/时长[:： ]*(\d{2}:\d{2})/)?.[1] || "未知"
        const author = infoText.match(/添加者[:： ]*([^\n]+)/)?.[1] || "未知"
        const date = infoText.match(/添加时间[:： ]*([^\n]+)/)?.[1] || "未知"

        backData.vod_id = vid
        backData.vod_name = title
        backData.vod_pic = cover.startsWith("http") ? cover : BASE_URL + "/" + cover
        backData.vod_remarks = `时长: ${time}\n上传者: ${author}\n时间: ${date}`
        backData.vod_actor = author
        backData.vod_content = infoText.trim()
        backData.vod_play_from = "在线播放"
        backData.vod_play_url = `${vid}$${vid}` // 简单格式：标题$播放key
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

async function getVideoPlayUrl(args) {
    var backData = new RepVideoPlayUrl()
    try {
        const vid = args.vod_id || ""
        if (!vid) throw "视频ID为空"
        const url = `${BASE_URL}/view_video.php?viewkey=${vid}`
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
            backData.error = "未能获取视频播放地址"
        }
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

async function searchVideo(args) {
    var backData = new RepVideoList()
    try {
        const keyword = args.wd || ""
        if (!keyword) throw "请输入搜索关键词"
        const url = `${BASE_URL}/search_result.php?search_id=${encodeURIComponent(keyword)}`

        const resp = await req.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            responseType: ReqResponseType.TEXT
        })
        const $ = cheerio.load(resp.data)
        backData.list = []
        $("div.video-box").each((i, el) => {
            const title = $(el).find(".video-title").text().trim()
            const href = $(el).find("a").attr("href") || ""
            const viewkeyMatch = href.match(/viewkey=([^&]+)/)
            const vid = viewkeyMatch ? viewkeyMatch[1] : ""
            const cover = $(el).find("img").attr("src") || ""
            backData.list.push({
                vod_id: vid,
                vod_name: title,
                vod_pic: cover.startsWith("http") ? cover : BASE_URL + "/" + cover,
                remark: '',
            })
        })
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

export {
    getClassList,
    getSubclassList,
    getVideoList,
    getSubclassVideoList,
    getVideoDetail,
    getVideoPlayUrl,
    searchVideo,
    appConfig,
}
