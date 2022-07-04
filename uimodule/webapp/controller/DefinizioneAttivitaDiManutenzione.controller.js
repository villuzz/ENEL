sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/TablePersoController",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    'sap/ui/core/routing/History',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/MessageToast',
    "PM030/APP1/util/manutenzioneTable",
    'sap/ui/core/library',
    "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, Filter, FilterOperator, MessageToast, manutenzioneTable, coreLibrary, Validator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;

    var ValueState = coreLibrary.ValueState;

    return Controller.extend("PM030.APP1.controller.DefinizioneAttivitaDiManutenzione", {
        Validator: Validator,
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("DefinizioneAttivitaDiManutenzione").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbDefinizioneAttivitaDiManutenzione"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");
        },
        _onObjectMatched: async function () {
          Validator.clearValidation();

          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({});
          this.getView().setModel(oModel, "T_TP_MAN");

          this.getValueHelp();
        },
        getValueHelp: async function () {
          sap.ui.core.BusyIndicator.show();
          var sData = {};
          var oModelHelp = new sap.ui.model.json.JSONModel();
          oModelHelp.setSizeLimit(2000);

          var T_ATTPM = await this._getTable("/T_ATTPM", []);

          sData.Spras = this.distinctBy(T_ATTPM, "Spras");
          sData.Ilart = this.distinctBy(T_ATTPM, "Ilart");
          sData.Ilatx = this.distinctBy(T_ATTPM, "Ilatx");

          sData.SPRAS = await this.Shpl("T002", "CH");

          var oModel1 = new sap.ui.model.json.JSONModel();
          oModel1.setData(T_ATTPM);
          this.getView().setModel(oModel1, "T_ATTPM");

          oModelHelp.setData(sData);
          this.getView().setModel(oModelHelp, "sHelp");
          sap.ui.core.BusyIndicator.hide();
        },

        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {

          sap.ui.core.BusyIndicator.show();
          this.getView().byId("tbDefinizioneAttivitaDiManutenzione").removeSelections();
          var sFilter = this.getModel("sFilter").getData();
          var aFilters = [],
              tempFilter = [];

          if (sFilter.Spras !== undefined) {
              if (sFilter.Spras.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.Spras, "Spras");
                  aFilters = aFilters.concat(tempFilter);
              }
          }
          if (sFilter.Ilart !== undefined) {
              if (sFilter.Ilart.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.Ilart, "Ilart");
                  aFilters = aFilters.concat(tempFilter);
              }
          }
          if (sFilter.Ilatx !== undefined) {
              if (sFilter.Ilatx.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.Ilatx, "Ilatx");
                  aFilters = aFilters.concat(tempFilter);
              }
          }

          var model = this.getView().getModel("T_ATTPM");
          var tableFilters = await this._getTableNoError("/T_ATTPM", aFilters);
          if (tableFilters.length === 0) {
              MessageBox.error("Nessun record trovato");
              model.setData({});
          } else {
              model.setData(tableFilters);
          } sap.ui.core.BusyIndicator.hide();
        },
        onDataExport: function () {
            var selectedTab = this.byId("tbDefinizioneAttivitaDiManutenzione");
            var selIndex = this.getView().byId("tbDefinizioneAttivitaDiManutenzione").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");

            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_ATTPM").getObject()
                    aArray.push(oContext);
                }
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "DefinizioneAttivitaDiManutenzione.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "DefinizioneAttivitaDiManutenzione.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbDefinizioneAttivitaDiManutenzione").getColumns().map((c) => {
                var templ = "";
                var typ = EdmType.String;
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
        onBack: function () {
          this.navTo("ViewPage");
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
        onBackDetail: function () {
            this.byId("navCon").back();
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
                      await this._saveHana("/T_ATTPM", line);
                  }
                  MessageBox.success("Dati salvati con successo");
                  this.onSearchFilters();
                  this.byId("navCon").back();
              }
          }
        },
        onModify: function () {
          sap.ui.core.BusyIndicator.show();
          Validator.clearValidation();
          var items = this.getView().byId("tbDefinizioneAttivitaDiManutenzione").getSelectedItems();
          if (items.length === 1) {
              var oModel = new sap.ui.model.json.JSONModel();
              items = items[0].getBindingContext("T_ATTPM").getObject();
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
          var items = this.getView().byId("tbDefinizioneAttivitaDiManutenzione").getSelectedItems();
          if (items.length === 1) {
              var oModel = new sap.ui.model.json.JSONModel();
              items = items[0].getBindingContext("T_ATTPM").getObject();
              items.stato = "C";
              oModel.setData(items);
              this.getView().setModel(oModel, "sSelect");
              this.byId("navCon").to(this.byId("Detail"));
          } else {
              MessageToast.show("Seleziona una riga");
          } sap.ui.core.BusyIndicator.hide();
        },
        onCancel: async function () {
          var sel = this.getView().byId("tbDefinizioneAttivitaDiManutenzione").getSelectedItems();
          for (var i =( sel.length - 1); i >= 0; i--) {
              var line = JSON.stringify(sel[i].getBindingContext("T_ATTPM").getObject());
              line = JSON.parse(line);

              var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
              await this._removeHana(sURL);
          }
          this.onSearchFilters();
        },

        componiURL: function (line) {
            var sURL = `/T_ATTPM(Spras='${
                line.Spras
            }',Ilart='${
                line.Ilart
            }')`;
            // return encodeURIComponent(sURL);
            return sURL;
        },
        handleUploadPress: function () {
          this.handleUploadGenerico("/T_ATTPM");
        },
        ControlloExcelModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                Spras: (sValue[oResources.getText("Lingua")] === undefined) ? "" : sValue[oResources.getText("Lingua")].toString(),
                Ilart: (sValue[oResources.getText("TPAttivitaPM")] === undefined) ? "" : sValue[oResources.getText("TPAttivitaPM")].toString(),
                Ilatx: (sValue[oResources.getText("DescrizioneTPAttivitaPM")] === undefined) ? "" : sValue[oResources.getText("DescrizioneTPAttivitaPM")].toString()
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
                Spras: "",
                Ilart: "",
                Ilatx: ""
            }
            return sData;
        },
        ControlIndex: function (sData) {
            if (sData.Ilart === "" || sData.Ilart === undefined) {
                return "Inserire TP Attività PM";
            }
            return "";
        }
    });
});
