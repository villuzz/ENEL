sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/TablePersoController",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library",
  'sap/ui/core/routing/History',
  "PM030/APP1/util/manutenzioneTable",
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  'sap/m/MessageToast',
  'sap/ui/core/library',
  "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, Filter, FilterOperator, MessageToast, coreLibrary, Validator) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;
  var ValueState = coreLibrary.ValueState;
  return Controller.extend("PM030.APP1.controller.TabellaProgressivoAzioniTipo", {
    Validator: Validator,
    onInit: function () {
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      this.getOwnerComponent().getRouter().getRoute("TabellaProgressivoAzioniTipo").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbProgressivoAzioni"), componentName: "Piani", persoService: manutenzioneTable }).activate();
      var oModel = new sap.ui.model.json.JSONModel();
      var sData = {};
      oModel.setData(sData);
      this.getView().setModel(oModel, "sFilter");

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.attachRouteMatched(this._onObjectMatched, this);
    },

    _onObjectMatched: async function () {
      Validator.clearValidation();
      sap.ui.core.BusyIndicator.show();
      var aT_ACT_PROG = {};
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ACT_PROG);
      this.getView().setModel(oModel, "T_ACT_PROG");
      this.getValueHelp();


    },
    getValueHelp: async function () {
      debugger
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_ACT_PROG: {},
        H_T001W: {},
        T_ACT_SYST: {}


      });
      oModelHelp.setSizeLimit(2000);
      sData.T_ACT_PROG = await this._getTable("/T_ACT_PROG", []);
      var aArray = [];
      sData.T_ACT_PROG.forEach(el => {
        if (!aArray.find(item => item.Werks === el.Werks)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_PROG/Divisione", aArray.filter(a => a.Werks));

      aArray = [];
      sData.T_ACT_PROG.forEach(el => {
        if (!aArray.find(item => item.Sistema === el.Sistema)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_PROG/Sistema", aArray.filter(a => a.Sistema));
      aArray = [];
      sData.T_ACT_PROG.forEach(el => {
        if (!aArray.find(item => item.Progres === el.Progres)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_PROG/Progres", aArray.filter(a => a.Progres));

      aArray = [];
      sData.T_ACT_PROG.forEach(el => {
        if (!aArray.find(item => item.Txt === el.Txt)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_PROG/Txt", aArray.filter(a => a.Txt));


      aArray = [];
      sData.T_ACT_PROG.forEach(el => {
        if (!aArray.find(item => item.ComponentTipo === el.ComponentTipo)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_PROG/ComponentTipo", aArray.filter(a => a.ComponentTipo));

      sData.DIVISIONENew = await this.Shpl("H_T001W", "SH");
      oModelHelp.setProperty("/H_T001W/DivisioneNew", sData.DIVISIONENew);
      aArray = []
      sData.SISTEMANew = await this._getTable("/T_ACT_SYST", []);
      sData.SISTEMANew.forEach(el => {
        if (!aArray.find(item => item.Sistema === el.Sistema)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_SYST/Sistema", aArray);

      aArray = [];
      sData.PROGRESNew = await this._getTable("/T_ACT_PROG", []);
      sData.PROGRESNew.forEach(el => {
        if (!aArray.find(item => item.Progres === el.Progres)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_PROG/ProgresNew", aArray);

      aArray = [];
      sData.DESCRNew = await this._getTable("/T_ACT_PROG", []);
      sData.DESCRNew.forEach(el => {
        if (!aArray.find(item => item.Txt === el.Txt)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_PROG/DESCRNew", aArray.filter(a => a.Txt));

      aArray = [];
      sData.COMPNew = await this._getTable("/T_ACT_PROG", []);
      sData.COMPNew.forEach(el => {
        if (!aArray.find(item => item.ComponentTipo === el.ComponentTipo)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_PROG/COMPNew", aArray.filter(a => a.ComponentTipo));

      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },


    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: async function () {
     
      var aFilters = [];
      if (this.getView().byId("cbDivisione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Werks"));
      }
      if (this.getView().byId("cbSistema").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbSistema").getSelectedKeys(), "Sistema"));
      }
      if (this.getView().byId("cbProgressivo").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbProgressivo").getSelectedKeys(), "Progres"));
      }
      if (this.getView().byId("cbDescrizioneProgressivo").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDescrizioneProgressivo").getSelectedKeys(), "Txt"));
      }
      if (this.getView().byId("cbComponentTipo").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbComponentTipo").getSelectedKeys(), "ComponentTipo"));
      }
      var model = this.getView().getModel("T_ACT_PROG");
      var tableFilters = await this._getTableNoError("/T_ACT_PROG", aFilters);
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
    onDataExport: function (oEvent) {
      debugger
      var selectedTab = this.byId("tbProgressivoAzioni");
      var selIndex = this.getView().byId("tbProgressivoAzioni").getSelectedItems();

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      if (selIndex.length >= 1) {
        var aArray = [];
        for (let i = 0; i < selIndex.length; i++) {
          var oContext = selIndex[i].getBindingContext("T_ACT_PROG").getObject()
          aArray.push(oContext);
        }

        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aArray,
          fileName: "TabellaProgressivoAzioniTipo.xlsx",
          worker: false
        };
      } else {
        var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aFilters,
          fileName: "TabellaProgressivoAzioniTipo.xlsx",
          worker: false
        };
      }
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = [], sCols = {};
      var oColumns = this.byId("tbProgressivoAzioni").getColumns();
      var oCells = this.getView().byId("tbProgressivoAzioni").getBindingInfo('items').template.getCells();
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
      this.resetValueState();
      var oModel = new sap.ui.model.json.JSONModel();
      var sIndex = {},
        sIndex = this.initModel();
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
    onBackDetail: function () {
      this.byId("navCon").back();
    },
    onModify: function () {
      sap.ui.core.BusyIndicator.show();
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
      var items = this.getView().byId("tbProgressivoAzioni").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_ACT_PROG").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ACT_PROG").getObject());
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
      var items = this.getView().byId("tbProgressivoAzioni").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ACT_PROG").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCancel: async function () {
      var sel = this.getView().byId("tbProgressivoAzioni").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_ACT_PROG").getObject());
        line = JSON.parse(line);


        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._removeHana(sURL);
      }
      this.getView().byId("tbProgressivoAzioni").removeSelections();
      var T_ACT_PROG = await this._getTable("/T_ACT_PROG", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(T_ACT_PROG);
      this.getView().setModel(oModel, "T_ACT_PROG");
    },

    handleNav: function (evt) {
      var navCon = this.byId("navCon");
      var target = evt.getSource().data("target");
      if (target) {
        var oTable = this.byId("tbManutenzione");
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
    onSelectRow: function (oEvent) {

    },

    handleUploadPiani: function () {
      this.byId("UploadTable").open();
    },
    onCloseFileUpload: function () {
      this.byId("UploadTable").close();
    },
    handleUploadPress: async function () {
      // var oResource = this.getResourceBundle();

      // if (this.getView().byId("fileUploader").getValue() === "") {
      //   MessageBox.warning("Inserire un File da caricare");
      // } else {
      //   sap.ui.core.BusyIndicator.show();
      //   var i = 0,
      //     sURL,
      //     msg = "";
      //   var rows = this.getView().getModel("uploadModel").getData();
      //   var table = this.byId("tbProgressivoAzioni").getBinding("items").oList;

      //   var aArrayNew = rows.filter(function (o1) {
      //     return !table.some(function (o2) {
      //       return o1.Divisione === o2.Werks && o1.Sistema === o2.Sistema && o1.Progressivo === o2.Progres; // return the ones with equal id
      //     });
      //   });
      //   if (aArrayNew) {
      //     for (let i = 0; i < aArrayNew.length; i++) {
      //       var sAzioni = this.AzioniModel(rows[i]);
      //       await this._saveHana("/T_ACT_PROG", sAzioni);

      //     }
      //   }
      //   var intersection = table.filter(item1 => rows.some(item2 => item1.Divisione === item2.Werks && item1.Sistema === item2.Sistema && item1.Progressivo === item2.Progres));
      //   if (msg !== "") {
      //     sap.ui.core.BusyIndicator.hide(0);
      //     MessageBox.error(msg);
      //   }

      //   for (i = 0; i < intersection.length; i++) {
      //     sAzioni = this.AzioniModelModifica(intersection[i]);
      //     // Modifica
      //     sURL = this.componiURL(sAzioni);
      //     await this._updateHana(sURL, sAzioni);
      //   }

      // MessageBox.success("Excel Caricato con successo");
      // }

      // sap.ui.core.BusyIndicator.hide(0);
      // var aT_ACT_PROG = await this._getTable("/T_ACT_PROG", []);
      // var oModel = new sap.ui.model.json.JSONModel();
      // oModel.setData(aT_ACT_PROG);
      // this.getView().setModel(oModel, "T_ACT_PROG");
      // sap.ui.getCore().byId("UploadTable").close();
      debugger
      var oResource = this.getResourceBundle();

      if (this.byId("fileUploader").getValue() === "") {
        MessageBox.warning("Inserire un File da caricare");
      } else {
        sap.ui.core.BusyIndicator.show();
        var i = 0,
          sURL,
          msg = "";
        var rows = this.getView().getModel("uploadModel").getData();
        var table = this.byId("tbProgressivoAzioni").getBinding("items").oList;
        if (msg !== "") {
          sap.ui.core.BusyIndicator.hide(0);
          MessageBox.error(msg);
        }

        rows.map((row) => {
          if (table.findIndex((tRow) => {
            return row.Divisione === tRow.Werks && row.Sistema === tRow.Sistema && row.Progressivo === tRow.Progres;
          }) !== -1) {
            var sAzioni = this.AzioniModelModifica(row);
            sURL = this.componiURL(sAzioni);
            this._updateHana(sURL, sAzioni);
          } else {
            var sAzioniCre = this.AzioniModel(row);
            this._saveHana("/T_ACT_PROG", sAzioniCre);
          }
        });
      }
      MessageBox.success("Excel Caricato con successo");
      sap.ui.core.BusyIndicator.hide(0);
      var T_ACT_PROG = await this._getTable("/T_ACT_PROG", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(T_ACT_PROG);
      this.getView().setModel(oModel, "T_ACT_PROG");
      this.byId("UploadTable").close();
    },

    AzioniModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
        Progres: (sValue[oResources.getText("Progressivo")] === undefined) ? undefined : sValue[oResources.getText("Progressivo")].toString(),
        Txt: (sValue[oResources.getText("DescrizioneProgressivo")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneProgressivo")].toString(),
        ComponentTipo: (sValue[oResources.getText("ComponenteTipo")] === undefined) ? undefined : sValue[oResources.getText("ComponenteTipo")].toString()
      };
      return rValue;
    },
    AzioniModelModifica: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
        Progres: (sValue[oResources.getText("Progressivo")] === undefined) ? undefined : sValue[oResources.getText("Progressivo")].toString(),
        Txt: (sValue[oResources.getText("DescrizioneProgressivo")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneProgressivo")].toString(),
        ComponentTipo: (sValue[oResources.getText("ComponenteTipo")] === undefined) ? undefined : sValue[oResources.getText("ComponenteTipo")].toString()
      };
      return rValue;
    },



    componiURL: function (line) {
      debugger
      var sURL = `/T_ACT_PROG(Werks='${line.Werks}',Sistema='${line.Sistema}',Progres='${line.Progres}')`;

      return sURL;
    },

    onSave: async function () {
      debugger
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
            // get Last Index
            delete line.ID;
            delete line['__metadata'];
            // var sURL = this.componiURL(line);
            // var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
            await this._saveHana("/T_ACT_PROG", line);
          } else {
            var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
            await this._updateHana(sURL, line);
          }
          var T_ACT_PROG = await this._getTable("/T_ACT_PROG", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(T_ACT_PROG);
          this.getView().setModel(oModel, "T_ACT_PROG");
          this.getValueHelp();
          this.byId("navCon").back();
        }
      }
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
    ControlIndex: function (sData) {

      if (sData.Werks === "" || sData.Werks === undefined || sData.Werks === null) {
        return "Inserire Divisione";
      }
      if (sData.Sistema === "" || sData.Sistema === undefined || sData.Sistema === null) {
        return "Inserire Sistema";
      }
      if (sData.Progres === "" || sData.Progres === undefined || sData.Progres === null) {
        return "Inserire Progressivo";
      }
      return "";
    },
    initModel: function () {
      var sData = {
        Werks: "",
        Sistema: "",
        Progres: "",
        Txt: "",
        ComponentTipo: ""
      }
      return sData;
    },
  });
});
