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
  "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, MessageToast, Filter, FilterOperator, manutenzioneTable, coreLibrary, Validator) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;
  var ValueState = coreLibrary.ValueState;
  return Controller.extend("PM030.APP1.controller.TabellaRaggruppamento", {
    Validator: Validator,
    onInit: function () {
      sap.ui.core.BusyIndicator.show();
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      this.getOwnerComponent().getRouter().getRoute("TabellaRaggruppamento").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbRaggruppamento"), componentName: "Piani", persoService: manutenzioneTable }).activate();
    },
    _onObjectMatched: async function () {
      Validator.clearValidation();
      
      var aT_RAGGR = {};
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_RAGGR);
      this.getView().setModel(oModel, "table_T_RAGGR");
      this.getValueHelp();
    },
    getValueHelp: async function () {
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        f_T_RAGGR: {},
        T001W: {},
        ZPM4R_H_RAG: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.f_T_RAGGR = await this._getTableDistinct("/T_RAGGR", []);
      var aArray = [];
      sData.f_T_RAGGR.forEach(el => {
        if (!aArray.find(item => item.Divisione === el.Divisione)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/f_T_RAGGR/Divisione", aArray.filter(a => a.Divisione));

      aArray = [];
      sData.f_T_RAGGR.forEach(el => {
        if (!aArray.find(item => item.Raggruppamento === el.Raggruppamento)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/f_T_RAGGR/Raggruppamento", aArray);

      aArray = [];
      sData.f_T_RAGGR.forEach(el => {
        if (!aArray.find(item => item.DescRaggr === el.DescRaggr)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/f_T_RAGGR/DescRaggr", aArray);
      sData.DIVISIONENew = await this.Shpl("T001W", "CH");
      oModelHelp.setProperty("/T001W/DivisioneNew", sData.DIVISIONENew);

      sData.RAGGRUPPAMENTO = await this.Shpl("ZPM4R_H_RAG", "SH");
      aArray = [];
      sData.RAGGRUPPAMENTO.forEach(el => {
        if (!aArray.find(item => item.Fieldname1 === el.Fieldname1)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/ZPM4R_H_RAG/RAGGRUPPAMENTO", aArray.filter(a => a.Fieldname1));

      sData.DESC_RAGGR = await this._getTable("/T_RAGGR", []);
      aArray = [];
      sData.DESC_RAGGR.forEach(el => {
        if (!aArray.find(item => item.DescRaggr === el.DescRaggr)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/ZPM4R_H_RAG/DescRaggrNew", aArray.filter(a => a.DescRaggr));

      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },

    onSearchResult: function () {
      this.onSearchFilters();
    },

    onSearchFilters: async function () {
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

      var model = this.getView().getModel("table_T_RAGGR");
      var tableFilters = await this._getTableNoError("/T_RAGGR", aFilters);
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
      var selectedTab = this.byId("tbRaggruppamento");
      var selIndex = this.getView().byId("tbRaggruppamento").getSelectedItems();

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      if (selIndex.length >= 1) {
        var aArray = [];
        for (let i = 0; i < selIndex.length; i++) {
          var oContext = selIndex[i].getBindingContext("T_RAGGR").getObject()
          aArray.push(oContext);
        }
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aArray,
          fileName: "TabellaRaggruppamento.xlsx",
          worker: false
        };
      } else {
        var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aFilters,
          fileName: "TabellaRaggruppamento.xlsx",
          worker: false
        };
      }

      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
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
        var table = this.byId("tbRaggruppamento").getBinding("items").oList;
        if (msg !== "") {
          sap.ui.core.BusyIndicator.hide(0);
          MessageBox.error(msg);
        }

        rows.map((row) => {
          if (table.findIndex((tRow) => {
            return row.Divisione === tRow.Divisione && row.Raggruppamento === tRow.Raggruppamento;
          }) !== -1) {
            var sRaggruppamentoMod = this.RaggruppamentoModel(row);
            sURL = this.componiURL(sRaggruppamentoMod);
            this._updateHana(sURL, sRaggruppamentoMod);
          } else {
            var sRaggruppamentoCre = this.RaggruppamentoModel(row);
            this._saveHana("/T_RAGGR", sRaggruppamentoCre);
          }
        });
        var aT_RAGRR = await this._getTable("/T_RAGGR", []);
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_RAGRR);
        this.getView().setModel(oModel, "T_RAGGR");
      }

      MessageBox.success("Excel Caricato con successo");
      sap.ui.core.BusyIndicator.hide(0);

      this.byId("UploadTable").close();
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
      var oResources = this.getResourceBundle();
      var rValue = {
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString(),
        DescRaggr: (sValue[oResources.getText("DescRaggr")] === undefined) ? undefined : sValue[oResources.getText("DescRaggr")].toString()
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
      this.getView().byId("fileUploader").setValue("");
      this.byId("UploadTable").open();
    },
    onCloseFileUpload: function () {
      this.byId("UploadTable").close();
    },


    onNuovo: function () {
      sap.ui.core.BusyIndicator.show();
      this.resetValueState();
      var oModel = new sap.ui.model.json.JSONModel();
      var sIndex = {},
        sIndex = this.initModel()
      oModel.setData(sIndex);
      this.getView().setModel(oModel, "sSelect");
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
      sap.ui.core.BusyIndicator.show();
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({ ID: "New" });
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
    },
    resetValueState: function () {
      //Get All fields
      var allRegisteredControls = sap.ui.getCore().byFieldGroupId("");
      var aComboBox = allRegisteredControls.filter(c => c.isA("sap.m.ComboBox"));

      for (var i = 0; i < aComboBox.length; i++) {
        if (aComboBox[i].getValueState() === sap.ui.core.ValueState.Error) {
          aComboBox[i].setValueState("None")
        }
      }
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
            await this._saveHana("/T_RAGGR", line);
          } else {
            var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
            await this._updateHana(sURL, line);
          }
          var aT_RAGRR = await this._getTable("/T_RAGGR", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_RAGRR);
          this.getView().setModel(oModel, "T_RAGGR");
          this.byId("navCon").back();
        }
      }
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
    onBackDetail: function (oEvent) {
      this.byId("navCon").back();
    },
    onModify: function () {
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
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
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
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
    handleChangeIn: function (oEvent) {
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
        Divisione: "",
        Raggruppamento: "",
        DescRaggr: ""
      }
      return sData;
    },
    ControlIndex: function (sData) {

      if (sData.Divisione === "" || sData.Divisione === undefined || sData.Divisione === null) {
        return "Inserire Divisione";
      }
      if (sData.Raggruppamento === "" || sData.Raggruppamento === undefined || sData.Raggruppamento === null) {
        return "Inserire Raggruppamento";
      }
      return "";
    },
  });
});
