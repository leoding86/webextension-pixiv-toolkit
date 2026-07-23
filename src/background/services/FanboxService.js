import AbstractService from "./AbstractService";

/**
 * @class Fanbox service
 *
 * Fanbox serves its posts on `www.fanbox.cc` / `<creator>.fanbox.cc` but exposes
 * its data through `api.fanbox.cc`. A credentialed request from the content
 * script to that api is cross-origin, so it depends on the response carrying the
 * right `Access-Control-Allow-Origin` / `Access-Control-Allow-Credentials`
 * headers. Under manifest v2 those headers were rewritten by the (now removed)
 * blocking webRequest handler; manifest v3 can't rewrite them for a credentialed
 * request, which broke Fanbox (see issues #268 and #334).
 *
 * Fetching from the background service worker sidesteps the problem entirely:
 * requests made here run with the extension's host permissions and aren't
 * subject to page CORS, while `credentials: 'include'` still carries the Fanbox
 * session cookie so supporter-only posts resolve.
 */
class FanboxService extends AbstractService {
  /**
   * @type {FanboxService}
   */
  static instance;

  /**
   * @returns {FanboxService}
   */
  static getService() {
    if (!FanboxService.instance) {
      FanboxService.instance = new FanboxService();
    }

    return FanboxService.instance;
  }

  /**
   * Fetch a post's context data from the Fanbox api.
   * @param {{ postId: string }} param0
   * @returns {Promise<object>} The parsed api response, or an `{ error }` object
   */
  async postInfo({ postId }) {
    try {
      let response = await fetch(`https://api.fanbox.cc/post.info?postId=${postId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { error: `Fanbox api responded with status ${response.status}` };
      }

      return await response.json();
    } catch (error) {
      return { error: error.message || String(error) };
    }
  }
}

export default FanboxService;
