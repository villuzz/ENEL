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
    return Controller.extend("PM030.APP1.controller.TabellaDestinatariCdl", {
        Validator: Validator,
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("TabellaDestinatariCdl").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbTabellaDestinatariCdl"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");

        },
        _onObjectMatched: async function () {
            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_DEST");

            this.getValueHelp();
        },

        getValueHelp: async function () {

            sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            var T_DEST = await this._getTable("/T_DEST", []);

            sData.Werks = this.distinctBy(T_DEST, "Werks");
            sData.Arbpl = this.distinctBy(T_DEST, "Arbpl");
            sData.Destinatario = this.distinctBy(T_DEST, "Destinatario");
            sData.Txt = this.distinctBy(T_DEST, "Txt");
            sData.Raggruppamento = this.distinctBy(T_DEST, "Raggruppamento");
            sData.Mail = this.distinctBy(T_DEST, "Mail");

            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
            sData.ARBPL = sData.Arbpl;

            var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData(T_DEST);
            this.getView().setModel(oModel1, "T_DEST");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
        },
        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
            sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbTabellaDestinatariCdl").removeSelections();
            var sFilter = this.getModel("sFilter").getData();
            var aFilters = [],
                tempFilter = [];

            if (sFilter.Werks !== undefined) {
                if (sFilter.Werks.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Werks, "Werks");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Arbpl !== undefined) {
                if (sFilter.Arbpl.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Arbpl, "Arbpl");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Destinatario !== undefined) {
                if (sFilter.Destinatario.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Destinatario, "Destinatario");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Txt !== undefined) {
                if (sFilter.Txt.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Txt, "Txt");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Raggruppamento !== undefined) {
                if (sFilter.Raggruppamento.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Raggruppamento, "Raggruppamento");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            var model = this.getView().getModel("T_DEST");
            var tableFilters = await this._getTableNoError("/T_DEST", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },
        onDataExport: function () {
            var selectedTab = this.byId("tbTabellaDestinatariCdl");
            var selIndex = this.getView().byId("tbTabellaDestinatariCdl").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");

            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_DEST").getObject()
                    aArray.push(oContext);
                }
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "TabellaDestinatariCdl.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "TabellaDestinatariCdl.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbTabellaDestinatariCdl").getColumns().map((c) => {
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
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("ViewPage", {}, true);
            }
        },
        onPersoButtonPressed: function () {
            this._oTPC.openDialog();
        },
        onSave: async function () {
          var ControlValidate = Validator.validateView();
            if (ControlValidate) {
                var line = JSON.stringify(this.getView().getModel("sSelect").getData());               line = JSON.parse(line);
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
                        await this._saveHana("/T_DEST", line);
                    }
                    MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
        },
        onCancel: async function () {
            var sel = this.getView().byId("tbTabellaDestinatariCdl").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_DEST").getObject());
                line = JSON.parse(line);

                var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
        },
        handleUploadPiani: function () {
            this.byId("UploadTable").open();
        },
        onCloseFileUpload: function () {
            this.byId("UploadTable").close();
        },
        onModify: function () {
          sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbTabellaDestinatariCdl").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_DEST").getObject();
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
            var items = this.getView().byId("tbTabellaDestinatariCdl").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_DEST").getObject();
                items.stato = "C";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
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
        onBackDetail: function () {
            this.byId("navCon").back();
        },
        handleUploadPress: function () {
          this.handleUploadGenerico("/T_DEST");
        },
        componiURL: function (line) {
            var sURL = `/T_DEST(Werks='${
                line.Werks
            }',Arbpl='${
                line.Arbpl
            }',Destinatario='${
                line.Destinatario
            }')`;

            // return encodeURIComponent(sURL);
            return sURL;
        },
        ControlloExcelModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                Werks: (sValue[oResources.getText("Divisione")] === undefined) ? "" : sValue[oResources.getText("Divisione")].toString(),
                Arbpl: (sValue[oResources.getText("CentroDiLavoro")] === undefined) ? "" : sValue[oResources.getText("CentroDiLavoro")].toString(),
                Destinatario: (sValue[oResources.getText("Destinatario")] === undefined) ? "" : sValue[oResources.getText("Destinatario")].toString(),
                Txt: (sValue[oResources.getText("DescrizioneDestinatario")] === undefined) ? "" : sValue[oResources.getText("DescrizioneDestinatario")].toString(),
                Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? "" : sValue[oResources.getText("Raggruppamento")].toString(),
                Mail: (sValue[oResources.getText("Email")] === undefined) ? "" : sValue[oResources.getText("Email")].toString()
            };
            return rValue;
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
                Werks: "",
                Arbpl: "",
                Destinatario: "",
                Txt: "",
                Raggruppamento: "",
                Mail: ""
            };
            return sData;
        },
        ControlIndex: function (sData) {

            /*if (sData.Werks === "" || sData.Werks === undefined || sData.Werks === null) {
                return "Inserire Divisione";
            }*/
            if (sData.Arbpl === "" || sData.Arbpl === undefined || sData.Arbpl === null) {
                return "Inserire Centro di Lavoro";
            }
            if (sData.Destinatario === "" || sData.Destinatario === undefined || sData.Destinatario === null) {
                return "Inserire Destinatario";
            }
            return "";
        }
    });
});
