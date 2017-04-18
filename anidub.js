/**
 *  AniDub plugin for Movian
 *
 *  Copyright (C) 2014-2017 Buksa
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
//ver 3.0.1
var plugin = JSON.parse(Plugin.manifest);
var PREFIX = plugin.id;
var BASE_URL = "http://online.anidub.com";
var LOGO = Plugin.path + "logo.png";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36";
var page = require("showtime/page");
var service = require("showtime/service");
var settings = require("showtime/settings");
var io = require("native/io");
var prop = require("showtime/prop");
var log = require("./src/log");
var browse = require("./src/browse");
var api = require("./src/api");
var http = require("showtime/http");
var html = require("showtime/html");
var urls = require("url");
var result = "",
    referer = BASE_URL,
    data = {};
var tos = "The developer has no affiliation with the sites what so ever.\n";
tos += "Nor does he receive money or any other kind of benefits for them.\n\n";
tos += "The software is intended solely for educational and testing purposes,\n";
tos += "and while it may allow the user to create copies of legitimately acquired\n";
tos += "and/or owned content, it is required that such user actions must comply\n";
tos += "with local, federal and country legislation.\n\n";
tos += "Furthermore, the author of this software, its partners and associates\n";
tos += "shall assume NO responsibility, legal or otherwise implied, for any misuse\n";
tos += "of, or for any loss that may occur while using plugin.\n\n";
tos += "You are solely responsible for complying with the applicable laws in your\n";
tos += "country and you must cease using this software should your actions during\n";
tos += "plugin operation lead to or may lead to infringement or violation of the\n";
tos += "rights of the respective content copyright holders.\n\n";
tos += "plugin is not licensed, approved or endorsed by any online resource\n ";
tos += "proprietary. Do you accept this terms?";
// io.httpInspectorCreate('http.*sibnet.ru.*', function (ctrl) {
//   ctrl.setHeader('User-Agent', UA);
//   ctrl.setHeader('Referer', 'http://video.sibnet.ru')
// });
// io.httpInspectorCreate('.*adcdn.tv.*', function (ctrl) {
//   ctrl.setHeader('User-Agent', UA);
//   ctrl.setHeader('Referer', 'http://player.adcdn.tv/embed/storage4/2786/1//0JHQvtC10LLRi9C1INC60YPQutC%2B0LvQutC4IC0gMSDRgdC10YDQuNGPIE9uaQ%3D%3D/kvv')
// });
var page = require("showtime/page");
var http = require("showtime/http");
///////////////////////// player.adcdn.tv /////////////////////////
new page.Route("(http://player.adcdn.tv/embed/storage.*)", function(page, url) {
    var x = http.request(url);
    var url = /file: '([^']+)/.exec(x)[1];
    var url = http.request(url, {
        noFollow: true
    }).headers.Location;
    var x = http.request(url);
    var str = x.bytes.toString().replace(/\.\/\d+.mp4/g, url.match(/.*\d+.mp4/)[0]);
    var str = Duktape.enc("base64", str);
    page.redirect("hls:data:application/vnd.apple.mpegurl;base64," + str);
});
///////////////////////// player.adcdn.tv /////////////////////////
new page.Route(PREFIX + ":sibnet:(.*)", function(page, path) {
    page.loading = true;
    page.type = "video";
    var url = http.request("http://video.sibnet.ru" + path, {
        noFollow: true
    }).headers.Location;
    var videoParams = {
        title: data.title,
        icon: data.icon,
        canonicalUrl: PREFIX + ":sibnet:" + path,
        sources: [{
            url: "http:" + url
                //  mimetype: type,
        }],
        no_subtitle_scan: true,
        subtitles: []
    };
    log.p(videoParams);
    page.source = "videoparams:" + JSON.stringify(videoParams);
});
new page.Route("http://video.sibnet.ru/shell.php\\?videoid=(\\d+)", function(page, videoid) {
    page.loading = true;
    var url = "http://video.sibnet.ru/shell.php?videoid=" + videoid;
    var x = http.request(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36"
        },
        debug: 1
    });
    items = eval((/player\.src\(([^)]+)/.exec(x) || [])[1]);
    items.forEach(function(e) {
        page.appendItem(PREFIX + ":sibnet:" + e.src, "video", {
            title: (/title: '([^']+)/.exec(x) || [])[1] + " " + e.type,
            icon: data.icon
        });
    });
    page.appendItem("search:" + data.title, "directory", {
        title: "найти " + data.title
    });
    page.type = "directory";
    page.metadata.logo = data.icon;
    page.metadata.title = data.title;
    page.loading = false;
});
// Create the service (ie, icon on home screen)
service.create(plugin.title, PREFIX + ":start", "video", true, LOGO);
settings.globalSettings("settings", plugin.title, LOGO, plugin.synopsis);
settings.createInfo("info", LOGO, "Plugin developed by " + plugin.author + ". \n");
settings.createDivider("Settings:");
settings.createBool("tosaccepted", "Accepted TOS (available in opening the plugin)", false, function(v) {
    service.tosaccepted = v;
});
settings.createBool("debug", "Debug", false, function(v) {
    service.debug = v;
});
settings.createBool("Show_META", "Show more info from thetvdb", true, function(v) {
    service.tvdb = v;
});
new page.Route(PREFIX + ":browse:(.*):(.*)", function(page, href, title) {
    browse.list(page, {
        href: href,
        title: title
    });
});
//
new page.Route(PREFIX + ":moviepage:(.*)", function(page, data) {
    browse.moviepage(page, data);
});
//
new page.Route(PREFIX + ":search:(.*)", function(page, query) {
    page.metadata.icon = LOGO;
    page.metadata.title = "Search results for: " + query;
    //  page.type = 'directory';
    //http://getmovie.cc/query/tron
    //index.php?do=search&subaction=search&search_start=1&full_search=1&result_from=1&story=lost&titleonly=3&showposts=0
    browse.list(page, {
        href: "/index.php?do=search&subaction=search&search_start=1&full_search=1&result_from=1&story=" + query + "&titleonly=3&showposts=0",
        title: query
    });
});
//
page.Searcher(PREFIX + " - Result", LOGO, function(page, query) {
    page.metadata.icon = LOGO;
    browse.list(page, {
        href: "/query/" + query,
        title: PREFIX + " - " + query
    });
});
// Landing page
new page.Route(PREFIX + ":start", function(page) {
    page.type = "directory";
    page.metadata.title = PREFIX;
    page.metadata.icon = LOGO;
    page.appendItem(PREFIX + ":search:", "search", {
        title: "Search AniDub"
    });
    page.appendItem(PREFIX + ":browse:/anime_tv/anime_ongoing:Аниме Ongoing", "directory", {
        title: "Аниме Ongoing"
    });
    page.appendItem(PREFIX + ":browse:/anime_tv:Аниме сериалы", "directory", {
        title: "Аниме сериалы"
    });
    page.appendItem(PREFIX + ":browse:/anime_tv/full:Законченные Anime сериалы", "directory", {
        title: "Законченные Anime сериалы"
    });
    page.appendItem(PREFIX + ":browse:/anime_movie:Аниме Фильмы", "directory", {
        title: "Аниме Фильмы"
    });
    page.appendItem(PREFIX + ":browse:/anime_ova:Аниме OVA", "directory", {
        title: "Аниме OVA"
    });
    page.appendItem(PREFIX + ":browse:/dorama:Дорамы", "directory", {
        title: "Дорамы"
    });
});

function parser(a, c, e) {
    var d = "",
        b = a.indexOf(c);
    0 < b && ((a = a.substr(b + c.length)), (b = a.indexOf(e)), 0 < b && (d = a.substr(0, b)));
    return d;
}