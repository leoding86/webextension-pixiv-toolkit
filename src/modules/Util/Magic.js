const Magic = {
  getCSvar (obj, type) {
    let randomStr = Date.now();
    let injectDom = document.createElement('div');
    injectDom.setAttribute('id', 'dom-' + randomStr);
    injectDom.setAttribute('style', 'display:none');
    document.documentElement.appendChild(injectDom);
    let script = '(function(){';
    script += 'var string = null;';
    script += 'try {';
    script += 'if (typeof ' + obj + ' == "string") string = ' + obj + ';';
    script += 'else if (typeof ' + obj + ' == "object") string = JSON.stringify(' + obj + ');';
    script += '} catch (e) {';
    script += 'string = null';
    script += '}';
    script += 'document.querySelector("#dom-' + randomStr + '").setAttribute("data", string);';
    script += '})()';
    let injectScript = document.createElement('script');
    injectScript.setAttribute('id', 'js-' + randomStr);
    injectScript.setAttribute('style', 'display:none');
    injectScript[(injectScript.innerText === undefined ? 'textContent' : 'innerText')] = script;
    document.documentElement.appendChild(injectScript);
    let domData = document.querySelector('#dom-' + randomStr).getAttribute('data');

    // clearup
    document.querySelector('#dom-' + randomStr).remove();
    document.querySelector('#js-' + randomStr).remove();

    if (type === 'string')
      return domData;
    else if (type === 'object' || type === 'json')
      return JSON.parse(domData);
    else
      return null;
  }
};

export default Magic;
