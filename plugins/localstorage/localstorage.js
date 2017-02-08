/**
 * Storage plugin
 *
 * Saves editor data to browser local storage.
 * And uploads data from local storage if there is newer version
 */
var storage = function () {

    var editor              = codex.editor,
        LOCAL_STORAGE_KEY   = 'codex.editor',
        interval            = null,
        config_ = {
            savingInterval: 1000
        };

    var prepare = function (config) {

        if (!window.localStorage) {

            editor.core.log('LocalStorage do not support in your browser');
            return;

        }

        config_ = config || config_;

        var localData = get();

        if (localData && editor.state.blocks.savingDate < localData.savingDate) {

            editor.notifications.notification({
                type        : 'confirm',
                message     : 'В вашем браузере сохранена более актаульная версия материала',
                okMsg       : 'Показать',
                cancelMsg   : 'Отмена',
                confirm     : function () {

                    editor.state.blocks = localData;
                    editor.renderer.rerender();
                    init(config_.saveInterval);

                },
                cancel      : function () {

                    init(config_.saveInterval);

                }

            });

        }

        return Promise.resolve();

    };

    var init = function (saveInterval) {

        interval = window.setInterval(save, saveInterval);

    };

    var save = function () {

        editor.saver.saveBlocks();

        /* Using setTimeout, cause we don't know when blocks are saved  */
        window.setTimeout(function () {

            var savedBlocks = editor.state.jsonOutput,
                savingDate   = editor.state.savingDate,
                data = {
                    items: savedBlocks,
                    savingDate : savingDate
                };

            window.localStorage[LOCAL_STORAGE_KEY+'.savedData'] = JSON.stringify(data);

        }, 500);

    };

    var get = function () {

        if (!window.localStorage[LOCAL_STORAGE_KEY+'.savedData'])
            return;

        var data;

        try {

            data = JSON.parse(window.localStorage[LOCAL_STORAGE_KEY + '.savedData']);

        } catch (error) {

            editor.core.log('Invalid data format');
            return;

        }

        return data;

    };

    var stop = function () {

        window.clearInterval(interval);

    };

    return {
        prepare: prepare,
        init   : init,
        save   : save,
        get    : get,
        stop   : stop,
        config : config_
    };

}();