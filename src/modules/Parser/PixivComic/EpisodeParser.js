import { RuntimeError } from "@/errors";
import DateFormatter from "@/modules/Util/DateFormatter";
import md5 from "md5";
import moment from "moment";
import Request from "@/modules/Net/Request";
import { decrypteImage } from "./ImageDecrypte";
import Download from "@/modules/Net/Download";
import { encrypteHashKey } from "./config";

/**
 * @class
 */
class EpisodeParser {
  /**
   * @type {string} yek
   */
   yek = encrypteHashKey;

   /**
    * @type {string} Target page url
    */
   url;

   /**
    * @type {Object} Target context data
    */
   context;

   /**
    * @type {Request}
    */
   request;

   /**
    * @constructor
    * @param {string} url Target page url
    */
   constructor(url) {
     this.url = url;
     this.context = {};
   }

   /**
    * Create a parser instance
    * @param {string} url Target page url
    * @returns {EpisodeParser}
    */
   static create(url) {
     return new EpisodeParser(url);
   }

   /**
    * Set url which need to be parsed. Call this method will reset property
    * context
    * @param {string} url
    */
   setUrl(url) {
     this.url = url;
     this.context = {};
   }

   /**
    * Get illust's context data
    * @returns {Object}
    */
   getContext() {
     return this.context;
   }

   parseUrl(url) {
    let regexes = [/https:\/\/comic\.pixiv\.net\/viewer\/stories\/(\d+)/];

    for (let regex of regexes) {
      let matches = url.match(regex);

      if (matches) {
        this.context.id = matches[1];
        return;
      }
    }

    throw new RuntimeError(`Can't parse the episode id out. url: ${this.url}`);
   }

   /**
    *
    * @param {string} id
    * @returns {string}
    */
   buildContextUrl(id) {
    return `https://comic.pixiv.net/api/app/episodes/${id}/read_v4`;
   }

   /**
    * Make context standard
    * @param {object} context
    * @returns {{ pages: { url: string, height: number, width: number, gridsize: number, key: string } }}
    */
    standardContext(context) {
      let sContext = {
        id: context.reading_episode.id,
        title: context.reading_episode.title,
        subTitle: context.reading_episode.sub_title,
        cover: context.reading_episode.thumbnail_image_url,
        numberingTitle: context.reading_episode.numbering_title,
        workId: context.reading_episode.work_id,
        workTitle: context.reading_episode.work_title,
        pages: context.reading_episode.pages,
      };

      sContext.totalPages = sContext.pages.length;

      return sContext;
    }

  /**
   * Load episode context
   * @return {Promise.<string,Error>}
   */
   parserContext() {
    this.parseUrl(this.url);

    return new Promise(async (resolve, reject) => {
      let clientTime = moment().format('YYYY-MM-DDTHH:mm:ssZ');
      const cryptedArrayBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(clientTime.concat(this.yek))
      );
      let clientHash = Array.from(new Uint8Array(cryptedArrayBuffer)).map(i => i.toString(16).padStart(2, '0')).join('');

      this.request = new Request(this.buildContextUrl(this.context.id), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-client-hash': clientHash,
          'x-client-time': clientTime,
          'x-requested-with': 'pixivcomic'
        }
      });

      this.request.addListener('onload', data => {
        let textDecoder = new TextDecoder();
        let json = JSON.parse(textDecoder.decode(data));

        if (json && json.data) {
          this.context = this.standardContext(json.data);

          /**
           * Beware the images from pixiv comic have been encrypted, for displaying
           * the previews in download selector we append a image resolver to the
           * context, then target page can call the resolver to get the url of the
           * images
           */
          this.context.pageResolver = (page) => {
            return new Promise((resolve, reject) => {
              const download = new Download(page.url, {
                method: 'GET',
                headers: {
                  'X-Cobalt-Thumber-Parameter-Gridshuffle-Key': page.key
                }
              });

              download.addListener('onfinish', async data => {
                const url = await decrypteImage(page, data);
                resolve(url);
              });

              download.download();
            });
          };

          /**
           * Append current url to context
           */
          this.context.targetUrl = this.url;

          resolve();
        } else {
          reject(new Error('Fetch data error'));
        }
      });

      this.request.addListener('onerror', error => {
        reject(error);
      })

      this.request.send();
    });
  }

  /**
   * Abort request
   */
  abort() {
    if (this.request) {
      this.request.abort();
    }
  }
}

export default EpisodeParser;
