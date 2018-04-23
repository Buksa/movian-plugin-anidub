data = {};

function ScrapeList(href, pageHtml) {
    var returnValue = [];
    //content = document.getElementById("dle-content");
    content = pageHtml.dom.getElementById("dle-content");
    if (content) {
        content.getElementByClassName("title").forEach(function(e) {
            returnValue.push({
                url: e.getElementByTagName("a")[0].attributes.getNamedItem("href").value,
                title: e.getElementByTagName("a")[0].textContent
            });
        });
        content.getElementByClassName("poster_img").forEach(function(e, i) {
            var icons = e.getElementByTagName("img")[0].attributes;
            var icon = e.getElementByTagName("img")[0].attributes.getNamedItem("data-original") || e.getElementByTagName("img")[0].attributes.getNamedItem("src");
            returnValue[i].icon = icon.value || LOGO;
        });
        content.getElementByClassName("maincont").forEach(function(e, i) {
           // returnValue[i].description = e.children[4].textContent || "";
        });
    }
    //endOfData = document.getElementsByClassName('navigation').length ? document.getElementsByClassName('pagesList')[0].children[document.getElementsByClassName('pagesList')[0].children.length - 2].nodeName !== 'A' : true
    //document.getElementsByClassName('pagination').length ? document.getElementsByClassName('pagination')[0].getElementsByTagName('a')[document.getElementsByClassName('pagination')[0].getElementsByTagName('a').length - 2].attributes.length > 1 : true
    //!document.getElementsByClassName('navibut')[0].children[1].getElementsByTagName('a').length
    if (pageHtml.dom.getElementByClassName("nnext").length !== 0) {
        returnValue.endOfData = !pageHtml.dom.getElementByClassName("nnext")[0].getElementByTagName("a").length;
    } else returnValue.endOfData = true;
    return returnValue;
}

function populateItemsFromList(page, list) {
    log.d({
        function: "populateItemsFromList",
        list: list
    });
    for (i = 0; i < list.length; i++) {
        page.appendItem(PREFIX + ":moviepage:" + JSON.stringify(list[i]), "video", {
            title: list[i].title,
            description: list[i].description,
            icon: list[i].icon
        });
        page.entries++;
    }
}

exports.list = function(page, params) {
    page.loading = true;
    page.metadata.logo = LOGO;
    page.metadata.title = params.title;
    page.model.contents = "grid";
    page.type = "directory";
    page.entries = 0;
    log.d("exports.list");
    log.d(params);
    log.d("params.args:" + params.args);
    var nextPage = 1;

    function loader() {
        log.d({
            "params.page": params.page,
            "params.href": params.href
        });
        url = params.page ? params.href + params.page : params.href + "/";
        log.d("url=" + url); //http://getmovie.cc/serials-anime/page/2/
        api.call(page, BASE_URL + url, null, function(pageHtml) {
            list = ScrapeList(url, pageHtml);
            populateItemsFromList(page, list);
            nextPage++;
            params.page = "/page/" + nextPage + "/";
            page.haveMore(list.endOfData !== undefined && !list.endOfData);
        });
    }
    loader();
    page.asyncPaginator = loader;
};

function trailer(page,link) {
    log.d({
        function: "trailer",
        data: data
    });
    // page.appendItem("", "separator", {
    //   title: "\u0422\u0440\u0435\u0439\u043b\u0435\u0440:"
    // });
    page.appendItem("youtube:search:" + data.title_en + " " + (data.year || ""), "directory", {
        title: "\u043d\u0430\u0439\u0442\u0438 \u043d\u0430 YouTube"
    });
    page.appendItem(link.replace('/embed/','/watch?v='), "directory", {
        title: "Trailer YouTube"
    });
};
function yohoho (title){
    var responseText = http.request('https://4h0y.yohoho.cc/', {
    debug: 1,
    headers: {
        // "origin": "http://yohoho.cc",
        // "accept-encoding": "gzip, deflate, br",
        // "accept-language": "en-US,en;q=0.9,ru;q=0.8",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
        "content-type": "application/x-www-form-urlencoded",
        "accept": "*/*",
        "referer": "http://yohoho.cc/",
        // "authority": "4h0y.yohoho.cc",
    },
    postdata: {title: title, player: 'moonwalk,hdgo,iframe,newvideo,kodik,allserials,trailer,torrent'}
        }
    )
    return returnValue = (JSON.parse(responseText.toString()))

}

