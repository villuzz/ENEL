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

], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, Filter, FilterOperator, MessageToast, coreLibrary, Validator,) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;
    var ValueState = coreLibrary.ValueState;

    return Controller.extend("PM030.APP1.controller.TabellaClasseAzioneTipo", {
        Validator: Validator,
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("TabellaClasseAzioneTipo").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbTabellaClasseAzioneTipo"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");

        },
        _onObjectMatched: async function () {
            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_ACT_CL");

            this.getValueHelp();
        },
        getValueHelp: async function () {

            sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            var T_ACT_CL = await this._getTable("/T_ACT_CL", []);

            sData.Werks = this.distinctBy(T_ACT_CL, "Werks");
            sData.Sistema = this.distinctBy(T_ACT_CL, "Sistema");
            sData.Classe = this.distinctBy(T_ACT_CL, "Classe");
            sData.Txt = this.distinctBy(T_ACT_CL, "Txt");

            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
            sData.SISTEMA = await this._getTableNoError("/T_ACT_SYST");

            var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData(T_ACT_CL);
            this.getView().setModel(oModel1, "T_ACT_CL");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
        },

        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
      sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbTabellaClasseAzioneTipo").removeSelections();
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
            if (sFilter.Classe !== undefined) {
                if (sFilter.Classe.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Classe, "Classe");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Txt !== undefined) {
                if (sFilter.Txt.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Txt, "Txt");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            var model = this.getView().getModel("T_ACT_CL");
            var tableFilters = await this._getTableNoError("/T_ACT_CL", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },

        onDataExport: function () {
            var selectedTab = this.byId("tbTabellaClasseAzioneTipo");
            var selIndex = this.getView().byId("tbTabellaClasseAzioneTipo").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_ACT_CL").getObject();
                    aArray.push(oContext);
                }

                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "TabellaClasseAzioneTipo.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "TabellaClasseAzioneTipo.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbTabellaClasseAzioneTipo").getColumns().map((c) => {
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
            var items = this.getView().byId("tbTabellaClasseAzioneTipo").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_ACT_CL").getObject();
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
          var items = this.getView().byId("tbTabellaClasseAzioneTipo").getSelectedItems();
          if (items.length === 1) {
              var oModel = new sap.ui.model.json.JSONModel();
              items = items[0].getBindingContext("T_ACT_CL").getObject();
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
                      await this._saveHana("/T_ACT_CL", line);
                  }
                  MessageBox.success("Dati salvati con successo");
                  this.onSearchFilters();
                  this.byId("navCon").back();
              }
          }
        },

        componiURL: function (line) {
            var sURL = `/T_ACT_CL(Werks='${
                line.Werks
            }',Sistema='${
                line.Sistema
            }',Classe='${
                line.Classe
            }')`;
            return sURL;
        },
        onCancel: async function () {
          var sel = this.getView().byId("tbTabellaClasseAzioneTipo").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_ACT_CL").getObject());
                line = JSON.parse(line);

                var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
        },
        handleUploadPress: function () {
          this.handleUploadGenerico("/T_ACT_CL");
        },
        ControlloExcelModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                Classe: (sValue[oResources.getText("Classe")] === undefined) ? "" : sValue[oResources.getText("Classe")].toString(),
                Werks: (sValue[oResources.getText("Divisione")] === undefined) ? "" : sValue[oResources.getText("Divisione")].toString(),
                Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? "" : sValue[oResources.getText("Sistema")].toString(),
                Txt: (sValue[oResources.getText("Testo")] === undefined) ? "" : sValue[oResources.getText("Testo")].toString()
            };
            return rValue;
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
        initModel: function () {
            var sData = {
                Werks: "",
                Sistema: "",
                Classe: "",
                Txt: ""
            }
            return sData;
        },
        ControlIndex: function (sData) {

            /*if (sData.Werks === "" || sData.Werks === undefined || sData.Werks === null) {
                return "Inserire Divisione";
            }*/
            if (sData.Sistema === "" || sData.Sistema === undefined || sData.Sistema === null) {
                return "Inserire Sistema";
            }
            if (sData.Classe === "" || sData.Classe === undefined || sData.Classe === null) {
                return "Inserire Classe";
            }
            return "";
        }
    });
});
