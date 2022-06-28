sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/TablePersoController",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    'sap/ui/core/routing/History',
    'sap/m/MessageToast',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "PM030/APP1/util/manutenzioneTable",
    'sap/ui/core/library',
    "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, MessageToast, Filter, FilterOperator, manutenzioneTable, coreLibrary, Validator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;
    var ValueState = coreLibrary.ValueState;
    return Controller.extend("PM030.APP1.controller.TabellaRaggruppamento", {
        Validator: Validator,
        onInit: function () {


            this.getOwnerComponent().getRouter().getRoute("TabellaRaggruppamento").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbRaggruppamento"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");
        },
        _onObjectMatched: async function () {

            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_RAGGR");

            this.getValueHelp();

        },
        getValueHelp: async function () {
            sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            var T_RAGGR = await this._getTable("/T_RAGGR", []);
            sData.Divisione = this.distinctBy(T_RAGGR, "Divisione");
            sData.Raggruppamento = this.distinctBy(T_RAGGR, "Raggruppamento");
            sData.DescRaggr = this.distinctBy(T_RAGGR, "DescRaggr");

            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");

            var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData(T_RAGGR);
            this.getView().setModel(oModel1, "T_RAGGR");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
        },

        onSearchResult: function () {
            this.onSearchFilters();
        },

        onSearchFilters: async function () {
            sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbRaggruppamento").removeSelections();
            var sFilter = this.getModel("sFilter").getData();
            var aFilters = [],
                tempFilter = [];

            if (sFilter.Divisione !== undefined) {
                if (sFilter.Divisione.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Divisione, "Divisione");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Raggruppamento !== undefined) {
                if (sFilter.Raggruppamento.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Raggruppamento, "Raggruppamento");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.DescRaggr !== undefined) {
                if (sFilter.DescRaggr.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.DescRaggr, "DescRaggr");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            var model = this.getView().getModel("T_RAGGR");
            var tableFilters = await this._getTableNoError("/T_RAGGR", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },

        onDataExport: function () {
            var selectedTab = this.byId("tbRaggruppamento");
            var selIndex = this.getView().byId("tbRaggruppamento").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_RAGGR").getObject();
                    aArray.push(oContext);
                }
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "TabellaRaggruppamento.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "TabellaRaggruppamento.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        handleUploadPress: async function () {
            var oResource = this.getResourceBundle();

            if (this.byId("fileUploader").getValue() === "") {
                MessageBox.warning("Inserire un File da caricare");
            } else {
                sap.ui.core.BusyIndicator.show();
                var i = 0,
                    sURL,
                    msg = "";

                var rows = this.getView().getModel("uploadModel").getData();
                if (msg !== "") {
                    sap.ui.core.BusyIndicator.hide(0);
                    MessageBox.error(msg);
                }
                for (let i = 0; i < rows.length; i++) {
                    var sRaggruppamentoMod = this.RaggruppamentoModel(rows[i]);
                    sURL = this.componiURL(sRaggruppamentoMod);
                    var result = await this._updateHanaNoError(sURL, sRaggruppamentoMod);
                    if (result.length === 0) {
                        await this._saveHanaNoError("/T_RAGGR", sRaggruppamentoMod);
                    }
                }
                MessageBox.success("Excel Caricato con successo");
            }

            this.byId("UploadTable").close();
            sap.ui.core.BusyIndicator.hide(0);
        },
        RaggruppamentoModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
                Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString(),
                DescRaggr: (sValue[oResources.getText("DescrizioneRaggruppamento")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneRaggruppamento")].toString()
            };
            return rValue;
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbRaggruppamento").getColumns().map((c) => {
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
        onCancel: async function () {
            var sel = this.getView().byId("tbRaggruppamento").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_RAGGR").getObject());
                line = JSON.parse(line);
                var sURL = this.componiCancelURL(line);
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
        },

        componiCancelURL: function (line) {
            var sURL = "/T_RAGGR(" + "Divisione=" + "'" + line.Divisione + "'," + "Raggruppamento=" + "'" + line.Raggruppamento + "'" + ")";
            return sURL;
        },

        onPersoButtonPressed: function () {
            this._oTPC.openDialog();
        },
        handleUploadPiani: function () {
            this.getView().byId("fileUploader").setValue("");
            this.byId("UploadTable").open();
        },
        onCloseFileUpload: function () {
            this.byId("UploadTable").close();
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
            var items = this.getView().byId("tbRaggruppamento").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_RAGGR").getObject();
                items.stato = "M";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onCopy: function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbRaggruppamento").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_RAGGR").getObject();
                items.stato = "C";
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
                var line = this.getView().getModel("sSelect").getData();
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
                        await this._saveHana("/T_RAGGR", line);
                    }
                    MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
        },
        componiURL: function (line) {
            var sURL = "/T_RAGGR(" + "Divisione=" + "'" + line.Divisione + "'," + "Raggruppamento=" + "'" + line.Raggruppamento + "'" + ")";
            return sURL;
        },
        onBackDetail: function () {
            this.byId("navCon").back();
        },
        handleChangeCb: function (oEvent) {
            var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();

            if (!sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
            }
        },
        initModel: function () {
            var sData = {
                Divisione: "",
                Raggruppamento: "",
                DescRaggr: ""
            }
            return sData;
        },
        ControlIndex: function (sData) {
            if (sData.Raggruppamento === "" || sData.Raggruppamento === undefined || sData.Raggruppamento === null) {
                return "Inserire Raggruppamento";
            }
            return "";
        }
    });
});
