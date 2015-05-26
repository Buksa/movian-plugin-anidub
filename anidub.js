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
//ver 1.1.2
var http = require('showtime/http');
var html = require('showtime/html');

(function(plugin) {
	var plugin_info = plugin.getDescriptor();
	var PREFIX = plugin_info.id;
	// bazovyj adress saita
	var BASE_URL = 'http://online.anidub.com';
	//logo
	var logo = plugin.path + 'logo.png';
	var USER_AGENT = 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:16.0) Gecko/20120815 Firefox/16.0';

	function setPageHeader(page, title) {
		if (page.metadata) {
			page.metadata.title = PREFIX + ' : ' + title;
			page.metadata.logo = logo;
		}
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	}
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
	// Register a service (will appear on home page)
	var service = plugin.createService("AniDub", PREFIX + ":start", "video", true, logo);
	//settings
	var settings = plugin.createSettings("AniDub", logo, "Online Videos");
	//	settings.createInfo("info", logo, "Developed by " + plugin_info.author + ". \n");
	settings.createDivider('Settings:');
	settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin):", false, function(v) {
		service.tosaccepted = v;
	});
	settings.createDivider('Browser Settings');
	settings.createInfo("info2", '', "Чем меньше значение - тем быстрее подгрузка списков в директориях с большим количеством файлов, но тем больше вероятность ошибки сервера. \n");
	settings.createInt("Min.Delay", "Интервал запросов к серверу (default: 3 сек)", 3, 1, 10, 1, 'сек', function(v) {
		service.requestMinDelay = v;
	});

	settings.createBool("Show_finished", "Показывать сообщение о достижении конца директории", true, function(v) {
		service.showEndOfDirMessage = v;
	});
	settings.createBool("debug", "Debug", false, function(v) {
		service.debug = v;
	});

	//First level start page

	function start_block(page, href, title) {
		page.appendItem("", "separator", {
			title: new showtime.RichText(title)
		});
		p(listScraper(BASE_URL + href));
		var list = listScraper(BASE_URL + href, false);
		for (var i = 0; i < list.length; i++) {
			page.appendItem(PREFIX + ":page:" + escape(list[i].title) + ":" + escape(list[i].url) + ":" + escape(list[i].image), "video", {
				title: new showtime.RichText(list[i].title),
				description: list[i].description ? new showtime.RichText(list[i].description) : list[i].title,
				icon: new showtime.RichText(list[i].image)
			});
		}
		page.appendItem(PREFIX + ":browse:" + href + ":" + title, "directory", {
			title: ('Дальше больше') + ' ►',
			icon: logo
		});
	}

	function startPage(page) {
		if (!service.tosaccepted)
			if (popup.message(tos, true, true)) service.tosaccepted = 1;
			else page.error("TOS not accepted. plugin disabled");
		page.metadata.backgroundAlpha = 0.5;
		page.loading = true;
		var list = '';
		
		start_block(page, '/anime_tv/anime_ongoing/', 'Аниме Ongoing')
		start_block(page, '/anime_tv/', 'Аниме TV')
		start_block(page, '/anime_movie/', 'Аниме Фильмы')
		start_block(page, '/anime_ova/', 'Аниме OVA')
		start_block(page, '/dorama/', 'Дорамы Онлайн')
		
		page.appendItem(PREFIX + ":select:жанрам", "directory", {
			title: new showtime.RichText('<font size="5" color="ffffff">' + "Аниме по жанрам" + '</font>'),
			icon: plugin.path + "logo.png"
		});
		page.appendItem(PREFIX + ":select:даберам", "directory", {
			title: new showtime.RichText('<font size="5" color="ffffff">' + "Аниме по даберам" + '</font>'),
			icon: plugin.path + "logo.png"
		});
		page.appendItem(PREFIX + ":select:годам", "directory", {
			title: new showtime.RichText('<font size="5" color="ffffff">' + "Аниме по годам" + '</font>'),
			icon: plugin.path + "logo.png"
		});
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
		page.metadata.logo = plugin.path + "logo.png";
		page.metadata.title = 'AniDub';
		//page.metadata.background = 'http://online.anidub.com/templates/Anidub_online/img/bg_1.jpg';
	}

	function browseListPage(page, genre, genreName) {
		var respond = '';
		var url = '';
		if (!genre || genre == 'all') {
			//make genre list
			p(BASE_URL + '/catalog/');
			respond = http.request(BASE_URL + '/catalog/', {
				method: 'GET',
				headers: {
					'User-Agent': USER_AGENT
				}
			}).toString();
			var re = /<ul class="cats">([\s\S]*)<\/ul>/; //finding menu
			var menuHTML = respond.match(re)[1];
			re = /<li><a href="\/([\S]*)\/">(\S*)<\/a><\/li>/g;
			var menu = re.exec(menuHTML);
			while (menu) {
				p("M:" + menu);
				page.appendItem(PREFIX + ':movies:' + menu[1] + ':' + menu[2], 'directory', {
					title: menu[2],
					icon: logo
				});
				menu = re.exec(menuHTML);
			}
		} //endif
		//genre defined
		else {
			var pageNumber = 1;
			var list;
			var requestFinished = true,
				lastRequest = 0;
			var loader = function() {
				if (!requestFinished) {
					p("Request not finished yet, exiting");
					return false;
				}
				var delay = countDelay(service.requestMinDelay * 1000, lastRequest);
				var loadItems = function() {
					try {
						lastRequest = Date.now();
						requestFinished = false;
						p(Date.now())
						p("Time to make some requests now!");
						//make request here
						p("L:" + BASE_URL + genre + "page/" + pageNumber + '/');
						list = listScraper(BASE_URL + genre + "page/" + pageNumber + "/", false);
						pageNumber++;
						requestFinished = true;
						p("Request finished!");
						return list;
					} catch (err) {
						//end of pages
						if (err.message.match('HTTP error: 404')) {
							popup.notify("Достигнут конец директории.", 5);
							return false;
						}
						//most probably server overload
						else {
							popup.notify("Подгрузка не удалась. Возможно, сервер перегружен.", 5);
							//trying to reload the page
							pageNumber--;
							return true;
						}
					}
				};
				p("Let's wait " + delay + " msec before making a request!");
				sleep(delay)
				var list = loadItems();
				for (var i = 0; i < list.length; i++) {
					page.appendItem(PREFIX + ":page:" + escape(list[i].title) + ":" + escape(list[i].url) + ":" + escape(list[i].image), "video", {
						title: new showtime.RichText(list[i].title),
						description: list[i].description ? new showtime.RichText(list[i].description) : '',
						icon: list[i].image
					});
				}
				return true;
			}
			loader();
			page.paginator = loader;
		}
		setPageHeader(page, genreName);
	}

	function listScraper(url, respond) {
		p('function listScraper (url=' + url + ',respond=' + respond + ')')
		if (!respond) {
			respond = http.request(url, {
				method: 'GET',
				headers: {
					'User-Agent': USER_AGENT
				}
			}).toString()
		}
		var re = /class="poster_img"><a href="([\S]*)"[\s\S]{0,300}alt="([^"]+)[\s\S]{0,300}original="([^"]+)/g;
		//	re = /<div class="poster_img"><a href="http:\/\/online.anidub.com([^"]+)"[\S\s]+?alt="([^"]+)"[\S\s]+?="([^"]+)" src/g;
		var items = new Array(),
			i = 0;
		var item = re.exec(respond);
		while (item) {
			p("Found title:" + item[2]);
			items.push({
				url: item[1],
				title: item[2],
				image: item[3]
			});
			item = re.exec(respond);
		}
		//	re = /<div class="img">[\S\s]{0,300}<img src="(\S*)"/g;
		//	item = re.exec(respond);
		//	while(item) {
		//	  debug(item[1]);
		//	  items[i].image = item[1];
		//	  i++;
		//
		//	  item = re.exec(respond);
		//	}
		p('Returning list with ' + items.length + ' items');
		return items;
	}

	function moviePage(page, title, url, imageURL) {
		var i = 0,
			j = 0;
		var videoURL;
		var data = {};
		title = unescape(title);
		url = unescape(url);
		imageURL = unescape(imageURL);
		page.loading = true;
		//'url' here is a FULL one. There's no need to add BASE_URL.
		p('Going for:' + url);
		var respond = http.request(url, {
			method: 'GET',
			headers: {
				'User-Agent': USER_AGENT
			}
		}).toString()
		var dom = html.parse(http.request(url))
		//
		//var player = dom.root.getElementById('players');


		if (respond.match(/<div class="players">[\S\s]+?<div id="banner_post"/)) {
			player = respond.match(/<div class="players">[\S\s]+?<div id="banner_post"/)[0]
		}
		p(player)

		//value=.*?(video_ext.php\?oid=-\d+&id=\d+&hash=[a-f\d]+).*?\|(\d+).*?>(.*?)<
		////vk video scrape from page
		//p('vk')
		if (player.match(/vk_multifilm/)) {
			p(player.match(/vk_multifilm/)[0])

			//vk
			var re = /value=.*?(oid=-\d+&id=\d+&hash=[a-f\d]+).*?>(.*?)</g;
			var m = re.execAll(player);
			if (m) {
				page.appendItem("", "separator", {
					title: new showtime.RichText('Основной плеер VK')
				});
				p(m);
				for (i = 0; i < m.length; i++) {
					page.appendItem(PREFIX + ':play:' + encodeURIComponent(m[i][1]) + ':' + encodeURIComponent(m[i][2]), 'video', {
						title: '[VK]' + m[i][2],
						icon: imageURL
					});

				}
			}

			//mw
			var re = /value=.(.*?video\/[a-f\d]+\/iframe).*?>(.*?)</g;
			var m = re.execAll(player);
			if (m) {
				page.appendItem("", "separator", {
					title: new showtime.RichText('Основной плеер MW')
				});
				for (i = 0; i < m.length; i++) {
					page.appendItem(PREFIX + ':play:' + encodeURIComponent(m[i][1]) + ':' + encodeURIComponent(m[i][2]), 'video', {
						title: '[MW]' + m[i][2],
						icon: imageURL
					});
				}
			}





		}
		if (player.match(/vk_onefilm/)) {
			p(player.match(/vk_onefilm/)[0])

			var re = /'film_main' src=.*?(oid=-\d+&id=\d+&hash=[a-f\d]+).*? width/g;
			var m = re.exec(respond)
			p('m2' + m)
			if (m.length !== 0) {
				page.appendItem("", "separator", {
					title: new showtime.RichText('Основной плеер')
				});
				page.appendItem(PREFIX + ":play:" + encodeURIComponent(m[1]) + ':' + encodeURIComponent(title), "video", {
					title: '[VK_S]' + title,
					icon: imageURL
				});
			}



		}


		var re = /value="(http:\/\/player.adcdn.tv\/embed[^|]+).*?>([^<]+)/g
		var m = re.execAll(player)

		p(m)
		if (m) {
			page.appendItem("", "separator", {
				title: new showtime.RichText('Наш плеер (Beta)')
			});

			for (i = 0; i < m.length; i++) {
				p(m[i])
				page.appendItem(PREFIX + ':play:' + encodeURIComponent(m[i][1]) + ':' + encodeURIComponent(m[i][2]), 'video', {
					title: '[hls]' + m[i][2],
					icon: imageURL
				});

			}
		}
		//
		////mw video scrape from page
		if (player.match(/mcode_block/) && !player.match(/vk_multifilm/)) {

			p(player.match(/http:.*?video\/[a-f\d]+\/iframe/)[0])
			page.appendItem("", "separator", {
				title: new showtime.RichText('Основной плеер MW')
			});
			page.appendItem(PREFIX + ':play:' + encodeURIComponent(player.match(/http:.*?video\/[a-f\d]+\/iframe/)[0]) + ':' + encodeURIComponent(title), 'video', {
				title: '[MW_S]' + title,
				icon: imageURL
			});

		}
		//	//value=.(.*?video\/[a-f\d]+\/iframe).*?>(.*?)<
		//	var re = /value=.(.*?video\/[a-f\d]+\/iframe).*?>(.*?)</g;
		//	var mw_links = re.exec(respond);
		//	if (mw_links) {
		//		//code
		//		p("mw_links:" + mw_links);
		//		while (mw_links) {
		//			p("mw_links:" + mw_links);
		//			p(encodeURIComponent(mw_links[1]))
		//			page.appendItem(PREFIX + ':play:' + encodeURIComponent(mw_links[1]) + ':' + encodeURIComponent(mw_links[2]), 'video', {
		//				title: '[MW]' + mw_links[2],
		//				icon: imageURL
		//			});
		//			mw_links = re.exec(respond);
		//		}
		//	} else {
		//		var video = match(/vk_onefilm[\s\S]{0,300}d='film_main' src=.*?(video_ext.php\?oid=-\d+&id=\d+&hash=[a-f\d]+).*? width/, respond);
		//		if (video) {
		//			page.appendItem(PREFIX + ":play:" + encodeURIComponent(video) + ':' + encodeURIComponent(title), "video", {
		//				title: '[MW_S]' + title,
		//				icon: imageURL
		//			});
		//		}
		//	}
		//}
		////mw video scrape from iframe
		//var moonwalk = match(/(http:\/\/moonwalk.cc\/serial\/.*?iframe)/, respond, 1);
		//p('iframe: ' + moonwalk);
		//if (moonwalk) {
		//	var html = http.request(moonwalk, {
		//		method: 'GET',
		//		headers: {
		//			'Referer': BASE_URL
		//		}
		//	}).toString();
		//	re = /<option .*value="(.*)">(.*)<\/option>/g;
		//	m = re.execAll(html.match(/<select id="season"[\S\s]+?option><\/select>/));
		//	p('count seasons:' + m.length);
		//	for (i = 0; i < m.length; i++) {
		//		page.appendItem("", "separator", {
		//			title: new showtime.RichText(m[i][2])
		//		});
		//		var seasons = moonwalk + '?season=' + m[i][1];
		//		p('season ' + m[i][1]);
		//		p('iframe: ' + seasons);
		//		var html2 = http.request(seasons, {
		//			method: 'GET',
		//			headers: {
		//				'Referer': BASE_URL
		//			}
		//		}).toString();
		//		m2 = re.execAll(html2.match(/<select id="episode"[\S\s]+?option><\/select>/));
		//		p('count episode: ' + m2.length);
		//		for (j = 0; j < m2.length; j++) {
		//			data.series = {
		//				url: moonwalk + '?season=' + m[i][1] + '&episode=' + m2[j][1],
		//				season: +m[i][1],
		//				episode: m2[j][1]
		//			};
		//			page.appendItem(PREFIX + ':play:' + encodeURIComponent(data.series.url) + ':' + encodeURIComponent(title), 'video', {
		//				title: 'episode ' + m2[j][1],
		//				icon: imageURL
		//			});
		//		}
		//	}
		//}
		//
		setPageHeader(page, title);
	}
	plugin.addURI(PREFIX + ":browse:(.*):(.*)", browseListPage);
	plugin.addURI(PREFIX + ":page:(.*):(.*):(.*)", moviePage);
	plugin.addURI(PREFIX + ":start", startPage);

	function countDelay(delay, lastRequest) {
		p("Getting difference between:" + lastRequest + " and " + Date.now());
		var timeDiff = Date.now() - lastRequest;
		p("time sinse last call:" + timeDiff);
		return timeDiff < delay ? delay - timeDiff : 0;
	};

	function sleep(ms) {
		var last = Date.now();
		for (; !(Date.now() - last > ms);) {}
	};



	plugin.addURI(PREFIX + ":select:(.*)", function(page, url) {
		var re, m, i, html;
		page.metadata.backgroundAlpha = 0.5;
		page.metadata.background = 'http://online.anidub.com/templates/Anidub_online/img/bg_1.jpg';
		try {
			html = http.request(BASE_URL);
				re = /<a title="(.+?)" href="(.+?)"/g;
				re2 = new RegExp('sublink">Аниме по '+url+'<[\\S\\s]*?</ul>');
				m = re.execAll(re2.exec(html));
				for (i = 0; i < m.length; i++) {
					page.appendItem(PREFIX + ":browse:" + (m[i][2] + ':' + (m[i][1])), "video", {
						title: new showtime.RichText(m[i][1]),
						description: new showtime.RichText(m[i][2]),
						icon: plugin.path + "logo.png"
					});
				}

		} catch (ex) {
			page.error("Failed to process categories page (get_cat)");
			e(ex);
		}
		page.loading = false;
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
		page.metadata.logo = logo;
	});
	// Play links
	plugin.addURI(PREFIX + ":play:(.*):(.*)", function(page, url, title) {
		page.loading = true;
		var canonicalUrl = PREFIX + ":play:" + url + ":" + title
		p(canonicalUrl)
		title = decodeURIComponent(title);
		url = decodeURIComponent(url);

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
		if (url.indexOf("oid=") !== -1) {
			p('Open url:' + 'http://vk.com/' + url);
			page.metadata.title = title
			vars = JSON.parse(http.request('https://api.vk.com/method/video.getEmbed?' + url.replace('&id', '&video_id').replace('&hash', '&embed_hash')).toString());
			p(vars)
			if (vars.error) {
				page.metadata.title = vars.error.error_msg
				popup.notify(vars.error.error_msg + '\n' + 'This video has been removed from public access.', 3)

			} else {
				for (key in vars.response) {
					if (key == 'cache240' || key == 'cache360' || key == 'cache480' || key == 'cache720' || key == 'url240' || key == 'url360' || key == 'url480' || key == 'url720') {
						videoparams.sources = [{
								url: vars.response[key],
								mimetype: "video/quicktime"
							}
						]
						video = "videoparams:" + JSON.stringify(videoparams)
						page.appendItem(video, "video", {
							title: "[" + key.match(/\d+/g) + "]-" + title /*+ " | " + 'data.season' + " \u0441\u0435\u0437\u043e\u043d  | " + 'data.episode' + " \u0441\u0435\u0440\u0438\u044f"*/ ,
							duration: vars.response.duration,
							icon: vars.response.thumb
						});
					}
				}
			}

		}

		p(url)
		if (url.match(/http:\/\/.+?iframe/)) {
			p('Open url:' + url.match(/http:\/\/.+?iframe/));
			var hdcdn = url.match(/http:\/\/.+?iframe/).toString();
			v = http.request(hdcdn, {
				method: 'GET',
				headers: {
					'Referer': BASE_URL
				}
			}).toString();
			p(v)
			//$.post('/sessions/create_session', {
			//    partner: 250,
			//    d_id: 6545,
			//    video_token: '9ef85ccd47347169',
			//    content_type: 'movie',
			//    access_key: 'MNW4q9pL82sHxV'
			//  }).success(function(video_url) {
			//    ga('send', 'event', 'session', '9ef85ccd47347169');
			//
			//      if (isMobile.Android() || isMobile.iOS()) {
			//        player_hls(video_url.manifest_m3u8);
			//      } else {
			//        player_osmf('AniDub/[AniDub]_World_Trigger_[720p]_[Manaoki_Holly]/[AniDub]_World_Trigger_[01]_[720p_x264_Aac]_[Manaoki_Holly].mp4', video_url.manifest_f4m, 'player');
			//      }
			//  });
			page.metadata.title = /player_osmf\('([^']+)/.exec(v)[1];
			var postdata = {}
			postdata = /post\('\/sessions\/create_session', \{([^\}]+)/.exec(v)[1]
			p(postdata)
			postdata = {
				partner: /partner: (.*),/.exec(v)[1],
				d_id: /d_id: (.*),/.exec(v)[1],
				video_token: /video_token: '(.*)'/.exec(v)[1],
				content_type: /content_type: '(.*)'/.exec(v)[1],
				access_key: /access_key: '(.*)'/.exec(v)[1]
			}
			json = JSON.parse(http.request(hdcdn.match(/http:\/\/.*?\//) + 'sessions/create_session', {
				debug: service.debug,
				postdata: postdata
			}));
			result_url = 'hls:' + json.manifest_m3u8;

			videoparams.sources = [{
					url: 'hls:' + json.manifest_m3u8
				}
			]
			video = "videoparams:" + JSON.stringify(videoparams)
			page.appendItem(video, "video", {
				title: "[Auto]-" + title
				/* + " | " + 'data.season' + " \u0441\u0435\u0437\u043e\u043d  | " + 'data.episode' + " \u0441\u0435\u0440\u0438\u044f",
							duration: vars.response.duration,
							icon: vars.response.thumb*/
			});
			var video_urls = http.request(json.manifest_m3u8).toString()
			p(video_urls)
			var video_urls = /RESOLUTION=([^,]+)[\s\S]+?(http.*)/g.execAll(video_urls);
			p(video_urls)
			for (i in video_urls) {
				videoparams.sources = [{
						url: 'hls:' + video_urls[i][2]
					}
				]
				video = "videoparams:" + JSON.stringify(videoparams)
				page.appendItem(video, "video", {
					title: "[" + video_urls[i][1] + "]-" + title
					/* + " | " + 'data.season' + " \u0441\u0435\u0437\u043e\u043d  | " + 'data.episode' + " \u0441\u0435\u0440\u0438\u044f",
							duration: vars.response.duration,
							icon: logo*/
				});

			}

		}

		if (url.indexOf('player.adcdn.tv') !== -1) {
			//url = url.replace('embed', 'i')
			v = http.request(url, {
				method: 'GET',
				headers: {
					'Referer': BASE_URL
				}
			}).toString();
			videoparams.sources = [{
					url: 'hls:' + /file: '([^']+)/.exec(v)[1]
				}
			]
			video = "videoparams:" + JSON.stringify(videoparams)
			page.appendItem(video, "video", {
				title: title,
				icon: /image: '([^']+)/.exec(v)[1]
			});

			//code
		}
		page.appendItem("search:" + title.split('-')[0], "directory", {
			title: 'Try Search for: ' + title
		});

		page.type = "directory";
		page.contents = "contents";
		page.metadata.logo = logo;
		page.loading = false;
	});
	plugin.addSearcher(PREFIX + " - Videos", plugin.path + "logo.png", function(page, query) {
		try {
			showtime.trace("Search anidub Videos for: " + query);
			var v = http.request(BASE_URL + '/index.php?do=search', {
				debug: service.debug,
				postdata: {
					do :'search',
					subaction: 'search',
					story: query,
					search_start: 1,
					full_search: 1,
					result_from: 1,
					titleonly: 3,
					searchuser: '',
					replyless: 0,
					replylimit: 0,
					searchdate: 0,
					beforeafter: 'after',
					sortby: 'date',
					resorder: 'desc',
					showposts: 0
				}
			});
			var re = /<div class="title">[\S\s]+?"(http:\/\/online.anidub.com.+?)" >(.+?)<[\S\s]+?<img src="(.+?)"/g;
			var m = re.execAll(v);
			for (var i = 0; i < m.length; i++) {
				p(m[i][1] + '\n' + m[i][2] + '\n' + m[i][3] + '\n');
				page.appendItem(PREFIX + ":page:" + escape(m[i][2]) + ":" + escape(m[i][1]) + ":" + escape(m[i][3]), "video", {
					title: new showtime.RichText(m[i][2]),
					description: new showtime.RichText(m[i][2]),
					icon: m[i][3]
				});
				page.entries = i;
			}
		} catch (err) {
			showtime.trace('anidub - Ошибка поиска: ' + err);
			e(err);
		}
	});


	//
	//extra functions
	//

	// Add to RegExp prototype
	RegExp.prototype.execAll = function(str) {
		var match = null
		for (var matches = []; null !== (match = this.exec(str));) {
			var matchArray = [],
				i;
			for (i in match) {
				parseInt(i, 10) == i && matchArray.push(match[i]);
			}
			matches.push(matchArray);
		}
		if (this.exec(str) == null) return null
		return matches;
	};

	function match(re, st) {
		var v;
		if (re.exec(st)) {
			v = re.exec(st)[1];
		} else v = null;
		return v;
	}

	function trim(s) {
		s = s.toString();
		s = s.replace(/(\r\n|\n|\r)/gm, "");
		s = s.replace(/(^\s*)|(\s*$)/gi, "");
		s = s.replace(/[ ]{2,}/gi, " ");
		return s;
	}

	function e(ex) {
		t(ex);
		t("Line #" + ex.lineNumber);
	}

	function t(message) {
		showtime.trace(message, plugin.getDescriptor().id);
	}

	function p(message) {
		if (service.debug == '1') {
			print(message);
			if (typeof(message) === 'object') print(dump(message))
		}
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

	function trace(msg) {
		if (service.debug == '1') {
			t(msg);
			p(msg);
		}
	}
})(this);