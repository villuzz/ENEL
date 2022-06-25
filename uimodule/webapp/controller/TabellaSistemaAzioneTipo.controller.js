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
  return Controller.extend("PM030.APP1.controller.TabellaSistemaAzioneTipo", {
    Validator: Validator,
    onInit: function () {

      this.getOwnerComponent().getRouter().getRoute("TabellaSistemaAzioneTipo").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbTabellaSistemaAzioneTipo"), componentName: "Piani", persoService: manutenzioneTable }).activate();
      var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");
    },
    _onObjectMatched: async function () {
      Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_ACT_SYST");

            this.getValueHelp();
    },
    getValueHelp: async function () {
      sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            var T_ACT_SYST = await this._getTable("/T_ACT_SYST", []);

            sData.Werks = this.distinctBy(T_ACT_SYST, "Werks");
            sData.Sistema = this.distinctBy(T_ACT_SYST, "Sistema");
            sData.Txt = this.distinctBy(T_ACT_SYST, "Txt");
            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");

            var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData(T_ACT_SYST);
            this.getView().setModel(oModel1, "T_ACT_SYST");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
    },

    onSearchResult: function () {
      this.onSearchFilters();
    },
    onBackDetail: function () {
      this.byId("navCon").back();
    },
    onSearchFilters: async function () {
      sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbTabellaSistemaAzioneTipo").removeSelections();
            var sFilter = this.getModel("sFilter").getData();
            var aFilters = [],
                tempFilter = [];

            if (sFilter.Werks !== undefined) {
                if (sFilter.Werks.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Werks, "Werks");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Sistema !== undefined) {
                if (sFilter.Sistema.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Sistema, "Sistema");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Txt !== undefined) {
                if (sFilter.Txt.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Txt, "Txt");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            var model = this.getView().getModel("T_ACT_SYST");
            var tableFilters = await this._getTableNoError("/T_ACT_SYST", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
    },
    onDataExport: function () {
      var selectedTab = this.byId("tbTabellaSistemaAzioneTipo");
      var selIndex = this.getView().byId("tbTabellaSistemaAzioneTipo").getSelectedItems();

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      if (selIndex.length >= 1) {
        var aArray = [];
        for (let i = 0; i < selIndex.length; i++) {
          var oContext = selIndex[i].getBindingContext("T_ACT_SYST").getObject()
          aArray.push(oContext);
        }
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aArray,
          fileName: "TabellaSistemaAzioneTipo.xlsx",
          worker: false
        };
      } else {
        var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aFilters,
          fileName: "TabellaSistemaAzioneTipo.xlsx",
          worker: false
        };
      }
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbTabellaSistemaAzioneTipo").getColumns().map((c) => {
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
      this.navTo("ViewPage");
  },

    onPersoButtonPressed: function () {
      this._oTPC.openDialog();
    },
    handleUploadPiani: function () {
      this._oValueHelpDialog = sap.ui.xmlfragment("PM030.APP1.view.fragment.UploadTable", this);
      this.getView().addDependent(this._oValueHelpDialog);
      this.getView().setModel(this.oEmployeeModel);
      this._oValueHelpDialog.open();

    },

    onNuovo: function () {
      sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            var items = this.initModel();
            items.stato = "N";
            oModel.setData(items);
            this.getView().setModel(oModel, "sSelect");

            this.byId("navCon").to(this.byId("Detail"));

            sap.ui.core.BusyIndicator.hide();
    },

    onModify: function () {
      sap.ui.core.BusyIndicator.show();
      Validator.clearValidation();
      var items = this.getView().byId("tbTabellaSistemaAzioneTipo").getSelectedItems();
      if (items.length === 1) {
          var oModel = new sap.ui.model.json.JSONModel();
          items = items[0].getBindingContext("T_ACT_SYST").getObject();
          items.stato = "M";
          oModel.setData(items);
          this.getView().setModel(oModel, "sSelect");
          this.byId("navCon").to(this.byId("Detail"));
      } else {
          MessageToast.show("Seleziona una riga");
      } sap.ui.core.BusyIndicator.hide();
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbTabellaSistemaAzioneTipo").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_ACT_SYST").getObject();
                items.stato = "C";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
    },
    onCancel: async function () {
      var sel = this.getView().byId("tbTabellaSistemaAzioneTipo").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_ACT_SYST").getObject());
                line = JSON.parse(line);

                var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
    },
    onSave: async function () {
      var ControlValidate = Validator.validateView();
            if (ControlValidate) {
                var line = JSON.stringify(this.getView().getModel("sSelect").getData());               line = JSON.parse(line);
                var msg = await this.ControlIndex(line);
                if (msg !== "") {
                    MessageBox.error(msg);
                } else {
                    if (line.stato === "M") {
                        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                        delete line.stato;
                        delete line.__metadata;
                        await this._updateHana(sURL, line);
                    } else {
                        delete line.stato;
                        delete line.__metadata;
                        await this._saveHana("/T_ACT_SYST", line);
                    }
                    MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
    },
    onCloseFileUpload: function () {
      this.byId("UploadTable").close();
    },
    handleUploadPress: async function () {
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
          var sRaggruppamento = this.SistemaModel(rows[i]);
          sURL = this.componiURLExcel(sRaggruppamento)
          var result = await this._updateHanaNoError(sURL, sRaggruppamento);
          if (result.length === 0) {
            await this._saveHanaNoError("/T_ACT_SYST", sRaggruppamento);
          }
        }
        MessageBox.success("Excel Caricato con successo");
      }
      sap.ui.getCore().byId("UploadTable").close();
      sap.ui.core.BusyIndicator.hide(0);
    },
    onCloseFileUpload: function () {
      // this.onSearch();
      this._oValueHelpDialog.destroy();
    },
    componiURLExcel: function (line) {
      var sURL = `/T_ACT_SYST(Werks='${line.Werks}',Sistema='${line.Sistema}')`;

      // return encodeURIComponent(sURL);
      return sURL;
    },
    SistemaModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
        Txt: (sValue[oResources.getText("Testo")] === undefined) ? undefined : sValue[oResources.getText("Testo")].toString()
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
    initModel: function () {
      var sData = {
        Werks: "",
        Sistema: "",
        Txt: ""
      }
      return sData;
    },
    ControlIndex: function (sData) {

      /*if (sData.Werks === "" || sData.Werks === undefined || sData.Werks === null) {
        return "Inserire Divisione";
      }*/
      if (sData.Sistema === "" || sData.Sistema === undefined || sData.Sistema === null) {
        return "Inserire Sistema";
      }
      if (sData.Txt === "" || sData.Txt === undefined || sData.Txt === null) {
        return "Inserire Testo";
      }
      return "";
    },
  });
});
