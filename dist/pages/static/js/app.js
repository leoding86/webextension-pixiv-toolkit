webpackJsonp([1],[
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_promise__ = __webpack_require__(55);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_promise___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_promise__);

var cr = {
    _e: function _e(string) {
        return chrome.i18n.getMessage(string);
    },

    _s: {
        get: function get(key) {
            return new __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_promise___default.a(function (resolve) {
                chrome.storage.local.get(key, function (items) {
                    return resolve(items);
                });
            });
        },
        set: function set(object) {
            return new __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_promise___default.a(function (resolve) {
                chrome.storage.local.set(object, function () {
                    return resolve();
                });
            });
        },
        remove: function remove(key) {
            return new __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_promise___default.a(function (resolve) {
                chrome.storage.local.remove(key, function () {
                    return resolve();
                });
            });
        }
    }
};

/* harmony default export */ __webpack_exports__["a"] = (cr);

/***/ }),
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
  data: function data() {
    return {
      inputPos: 0,
      renameFormat: ''
    };
  },


  methods: {
    setInputCursor: function setInputCursor(input, holder) {
      var self = this;
      var pos = this.inputPos + holder.length;

      setTimeout(function () {
        input.focus();
        input.setSelectionRange(pos, pos);
        self.inputPos = pos;
      });
    },

    updateInputPos: function updateInputPos(event) {
      this.inputPos = event.target.selectionStart;
    },

    updateFormat: function updateFormat(holder) {
      this.renameFormat = this.renameFormat.slice(0, this.inputPos) + holder + this.renameFormat.slice(this.inputPos);
    }
  }
});

/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuetify__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vuetify___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vuetify__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuetify_dist_vuetify_min_css__ = __webpack_require__(54);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vuetify_dist_vuetify_min_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_vuetify_dist_vuetify_min_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__modules_cr__ = __webpack_require__(2);
//
//
//
//
//
//
//
//
//
//
//
//
//






__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_1_vuetify___default.a);

/* harmony default export */ __webpack_exports__["a"] = ({
    name: 'App',
    methods: {
        lt: function lt(string) {
            return __WEBPACK_IMPORTED_MODULE_3__modules_cr__["a" /* default */]._e(string);
        }
    }
});

