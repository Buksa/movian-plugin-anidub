/*
 *  anidub  - Movian Plugin
 *
 *  Copyright (C) 2014-2015 Buksa
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
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
//ver 2.1.2
// Import required modules.
//var XML = require('showtime/xml');
var page = require('showtime/page');
var http = require('showtime/http');
var html = require('showtime/html');
var service = require('showtime/service');
var settings = require('showtime/settings');
var popup = require('native/popup');
var plugin = JSON.parse(Plugin.manifest);
var PREFIX = plugin.id;
var BASE_URL = "http://online.anidub.com";
var logo = Plugin.path + "logo.png";
//tos
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
tos += "plugin is not licensed, approved or endorsed by any online resource\n ";
tos += "proprietary. Do you accept this terms?";

// Service creation
service.create(plugin.title, PREFIX + ":start", "video", true, Plugin.path + "logo.png");
/*******************************************************************************
 * // Settings
 ******************************************************************************/
settings.globalSettings(plugin.id, plugin.title, Plugin.path + "logo.png", plugin.synopsis);
// General settings
settings.createDivider("General");
settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin):", false, function(v) {
	service.tosaccepted = v;
});
// Enable / disable debug setting
settings.createBool("debug", "Debug", false, function(v) {
	service.debug = v;
});


/*******************************************************************************
 * // Miscellaneous functions
 ******************************************************************************/
/**
 * regExpExec returns the regexp or an array with 2 empty strings
 * <p>
 * This function returns the regexp array or an array with two elements
 * containing empty strings. For use when parsing working with parsed xml data
 * in order to avoid an error if we lack a match. But also to avoid using tons
 * of if(regexp_result == null) statements everywhere.
 * <p>
 * Param and return values.
 *
 * @param expression
 *            the regular expression
 * @param modifier
 *            regexp modifier
 * @param string
 *            with content to match against
 * @return Returns the matched element or an empty string
 */

function regExpExec(expression, modifier, string) {
	var returnValue;
	returnValue = new RegExp(expression, modifier).exec(string);
	returnValue = (returnValue === null) ? [null, ""] : returnValue;
	return returnValue;
}

function getTitles(response, callback) {
	var urlData, data, listData, regExp;
	var returnValue = [];

	if (response.statuscode === 200) {
		var dom = html.parse(response)
		// Extract all the content listings off the requested url
		var content = dom.root.getElementById('dle-content');
		if (content) {
			var items = [];

			var elements = content.getElementByClassName("title")
			for (i = 0; i < elements.length; i++) {
				element = elements[i];
				items.push({
					url: element.getElementByTagName("a")[0].attributes.getNamedItem("href").value,
					title: element.getElementByTagName("a")[0].textContent
				});
			}

			var elements = content.getElementByClassName("poster_img")
			for (i = 0; i < elements.length; i++) {
				element = elements[i];
				items[i].icon = element.getElementByTagName("img")[0].attributes.getNamedItem("data-original").value;
			}
			var elements = content.getElementByClassName("maincont")
			for (i = 0; i < elements.length; i++) {
				element = elements[i];
				items[i].description = element.children[4].textContent
			}
		
		
		
		returnValue = items	//code
		}
	}
	//if (response.statuscode === 200) {
	//	// Extract all the content listings off the requested url
	//	data = new RegExp('dle-content([\\s\\S]+)END CONTENT', 'g').exec(response.toString())[1];
	//	if (data === null || response.statuscode === 404) {
	//		var returnValue;
	//		var tmp = [null, null, null, null, null, null, null];
	//		returnValue.push(tmp);
	//
	//		return returnValue;
	//	}
	//	regExp = new RegExp('newstitle([\\s\\S]+?)newsfoot', 'g');
	//	i = 0;
	//	while ((listData = regExp.exec(data)) !== null) {
	//		var tmp = {
	//			url: regExpExec('title[\\s\\S]+?href="http:\\/\\/online.anidub.com([^"]+).*?>([^<]+)', 'g', listData[1])[1],
	//			title: regExpExec('title[\\s\\S]+?href="([^"]+).*?>([^<]+)', 'g', listData[1])[2],
	//			year: regExpExec("xfsearch\\/(\\d{4})", 'g', listData[1])[1],
	//			icon: regExpExec("data-original=\"([^\"]+)", 'g', listData[1])[1],
	//			description: regExpExec('description">[\\s\\S]+?">([^<]+)', 'g', listData[1])[1],
	//			genre: regExpExec('<small>([^<]+)', 'g', listData[1])[1],
	//			rating: parseFloat(regExpExec('-star"><\\/span>([^<]+)', 'g', listData[1])[1]) * 10
	//		}
	//		returnValue.push(tmp);
	//		i++;
	//	}
	//}

	p('getTitles return:' + dump(returnValue))
	if (callback) callback(returnValue);
	return returnValue;
}



