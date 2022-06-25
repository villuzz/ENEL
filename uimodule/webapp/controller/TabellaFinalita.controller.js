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
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;
    var ValueState = coreLibrary.ValueState;
    return Controller.extend("PM030.APP1.controller.TabellaFinalita", {
        Validator: Validator,
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("TabellaFinalita").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbTabellaFinalita"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");

        },
        _onObjectMatched: async function () {
          Validator.clearValidation();

          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({});
          this.getView().setModel(oModel, "T_TP_MAN1");

          this.getValueHelp();

        },
        getValueHelp: async function () {
          sap.ui.core.BusyIndicator.show();
          var sData = {};
          var oModelHelp = new sap.ui.model.json.JSONModel();
          oModelHelp.setSizeLimit(2000);

          var T_TP_MAN1 = await this._getTable("/T_TP_MAN1", []);

          sData.Divisione = this.distinctBy(T_TP_MAN1, "Divisione");
          sData.TipoGestione1 = this.distinctBy(T_TP_MAN1, "TipoGestione1");
          sData.DesTipoGest1 = this.distinctBy(T_TP_MAN1, "DesTipoGest1");
          sData.Raggruppamento = this.distinctBy(T_TP_MAN1, "Raggruppamento");

          sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
          sData.T_RAGGR = await this._getTable("/T_RAGGR", []);

          var oModel1 = new sap.ui.model.json.JSONModel();
          oModel1.setData(T_TP_MAN1);
          this.getView().setModel(oModel1, "T_TP_MAN1");

          oModelHelp.setData(sData);
          this.getView().setModel(oModelHelp, "sHelp");
          sap.ui.core.BusyIndicator.hide();
        },

        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
          sap.ui.core.BusyIndicator.show();
          this.getView().byId("tbTabellaFinalita").removeSelections();
          var sFilter = this.getModel("sFilter").getData();
          var aFilters = [],
              tempFilter = [];

          if (sFilter.Divisione !== undefined) {
              if (sFilter.Divisione.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.Divisione, "Divisione");
                  aFilters = aFilters.concat(tempFilter);
              }
          }
          if (sFilter.TipoGestione1 !== undefined) {
              if (sFilter.TipoGestione1.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.TipoGestione1, "TipoGestione1");
                  aFilters = aFilters.concat(tempFilter);
              }
          }
          if (sFilter.DesTipoGest1 !== undefined) {
              if (sFilter.DesTipoGest1.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.DesTipoGest1, "DesTipoGest1");
                  aFilters = aFilters.concat(tempFilter);
              }
          }
          if (sFilter.Raggruppamento !== undefined) {
              if (sFilter.Raggruppamento.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.Raggruppamento, "Raggruppamento");
                  aFilters = aFilters.concat(tempFilter);
              }
          }

          var model = this.getView().getModel("T_TP_MAN1");
          var tableFilters = await this._getTableNoError("/T_TP_MAN1", aFilters);
          if (tableFilters.length === 0) {
              MessageBox.error("Nessun record trovato");
              model.setData({});
          } else {
              model.setData(tableFilters);
          } sap.ui.core.BusyIndicator.hide();
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
        onBackDetail: function () {
            this.byId("navCon").back();
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
                      await this._saveHana("/T_TP_MAN1", line);
                  }
                  MessageBox.success("Dati salvati con successo");
                  this.onSearchFilters();
                  this.byId("navCon").back();
              }
          }
        },
        FinalitaModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                TipoGestione1: (sValue[oResources.getText("TipoGest")] === undefined) ? undefined : sValue[oResources.getText("TipoGest")].toString(),
                Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
                DesTipoGest1: (sValue[oResources.getText("Descrizione")] === undefined) ? undefined : sValue[oResources.getText("Descrizione")].toString(),
                Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
            };
            return rValue;
        },
        onModify: function () {
          sap.ui.core.BusyIndicator.show();
          Validator.clearValidation();
          var items = this.getView().byId("tbTabellaFinalita").getSelectedItems();
          if (items.length === 1) {
              var oModel = new sap.ui.model.json.JSONModel();
              items = items[0].getBindingContext("T_TP_MAN1").getObject();
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
          var items = this.getView().byId("tbTabellaFinalita").getSelectedItems();
          if (items.length === 1) {
              var oModel = new sap.ui.model.json.JSONModel();
              items = items[0].getBindingContext("T_TP_MAN1").getObject();
              items.stato = "C";
              oModel.setData(items);
              this.getView().setModel(oModel, "sSelect");
              this.byId("navCon").to(this.byId("Detail"));
          } else {
              MessageToast.show("Seleziona una riga");
          } sap.ui.core.BusyIndicator.hide();
        },
        onCancel: async function () {
          var sel = this.getView().byId("tbTabellaFinalita").getSelectedItems();
          for (var i =( sel.length - 1); i >= 0; i--) {
              var line = JSON.stringify(sel[i].getBindingContext("T_TP_MAN1").getObject());
              line = JSON.parse(line);

              var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
              await this._removeHana(sURL);
          }
          this.onSearchFilters();
        },
        componiCancelURL: function (line) {
            var sURL = "/T_TP_MAN1(" + "TipoGestione1=" + "'" + line.TipoGestione1 + "'," + "Divisione=" + "'" + line.Divisione + "'" + ")";
            return sURL;
        },
        onDataExport: function () {
            var selectedTab = this.byId("tbTabellaFinalita");
            var selIndex = this.getView().byId("tbTabellaFinalita").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_TP_MAN1").getObject()
                    aArray.push(oContext);
                }
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "TabellaFinalita.xlsx",
                    worker: false
                }
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "TabellaFinalita.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbTabellaFinalita").getColumns().map((c) => {
                var templ = "";
                var typ = EdmType.String;
                // var prop = c.mAggregations.header.getText();
                var prop = c.getCustomData()[0].getValue();
                return {
                    label: c.getHeader().getText(),
                    property: prop,
                    type: typ,
                    format: (value) => {},
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
        onCloseFileUpload: function () { // this.onSearch();
            this._oValueHelpDialog.destroy();

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
                    var sFinalitaEx = this.FinalitaExcelModel(rows[i]);
                    sURL = this.componiCancelURL(sFinalitaEx)
                    var result = await this._updateHanaNoError(sURL, sFinalitaEx);
                    if (result.length === 0) {
                        await this._saveHanaNoError("/T_ATTPM", sFinalitaEx);
                    }
                }
                MessageBox.success("Excel Caricato con successo");

            }

            sap.ui.getCore().byId("UploadTable").close();
            sap.ui.core.BusyIndicator.hide(0);
        },
        FinalitaExcelModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                TipoGestione1: (sValue[oResources.getText("Finalita")] === undefined) ? undefined : sValue[oResources.getText("Finalita")].toString(),
                Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
                DesTipoGest1: (sValue[oResources.getText("DescrizioneFinalita")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneFinalita")].toString(),
                Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
            };
            return rValue;
        },
        handleChangeCb: function (oEvent) {
            var oValidatedComboBox = oEvent.getSource(),
                sSelectedKey = oValidatedComboBox.getSelectedKey(),
                sValue = oValidatedComboBox.getValue();

            if (! sSelectedKey && sValue) {
                oValidatedComboBox.setValueState(ValueState.Error);
            } else {
                oValidatedComboBox.setValueState(ValueState.None);
            }
        },
        initModel: function () {
            var sData = {
                TipoGestione1: "",
                Divisione: "",
                DesTipoGest1: "",
                Raggruppamento: ""
            }
            return sData;
        },
        ControlIndex: function (sData) {

            if (sData.TipoGestione1 === "" || sData.TipoGestione1 === undefined || sData.TipoGestione1 === null) {
                return "Inserire Finalità";
            }
            /*if (sData.Divisione === "" || sData.Divisione === undefined || sData.Divisione === null) {
                return "Inserire Divisione";
            }*/
            return "";
        }
    });
});