/***/ }),
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__assets_global_scss__ = __webpack_require__(97);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__assets_global_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__assets_global_scss__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__modules_cr__ = __webpack_require__(2);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["a"] = ({
    name: 'Options',

    data: function data() {
        return {
            quanlityItems: [{
                text: __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._e('ugoira_normal'),
                value: 10
            }, {
                text: __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._e('ugoira_good'),
                value: 5
            }, {
                text: __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._e('ugoira_best'),
                value: 1
            }],
            ugoiraQuanlity: 10,
            ugoiraRenameFormat: '',
            mangaRenameFormat: '',
            mangaImageRenameFormat: '',
            enableExtension: true,
            enablePackUgoiraFramesInfo: true
        };
    },
    mounted: function mounted() {
        var self = this;

        __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._s.get(null).then(function (items) {
            self.ugoiraQuanlity = items.ugoiraQuanlity ? items.ugoiraQuanlity : self.ugoiraQuanlity;
            self.ugoiraRenameFormat = items.ugoiraRenameFormat ? items.ugoiraRenameFormat : '';
            self.mangaRenameFormat = items.mangaRenameFormat ? items.mangaRenameFormat : '';
            self.mangaImageRenameFormat = items.mangaImageRenameFormat ? items.mangaImageRenameFormat : '';
            self.enableExtension = items.enableExtension ? items.enableExtension : '';
            self.enablePackUgoiraFramesInfo = !!items.enablePackUgoiraFramesInfo;
        });
    },
    beforeRouteUpdate: function beforeRouteUpdate(to, from, next) {
        var self = this;

        if (from.name === 'RenameManga') {
            __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._s.get('mangaRenameFormat').then(function (items) {
                self.mangaRenameFormat = items.mangaRenameFormat;
            });
        } else if (from.name === 'RenameMangaImage') {
            __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._s.get('mangaImageRenameFormat').then(function (items) {
                self.mangaImageRenameFormat = items.mangaImageRenameFormat;
            });
        } else if (from.name === 'RenameUgoira') {
            __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._s.get('ugoiraRenameFormat').then(function (items) {
                self.ugoiraRenameFormat = items.ugoiraRenameFormat;
            });
        }

        next();
    },


    computed: {
        ugoiraRenameFormatPreview: function ugoiraRenameFormatPreview() {
            if (!!this.ugoiraRenameFormat) {
                return this.ugoiraRenameFormat;
            } else {
                return 'Not set';
            }
        },
        mangaRenameFormatPreview: function mangaRenameFormatPreview() {
            if (!!this.mangaRenameFormat) {
                return this.mangaRenameFormat;
            } else {
                return 'Not set';
            }
        },
        mangaImageRenameFormatPreview: function mangaImageRenameFormatPreview() {
            if (!!this.mangaImageRenameFormat) {
                return this.mangaImageRenameFormat;
            } else {
                return 'Not set';
            }
        }
    },

    watch: {
        enableExtension: function enableExtension(val) {
            __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._s.set({
                enableExtension: val
            }).then(function () {
                window.cr.storage.items.enableExtend = val;
            });
        }
    },

    methods: {
        tileClickHandler: function tileClickHandler(evt) {
            // console.log(1);
        },

        showRenameUgoiraDialog: function showRenameUgoiraDialog(evt) {
            this.$router.push({
                name: 'RenameUgoira',
                params: {
                    renameFormat: this.ugoiraRenameFormat
                }
            });
        },

        showRenameMangaDialog: function showRenameMangaDialog(evt) {
            this.$router.push({
                name: 'RenameManga',
                params: {
                    renameFormat: this.mangaRenameFormat
                }
            });
        },

        showRenameMangaImageDialog: function showRenameMangaImageDialog(evt) {
            this.$router.push({
                name: 'RenameMangaImage',
                params: {
                    renameFormat: this.mangaImageRenameFormat
                }
            });
        },

        showUgoiraExtendDialog: function showUgoiraExtendDialog(evt) {
            this.$router.push('ugoira-extend');
        },

        onUgoiraQuanlityChangeHandler: function onUgoiraQuanlityChangeHandler() {
            var _this = this;
            __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._s.set({ 'ugoiraQuanlity': _this.ugoiraQuanlity });
        },

        onEnablePackUgoiraFramesInfoChangedHandler: function onEnablePackUgoiraFramesInfoChangedHandler() {
            var _this = this;
            __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._s.set({ 'enablePackUgoiraFramesInfo': this.enablePackUgoiraFramesInfo });
        },

        tl: function tl(string) {
            return __WEBPACK_IMPORTED_MODULE_1__modules_cr__["a" /* default */]._e(string);
        }
    }
});

/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modules_cr__ = __webpack_require__(2);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["a"] = ({
    name: 'UgoiraExtendDialog',
    data: function data() {
        return {
            showDialog: true,
            secondsItems: [1, 2, 3],
            extendDurationItems: [3, 4, 5],
            enableExtend: false,
            enableWhenUnderSeconds: 1,
            extendDuration: 3
        };
    },
    mounted: function mounted() {
        this.enableWhenUnderSeconds = window.cr.storage.items.enableWhenUnderSeconds;
        this.extendDuration = window.cr.storage.items.extendDuration;
        this.enableExtend = window.cr.storage.items.enableExtend;
    },

    watch: {
        showDialog: function showDialog(val) {
            if (!!val === false) {
                this.$router.go(-1);
            }
        },
        enableExtend: function enableExtend(val) {
            __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._s.set({
                enableExtend: val
            }).then(function () {
                window.cr.storage.items.enableExtend = val;
            });
        }
    },
    methods: {
        onEnableWhenUnderSecondsChangeHandler: function onEnableWhenUnderSecondsChangeHandler(evt) {
            var _this = this;
            __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._s.set({
                enableWhenUnderSeconds: _this.enableWhenUnderSeconds
            }).then(function () {
                window.cr.storage.items.enableWhenUnderSeconds = _this.enableWhenUnderSeconds;
            });
        },
        onExtendDurationChangeHandler: function onExtendDurationChangeHandler(evt) {
            var _this = this;
            __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._s.set({
                extendDuration: _this.extendDuration
            }).then(function () {
                window.cr.storage.items.extendDuration = _this.extendDuration;
            });
        },
        lt: function lt(string) {
            return __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e(string);
        }
    }
});

