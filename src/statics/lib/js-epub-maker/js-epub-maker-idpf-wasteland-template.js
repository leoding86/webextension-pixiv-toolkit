const jsEpubMakeIdpfrWastelandTemplate = {
    mimetype: () => {
        return 'application/epub+zip';
    },

    container: (args) => {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
            <rootfiles>
                <rootfile full-path="EPUB/${args.slug}.opf" media-type="application/oebps-package+xml"/>
            </rootfiles>
        </container>`;
    },

    opf: (args) => {
        const renderRights = () => {
            return `
            ${args.rights.description ? `<dc:rights>${args.rights.description}</dc:rights>` : ''}
            ${args.rights.license ? `<link rel="cc:license" href="${args.rights.license}"/>` : ''}
            ${args.rights.attributionUrl ? `<meta property="cc:attributionURL">${arg.rights.attributionUrl}}</meta>` : ''}
            `
        };

        const renderCoverUrl = () => {
            let html = '';

            if (args.coverRights) {
                if (args.coverRights.license) {
                    html += `<link rel="cc:license" refines="#cover" href="${args.coverRights.license}" />`;
                }

                if (args.coverRights.attributionUrl) {
                    html += `<link rel="cc:attributionURL" refines="#cover" href="${args.coverRights.attributionUrl}" />`;
                }
            }

            return html + '<meta name="cover" content="cover"/>';
        };

        return `<?xml version="1.0" encoding="UTF-8"?>
        <package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="en-US" prefix="cc: http://creativecommons.org/ns#">
            <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
                <dc:identifier id="uid">${args.uuid}</dc:identifier>
                <dc:title>${args.title}</dc:title>
                <dc:creator>${args.author}</dc:creator>
                <dc:language>${args.lang}</dc:language>
                <dc:date>${args.publicationDate}</dc:date>
                <meta property="dcterms:modified">${args.modificationDate}</meta>
                ${args.rights ? renderRights() : ''}
                ${args.coverUrl ? renderCoverUrl() : ''}
            </metadata>
            <manifest>
                <item id="t1" href="${args.slug}-content.xhtml" media-type="application/xhtml+xml" />
                <item id="nav" href="${args.slug}-nav.xhtml" properties="nav" media-type="application/xhtml+xml" />
                ${args.coverUrl ? `<item id="cover" href="${args.slug}-cover.${args.extension} ${args.coverUrl}" media-type="${args.mimetype} ${args.coverUrl}" properties="cover-image" />` : ''}
                <item id="css" href="${args.slug}.css" media-type="text/css" />
                <!-- ncx included for 2.0 reading system compatibility: -->
                <item id="ncx" href="${args.slug}.ncx" media-type="application/x-dtbncx+xml" />
            </manifest>
            <spine toc="ncx">
                <itemref idref="t1" />
            </spine>
        </package>`;
    },

    ncx: (args) => {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <ncx xmlns:ncx="http://www.daisy.org/z3986/2005/ncx/" xmlns="http://www.daisy.org/z3986/2005/ncx/"
            version="2005-1" xml:lang="en">
            <head>
                <meta name="dtb:uid" content="${args.uuid}"/>
            </head>
            <docTitle>
                <text>${args.title}</text>
            </docTitle>
            <navMap>
                <!-- 2.01 NCX: playOrder is optional -->
                {{#each toc}}
                <navPoint id="{{id}}">
                    <navLabel>
                        <text>{{content.title}}</text>
                    </navLabel>
                    <content src="{{../slug}}-content.xhtml#{{id}}"/>
                </navPoint>
                {{/each}}
            </navMap>
        </ncx>
        `;
    },

    nav: (args) => {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"
            xmlns:epub="http://www.idpf.org/2007/ops">
            <head>
                <meta charset="utf-8"></meta>
                <link rel="stylesheet" type="text/css" href="${args.slug}.css" class="day" title="day"/>
            </head>
            <body>
                <nav epub:type="toc" id="toc">
                    <ol>
                        ${args.toc && args.toc.map(item => `<li><a href="${args.slug}-content.xhtml#${item.id}">${item.content.title}</a></li>`)}
                    </ol>
                </nav>
                <nav epub:type="landmarks">
                    <ol>
                        ${ars.landmarks && args.landmarks.map(item => `<li><a epub:type="${item.epubType}" href="${args.slug}-content.xhtml#${item.id}">${item.content && item.content.title ? item.content.title : item.epubType}`)}
                    </ol>
                </nav>
            </body>
        </html>
        `;
    },

    css: (args) => {
        return `@charset "UTF-8";\n@namespace "http://www.w3.org/1999/xhtml";\n@namespace epub "http://www.idpf.org/2007/ops";\n\nbody {\n    margin-left: 6em;\n    margin-right: 2em;\n    color: black;\n    font-family: times, \'times new roman\', serif;\n    background-color: rgb(255,255,245);\n    line-height: 1.5em;\n}\n\nh2 {\n    margin-top: 5em;\n    margin-bottom: 2em;\n}\n\nh3 {\n    margin-top: 3em;\n}\n\n.linegroup {\n    margin-top: 1.6em;\n}\n\nspan.lnum {\n    float: right;\n    color: gray;\n    font-size : 90%;\n}\n\na.noteref {\n    color: rgb(215,215,195);\n    text-decoration: none;\n    margin-left: 0.5em;\n    margin-right: 0.5em;\n}\n\nsection#rearnotes a {\n    color: black;\n    text-decoration: none;\n    border-bottom : 1px dotted gray;\n    margin-right: 0.8em;\n}\n\n.indent {\n    padding-left: 3em;\n}\n\n.indent2 {\n    padding-left: 5em;\n}\n\n*[epub|type~=\'dedication\'] {\n    padding-left: 2em;\n}\n`;
    },

    content: (args) => {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" xmlns:epub="http://www.idpf.org/2007/ops">
            <head>
                <meta charset="utf-8"></meta>
                <title>${args.title}</title>
                <link rel="stylesheet" type="text/css" href="${args.slug}.css" class="day" title="day"/>
            </head>
            <body>
                ${args.sections.map(section => jsEpubMakeIdpfrWastelandTemplate.sectionsTemplate(section))}
            </body>
        </html>`
    },

    sectionsTemplate: (args) => {
        let html = '';

        if (args.epubType) {
            html += `<section epub:type="${args.epubType}" id="${args.id}">`
        } else {
            html += `<section id="${args.id}">`
        }

        if (args.conent && args.content.renderTitle) {
            html += `<h2>${args.content.title}</h2>`
        }

        if (args.content && args.content.content) {
            html += args.content.content;
        }

        if (args.subSections) {
            for (const i = 0; i < args.subSections.length; i++) {
                html += sectionsTemplate(args.subSections[i]);
            }
        }

        if (args.epubType) {
            html += '</section>';
        } else {
            html += '</section>';
        }

        return html;
    }
};