function getTitleInfo(response) {
	var url, urlData, data;
	urlData = response.toString();
	data = new RegExp('newstitle([\\s\\S]+?)newsfoot', 'g').exec(urlData);
	if (data === null) {
		return 0;
	}
	
	var tmp = {
		//url: regExpExec('title[\\s\\S]+?href="http:\\/\\/online.anidub.com([^"]+).*?>([^<]+)', 'g', data[1])[1],
		title: regExpExec("titlfull.*?> ([^<]+)", 'g', data[1])[1],
		year: regExpExec("xfsearch\\/(\\d{4})", 'g', data[1])[1],
		icon: regExpExec('image_src.*?href="([^"]+)', 'g', data[1])[1],
		description: regExpExec('description">([\\s\\S]+?)<div', 'g', data[1])[1],
		genre: regExpExec('<small>([^<]+)', 'g', data[1])[1],
		rating: parseFloat(regExpExec('-star"><\\/span>([^<]+)', 'g', data[1])[1]) * 10
	}
	p('getTitleInfo return :\n' + dump(tmp));

	return (tmp);
}

function p(message) {
	if (service.debug == '1') print(message)
}

function e(ex) {
	console.log(ex);
	console.log("Line #" + ex.lineNumber);
}

function dump(arr, level) {
	var dumped_text = "";
	if (!level) level = 0;
	//The padding given at the beginning of the line.
	var level_padding = "";
	for (var j = 0; j < level + 1; j++) level_padding += "    ";
	if (typeof(arr) == 'object') { //Array/Hashes/Objects
		for (var item in arr) {
			var value = arr[item];
			if (typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value, level + 1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = arr;
	}
	return dumped_text;
}
/*******************************************************************************
 * // Pages
 ******************************************************************************/

function start_block(page, href, title) {
	
	page.appendItem("", "separator", {
		title: title
	});
	var response = http.request(BASE_URL + href, {
		debug: service.debug
	})
	var titleList = getTitles(response);
	
	for (i = 0; i < 9; i++) {
		item = titleList[i];
		page.appendItem(PREFIX + ":mediaInfo:" + item.url, "video", {
			title: item.title,
			year: parseInt(item.year, 10),
			rating: parseInt(item.rating, 10),
			genre: item.genre,
			description: item.description ? item.description : item.title,
			icon: item.icon
		});
	}
	
	page.appendItem(PREFIX + ":index:" + href + ":" + title, "directory", {
		title: "Дальше больше ►"
	});
	
}
/*******************************************************************************
 * // Page PREFIX:start
 ******************************************************************************/
new page.Route(PREFIX + ":start", function(page) {
	if (!service.tosaccepted)
		if (popup.message(tos, true, true)) service.tosaccepted = 1;
		else page.error("TOS not accepted. plugin disabled");
	page.metadata.title = plugin.title;
	page.metadata.logo = Plugin.path + "logo.png";
	page.model.contents = 'grid';
	page.loading = true;
	respond = http.request(BASE_URL, {
		method: 'GET',
		noFail: true,
		debug: service.debug
	});

	if (respond.statuscode === 503) {
		match = /name="jschl_vc" value="(\w+)"/.exec(respond);
		jschl_vc = match !== null ? match[1] : "";
		match = /name="pass" value="([^\n]+?)"/.exec(respond);
		pass = match !== null ? match[1] : "";
		match = /setTimeout\(function\(\)\{\s+(var t,r,a,f[^\n]+?\r?\n[\s\S]+?a\.value =[^\n]+?)\r?\n/.exec(respond);
		result = match !== null ? match[1] : "";
		result = result.replace(/a\.value =(.+?) \+ .+?;/g, "$1");
		result = result.replace(/\s{3,}[a-z](?: = |\.).+/g, "");
		jschl_answer = (+(eval(result)) + +BASE_URL.split("/")[2].length);
		setTimeout(function() {
			respond = http.request('http://online.anidub.com/cdn-cgi/l/chk_jschl?jschl_vc=' + jschl_vc + '&pass=' + pass + '&jschl_answer=' + jschl_answer, {
				debug: service.debug,
				method: 'GET',
				headers: {
					'Referer': BASE_URL,
					//'User-Agent': USER_AGENT
				},
				noFail: true
			})
		}, 4000);
	}


/*	
	//		response = http.request('http://api.anidub-app.ru/anime/list?limit=50&page=1&category=1', {
	//		debug: service.debug,
	//			header: {
	//				'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
	//			}
	//		})
	//json = JSON.parse(response.toString())
	//		page.appendItem("", "separator", {
	//		title: 'Anime'
	//	});
	//		p(json.Responce.Anime.length)
	//	//	
	//	//var titleList = getTitles(response);
	//	for (i = 0; i < json.Responce.Anime.length; i++){
	//		item = json.Responce.Anime[i]
	//			page.appendItem(PREFIX + ":mediaInfo:" + item.Id, "video", {
	//			title: item.Title,
	//			year: item.Information.Year,
	//			rating: parseInt(item.Rating.Grade, 10),
	//			genre: item.Information.Genre,
	//			description: item.Information.Description,
	//			icon: item.Image.Url
	//		});
	//}
	*/
	start_block(page, '/anime_tv/anime_ongoing/', 'Аниме Ongoing')
	start_block(page, '/full/', 'Аниме FULL')
	start_block(page, '/anime_tv/', 'Аниме TV')
	start_block(page, '/anime_movie/', 'Аниме Фильмы')
	start_block(page, '/anime_ova/', 'Аниме OVA')
	start_block(page, '/dorama/', 'Дорамы')
	/*page.appendItem(PREFIX + ":index:/movies/:Filmer SD", "directory", {
	//	title: "Visa mer ►"
	//});
	//page.appendItem(PREFIX + ":indexByGenre:/movies/:Filmer SD sorterat efter genre", "directory", {
	//	title: "Visa efter genre ►"
	});*/
	page.type = "directory";
	page.loading = false;
});

/*******************************************************************************
 * // Page PREFIX:index:path:title index for given paths
 * http://online.anidub.com/anime_tv/anime_ongoing/page/2/
 ******************************************************************************/
new page.Route(PREFIX + ":index:([^:]+):(.*)", function(page, path, title) {
	var urlData, offset;

	page.metadata.title = title;
	offset = 1;

	function loader() {
		setTimeout(function() {
			p('loader start')

			urlData = http.request(BASE_URL + path + "page/" + offset + '/', {
				method: 'GET',
				debug: service.debug,
				noFail: true
			})

			getTitles(urlData, function(titleList) {
				for (var i = 0; i < titleList.length; i++) {
					item = titleList[i]
					page.appendItem(PREFIX + ":mediaInfo:" + item.url, "video", {
						title: item.title,
						year: parseInt(item.year, 10),
						rating: parseInt(item.rating, 10),
						genre: item.genre,
						description: item.description ? item.description : item.title,
						icon: item.icon
					});
				}

				offset++;
				page.haveMore(true);
			});

			if (!/nnext.*href.*title=.Вперед/.test(urlData)) {
				page.haveMore(false)
				return
			}
			p('loader stop')
		}

		, 3000);

	}
	page.type = "directory";
	page.asyncPaginator = loader;
	loader();
});
/*******************************************************************************
 * // Page PREFIX:mediaInfo
 ******************************************************************************/
new page.Route(PREFIX + ":mediaInfo:(.*)", function(page, path) {
	var titleInfo = {};
	page.metadata.logo = Plugin.path + "logo.png";
	p(path)
	page.loading = true;
	urlData = http.request(path, {
		method: 'GET',
		noFail: true,
		debug: service.debug
	});
	
	var dom = html.parse(urlData);
	page.metadata.title = dom.root.getElementByClassName('titlfull')[0].textContent.trim()
	p(dom.root.getElementByClassName("poster_img")[0].getElementByTagName("img")[0].attributes.getNamedItem("src").value)
	var entries = dom.root.getElementByClassName("maincont")[0].getElementByClassName("reset")[0].getElementByTagName('li')
	for (var i = 0; i< entries.length; i++){
		if (entries[i].children.length > 1){
		//if (entries[i].getElementByTagName('b')[0].textContent === 'Год: ') {
		//	p(entries[i].getElementByTagName('a')[0].textContent)
		//	
		//}
		if (entries[i].getElementByTagName('b')[0].textContent === 'Жанр: ') {
			p(entries[i].getElementByTagName('span')[0].textContent)
			
		}
		}
	}
	
	
	
	//var entries = dom.root.getElementByTagName("option");
	//p(entries)
	//	    	for (var i = 0; i< entries.length; i++)
	//    	{
	//		title = entries[i].textContent
	//		url = entries[i].attributes.getNamedItem("value").value
	//		
	//		page.appendItem(PREFIX + ':play:' + encodeURIComponent(title) + ':' + encodeURIComponent(url), 'video', {
	//			title: url.split('|')[1]+'-'+title,
	//			icon: titleInfo.icon
	//		});
	//    	}
	// Get the information part we need from the url with genre etc. This is
	// done for both movies and series.
	urlData = urlData.toString()
	//data = new RegExp('newstitle([\\s\\S]+?)newsfoot', 'g').exec(urlData)[1];
	
	titleInfo = getTitleInfo(urlData);
	p('xxxxxxxxxxxxxxxxx')
	p('titleInfo:'+dump(titleInfo))
	player = urlData //regExpExec('<div class="players">([\\S\\s]+?)<div id="banner_post"', 'g', data)[1]
	// vk players
	if (/value=.*?oid=(.\d+&id=\d+)&hash=[a-f\d]+.*?.*?>(.*?)</.test(player)) {
		page.appendItem("", "separator", {
			title: 'Основной плеер VK'
		});
		regExp = /value=.*?oid=(-\d+&id=\d+)&hash=[a-f\d]+.*?.*?>(.*?)</g;
		while (((listData = regExp.exec(player)) !== null)) {
			page.appendItem(PREFIX + ':play:' + encodeURIComponent(listData[1]) + ':' + encodeURIComponent(listData[2]), 'video', {
				title: '[VK]' + listData[2],
				icon: titleInfo.icon
			});
		}
	} else
	if (/src='.*?oid=(.\d+&id=\d+)&hash=[a-f\d]+/.test(player)) {
		page.appendItem("", "separator", {
			title: 'Основной плеер VK_S'
		});
		regExp = /src='.*?oid=(.\d+&id=\d+)&hash=[a-f\d]+/g;
		while (((listData = regExp.exec(player)) !== null)) {
			page.appendItem(PREFIX + ':play:' + encodeURIComponent(listData[1]) + ':' + encodeURIComponent(titleInfo.title), 'video', {
				title: '[VK_S]' + titleInfo.title,
				icon: titleInfo.icon
			});
		}
	}
	//mw players
	
	if (/value=.(.*?video\/[a-f\d]+\/iframe).*?>(.*?)</.test(player)) {
		page.appendItem("", "separator", {
			title: 'Основной плеер MW'
		});
		regExp = /value=.(.*?video\/[a-f\d]+\/iframe).*?>(.*?)</g;
		while (((listData = regExp.exec(player)) !== null)) {
			page.appendItem(PREFIX + ':play:' + encodeURIComponent(listData[1]) + ':' + encodeURIComponent(listData[2]), 'video', {
				title: '[MW]' + listData[2],
				icon: titleInfo.icon
			});
		}
	} else
	if (/src=.(.*?video\/[a-f\d]+\/iframe)/.test(player)) {
		page.appendItem("", "separator", {
			title: 'Основной плеер MW_S'
		});
		regExp = /src=.(.*?video\/[a-f\d]+\/iframe)/g;
		while (((listData = regExp.exec(player)) !== null)) {
			page.appendItem(PREFIX + ':play:' + encodeURIComponent(listData[1]) + ':' + encodeURIComponent(titleInfo.title), 'video', {
				title: '[MW_S]' + titleInfo.title,
				icon: titleInfo.icon
			});
		}
	}
	//anidub own player
	if (/value="(http:\/\/player.adcdn.tv\/embed[^|]+).*?>([^<]+)/.test(player)) {
		page.appendItem("", "separator", {
			title: 'Anidub плеер'
		});
		regExp = /value=.(http:\/\/player.adcdn.tv\/embed[^|]+).*?>([^<]+)/g;
		while (((listData = regExp.exec(player)) !== null)) {
			page.appendItem(PREFIX + ':play:' + encodeURIComponent(listData[1]) + ':' + encodeURIComponent(listData[2]), 'video', {
				title: listData[2],
				icon: titleInfo.icon
			});
		}
	} else
	if (/src='.(http:\/\/player.adcdn.tv\/embed[^|]+).*?>([^<]+)/g.test(player)) {
		page.appendItem("", "separator", {
			title: 'Anidub плеер'
		});
		regExp = /src='.(http:\/\/player.adcdn.tv\/embed[^|]+).*?>([^<]+)/g;
		while (((listData = regExp.exec(player)) !== null)) {
			page.appendItem(PREFIX + ':play:' + encodeURIComponent(listData[1]) + ':' + encodeURIComponent(titleInfo.title), 'video', {
				title: titleInfo.title,
				icon: titleInfo.icon
			});
		}
	}

	page.type = "directory";
	page.loading = false;
});


/*******************************************************************************
 * //Page PREFIX:play
 ******************************************************************************/
new page.Route(PREFIX + ":play:([^:]+):(.*)", function(page, url, title) {
	var canonicalUrl = PREFIX + ":play:" + url + ":" + title;
	page.loading = true;
	p(canonicalUrl)
	title = decodeURIComponent(title);
	url = decodeURIComponent(url);
	//titleInfo = JSON.parse(titleInfo);
	var videoparams = {
		canonicalUrl: canonicalUrl,
		no_fs_scan: true,
		//title: data.eng_title,
		title: title,
		//year: data.year ? data.year : 0,
		//season: data.season ? data.season : -1,
		//episode: data.episode ? data.episode : -1,
		sources: [{
				url: []
			}
		],
		subtitles: []
	};
	//vk.com
	if (/-\d+&id=\d+/.test(url)) {
		p(url)
		page.metadata.title = 'VK' + title;

		//http://vk.com/video.php?act=a_flash_vars&vid=-100541044_171621957
		vars = http.request('http://vk.com/video.php', {
			method: 'GET',
			debug: service.debug,
			args: {
				'act': 'a_flash_vars',
				'vid': url.replace('&id=', '_')
			}
		}).toString();
		p(vars)
		vars = JSON.parse(vars)
		p(vars)
		if (vars.error) {
			page.metadata.title = vars.error.error_msg;
			popup.notify(vars.error.error_msg + "\nThis video has been removed from public access.", 3);
		} else {
			page.metadata.backgroundAlpha = 0.8;
			p( !! vars.timeline_thumbs_jpg)
			if (vars.timeline_thumbs_jpg) {
				page.metadata.background = vars.timeline_thumbs_jpg.split(',')[0]
			}
			for (key in vars) {
				if ("cache240" == key || "cache360" == key || "cache480" == key || "cache720" == key ||
					"url240" == key || "url360" == key || "url480" == key || "url720" == key) {
					videoparams.icon = 'http://static3.anidub.com/online/poster/ecc4f17f99.jpg'
					videoparams.sources = [{
							url: vars[key],
							mimetype: "video/quicktime"

						}
					];
					video = "videoparams:" + JSON.stringify(videoparams);
					page.appendItem(video, "video", {
						title: "[" + key.match(/\d+/g) + "]-" + title,
						duration: vars.duration,
						icon: vars.jpg
					});
				}
			}
		}
	}
	if (/http:\/\/.+?iframe/.test(url)) {
		p('Open url:' + url.match(/http:\/\/.+?iframe/));
		var hdcdn = url.match(/http:\/\/.+?iframe/).toString();
		v = http.request(hdcdn, {
			method: 'GET',
			headers: {
				'Referer': BASE_URL
			}
		}).toString();
		p("source:" + v);
		page.metadata.title = /player_osmf\('([^']+)/.exec(v)[1];
		var postdata = {};
		postdata = /post\('\/sessions\/create_session', \{([^\}]+)/.exec(v)[1];
		p(postdata);
		postdata = {
			partner: /partner: (.*),/.exec(v)[1],
			d_id: /d_id: (.*),/.exec(v)[1],
			video_token: /video_token: '(.*)'/.exec(v)[1],
			content_type: /content_type: '(.*)'/.exec(v)[1],
			access_key: /access_key: '(.*)'/.exec(v)[1],
			cd: 0
		};
		p(postdata);
		var ContentData = Duktape.enc('base64', /(\d{10}\.[a-f\d]+)/.exec(v)[1])
		json = JSON.parse(http.request(hdcdn.match(/http:\/\/.*?\//) + 'sessions/create_session', {
			debug: true,
			headers: {
				'Referer': url,
				'Host': 'moonwalk.cc',
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:42.0) Gecko/20100101 Firefox/42.0',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'Content-Data': ContentData,
				'X-Requested-With': 'XMLHttpRequest',
			},
			postdata: postdata
		}));

		result_url = 'hls:' + json.manifest_m3u8;
		videoparams.sources = [{
				url: 'hls:' + json.manifest_m3u8
			}
		];
		video = "videoparams:" + JSON.stringify(videoparams);
		page.appendItem(video, "video", {
			title: "[Auto]-" + title
		});
		var video_urls = http.request(json.manifest_m3u8).toString();
		p(video_urls);

		regExp = /RESOLUTION=([^,]+)[\s\S]+?(http.*)/g
		while (((match = regExp.exec(video_urls)) !== null)) {
			p(match.toString())
			videoparams.sources = [{
					url: 'hls:' + match[2]
				}
			]
			video = "videoparams:" + JSON.stringify(videoparams)
			page.appendItem(video, "video", {
				title: "[" + match[1] + "]-" + title
			});
		}

	}
	if (/player.adcdn.tv/.test(url)) {
		//url = url.replace('embed', 'i')
		v = http.request(url, {
			method: 'GET',
			headers: {
				'Referer': BASE_URL
			}
		}).toString();
		p(v)
		videoparams.sources = [{
				url: 'hls:' + /file: '([^']+)/.exec(v)[1]
			}
		]
		video = "videoparams:" + JSON.stringify(videoparams)
		page.appendItem(video, "video", {
			title: title,
			icon: (/image: '([^']+)/.test(v)[1] ? /image: '([^']+)/.exec(v)[1] : logo)
		});

		//code


	}

	page.appendItem("search:" + title.split('-')[0], "directory", {
		title: 'Try Search for: ' + title
	});
	page.type = "directory";
	page.contents = "contents";
	page.metadata.logo = Plugin.path + "logo.png";
	page.loading = false;
});
/*******************************************************************************
 * //Page Searcher
 ******************************************************************************/
