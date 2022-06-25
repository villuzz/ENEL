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
    return Controller.extend("PM030.APP1.controller.TabellaDestinatariUtenti", {
        Validator: Validator,
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("TabellaDestinatariUtenti").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbTabellaDestinatariUtenti"), componentName: "Piani", persoService: manutenzioneTable}).activate();
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

            var T_DEST_USR = await this._getTable("/T_DEST_USR", []);

            sData.Werks = this.distinctBy(T_DEST_USR, "Werks");
            sData.Arbpl = this.distinctBy(T_DEST_USR, "Arbpl");
            sData.Destinatario = this.distinctBy(T_DEST_USR, "Destinatario");
            sData.Raggruppamento = this.distinctBy(T_DEST_USR, "Raggruppamento");
            sData.Uname = this.distinctBy(T_DEST_USR, "Uname");
            sData.Object = this.distinctBy(T_DEST_USR, "Object");
            sData.Id = this.distinctBy(T_DEST_USR, "Id");
            sData.Auto = this.distinctBy(T_DEST_USR, "Auto");

            sData.T_RAGGR = await this._getTable("/T_RAGGR", []);
            sData.T_DEST = await this._getTable("/T_DEST", []);
            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
            // sData.SISTEMA = await this._getTableNoError("/T_ACT_SYST");

            var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData(T_DEST_USR);
            this.getView().setModel(oModel1, "T_DEST_USR");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
        },

        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
            sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbTabellaDestinatariUtenti").removeSelections();
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
            if (sFilter.Raggruppamento !== undefined) {
                if (sFilter.Raggruppamento.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Raggruppamento, "Raggruppamento");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Uname !== undefined) {
                if (sFilter.Uname.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Uname, "Uname");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Object !== undefined) {
                if (sFilter.Object.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Object, "Object");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Id !== undefined) {
                if (sFilter.Id.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Id, "Id");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Auto !== undefined) {
                if (sFilter.Auto.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Auto, "Auto");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            var model = this.getView().getModel("T_DEST_USR");
            var tableFilters = await this._getTableNoError("/T_DEST_USR", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },
        onDataExport: function () {
            var selectedTab = this.byId("tbTabellaDestinatariUtenti");
            var selIndex = this.getView().byId("tbTabellaDestinatariUtenti").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_DEST_USR").getObject()
                    aArray.push(oContext);
                }
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "TabellaDestinatariUtenti.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "TabellaDestinatariUtenti.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },
        _createColumnConfig: function () {
            var oCols = this.byId("tbTabellaDestinatariUtenti").getColumns().map((c) => {
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
                    var sControlEX = this.DESTUSERModel(rows[i]);
                    sURL = this.componiURLExcel(sControlEX);
                    var result = await this._updateHanaNoError(sURL, sControlEX);
                    if (result.length === 0) {
                        await this._saveHanaNoError("/T_DEST_USR", sControlEX);
                    }
                }
                MessageBox.success("Excel Caricato con successo");
            }
            this.byId("UploadTable").close();
            sap.ui.core.BusyIndicator.hide(0);
        },
        DESTUSERModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
                Arbpl: (sValue[oResources.getText("CentroDiLavoro")] === undefined) ? undefined : sValue[oResources.getText("CentroDiLavoro")].toString(),
                Destinatario: (sValue[oResources.getText("Destinatario")] === undefined) ? undefined : sValue[oResources.getText("Destinatario")].toString(),
                Uname: (sValue[oResources.getText("Utente")] === undefined) ? undefined : sValue[oResources.getText("Utente")].toString(),
                Object: (sValue[oResources.getText("AOP")] === undefined) ? undefined : sValue[oResources.getText("AOP")].toString(),
                Id: (sValue[oResources.getText("AF")] === undefined) ? undefined : sValue[oResources.getText("AF")].toString(),
                Auto: (sValue[oResources.getText("ZAP")] === undefined) ? undefined : sValue[oResources.getText("ZAP")].toString(),
                Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
            };
            return rValue;
        },
        componiURLExcel: function (line) {
            var sURL = `/T_DEST_USR(Werks='${
                line.Werks
            }',Arbpl='${
                line.Arbpl
            }',Destinatario='${
                line.Destinatario
            }',Uname='${
                line.Uname
            }',Object='${
                line.Object
            }',Id='${
                line.Id
            }',Auto='${
                line.Auto
            }')`;

            return sURL;
        },

        onBack: function () {
          this.navTo("ViewPage");
      },
        onPersoButtonPressed: function () {
            this._oTPC.openDialog();
        },
        onSelectRow: function () {
            this.getView().getModel("tabCheckModel").setProperty("/editEnabled", true);
        },
        handleUploadPiani: function () {
            this.byId("UploadTable").open();
        },
        onCloseFileUpload: function () {
            this.byId("UploadTable").close();

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
                        await this._saveHana("/T_DEST_USR", line);
                    }
                    MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
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
        onCopy: function () {
          sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbTabellaDestinatariUtenti").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_DEST_USR").getObject();
                items.stato = "C";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onModify: function () {
          sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbTabellaDestinatariUtenti").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_DEST_USR").getObject();
                items.stato = "M";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
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
                Uname: "",
                Object: "",
                Id: "",
                Auto: "",
                Raggruppamento: ""
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
            if (sData.Uname === "" || sData.Uname === undefined || sData.Uname === null) {
                return "Inserire Uname";
            }
            if (sData.Object === "" || sData.Object === undefined || sData.Object === null) {
                return "Inserire Object";
            }
            if (sData.Id === "" || sData.Id === undefined || sData.Id === null) {
                return "Inserire Id";
            }
            if (sData.Auto === "" || sData.Auto === undefined || sData.Auto === null) {
                return "Inserire Auto";
            }
            return "";
        }
    });
});
