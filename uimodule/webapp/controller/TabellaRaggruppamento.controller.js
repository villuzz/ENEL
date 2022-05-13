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
  "PM030/APP1/util/manutenzioneTable"
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, MessageToast, Filter, FilterOperator, manutenzioneTable) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.TabellaRaggruppamento", {
    onInit: function () {
      this.getOwnerComponent().getRouter().getRoute("TabellaRaggruppamento").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbRaggruppamento"), componentName: "Piani", persoService: manutenzioneTable }).activate();
    },
    _onObjectMatched: async function () {
      debugger
      var aT_RAGRR = await this._getTable("/T_RAGGR", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_RAGRR);
      this.getView().setModel(oModel, "T_RAGGR");
      var oData = {
        "Enabled": true
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");

      this.getValueHelp();
      this.onSearchResult();
      // this.onFilterAddItems();
    },
    getValueHelp: async function () {
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel();

      // sData.DIVISIONE = await this.Shpl("ZPM4R_H_WERKS", "SH");
      sData.DIVISIONE = await this._getTableDistinct("/T_RAGGR", [], "Divisione");
      sData.DIVISIONENew = await this.Shpl("T001W", "CH");
      sData.RAGGRUPPAMENTO = await this.Shpl("ZPM4R_H_RAG", "SH");
      sData.DESC_RAGGR = await this._getTableDistinct("/T_RAGGR", [], "DescRaggr");
      sData.DESC_RAGGR_NEW = await this.Shpl("ZPM4R_T_RAGGR", "CH");

      // var aT_RAGRR = await this.Shpl("T001W", "CH");
      // sData.DESC_RAGGR = await this.Shpl("ZPM4R_T_RAGGR", "CH");
      oModelHelp.setData(sData);
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
    // onFilterAddItems: async function() {
    //   debugger
    //   var sFilter = {};
    //   var oModelHelp = new sap.ui.model.json.JSONModel();

    //   sFilter.DIVISIONE = await this.Shpl("T001W", "CH");
    //   oModelHelp.setData(sFilter);
    //   this.getView().setModel(oModelHelp, "sHelpField");
    // },

    onSearchFilters: function () {
      var aFilters = [];
      if (this.getView().byId("cbDivisione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Divisione"));
      }
      if (this.getView().byId("cbRaggruppamento").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbRaggruppamento").getSelectedKeys(), "Raggruppamento"));
      }
      if (this.getView().byId("cbDescRaggr").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDescRaggr").getSelectedKeys(), "DescRaggr"));
      }
      this.byId("tbRaggruppamento").getBinding("items").filter(aFilters);
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
      var selectedTab = this.byId("tbRaggruppamento");

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
        fileName: "TabellaRaggruppamento.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },
    onCloseFileUpload: function () {
      // this.onSearch();
      this.byId("UploadTable").close();
    },
    handleUploadPress: async function () {
      var oResource = this.getResourceBundle();

      if (this.getView().byId("fileUploader").getValue() === "") {
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
            var sRaggruppamento = this.RaggruppamentoModel(rows[i]);
            if (sRaggruppamento.Divisione.startsWith("C-")) { //Creazione                  
              sRaggruppamento.Divisione = await this._getLastItemData("/T_RAGGR", "", "Divisione");

              await this._saveHana("/T_RAGGR", sRaggruppamento);
            } else { // Modifica

              sURL = this.componiURL(sRaggruppamento)
              await this._updateHana(sURL, sRaggruppamento);
            }
          }
          MessageBox.success("Excel Caricato con successo");
          sap.ui.core.BusyIndicator.hide(0);
          var aT_RAGRR = await this._getTable("/T_RAGGR", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_RAGRR);
          this.getView().setModel(oModel, "T_RAGGR");
          this.byId("UploadTable").close();
        }
      }
    },
    RaggruppamentoModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString(),
        DescRaggr: (sValue[oResources.getText("DescrizioneRaggruppamento")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneRaggruppamento")].toString()
      };
      return rValue;
    },
    RaggruppamentoModelSave: function (sValue) {
      var rValue = {
        Divisione: (sValue.Divisione === "") ? "" : sValue.Divisione,
        Raggruppamento: (sValue.Raggruppamento === "") ? "" : sValue.Raggruppamento,
        DescRaggr: (sValue.DescRaggr === "") ? "" : sValue.DescRaggr
      };
      return rValue;
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbRaggruppamento").getColumns().map((c) => {
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
    onCancel: async function () {
      var sel = this.getView().byId("tbRaggruppamento").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_RAGGR").getObject());
        line = JSON.parse(line);
        line = this.RaggruppamentoCancelModel(line);
        var sURL = this.componiCancelURL(line);
        await this._removeHana(sURL);
      }
      this.getView().byId("tbRaggruppamento").removeSelections();
      var aT_RAGRR = await this._getTable("/T_RAGGR", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_RAGRR);
      this.getView().setModel(oModel, "T_RAGGR");
    },
    RaggruppamentoCancelModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        DIVISIONE: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        RAGGRUPPAMENTO: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
      };
      return rValue;
    },
    componiCancelURL: function (line) {
      var sURL = "/T_RAGGR(" + "Divisione=" + "'" + line.DIVISIONE + "'," +
        "Raggruppamento=" + "'" + line.RAGGRUPPAMENTO + "'" + ")";
      return sURL;
    },

    handleNav: function (evt) {
      var navCon = this.byId("navCon");
      var target = evt.getSource().data("target");
      if (target) {
        var oTable = this.byId("tbRaggruppamento");
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
      this.byId("UploadTable").open();
    },
    onCloseFileUpload: function () {
      this.byId("UploadTable").close();
    },


    onNuovo: function () {
      this.getView().getModel().setProperty("/Enabled", true);
      sap.ui.core.BusyIndicator.show();
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({ ID: "New" });
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
    },

    onSave: async function () {
      var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      line = JSON.parse(line);

      if (line.ID === "New") {
        delete line.ID;
        // get Last Index
        await this._saveHana("/T_RAGGR", line);
        var aT_RAGRR = await this._getTable("/T_RAGGR", []);
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_RAGRR);
        this.getView().setModel(oModel, "T_RAGGR");
      } else {
        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._updateHana(sURL, line);
        aT_RAGRR = await this._getTable("/T_RAGGR", []);
        oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_RAGRR);
        this.getView().setModel(oModel, "T_RAGGR");
      }
      this.byId("navCon").back();

    },
    RaggruppamentoSaveModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString(),
        DescRaggr: (sValue[oResources.getText("DescRaggr")] === undefined) ? undefined : sValue[oResources.getText("DescRaggr")].toString()
      };
      return rValue;
    },
    componiURL: function (line) {
      var sURL = "/T_RAGGR(" + "Divisione=" + "'" + line.Divisione + "'," +
        "Raggruppamento=" + "'" + line.Raggruppamento + "'" + ")";
      return sURL;
    },
    onBackDetail: function () {
      this.byId("navCon").back();
    },
    onModify: function () {
      this.getView().getModel().setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbRaggruppamento").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_RAGGR").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_RAGGR").getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbRaggruppamento").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_RAGGR").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
  });
});