function showPlayersFolder(page, pageHtml) {
    log.d({
        function: "showPlayersFolder start",
        data: data
            //html: console.log(pageHtml.text.toString())
    });
    //GET TRANSLATE FROM pageHtml
    if ((player = pageHtml.dom.getElementByClassName("player")[0])) {
        // page.appendPassiveItem("separator", null, {
        //   title: "Варианты Players:"
        // });
        data.Player = [];
        i = 0;
        data.Player[0] = ({
            url: "http://" + (/\/\/(.*?[^"]+)/.exec(player.getElementByTagName("iframe")[0].attributes.getNamedItem("src").value) || [])[1],
            title: (/\/\/(.*?\.\w[^\/]+)/.exec(player.getElementByTagName("iframe")[0].attributes.getNamedItem("src").value) || [])[1]
        });
        page.appendPassiveItem("separator", null, {
            title: data.Player[0].title
        });
        // page.appendItem(PREFIX + ":moviepage:" + JSON.stringify(data), "directory", {
        //   title: data.Player[i].title
        //   //icon: data.cov
        // });

        if (player.getElementByTagName("option").length > 1) {
            player.getElementByTagName("option").forEach(function(item) {
                url = item.attributes.getNamedItem("value").value
                page.appendItem(url, "video", {
                    title: item.textContent,
                    description: data.description,
                    icon: data.icon
                });
            });
        } else {
            page.appendItem(data.Player[0].url, "video", {
                title: data.title.replace(/0\d+/, "01"),
                description: data.description,
                icon: data.icon
            });
        }
        log.p(data);
        log.d(data);
        page.metadata.title = data.title;
    }
}

function anidub_page(page, pageHtml) {
    log.p(anidub_page)
    data.title_ru = data.title.split('/')[0].trim();
    data.title_en = data.title.split("[")[0].split("/")[1].trim() || data.title.split("/")[1].trim();
    data.title_jp = data.title_en.split(":")[0].trim();
    players = yohoho((data.title_jp || data.title_en || data.title_jp)+ " " + (data.year || ""));
    log.p(players);
    trailer(page,players.trailer.iframe);

   // players.moonwalk.iframe -> HDRezka:moviepage: {DATA}
   if (players.moonwalk.iframe) {
       console.error(players.moonwalk.iframe);
       data.url = players.moonwalk.iframe.replace('s://streamguard','://moonwalk');
       data.title = (data.title_jp || data.title_en || data.title_jp);
       page.appendItem('HDRezka:moviepage:'+JSON.stringify(data), "directory", {
           title: '[yo]- '+data.title + " на moonwalk"
       });
    }
    // // players.torrent.iframe
    // if (players.torrent.iframe) {
    //     data.title = (data.title_jp || data.title_en || data.title_jp);
    //     page.appendItem('HDRezka:moviepage:'+JSON.stringify(data), "directory", {
    //         title:'[yo]- '+ data.title + " на торентах"
    //     });

    // }
    showPlayersFolder(page, pageHtml);
}
// vyzov s url
// PREFIX:moviepage:url
exports.moviepage = function(page, mdata) {
    page.metadata.title = mdata.title;
    page.metadata.logo = data.icon;
    page.loading = true;
    page.type = "directory";
    /{"url":"/.test(mdata) ? (data = JSON.parse(mdata)) : (data.url = mdata);
    log.d({
        function: "moviepage",
        data: data
    });
    page.metadata.logo = data.icon;
    //delaem zapros na stranicu
    api.call(page, data.url, null, function(pageHtml) {
        if (pageHtml.dom.getElementByClassName("player")[0] !== undefined) {
            anidub_page(page, pageHtml);
        } else console.error('##################### net plaera?')
    });
    page.loading = false;
};