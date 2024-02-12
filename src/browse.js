/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable no-var */

var popup = require('movian/popup');
var URLS = require('url').parse;
data = {};

function ScrapeList(href, pageHtml) {
  var returnValue = [];
  // content = document.getElementById("dle-content");
  content = pageHtml.dom.getElementById('dle-content');
  if (content) {
    content.getElementByClassName('th-item').forEach(function(e) {
      
      returnValue.push({
        url: URLS(e.getElementByTagName('a')[0].attributes.getNamedItem('href').value).pathname,
        title: e.getElementByClassName('th-title')[0].textContent,
      });
    });
    content.getElementByTagName('img').forEach(function(e, i) {
      
      log.d(URLS(e.attributes.getNamedItem('src').value).pathname);

      //var icon = e.attributes.getNamedItem('src');// || e.getElementByTagName('img')[0].attributes.getNamedItem('src');
      var icon = URLS(e.attributes.getNamedItem('src').value).pathname
      // log.d(!/^http.*/.test(icon.value));
      // icon = (/^http.*/.test(icon.value) ? icon.value : service.domain + icon.value);
      // log.d(icon)
      returnValue[i].icon = icon || LOGO;
    });
    content.getElementByClassName('maincont').forEach(function(e, i) {
      // returnValue[i].description = e.children[4].textContent || "";
    });
  }
  // endOfData = document.getElementsByClassName('navigation').length ? document.getElementsByClassName('pagesList')[0].children[document.getElementsByClassName('pagesList')[0].children.length - 2].nodeName !== 'A' : true
  // document.getElementsByClassName('pagination').length ? document.getElementsByClassName('pagination')[0].getElementsByTagName('a')[document.getElementsByClassName('pagination')[0].getElementsByTagName('a').length - 2].attributes.length > 1 : true
  // !document.getElementsByClassName('navibut')[0].children[1].getElementsByTagName('a').length
  returnValue.endOfData = pageHtml.dom.getElementByClassName('navigation').length ? pageHtml.dom.getElementByClassName('navigation')[0].children[pageHtml.dom.getElementByClassName('navigation')[0].children.length - 1].nodeName !== 'a' : true;
  //   if (pageHtml.dom.getElementByClassName('nnext').length !== 0) {
  //     returnValue.endOfData = !pageHtml.dom.getElementByClassName('nnext')[0].getElementByTagName('a').length;
  //   } else returnValue.endOfData = true;
  return returnValue;
}

function populateItemsFromList(page, list) {
  log.d({
    function: 'populateItemsFromList',
    list: list,
  });
  for (i = 0; i < list.length; i++) {
    page.appendItem(PREFIX + ':moviepage:' + JSON.stringify(list[i]), 'video', {
      title: list[i].title,
      description: list[i].description,
      icon: service.domain + list[i].icon,
    });
    page.entries++;
  }
}
exports.list = function(page, params) {
  page.loading = true;
  page.metadata.logo = LOGO;
  page.metadata.title = params.title;
  page.model.contents = 'grid';
  page.type = 'directory';
  page.entries = 0;
  log.d('exports.list');
  log.d(params);
  log.d('params.args:' + params.args);
  var nextPage = 1;

  function loader() {
    log.d({
      'params.page': params.page,
      'params.href': params.href,
    });
    url = params.page ? params.href + params.page : params.href + '/';
    log.d('url='+ service.domain + url); // http://getmovie.cc/serials-anime/page/2/
    api.call(page, service.domain + url, null, function(pageHtml) {
      list = ScrapeList(url, pageHtml);
      populateItemsFromList(page, list);
      nextPage++;
      params.page = '/page/' + nextPage + '/';
      page.haveMore(list.endOfData !== undefined && !list.endOfData);
    });
  }
  loader();
  page.asyncPaginator = loader;
};

