// 91Porn 自定义脚本 - TVBox 使用
// 作者: ChatGPT 定制版
// 时间: 2025-06

const BASE_URL = "https://91porn.com";  // 请替换为你能访问的镜像地址

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
  const html = request(url, { headers: { "Cookie": "language=cn_CN" } });

  const list = [];
  const reg = /<div class="listchannel">([\s\S]*?)<\/div>\s*<\/div>/g;
  let match;
  while ((match = reg.exec(html)) !== null) {
    const block = match[1];
    const name = block.match(/title="([^"]+)"/)?.[1] || "No Title";
    const id = block.match(/href="([^"]*view_video.php[^"]+)"/)?.[1] || "";
    const pic = block.match(/src="([^"]+)"/)?.[1] || "";
    const remark = block.match(/时长:<\/span>([^<]+)/)?.[1] || "";
    list.push({
      vod_id: id,
      vod_name: name,
      vod_pic: pic.startsWith("http") ? pic : BASE_URL + pic,
      vod_remarks: remark.trim()
    });
  }

  return JSON.stringify({
    page: parseInt(pg),
    pagecount: list.length === 0 ? 0 : parseInt(pg) + 1,
    list: list
  });
}

function search(params) {
  const wd = params.wd || "";
  const url = `${BASE_URL}/search_result.php?search_type=search_videos&keyword=${encodeURIComponent(wd)}`;
  const html = request(url, { headers: { "Cookie": "language=cn_CN" } });

  const list = [];
  const reg = /<div class="listchannel">([\s\S]*?)<\/div>\s*<\/div>/g;
  let match;
  while ((match = reg.exec(html)) !== null) {
    const block = match[1];
    const name = block.match(/title="([^"]+)"/)?.[1] || "No Title";
    const id = block.match(/href="([^"]*view_video.php[^"]+)"/)?.[1] || "";
    const pic = block.match(/src="([^"]+)"/)?.[1] || "";
    const remark = block.match(/时长:<\/span>([^<]+)/)?.[1] || "";
    list.push({
      vod_id: id,
      vod_name: name,
      vod_pic: pic.startsWith("http") ? pic : BASE_URL + pic,
      vod_remarks: remark.trim()
    });
  }

  return JSON.stringify({ list });
}

function detail(params) {
  const id = params.id.startsWith("http") ? params.id : BASE_URL + "/" + params.id;
  const html = request(id, { headers: { "Cookie": "language=cn_CN" } });

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "91 Video";
  const pic = html.match(/poster="([^"]+)"/)?.[1] || "";
  const play = html.match(/source src="([^"]+)"/)?.[1] || "";

  return JSON.stringify({
    list: [{
      vod_id: id,
      vod_name: title,
      vod_pic: pic,
      type_name: "91Porn",
      vod_play_from: "在线播放",
      vod_play_url: `原画$${play}`
    }]
  });
}

function play(params) {
  return JSON.stringify({
    parse: 0,
    url: params.url
  });
}
