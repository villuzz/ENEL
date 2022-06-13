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

  return Controller.extend("PM030.APP1.controller.TabellaTipoDiGestione", {
    onInit: function () {
      sap.ui.core.BusyIndicator.show();
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      this.getOwnerComponent().getRouter().getRoute("TabellaTipoDiGestione").attachPatternMatched(this._onObjectMatched, this);

    },

    _onObjectMatched: async function () {
      debugger
      var aT_TP_MAN = await this._getTable("/T_TP_MAN", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_TP_MAN);
      this.getView().setModel(oModel, "T_TP_MAN");
      this._mViewSettingsDialogs = {};
      this._oTPC = new TablePersoController({ table: this.byId("tbTabellaTipoDiGestione"), componentName: "Piani", persoService: manutenzioneTable }).activate();
      this.getValueHelp();
    },
    getValueHelp: async function () {
      debugger
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_TP_MAN: {},
        T001W: {},
        T_RAGGR: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.T_TP_MAN = await this._getTable("/T_TP_MAN", []);
      var aArray = [];
      sData.T_TP_MAN.forEach(el => {
        if (!aArray.find(item => item.TipoGestione === el.TipoGestione)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN/TipoGestione", aArray.filter(a => a.TipoGestione));

      aArray = [];
      sData.T_TP_MAN.forEach(el => {
        if (!aArray.find(item => item.Divisione === el.Divisione)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN/Divisione", aArray.filter(a => a.Divisione));

      aArray = [];
      sData.T_TP_MAN.forEach(el => {
        if (!aArray.find(item => item.Raggruppamento === el.Raggruppamento)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN/Raggruppamento", aArray.filter(a => a.Raggruppamento));

      sData.DIVISIONENew = await this.Shpl("T001W", "CH");
      oModelHelp.setProperty("/T001W/DivisioneNew", sData.DIVISIONENew);

      sData.aRAGGRUPPAMENTO = await this._getTable("/T_RAGGR", []);
      aArray = [];
      sData.aRAGGRUPPAMENTO.forEach(el => {
        if (!aArray.find(item => item.Raggruppamento === el.Raggruppamento)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_RAGGR/RAGGRUPPAMENTO", aArray.filter(a => a.Raggruppamento))



      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },
   
    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: function () {
      debugger
      var aFilters = [];
      if (this.getView().byId("cbDivisione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Divisione"));
      }
      if (this.getView().byId("cbTipoGestione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbTipoGestione").getSelectedKeys(), "TipoGestione"));
      }
      if (this.getView().byId("cbRaggruppamento").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbRaggruppamento").getSelectedKeys(), "Raggruppamento"));
      }

      this.byId("tbTabellaTipoDiGestione").getBinding("items").filter(aFilters);
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
      var selectedTab = this.byId("tbTabellaTipoDiGestione");

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
        fileName: "TabellaTipoDiGestione.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbTabellaTipoDiGestione").getColumns().map((c) => {
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
        var oTable = this.byId("tbTabellaTipoDiGestione");
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
      this.byId("UploadTable").close();
    },
    onCancel: async function () {
      debugger
      var sel = this.getView().byId("tbTabellaTipoDiGestione").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_TP_MAN").getObject());
        line = JSON.parse(line);
        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._removeHana(sURL);
      }
      this.getView().byId("tbTabellaTipoDiGestione").removeSelections();
      var aT_TP_MAN = await this._getTable("/T_TP_MAN", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_TP_MAN);
      this.getView().setModel(oModel, "T_TP_MAN");
    },
    onSave: async function () {
      debugger
      var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      line = JSON.parse(line);

      if (line.ID === "New") {
        delete line.ID;
        delete line['__metadata'];
        // get Last Index
        await this._saveHana("/T_TP_MAN", line);
      } else {
        // var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        var sURL = this.componiURL(line);
        await this._updateHana(sURL, line);
      }
      var aT_TP_MAN = await this._getTable("/T_TP_MAN", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_TP_MAN);
      this.getView().setModel(oModel, "T_TP_MAN");
      this.getValueHelp();
      this.byId("navCon").back();
    },
    componiURL: function (line) {
      debugger
      var sURL = `/T_TP_MAN(TipoGestione='${line.TipoGestione}',Divisione='${line.Divisione}')`;
      return sURL;
    },
    onModify: function () {
      debugger
      sap.ui.core.BusyIndicator.show();
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
      var items = this.getView().byId("tbTabellaTipoDiGestione").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_TP_MAN").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_TP_MAN").getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
      var items = this.getView().byId("tbTabellaTipoDiGestione").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_TP_MAN").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
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
    onBackDetail: function () {
      this.byId("navCon").back();
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
            var sGestione = this.GestioneModelSave(rows[i]);
            if (sGestione.Divisione.startsWith("C-")) { //Creazione 
              await this._saveHana("/T_TP_MAN", sGestione);
            } else { // Modifica

              sURL = this.componiURL(sGestione)
              await this._updateHana(sURL, sGestione);
            }
          }
          MessageBox.success("Excel Caricato con successo");
          var aT_TP_MAN = await this._getTable("/T_TP_MAN", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_TP_MAN);
          this.getView().setModel(oModel, "T_TP_MAN");
          sap.ui.core.BusyIndicator.hide();
          this.byId("UploadTable").close();
        }
      }
    },
    GestioneModelSave: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        TipoGestione: (sValue[oResources.getText("TipoGestione")] === undefined) ? undefined : sValue[oResources.getText("TipoGestione")].toString(),
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        DesTipoGest: (sValue[oResources.getText("DescrizioneTipoGestione")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneTipoGestione")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
      };
      return rValue
    },
  });
});
