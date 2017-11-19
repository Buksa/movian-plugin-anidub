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
            returnValue[i].description = e.children[4].textContent || "";
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

function trailer(page) {
    log.d({
        function: "trailer",
        data: data
    });
    // page.appendItem("", "separator", {
    //   title: "\u0422\u0440\u0435\u0439\u043b\u0435\u0440:"
    // });
    page.appendItem("youtube:search:" + data.title_en + " " + (data.year || ""), "directory", {
        title: "\u043d\u0430\u0439\u0442\u0438 \u0442\u0440\u0435\u0439\u043b\u0435\u0440 \u043d\u0430 YouTube"
    });
}

function Show_R_U(page, pageHtml) {
    log.d({
        function: "Show_R_U start",
        data: data
            //html: console.log(pageHtml.text.toString())
    });
    page.metadata.title = data.title;
    if ((episode = pageHtml.dom.getElementById("episode")) && (season = pageHtml.dom.getElementById("episode"))) {
        season = pageHtml.dom.getElementById("season");
        data.season = season.children[season.children.length - 1].attributes.getNamedItem("value").value;
        data.episode = episode.children[episode.children.length - 1].attributes.getNamedItem("value").value;
        page.appendItem("", "separator", {
            title: "Recently Updated:"
        });
        data.url = data.url + "?season=" + data.season + "&episode=" + data.episode;
        page.appendItem(PREFIX + ":play:" + JSON.stringify(data), "tvepisode", {
            episode: {
                number: +data.episode
            },
            title: season.children[season.children.length - 1].textContent + " " + episode.children[episode.children.length - 1].textContent,
            icon: "cover"
        }).bindVideoMetadata({
            title: data.title_en ? data.title_en : data.title,
            season: +data.season,
            episode: +data.episode
        });
    } else {
        page.appendItem("", "separator", {
            title: "Video:"
        });
        page.appendItem(PREFIX + ":play:" + JSON.stringify(data), "video", {
            title: data.title,
            icon: "cover"
        }).bindVideoMetadata({
            title: data.title_en ? data.title_en : data.title,
            year: +data.year
        });
    }
}

function showSeasonFolder(page, pageHtml) {
    //season = document.getElementById('season');
    if ((season = pageHtml.dom.getElementById("season"))) {
        log.d("count season: " + season.children.length);
        page.appendPassiveItem("separator", null, {
            title: "Seasons:"
        });
        for (var i = 0; i < season.children.length; i++) {
            //log.d(urls.parse(data.url))
            data.season = season.children[i].attributes.getNamedItem("value").value;
            data.url = data.url.replace(/season=.*/, "season=" + data.season);
            page.appendItem(PREFIX + ":SEASON:" + JSON.stringify(data), "directory", {
                title: season.children[i].textContent,
                icon: "cover"
            });
        }
    }
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
    data.title_en = data.title.split("[")[0].split("/")[1].trim() || data.title.split("/")[1].trim();
    trailer(page);
    //Show_R_U(page, pageHtml)
    //showSeasonFolder(page, pageHtml)
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