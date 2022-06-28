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
    return Controller.extend("PM030.APP1.controller.CaricaTabellaS", {
        Validator: Validator,
        onInit: function () {

            this._oTPC = new TablePersoController({table: this.byId("tbCaricaTabellaS"), persoService: manutenzioneTable}).activate();
            this.getOwnerComponent().getRouter().getRoute("CaricaTabellaS").attachPatternMatched(this._onObjectMatched, this);
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");

            var oinIndex = this.getView().byId("inIndex");
            var oinAzioni = this.getView().byId("IContActEl");
            var fnValidator = function (args) {
                var text = args.text;

                return new Token({key: text, text: text});
            };
            oinIndex.addValidator(fnValidator);
            oinAzioni.addValidator(fnValidator);

        },
        _onObjectMatched: async function () {
            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_PMO_S");

            this.getValueHelp();
        },

        getValueHelp: async function () {
            sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            sData.MEINS = await this.Shpl("H_T006", "SH");
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
            this.getView().byId("tbCaricaTabellaS").removeSelections();
            var sFilter = this.getModel("sFilter").getData();
            var aFilters = [],
                tempFilter = [];

            if (sFilter.Divisione !== undefined) {
                if (sFilter.Divisione.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Divisione, "Divisione");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            var aSelIndici = "",
                aSelInd = [];

            if (this.getView().byId("inIndex").getTokens().length > 0) {
                aSelIndici = this.getView().byId("inIndex").getTokens();
                aSelInd = [];
                for (var i = 0; i < aSelIndici.length; i++) {
                    aSelInd.push(aSelIndici[i].getProperty("key"));
                }
                tempFilter = this.multiFilterText(aSelInd, "IndexPmo");
                aFilters = aFilters.concat(tempFilter);

            }
            if (this.getView().byId("IContActEl").getTokens().length > 0) {
                aSelIndici = this.getView().byId("IContActEl").getTokens();
                aSelInd = [];
                for (var i = 0; i < aSelIndici.length; i++) {
                    aSelInd.push(aSelIndici[i].getProperty("key"));
                }
                tempFilter = this.multiFilterText(aSelInd, "Cont");
                aFilters = aFilters.concat(tempFilter);

            }
            if (sFilter.Asnum !== undefined && sFilter.Asnum !== "") {
                aFilters.push(new Filter("Asnum", FilterOperator.EQ, sFilter.Asnum));
            }

            var model = this.getView().getModel("T_PMO_S");
            var tableFilters = await this._getTableNoError("/T_PMO_S", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },
        onDataExport: function () {
            var selectedTab = this.byId("tbCaricaTabellaS");
            var selIndex = this.getView().byId("tbCaricaTabellaS").getSelectedItems();
            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_PMO_S").getObject();
                    aArray.push(oContext);
                }

                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "CaricaTabellaS.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "CaricaTabellaS.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbCaricaTabellaS").getColumns().map((c) => {
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
            this._oValueHelpDialog = sap.ui.xmlfragment("PM030.APP1.view.fragment.UploadTable", this);
            this.getView().addDependent(this._oValueHelpDialog);
            this.getView().setModel(this.oEmployeeModel);
            this._oValueHelpDialog.open();

        },
        onCloseFileUpload: function () { // this.onSearch();
            this._oValueHelpDialog.destroy();

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
            var items = this.getView().byId("tbCaricaTabellaS").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_PMO_S").getObject();
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
                        delete line.stato;
                        delete line.__metadata;
                        await this._saveHana("/T_PMO_S", line);
                    } MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
        },
        onCopy: function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbCaricaTabellaS").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_PMO_S").getObject();
                items.stato = "C";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onCancel: async function () {
            var sel = this.getView().byId("tbCaricaTabellaS").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_PMO_S").getObject());
                line = JSON.parse(line);

                var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
        },
        componiCancelURL: function (line) {
            var sURL = "/T_PMO_S(" + "IndexPmo=" + "'" + line.IndexPmo + "'," + "Cont=" + "'" + line.Cont + "'" + "'," + "Asnum=" + "'" + line.Asnum + "'" + "'," + "Asktx=" + "'" + line.Asktx + "'" + ")";
            return sURL;
        },
        componiURL: function (line) {
            var sURL = "/T_PMO_S(" + "IndexPmo=" + "'" + line.IndexPmo + "'," + "Cont=" + "'" + line.Cont + "'" + "'," + "Asnum=" + "'" + line.Asnum + "'" + "'," + "Asktx=" + "'" + line.Asktx + "'" + ")";
            return sURL;
        },
        handleUploadPress: async function () {
            var oResource = this.getResourceBundle();

            if (sap.ui.getCore().byId("fileUploader").getValue() === "") {
                MessageBox.warning("Inserire un File da caricare");
            } else {
                sap.ui.core.BusyIndicator.show();
                var i = 0,
                    sURL;
                var rows = this.getView().getModel("uploadModel").getData();
                for (var i = 0; i < rows.length; i++) {
                    var sControlEX = this.ControlloExcelModel(rows[i]);
                    sURL = this.componiURL(sControlEX);
                    var result = await this._updateHanaNoError(sURL, sControlEX);
                    if (result.length === 0) {
                        await this._saveHanaNoError("/T_PMO_S", sControlEX);
                    }
                }
                MessageBox.success("Excel Caricato con successo");
                sap.ui.getCore().byId("UploadTable").close();
                sap.ui.core.BusyIndicator.hide();
            }
        },
        ControlloExcelModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                IndexPmo: (sValue[oResources.getText("IndexPmo")] === undefined) ? undefined : sValue[oResources.getText("IndexPmo")].toString(),
                Cont: (sValue[oResources.getText("Cont")] === undefined) ? undefined : sValue[oResources.getText("Cont")].toString(),
                Asnum: (sValue[oResources.getText("Asnum")] === undefined) ? undefined : sValue[oResources.getText("Asnum")].toString(),
                Asktx: (sValue[oResources.getText("Asktx")] === undefined) ? undefined : sValue[oResources.getText("Asktx")].toString(),
                Menge: (sValue[oResources.getText("Menge")] === undefined) ? undefined : sValue[oResources.getText("Menge")].toString(),
                Meins: (sValue[oResources.getText("Meins")] === undefined) ? undefined : sValue[oResources.getText("Meins")].toString(),
                Tbtwr: (sValue[oResources.getText("Tbtwr")] === undefined) ? undefined : sValue[oResources.getText("Tbtwr")].toString(),
                Waers: (sValue[oResources.getText("Waers")] === undefined) ? undefined : sValue[oResources.getText("Waers")].toString(),
                Ekgrp: (sValue[oResources.getText("Ekgrp")] === undefined) ? undefined : sValue[oResources.getText("Ekgrp")].toString(),
                Ekorg: (sValue[oResources.getText("Ekorg")] === undefined) ? undefined : sValue[oResources.getText("Ekorg")].toString(),
                Afnam: (sValue[oResources.getText("Afnam")] === undefined) ? undefined : sValue[oResources.getText("Afnam")].toString(),
                Matkl: (sValue[oResources.getText("Matkl")] === undefined) ? undefined : sValue[oResources.getText("Matkl")].toString()
            };
            return rValue;
        },
        initModel: function () {
            var sData = {
                IndexPmo: "",
                Cont: "",
                Asnum: "",
                Asktx: "",
                Menge: 0,
                Meins: "",
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
                /*if (sData.Asnum === "" || sData.Asnum === undefined || sData.Asnum === null) {
                    return "Inserire N. attività";
                }*/
            }
            return "";
        },
        onSuggestAsnum: async function (oEvent) {
            if (this.getView().getModel("sHelp")) {
                this.getView().getModel("sHelp").setProperty("/Asnum", []);
            }
            if (oEvent.getParameter("suggestValue").length >= 5) {
                var aFilter = [];
                aFilter.push({
                    "Shlpname": "ZPM4R_SH_ASNUM",
                    "Shlpfield": "ASNUM",
                    "Sign": "I",
                    "Option": "CP",
                    "Low": oEvent.getParameter("suggestValue") + "*"
                });
                var sHelp = this.getView().getModel("sHelp").getData();
                sHelp.Asnum = await this.Shpl("ZPM4R_SH_ASNUM", "SH", aFilter);
                this.getView().getModel("sHelp").refresh(true);
            }
        }
    });
});
