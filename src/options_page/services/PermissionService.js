import AbstractService from "./AbstractService";
import browser from "@/modules/Extension/browser";

class PermissionService extends AbstractService {
  static instance;

  static getService() {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }

    return PermissionService.instance;
  }

  requestPermissions({ permissions }) {
    return new Promise(resolve => {
      browser.permissions.request(permissions, result => {
        resolve(result);
      })
    });
  }

  removePermissions({ permissions }) {
    return new Promise(resolve => {
      browser.permissions.remove(permissions, result => {
        resolve(result);
      });
    });
  }

  containsPermissions({ permissions }) {
    return new Promise(resolve => {
      browser.permissions.contains(permissions, result => {
        resolve(result);
      });
    });
  }
}

export default PermissionService;
