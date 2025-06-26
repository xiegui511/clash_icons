// ignore
//@name:91Porn视频源
//@version:1
//@webSite:https://91porn.com
//@remark:91Porn by ChatGPT
//@isAV:1
//@order: E
// ignore

const appConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://91porn.com',
    },
    ignoreClassName: ['首页'],

    _webSite: 'https://91porn.com',
    /**
     * 网站主页，uz 调用每个函数前都会进行赋值操作
     * 如果不想被改变 请自定义一个变量
     */
    get webSite() {
        return this._webSite
    },
    set webSite(value) {
        this._webSite = value
    },

    _uzTag: '',
    /**
     * 扩展标识，初次加载时，uz 会自动赋值，请勿修改
     * 用于读取环境变量
     */
    get uzTag() {
        return this._uzTag
    },
    set uzTag(value) {
        this._uzTag = value
    },
}

/**
 * 异步获取分类列表的方法。
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoClassList())>}
 */
async function getClassList(args) {
    let webUrl = args.url
    appConfig.webSite = UZUtils.removeTrailingSlash(webUrl)
    let backData = new RepVideoClassList()
    try {
        // 91Porn固定分类
        backData.data = [
            { type_id: 'hot', type_name: '🔥 本月最佳' },
            { type_id: 'recent', type_name: '🆕 最近更新' },
            { type_id: 'top', type_name: '🌟 最受欢迎' },
        ].map(item => {
            let vc = new VideoClass()
            vc.type_id = item.type_id
            vc.type_name = item.type_name
            return vc
        })
    } catch (error) {
        backData.error = '获取分类失败～' + error.message
    }
    return JSON.stringify(backData)
}

/**
 * 获取二级分类列表筛选列表的方法。91Porn无二级分类
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoSubclassList())>}
 */
async function getSubclassList(args) {
    var backData = new RepVideoSubclassList()
    try {
        backData.data = []
    } catch (error) {
        backData.error = error.toString()
    }
    return JSON.stringify(backData)
}

/**
 * 获取分类视频列表
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoList())>}
 */
async function getVideoList(args) {
    let backData = new RepVideoList()
    try {
        const page = args.page || 1
        const classid = args.classid || 'recent'
        let url = `${appConfig.webSite}/v.php?next=watch&page=${page}`
        if (classid === 'hot') url = `${appConfig.webSite}/v.php?next=watch&order=hot&page=${page}`
        else if (classid === 'top') url = `${appConfig.webSite}/v.php?next=watch&order=top&page=${page}`

        const pro = await req(url, { headers: appConfig.headers })
        backData.error = pro.error
        const proData = pro.data
        if (proData) {
            const $ = cheerio.load(proData)
            let list = []
            $('div.video-box').each((_, el) => {
                const title = $(el).find('.video-title').text().trim()
                const href = $(el).find('a').attr('href') || ''
                const vidMatch = href.match(/viewkey=([^&]+)/)
                const vid = vidMatch ? vidMatch[1] : ''
                let cover = $(el).find('img').attr('src') || ''
                if (!cover.startsWith('http')) cover = appConfig.webSite + '/' + cover

                if (vid && title) {
                    let videoDet = new VideoDetail()
                    videoDet.vod_id = vid
                    videoDet.vod_name = title
                    videoDet.vod_pic = cover
                    list.push(videoDet)
                }
            })
            backData.data = list
        }
    } catch (error) {
        backData.error = '获取视频列表失败～' + error.message
    }
    return JSON.stringify(backData)
}

/**
 * 获取二级分类视频列表 或 筛选视频列表 91Porn无二级分类，复用getVideoList
 * @param {UZSubclassVideoListArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoList())>}
 */
async function getSubclassVideoList(args) {
    return getVideoList(args)
}

/**
 * 获取视频详情
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoDetail())>}
 */
async function getVideoDetail(args) {
    let backData = new RepVideoDetail()
    try {
        const vid = args.vod_id || ''
        if (!vid) throw '视频ID为空'
        const url = `${appConfig.webSite}/view_video.php?viewkey=${vid}`
        const pro = await req(url, { headers: appConfig.headers })
        backData.error = pro.error
        const proData = pro.data
        if (proData) {
            const $ = cheerio.load(proData)
            const title = $('h4').first().text().trim()
            let cover = $('video').attr('poster') || ''
            if (cover && !cover.startsWith('http')) cover = appConfig.webSite + '/' + cover
            const infoText = $('div[class^="video-details"]').text()
            const time = infoText.match(/时长[:： ]*(\d{2}:\d{2})/)?.[1] || '未知'
            const author = infoText.match(/添加者[:： ]*([^\n]+)/)?.[1] || '未知'
            const date = infoText.match(/添加时间[:： ]*([^\n]+)/)?.[1] || '未知'

            backData.vod_id = vid
            backData.vod_name = title
            backData.vod_pic = cover
            backData.vod_remarks = `时长: ${time}\n上传者: ${author}\n时间: ${date}`
            backData.vod_actor = author
            backData.vod_content = infoText.trim()
            backData.vod_play_from = '在线播放'
            backData.vod_play_url = `${vid}$${vid}`
        }
    } catch (error) {
        backData.error = '获取视频详情失败～' + error.message
    }
    return JSON.stringify(backData)
}

/**
 * 获取视频的播放地址
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoPlayUrl())>}
 */
async function getVideoPlayUrl(args) {
    let backData = new RepVideoPlayUrl()
    try {
        const vid = args.vod_id || ''
        if (!vid) throw '视频ID为空'
        const url = `${appConfig.webSite}/view_video.php?viewkey=${vid}`
        const pro = await req(url, { headers: appConfig.headers })
        backData.error = pro.error
        const proData = pro.data
        if (proData) {
            const $ = cheerio.load(proData)
            const videoUrl = $('video > source').attr('src')
            if (videoUrl) {
                backData.url = videoUrl
                backData.header = {
                    Referer: appConfig.webSite,
                    'User-Agent': appConfig.headers['User-Agent'],
                }
            } else {
                backData.error = '未能获取视频播放地址'
            }
        }
    } catch (error) {
        backData.error = '获取播放地址失败～' + error.message
    }
    return JSON.stringify(backData)
}

/**
 * 搜索视频
 * @param {UZArgs} args
 * @returns {@Promise<JSON.stringify(new RepVideoList())>}
 */
async function searchVideo(args) {
    let backData = new RepVideoList()
    try {
        const keyword = args.searchWord || ''
        if (!keyword) throw '请输入搜索关键词'
        const url = `${appConfig.webSite}/search_result.php?search_id=${encodeURIComponent(keyword)}`
        const pro = await req(url, { headers: appConfig.headers })
        backData.error = pro.error
        const proData = pro.data
        if (proData) {
            const $ = cheerio.load(proData)
            let list = []
            $('div.video-box').each((_, el) => {
                const title = $(el).find('.video-title').text().trim()
                const href = $(el).find('a').attr('href') || ''
                const vidMatch = href.match(/viewkey=([^&]+)/)
                const vid = vidMatch ? vidMatch[1] : ''
                let cover = $(el).find('img').attr('src') || ''
                if (!cover.startsWith('http')) cover = appConfig.webSite + '/' + cover

                if (vid && title) {
                    let videoDet = new VideoDetail()
                    videoDet.vod_id = vid
                    videoDet.vod_name = title
                    videoDet.vod_pic = cover
                    list.push(videoDet)
                }
            })
            backData.data = list
        }
    } catch (error) {
        backData.error = '搜索失败～' + error.message
    }
    return JSON.stringify(backData)
}
