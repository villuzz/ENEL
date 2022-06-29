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
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.Materiali", {
    onInit: function () {
      var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData({});
            this.getView().setModel(oModel1, "sFilter");

      this.getOwnerComponent().getRouter().getRoute("Materiali").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbMateriali"), persoService: manutenzioneTable }).activate();
    },
    _onObjectMatched: function () {
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({});
      this.getView().setModel(oModelHelp, "sHelp");
      this.byId("navCon").back();
    },
    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: function () {
      var aFilters = [];

      if (this.getView().byId("cbMateriali").getSelectedKeys().length !== 0) {
        aFilters = this.multiFilterText(this.getView().byId("cbMateriali").getSelectedKeys(), "MATNR");
      }
      this.byId("tbMateriali").getBinding("items").filter(aFilters);
    },
    multiFilterText: function (aArray, vName) {

      var aFilter = [];
      if (aArray.length === 0) {
        return new Filter(vName, FilterOperator.EQ, "");
      } else if (aArray.length === 1) {
        return new Filter(vName, FilterOperator.EQ, aArray[0]);
      } else {
        for (var i = 0; i < aArray.length; i++) {
          aFilter.push(new Filter(vName, FilterOperator.EQ, aArray[i]));
        }
        return aFilter;
      }
    },
    onDataExport: function () {
      var selectedTab = this.byId("tbMateriali");
      var selIndex = this.getView().byId("tbMateriali").getSelectedItems();

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
          fileName: "tbMateriali.xlsx",
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
      var oColumns = this.byId("tbMateriali").getColumns();
      var oCells = this.getView().byId("tbMateriali").getBindingInfo('items').template.getCells();
      for (var i = 0; i < oColumns.length; i++) {
        sCols = {
          label: oColumns[i].getHeader().getText(),
          property: oCells[i].getBindingInfo('text').parts[0].path,
          type: EdmType.String,
          format: () => { },
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
      oModel.setData({});
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbMateriali").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext().getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      } sap.ui.core.BusyIndicator.hide();
    },
    onModify: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbMateriali").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext().getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext().getObject());
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
      delete line.__metadata;
      delete line.modifiedBy;
      delete line.modifiedAt;
      delete line.createdBy;
      delete line.createdAt;

      line.MATNR = line.MATNR.padStart(18, "0");
      var sURL = "/Materiali/" + line.MATNR;
      await this._updateHana(sURL, line);
      this.onSearchFilters();
      this.byId("navCon").back();
    },
    onCancel: async function () {

      var sel = this.getView().byId("tbMateriali").getSelectedItems(),
        control = true,
        line = {};

      for (var i = (sel.length - 1); i >= 0; i--) {
        line = sel[i].getBindingContext().getObject();
        var aFilter = [];
        aFilter.push(new Filter("MATNR", FilterOperator.EQ, line.MATNR));

        var result = await this._getTable("/AzioniMateriali", aFilter);
        if (result.length > 0) {
          control = false;
          break;
        }
      }
      if (control) {
        for (i = (sel.length - 1); i >= 0; i--) {
          line = sel[i].getBindingContext().getObject();
          await this._removeHana("/Materiali/" + line.MATNR);
        }

        this.getView().getModel().refresh();
        this.getView().byId("tbMateriali").removeSelections();
      } else {
        MessageBox.error("il Materiale: " + line.MATNR + " ha Azioni Prototipo collegate");
      }
    },
    handleUploadPress: function () {
      this.handleUploadGenerico("/Materiali");
    },
    componiURL: function (line) {
      var sURL = "/Materiali/" + line.MATNR;
      return sURL;
    },
    ControlloExcelModel: function (sValue) {
      var oResource = this.getResourceBundle();
      var rValue = {
        MATNR: (sValue[oResource.getText("MATNR")] === undefined) ? "" : sValue[oResource.getText("MATNR")].toString().padStart(18, "0"),
        MAKTX: (sValue[oResource.getText("MAKTX")] === undefined) ? "" : sValue[oResource.getText("MAKTX")].toString(),
      };
      return rValue;
    },
    onSuggestMatnrSelect: function (oEvent) {
      var sel = this.getView().getModel("sHelp").getData().Matnr[oEvent.getSource().getSelectedItem().split("-").pop()];
      var sSelect = this.getView().getModel("sDetail").getData();
      sSelect.MAKTX = sel.Fieldname4;
      this.getView().getModel("sDetail").refresh();
    },
    onSuggestMatnr: async function (oEvent) {
      if (oEvent.getParameter("suggestValue").length >= 7) {
        var aFilter = [];
        aFilter.push({
          "Shlpname": "ZPM4R_SH_MATNR",
          "Shlpfield": "MATNR",
          "Sign": "I",
          "Option": "CP",
          "Low": oEvent.getParameter("suggestValue") + "*"
        });
        var sHelp = this.getView().getModel("sHelp").getData();
        sHelp.Matnr = await this.Shpl("ZPM4R_SH_MATNR", "SH", aFilter);
        this.getView().getModel("sHelp").refresh(true);
      }
    }
  });
});
