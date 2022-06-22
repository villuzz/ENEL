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

  return Controller.extend("PM030.APP1.controller.DefinizioneAttivitaDiManutenzione", {
    Validator: Validator,
    onInit: function () {
      sap.ui.core.BusyIndicator.show();
      this.getOwnerComponent().getRouter().getRoute("DefinizioneAttivitaDiManutenzione").attachPatternMatched(this._onObjectMatched, this);
      var oData = {
        "Enabled": true
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
    },
    _onObjectMatched: async function () {
      Validator.clearValidation();
      
      var aT_ATTPM = {};
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ATTPM);
      this.getView().setModel(oModel, "T_ATTPM");
      this._oTPC = new TablePersoController({ table: this.byId("tbDefinizioneAttivitaDiManutenzione"), componentName: "Piani", persoService: manutenzioneTable }).activate();
      this.getValueHelp();
    },
    getValueHelp: async function () {
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
      var aArrayIlart = []
      sData.T_ATTPM_CB.forEach(el => {
        if (!aArrayIlart.find(item => item.Ilart === el.Ilart)) {
          aArrayIlart.push(el);
        }
      })
      sData.SPRAS = await this.Shpl("H_T002", "SH");
      sData.ILART = await this.Shpl("H_T350I", "SH");
      oModelHelp.setProperty("/T_ATTPM/Lingua", aArray.filter(a => a.Spras));
      oModelHelp.setProperty("/T_ATTPM/TPAttivita", aArrayIlart.filter(a => a.Ilart));
       var aArray = [];
      sData.T_ATTPM_CB.forEach(el => {
        if (!aArray.find(item => item.Ilatx === el.Ilatx)) {
          aArray.push(el);
        }
      })
      oModelHelp.setProperty("/T_ATTPM/DescrizioneTPAttivita", aArray.filter(a => a.Ilatx));
      aArray = [];
      sData.ILART.forEach(el => {
        if (!aArray.find(item => item.Fieldname1 === el.Fieldname1)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/H_T002/Lingua", sData.SPRAS);
      oModelHelp.setProperty("/H_T350I/TPAttivita", aArray.filter(a => a.Fieldname1));
      // oModelHelp.setData(sData);
      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },

    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: async function () {
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
      var model = this.getView().getModel("T_ATTPM");
      var tableFilters = await this._getTableNoError("/T_ATTPM", aFilters);
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
      }

      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
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
          format: (value) => { },
          template: templ
        };
      }) || [];
      return oCols;
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
      this._oValueHelpDialog.destroy();

    },
    onBackDetail: function () {
      this.byId("navCon").back();
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
            // var sDestUsr = this.DESTUSERModel(line);
            var sManutenzione = this.ManutenzioneModel(line);
            await this._saveHana("/T_ATTPM", sManutenzione);
          } else {
            var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
            await this._updateHana(sURL, line);
          }
          aT_ATTPM = await this._getTable("/T_ATTPM", []);
          oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_ATTPM);
          this.getView().setModel(oModel, "T_ATTPM");
          this.byId("navCon").back();
        };
      }

      sap.ui.core.BusyIndicator.hide(0);

    },
    ManutenzioneModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Spras: (sValue[oResources.getText("Spras")] === undefined) ? undefined : sValue[oResources.getText("Spras")].toString(),
        Ilart: (sValue[oResources.getText("Ilart")] === undefined) ? undefined : sValue[oResources.getText("Ilart")].toString(),
        Ilatx: (sValue[oResources.getText("Ilatx")] === undefined) ? undefined : sValue[oResources.getText("Ilatx")].toString()
      };
      return rValue;
    },
    onModify: function () {
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbDefinizioneAttivitaDiManutenzione").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_ATTPM").getPath() });
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
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
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
      var sURL = `/T_ATTPM(Spras='${line.Spras}',Ilart='${line.Ilart}')`;
      // return encodeURIComponent(sURL);
      return sURL;
    },

    handleUploadPress: async function () {
      // var oResource = this.getResourceBundle();
      // if (sap.ui.getCore().byId("fileUploader").getValue() === "") {
      //   MessageBox.warning("Inserire un File da caricare");
      // } else {
      //   sap.ui.core.BusyIndicator.show();
      //   var i = 0,
      //     sURL,
      //     msg = "";

      //   var rows = this.getView().getModel("uploadModel").getData();
      //   var table = this.byId("tbDefinizioneAttivitaDiManutenzione").getBinding("items").oList;

      //   var aArrayNew = rows.filter(function (o1) {
      //     return !table.some(function (o2) {
      //       return o1.Lingua === o2.Spras && o1["TP Attività PM"] === o2.Ilart && o1["Descrizione TP Attività PM"] === o2.Ilatx; // return the ones with equal id
      //     });
      //   });

      //   if (aArrayNew) {
      //     if (rows.length == table.length) {
      //       for (let i = 0; i < aArrayNew.length; i++) {
      //         var sManutenzioneNew = this.ManutenzioneModelExcel(aArrayNew[i]);
      //         sURL = this.componiCancelURL(sManutenzioneNew);
      //         await this._updateHana(sURL, sManutenzioneNew);
      //       }
      //     } else {
      //       for (let i = 0; i < aArrayNew.length; i++) {
      //         var sManutenzioneNewEX = this.ManutenzioneModelExcel(aArrayNew[i]);
      //         await this._saveHana("/T_ATTPM", sManutenzioneNewEX);
      //       }
      //     }
      //     var intersection = table.filter(item1 => rows.some(item2 => item1.Spras === item2.Lingua && item1.Ilart === item2["TP Attività PM"] && item1.Ilatx === item2["Descrizione TP Attività PM"]));
      //     if (msg !== "") {
      //       sap.ui.core.BusyIndicator.hide(0);
      //       MessageBox.error(msg);
      //     }
      //     for (i = 0; i < intersection.length; i++) {
      //       var sManutenzioneEx = this.ManutenzioneModelExcelModifica(intersection[i]);
      //       // Modifica
      //       sURL = this.componiCancelURL(sManutenzioneEx)
      //       await this._updateHana(sURL, sManutenzioneEx);
      //     }
      //     MessageBox.success("Excel Caricato con successo");
      //     sap.ui.core.BusyIndicator.hide(0);
      //     var aT_ATTPM = await this._getTable("/T_ATTPM", []);
      //     var oModel = new sap.ui.model.json.JSONModel();
      //     oModel.setData(aT_ATTPM);
      //     this.getView().setModel(oModel, "T_ATTPM");
      //     this.byId("UploadTable").close();
      //   }
      // }

      var oResource = this.getResourceBundle();

      if (sap.ui.getCore().byId("fileUploader").getValue() === "") {
        MessageBox.warning("Inserire un File da caricare");
      } else {
        sap.ui.core.BusyIndicator.show();
        var i = 0,
          sURL,
          msg = "";
        var rows = this.getView().getModel("uploadModel").getData();
        var table = this.byId("tbDefinizioneAttivitaDiManutenzione").getBinding("items").oList;
        if (msg !== "") {
          sap.ui.core.BusyIndicator.hide(0);
          MessageBox.error(msg);
        }

        rows.map((row) => {
          if (table.findIndex((tRow) => {
            return row.Lingua === tRow.Spras && row["TP Attività PM"] === tRow.Ilart;
          }) !== -1) {
            var sManutenzioneNew = this.ManutenzioneModelExcel(row);
            sURL = this.componiCancelURL(sManutenzioneNew);
            this._updateHana(sURL, sManutenzioneNew);
          } else {
            var sManutenzioneNewEX = this.ManutenzioneModelExcel(row);
            this._saveHana("/T_ATTPM", sManutenzioneNewEX);
          }
        });
      }
      MessageBox.success("Excel Caricato con successo");
      sap.ui.core.BusyIndicator.hide(0);
      var aT_ATTPM = await this._getTable("/T_ATTPM", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ATTPM);
      this.getView().setModel(oModel, "T_ATTPM");
      this.getValueHelp();
      sap.ui.getCore().byId("UploadTable").close();
    },

    ManutenzioneModelExcelModifica: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Spras: (sValue[oResources.getText("Spras")] === undefined) ? undefined : sValue[oResources.getText("Spras")].toString(),
        Ilart: (sValue[oResources.getText("Ilart")] === undefined) ? undefined : sValue[oResources.getText("Ilart")].toString(),
        Ilatx: (sValue[oResources.getText("Ilatx")] === undefined) ? undefined : sValue[oResources.getText("Ilatx")].toString()
      };
      return rValue;
    },

    ManutenzioneModelExcel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Spras: (sValue[oResources.getText("Lingua")] === undefined) ? undefined : sValue[oResources.getText("Lingua")].toString(),
        Ilart: (sValue[oResources.getText("TPAttivitaPM")] === undefined) ? undefined : sValue[oResources.getText("TPAttivitaPM")].toString(),
        Ilatx: (sValue[oResources.getText("DescrizioneTPAttivitaPM")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneTPAttivitaPM")].toString()
      };
      return rValue;
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
        Spras: "",
        Ilart: "",
        Ilarx: ""
      }
      return sData;
    },
    ControlIndex: function (sData) {

      if (sData.Spras === "" || sData.Spras === undefined || sData.Spras === null) {
        return "Inserire Lingua";
      }
      if (sData.Ilart === "" || sData.Ilart === undefined) {
        return "Inserire TP Attività PM";
      }
      return "";
    },
  });
});