/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modules_cr__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__mixins_renameFormatMixin__ = __webpack_require__(27);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["a"] = ({
  name: "RenameUgoiraDialog",

  mixins: [__WEBPACK_IMPORTED_MODULE_1__mixins_renameFormatMixin__["a" /* default */]],

  data: function data() {
    return {
      showDialog: true,
      metasConfig: [{
        title: __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e("id"),
        holder: "{id}"
      }, {
        title: __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e("title"),
        holder: "{title}"
      }, {
        title: __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e("author"),
        holder: "{author}"
      }, {
        title: __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e("author_id"),
        holder: "{authorId}"
      }]
    };
  },


  watch: {
    showDialog: function showDialog(val) {
      if (!!val === false) {
        this.$router.go(-1);
      }
    },

    renameFormat: function renameFormat(val) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      this.saveTimeout = setTimeout(function () {
        __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._s.set({
          ugoiraRenameFormat: val
        }).then(function () {
          // console.log('Ugoira rename format saved');
        });
      }, 300);
    }
  },

  mounted: function mounted() {
    if (!!this.$route.params.renameFormat) {
      this.renameFormat = this.$route.params.renameFormat;
    }
  },


  methods: {
    pickMeta: function pickMeta(meta) {
      this.updateFormat(meta.holder);
      this.setInputCursor(this.$refs.renameInput.$refs.input, meta.holder);
    },

    lt: function lt(string) {
      return __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e(string);
    }
  }
});

/***/ }),
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modules_cr__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__mixins_renameFormatMixin__ = __webpack_require__(27);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["a"] = ({
  name: "RenameMangaDialog",

  mixins: [__WEBPACK_IMPORTED_MODULE_1__mixins_renameFormatMixin__["a" /* default */]],

  data: function data() {
    return {
      showDialog: true,
      saveTimeout: null,
      metasConfig: [{
        title: __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e("id"),
        holder: "{id}"
      }, {
        title: __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e("author_id"),
        holder: "{authorId}"
      }]
    };
  },


  watch: {
    showDialog: function showDialog(val) {
      if (!!val === false) {
        this.$router.go(-1);
      }
    },

    renameFormat: function renameFormat(val) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      this.saveTimeout = setTimeout(function () {
        __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._s.set({
          mangaRenameFormat: val
        }).then(function () {
          // console.log('Manga rename format saved');
        });
      }, 300);
    }
  },

  mounted: function mounted() {
    if (!!this.$route.params.renameFormat) {
      this.renameFormat = this.$route.params.renameFormat;
    }
  },


  methods: {
    pickMeta: function pickMeta(meta) {
      this.updateFormat(meta.holder);
      this.setInputCursor(this.$refs.renameInput.$refs.input, meta.holder);
    },

    lt: function lt(string) {
      return __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e(string);
    }
  }
});

/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modules_cr__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__mixins_renameFormatMixin__ = __webpack_require__(27);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["a"] = ({
  name: "RenameMangaImageDialog",

  mixins: [__WEBPACK_IMPORTED_MODULE_1__mixins_renameFormatMixin__["a" /* default */]],

  data: function data() {
    return {
      showDialog: true,
      metasConfig: [{
        title: __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e("id"),
        holder: "{id}"
      }, {
        title: __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e("author_id"),
        holder: "{authorId}"
      }, {
        title: __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e("page_num"),
        holder: "{pageNum}"
      }]
    };
  },


  watch: {
    showDialog: function showDialog(val) {
      if (!!val === false) {
        this.$router.go(-1);
      }
    },

    renameFormat: function renameFormat(val) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      this.saveTimeout = setTimeout(function () {
        __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._s.set({
          mangaImageRenameFormat: val
        }).then(function () {
          // console.log('Manga Image rename format saved');
        });
      }, 300);
    }
  },

  mounted: function mounted() {
    if (!!this.$route.params.renameFormat) {
      this.renameFormat = this.$route.params.renameFormat;
    }
  },


  methods: {
    pickMeta: function pickMeta(meta) {
      this.updateFormat(meta.holder);
      this.setInputCursor(this.$refs.renameInput.$refs.input, meta.holder);
    },

    lt: function lt(string) {
      return __WEBPACK_IMPORTED_MODULE_0__modules_cr__["a" /* default */]._e(string);
    }
  }
});

/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__router__ = __webpack_require__(92);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__modules_cr__ = __webpack_require__(2);





__WEBPACK_IMPORTED_MODULE_0_vue__["default"].config.productionTip = false;
window.cr = {};

