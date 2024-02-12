/* eslint-disable max-len */
/* eslint-disable no-var */
/**
 *  AniDub plugin for Movian
 *
 *  Copyright (C) 2014-2021 Buksa
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
// ver 3.1.3 01.09.19 fixed anidub player
// ver 3.1.4 01.14.19 fixed players list
// ver 3.1.5 01.16.19 fixed anidub player
// ver 3.1.6 01.24.19 fixed anidub player
// ver 3.1.7 06.24.19
// ver 3.2.2 03.01.22 fixed anidub player aes req headers
// ver 3.2.3 14.04.22 
// ver 3.3.1 21.01.24
// ver 3.4.1 11.02.24
var plugin = JSON.parse(Plugin.manifest);
var PREFIX = plugin.id;
var LOGO = Plugin.path + 'logo.png';
var UA = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:62.0) Gecko/20100101 Firefox/62.0';

var service = require('movian/service');
var settings = require('movian/settings');
var page = require('movian/page');
var http = require('movian/http');
var io = require('native/io');
var prop = require('movian/prop');
var log = require('./src/log');
var browse = require('./src/browse');
var api = require('./src/api');
var html = require('movian/html');
var urls = require('url');

var result = '';
var data = {};

var tos = 'The developer has no affiliation with the sites what so ever.\n';
tos += 'Nor does he receive money or any other kind of benefits for them.\n\n';
tos += 'The software is intended solely for educational and testing purposes,\n';
tos += 'and while it may allow the user to create copies of legitimately acquired\n';
tos += 'and/or owned content, it is required that such user actions must comply\n';
tos += 'with local, federal and country legislation.\n\n';
tos += 'Furthermore, the author of this software, its partners and associates\n';
tos += 'shall assume NO responsibility, legal or otherwise implied, for any misuse\n';
tos += 'of, or for any loss that may occur while using plugin.\n\n';
tos += 'You are solely responsible for complying with the applicable laws in your\n';
tos += 'country and you must cease using this software should your actions during\n';
tos += 'plugin operation lead to or may lead to infringement or violation of the\n';
tos += 'rights of the respective content copyright holders.\n\n';
tos += 'plugin is not licensed, approved or endorsed by any online resource\n ';
tos += 'proprietary. Do you accept this terms?';

// Create the service (ie, icon on home screen)
service.create(plugin.title, PREFIX + ':start', 'video', true, LOGO);
settings.globalSettings(plugin.id, plugin.title, LOGO, plugin.synopsis);
settings.createInfo('info', LOGO, 'Plugin developed by ' + plugin.author + '. \n');
settings.createDivider('Settings:');
settings.createBool('tosaccepted', 'Accepted TOS (available in opening the plugin)', false, function(v) {
  service.tosaccepted = v;
});
settings.createString('domain', '\u0414\u043e\u043c\u0435\u043d', 'https://anidub.live/', function(v) {
  service.domain = v;
});
settings.createBool('debug', 'Debug', false, function(v) {
  service.debug = v;
});
settings.createBool('Show_META', 'Show more info from thetvdb', true, function(v) {
  service.meta = v;
});

// require('movian/itemhook').create({
//   title: "Search at kpID",
//   itemtype: "video",
//   handler: function (obj, nav) {
//     var title = obj.metadata.title.toString();
//     title = title.replace(/<.+?>/g, "").replace(/\[.+?\]/g, "");
//     nav.openURL(PREFIX + ":search:" + title);
//   }
// });

//  require('movian/itemhook').create({
//   title: "Detailed info",
//   itemtype: "video",
//   handler: function(obj, nav) {
//     // Serialize all metadata for the item into the URL
//     // Wicked, but works just fine
//     //output:[prop directory {"url", "type", "metadata", "playcount", "lastplayed", "restartpos", "canDelete", "options"}]
//     print('print(obj)')
//     print('print(obj) output: '+obj)
//     //output:[prop directory {"url", "type", "metadata", "playcount", "lastplayed", "restartpos", "canDelete", "options", "toJSON"}]
//     print('print(obj.url)')
//     print('print(obj.url) output: '+obj.url)
//     print('print(obj.type)')
//     print('print(obj.type) output: '+obj.type)
//     print('print(obj.metadata)')
//     print('print(obj.metadata) output: '+obj.metadata)
//     //print(obj.metadata) output: [prop directory {"title", "description", "icon", "rating", "duration", "loading", "source", "tagline", "genre", "icons", "backdrop", "backdrops", "year", "rating_count", "cast", "crew", "vtype", "thumbs", "episode", "season", "videostreams", "audiostreams"}]
//     print('print(obj.metadata.title)')
//     print('print(obj.metadata.title) output: '+obj.metadata.title)
//     print("obj.metadata.title:"+obj.metadata.title)
//     print("obj.metadata.description:"+obj.metadata.description)
//     print("obj.metadata.icon:"+obj.metadata.icon)
//     print("obj.metadata.rating:"+obj.metadata.rating)
//     print("obj.metadata.duration:"+obj.metadata.duration)
//     print("obj.metadata.loading:"+obj.metadata.loading)
//     print("obj.metadata.source:"+obj.metadata.source)
//     print("obj.metadata.tagline:"+obj.metadata.tagline)
//     print("obj.metadata.genre:"+obj.metadata.genre)
//     print("obj.metadata.icons:"+obj.metadata.icons)
//     print("obj.metadata.backdrop:"+obj.metadata.backdrop)
//     print("obj.metadata.backdrops:"+obj.metadata.backdrops)
//     print("obj.metadata.year:"+obj.metadata.year)
//     print("obj.metadata.rating_count:"+obj.metadata.rating_count)
//     print("obj.metadata.cast:"+obj.metadata.cast)
//     print("obj.metadata.crew:"+obj.metadata.crew)
//     print("obj.metadata.vtype:"+obj.metadata.vtype)
//     print("obj.metadata.thumbs:"+obj.metadata.thumbs)
//     print("obj.metadata.episode:"+obj.metadata.episode)
//     print("obj.metadata.season:"+obj.metadata.season)
//     print("obj.metadata.videostreams:"+obj.metadata.videostreams)
//     print("obj.metadata.audiostreams:"+obj.metadata.audiostreams)

//     print(obj.metadata.cast[0])

//     //output:[prop directory {"url", "type", "metadata", "playcount", "lastplayed", "restartpos", "canDelete", "options", "toJSON"}]
//     // print(obj.url)
//     // //output:anidub:moviepage:{"url":"https://anidub.live/anime_tv/11202-shutnica-takagi-sezon-ova-karakai-jouzu-no-takagi-san-ova.html","title":"Шутница Такаги OVA / Karakai Jouzu no Takagi-san OVA","icon":"https://anidub.live/uploads/posts/2023-05/1685206504_poster-shutnica-takagi_1-sezon.jpg"}
//     //     //output: [prop directory {"url", "type", "metadata", "playcount", "lastplayed", "restartpos", "options", "canDelete"}]
//     // print('url:'+obj.url)
//     // //output: url:https://video.sibnet.ru/shell.php?videoid=4197599
//     // print('type:'+obj.type)
//     // //output: type:video
//     // print('metadata:'+obj.metadata);
//     // //output: metadata:[prop directory {"url", "type", "metadata", "playcount", "lastplayed", "restartpos", "canDelete", "options"}]
//     // print('metadata:'+obj.metadata.url);

//     page.metadata.info = obj.metadata.info;
//     page.dump();
//     nav.openURL(PREFIX + "detailedinfo:" + JSON.stringify(obj));
//   }
// });




// var stringifyWithoutCircular = function(obj) {
//   var seen = [];
  
//   var replacer = function(_, value) {
//       if (typeof value === 'object' && value !== null) {
//           if (seen.includes(value)) {
//               return; // Пропустить циклическую ссылку
//           }
//           seen.push(value);
//       }
//       return value;
//   };
  
//   return JSON.stringify(obj, replacer);
// };

// new page.Route(PREFIX + "detailedinfo:(.*)", function(page, jsonstr) {
//   // Deserialize all metadata back into the page's metadata model
//   page.metadata.info = JSON.parse(jsonstr);
//   // Take a look!
//   page.dump();

//   // Load a special view
//   page.metadata.glwview = plugin.path + "details.view";
//   page.type = 'raw';

//   page.loading = false;
// });

io.httpInspectorCreate('^.*\\/player\\/.*.php\\?vid=\\/.*', function(ctrl) {
  ctrl.setHeader('User-Agent', UA);
  ctrl.setHeader('Referer', ctrl.url);
});

io.httpInspectorCreate('http.*sibnet.ru.*', function(ctrl) {
  ctrl.setHeader('User-Agent', UA);
  ctrl.setHeader('Referer', 'http://video.sibnet.ru');
});
io.httpInspectorCreate('http.*anivid.tk/.*', function(ctrl) {
  ctrl.setHeader('User-Agent', UA);
  // ctrl.setHeader('Referer', 'https://anime.anidub.com/')
});
// online.anidub.com
// online/player/
io.httpInspectorCreate('http.*anidub.*/player/.*', function(ctrl) {
  ctrl.setHeader('User-Agent', UA);
  ctrl.setHeader('Referer', BASE_URL);
});
// rusanime.ru
io.httpInspectorCreate('http.*rusanime.ru/player/out.php.*', function(ctrl) {
	ctrl.setHeader('User-Agent', UA);
    ctrl.setHeader("accept-language", "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7");
    ctrl.setHeader("cache-control", "no-cache");
    ctrl.setHeader("Referer", BASE_URL);
});
// anivids.link
io.httpInspectorCreate('http.*anivids.link.*', function(ctrl) {
  //ctrl.setHeader('sec-ch-ua', '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"');
  //ctrl.setHeader('sec-ch-ua-mobile', '?0');
  //ctrl.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36');
  //ctrl.setHeader('Accept', '*/*');
  // ctrl.setHeader('Connection', 'keep-alive');
  // ctrl.setHeader('Pragma', 'no-cache');
  // ctrl.setHeader('Cache-Control', 'no-cache');
  // ctrl.setHeader('sec-ch-ua', '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"');
  // ctrl.setHeader('sec-ch-ua-mobile', '?0');
  // ctrl.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36');
  // ctrl.setHeader('Accept', '*/*');
  ctrl.setHeader('Origin', service.domain);
  // ctrl.setHeader('Sec-Fetch-Site', 'cross-site');
  // ctrl.setHeader('Sec-Fetch-Mode', 'cors');
  // ctrl.setHeader('Sec-Fetch-Dest', 'empty');
  ctrl.setHeader('Referer', service.domain);
  // ctrl.setHeader('Accept-Language', 'ru,en-US;q=0.9,en;q=0.8,zh;q=0.7');
  ctrl.setHeader('User-Agent', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:62.0) Gecko/20100101 Firefox/62.0');
});
// https://myanime.online/player/
io.httpInspectorCreate('http.*myanime.online/player/.*', function(ctrl) {
  ctrl.setHeader('User-Agent', UA);
  ctrl.setHeader('Referer', ctrl.url);
});

