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
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;
  var ValueState = coreLibrary.ValueState;
  return Controller.extend("PM030.APP1.controller.TabellaGruppoDiControllo", {
    Validator: Validator,
    onInit: function () {
      sap.ui.core.BusyIndicator.show();
      var oData = {
        "Enabled": true
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");

      this.getOwnerComponent().getRouter().getRoute("TabellaGruppoDiControllo").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: async function () {
      Validator.clearValidation();
      var aT_TP_MAN2 = {};
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_TP_MAN2);
      this.getView().setModel(oModel, "T_TP_MAN2");
      this._mViewSettingsDialogs = {};
      this._oTPC = new TablePersoController({ table: this.byId("tbTabellaGruppoDiControllo"), componentName: "Piani", persoService: manutenzioneTable }).activate();
      this.getValueHelp();
    },
    getValueHelp: async function () {
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_TP_MAN2: {},
        T001W: {},
        T_RAGGR: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.T_TP_MAN2 = await this._getTable("/T_TP_MAN2", []);
      var aArray = []
      sData.T_TP_MAN2.forEach(el => {
        if (!aArray.find(item => item.TipoGestione2 === el.TipoGestione2)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN2/TipoGestione2", aArray.filter(a => a.TipoGestione2));

      aArray = [];
      sData.T_TP_MAN2.forEach(el => {
        if (!aArray.find(item => item.Divisione === el.Divisione)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN2/Divisione", aArray.filter(a => a.Divisione));

      aArray = [];
      sData.T_TP_MAN2.forEach(el => {
        if (!aArray.find(item => item.Raggruppamento === el.Raggruppamento)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN2/Raggruppamento", aArray.filter(a => a.Raggruppamento));

      sData.DIVISIONENew = await this.Shpl("T001W", "CH");
      oModelHelp.setProperty("/T001W/DivisioneNew", sData.DIVISIONENew);


      sData.aRAGGRUPPAMENTO = await this._getTable("/T_RAGGR", [])
      aArray = [];
      sData.aRAGGRUPPAMENTO.forEach(el => {
        if (!aArray.find(item => item.Raggruppamento === el.Raggruppamento)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_RAGGR/Raggruppamento", aArray.filter(a => a.Raggruppamento));

      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },

    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: async function () {
      debugger
      var aFilters = [];
      if (this.getView().byId("cbGruppoControlli").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbGruppoControlli").getSelectedKeys(), "TipoGestione2"));
      }
      if (this.getView().byId("cbDivisione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Divisione"));
      }

      if (this.getView().byId("cbRaggruppamento").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbRaggruppamento").getSelectedKeys(), "Raggruppamento"));
      }

      var model = this.getView().getModel("T_TP_MAN2");
      var tableFilters = await this._getTableNoError("/T_TP_MAN2", aFilters);
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
      var selectedTab = this.byId("tbTabellaGruppoDiControllo");
      var selIndex = this.getView().byId("tbTabellaGruppoDiControllo").getSelectedItems();

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      if (selIndex.length >= 1) {
        var aArray = [];
        for (let i = 0; i < selIndex.length; i++) {
          var oContext = selIndex[i].getBindingContext("T_TP_MAN2").getObject()
          aArray.push(oContext);
        }
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aArray,
          fileName: "TabellaGruppoDiControllo.xlsx",
          worker: false
        };
      } else {
        var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aFilters,
          fileName: "TabellaGruppoDiControllo.xlsx",
          worker: false
        };
      }

      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      debugger
      var oCols = this.byId("tbTabellaGruppoDiControllo").getColumns().map((c) => {
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
        var oTable = this.byId("tbTabellaGruppoDiControllo");
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
      this.byId("fileUploader").setValue("");
      this.byId("UploadTable").open();

    },
    onCloseFileUpload: function () {
      this.byId("UploadTable").close();
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
    onSave: async function () {
      var ControlValidate = Validator.validateView();
      if (ControlValidate) {
        var line = JSON.stringify(this.getView().getModel("sDetail").getData());
        line = JSON.parse(line);
        var msg = "",
          sURL;
        msg = await this.ControlIndex(line);
        if (msg !== "") {
          MessageBox.error(msg);
        } else {
          if (line.ID === "New") {
            delete line.ID;
            // get Last Index
            delete line["__metadata"];
            var sControllo = this.ControlloModel(line);
            await this._saveHana("/T_TP_MAN2", sControllo);
          } else {
            var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
            await this._updateHana(sURL, line);
          }
          var aT_TP_MAN2 = await this._getTable("/T_TP_MAN2", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_TP_MAN2);
          this.getView().setModel(oModel, "T_TP_MAN2");
          this.byId("navCon").back();
        }
      }
    },
    ControlloModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        TipoGestione2: (sValue[oResources.getText("TipoGest2")] === undefined) ? undefined : sValue[oResources.getText("TipoGest2")].toString(),
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        DesTipoGest2: (sValue[oResources.getText("DescrGruppoControlli")] === undefined) ? undefined : sValue[oResources.getText("DescrGruppoControlli")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
      };
      return rValue;
    },

    onModify: function () {
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbTabellaGruppoDiControllo").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_TP_MAN2").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_TP_MAN2").getObject());
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
    onCancel: async function () {
      var sel = this.getView().byId("tbTabellaGruppoDiControllo").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_TP_MAN2").getObject());
        line = JSON.parse(line);
        var sURL = this.componiCancelURL(line);
        await this._removeHana(sURL);
      }
      this.getView().byId("tbTabellaGruppoDiControllo").removeSelections();
      var aT_RAGRR = await this._getTable("/T_TP_MAN2", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_RAGRR);
      this.getView().setModel(oModel, "T_TP_MAN2");
    },
    componiCancelURL: function (line) {
      var sURL = "/T_TP_MAN2(" + "TipoGestione2=" + "'" + line.TipoGestione2 + "'," +
        "Divisione=" + "'" + line.Divisione + "'" + ")";
      return sURL;
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
      var items = this.getView().byId("tbTabellaGruppoDiControllo").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_TP_MAN2").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
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
        // var table = this.byId("tbTabellaGruppoDiControllo").getBinding("items").oList;
        if (msg !== "") {
          sap.ui.core.BusyIndicator.hide(0);
          MessageBox.error(msg);
        }
        for (let i = 0; i < rows.length; i++) {
          var sControlEX = this.ControlloExcelModel(rows[i]);
          sURL = this.componiURL(sControlEX);
          var result = await this._updateHanaNoError(sURL, sControlEX);
          if (result.length === 0) {
            await this._saveHanaNoError("/T_TP_MAN2", sControlEX);
          }
        }
      }
      MessageBox.success("Excel Caricato con successo");
      this.readTable();
      this.byId("UploadTable").close();
      sap.ui.core.BusyIndicator.hide(0);
    },
    readTable: async function () {
      var aT_TP_MAN2 = await this._getTable("/T_TP_MAN2", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_TP_MAN2);
      this.getView().setModel(oModel, "T_TP_MAN2");
    },
    componiURL: function (line) {
      var sURL = "/T_TP_MAN2(" + "TipoGestione2=" + "'" + line.TipoGestione2 + "'," +
        "Divisione=" + "'" + line.Divisione + "'" + ")";
      return sURL;
    },
    ControlloExcelModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        TipoGestione2: (sValue[oResources.getText("GruppoControlli")] === undefined) ? undefined : sValue[oResources.getText("GruppoControlli")].toString(),
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        DesTipoGest2: (sValue[oResources.getText("DescrizioneGruppoControlli")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneGruppoControlli")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
      };
      return rValue;
    },
    ControlloSaveEx: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        TipoGestione2: (sValue[oResources.getText("TipoGestione2")] === undefined) ? undefined : sValue[oResources.getText("TipoGestione2")].toString(),
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        DesTipoGest2: (sValue[oResources.getText("DesTipoGest2")] === undefined) ? undefined : sValue[oResources.getText("DesTipoGest2")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
      };
      return rValue;
    },
    handleChangeCb: function (oEvent) {
      debugger
      var oValidatedComboBox = oEvent.getSource(),
        sSelectedKey = oValidatedComboBox.getSelectedKey(),
        sValue = oValidatedComboBox.getValue();

      if (!sSelectedKey && sValue) {
        oValidatedComboBox.setValueState(ValueState.Error);
      } else {
        oValidatedComboBox.setValueState(ValueState.None);
      }
    },
    handleChangeIn: function (oEvent) {
      debugger
      var oValidatedInput = oEvent.getSource(),
        sSuggestion = oEvent.getSource().getSuggestionRows(),
        sValue = oValidatedInput.getValue();
      if (!_.contains(sSuggestion, sValue)) {
        oValidatedInput.setValueState(ValueState.Error);
      } else {
        oValidatedInput.setValueState(ValueState.None);
      }
    },
    initModel: function () {
      var sData = {
        TipoGestione2: "",
        Divisione: "",
        DesTipoGest2: "",
        Raggruppamento: ""
      }
      return sData;
    },
    ControlIndex: function (sData) {

      if (sData.TipoGestione2 === "" || sData.TipoGestione2 === undefined || sData.TipoGestione2 === null) {
        return "Inserire Gruppo Controlli";
      }
      if (sData.Divisione === "" || sData.Divisione === undefined || sData.Divisione === null) {
        return "Inserire Divisione";
      }
      return "";
    },
  });
});
