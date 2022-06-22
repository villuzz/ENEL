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
  return Controller.extend("PM030.APP1.controller.TabellaDestinatariCdl", {
    Validator: Validator,
    onInit: function () {
      sap.ui.core.BusyIndicator.show();
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      this.getOwnerComponent().getRouter().getRoute("TabellaDestinatariCdl").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbTabellaDestinatariCdl"), componentName: "Piani", persoService: manutenzioneTable }).activate();


    },
    _onObjectMatched: async function () {
      Validator.clearValidation();
      var aT_DEST = {};
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_DEST);
      this.getView().setModel(oModel, "T_DEST");
      this.getValueHelp();
    },

    getValueHelp: async function () {
      debugger
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_DEST: {},
        T001W: {},
        ZPM4R_H_RAG: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.T_DEST = await this._getTable("/T_DEST", []);
      var aArray = [];
      sData.T_DEST.forEach(el => {
        if (!aArray.find(item => item.Werks === el.Werks)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST/Divisione", aArray.filter(a => a.Werks));

      aArray = [];
      sData.T_DEST.forEach(el => {
        if (!aArray.find(item => item.Arbpl === el.Arbpl)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST/Arbpl", aArray.filter(a => a.Arbpl));

      aArray = [];
      sData.T_DEST.forEach(el => {
        if (!aArray.find(item => item.Destinatario === el.Destinatario)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST/Destinatario", aArray.filter(a => a.Destinatario));

      aArray = [];
      sData.T_DEST.forEach(el => {
        if (!aArray.find(item => item.Txt === el.Txt)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST/Txt", aArray.filter(a => a.Txt));

      aArray = [];
      sData.T_DEST.forEach(el => {
        if (!aArray.find(item => item.Raggruppamento === el.Raggruppamento)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST/Raggruppamento", aArray.filter(a => a.Raggruppamento));

      sData.DIVISIONENew = await this.Shpl("T001W", "CH");
      oModelHelp.setProperty("/T001W/DivisioneNew", sData.DIVISIONENew);

      sData.CentroDLNew = await this.Shpl("CRAM", "SH");

      sData.RAGGRUPPAMENTO = await this.Shpl("ZPM4R_H_RAG", "SH");
      sData.RAGGRUPPAMENTO.forEach(el => {
        if (!aArray.find(item => item.Fieldname1 === el.Fieldname1)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/ZPM4R_H_RAG/RAGGRUPPAMENTO", aArray.filter(a => a.Fieldname1));



      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },


    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: async function () {
      debugger
      var aFilters = [];
      if (this.getView().byId("cbDivisione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Werks"));
      }
      if (this.getView().byId("cbCentroDiLavoro").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbCentroDiLavoro").getSelectedKeys(), "Arbpl"));
      }
      if (this.getView().byId("cbDestinatario").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDestinatario").getSelectedKeys(), "Destinatario"));
      }
      if (this.getView().byId("cbDescrizioneDestinatario").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDescrizioneDestinatario").getSelectedKeys(), "Txt"));
      }
      if (this.getView().byId("cbRaggruppamento").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbRaggruppamento").getSelectedKeys(), "Raggruppamento"));
      }
      var model = this.getView().getModel("T_DEST");
      var tableFilters = await this._getTableNoError("/T_DEST", aFilters);
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
      debugger
      var selectedTab = this.byId("tbTabellaDestinatariCdl");
      var selIndex = this.getView().byId("tbTabellaDestinatariCdl").getSelectedItems();

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");

      if (selIndex.length >= 1) {
        var aArray = [];
        for (let i = 0; i < selIndex.length; i++) {
          var oContext = selIndex[i].getBindingContext("T_DEST").getObject()
          aArray.push(oContext);
        }
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aArray,
          fileName: "TabellaDestinatariCdl.xlsx",
          worker: false
        };
      } else {
        var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aFilters,
          fileName: "TabellaDestinatariCdl.xlsx",
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
      var oCols = this.byId("tbTabellaDestinatariCdl").getColumns().map((c) => {
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
        var oTable = this.byId("tbTabellaDestinatariCdl");
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

    onSave: async function () {
      // sap.ui.core.BusyIndicator.show();
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
          // var metadata = line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length -1];
          if (line.ID === "New") {
            // get Last Index
            delete line.ID;
            await this._saveHana("/T_DEST", line);
          } else {
            // line = this.DestinatariModelSave(line);
            delete line.__metadata
            var sURL = this.componiURL(line);
            // var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];

            await this._updateHana(sURL, line);
            var aT_DEST = await this._getTable("/T_DEST", []);
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(aT_DEST);
            this.getView().setModel(oModel, "T_DEST");
            this.getValueHelp();
          };
          this.byId("navCon").back();

        }
      }
    },
    componiURL: function (line) {
      debugger
      var sURL = `/T_DEST(Werks='${line.Werks}',Arbpl='${line.Arbpl}',Destinatario='${line.Destinatario}')`;
      return sURL;
    },
    onCancel: async function () {
      debugger
      var sel = this.getView().byId("tbTabellaDestinatariCdl").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_DEST").getObject());
        line = JSON.parse(line);
        line = this.DestinatariCancelModel(line);
        var sURL = this.componiCancelURL(line);
        await this._removeHana(sURL);
      }
      this.getView().byId("tbTabellaDestinatariCdl").removeSelections();
      var aT_DEST = await this._getTable("/T_DEST", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_DEST);
      this.getView().setModel(oModel, "T_DEST");
    },
    DestinatariCancelModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        WERKS: (sValue[oResources.getText("Werks")] === undefined) ? undefined : sValue[oResources.getText("Werks")].toString(),
        ARBPL: (sValue[oResources.getText("Arbpl")] === undefined) ? undefined : sValue[oResources.getText("Arbpl")].toString(),
        DESTINATARIO: (sValue[oResources.getText("Destinatario")] === undefined) ? undefined : sValue[oResources.getText("Destinatario")].toString(),
      };
      return rValue;
    },
    componiCancelURL: function (line) {
      debugger
      var sURL = `/T_DEST(Werks='${line.WERKS}',Arbpl='${line.ARBPL}',Destinatario='${line.DESTINATARIO}')`;
      return sURL;
    },
    handleUploadPiani: function () {
      this.byId("UploadTable").open();
    },
    onCloseFileUpload: function () {
      this.byId("UploadTable").close();
    },

    onModify: function () {
      debugger
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbTabellaDestinatariCdl").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_DEST").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_DEST").getObject());
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
      var items = this.getView().byId("tbTabellaDestinatariCdl").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_DEST").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
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
    onBackDetail: function () {
      this.byId("navCon").back();
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
        var table = this.byId("tbTabellaDestinatariCdl").getBinding("items").oList;
        if (msg !== "") {
          sap.ui.core.BusyIndicator.hide(0);
          MessageBox.error(msg);
        }

        rows.map((row) => {
          if (table.findIndex((tRow) => {
            return row.Divisione === tRow.Werks && row["Centro di Lavoro"] === tRow.Arbpl && row.Destinatario === tRow.Destinatario;
          }) !== -1) {
            var sDestinatariMod = this.DestinatariModel(row);
            sURL = this.componiURLExcel(sDestinatariMod);
            this._updateHana(sURL, sDestinatariMod);
          } else {
            var sDestinatariCre = this.DestinatariModel(row);
            this._saveHana("/T_DEST", sDestinatariCre);
          }
        });
      }
      this.getValueHelp();
      var aT_DEST = await this._getTable("/T_DEST", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_DEST);
      this.getView().setModel(oModel, "T_DEST");
      MessageBox.success("Excel Caricato con successo");
      sap.ui.core.BusyIndicator.hide(0);
      this.byId("UploadTable").close();
    },
    componiURLExcel: function (line) {
      debugger
      var sURL = `/T_DEST(Werks='${line.Werks}',Arbpl='${line.Arbpl}',Destinatario='${line.Destinatario}')`;

      // return encodeURIComponent(sURL);
      return sURL;
    },
    DestinatariModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Arbpl: (sValue[oResources.getText("CentroDiLavoro")] === undefined) ? undefined : sValue[oResources.getText("CentroDiLavoro")].toString(),
        Destinatario: (sValue[oResources.getText("Destinatario")] === undefined) ? undefined : sValue[oResources.getText("Destinatario")].toString(),
        Txt: (sValue[oResources.getText("DescrizioneDestinatario")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneDestinatario")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString(),
        Mail: (sValue[oResources.getText("Email")] === undefined) ? undefined : sValue[oResources.getText("Email")].toString()
      };
      return rValue
    },
    DestinatariModelSave: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Werks")] === undefined) ? undefined : sValue[oResources.getText("Werks")].toString(),
        Arbpl: (sValue[oResources.getText("Arbpl")] === undefined) ? undefined : sValue[oResources.getText("Arbpl")].toString(),
        Destinatario: (sValue[oResources.getText("Destinatario")] === undefined) ? undefined : sValue[oResources.getText("Destinatario")].toString(),
        Txt: (sValue[oResources.getText("Txt")] === undefined) ? undefined : sValue[oResources.getText("Txt")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString(),
        Mail: (sValue[oResources.getText("Mail")] === undefined) ? undefined : sValue[oResources.getText("Mail")].toString()
      };
      return rValue
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
        Werks: "",
        Arbpl: "",
        Destinatario: "",
        Txt: "",
        Raggruppamento: "",
        Mail: ""
      };
      return sData;
    },
    ControlIndex: function (sData) {

      if (sData.Werks === "" || sData.Werks === undefined || sData.Werks === null) {
        return "Inserire Divisione";
      }
      if (sData.Arbpl === "" || sData.Arbpl === undefined || sData.Arbpl === null) {
        return "Inserire Centro di Lavoro";
      }
      if (sData.Destinatario === "" || sData.Destinatario === undefined || sData.Destinatario === null) {
        return "Inserire Destinatario";
      }
      return "";
    },
  });
});