// /////////////////////// player.adcdn.tv /////////////////////////
new page.Route('(http://player.adcdn.tv/embed/storage.*)', function(page, url) {
  var x = http.request(url);
  var url = /file: '([^']+)/.exec(x)[1];
  var url = http.request(url, {
    noFollow: true,
  }).headers.Location;
  var x = http.request(url);
  var str = x.bytes.toString().replace(/\.\/\d+.mp4/g, url.match(/.*\d+.mp4/)[0]);
  var str = Duktape.enc('base64', str);
  page.redirect('hls:data:application/vnd.apple.mpegurl;base64,' + str);
});
// /////////////////////// player.adcdn.tv /////////////////////////
// ///////////////////////  /////////////////////////
new page.Route('(http://get.kodik-storage.com/.*)', function(page, url) {
  var url = http.request(url, {
    noFollow: true,
  }).headers.Location;
  var x = http.request(url);
  
  var str = x.bytes.toString().replace(/\.\/\d+.mp4/g, url.match(/.*\d+.mp4/)[0]);
  var str = Duktape.enc('base64', str);
  page.redirect('hls:data:application/x-mpegURL;base64,' + str);
});

new page.Route('(https://tr.anidub.com/.*html)', function(page, url) {
  var url = http.request(url, {noFollow: true,});
  url = 'https://tr.anidub.com'+ /href="(.*?download[^"]+)/.exec(url)[1]
  page.redirect(url);
});

