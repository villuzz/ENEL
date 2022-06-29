sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/TablePersoController",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    'sap/ui/core/routing/History',
    "PM030/APP1/util/manutenzioneTable",
    'sap/m/MessageToast',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/Token',
    'sap/ui/core/library',
    "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, MessageToast, Filter, FilterOperator, Token, coreLibrary, Validator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;
    var ValueState = coreLibrary.ValueState;
    return Controller.extend("PM030.APP1.controller.CaricaTabellaM", {
        Validator: Validator,
        onInit: function () {

            this._oTPC = new TablePersoController({table: this.byId("tbCaricaTabellaM"), persoService: manutenzioneTable}).activate();
            this.getOwnerComponent().getRouter().getRoute("CaricaTabellaM").attachPatternMatched(this._onObjectMatched, this);
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");

            //var oinIndex = this.getView().byId("inIndex");
            var oinAzioni = this.getView().byId("IContActEl");
            var fnValidator = function (args) {
                var text = args.text;

                return new Token({key: text, text: text});
            };
            //oinIndex.addValidator(fnValidator);
            oinAzioni.addValidator(fnValidator);

        },
        _onObjectMatched: async function () {
            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_PMO_M");

            this.getValueHelp();
        },

        getValueHelp: async function () {
            sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
            sData.MEINS = await this.Shpl("H_T006", "SH");
            // sData.LGORT = await this._getTableNoError("/StorageList");
            sData.EKGRP = await this.Shpl("H_T024", "SH");
            sData.EKORG = await this.Shpl("H_T024E", "SH");
            sData.AFNAM = await this.Shpl("ZSKSE_MMREQUNITS", "SH");
            sData.MATKL = await this.Shpl("H_T023", "SH");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
        },

        onSearchResult: function (oEvent) {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
            sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbCaricaTabellaM").removeSelections();
            var sFilter = this.getModel("sFilter").getData();
            var aFilters = [],
                tempFilter = [];

            if (sFilter.Divisione !== undefined) {
                if (sFilter.Divisione.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Divisione, "Werks");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            var aSelIndici = "",
                aSelInd = [];

           /* if (this.getView().byId("inIndex").getTokens().length > 0) {
                aSelIndici = this.getView().byId("inIndex").getTokens();
                aSelInd = [];
                for (var i = 0; i < aSelIndici.length; i++) {
                    aSelInd.push(aSelIndici[i].getProperty("key"));
                }
                tempFilter = this.multiFilterText(aSelInd, "IndexPmo");
                aFilters = aFilters.concat(tempFilter);

            }*/
            if (this.getView().byId("IContActEl").getTokens().length > 0) {
                aSelIndici = this.getView().byId("IContActEl").getTokens();
                aSelInd = [];
                for (var i = 0; i < aSelIndici.length; i++) {
                    aSelInd.push(aSelIndici[i].getProperty("key"));
                }
                tempFilter = this.multiFilterText(aSelInd, "Cont");
                aFilters = aFilters.concat(tempFilter);

            }
            if (sFilter.Matnr !== undefined && sFilter.Matnr !== "") {
                aFilters.push(new Filter("Matnr", FilterOperator.EQ, sFilter.Matnr));
            }

            var model = this.getView().getModel("T_PMO_M");
            var tableFilters = await this._getTableNoError("/T_PMO_M", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },
        onDataExport: function () {
            var selectedTab = this.byId("tbCaricaTabellaM");
            var selIndex = this.getView().byId("tbCaricaTabellaM").getSelectedItems();
            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_PMO_M").getObject()
                    aArray.push(oContext);
                }

                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "CaricaTabellaM.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "CaricaTabellaM.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbCaricaTabellaM").getColumns().map((c) => {
                var templ = "";
                var typ = EdmType.String;
                // var prop = c.mAggregations.header.getText();
                var prop = c.getCustomData()[0].getValue();
                return {
                    label: c.getHeader().getText(),
                    property: prop,
                    type: typ,
                    format: (value) => {},
                    template: templ
                };
            }) || [];
            return oCols;
        },

        onBack: function () {
            this.navTo("ViewPage");
        },
        onPersoButtonPressed: function () {
            this._oTPC.openDialog();
        },
        handleUploadPiani: function () {
            this.byId("UploadTable").open();
        },
        onCloseFileUpload: function () { // this.onSearch();
          this.byId("UploadTable").close();
        },
        onBackDetail: function () {
            this.byId("navCon").back();
        },

        onNuovo: function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            var items = this.initModel();
            items.stato = "N";
            oModel.setData(items);
            this.getView().setModel(oModel, "sSelect");

            this.byId("navCon").to(this.byId("Detail"));

            sap.ui.core.BusyIndicator.hide();
        },
        onModify: function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbCaricaTabellaM").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_PMO_M").getObject();
                items.stato = "M";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onSave: async function () {
            var ControlValidate = Validator.validateView();
            if (ControlValidate) {
                var line = JSON.stringify(this.getView().getModel("sSelect").getData());
                line = JSON.parse(line);
                line.Matnr = line.Matnr.padStart(18, "0");
                var msg = await this.ControlIndex(line);
                if (msg !== "") {
                    MessageBox.error(msg);
                } else {
                    if (line.stato === "M") {
                        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                        delete line.stato;
                        delete line.__metadata;
                        await this._updateHana(sURL, line);
                    } else {
                      var aFilter = [];
                      aFilter.push(new Filter("Cont", FilterOperator.EQ, line.Cont)); // fisso IT - todo
                      var result = await this._getLine("/T_ACT_EL", aFilter);
                      line.IndexPmo = result.IndexPmo;

                        delete line.stato;
                        delete line.__metadata;
                        await this._saveHana("/T_PMO_M", line);
                    } MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
        },
        onCopy: function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbCaricaTabellaM").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_PMO_M").getObject();
                items.stato = "C";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onCancel: async function () {
            var sel = this.getView().byId("tbCaricaTabellaM").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_PMO_M").getObject());
                line = JSON.parse(line);

                var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                sURL = sURL.replace(line.Matnr, line.Matnr.padStart(18, "0"));
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
        },
        componiURL: function (line) {
            var sURL = "/T_PMO_M(" + "IndexPmo=" + "'" + line.IndexPmo + "'," + "Cont=" + "'" + line.Cont + "'" + "'," + "Matnr=" + "'" + line.Matnr.padStart(18, "0") + "'" + "'," + "Maktx=" + "'" + line.Maktx + "'" + ")";
            return sURL;
        },
        handleUploadPress: function () {
          this.handleUploadGenerico("/T_PMO_M");
        },
        ControlloExcelModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                IndexPmo: (sValue[oResources.getText("IndexPmo")] === undefined) ? "" : sValue[oResources.getText("IndexPmo")].toString(),
                Cont: (sValue[oResources.getText("Cont")] === undefined) ? "" : sValue[oResources.getText("Cont")].toString(),
                Matnr: (sValue[oResources.getText("Materiale")] === undefined) ? "" : sValue[oResources.getText("Materiale")].toString().padStart(18, "0"),
                Maktx: (sValue[oResources.getText("TestoBreveMat")] === undefined) ? "" : sValue[oResources.getText("TestoBreveMat")].toString(),
                Menge: (sValue[oResources.getText("QuantFabbisogno")] === undefined) ? "" : sValue[oResources.getText("QuantFabbisogno")].toString(),
                Meins: (sValue[oResources.getText("Unita")] === undefined) ? "" : sValue[oResources.getText("Unita")].toString(),
                Lgort: (sValue[oResources.getText("Magazzino")] === undefined) ? "" : sValue[oResources.getText("Magazzino")].toString(),
                Werks: (sValue[oResources.getText("Divisione")] === undefined) ? "" : sValue[oResources.getText("Divisione")].toString(),
                Charg: (sValue[oResources.getText("Partita")] === undefined) ? "" : sValue[oResources.getText("Partita")].toString(),
                Tbtwr: (sValue[oResources.getText("PrezzoLordo")] === undefined) ? "" : sValue[oResources.getText("PrezzoLordo")].toString(),
                Waers: (sValue[oResources.getText("Divisa")] === undefined) ? "" : sValue[oResources.getText("Divisa")].toString(),
                Ekgrp: (sValue[oResources.getText("GrupAcq")] === undefined) ? "" : sValue[oResources.getText("GrupAcq")].toString(),
                Ekorg: (sValue[oResources.getText("OrgAcq")] === undefined) ? "" : sValue[oResources.getText("OrgAcq")].toString(),
                Afnam: (sValue[oResources.getText("Richiedente")] === undefined) ? "" : sValue[oResources.getText("Richiedente")].toString(),
                Matkl: (sValue[oResources.getText("GrupMerci")] === undefined) ? "" : sValue[oResources.getText("GrupMerci")].toString()
            };
            return rValue;
        },
        initModel: function () {
            var sData = {
                IndexPmo: "",
                Cont: "",
                Matnr: "",
                Maktx: "",
                Menge: 0,
                Meins: "",
                Lgort: "",
                Werks: "",
                Charg: "",
                Tbtwr: 0,
                Waers: "",
                Ekgrp: "",
                Ekorg: "",
                Afnam: "",
                Matkl: ""
            };
            return sData;
        },
        handleChangeCb: function (oEvent) {
            var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();

            if (! sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
            }
        },
        ControlIndex: function (sData) {
            if (sData.stato !== "M") {
                if (sData.IndexPmo === "" || sData.IndexPmo === undefined || sData.IndexPmo === null) {
                    return "Inserire Indice";
                }
                if (sData.Cont === "" || sData.Cont === undefined || sData.Cont === null) {
                    return "Inserire Contatore";
                }
                /*if (sData.Matnr === "" || sData.Matnr === undefined || sData.Matnr === null) {
                    return "Inserire Materiale";
                }*/
            }
            return "";
        },
        onSuggestMatnrSelect: function (oEvent) {
          var sel = this.getView().getModel("sHelp").getData().Matnr[oEvent.getSource().getSelectedItem().split("-").pop()];
          var sSelect = this.getView().getModel("sSelect").getData();
          sSelect.Maktx = sel.Fieldname4;
          this.getView().getModel("sSelect").refresh();
        },
        onSuggestMatnr: async function (oEvent) {
            if (oEvent.getParameter("suggestValue").length >= 7) {

                var sSelect = this.getModel("sSelect").getData();

                var aFilter = [];
                if (sSelect.Werks !== "" && sSelect.Werks !== undefined && sSelect.Werks !== null) {
                    aFilter.push({
                        "Shlpname": "ZPM4R_SH_MATNR",
                        "Shlpfield": "WERKS",
                        "Sign": "I",
                        "Option": "EQ",
                        "Low": sSelect.Werks
                    });
                }
                aFilter.push({
                    "Shlpname": "ZPM4R_SH_MATNR",
                    "Shlpfield": "SPRAS",
                    "Sign": "I",
                    "Option": "EQ",
                    "Low": "IT"
                });
                aFilter.push({
                    "Shlpname": "ZPM4R_SH_MATNR",
                    "Shlpfield": "MATNR",
                    "Sign": "I",
                    "Option": "CP",
                    "Low": oEvent.getParameter("suggestValue") + "*"
                });
                var sHelp = this.getView().getModel("sHelp").getData();
                sHelp.Matnr = await this.Shpl("ZPM4R_SH_MATNR", "SH", aFilter);
                this.getView().getModel("sHelp").refresh();
            }
        },
        onSuggestLgort: async function (oEvent) {
            var sSelect = this.getModel("sSelect").getData();
            if (oEvent.getParameter("suggestValue").length >= 0 || (sSelect.Werks !== "" && sSelect.Werks !== undefined && sSelect.Werks !== null)) {

                var aFilter = [];
                if (sSelect.Werks !== "" && sSelect.Werks !== undefined && sSelect.Werks !== null) {
                    aFilter.push(new Filter("Werks", FilterOperator.EQ, sSelect.Werks));
                }
                if (oEvent.getParameter("suggestValue").length >= 0) {
                    aFilter.push(new Filter("Code", FilterOperator.EQ, sSelect.Lgort));
                }

                var sHelp = this.getView().getModel("sHelp").getData();
                sHelp.LGORT = await this._getTableNoError("/StorageList", aFilter);
                this.getView().getModel("sHelp").refresh();
            }
        }
    });
});