function trailer(page, link) {
  log.d({
    function: 'trailer',
    data: data,
  });
  // page.appendItem("", "separator", {
  //   title: "\u0422\u0440\u0435\u0439\u043b\u0435\u0440:"
  // });
  page.appendItem('youtube:search:' + data.title_en + ' ' + (data.year || ''), 'directory', {
    title: '\u043d\u0430\u0439\u0442\u0438 \u043d\u0430 YouTube',
  });
  page.appendItem(link.replace('/embed/', '/watch?v='), 'directory', {
    title: 'Trailer YouTube',
  });
}


function yohoho(title) {
  try {
    var responseText = http.request('https://ahoy.yohoho.cc/', {
      debug: 1,
      headers: {
        // "origin": "http://yohoho.cc",
        // "accept-encoding": "gzip, deflate, br",
        // "accept-language": "en-US,en;q=0.9,ru;q=0.8",
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'http://yohoho.cc',
        'Referer': 'http://yohoho.cc/',
        'User-Agent': UA,
        // "authority": "4h0y.yohoho.cc",
      },
      postdata: {
        title: title,
        player: 'moonwalk,hdgo,iframe,newvideo,kodik,allserials,trailer,torrent,videocdn',
      },
    });
    return (returnValue = JSON.parse(responseText.toString()));
  } catch (error) {
    popup.notify('got error:' + error, 10);
  }
}

