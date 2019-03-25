function bootstrap(App) {
    if (App && typeof App.prototype.run === 'function') {
        (new App).run();
    }
}

module.exports = bootstrap;