page.Searcher(PREFIX + " - Videos", Plugin.path + "logo.png", function(page, query) {

	page.entries = 0;
	page.type = "directory";
	page.loading = true;

	query = escape(query);

	try {
		console.log("Search anidub Videos for: " + query);
		var v = http.request('http://online.anidub.com/index.php?do=search', {
			debug: service.debug,
			postdata: {
				do :'search',
				subaction: 'search',
				search_start: '1',
				full_search: '1',
				result_from: '1',
				story: query,
				titleonly: '3',
				replyless: '0',
				replylimit: '0',
				searchdate: '0',
				beforeafter: 'after',
				sortby: 'date',
				resorder: 'desc',
				showposts: '0',
				'catlist[]': '0'
			}
		});

		var dom = html.parse(v);

		var items = [];

		var elements = dom.root.getElementByClassName("title")
		for (i = 0; i < elements.length; i++) {
			element = elements[i];
			items.push({
				href: element.getElementByTagName("a")[0].attributes.getNamedItem("href").value,
				title: element.getElementByTagName("a")[0].textContent
			});

		}

		var elements = dom.root.getElementByClassName("poster_img")
		for (i = 0; i < elements.length; i++) {
			element = elements[i];
			items[i].icon = element.getElementByTagName("img")[0].attributes.getNamedItem("src").value;
		}


		for (i = 0; i < items.length; i++) {
			item = items[i];
			page.appendItem(PREFIX + ":mediaInfo:" + item.href, 'video', {
				title: item.title,
				icon: item.icon
			})
			page.entries++
		}

		p('items:' + dump(items))
	} catch (err) {
		console.log('anidub - Ошибка поиска: ' + err);
		e(err);
	}
	page.loading = false;
});