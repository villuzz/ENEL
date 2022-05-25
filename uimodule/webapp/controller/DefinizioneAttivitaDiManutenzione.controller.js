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
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, Filter, FilterOperator, MessageToast, manutenzioneTable, ) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.DefinizioneAttivitaDiManutenzione", {
    onInit: function () {
      this.getOwnerComponent().getRouter().getRoute("DefinizioneAttivitaDiManutenzione").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: async function () {
      var aT_ATTPM = await this._getTable("/T_ATTPM", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ATTPM);
      this.getView().setModel(oModel, "T_ATTPM");
      this._oTPC = new TablePersoController({ table: this.byId("tbDefinizioneAttivitaDiManutenzione"), componentName: "Piani", persoService: manutenzioneTable }).activate();
      this.getValueHelp();
    },
    getValueHelp: async function () {
      debugger
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_ATTPM: {},
        H_T002: {},
        H_T350I: {},
      });
      sData.T_ATTPM_CB = await this._getTable("/T_ATTPM", []);
      var aArray = [];
      sData.T_ATTPM_CB.forEach(el => {
        if (!aArray.find(item => item.Spras === el.Spras)) {
          aArray.push(el);
        }
      })
      sData.SPRAS = await this.Shpl("H_T002", "SH");
      sData.ILART = await this.Shpl("H_T350I", "SH");
      oModelHelp.setProperty("/T_ATTPM/Lingua", aArray.filter(a => a.Spras));
      oModelHelp.setProperty("/T_ATTPM/TPAttivita", sData.T_ATTPM_CB.filter(a => a.Ilart));
      oModelHelp.setProperty("/T_ATTPM/DescrizioneTPAttivita", sData.T_ATTPM_CB.filter(a => a.Ilatx));
      aArray = [];
      sData.ILART.forEach(el => {
        if (!aArray.find(item => item.Fieldname1 === el.Fieldname1)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/H_T002/Lingua", sData.SPRAS);
      oModelHelp.setProperty("/H_T350I/TPAttivita", aArray);
      // oModelHelp.setData(sData);
      this.getView().setModel(oModelHelp, "sHelp");
    },

    Shpl: async function (ShplName, ShplType) {
      var aFilter = [];
      aFilter.push(new Filter("ShplName", FilterOperator.EQ, ShplName));
      aFilter.push(new Filter("ShplType", FilterOperator.EQ, ShplType));

      var result = await this._getTable("/dySearch", aFilter);
      if (result[0].ReturnFieldValueSet) {
        result = result[0].ReturnFieldValueSet.results;
        result.splice(0, 1);
      } else {
        result = [];
      }
      return result;
    },
    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: function () {
      debugger
      var aFilters = [];
      if (this.getView().byId("cbLingua").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbLingua").getSelectedKeys(), "Spras"));
      }
      if (this.getView().byId("cbTPAttivitaPM").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbTPAttivitaPM").getSelectedKeys(), "Ilart"));
      }
      if (this.getView().byId("cbDescrizioneTPAttivitaPM").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDescrizioneTPAttivitaPM").getSelectedKeys(), "Ilatx"));
      }
      this.byId("tbDefinizioneAttivitaDiManutenzione").getBinding("items").filter(aFilters);
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
      var selectedTab = this.byId("tbDefinizioneAttivitaDiManutenzione");

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
        fileName: "DefinizioneAttivitaDiManutenzione.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbDefinizioneAttivitaDiManutenzione").getColumns().map((c) => {
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
    onNuovo: function () {
      debugger
      sap.ui.core.BusyIndicator.show();
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({ ID: "New" });
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
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
        var oTable = this.byId("tbDefinizioneAttivitaDiManutenzione");
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
    onSave: async function () {
      debugger
      var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      line = JSON.parse(line);

      if (line.ID === "New") {
        delete line.ID;
        // get Last Index
        // var sDestUsr = this.DESTUSERModel(line);
        var sManutenzione = this.ManutenzioneModel(line);
        await this._saveHana("/T_ATTPM", sManutenzione);
        var aT_ATTPM = await this._getTable("/T_ATTPM", []);
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_ATTPM);
        this.getView().setModel(oModel, "T_ATTPM");
      } else {
        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._updateHana(sURL, line);
        aT_ATTPM = await this._getTable("/T_ATTPM", []);
        oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_ATTPM);
        this.getView().setModel(oModel, "T_ATTPM");
      }
      this.byId("navCon").back();

    },
    ManutenzioneModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        Spras: (sValue[oResources.getText("Spras")] === undefined) ? undefined : sValue[oResources.getText("Spras")].toString(),
        Ilart: (sValue[oResources.getText("Ilart")] === undefined) ? undefined : sValue[oResources.getText("Ilart")].toString(),
        Ilatx: (sValue[oResources.getText("Ilatx")] === undefined) ? undefined : sValue[oResources.getText("Ilatx")].toString()
      };
      return rValue;
    },
    onModify: function () {
      debugger
      this.getView().getModel().setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbDefinizioneAttivitaDiManutenzione").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_ATTPM").getPath()});
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ATTPM").getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbDefinizioneAttivitaDiManutenzione").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ATTPM").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCancel: async function () {
      var sel = this.getView().byId("tbDefinizioneAttivitaDiManutenzione").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_ATTPM").getObject());
        line = JSON.parse(line);
        // line = this.RaggruppamentoCancelModel(line);
        var sURL = this.componiCancelURL(line);
        await this._removeHana(sURL);
      }
      this.getView().byId("tbDefinizioneAttivitaDiManutenzione").removeSelections();
      var aT_ATTPM = await this._getTable("/T_ATTPM", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ATTPM);
      this.getView().setModel(oModel, "T_ATTPM");
    },
    
    componiCancelURL: function (line) {
      debugger
      var sURL = `/T_ATTPM(Spras='${line.Spras}',Ilart='${line.Ilart}')`;

      // return encodeURIComponent(sURL);
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
        } else {
          for (i = 0; i < rows.length; i++) {
            var sManutenzioneEx = this.ManutenzioneModelExcel(rows[i]);
            if (sManutenzioneEx.Ilart.startsWith("C-")) { //Creazione                  
              // sDestUsr.Werks = await this._getLastItemData("/T_DEST_USR", "", "Divisione");

              await this._saveHana("/T_ATTPM", sManutenzioneEx);
            } else { // Modifica
              sURL = this.componiCancelURL(sManutenzioneEx)
              await this._updateHana(sURL, sManutenzioneEx);
            }
          }
          MessageBox.success("Excel Caricato con successo");
          sap.ui.core.BusyIndicator.hide(0);
          var aT_ATTPM = await this._getTable("/T_ATTPM", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_ATTPM);
          this.getView().setModel(oModel, "T_ATTPM");
          sap.ui.getCore().byId("UploadTable").close();
        }
      }
    },
    ManutenzioneModelExcel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        Spras: (sValue[oResources.getText("Lingua")] === undefined) ? undefined : sValue[oResources.getText("Lingua")].toString(),
        Ilart: (sValue[oResources.getText("TPAttivitaPM")] === undefined) ? undefined : sValue[oResources.getText("TPAttivitaPM")].toString(),
        Ilatx: (sValue[oResources.getText("DescrizioneTPAttivitaPM")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneTPAttivitaPM")].toString()
      };
      return rValue;
    },
  });
});
