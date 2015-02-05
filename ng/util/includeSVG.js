
    ngIncludeFillContentDirective = ['$compile', function ($compile) {

        function jqLiteBuildFragment(html, context) {
            var TAG_NAME_REGEXP = /<([\w:]+)/,
                XHTML_TAG_REGEXP = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
                HTML_REGEXP = /<|&#?\w+;/,
                wrapMap = {
                    'option':   [1, '<select multiple="multiple">', '</select>'],
                    'thead':    [1, '<table>', '</table>'],
                    'col':      [2, '<table><colgroup>', '</colgroup></table>'],
                    'tr':       [2, '<table><tbody>', '</tbody></table>'],
                    'td':       [3, '<table><tbody><tr>', '</tr></tbody></table>'],
                    '_default': [0, "", ""]
                },
                tmp,
                tag,
                wrap,
                fragment = context.createDocumentFragment(),
                nodes = [],
                i = 0;
    
            wrapMap.optgroup = wrapMap.option;
            wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
            wrapMap.th = wrapMap.td;
    
            if (!HTML_REGEXP.test(html)) {
                // Convert non-html into a text node
                nodes.push(context.createTextNode(html));
            } else {
                // Convert html into DOM nodes
                tmp = tmp || fragment.appendChild(context.createElement("div"));
                tag = (TAG_NAME_REGEXP.exec(html) || ["", ""])[1].toLowerCase();
                wrap = wrapMap[tag] || wrapMap._default;
                tmp.innerHTML = wrap[1] + html.replace(XHTML_TAG_REGEXP, "<$1></$2>") + wrap[2];
    
                // Descend through wrappers to the right content
                i = wrap[0];
                while (i--) {
                    tmp = tmp.lastChild;
                }
    
                nodes = concat(nodes, tmp.childNodes);
    
                tmp = fragment.firstChild;
                tmp.textContent = "";
            }
    
            // Remove wrapper from fragment and clear inner HTML
            fragment.textContent = "";
            fragment.innerHTML = "";
    
            forEach(nodes, function (node) {
                fragment.appendChild(node);
            });
    
            return fragment;
        }

        return {
            restrict: 'ECA',
            priority: -400,
            require: 'ngInclude',
            link: function (scope, $element, $attr, ctrl) {

                if (/SVG/.test($element[0].toString())) {

                    $element.empty();
                    $compile(jqLiteBuildFragment(ctrl.template, document).childNodes)(
                        scope,
                        function namespaceAdaptedClone(clone) {
                            $element.append(clone);
                        },
                        { futureParentElement: $element }
                    );

                    return;
                }

                $element.html(ctrl.template);
                $compile($element.contents())(scope);
            }
        };
    }];