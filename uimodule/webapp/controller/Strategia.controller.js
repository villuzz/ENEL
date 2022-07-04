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
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, MessageToast, Filter, FilterOperator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("PM030.APP1.controller.Strategia", {
        onInit: function () {

            var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData({});
            this.getView().setModel(oModel1, "sFilter");

            this.getOwnerComponent().getRouter().getRoute("Strategia").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbStrategia"), persoService: manutenzioneTable}).activate();
        },
        _onObjectMatched: function () {
            this.byId("navCon").back();
        },
        onSearchResult: function () {
            this.onSearchFilters();
        },

        onSearchFilters: function () {
            var aFilters = [];

            if (this.getView().byId("cbSTRATEGIA").getSelectedKeys().length !== 0) {
                aFilters = this.multiFilterText(this.getView().byId("cbSTRATEGIA").getSelectedKeys(), "STRATEGIA");
            }
            this.byId("tbStrategia").getBinding("items").filter(aFilters);
        },
        onDataExport: function () {
          var selectedTab = this.byId("tbStrategia");
          var selIndex = this.getView().byId("tbStrategia").getSelectedItems();

          var aCols,
              oSettings,
              oSheet;

          aCols = this._createColumnConfig(selectedTab);
          var aArray = [],
              oContext = {},
              i = 0;

          if (selIndex.length >= 1) {

              for (i = 0; i < selIndex.length; i++) {
                  oContext = selIndex[i].getBindingContext().getObject();
                  aArray.push(oContext);
              }
          } else {
              for (i = 0; i < selectedTab.getItems().length; i++) {
                  oContext = selectedTab.getItems()[i].getBindingContext().getObject();
                  aArray.push(oContext);
              }
          } oSettings = {
              workbook: {
                  columns: aCols
              },
              dataSource: aArray,
              fileName: "tbStrategia.xlsx",
              worker: false
          };
          oSheet = new Spreadsheet(oSettings);
          oSheet.build(). finally(function () {
              oSheet.destroy();
          });
      },

        _createColumnConfig: function () {
            var oCols = [],
                sCols = {};
            var oColumns = this.byId("tbStrategia").getColumns();
            var oCells = this.getView().byId("tbStrategia").getBindingInfo('items').template.getCells();
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
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({ID: "N"});
            this.getView().setModel(oModel, "sDetail");
            this.byId("navCon").to(this.byId("Detail"));
            sap.ui.core.BusyIndicator.hide();
        },
        onCopy: function () {
            sap.ui.core.BusyIndicator.show();
            var items = this.getView().byId("tbStrategia").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(items[0].getBindingContext().getObject());
                oModel.getData().ID = "C";
                this.getView().setModel(oModel, "sDetail");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onModify: function () {
            sap.ui.core.BusyIndicator.show();
            var items = this.getView().byId("tbStrategia").getSelectedItems();
            if (items.length === 1) {
                this.byId("Detail").bindElement({path: items[0].getBindingContext().getPath()});
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(items[0].getBindingContext().getObject());
                oModel.getData().ID = "M";
                this.getView().setModel(oModel, "sDetail");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
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
        onSave: async function () {
            var line = JSON.stringify(this.getView().getModel("sDetail").getData());
            line = JSON.parse(line);
            
                var sURL = "/Strategia/" + line.STRATEGIA;
                delete line.ID;
                delete line.__metadata;
                delete line.modifiedBy;
                delete line.modifiedAt;
                delete line.createdBy;
                delete line.createdAt;
                await this._updateHana(sURL, line);

                MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
            this.byId("navCon").back();
        },
        onCancel: async function () {
            var sel = this.getView().byId("tbStrategia").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = sel[i].getBindingContext().getObject();
                await this._removeHana("/Strategia/" + line.STRATEGIA);
            }
            this.getView().getModel().refresh();
            this.getView().byId("tbStrategia").removeSelections();
        },
        handleUploadPress: function () {
          this.handleUploadGenerico("/Servizi");
        },
        componiURL: function (line) {
          var sURL = "/Strategia/" + line.STRATEGIA;
          return sURL;
        },
        ControlloExcelModel: function (sValue) {
            var oResource = this.getResourceBundle();
            var rValue = {
                STRATEGIA: (sValue[oResource.getText("STRATEGIA")] === undefined) ? "" : sValue[oResource.getText("STRATEGIA")].toString(),
                STRATEGIA_DESC: (sValue[oResource.getText("STRATEGIA_DESC")] === undefined) ? "" : sValue[oResource.getText("STRATEGIA_DESC")].toString()
            };
            return rValue;
        }
    });
});
