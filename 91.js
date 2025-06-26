// 91Porn TVBox 源脚本
const BASE_URL = "https://p06.rocks"; // 请替换为你能访问的镜像地址

function home() {
  return JSON.stringify({
    class: [
      { type_id: "rf", type_name: "最近更新" },
      { type_id: "hot", type_name: "当前最热" },
      { type_id: "top", type_name: "本月最热" },
      { type_id: "mf", type_name: "本月收藏" }
    ]
  });
}

function homeVod(params) {
  const cate = params.type || "rf";
  const pg = params.page || 1;
  const url = `${BASE_URL}/v.php?category=${cate}&viewtype=basic&page=${pg}`;
  const html = request(url, { headers: { Cookie: "language=cn_CN" } });

  const list = [];
  const reg = /<div class="listchannel">([\s\S]*?)<\/div>\s*<\/div>/g;
  while (true) {
    const m = reg.exec(html);
    if (!m) break;
    const block = m[1];
    list.push({
      vod_id: block.match(/href="([^"]*view_video.php\?viewkey=[^"]+)"/)?.[1] || "",
      vod_name: block.match(/title="([^"]+)"/)?.[1] || "No Title",
      vod_pic: (block.match(/src="([^"]+)"/)?.[1] || "").replace(/^\/\//, "https://"),
      vod_remarks: (block.match(/时长:<\/span>([^<]+)/)?.[1] || "").trim()
    });
  }

  return JSON.stringify({
    page: pg,
    pagecount: list.length === 0 ? 0 : pg + 1,
    list
  });
}

function search(params) {
  const wd = params.wd || "";
  const url = `${BASE_URL}/search_result.php?search_type=search_videos&keyword=${encodeURIComponent(wd)}`;
  const html = request(url, { headers: { Cookie: "language=cn_CN" } });

  const list = [];
  const reg = /<div class="listchannel">([\s\S]*?)<\/div>\s*<\/div>/g;
  while (true) {
    const m = reg.exec(html);
    if (!m) break;
    const block = m[1];
    list.push({
      vod_id: block.match(/href="([^"]*view_video.php\?viewkey=[^"]+)"/)?.[1] || "",
      vod_name: block.match(/title="([^"]+)"/)?.[1] || "No Title",
      vod_pic: (block.match(/src="([^"]+)"/)?.[1] || "").replace(/^\/\//, "https://"),
      vod_remarks: (block.match(/时长:<\/span>([^<]+)/)?.[1] || "").trim()
    });
  }
  return JSON.stringify({ list });
}

function detail(params) {
  const pageUrl = params.id.startsWith("http") ? params.id :
    `${BASE_URL}/${params.id}`;
  const html = request(pageUrl, { headers: { Cookie: "language=cn_CN" } });

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "91 Video";
  const pic = html.match(/poster="([^"]+)"/)?.[1] || "";
  const playUrl = html.match(/source src="([^"]+)"/)?.[1] ||
    html.match(/<iframe[^>]+src="([^"]+)"/)?.[1] || "";

  const vod_play_url = playUrl
    ? `在线播放$${playUrl}`
    : "";

  return JSON.stringify({
    list: [
      {
        vod_id: pageUrl,
        vod_name: title,
        vod_pic: pic.replace(/^\/\//, "https://"),
        type_name: "91Porn",
        vod_play_from: "在线播放",
        vod_play_url
      }
    ]
  });
}

function play(params) {
  return JSON.stringify({
    parse: 0,
    url: params.url
  });
}
