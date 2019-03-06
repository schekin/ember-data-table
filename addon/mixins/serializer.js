import Mixin from '@ember/object/mixin';

export default Mixin.create({

  /**
      Parse the links in the JSONAPI response and convert to a meta-object
  */
  normalizeQueryResponse(store, clazz, payload) {
    const result = this._super(...arguments);
    result.meta = result.meta || {};

    if (payload.links) {
      result.meta.pagination = this.createPageMeta(payload.links);
    }
    if (payload.meta) {
      result.meta["count"] = payload.meta['page-count'];
    }

    return result;
  },

  /**
     Transforms link URLs to objects containing metadata
     E.g.
     {
         previous: '/streets?page[number]=1&page[size]=10&sort=name
         next: '/streets?page[number]=3&page[size]=10&sort=name
     }

     will be converted to

     {
         previous: { number: 1, size: 10 },
         next: { number: 3, size: 10 }
     }
   */
  createPageMeta(data) {
    let meta = {};
    Object.keys(data).forEach(type => {
      const link = data[type];
      meta[type] = {};
      let anchor = document.createElement('a');
      anchor.href = link;
      anchor.search.slice(1).split('&').forEach(pairs => {
        const [param, value] = pairs.split('=');
        if (param == 'page%5Bnumber%5D') {
          meta[type].number = parseInt(value);
        }
        if (param == 'page%5Bsize%5D') {
          meta[type].size = parseInt(value);
        }
      });
      anchor = null;
    });
    return meta;
  }

});