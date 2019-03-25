_pumd.NovalAdapter = (function(common) {
    var NovalAdapter = {};

    NovalAdapter.getNovalInstance = function() {
        return new Noval190115();
    };

    var noval = NovalAdapter.getNovalInstance();
})(_pumd.common);