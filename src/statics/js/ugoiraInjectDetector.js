(function (window, browser, ptk) {
    if (window._pumdInjected) {
        // console.log('Ugoira scripts injected');
        // console.log(ptk);
        let ugoiraToolkit = ptk.ugoiraAdapter.ugoiraToolkit;

        ugoiraToolkit.destroy();
        ptk.ugoiraAdapter.inital().then(function (context) {
            // console.log(context);
            ugoiraToolkit.context = context;
            ugoiraToolkit.run();
        });
        return;
    }

    // console.log('Inject ugoira');

    window._pumdInjected = true;

    browser.runtime.sendMessage({
        action: 'injectUgoira'
    });
})(window, chrome, window._pumd);