// /////////////////////// anime.anidub.com/player /////////////////////////
// https://online.anidub.com/player/
// player/index.php?vid=.*

// //Invoke-WebRequest -Uri "https://anime.anidub.life/player/video.php?vid=/s4/11223/1/1.mp4&nid=&id=-1&fc=e299887d227bf2be9c0b1e44e2ad743f&hash=444d3208aef2aec483a36e749ce25c0645e0f33d2b95770986eeccdf8722ba4b&ses=ff" -Headers @{
// "method"="GET"
// "authority"="anime.anidub.life"
// "scheme"="https"
// "path"="/player/video.php?vid=/s4/11223/1/1.mp4&nid=&id=-1&fc=e299887d227bf2be9c0b1e44e2ad743f&hash=444d3208aef2aec483a36e749ce25c0645e0f33d2b95770986eeccdf8722ba4b&ses=ff"
// "pragma"="no-cache"
// "cache-control"="no-cache"
// "sec-ch-ua"="`"Google Chrome`";v=`"89`", `"Chromium`";v=`"89`", `";Not A Brand`";v=`"99`""
// "sec-ch-ua-mobile"="?0"
// "user-agent"="Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"
// "accept"="*/*"
// "sec-fetch-site"="same-origin"
// "sec-fetch-mode"="cors"
// "sec-fetch-dest"="empty"
// "referer"="https://anime.anidub.life/player/index.php?vid=/s4/11223/1/1.mp4&url=/anime/anime_ongoing/11367-sem-smertnyh-grehov-jarostnoe-pravosudie-nanatsu-no-taizai-fundo-no-shinpan-anons.html&ses=ff&id=-1"
// "accept-encoding"="gzip, deflate, br"
// "accept-language"="ru,en-US;q=0.9,en;q=0.8,zh;q=0.7"
// "cookie"="volume=1; level=1; __cfduid=d6afa54430d5b98ec250292e18aff29ba1619050089; PHPSESSID=i8aela8n3mmtf182ip20saf342; _ym_uid=1619050094535426322; _ym_d=1619050094; __gads=ID=fb94c8486aa647af-2247e45a47c70092:T=1619050092:RT=1619050092:S=ALNI_MZjSUoPeG-g4kNbhndZStHylEr7IA; _ym_isad=2; viewed_ids=11367"
// }
// new page.Route('.*(/player/.*.php?vid=/.*)', function(page, url) {
new page.Route('^.*(\\/player\\/.*.php\\?vid=\\/.*)', function(page, url) {
  var canonicalUrl = url;
  page.loading = true;
  page.type = 'video';
  var x = http.request(BASE_URL + url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
      'Referer': BASE_URL + url,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    },
  }).toString();
  log.d(x);
  // https://anime.anidub.com/player/video.php?vid=/s1/10629/1/1.mp4
  // var source = 'video.php?vid=/s1/10727/1/1.mp4&id=-1';
  var url = /<source src='([^']+)/.exec(x)[1];
  // https://online.anidub.com/player/video.php?vid=/s1/11013/6/2.mp4&id=-1
  source = BASE_URL + '/player/' + url;
  
  var x = http.request(source, {
    headers: {
      'User-Agent': UA,
      //'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    },
  }).toString();
  //print(x);
  //print(/480\n(.*)/.exec(x)[1]);

  //console.error('####################2222222################################');
  //console.log(/480\n(.*)/.exec(x)[1]);
  //var x2 = http.request(/480\n(.*)/.exec(x)[1], {
   // headers: {
   //   'User-Agent': UA,
   //   //'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
   // },
  //}).toString();
  
  //print(x2);

  
  var videoParams = {
   title: data.title,
   icon: data.icon,
   canonicalUrl: canonicalUrl,
   sources: [{
     url: 'hls:' + source,
   //  mimetype: 'application/x-mpegURL',
   }],
   no_subtitle_scan: true,
    subtitles: [],
  };
  page.source = 'videoparams:' + JSON.stringify(videoParams);
});
// /////////////////////// anime.anidub.com/player /////////////////////////
// https://www.stormo.tv/anime/10417/1/1.mp4|
new page.Route('(http.*?stormo.tv/embed/.*)', function(page, url) {
  page.loading = true;
  page.type = 'video';
  var x = http.request(url.split('|')[0]).toString();
  var regex = /(\[.*?\])(.*?get_file.*?mp4\/)/gm;
  var m;

  while ((m = regex.exec(x)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    page.appendItem(m[2], 'video', {
      title: m[1] + ' ',
      icon: data.icon,
    });
    //     // The result can be accessed through the `m`-variable.
    //     m.forEach((match, groupIndex) => {
    //         console.log(`Found match, group ${groupIndex}: ${match}`);
    //     });
  }
  // var url = /file:"\[HD\]([^,]+)/.exec(x)[1];
  // var videoParams = {
  //   title: data.title,
  //   icon: data.icon,
  //   canonicalUrl: url,
  //   sources: [{
  //     url: url,
  //     mimetype: 'video/mp4',
  //   }],
  //   no_subtitle_scan: true,
  //   subtitles: []
  // };
  // page.source = "videoparams:" + JSON.stringify(videoParams);
  page.type = 'directory';
  page.metadata.logo = data.icon;
  page.metadata.title = data.title;
  page.loading = false;
});
// /////////////////////// video.sibnet.ru /////////////////////////
new page.Route(PREFIX + ':sibnet:(.*)', function(page, path) {
  page.loading = true;
  page.type = 'video';
  var url = http.request('https://video.sibnet.ru' + path, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
      // "Referer": "https://video.sibnet.ru/"shell.php?videoid=3464674
    },
    noFollow: true,
  }).headers.Location;
  var videoParams = {
    title: data.title,
    icon: data.icon,
    canonicalUrl: PREFIX + ':sibnet:' + path,
    sources: [{
      url: 'http:' + url,
      //  mimetype: type,
    }],
    no_subtitle_scan: true,
    subtitles: [],
  };
  log.p(videoParams);
  page.source = 'videoparams:' + JSON.stringify(videoParams);
});
new page.Route('(http.*?//video.sibnet.ru/shell.php\\?videoid=\\d+)', function(page, url) {
  
  page.loading = true;
  // var url = "http://video.sibnet.ru/shell.php?videoid=" + videoid;
  var x = http.request(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36',
    },
    debug: service.debug,
  });
  log.p(data)
  items = eval((/player\.src\(([^)]+)/.exec(x) || [])[1]);
  items.forEach(function(e) {
    page.appendItem(PREFIX + ':sibnet:' + e.src, 'video', {
      title: (/title: '([^']+)/.exec(x) || [])[1] + ' ' + e.type,
      icon: service.domain+data.icon,
    });
  });
  // if (data !== undefined) {
  //   page.appendItem('search:' + data.title.split('/')[0], 'directory', {
  //     title: 'найти ' + data.title.split('/')[0],
  //   });
  // }
  page.type = 'directory';
  // page.metadata.logo = data.icon;
  // page.metadata.title = data.title;
  page.loading = false;
});
// /////////////////////// video.sibnet.ru /////////////////////////

