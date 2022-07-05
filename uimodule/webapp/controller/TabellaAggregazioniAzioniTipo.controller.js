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
    "PM030/APP1/util/Validator"
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, MessageToast, Filter, FilterOperator, manutenzioneTable, coreLibrary, Validator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;
    var ValueState = coreLibrary.ValueState;
    return Controller.extend("PM030.APP1.controller.TabellaAggregazioniAzioniTipo", {
        Validator: Validator,
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("TabellaAggregazioniAzioniTipo").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbTabellaAggregazioniAzioniTipo"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");

        },
        _onObjectMatched: async function () {
            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_AGGREG");

            this.getValueHelp();
        },
        getValueHelp: async function () {
            sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            var T_AGGREG = await this._getTable("/T_AGGREG", []);

            sData.Werks = this.distinctBy(T_AGGREG, "Werks");
            sData.Sistema = this.distinctBy(T_AGGREG, "Sistema");
            sData.Classe = this.distinctBy(T_AGGREG, "Classe");
            sData.ProgAggr = this.distinctBy(T_AGGREG, "ProgAggr");
            sData.AggrActTitle = this.distinctBy(T_AGGREG, "AggrActTitle");
            sData.AggrActComponent = this.distinctBy(T_AGGREG, "AggrActComponent");

            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
            sData.SISTEMA = await this._getTableNoError("/T_ACT_SYST");
            sData.CLASSE = await this._getTableNoError("/T_ACT_CL");

            var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData(T_AGGREG);
            this.getView().setModel(oModel1, "T_AGGREG");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
        },

        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
          
          sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbTabellaAggregazioniAzioniTipo").removeSelections();
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
            if (sFilter.ProgAggr !== undefined) {
                if (sFilter.ProgAggr.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.ProgAggr, "ProgAggr");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.AggrActTitle !== undefined) {
                if (sFilter.AggrActTitle.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.AggrActTitle, "AggrActTitle");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.AggrActComponent !== undefined) {
              if (sFilter.AggrActComponent.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.AggrActComponent, "AggrActComponent");
                  aFilters = aFilters.concat(tempFilter);
              }
          }
            var model = this.getView().getModel("T_AGGREG");
            var tableFilters = await this._getTableNoError("/T_AGGREG", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },
        onDataExport: function () {
            var selectedTab = this.byId("tbTabellaAggregazioniAzioniTipo");
            var selIndex = this.getView().byId("tbTabellaAggregazioniAzioniTipo").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_AGGREG").getObject();
                    aArray.push(oContext);
                }
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "TabellaAggregazioniAzioniTipo.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "TabellaAggregazioniAzioniTipo.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbTabellaAggregazioniAzioniTipo").getColumns().map((c) => {
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
            var items = this.getView().byId("tbTabellaAggregazioniAzioniTipo").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_AGGREG").getObject();
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
                      await this._saveHana("/T_AGGREG", line);
                  }
                  MessageBox.success("Dati salvati con successo");
                  this.onSearchFilters();
                  this.byId("navCon").back();
              }
          }
        },
        ControlloExcelModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                Werks: (sValue[oResources.getText("NWerks")] === undefined) ? "" : sValue[oResources.getText("NWerks")].toString(),
                Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? "" : sValue[oResources.getText("Sistema")].toString(),
                Classe: (sValue[oResources.getText("Classe")] === undefined) ? "" : sValue[oResources.getText("Classe")].toString(),
                ProgAggr: (sValue[oResources.getText("NProgAggr")] === undefined) ? "" : sValue[oResources.getText("NProgAggr")].toString(),
                AggrActTitle: (sValue[oResources.getText("NAggrActTitle")] === undefined) ? "" : sValue[oResources.getText("NAggrActTitle")].toString(),
                AggrActComponent: (sValue[oResources.getText("NAggrActComponent")] === undefined) ? "" : sValue[oResources.getText("NAggrActComponent")].toString()
            };
            return rValue;
        },
        componiURL: function (line) {
            var sURL = `/T_AGGREG(Werks='${
                line.Werks
            }',Sistema='${
                line.Sistema
            }',Classe='${
                line.Classe
            }',ProgAggr='${
                line.ProgAggr
            }')`;

            // return encodeURIComponent(sURL);
            return sURL;
        },
        onCancel: async function () {
          var sel = this.getView().byId("tbTabellaAggregazioniAzioniTipo").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_AGGREG").getObject());
                line = JSON.parse(line);

                var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
        },
        onBackDetail: function () {
            this.byId("navCon").back();
        },
        onCopy: function () {
          sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbTabellaAggregazioniAzioniTipo").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_AGGREG").getObject();
                items.stato = "C";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        handleUploadPress: function () {
          this.handleUploadGenerico("/T_AGGREG");
        },
        onCloseFileUpload: function () { // this.onSearch();
          this.byId("UploadTable").close();
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
                Sistema: "",
                Classe: "",
                ProgAggr: "",
                AggrActTitle: "",
                AggrActComponent: ""
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
            if (sData.ProgAggr === "" || sData.ProgAggr === undefined || sData.ProgAggr === null) {
                return "Inserire ProgAggr";
            }
            return "";
        }
    });
});