__WEBPACK_IMPORTED_MODULE_3__modules_cr__["a" /* default */]._s.get().then(function (items) {
    window.cr = {
        storage: {
            items: items
        }

        /* eslint-disable no-new */
    };new __WEBPACK_IMPORTED_MODULE_0_vue__["default"]({
        el: '#app',
        router: __WEBPACK_IMPORTED_MODULE_2__router__["a" /* default */],
        render: function render(h) {
            return h(__WEBPACK_IMPORTED_MODULE_1__App__["a" /* default */]);
        }
    });
});

/***/ }),
/* 48 */,
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(28);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_992092a6_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(91);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(50)
}
var normalizeComponent = __webpack_require__(7)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_992092a6_hasScoped_false_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/pages/App.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-992092a6", Component.options)
  } else {
    hotAPI.reload("data-v-992092a6", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(51);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(6)("445392fc", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../node_modules/css-loader/index.js?{}!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-992092a6\",\"scoped\":false,\"hasInlineConfig\":false}!../../node_modules/sass-loader/lib/loader.js?{}!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./App.vue", function() {
     var newContent = require("!!../../node_modules/css-loader/index.js?{}!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-992092a6\",\"scoped\":false,\"hasInlineConfig\":false}!../../node_modules/sass-loader/lib/loader.js?{}!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./App.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)(false);
// imports


// module
exports.push([module.i, "\n#app .v-primary {\n  background: #3367d6;\n  color: #fff;\n}\n#app .v-toolbar {\n  min-height: 56px;\n}\n", ""]);

// exports


/***/ }),
/* 52 */,
/* 53 */,
/* 54 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "app" } },
    [
      _c(
        "v-app",
        [
          _c(
            "v-toolbar",
            {
              staticClass: "v-primary",
              attrs: { app: "", absolute: "", "clipped-left": "", height: "56" }
            },
            [
              _c("span", { staticClass: "title v-primary" }, [
                _vm._v(_vm._s(_vm.lt("extName")))
              ])
            ]
          ),
          _vm._v(" "),
          _c("v-content", [_c("router-view")], 1)
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-992092a6", esExports)
  }
}

/***/ }),
/* 92 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router__ = __webpack_require__(93);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_Options__ = __webpack_require__(94);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_UgoiraExtendDialog__ = __webpack_require__(99);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__components_RenameUgoiraDialog__ = __webpack_require__(103);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_RenameMangaDialog__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_RenameMangaImageDialog__ = __webpack_require__(111);








__WEBPACK_IMPORTED_MODULE_0_vue__["default"].use(__WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]({
    routes: [{
        path: '/',
        name: 'Options',
        component: __WEBPACK_IMPORTED_MODULE_2__components_Options__["a" /* default */],
        children: [{
            path: 'ugoira-extend',
            name: 'UgoiraExtend',
            component: __WEBPACK_IMPORTED_MODULE_3__components_UgoiraExtendDialog__["a" /* default */]
        }, {
            path: 'rename-ugoira',
            name: 'RenameUgoira',
            component: __WEBPACK_IMPORTED_MODULE_4__components_RenameUgoiraDialog__["a" /* default */]
        }, {
            path: 'rename-manga',
            name: 'RenameManga',
            component: __WEBPACK_IMPORTED_MODULE_5__components_RenameMangaDialog__["a" /* default */]
        }, {
            path: 'rename-manga-image',
            name: 'RenameMangaImage',
            component: __WEBPACK_IMPORTED_MODULE_6__components_RenameMangaImageDialog__["a" /* default */]
        }]
    }]
}));

