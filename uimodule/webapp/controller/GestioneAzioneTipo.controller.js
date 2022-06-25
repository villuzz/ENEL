sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/TablePersoController",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    'sap/ui/core/routing/History',
    "PM030/APP1/util/manutenzioneTable",
    'sap/ui/core/library',
    "PM030/APP1/util/Validator",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, coreLibrary, Validator, Filter, FilterOperator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;
    var ValueState = coreLibrary.ValueState;
    return Controller.extend("PM030.APP1.controller.GestioneAzioneTipo", {
        Validator: Validator,
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("GestioneAzioneTipo").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbGestioneAzioneTipo"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");

        },
        _onObjectMatched: async function () {
            Validator.clearValidation();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "T_ACT_TYPE");

            this.getValueHelp();
        },
        getValueHelp: async function () {
            sap.ui.core.BusyIndicator.show();
            var sData = {};
            var oModelHelp = new sap.ui.model.json.JSONModel();
            oModelHelp.setSizeLimit(2000);

            sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
            sData.SISTEMA = await this._getTableNoError("/T_ACT_SYST");
            sData.PROGRES = await this._getTableNoError("/T_ACT_PROG");
            sData.CLASSE = await this._getTableNoError("/T_ACT_CL");
            sData.TIPO_GESTIONE = await this._getTableNoError("/T_TP_MAN");
            sData.TIPO_GESTIONE_1 = await this._getTableNoError("/T_TP_MAN1");
            sData.TIPO_GESTIONE_2 = await this._getTableNoError("/T_TP_MAN2");
            sData.PROG_AGGR = await this._getTableNoError("/T_AGGREG");

            oModelHelp.setData(sData);
            this.getView().setModel(oModelHelp, "sHelp");
            sap.ui.core.BusyIndicator.hide();
        },
        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
            sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbGestioneAzioneTipo").removeSelections();
            var sFilter = this.getModel("sFilter").getData();
            var aFilters = [],
                tempFilter = [];

            if (sFilter.InizioVal !== "" && sFilter.InizioVal !== undefined) {
                aFilters.push(new Filter("InizioVal", FilterOperator.GE, sFilter.InizioVal));
            }
            if (sFilter.FineVal !== "" && sFilter.FineVal !== undefined) {
                aFilters.push(new Filter("FineVal", FilterOperator.LE, sFilter.FineVal));
            }

            if (sFilter.Divisione !== undefined) {
                if (sFilter.Divisione.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Divisione, "Divisione");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Sistema !== undefined) {
                if (sFilter.Sistema.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Sistema, "Sistema");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Progres !== undefined) {
                if (sFilter.Progres.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Progres, "Progres");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Classe !== undefined) {
                if (sFilter.Classe.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Classe, "Classe");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            if (sFilter.TipoGestione !== undefined) {
                if (sFilter.TipoGestione.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.TipoGestione, "TipoGestione");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.TipoGestione1 !== undefined) {
                if (sFilter.TipoGestione1.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.TipoGestione1, "TipoGestione1");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.TipoGestione2 !== undefined) {
                if (sFilter.TipoGestione2.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.TipoGestione2, "TipoGestione2");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            if (sFilter.FlagAttivo === "0" && sFilter.FlagAttivo !== undefined) {
                aFilters.push(new Filter("FlagAttivo", FilterOperator.EQ, ""));
            }
            if (sFilter.FlagAttivo === "X" && sFilter.FlagAttivo !== undefined) {
                aFilters.push(new Filter("FlagAttivo", FilterOperator.EQ, "X"));
            }

            if (sFilter.ComponentTipo !== "" && sFilter.ComponentTipo !== undefined) {
                aFilters.push(new Filter("ComponentTipo", FilterOperator.EQ, sFilter.ComponentTipo));
            }

            if (sFilter.ProgAggr !== "" && sFilter.ProgAggr !== undefined) {
                aFilters.push(new Filter("ProgAggr", FilterOperator.EQ, sFilter.ProgAggr));
            }

            var model = this.getView().getModel("T_ACT_TYPE");
            var tableFilters = await this._getTableNoError("/T_ACT_TYPE", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },
        onDataExport: function () {
            var selectedTab = this.byId("tbGestioneAzioneTipo");
            var selIndex = this.getView().byId("tbGestioneAzioneTipo").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_ACT_TYPE").getObject();
                    aArray.push(oContext);
                }
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "GestioneAzioneTipo.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "GestioneAzioneTipo.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
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
                if (msg !== "") {
                    sap.ui.core.BusyIndicator.hide(0);
                    MessageBox.error(msg);
                }
                for (let i = 0; i < rows.length; i++) {
                    var sRaggruppamentoMod = this.RaggruppamentoModel(rows[i]);
                    sURL = this.componiURL(sRaggruppamentoMod);
                    var result = await this._updateHanaNoError(sURL, sRaggruppamentoMod);
                    if (result.length === 0) {
                        await this._saveHanaNoError("/T_ACT_TYPE", sRaggruppamentoMod);
                    }
                }
                MessageBox.success("Excel Caricato con successo");
            }

            this.byId("UploadTable").close();
            sap.ui.core.BusyIndicator.hide(0);
        },
        RaggruppamentoModel: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                InizioVal: (sValue[oResources.getText("InizioVal")] === undefined) ? undefined : sValue[oResources.getText("InizioVal")].toString(),
                FineVal: (sValue[oResources.getText("FineVal")] === undefined) ? undefined : sValue[oResources.getText("FineVal")].toString(),
                Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
                Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
                Progres: (sValue[oResources.getText("Progres")] === undefined) ? undefined : sValue[oResources.getText("Progres")].toString(),
                Classe: (sValue[oResources.getText("Classe")] === undefined) ? undefined : sValue[oResources.getText("Classe")].toString(),
                Uzeit: (sValue[oResources.getText("Uzeit")] === undefined) ? undefined : sValue[oResources.getText("Uzeit")].toString(),
                CodAzione: (sValue[oResources.getText("CodAzione")] === undefined) ? undefined : sValue[oResources.getText("CodAzione")].toString(),
                ComponentTipo: (sValue[oResources.getText("ComponentTipo")] === undefined) ? undefined : sValue[oResources.getText("ComponentTipo")].toString(),
                DesBreve: (sValue[oResources.getText("DesBreve")] === undefined) ? undefined : sValue[oResources.getText("DesBreve")].toString(),
                DesEstesa: (sValue[oResources.getText("DesEstesa")] === undefined) ? undefined : sValue[oResources.getText("DesEstesa")].toString(),
                DurataCiclo: (sValue[oResources.getText("DurataCiclo")] === undefined) ? undefined : sValue[oResources.getText("DurataCiclo")].toString(),
                Frequenza: (sValue[oResources.getText("Frequenza")] === undefined) ? undefined : sValue[oResources.getText("Frequenza")].toString(),
                FlagAttivo: (sValue[oResources.getText("FlagAttivo")] === undefined) ? undefined : sValue[oResources.getText("FlagAttivo")].toString(),
                TipoGestione: (sValue[oResources.getText("TipoGestione")] === undefined) ? undefined : sValue[oResources.getText("TipoGestione")].toString(),
                TipoGestione1: (sValue[oResources.getText("TipoGestione1")] === undefined) ? undefined : sValue[oResources.getText("TipoGestione1")].toString(),
                TipoGestione2: (sValue[oResources.getText("TipoGestione2")] === undefined) ? undefined : sValue[oResources.getText("TipoGestione2")].toString(),
                Datum: (sValue[oResources.getText("Datum")] === undefined) ? undefined : sValue[oResources.getText("Datum")].toString(),
                Uname: (sValue[oResources.getText("Uname")] === undefined) ? undefined : sValue[oResources.getText("Uname")].toString(),
                ProgAggr: (sValue[oResources.getText("ProgAggr")] === undefined) ? undefined : sValue[oResources.getText("ProgAggr")].toString(),
                AggrActTitle: (sValue[oResources.getText("AggrActTitle")] === undefined) ? undefined : sValue[oResources.getText("AggrActTitle")].toString(),
                AggrActComponent: (sValue[oResources.getText("AggrActComponent")] === undefined) ? undefined : sValue[oResources.getText("AggrActComponent")].toString(),
                ClassActType: (sValue[oResources.getText("ClassActType")] === undefined) ? undefined : sValue[oResources.getText("ClassActType")].toString()
            };
            return rValue;
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbGestioneAzioneTipo").getColumns().map((c) => {
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
        onCancel: async function () {
            var sel = this.getView().byId("tbGestioneAzioneTipo").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext("T_ACT_TYPE").getObject());
                line = JSON.parse(line);
                var sURL = this.componiURL(line);
                await this._removeHana(sURL);
            }
            this.onSearchFilters();
        },
        onPersoButtonPressed: function () {
            this._oTPC.openDialog();
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
            var items = this.getView().byId("tbGestioneAzioneTipo").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_ACT_TYPE").getObject();
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
            var items = this.getView().byId("tbGestioneAzioneTipo").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_ACT_TYPE").getObject();
                items.stato = "C";
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onSave: async function () {
            var ControlValidate = Validator.validateView();
            if (ControlValidate) {
                var line = this.getView().getModel("sSelect").getData();
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
                        await this._saveHana("/T_ACT_TYPE", line);
                    } MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
        },
        componiURL: function (line) {
            var sURL = "/T_ACT_TYPE(" + "Divisione=" + "'" + line.Divisione + "'," + "Sistema=" + "'" + line.Sistema + "'" + "Progres=" + "'" + line.Progres + "'" + "Classe=" + "'" + line.Classe + "'" + ")";

            return sURL;
        },
        onBackDetail: function () {
            this.byId("navCon").back();
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
                InizioVal: new Date(),
                FineVal: new Date(),
                Divisione: "",
                Sistema: "",
                Progres: "",
                Classe: "",
                Uzeit: "",
                CodAzione: "",
                ComponentTipo: "",
                DesBreve: "",
                DesEstesa: "",
                DurataCiclo: "",
                Frequenza: "",
                FlagAttivo: "",
                TipoGestione: "",
                TipoGestione1: "",
                TipoGestione2: "",
                Datum: "",
                Uname: "",
                ProgAggr: "",
                AggrActTitle: "",
                AggrActComponent: "",
                ClassActType: ""
            };
            return sData;
        },
        ControlIndex: function (sData) {
            if (sData.InizioVal === "" || sData.InizioVal === undefined || sData.InizioVal === null) {
                return "Inserire Inizio Val";
            }
            if (sData.FineVal === "" || sData.FineVal === undefined || sData.FineVal === null) {
                return "Inserire Fine Val";
            }
            if (sData.InizioVal === "" || sData.InizioVal === undefined || sData.InizioVal === null) {
                return "Inserire InizioVal";
            }
            if (sData.Divisione === "" || sData.Divisione === undefined || sData.Divisione === null) {
                return "Inserire Divisione";
            }
            if (sData.Sistema === "" || sData.Sistema === undefined || sData.Sistema === null) {
                return "Inserire Sistema";
            }
            if (sData.Progres === "" || sData.Progres === undefined || sData.Progres === null) {
                return "Inserire Progres";
            }
            if (sData.Classe === "" || sData.Classe === undefined || sData.Classe === null) {
                return "Inserire Classe";
            }
            return "";
        }

    });
});