function showPlayersFolder(page, pageHtml) {
//   var Players_data = {
//     "players": {
//         "sibnet": [
//             {"1": "url"},
//             {"2": "url"},
//             {"3": "url"}
//         ],
//     "player2": [
//         {"название": "элемент4"},
//         {"название": "элемент5"}
//     ]
// }
// };
  try {
    // (http(s)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*) [1]=domen [0]=link [4]=href
    log.d({
      function: 'showPlayersFolder start',
      data: data,
      // html: console.log(pageHtml.text.toString())
    });
  players = {};

  
function parsePlayersFromHTML(dom) {
  dom.getElementByClassName('series-tab').forEach(function(tab) {
    if (tab.children.length){
    var host = require('url').parse(tab.children[0].attributes.getNamedItem('data').value).hostname;

    var titles = tab.children.map(function(item) {
        return item.textContent.trim();
    });

    var urls = tab.children.map(function(item) {
        return item.attributes.getNamedItem('data').value;
    });
    
    if (!players[host]) {
        players[host] = [];
    }
    
    for (var i = 0; i < titles.length; i++) {
        players[host].push({ title: titles[i], url: urls[i] });
      }

    }
  });
  return players;  
}

function getTitlesAndUrlsByHost(players, host) {
  if (players.hasOwnProperty(host)) {
      return players[host].map(function(item) {
          return { title: item.title, url: item.url };
      });
  } else {
      return [];
  }
}
if (data.tr){
if (!players['tr.anidub.com']) {
  players['tr.anidub.com'] = []; // Если у хоста нет записей, создаем пустой массив
}
players['tr.anidub.com'].push({title:'Torrent',url: data.tr })
}
var players = parsePlayersFromHTML(pageHtml.dom);

if (players['player.ladonyvesna2005.info']){
  var result = (http.request(players['player.ladonyvesna2005.info'][0].url));
  dom = html.parse(result).root
  var URLP = require('url').parse(players['player.ladonyvesna2005.info'][0].url);
  log.d(URLP);

  dom.getElementByClassName('series-tab').forEach(function(tab) {
    
    var host = 'player.ladonyvesna2005.info';
    if (!players[host]) {
      players[host] = [];
  } else players[host].splice(0, 1);

    
    var titles = tab.children.map(function(item) {
      return item.textContent.trim();
    });
    
    var urls = tab.children.map(function(item) {
      return item.attributes.getNamedItem('data').value;
    });
    
    // if (!players[host]) {
    //   players[host] = [];
    // }
    
    for (var i = 0; i < titles.length; i++) {
      console.log(URLP.protocol +'//'+ URLP.hostname + '/vid.php?v=/' + urls[i]);
      console.log('https://player.ladonyvesna2005.info/vid.php?v=/s2/008f7007a507e1bb922dd250e83d3cc9')
      players[host].push({ title: titles[i], url: URLP.protocol +'//'+ URLP.hostname + '/vid.php?v=/' + urls[i]});
    }

  });
  }

for (var host in players) {
  
    page.appendPassiveItem('separator', null, {title: host,});
    players[host].forEach(function(item) {
      if (service.meta){
        page.appendItem(item.url, 'video', {
          title: formatEpisodeNumber(item.title),
          description: data.description,
          icon: data.icon,//'tmdb:image:poster:/69Mmd2GTnkADlzvY7C2miA4WvQY.jpg'
        })//(/(http.*?tr.ani.*?htm[^"]+)/gm.exec(pageHtml.text) || [])[1];
//         filename: Name of the file.
// year: Year.
// title: Title of the video.
// season: Season number of TV Show.
// episode: Episode number of TV Show.
// imdb: IMDb ID of the video.
// duration: Duration of the video.
//title: (undefined == title_en ? title_ru : title_en) + ' S01' + 'E' + fix_0(file[i].title.match(/\d+/)[0])
        .bindVideoMetadata({title: formatTitle(data.title_en) + formatEpisodeNumber(item.title) +'.('+data.year+')'})

// obj.metadata.title:Озорная Такаги. Фильм
// obj.metadata.description:Такаги и Нисиката учатся в последнем классе средней школы, и у них есть как тревога, так и надежда на будущее. Летом последнего года обучения, за день до начала летних каникул, они находят котенка, которого называют Хана. Они решают сами позаботиться о котенке, пока не найдут его мать.
// obj.metadata.icon:tmdb:image:poster:/69Mmd2GTnkADlzvY7C2miA4WvQY.jpg
// obj.metadata.rating:84
// obj.metadata.duration:null
// obj.metadata.loading:0
// obj.metadata.source:themoviedb.org
// obj.metadata.tagline:
// obj.metadata.genre:комедия, мелодрама, мультфильм
// obj.metadata.icons:[prop directory {"tmdb:image:poster:/69Mmd2GTnkADlzvY7C2miA4WvQY.jpg"}]
// obj.metadata.backdrop:tmdb:image:backdrop:/t0voVZuqvQ0VlM2m45rVWZO5R52.jpg
// obj.metadata.backdrops:[prop directory {"tmdb:image:backdrop:/t0voVZuqvQ0VlM2m45rVWZO5R52.jpg", "tmdb:image:backdrop:/fJwJo9LIWsFC4P3gF1r9ADWYzdL.jpg", "tmdb:image:backdrop:/tSVfhT377oJAqz5gMDsIwQ2YzGc.jpg", "tmdb:image:backdrop:/5DRcAkH6Ho5a4cwjAY2TbK9v36c.jpg", "tmdb:image:backdrop:/m9K1ztZj4auWQKRxBYxjzjc9kI.jpg", "tmdb:image:backdrop:/jU1COKZO7M8TfXlIBZBPreVsPQo.jpg", "tmdb:image:backdrop:/b67ga6PXOD9F2LFHvKZdOFbs3ok.jpg", "tmdb:image:backdrop:/sWAAGVPz76mOd7Nr72I2xOcrSiG.jpg"}]
// obj.metadata.year:2022
// obj.metadata.rating_count:122

      } 
        else{ 
          page.appendItem(item.url, 'video', {
          title: formatTitle(data.title_en) + formatEpisodeNumber(item.title) +'.('+data.year+')',
          description: data.description,
          icon: service.domain+data.icon,
        }) 

    }
    });
}
    page.metadata.title = data.title;
    log.d(data);
  } catch (err) {
    log.e(err);
    console.log('Line #' + err.lineNumber);
    console.log(err.stack);
  }
}

