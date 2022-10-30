import AbstractService from "./AbstractService";
import browser from "@/modules/Extension/browser"

class BadgeService extends AbstractService {
  static instance;

  static getService() {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }

    return BadgeService.instance;
  }

  activeIcon({ sender }) {
    browser.action.setIcon({
      path: browser.runtime.getURL('./icon_active.png'),
      tabId: sender.tab.id,
    });
  }

  deactiveAction({ sender }) {
    browser.action.setIcon({
      path: browser.runtime.getURL('./icon.png'),
      tabId: sender.tab.id,
    });
  }
}

export default BadgeService;
