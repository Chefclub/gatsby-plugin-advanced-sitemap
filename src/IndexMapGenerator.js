import _ from "lodash"
import xml from "xml"
import moment from "moment"
import url from "url"
import path from "path"

import * as utils from "./utils"

const XMLNS_DECLS = {
    _attr: {
        xmlns: `http://www.sitemaps.org/schemas/sitemap/0.9`,
    },
}

export default class SiteMapIndexGenerator {
    constructor(options) {
        options = options || {}
        this.types = options.types
    }

    getXml(options, siteUrl) {
        const urlElements = this.generateSiteMapUrlElements(options)

        if (this.types.children) {
            this.types.children.forEach((child) => {
                urlElements.push({ sitemap: [{ loc: `${siteUrl}/sitemap-${child.language}.xml` }, { lastmod: new Date() }] })
            })
        }

        const data = {
            // Concat the elements to the _attr declaration
            sitemapindex: [XMLNS_DECLS].concat(urlElements),
        }

        // Return the xml
        return utils.sitemapsUtils.getDeclarations(options) + xml(data)
    }

    generateSiteMapUrlElements({
        sources,
        siteUrl,
        pathPrefix,
        resourcesOutput,
    }) {
        sources = sources.filter(source => Object.keys(this.types).includes(source.sitemap)
        )

        return _.map(sources, (source) => {
            console.log(`source`, source)
            const filePath = resourcesOutput
                .replace(/:resource/, source.name)
                .replace(/^\//, ``)
            const siteMapUrl = source.url
                ? source.url
                : url.resolve(siteUrl, path.join(pathPrefix, filePath))
            const lastModified = source.url
                ? moment(new Date(), moment.ISO_8601).toISOString()
                : this.types[source.sitemap].lastModified ||
          moment(new Date(), moment.ISO_8601).toISOString()

            return {
                sitemap: [
                    { loc: siteMapUrl },
                    { lastmod: moment(lastModified).toISOString() },
                ],
            }
        })
    }
}
