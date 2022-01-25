/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
    "use strict";

    sap.ui.require(["PM030/APP1/test/integration/AllJourneys"], function () {
        QUnit.start();
    });
});
