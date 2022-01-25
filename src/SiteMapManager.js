import SiteMapIndexGenerator from './IndexMapGenerator';
import SiteMapGenerator from './SiteMapGenerator';
import _ from 'lodash';

export default class SiteMapManager {
    constructor(options, language) {
        let sitemapTypes = [];

        options = {
            ...options,
            mapping: filterMappingByLanguage(options.mapping, language),
        } || {};

        this.options = options;
        this.language = language

        for (let type in options.mapping) {
            const sitemapType = options.mapping[type].sitemap || `pages`;
            sitemapTypes.push(sitemapType);
        }

        // ensure, we have a cleaned up array
        sitemapTypes = _.uniq(sitemapTypes);

        // create sitemaps for each type
        sitemapTypes.forEach((type) => {
            this[type] = options[type] || this.createSiteMapGenerator(options, type);
        });

        this.index = options.index || this.createIndexGenerator(sitemapTypes);
        // create the default pages one for all fallback sitemap URLs
        this.pages = options.pages || this.createSiteMapGenerator(options, `pages`);
    }

    createIndexGenerator(sitemapTypes) {
        const types = {};

        sitemapTypes.forEach(type => types[type] = this[type]);

        return new SiteMapIndexGenerator({
            types: types
        });
    }

    createSiteMapGenerator(options, type) {
        return new SiteMapGenerator(options, type);
    }

    getIndexXml(options, siteUrl) {
        return this.index.getXml(options, siteUrl);
    }

    getSiteMapXml(type, options) {
        if (this[type]) {
            return this[type].getXml(options);
        }
    }

    // This is the equivalent of adding the URLs on bootstrap by listening to the events
    // like we do in Ghost core
    addUrls(type, {url, node}) {
        if (this[type]) {
            return this[type].addUrl(url, node);
        }
    }

    addChild(manager){
        if (!this.index.types.children) {
            this.index.types.children = []
        }
        this.index.types.children.push(manager)
    }
}

const filterMappingByLanguage = (mapping, language) => {
    let newMapping = {}
    Object.keys(mapping).forEach((mappingKey) => {
        if (mapping[mappingKey].language === language) {
            newMapping[mappingKey] = mapping[mappingKey]
        }
    })
    return newMapping
}