/***/ }),
/* 93 */,
/* 94 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Options_vue__ = __webpack_require__(42);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_bc5328ee_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Options_vue__ = __webpack_require__(98);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(95)
}
var normalizeComponent = __webpack_require__(7)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-bc5328ee"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Options_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_bc5328ee_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Options_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/pages/components/Options.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-bc5328ee", Component.options)
  } else {
    hotAPI.reload("data-v-bc5328ee", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(96);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(6)("66fc30be", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-bc5328ee\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/sass-loader/lib/loader.js?{}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Options.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-bc5328ee\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/sass-loader/lib/loader.js?{}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Options.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)(false);
// imports


// module
exports.push([module.i, "\n#app .card-title[data-v-bc5328ee] {\n  display: block;\n  font-size: 18px;\n  margin-bottom: 10px;\n}\n", ""]);

// exports


/***/ }),
/* 97 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 98 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "v-container",
    { staticStyle: { "max-width": "640px" } },
    [
      _c("span", { staticClass: "card-title" }, [_vm._v("Ugoira")]),
      _vm._v(" "),
      _c(
        "v-card",
        { staticStyle: { "margin-bottom": "30px" } },
        [
          _c(
            "v-list",
            { attrs: { "two-line": "" } },
            [
              _c(
                "v-list-tile",
                {
                  on: {
                    click: function($event) {
                      return _vm.showRenameUgoiraDialog()
                    }
                  }
                },
                [
                  _c(
                    "v-list-tile-content",
                    [
                      _c("v-list-tile-title", [_vm._v("Rename ugoira file")]),
                      _vm._v(" "),
                      _c("v-list-tile-sub-title", [
                        _vm._v(_vm._s(_vm.ugoiraRenameFormatPreview))
                      ])
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-list-tile-action",
                    [
                      _c(
                        "v-btn",
                        { attrs: { icon: "", ripple: "" } },
                        [_c("v-icon", [_vm._v("keyboard_arrow_right")])],
                        1
                      )
                    ],
                    1
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-list-tile",
                [
                  _c(
                    "v-list-tile-content",
                    [
                      _c("v-list-tile-title", [
                        _vm._v(_vm._s(_vm.tl("quality")))
                      ])
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-list-tile-action",
                    [
                      _c("v-select", {
                        attrs: { items: _vm.quanlityItems, type: "value" },
                        on: { change: _vm.onUgoiraQuanlityChangeHandler },
                        model: {
                          value: _vm.ugoiraQuanlity,
                          callback: function($$v) {
                            _vm.ugoiraQuanlity = $$v
                          },
                          expression: "ugoiraQuanlity"
                        }
                      })
                    ],
                    1
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-list-tile",
                [
                  _c(
                    "v-list-tile-content",
                    [
                      _c("v-list-tile-title", [
                        _vm._v(_vm._s(_vm.tl("pack_ugoira_frames_info")))
                      ]),
                      _vm._v(" "),
                      _c("v-list-tile-sub-title", [
                        _vm._v(
                          _vm._s(_vm.tl("pack_ugoira_frames_info_into_zip"))
                        )
                      ])
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-list-tile-action",
                    [
                      _c("v-switch", {
                        on: {
                          change: _vm.onEnablePackUgoiraFramesInfoChangedHandler
                        },
                        model: {
                          value: _vm.enablePackUgoiraFramesInfo,
                          callback: function($$v) {
                            _vm.enablePackUgoiraFramesInfo = $$v
                          },
                          expression: "enablePackUgoiraFramesInfo"
                        }
                      })
                    ],
                    1
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-list-tile",
                {
                  on: {
                    click: function($event) {
                      return _vm.showUgoiraExtendDialog()
                    }
                  }
                },
                [
                  _c(
                    "v-list-tile-content",
                    [
                      _c("v-list-tile-title", [
                        _vm._v(_vm._s(_vm.tl("extend_duration")))
                      ]),
                      _vm._v(" "),
                      _c("v-list-tile-sub-title", [
                        _vm._v(_vm._s(_vm.tl("extend_duration_desc")))
                      ])
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-list-tile-action",
                    [
                      _c(
                        "v-btn",
                        { attrs: { icon: "", ripple: "" } },
                        [_c("v-icon", [_vm._v("keyboard_arrow_right")])],
                        1
                      )
                    ],
                    1
                  )
                ],
                1
              )
            ],
            1
          )
        ],
        1
      ),
      _vm._v(" "),
      _c("span", { staticClass: "card-title" }, [_vm._v("Manga")]),
      _vm._v(" "),
      _c(
        "v-card",
        [
          _c(
            "v-list",
            { attrs: { "two-line": "" } },
            [
              _c(
                "v-list-tile",
                {
                  on: {
                    click: function($event) {
                      return _vm.showRenameMangaDialog()
                    }
                  }
                },
                [
                  _c(
                    "v-list-tile-content",
                    [
                      _c("v-list-tile-title", [_vm._v("Rename manga file")]),
                      _vm._v(" "),
                      _c("v-list-tile-sub-title", [
                        _vm._v(_vm._s(_vm.mangaRenameFormatPreview))
                      ])
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-list-tile-action",
                    [
                      _c(
                        "v-btn",
                        { attrs: { icon: "", ripple: "" } },
                        [_c("v-icon", [_vm._v("keyboard_arrow_right")])],
                        1
                      )
                    ],
                    1
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-list-tile",
                {
                  on: {
                    click: function($event) {
                      return _vm.showRenameMangaImageDialog()
                    }
                  }
                },
                [
                  _c(
                    "v-list-tile-content",
                    [
                      _c("v-list-tile-title", [
                        _vm._v("Rename manga image file")
                      ]),
                      _vm._v(" "),
                      _c("v-list-tile-sub-title", [
                        _vm._v(_vm._s(_vm.mangaImageRenameFormatPreview))
                      ])
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-list-tile-action",
                    [
                      _c(
                        "v-btn",
                        { attrs: { icon: "", ripple: "" } },
                        [_c("v-icon", [_vm._v("keyboard_arrow_right")])],
                        1
                      )
                    ],
                    1
                  )
                ],
                1
              )
            ],
            1
          )
        ],
        1
      ),
      _vm._v(" "),
      _c("router-view")
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-bc5328ee", esExports)
  }
}

/***/ }),
/* 99 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_UgoiraExtendDialog_vue__ = __webpack_require__(43);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_175a4ca2_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_UgoiraExtendDialog_vue__ = __webpack_require__(102);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(100)
}
var normalizeComponent = __webpack_require__(7)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-175a4ca2"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_UgoiraExtendDialog_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_175a4ca2_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_UgoiraExtendDialog_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/pages/components/UgoiraExtendDialog.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-175a4ca2", Component.options)
  } else {
    hotAPI.reload("data-v-175a4ca2", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(101);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(6)("6930faf4", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-175a4ca2\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./UgoiraExtendDialog.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-175a4ca2\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./UgoiraExtendDialog.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)(false);
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ }),
/* 102 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "v-dialog",
    {
      attrs: { "max-width": "560" },
      model: {
        value: _vm.showDialog,
        callback: function($$v) {
          _vm.showDialog = $$v
        },
        expression: "showDialog"
      }
    },
    [
      _c(
        "v-card",
        [
          _c(
            "v-list",
            { attrs: { "two-line": "" } },
            [
              _c(
                "v-list-tile",
                [
                  _c(
                    "v-list-tile-content",
                    [
                      _c("v-list-tile-title", [
                        _vm._v(_vm._s(_vm.lt("extend_enable")))
                      ])
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-list-tile-action",
                    [
                      _c("v-switch", {
                        model: {
                          value: _vm.enableExtend,
                          callback: function($$v) {
                            _vm.enableExtend = $$v
                          },
                          expression: "enableExtend"
                        }
                      })
                    ],
                    1
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-list-tile",
                [
                  _c(
                    "v-list-tile-content",
                    [
                      _c("v-list-tile-title", [
                        _vm._v(_vm._s(_vm.lt("extend_duration_desc")))
                      ]),
                      _vm._v(" "),
                      _c("v-list-tile-sub-title", [
                        _vm._v(_vm._s(_vm.lt("enable_extend_desc")))
                      ])
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-list-tile-action",
                    [
                      _c("v-select", {
                        staticStyle: { "max-width": "100px" },
                        attrs: {
                          items: _vm.secondsItems,
                          disabled: !_vm.enableExtend
                        },
                        on: {
                          change: function($event) {
                            return _vm.onEnableWhenUnderSecondsChangeHandler()
                          }
                        },
                        model: {
                          value: _vm.enableWhenUnderSeconds,
                          callback: function($$v) {
                            _vm.enableWhenUnderSeconds = $$v
                          },
                          expression: "enableWhenUnderSeconds"
                        }
                      })
                    ],
                    1
                  )
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-list-tile",
                [
                  _c(
                    "v-list-tile-content",
                    [
                      _c("v-list-tile-title", [
                        _vm._v(_vm._s(_vm.lt("extend_duration_seconds_title")))
                      ])
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "v-list-tile-action",
                    [
                      _c("v-select", {
                        staticStyle: { "max-width": "100px" },
                        attrs: {
                          items: _vm.extendDurationItems,
                          disabled: !_vm.enableExtend
                        },
                        on: {
                          change: function($event) {
                            return _vm.onExtendDurationChangeHandler()
                          }
                        },
                        model: {
                          value: _vm.extendDuration,
                          callback: function($$v) {
                            _vm.extendDuration = $$v
                          },
                          expression: "extendDuration"
                        }
                      })
                    ],
                    1
                  )
                ],
                1
              )
            ],
            1
          )
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-175a4ca2", esExports)
  }
}

/***/ }),
/* 103 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_RenameUgoiraDialog_vue__ = __webpack_require__(44);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_53cbd186_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_RenameUgoiraDialog_vue__ = __webpack_require__(106);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(104)
}
var normalizeComponent = __webpack_require__(7)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-53cbd186"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_RenameUgoiraDialog_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_53cbd186_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_RenameUgoiraDialog_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/pages/components/RenameUgoiraDialog.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-53cbd186", Component.options)
  } else {
    hotAPI.reload("data-v-53cbd186", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(105);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(6)("b60b7874", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-53cbd186\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./RenameUgoiraDialog.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-53cbd186\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./RenameUgoiraDialog.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)(false);
// imports


// module
exports.push([module.i, "\nbutton[data-v-53cbd186] {\r\n  margin-left: 0;\r\n  margin-right: 16px;\n}\nh3[data-v-53cbd186] {\r\n  font-size: 1.2em;\r\n  padding: 10px 0;\n}\nv-input[data-v-53cbd186] {\r\n  margin-top: 0;\n}\r\n", ""]);

// exports


/***/ }),
/* 106 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "v-dialog",
    {
      attrs: { "max-width": "560" },
      model: {
        value: _vm.showDialog,
        callback: function($$v) {
          _vm.showDialog = $$v
        },
        expression: "showDialog"
      }
    },
    [
      _c(
        "v-card",
        [
          _c("v-card-text", [
            _c("h2", [_vm._v(_vm._s(_vm.lt("rename_ugoira")))]),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "section-block" },
              [
                _c("h3", [_vm._v(_vm._s(_vm.lt("quick_picks")))]),
                _vm._v(" "),
                _vm._l(_vm.metasConfig, function(meta) {
                  return _c(
                    "v-btn",
                    {
                      key: meta.value,
                      attrs: { small: "", ripple: false, color: "info" },
                      on: {
                        click: function($event) {
                          return _vm.pickMeta(meta)
                        }
                      }
                    },
                    [_vm._v(_vm._s(meta.title))]
                  )
                })
              ],
              2
            ),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "section-block" },
              [
                _c("h3", [_vm._v(_vm._s(_vm.lt("rename_format")))]),
                _vm._v(" "),
                _c("v-text-field", {
                  ref: "renameInput",
                  staticClass: "v-input-first",
                  attrs: {
                    placeholder: "Not set",
                    hint: "Example: {authorId}_{author}_{id}_{title}",
                    "persistent-hint": true
                  },
                  on: {
                    focus: _vm.updateInputPos,
                    keyup: _vm.updateInputPos,
                    click: _vm.updateInputPos
                  },
                  model: {
                    value: _vm.renameFormat,
                    callback: function($$v) {
                      _vm.renameFormat = $$v
                    },
                    expression: "renameFormat"
                  }
                })
              ],
              1
            )
          ])
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-53cbd186", esExports)
  }
}

/***/ }),
/* 107 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_RenameMangaDialog_vue__ = __webpack_require__(45);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_58b31d29_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_RenameMangaDialog_vue__ = __webpack_require__(110);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(108)
}
var normalizeComponent = __webpack_require__(7)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-58b31d29"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_RenameMangaDialog_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_58b31d29_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_RenameMangaDialog_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/pages/components/RenameMangaDialog.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-58b31d29", Component.options)
  } else {
    hotAPI.reload("data-v-58b31d29", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(109);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(6)("f2b2d434", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-58b31d29\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./RenameMangaDialog.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-58b31d29\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./RenameMangaDialog.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)(false);
// imports


// module
exports.push([module.i, "\nbutton[data-v-58b31d29] {\r\n  margin-left: 0;\r\n  margin-right: 16px;\n}\nh3[data-v-58b31d29] {\r\n  font-size: 1.2em;\r\n  padding: 10px 0;\n}\nv-input[data-v-58b31d29] {\r\n  margin-top: 0;\n}\r\n", ""]);

// exports


/***/ }),
/* 110 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "v-dialog",
    {
      attrs: { "max-width": "560" },
      model: {
        value: _vm.showDialog,
        callback: function($$v) {
          _vm.showDialog = $$v
        },
        expression: "showDialog"
      }
    },
    [
      _c(
        "v-card",
        [
          _c("v-card-text", [
            _c("h2", [_vm._v(_vm._s(_vm.lt("rename_manga")))]),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "section-block" },
              [
                _c("h3", [_vm._v(_vm._s(_vm.lt("quick_picks")))]),
                _vm._v(" "),
                _vm._l(_vm.metasConfig, function(meta) {
                  return _c(
                    "v-btn",
                    {
                      key: meta.value,
                      attrs: { small: "", ripple: false, color: "info" },
                      on: {
                        click: function($event) {
                          return _vm.pickMeta(meta)
                        }
                      }
                    },
                    [_vm._v(_vm._s(meta.title))]
                  )
                })
              ],
              2
            ),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "section-block" },
              [
                _c("h3", [_vm._v(_vm._s(_vm.lt("rename_format")))]),
                _vm._v(" "),
                _c("v-text-field", {
                  ref: "renameInput",
                  staticClass: "v-input-first",
                  attrs: {
                    placeholder: "Not set",
                    hint: "Example: {authorId}_{id}",
                    "persistent-hint": true
                  },
                  on: {
                    focus: _vm.updateInputPos,
                    keyup: _vm.updateInputPos,
                    click: _vm.updateInputPos
                  },
                  model: {
                    value: _vm.renameFormat,
                    callback: function($$v) {
                      _vm.renameFormat = $$v
                    },
                    expression: "renameFormat"
                  }
                })
              ],
              1
            )
          ])
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-58b31d29", esExports)
  }
}

/***/ }),
/* 111 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_RenameMangaImageDialog_vue__ = __webpack_require__(46);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a3f8a01c_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_RenameMangaImageDialog_vue__ = __webpack_require__(114);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(112)
}
var normalizeComponent = __webpack_require__(7)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-a3f8a01c"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_RenameMangaImageDialog_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a3f8a01c_hasScoped_true_transformToRequire_video_src_poster_source_src_img_src_image_xlink_href_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_RenameMangaImageDialog_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/pages/components/RenameMangaImageDialog.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-a3f8a01c", Component.options)
  } else {
    hotAPI.reload("data-v-a3f8a01c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(113);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(6)("f0325e7e", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-a3f8a01c\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./RenameMangaImageDialog.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js?{}!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-a3f8a01c\",\"scoped\":true,\"hasInlineConfig\":false}!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./RenameMangaImageDialog.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)(false);
// imports


// module
exports.push([module.i, "\nbutton[data-v-a3f8a01c] {\r\n  margin-left: 0;\r\n  margin-right: 16px;\n}\nh3[data-v-a3f8a01c] {\r\n  font-size: 1.2em;\r\n  padding: 10px 0;\n}\nv-input[data-v-a3f8a01c] {\r\n  margin-top: 0;\n}\r\n", ""]);

// exports


/***/ }),
/* 114 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "v-dialog",
    {
      attrs: { "max-width": "560" },
      model: {
        value: _vm.showDialog,
        callback: function($$v) {
          _vm.showDialog = $$v
        },
        expression: "showDialog"
      }
    },
    [
      _c(
        "v-card",
        [
          _c("v-card-text", [
            _c("h2", [_vm._v(_vm._s(_vm.lt("rename_manga_image")))]),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "section-block" },
              [
                _c("h3", [_vm._v(_vm._s(_vm.lt("quick_picks")))]),
                _vm._v(" "),
                _vm._l(_vm.metasConfig, function(meta) {
                  return _c(
                    "v-btn",
                    {
                      key: meta.value,
                      attrs: { small: "", ripple: false, color: "info" },
                      on: {
                        click: function($event) {
                          return _vm.pickMeta(meta)
                        }
                      }
                    },
                    [_vm._v(_vm._s(meta.title))]
                  )
                })
              ],
              2
            ),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "section-block" },
              [
                _c("h3", [_vm._v(_vm._s(_vm.lt("rename_format")))]),
                _vm._v(" "),
                _c("v-text-field", {
                  ref: "renameInput",
                  staticClass: "v-input-first",
                  attrs: {
                    placeholder: "Not set",
                    hint: "Example: {authorId}_{id}_{pageNum}",
                    "persistent-hint": true
                  },
                  on: {
                    focus: _vm.updateInputPos,
                    keyup: _vm.updateInputPos,
                    click: _vm.updateInputPos
                  },
                  model: {
                    value: _vm.renameFormat,
                    callback: function($$v) {
                      _vm.renameFormat = $$v
                    },
                    expression: "renameFormat"
                  }
                })
              ],
              1
            )
          ])
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-a3f8a01c", esExports)
  }
}

/***/ })
],[47]);
//# sourceMappingURL=app.js.map