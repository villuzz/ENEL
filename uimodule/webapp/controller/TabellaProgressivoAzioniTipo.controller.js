sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/TablePersoController",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    'sap/ui/core/routing/History',
    "PM030/APP1/util/manutenzioneTable",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/MessageToast',
    'sap/ui/core/library',
    "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, Filter, FilterOperator, MessageToast, coreLibrary, Validator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;
    var ValueState = coreLibrary.ValueState;
    return Controller.extend("PM030.APP1.controller.TabellaProgressivoAzioniTipo", {
        Validator: Validator,
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("TabellaProgressivoAzioniTipo").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbProgressivoAzioni"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");
        },

        _onObjectMatched: async function () {

            Validator.clearValidation();
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_ACT_PROG");

            this.getValueHelp();

        },
        getValueHelp: async function () {
            sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            var T_ACT_PROG = await this._getTable("/T_ACT_PROG", []);

            sData.Werks = this.distinctBy(T_ACT_PROG, "Werks");
            sData.Sistema = this.distinctBy(T_ACT_PROG, "Sistema");
            sData.Progres = this.distinctBy(T_ACT_PROG, "Progres");
            sData.Txt = this.distinctBy(T_ACT_PROG, "Txt");
            sData.ComponentTipo = this.distinctBy(T_ACT_PROG, "ComponentTipo");
            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
            sData.SISTEMA = await this._getTableNoError("/T_ACT_SYST");

            var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData(T_ACT_PROG);
            this.getView().setModel(oModel1, "T_ACT_PROG");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
        },


        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
            sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbProgressivoAzioni").removeSelections();
            var sFilter = this.getModel("sFilter").getData();
            var aFilters = [],
                tempFilter = [];

            if (sFilter.Werks !== undefined) {
                if (sFilter.Werks.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Werks, "Werks");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Sistema !== undefined) {
                if (sFilter.Sistema.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Sistema, "Sistema");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Progres !== undefined) {
                if (sFilter.Progres.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Progres, "Progres");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Txt !== undefined) {
                if (sFilter.Txt.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Txt, "Txt");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.ComponentTipo !== undefined) {
                if (sFilter.ComponentTipo.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.ComponentTipo, "ComponentTipo");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            var model = this.getView().getModel("T_ACT_PROG");
            var tableFilters = await this._getTableNoError("/T_ACT_PROG", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },

        onDataExport: function (oEvent) {
            var selectedTab = this.byId("tbProgressivoAzioni");
            var selIndex = this.getView().byId("tbProgressivoAzioni").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_ACT_PROG").getObject();
                    aArray.push(oContext);
                }

                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "TabellaProgressivoAzioniTipo.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "TabellaProgressivoAzioniTipo.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        _createColumnConfig: function () {
            var oCols = [],
                sCols = {};
            var oColumns = this.byId("tbProgressivoAzioni").getColumns();
            var oCells = this.getView().byId("tbProgressivoAzioni").getBindingInfo('items').template.getCells();
            for (var i = 0; i < oColumns.length; i++) {
                sCols = {
                    label: oColumns[i].getHeader().getText(),
                    property: oCells[i].getBindingInfo('text').parts[0].path,
                    type: EdmType.String,
                    format: () => {},
                    template: ""
                };
                oCols.push(sCols);
            }
            return oCols;
        },

        onBack: function () {
            this.navTo("ViewPage");
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
        onModify: function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbProgressivoAzioni").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_ACT_PROG").getObject();
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
            var items = this.getView().byId("tbProgressivoAzioni").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_ACT_PROG").getObject();
                items.stato = "C";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onCancel: async function () {
            var sel = this.getView().byId("tbProgressivoAzioni").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_ACT_PROG").getObject());
                line = JSON.parse(line);

                var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
        },

        onPersoButtonPressed: function () {
            this._oTPC.openDialog();
        },

        handleUploadPiani: function () {
            this.byId("UploadTable").open();
        },
        onCloseFileUpload: function () {
            this.byId("UploadTable").close();
        },
        handleUploadPress: function () {
          this.handleUploadGenerico("/T_ACT_PROG");
        },
        ControlloExcelModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                Werks: (sValue[oResources.getText("Divisione")] === undefined) ? "" : sValue[oResources.getText("Divisione")].toString(),
                Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? "" : sValue[oResources.getText("Sistema")].toString(),
                Progres: (sValue[oResources.getText("Progressivo")] === undefined) ? "" : sValue[oResources.getText("Progressivo")].toString(),
                Txt: (sValue[oResources.getText("DescrizioneProgressivo")] === undefined) ? "" : sValue[oResources.getText("DescrizioneProgressivo")].toString(),
                ComponentTipo: (sValue[oResources.getText("ComponenteTipo")] === undefined) ? "" : sValue[oResources.getText("ComponenteTipo")].toString()
            };
            return rValue;
        },
        componiURL: function (line) {
            var sURL = `/T_ACT_PROG(Werks='${
                line.Werks
            }',Sistema='${
                line.Sistema
            }',Progres='${
                line.Progres
            }')`;
            return sURL;
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
                        await this._saveHana("/T_ACT_PROG", line);
                    } MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
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
            if (sData.Sistema === "" || sData.Sistema === undefined || sData.Sistema === null) {
                return "Inserire Sistema";
            }
            if (sData.Progres === "" || sData.Progres === undefined || sData.Progres === null) {
                return "Inserire Progressivo";
            }
            return "";
        },
        initModel: function () {
            var sData = {
                stato: "",
                Werks: "",
                Sistema: "",
                Progres: "",
                Txt: "",
                ComponentTipo: ""
            };
            return sData;
        }


    });
});
