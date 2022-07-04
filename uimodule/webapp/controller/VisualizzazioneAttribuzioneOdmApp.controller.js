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
    'sap/m/Token',
    "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, MessageToast, Filter, FilterOperator, manutenzioneTable, Token, Validator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("PM030.APP1.controller.VisualizzazioneAttribuzioneOdmApp", {
        Validator: Validator,
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("VisualizzazioneAttribuzioneOdmApp").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbVisualizzazioneAttribuzioneOdmApp"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");

           // var oinIndex = this.getView().byId("inIndex");
            var oinAzioni = this.getView().byId("IContActEl");
            var fnValidator = function (args) {
                var text = args.text;

                return new Token({key: text, text: text});
            };
           // oinIndex.addValidator(fnValidator);
            oinAzioni.addValidator(fnValidator);

        },
        _onObjectMatched: async function () {
            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_APP_WO");

            this.getValueHelp();
        },

        getValueHelp: async function () {
            sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            var T_APP_WO = await this._getTable("/T_APP_WO", []);
            sData.StatoOdm = this.distinctBy(T_APP_WO, "StatoOdm");

            var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData(T_APP_WO);
            this.getView().setModel(oModel1, "T_APP_WO");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
        },


        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
            sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbVisualizzazioneAttribuzioneOdmApp").removeSelections();
            var sFilter = this.getModel("sFilter").getData();
            var aFilters = [],
                tempFilter = [];

            if (sFilter.Divisione !== undefined) {
                if (sFilter.Divisione.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Divisione, "Divisione");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Appuntam !== undefined && sFilter.Appuntam !== "") {
              aFilters.push(new Filter("Appuntam", FilterOperator.EQ, sFilter.Appuntam));
          }
            if (sFilter.StatoOdm !== undefined) {
                if (sFilter.StatoOdm.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.StatoOdm, "StatoOdm");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.DettConf !== undefined && sFilter.DettConf !== "") {
                aFilters.push(new Filter("DettConf", FilterOperator.StartsWith, sFilter.DettConf));
            }
            if (sFilter.Aufnr !== undefined && sFilter.Aufnr !== "") {
                aFilters.push(new Filter("Aufnr", FilterOperator.EQ, sFilter.Aufnr));
            }

            var aSelIndici = "",
                aSelInd = [];

            /*if (this.getView().byId("inIndex").getTokens().length > 0) {
                aSelIndici = this.getView().byId("inIndex").getTokens();
                aSelInd = [];
                for (var i = 0; i < aSelIndici.length; i++) {
                    aSelInd.push(aSelIndici[i].getProperty("key"));
                }
                tempFilter = this.multiFilterText(aSelInd, "IndexOdm");
                aFilters = aFilters.concat(tempFilter);

            }*/
            if (this.getView().byId("IContActEl").getTokens().length > 0) {
                aSelIndici = this.getView().byId("IContActEl").getTokens();
                aSelInd = [];
                for (var i = 0; i < aSelIndici.length; i++) {
                    aSelInd.push(aSelIndici[i].getProperty("key"));
                }
                tempFilter = this.multiFilterText(aSelInd, "Zcount");
                aFilters = aFilters.concat(tempFilter);

            }


            var model = this.getView().getModel("T_APP_WO");
            var tableFilters = await this._getTableNoError("/T_APP_WO", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },
        onDataExport: function () {
          var selectedTab = this.byId("tbVisualizzazioneAttribuzioneOdmApp");
          var selIndex = this.getView().byId("tbVisualizzazioneAttribuzioneOdmApp").getSelectedItems();

          var aCols,
              oRowBinding,
              oSettings,
              oSheet;

          aCols = this._createColumnConfig(selectedTab);
          oRowBinding = selectedTab.getBinding("items");
          if (selIndex.length >= 1) {
              var aArray = [];
              for (let i = 0; i < selIndex.length; i++) {
                  var oContext = selIndex[i].getBindingContext("T_APP_WO").getObject();
                  aArray.push(oContext);
              }
              oSettings = {
                  workbook: {
                      columns: aCols
                  },
                  dataSource: aArray,
                  fileName: "VisualizzazioneAttribuzioneOdmApp.xlsx",
                  worker: false
              };
          } else {
              var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
              oSettings = {
                  workbook: {
                      columns: aCols
                  },
                  dataSource: aFilters,
                  fileName: "VisualizzazioneAttribuzioneOdmApp.xlsx",
                  worker: false
              };
          } oSheet = new Spreadsheet(oSettings);
          oSheet.build(). finally(function () {
              oSheet.destroy();
          });
      },
        _createColumnConfig: function () {
            var oCols = this.byId("tbVisualizzazioneAttribuzioneOdmApp").getColumns().map((c) => {
                var templ = "";
                var typ = EdmType.String;
                // var prop = c.mAggregations.header.getText();
                var prop = c.getCustomData()[0].getValue();

                if (prop === "DataPianificazione") {
                    typ = EdmType.Date;
                }
                if (prop === "FineCardine") {
                    typ = EdmType.Date;
                }
                if (prop === "ScadNaturale") {
                    typ = EdmType.Date;
                }

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
          this.byId("UploadTable").open();
        },
        onCloseFileUpload: function () { // this.onSearch();
          this.byId("UploadTable").close();
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
        onSave: async function () {
            var ControlValidate = Validator.validateView();
            if (ControlValidate) {
                var line = JSON.stringify(this.getView().getModel("sSelect").getData());
                line = JSON.parse(line);
                var msg = await this.ControlIndex(line);
                if (msg !== "") {
                    MessageBox.error(msg);
                } else {
                    line.Appuntam = Number(line.Appuntam);
                    if (line.DataFineCard === "" || line.DataFineCard === undefined || line.DataFineCard === null) {
                        delete line.DataFineCard;
                    }
                    if (line.DataPian === "" || line.DataPian === undefined || line.DataPian === null) {
                        delete line.DataPian;
                    }
                    if (line.DataPianNatur === "" || line.DataPianNatur === undefined || line.DataPianNatur === null) {
                        delete line.DataPianNatur;
                    }
                    if (line.stato === "M") {
                        var sURL = this.componiURL(line);
                        delete line.stato;
                        delete line.__metadata;
                        await this._updateHana(sURL, line);
                    } else {

                        var aFilter = [];
                        aFilter.push(new Filter("Cont", FilterOperator.EQ, line.Cont)); // fisso IT - todo
                        var result = await this._getLine("/T_ACT_EL", aFilter);
                        line.IndexOdm = result.IndexPmo;

                        delete line.stato;
                        delete line.__metadata;
                        await this._saveHana("/T_APP_WO", line);
                    } MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
        },
        VisualizzazioneModel: function (sValue) {

            var oResources = this.getResourceBundle();
            // var a = "2022-01-01T23:01:00.UTC";
            // var a = new Date().toISOString();
            var a = "2016-12-01T23:00:00+00:00";
            var rValue = {
                Zcount: (sValue[oResources.getText("Zcount")] === undefined) ? "" : sValue[oResources.getText("Zcount")].toString(),
                IndexOdm: (sValue[oResources.getText("IndexOdm")] === undefined) ? "" : sValue[oResources.getText("IndexOdm")].toString(),
                Appuntam: (sValue[oResources.getText("Appuntam")] === undefined) ? "" : sValue[oResources.getText("Appuntam")].toString(),
                Aufnr: (sValue[oResources.getText("Aufnr")] === undefined) ? "" : sValue[oResources.getText("Aufnr")].toString(),
                Aufpl: (sValue[oResources.getText("Aufpl")] === undefined) ? "" : sValue[oResources.getText("Aufpl")].toString(),
                Aplzl: (sValue[oResources.getText("Aplzl")] === undefined) ? "" : sValue[oResources.getText("Aplzl")].toString(),
                Aplzl1: (sValue[oResources.getText("Aplzl1")] === undefined) ? "" : sValue[oResources.getText("Aplzl1")].toString(),
                Aplzl2: (sValue[oResources.getText("Aplzl2")] === undefined) ? "" : sValue[oResources.getText("Aplzl2")].toString(),
                Aplzl3: (sValue[oResources.getText("Aplzl3")] === undefined) ? "" : sValue[oResources.getText("Aplzl3")].toString(),
                Aplzl4: (sValue[oResources.getText("Aplzl4")] === undefined) ? "" : sValue[oResources.getText("Aplzl4")].toString(),
                Aplzl5: (sValue[oResources.getText("Aplzl5")] === undefined) ? "" : sValue[oResources.getText("Aplzl5")].toString(),
                Qmnum: (sValue[oResources.getText("Qmnum")] === undefined) ? "" : sValue[oResources.getText("Qmnum")].toString(),
                NumIntervento: (sValue[oResources.getText("NumIntervento")] === undefined) ? "" : sValue[oResources.getText("NumIntervento")].toString(),
                StatoOdm: (sValue[oResources.getText("StatoOdm")] === undefined) ? "" : sValue[oResources.getText("StatoOdm")].toString(),
                DettConf: (sValue[oResources.getText("DettConf")] === undefined) ? "" : sValue[oResources.getText("DettConf")].toString(),
                DataPian: (sValue[oResources.getText("DataPian")] === undefined) ? "" : a,
                DataFineCard: (sValue[oResources.getText("DataFineCard")] === undefined) ? "" : a,
                DataPianNatur: (sValue[oResources.getText("DataPianNatur")] === undefined) ? "" : a,
                Aggregatore: (sValue[oResources.getText("Aggregatore")] === undefined) ? "" : sValue[oResources.getText("Aggregatore")].toString(),
                DescAggregatore: (sValue[oResources.getText("DescAggregatore")] === undefined) ? "" : sValue[oResources.getText("DescAggregatore")].toString()
            };
            return rValue
        },
        componiURL: function (line) {
            var sURL = `/T_APP_WO(Appuntam=${
                line.Appuntam
            },Zcount='${
                line.Zcount
            }',IndexOdm='${
                line.IndexOdm
            }',Aufnr='${
                line.Aufnr
            }',Aufpl='${
                line.Aufpl
            }',Aplzl='${
                line.Aplzl
            }',Aplzl1='${
                line.Aplzl1
            }',Aplzl2='${
                line.Aplzl2
            }',Aplzl3='${
                line.Aplzl3
            }',Aplzl4='${
                line.Aplzl4
            }',Aplzl5='${
                line.Aplzl5
            }',Qmnum='${
                line.Qmnum
            }')`;
            return sURL;
        },
        onBackDetail: function () {
            this.byId("navCon").back();
        },
        onModify: function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbVisualizzazioneAttribuzioneOdmApp").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_APP_WO").getObject();
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
            var items = this.getView().byId("tbVisualizzazioneAttribuzioneOdmApp").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_APP_WO").getObject();
                items.stato = "C";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onCancel: async function () {
            var sel = this.getView().byId("tbVisualizzazioneAttribuzioneOdmApp").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_APP_WO").getObject());
                line = JSON.parse(line);

                var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
        },
        initModel: function () {
            var sData = {
                Zcount: "",
                IndexOdm: "",
                Appuntam: "",
                Aufnr: "",
                Aufpl: "",
                Aplzl: "",
                Aplzl1: "",
                Aplzl2: "",
                Aplzl3: "",
                Aplzl4: "",
                Aplzl5: "",
                Qmnum: "",
                NumIntervento: "",
                StatoOdm: "",
                DettConf: "",
                DataPian: new Date(),
                DataFineCard: new Date(),
                DataPianNatur: new Date(),
                Aggregatore: "",
                DescAggregatore: ""
            };
            return sData;
        },
        ControlIndex: function (sData) {

            //if (sData.IndexOdm === "" || sData.IndexOdm === undefined || sData.IndexOdm === null) {
           //     return "Inserire Indice";
           // }
            if (sData.Zcount === "" || sData.Zcount === undefined || sData.Zcount === null) {
                return "Inserire Contatore";
            }
            return "";
        }
    });
});