function anidub_page(page, pageHtml) {
  log.p(anidub_page);
  log.p(data);
  data.title_ru = data.title.split('/')[0].split('[')[0].trim();
  log.p(data.title_ru);
  data.title_en = data.title.split('/')[1].split('[')[0].trim();
  log.p(data.title_en);
  data.title_jp = data.title_en.trim();
  data.year = (/(http.*?\/\/anidub.live\/xfsearch\/year\/(\d+)\/)">\d+<\/a>/.exec(pageHtml.text)|| [])[2];
  data.title = data.title + ' '+ data.year;
  data.tr = (/(http.*?tr.anidub.com\/[^"]+)/gm.exec(pageHtml.text) || [])[1];
  

  // players = yohoho((data.title_jp.trim() || data.title_en.trim() || data.title_jp.trim()) + ' ' + (data.year || ''));
  // log.p(players);
  // if (players) {
  // 	if (players.trailer) trailer(page, players.trailer.iframe);
  // 	// players.moonwalk.iframe -> HDRezka:moviepage: {DATA}
  // 	if (players.moonwalk && players.moonwalk.iframe) {
  // 		console.error(players.moonwalk.iframe);
  // 		data.url = players.moonwalk.iframe.replace('s://streamguard', '://moonwalk');
  // 		data.title = data.title_jp || data.title_en || data.title_jp;
  // 		page.appendItem('HDRezka:moviepage:' + JSON.stringify(data), 'directory', {
  // 			title: '[yo]- ' + data.title + ' на moonwalk'
  // 		});
  // 	}
  // 	//players.torrent.iframe
  // 	// if (players.torrent.iframe) {
  // 	// 	data.title = (data.title_jp || data.title_en || data.title_jp);
  // 	// 	page.appendItem('HDRezka:moviepage:' + JSON.stringify(data), "directory", {
  // 	// 		title: '[yo]- ' + data.title + " на торентах"
  // 	// 	});
  // 	// }
  // }
  showPlayersFolder(page, pageHtml);
}
// vyzov s url
// PREFIX:moviepage:url
exports.moviepage = function(page, mdata) {
  page.metadata.title = mdata.title;
  page.metadata.logo = data.icon;
  page.loading = true;
  page.type = 'directory';
/{"url":"/.test(mdata) ? (data = JSON.parse(mdata)) : (data.url = mdata);
log.d({
  function: 'moviepage',
  data: data,
});
page.metadata.logo = data.icon;
// delaem zapros na stranicu
api.call(page, service.domain+data.url, null, function(pageHtml) {
  if (pageHtml.dom.getElementByClassName('video-box')[0] !== undefined) {
    anidub_page(page, pageHtml);
  } else console.error('##################### net plaera?');
});
page.loading = false;
};

/**
 * Форматирует номер серии в формате "E01" (если номер меньше 10, то добавляет ведущий ноль)
 * @param {string} str - Строка, содержащая номер серии
 * @returns {string} Отформатированный номер серии в формате "E01"
 */
function formatEpisodeNumber(str) {
  // Поиск номера и слова "серия" в любой последовательности
  var match = str.match(/(?:.ерия\s+(\d+))|(?:(\d+)\s+.ерия)/i);

  // Если есть совпадение, то формируем результат
  if (match) {
      // Получаем номер серии и добавляем ведущий нуль, если нужно
      var num = match[1] ? match[1] : match[2];
      return 'E' + (num < 10 ? '0' + num : num);
  } else {
      // Иначе возвращаем исходную строку
      return str;
  }
}

/**
 * Форматирует заголовок эпизода
 * @param {string} title - Исходный заголовок эпизода
 * @returns {string} Отформатированный заголовок эпизода
 */
function formatTitle(title) {
  // Удаление года из строки
  title = title.replace(/\(\d{4}\)/, '');
  // Замена 'TV-' на 'S' и добавление ведущего нуля к цифре
  title = title.replace(/TV-(\d+)/, function(match, p1) {
    return ' S' + ('0' + p1).slice(-2);
  });
  // Замена всех пробелов на точки
  title = title.replace(/\s+/g, '.');
  // Если нет сезона, добавляем "S01"
  if (!/S\d+/.test(title)) {
    title += '.S01';
  }
  return title;
}