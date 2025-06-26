// ignore
//@name:91Porn视频源
//@version:1
//@webSite:https://91porn.com
//@remark:解析91Porn列表、播放
//@isAV:1
//@order:E
// ignore

const appConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://91porn.com',
    },
    _webSite: 'https://91porn.com',
    get webSite() {
        return this._webSite
    },
    set webSite(value) {
        this._webSite = value
    },
    _uzTag: '',
    get uzTag() {
        return this._uzTag
    },
    set uzTag(value) {
        this._uzTag = value
    },
}

/**
 * 分类列表
 */
async function getClassList(args) {
    let backData = new RepVideoClassList()
    try {
        backData.data = ['最新发布', '本月最热', '评分最高'].map((name, index) => {
            let cls = new VideoClass()
            cls.type_name = name
            cls.type_id = ['recent', 'hot', 'top'][index]
            return cls
        })
    } catch (err) {
        backData.error = err.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 分类视频列表
 */
async function getVideoList(args) {
    let backData = new RepVideoList()
    try {
        const classid = args.classid || 'recent'
        const page = args.page || 1
        let url = `${appConfig.webSite}/v.php?next=watch&page=${page}`
        if (classid === 'hot') url += '&order=hot'
        if (classid === 'top') url += '&order=top'

        const pro = await req(url, { headers: appConfig.headers })
        const $ = cheerio.load(pro.data)
        let list = []

        $('div.video-box').each((_, el) => {
            const href = $(el).find('a').attr('href') || ''
            const viewkey = href.match(/viewkey=([^&]+)/)?.[1]
            if (!viewkey) return
            const title = $(el).find('.video-title').text().trim()
            let img = $(el).find('img').attr('src') || ''
            if (!img.startsWith('http')) img = appConfig.webSite + '/' + img

            let video = new VideoDetail()
            video.vod_id = viewkey
            video.vod_name = title
            video.vod_pic = img
            list.push(video)
        })
        backData.data = list
    } catch (e) {
        backData.error = '列表解析失败：' + e.message
    }
    return JSON.stringify(backData)
}

/**
 * 视频详情
 */
async function getVideoDetail(args) {
    let backData = new RepVideoDetail()
    try {
        const viewkey = args.vod_id || args.url
        if (!viewkey) throw new Error('缺少 viewkey')
        const url = `${appConfig.webSite}/view_video.php?viewkey=${viewkey}`
        const pro = await req(url, { headers: appConfig.headers })
        const $ = cheerio.load(pro.data)

        const title = $('h4').text().trim()
        const cover = $('video').attr('poster') || ''
        const src = $('video source').attr('src') || ''

        let detail = new VideoDetail()
        detail.vod_id = viewkey
        detail.vod_name = title
        detail.vod_pic = cover.startsWith('http') ? cover : appConfig.webSite + '/' + cover
        detail.vod_content = '91Porn 视频'
        detail.vod_play_url = `在线播放$${src}`
        detail.vod_play_from = '在线播放'

        backData.data = detail
    } catch (e) {
        backData.error = '详情解析失败：' + e.message
    }
    return JSON.stringify(backData)
}

/**
 * 获取播放地址
 */
async function getVideoPlayUrl(args) {
    let backData = new RepVideoPlayUrl()
    try {
        const viewkey = args.vod_id || args.url
        const url = `${appConfig.webSite}/view_video.php?viewkey=${viewkey}`
        const pro = await req(url, { headers: appConfig.headers })
        const $ = cheerio.load(pro.data)
        const src = $('video source').attr('src')
        if (!src) throw new Error('未找到视频地址')

        backData.data = src
        backData.header = {
            Referer: appConfig.webSite,
            'User-Agent': appConfig.headers['User-Agent'],
        }
    } catch (e) {
        backData.error = '获取播放地址失败：' + e.message
    }
    return JSON.stringify(backData)
}

/**
 * 搜索视频
 */
async function searchVideo(args) {
    let backData = new RepVideoList()
    try {
        const keyword = args.searchWord || ''
        const url = `${appConfig.webSite}/search_result.php?search_id=${encodeURIComponent(keyword)}`
        const pro = await req(url, { headers: appConfig.headers })
        const $ = cheerio.load(pro.data)

        let list = []
        $('div.video-box').each((_, el) => {
            const href = $(el).find('a').attr('href') || ''
            const viewkey = href.match(/viewkey=([^&]+)/)?.[1]
            if (!viewkey) return
            const title = $(el).find('.video-title').text().trim()
            let img = $(el).find('img').attr('src') || ''
            if (!img.startsWith('http')) img = appConfig.webSite + '/' + img

            let video = new VideoDetail()
            video.vod_id = viewkey
            video.vod_name = title
            video.vod_pic = img
            list.push(video)
        })

        backData.data = list
    } catch (e) {
        backData.error = '搜索失败：' + e.message
    }
    return JSON.stringify(backData)
}

/**
 * 二级分类列表为空
 */
async function getSubclassList(args) {
    return JSON.stringify(new RepVideoSubclassList())
}
async function getSubclassVideoList(args) {
    return getVideoList(args)
}
