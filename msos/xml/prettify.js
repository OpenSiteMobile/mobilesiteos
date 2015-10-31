
msos.provide("msos.xml.prettify");

msos.xml.prettify.version = new msos.set_version(15, 8, 14);

(function (undefined) {

    var prettify = {
        TAB: '\t',
        WARN: true
    };

    function parse(xmlStr) {
        var opener = /<(\w+)[^>]*?>/m,
            closer = /<\/[^>]*>/m;

        var idx = 0,
            indent = 0,
            processing = "",
            tags = [],
            output = [],
            token;

        while (idx < xmlStr.length) {
            processing += xmlStr[idx];

            token = getToken(opener, processing);
            if (token) {
                // Check if it is a singular element, e.g. <link />
                if (processing[processing.length - 2] !== '/') {
                    addLine(output, token.preContent, indent);
                    addLine(output, token.match, indent);

                    tags.push(token.tag);
                    indent += 1;
                    processing = "";
                } else {
                    addLine(output, token.preContent, indent);
                    addLine(output, token.match, indent);
                    processing = "";
                }
            }

            token = getToken(closer, processing);
            if (token) {
                addLine(output, token.preContent, indent);

                if (tags[tags.length] === token.tag) {
                    tags.pop();
                    indent -= 1;
                }

                addLine(output, token.match, indent);
                processing = "";
            }

            idx += 1;
        }

        if (tags.length && prettify.WARN) {
            console.log('WARNING: xmlFile may be malformed. Not all opening tags were closed. Following tags were left open:');
            console.log(tags);
        }

        return output;
    }

    function getToken(regex, str) {
        if (regex.test(str)) {
            var matches = regex.exec(str),
                match = matches[0],
                offset = str.length - match.length,
                preContent = str.substring(0, offset);

            return {
                match: match,
                tag: matches[1],
                offset: offset,
                preContent: preContent
            };
        }
        return undefined;
    }

    function addLine(output, content, indent) {
        // Trim the content
        content = content.replace(/^\s+|\s+$/, "");

        if (content) {
            var tabs = ""

            while (indent--) {
                tabs += prettify.TAB;
            }
            output.push(tabs + content);
        }
    }

    msos.xml.prettify.now = function (xmlStr) {

        if (msos.var_is_empty(xmlStr) || typeof xmlStr !== 'string') {
            msos.console.warn('msos.xml.prettify.now -> no input or input is not a string.');
            return '';
        }

        return parse(xmlStr).join('\n');
    }

}());
