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

  return Controller.extend("PM030.APP1.controller.CaricaTabellaM", {
    onInit: function () {
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      this._oTPC = new TablePersoController({ table: this.byId("tbCaricaTabellaM"), persoService: manutenzioneTable }).activate();
      this.getOwnerComponent().getRouter().getRoute("CaricaTabellaM").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: async function () {
      var aT_PMO_M = await this._getTable("/T_PMO_M", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_PMO_M);
      this.getView().setModel(oModel, "T_PMO_M");
      this.getValueHelp();
    },

    getValueHelp: async function () {
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_PMO_M: {},
        T001W: {},
        T_RAGGR: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.T_PMO_M = await this._getTable("/T_PMO_M", []);
      debugger
      var aArray = []
      sData.T_PMO_M.forEach(el => {
        if (!aArray.find(item => item.IndexPmo === el.IndexPmo)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_PMO_M/Azione", aArray.filter(a => a.IndexPmo));

      aArray = [];
      sData.T_PMO_M.forEach(el => {
        if (!aArray.find(item => item.Matnr === el.Matnr)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_PMO_M/Materiale", aArray.filter(a => a.Matnr));

      aArray = [];
      sData.T_PMO_M.forEach(el => {
        if (!aArray.find(item => item.Werks === el.Werks)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_PMO_M/Divisione", aArray.filter(a => a.Werks));

      debugger
      sData.Materiali = await this.Shpl("MAT1", "SH");
      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },

    onSearchResult: function (oEvent) {
      debugger;
      var oModel = this.getView().getModel("FilterModel");
      this.onSearchFilters();
    },
    onSearchFilters: async function () {
      debugger
      var aFilters = [];
      if (this.getView().byId("cbAzione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbAzione").getSelectedKeys(), "IndexPmo"));
      }
      if (this.getView().byId("cbMateriale").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbMateriale").getSelectedKeys(), "Matnr"));
      }

      if (this.getView().byId("cbDivisione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Werks"));
      }

      var model = this.getView().getModel("T_PMO_M");
      var tableFilters = await this._getTableNoError("/T_PMO_M", aFilters);
      if (tableFilters.length === 0) {
        MessageBox.error("Nessun record trovato");
        model.setData({});
      }
      model.setData(tableFilters);
    },
    multiFilterNumber: function (aArray, vName) {
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
      var selectedTab = this.byId("tbCaricaTabellaM");

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      oSettings = {
        workbook: {
          columns: aCols
        },
        dataSource: oRowBinding,
        fileName: "CaricaTabellaM.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbCaricaTabellaM").getColumns().map((c) => {
        var templ = "";
        var typ = EdmType.String;
        //var prop = c.mAggregations.header.getText(); 
        var prop = c.getCustomData()[0].getValue();
        return {
          label: c.getHeader().getText(),
          property: prop,
          type: typ,
          format: (value) => { },
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

    handleNav: function (evt) {
      var navCon = this.byId("navCon");
      var target = evt.getSource().data("target");
      if (target) {
        var oTable = this.byId("tbCaricaTabellaM");
        var SelectItem = oTable.getSelectedItem();
        var oContext = SelectItem.getBindingContext("mManutenzione");
        var sPath = oContext.getPath();
        var oDett = this.byId(target);
        oDett.bindElement({ path: sPath, model: "mManutenzione" });
        navCon.to(this.byId(target));
      } else {
        navCon.back();
      }
    },
    onPersoButtonPressed: function () {
      this._oTPC.openDialog();
    },
    onSelectRow: function () {
      this.getView().getModel("tabCheckModel").setProperty("/editEnabled", true);
    },

    handleUploadPiani: function () {
      this._oValueHelpDialog = sap.ui.xmlfragment("PM030.APP1.view.fragment.UploadTable", this);
      this.getView().addDependent(this._oValueHelpDialog);
      this.getView().setModel(this.oEmployeeModel);
      this._oValueHelpDialog.open();

    },
    onCloseFileUpload: function () {
      // this.onSearch();
      this._oValueHelpDialog.destroy();

    },
    onBackDetail: function () {
      this.byId("navCon").back();
    },

    onNuovo: function () {
      debugger
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
      sap.ui.core.BusyIndicator.show();
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({ ID: "New" });
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
    },
    onModify: function () {
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbCaricaTabellaM").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_PMO_M").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_PMO_M").getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onSave: async function () {
      var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      line = JSON.parse(line);
      var msg = "",
        sURL;
      // msg = await this.ControlIndex(line);
      if (msg !== "") {
        MessageBox.error(msg);
      } else {
        if (line.ID === "New") {
          delete line.ID;
          // get Last Index
          delete line["__metadata"];
          // var sControllo = this.ControlloModel(line);
          await this._saveHana("/T_PMO_M", line);
        } else {
          var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
          await this._updateHana(sURL, line);
        }
        var aT_PMO_M = await this._getTable("/T_PMO_M", []);
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_PMO_M);
        this.getView().setModel(oModel, "T_PMO_M");
        this.byId("navCon").back();
      }

    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      // this.getView().getModel("oDataModel").setProperty("/Enabled", true);
      var items = this.getView().byId("tbCaricaTabellaM").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_PMO_M").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCancel: async function () {
      var sel = this.getView().byId("tbCaricaTabellaM").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_PMO_M").getObject());
        line = JSON.parse(line);
        var sURL = this.componiCancelURL(line);
        await this._removeHana(sURL);
      }
      this.getView().byId("tbCaricaTabellaM").removeSelections();
      var aT_RAGRR = await this._getTable("/T_PMO_M", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_RAGRR);
      this.getView().setModel(oModel, "T_PMO_M");
    },
    componiCancelURL: function (line) {
      debugger
      var sURL = "/T_PMO_M(" + "IndexPmo=" + "'" + line.IndexPmo + "'," +
        "Cont=" + "'" + line.Cont + "'" + "'," + "Matnr=" + "'" + line.Matnr + "'" + "'," + "Maktx=" + "'" + line.Maktx + "'" + ")";
      return sURL;
    },
    componiURL: function (line) {
      debugger
      var sURL = "/T_PMO_M(" + "IndexPmo=" + "'" + line.IndexPmo + "'," +
        "Cont=" + "'" + line.Cont + "'" + "'," + "Matnr=" + "'" + line.Matnr + "'" + "'," + "Maktx=" + "'" + line.Maktx + "'" + ")";
      return sURL;
    },
    handleUploadPress: async function () {
      debugger
      var oResource = this.getResourceBundle();

      if (sap.ui.getCore().byId("fileUploader").getValue() === "") {
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
          var sControlEX = this.ControlloExcelModel(rows[i]);
          sURL = this.componiURL(sControlEX);
          var result = await this._updateHanaNoError(sURL, sControlEX);
          if (result.length === 0) {
            await this._saveHanaNoError("/T_PMO_M", sControlEX);
          }
        }
      }
      MessageBox.success("Excel Caricato con successo");
      var aT_PMO_M = await this._getTable("/T_PMO_M", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_PMO_M);
      this.getView().setModel(oModel, "T_PMO_M");
      sap.ui.getCore().byId("UploadTable").close();
      sap.ui.core.BusyIndicator.hide();
    },
    ControlloExcelModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        IndexPmo: (sValue[oResources.getText("Azione")] === undefined) ? undefined : sValue[oResources.getText("Azione")].toString(),
        Matnr: (sValue[oResources.getText("MATNR")] === undefined) ? undefined : sValue[oResources.getText("MATNR")].toString(),
        Maktx: (sValue[oResources.getText("TestoBreveMat")] === undefined) ? undefined : sValue[oResources.getText("TestoBreveMat")].toString(),
        Menge: (sValue[oResources.getText("QuantFabbisogno")] === undefined) ? undefined : sValue[oResources.getText("QuantFabbisogno")].toString(),
        Meins: (sValue[oResources.getText("Unita")] === undefined) ? undefined : sValue[oResources.getText("Unita")].toString(),
        Lgort: (sValue[oResources.getText("Magazzino")] === undefined) ? undefined : sValue[oResources.getText("Magazzino")].toString(),
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Charg: (sValue[oResources.getText("Partita")] === undefined) ? undefined : sValue[oResources.getText("Partita")].toString(),
        Tbtwr: (sValue[oResources.getText("PrezzoLordo")] === undefined) ? undefined : sValue[oResources.getText("PrezzoLordo")].toString(),
        Waers: (sValue[oResources.getText("Divisa")] === undefined) ? undefined : sValue[oResources.getText("Divisa")].toString(),
        Ekgrp: (sValue[oResources.getText("GrupAcq")] === undefined) ? undefined : sValue[oResources.getText("GrupAcq")].toString(),
        Ekorg: (sValue[oResources.getText("OrgAcq")] === undefined) ? undefined : sValue[oResources.getText("OrgAcq")].toString(),
        Afnam: (sValue[oResources.getText("Richiedente")] === undefined) ? undefined : sValue[oResources.getText("Richiedente")].toString(),
        Matkl: (sValue[oResources.getText("GrupMerci")] === undefined) ? undefined : sValue[oResources.getText("GrupMerci")].toString()
      };
      return rValue;
    },
  });
});