new page.Route(PREFIX + ':browse:(.*):(.*)', function(page, href, title) {
  browse.list(page, {
    href: href,
    title: title,
  });
});
//
new page.Route(PREFIX + ':moviepage:(.*)', function(page, data) {
  browse.moviepage(page, data);
});
//
new page.Route(PREFIX + ':search:(.*)', function(page, query) {
  page.metadata.icon = LOGO;
  page.metadata.title = 'Search results for: ' + query;
  //  page.type = 'directory';
  // http://getmovie.cc/query/tron
  // index.php?do=search&subaction=search&search_start=1&full_search=1&result_from=1&story=lost&titleonly=3&showposts=0
  browse.list(page, {
    href: '/index.php?do=search&subaction=search&search_start=1&full_search=1&result_from=1&story=' + query + '&titleonly=3&showposts=0',
    title: query,
  });
});
//
new page.Searcher(PREFIX + ' - Result', LOGO, function(page, query) {
  page.metadata.icon = LOGO;
  browse.list(page, {
    href: '/index.php?do=search&subaction=search&search_start=1&full_search=1&result_from=1&story=' + query + '&titleonly=3&showposts=0',
    title: query,
  });
});
// Landing page
new page.Route(PREFIX + ':start', function(page) {
  page.type = 'directory';
  page.metadata.title = PREFIX;
  page.metadata.icon = LOGO;
  page.appendItem(PREFIX + ':search:', 'search', {
    title: 'Search AniDub',
  });
    page.appendItem(PREFIX + ':browse:/anime_ongoing:Аниме Ongoing', 'directory', {
    title: 'Аниме Ongoing',
  });
  //<a href="/anime_tv/">Аниме</a>
  page.appendItem(PREFIX + ':browse:/anime_tv:Аниме', 'directory', {
    title: 'Аниме',
  });
  // [... document.getElementsByClassName('hm-right fx-1')[1].children].forEach(element => {
  //   href = element.getElementsByTagName('a')[0].textContent;
  //   title = element.getElementsByTagName('a')[0].textContent;
  //   console.log("page.appendItem(PREFIX + ':browse:"+ href + ":"+ title +"', 'directory', {title: '"+ title +"',});")
  //     });

  page.appendItem(PREFIX + ':browse:/anime_tv:Аниме TV', 'directory', {title: 'Аниме TV',});
  page.appendItem(PREFIX + ':browse:/anime_movie:Аниме Фильмы', 'directory', {title: 'Аниме Фильмы',});
  page.appendItem(PREFIX + ':browse:/anime_ova:Аниме OVA', 'directory', {title: 'Аниме OVA',});
  page.appendItem(PREFIX + ':browse:/anime_ona:Аниме ONA', 'directory', {title: 'Аниме ONA',});
  page.appendItem(PREFIX + ':browse:/japan_dorama:Японские Сериалы и Фильмы', 'directory', {title: 'Японские Сериалы и Фильмы',});
  page.appendItem(PREFIX + ':browse:/korea_dorama:Корейские Сериалы и Фильмы', 'directory', {title: 'Корейские Сериалы и Фильмы',});
  page.appendItem(PREFIX + ':browse:/china_dorama:Китайские Сериалы и Фильмы', 'directory', {title: 'Китайские Сериалы и Фильмы',});
  page.appendItem(PREFIX + ':browse:/dorama:Дорамы', 'directory', {title: 'Дорамы',});
  page.appendItem(PREFIX + ':browse:/shonen:Многосерийный сёнэн', 'directory', {title: 'Многосерийный сёнэн',});
  page.appendItem(PREFIX + ':browse:/xxx:18+', 'directory', {title: '18+',});
  page.appendItem(PREFIX + ':browse:/full:Законченные сериалы', 'directory', {title: 'Законченные сериалы',});
  page.appendItem(PREFIX + ':browse:/unclosed:Незаконченные сериалы', 'directory', {title: 'Незаконченные сериалы',});
  page.appendItem(PREFIX + ':browse:/animation:Мультфильмы', 'directory', {title: 'Мультфильмы',});
  page.appendItem(PREFIX + ':browse:/adubbing:Дубляж Анидаба', 'directory', {title: 'Дубляж Анидаба',});
});

function parser(a, c, e) {
  var d = '';
  var b = a.indexOf(c);
  0 < b && ((a = a.substr(b + c.length)), (b = a.indexOf(e)), 0 < b && (d = a.substr(0, b)));
  return d;
}

function safeJsonStringify(obj, depth, maxDepth) {
  depth = depth || 0;
  maxDepth = maxDepth || 10;

  if (depth > maxDepth) {
      console.warn('Превышена максимальная глубина вложенности. Возможно, есть циклические ссылки.');
      return '"Превышена максимальная глубина"';
  }

  try {
      return JSON.stringify(obj, function(key, value) {
          if (typeof value === 'object' && value !== null) {
              return safeJsonStringify(value, depth + 1, maxDepth);
          }
          return value;
      });
  } catch (error) {
      console.error('Ошибка сериализации JSON:', error.message);
      return '"Ошибка сериализации JSON"';
  }
}