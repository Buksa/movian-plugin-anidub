var depth = ''

function logData(data, logFunction, depth) {
    if (!depth) depth = 0;

    var body = "";
    for (var i = 0; i < depth; i++) body += "  ";
    if (depth > 0) body += "'-> ";

    if (data === null) logFunction(body + "NULL");
    else if (data === undefined) logFunction(body + "UNDEFINED");
    else if (typeof (data) === 'boolean') logFunction(body + data);
    else if (typeof (data) === 'number') logFunction(body + data);
    else if (typeof (data) === 'string') logFunction(body + data);
    else if (Array.isArray(data)) logFunction(JSON.stringify(data, null, 4));
    else if (typeof (data) === 'object') logFunction(JSON.stringify(data, null, 4));
    else if (typeof (data) === 'function') logFunction(body + "Function()");
    else logFunction(body + "Unknown data type");
}

exports.d = function (data) {
    if (service.debug) logData(data, console.log);
};

exports.e = function (data) {
    if (service.debug) logData(data, console.error);
};

exports.p = function (data) {
    if (service.debug) logData(dump(data), console.error);
}


function dump(arr, level) {
    var dumped_text = "";
    if (!level) {
        level = 0;
    }
    var level_padding = "";
    for (var j = 0; j < level + 1; j++) {
        level_padding += "    ";
    }
    if (typeof arr == "object") {
        for (var item in arr) {
            var value = arr[item];
            if (typeof value == "object") {
                dumped_text += level_padding + "'" + item + "' ...\n";
                dumped_text += dump(value, level + 1);
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + value + '"\n';
            }
        }
    } else {
        dumped_text = "===>" + arr + "<===(" + typeof arr + ")";
    }
    return dumped_text;
}