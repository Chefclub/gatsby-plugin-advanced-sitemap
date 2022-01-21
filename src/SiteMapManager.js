import SiteMapIndexGenerator from "./IndexMapGenerator"
import SiteMapGenerator from "./SiteMapGenerator"
import _ from "lodash"

export default class SiteMapManager {
  constructor(options, language) {
    let sitemapTypes = []

    console.log(`options.mapping 1 `, Object.keys(options.mapping))

    options =
      {
        ...options,
        mapping: filterMappingByLanguage(options.mapping, language),
      } || {}

    console.log(`options.mapping 2 `, Object.keys(options.mapping))

    this.options = options

    for (let type in options.mapping) {
      console.log(`type`, type)
      const sitemapType = options.mapping[type].sitemap || `pages`
      sitemapTypes.push(sitemapType)
    }

    // ensure, we have a cleaned up array
    sitemapTypes = _.uniq(sitemapTypes)

    // create sitemaps for each type
    sitemapTypes.forEach(type => {
      this[type] = options[type] || this.createSiteMapGenerator(options, type)
    })

    console.log(`options.localesSM`, options.localesSM)

    this.index = options.index || this.createIndexGenerator(sitemapTypes)

    // create the default pages one for all fallback sitemap URLs
    this.pages = options.pages || this.createSiteMapGenerator(options, `pages`)
    console.log(`this keys`, Object.keys(this))
  }

  createIndexGenerator(sitemapTypes) {
    const types = {}

    sitemapTypes.forEach(type => (types[type] = this[type]))

    return new SiteMapIndexGenerator({
      types: types,
    })
  }

  createSiteMapGenerator(options, type) {
    return new SiteMapGenerator(options, type)
  }

  getIndexXml(options) {
    return this.index.getXml(options)
  }

  getSiteMapXml(type, options) {
    if (this[type]) {
      console.log(`adding ${url} to ${type}`)
      return this[type].getXml(options)
    }
  }

  // This is the equivalent of adding the URLs on bootstrap by listening to the events
  // like we do in Ghost core
  addUrls(type, { url, node }) {
    if (this[type]) {
      console.log(`adding ${url} to ${type}`)
      return this[type].addUrl(url, node)
    }
  }
}

const filterMappingByLanguage = (mapping, language) => {
  let newMapping = {}
  Object.keys(mapping).forEach(mappingKey => {
    console.log(mapping[mappingKey].language, language)
    if (mapping[mappingKey].language === language) {
      newMapping[mappingKey] = mapping[mappingKey]
    }
  })
  return newMapping
}
