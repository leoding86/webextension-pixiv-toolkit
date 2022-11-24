import { RuntimeError } from "@/errors";
import DateFormatter from "@/modules/Util/DateFormatter";
import md5 from "md5";
import moment from "moment";
import Request from "@/modules/Net/Request";

/**
 * @class
 */
class EpisodeParser {
  /**
   * @type {string} yek
   */
   yek = 'm' + 'A' + 't' + 'W' + '1' + 'X' + '8' + 'S' + 'z' + 'G' + 'S' + '8' + '8' + '0' + 'f' + 's' + 'j' + 'E' + 'X' + 'l' + 'M' + '7' + '3' + 'Q' + 'p' + 'S' + '1' + 'i' + '4' + 'k' + 'U' + 'M' + 'B' + 'h' + 'y' + 'h' + 'd' + 'a' + 'Y' + 'y' + 'S' + 'k' + '8' + 'n' + 'W' + 'z' + '5' + '3' + '3' + 'n' + 'r' + 'E' + 'u' + 'n' + 'a' + 'S' + 'p' + 'l' + 'g' + '6' + '3' + 'f' + 'z' + 'T';

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
    return `https://comic.pixiv.net/api/app/episodes/${id}/read_v2`;
   }

   /**
    * Make context standard
    * @param {object} context
    * @returns {object}
    */
    standardContext(context) {
      let sContext = {
        id: context.reading_episode.id,
        title: context.reading_episode.title,
        subTitle: context.reading_episode.sub_title,
        cover: '',
        numberingTitle: context.reading_episode.numbering_title,
        workId: context.reading_episode.work_id,
        workTitle: context.reading_episode.work_title,
        pages: context.reading_episode.pages.map(item => item.url),
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

    return new Promise((resolve, reject) => {
      let clientTime = moment().format('YYYY-MM-DDTHH:mm:ssZ');
      let clientHash = md5(clientTime.concat(this.yek));

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
