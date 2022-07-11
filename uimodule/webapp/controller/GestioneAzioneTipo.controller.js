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
    "sap/m/MessageToast",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, coreLibrary, Validator, Filter, FilterOperator, MessageToast) {
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
            // sData.PROGRES = await this._getTableNoError("/T_ACT_PROG");
            sData.CLASSE = await this._getTableNoError("/T_ACT_CL");
            sData.TIPO_GESTIONE = await this._getTableNoError("/T_TP_MAN");
            sData.TIPO_GESTIONE_1 = await this._getTableNoError("/T_TP_MAN1");
            sData.TIPO_GESTIONE_2 = await this._getTableNoError("/T_TP_MAN2");
            sData.PROG_AGGR = await this._getTableNoError("/T_AGGREG");
            sData.MEINS = await this.Shpl("H_T006", "SH");

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

            if (sFilter.Divisione !== undefined) {
                if (sFilter.Divisione.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Divisione, "Divisione");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            if (sFilter.InizioVal !== "" && sFilter.InizioVal !== undefined) {
                aFilters.push(new Filter("InizioVal", FilterOperator.GE, sFilter.InizioVal));
            }
            if (sFilter.FineVal !== "" && sFilter.FineVal !== undefined) {
                aFilters.push(new Filter("FineVal", FilterOperator.LE, sFilter.FineVal));
            }


            if (sFilter.Sistema !== undefined) {
                if (sFilter.Sistema.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Sistema, "Sistema");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Progres !== "" && sFilter.Progres !== undefined) {
                aFilters.push(new Filter("Progres", FilterOperator.EQ, sFilter.Progres));
            }
            if (sFilter.Classe !== undefined) {
                if (sFilter.Classe.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Classe, "Classe");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

           

            var aFilterFE = [];
            if (sFilter.FlagAttivo === "" || sFilter.FlagAttivo === undefined) {
                aFilterFE.push(new Filter("FlagAttivo", FilterOperator.EQ, "X"));
            }
            if (sFilter.TipoGestione !== undefined) {
              if (sFilter.TipoGestione.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.TipoGestione, "TipoGestione");
                  aFilterFE = aFilterFE.concat(tempFilter);
              }
          }
          if (sFilter.TipoGestione1 !== undefined) {
              if (sFilter.TipoGestione1.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.TipoGestione1, "TipoGestione1");
                  aFilterFE = aFilterFE.concat(tempFilter);
              }
          }
          if (sFilter.TipoGestione2 !== undefined) {
              if (sFilter.TipoGestione2.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.TipoGestione2, "TipoGestione2");
                  aFilterFE = aFilterFE.concat(tempFilter);
              }
          }

          if (sFilter.ComponentTipo !== "" && sFilter.ComponentTipo !== undefined) {
            aFilterFE.push(new Filter("ComponentTipo", FilterOperator.Contains, sFilter.ComponentTipo));
          }

          if (sFilter.ProgAggr !== undefined) {
              if (sFilter.ProgAggr.length !== 0) {
                  tempFilter = this.multiFilterText(sFilter.ProgAggr, "ProgAggr");
                  aFilterFE = aFilterFE.concat(tempFilter);
              }
          }

            var model = this.getView().getModel("T_ACT_TYPE");
            var tableFilters = await this._getTableNoError("/T_ACT_TYPE", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                for (let i = 0; i < tableFilters.length; i++) {
                    tableFilters[i].Uzeit = this.formatUzeit(tableFilters[i].Uzeit.ms);
                    tableFilters[i].Esteso = (tableFilters[i].DesEstesa === "X") ? true : false;
                }
                model.setData(tableFilters);
                this.byId("tbGestioneAzioneTipo").getBinding("items").filter(aFilterFE);
            } sap.ui.core.BusyIndicator.hide();
        },
        handleTesto: async function (oEvent) {
            this.lineSelected = oEvent.getSource().getBindingContext("T_ACT_TYPE").getObject();

            var DesEstesa = await this.onTestoEsteso(this.lineSelected);
            this.getView().byId("vTextArea").setText(DesEstesa);
            this.byId("popTesto").open();
        },
        onCloseTesto: function () {
            this.byId("popTesto").close();
        },
        onDataExport: async function () {
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
                    oContext.DesEstesa = await this.onTestoEsteso(oContext);
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
                for (let i = 0; i < aFilters.length; i++) {
                    aFilters[i].DesEstesa = await this.onTestoEsteso(aFilters[i]);
                }
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
        handleUploadPress: function () {
            this.handleUploadTipo("/T_ACT_TYPE");
        },

        handleUploadTipo: async function (Table) {
            if (this.byId("fileUploader").getValue() === "") {
                MessageBox.warning("Inserire un File da caricare");
            } else {
                sap.ui.core.BusyIndicator.show();
                var aReturn = [];
                var sURL,
                    result = "";
                var rows = this.getView().getModel("uploadModel").getData();
                for (var i = 0; i < rows.length; i++) {
                    var sAzioni = await this.ControlloExcelModel(rows[i]);

                    result = await this.ControlIndex(sAzioni);
                    if (result === "") {
                        if (sAzioni.DesEstesa !== "" && sAzioni.DesEstesa !== undefined) {
                            await this.creaTestoEsteso(sAzioni);
                        }
                        sAzioni.DesEstesa = (sAzioni.DesEstesa === "") ? "" : "X";

                        var sURL = this.componiURL(sAzioni);
                        await this._removeHanaNoError(sURL);

                        sURL = await this.componiURL(sAzioni);
                        result = await this._saveHanaShowError(Table, sAzioni);
                        if (result !== "") {
                            result = await this._updateHanaShowError(sURL, sAzioni);
                        }
                    }
                    if (result !== "") {
                        aReturn.push({
                            type: "Error",
                            title: "Riga " + (
                                i + 2
                            ) + " Excel andata in errore",
                            description: result
                        });
                    }


                }
                if (aReturn.length === 0) {
                    aReturn.push({
                        type: "Success",
                        title: "Excel Caricato con successo",
                        description: "tutte le " + rows.length + " Righe caricate con successo"
                    });
                }
                this.handleOpenDialogMsg(aReturn);
                this.onSearchFilters();
                this.byId("UploadTable").close();
                sap.ui.core.BusyIndicator.hide(0);
            }
        },
        ControlloExcelModel: async function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                InizioVal: (sValue[oResources.getText("InizioVal")] === undefined) ? "" : sValue[oResources.getText("InizioVal")].toString(),
                FineVal: (sValue[oResources.getText("FineVal")] === undefined) ? "" : sValue[oResources.getText("FineVal")].toString(),
                Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? "" : sValue[oResources.getText("Divisione")].toString(),
                Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? "" : sValue[oResources.getText("Sistema")].toString(),
                Progres: (sValue[oResources.getText("Progres")] === undefined) ? "" : sValue[oResources.getText("Progres")].toString(),
                Classe: (sValue[oResources.getText("Classe")] === undefined) ? "" : sValue[oResources.getText("Classe")].toString(),
                ComponentTipo: (sValue[oResources.getText("ComponentTipo")] === undefined) ? "" : sValue[oResources.getText("ComponentTipo")].toString(),
                DesBreve: (sValue[oResources.getText("DesBreve")] === undefined) ? "" : sValue[oResources.getText("DesBreve")].toString(),
                DesEstesa: (sValue[oResources.getText("DesEstesa")] === undefined) ? "" : sValue[oResources.getText("DesEstesa")].toString(),
                DurataCiclo: (sValue[oResources.getText("DurataCiclo")] === undefined) ? "" : sValue[oResources.getText("DurataCiclo")].toString(),
                Frequenza: (sValue[oResources.getText("Frequenza")] === undefined) ? "" : sValue[oResources.getText("Frequenza")].toString(),
                FlagAttivo: (sValue[oResources.getText("FlagAttivo")] === undefined) ? "" : sValue[oResources.getText("FlagAttivo")].toString(),
                TipoGestione: (sValue[oResources.getText("TipoGestione")] === undefined) ? "" : sValue[oResources.getText("TipoGestione")].toString(),
                TipoGestione1: (sValue[oResources.getText("TipoGestione1")] === undefined) ? "" : sValue[oResources.getText("TipoGestione1")].toString(),
                TipoGestione2: (sValue[oResources.getText("TipoGestione2")] === undefined) ? "" : sValue[oResources.getText("TipoGestione2")].toString(),
                ProgAggr: (sValue[oResources.getText("ProgAggr")] === undefined) ? "" : sValue[oResources.getText("ProgAggr")].toString()
            };

            rValue.InizioVal = new Date();
            rValue.FineVal = new Date("9999-12-31T10:00:00.000Z");
            rValue.Uzeit = this.createUzeit();
            return rValue;
        },
        _createColumnConfig: function () {
            var oCols = this.byId("tbGestioneAzioneTipo").getColumns().map((c) => {
                var templ = "";
                var typ = EdmType.String;
                var prop = c.getCustomData()[0].getValue();

                if (prop === "InizioVal" || prop === "FineVal" || prop === "Datum") {
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
            items.InizioVal = new Date();
            items.FineVal = new Date("9999-12-31T10:00:00.000Z");
            items.Datum = null;
            oModel.setData(items);
            this.getView().setModel(oModel, "sSelect");

            this.byId("navCon").to(this.byId("Detail"));

            sap.ui.core.BusyIndicator.hide();
        },
        onModify: async function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbGestioneAzioneTipo").getSelectedItems();
            if (items.length === 1) {
                var line = JSON.stringify(items[0].getBindingContext("T_ACT_TYPE").getObject());
                this.lineSelected = JSON.parse(line);

                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_ACT_TYPE").getObject();
                items.stato = "M";
                items.DesEstesa = await this.onTestoEsteso(items);
                items.InizioVal = new Date();

                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onCopy: async function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbGestioneAzioneTipo").getSelectedItems();
            if (items.length === 1) {
                var line = JSON.stringify(items[0].getBindingContext("T_ACT_TYPE").getObject());
                this.lineSelected = JSON.parse(line);

                var oModel = new sap.ui.model.json.JSONModel();
                items = items[0].getBindingContext("T_ACT_TYPE").getObject();
                items.stato = "C";
                items.DesEstesa = await this.onTestoEsteso(items);
                items.InizioVal = new Date();
                oModel.setData(items);
                this.getView().setModel(oModel, "sSelect");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onTestoEsteso: async function (line) {
            if (line.DesEstesa === "X") {
                var aFilter = [];
                var vNome = "Z" + this.formatDate(line.InizioVal) + this.formatDate(line.FineVal) + line.Divisione + line.Sistema + line.Progres + line.Classe + line.Uzeit.replaceAll(":", "");
                aFilter.push(new Filter("Tdname", FilterOperator.EQ, vNome));
                aFilter.push(new Filter("Tdid", FilterOperator.EQ, "ST"));
                aFilter.push(new Filter("Tdspras", FilterOperator.EQ, "I"));
                aFilter.push(new Filter("Tdobject", FilterOperator.EQ, "TEXT"));
                var result = await this._getLinenoError("/TestiEstesi", aFilter);
                if (result === undefined) {
                    return "";
                } else {
                    return result.Testo;
                }
            } else {
                return "";
            }
        },
        onSave: async function () {
            var ControlValidate = Validator.validateView();
            if (ControlValidate) {
                var line = JSON.stringify(this.getView().getModel("sSelect").getData());
                line = JSON.parse(line);
                var msg = await this.ControlIndex(line);
                if (line.stato !== "M") {
                    var sFilter = this.componiFilter(line);
                    var result = await this._getLinenoError("/T_ACT_TYPE", sFilter);
                    if (result !== undefined) {
                        msg = "Chiave gia esistente";
                    }
                }

                if (msg !== "") {
                    MessageBox.error(msg);
                } else {
                    if (line.stato === "M") { // rimuovi le righe vecchie
                        var sURL = this.componiURL(line);
                        await this._removeHana(sURL);

                        delete line.stato;
                        delete line.Esteso;
                        delete line.__metadata;
                        line.Uzeit = this.createUzeit();
                        line.Uzeit = this.createUzeit();
                        if (line.DesEstesa !== "" && line.DesEstesa !== undefined) {
                            await this.creaTestoEsteso(line);
                        }
                        line.DesEstesa = (line.DesEstesa === "") ? "" : "X";
                        await this._saveHana("/T_ACT_TYPE", line);

                    } else { // rimuovi le righe vecchie

                        delete line.stato;
                        delete line.Esteso;
                        delete line.__metadata;
                        line.Uzeit = this.createUzeit();
                        if (line.DesEstesa !== "" && line.DesEstesa !== undefined) {
                            await this.creaTestoEsteso(line);
                        }
                        line.DesEstesa = (line.DesEstesa === "") ? "" : "X";
                        line.FlagAttivo = "X";
                        await this._saveHana("/T_ACT_TYPE", line);

                    } MessageBox.success("Dati salvati con successo");
                    this.onSearchFilters();
                    this.byId("navCon").back();
                }
            }
        },
        createUzeit: function () {
            var aDate = new Date();

            var hours = aDate.getHours(),
                minutes = aDate.getMinutes(),
                seconds = aDate.getSeconds();

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return hours + ":" + minutes + ":" + seconds;
        },
        creaTestoEsteso: async function (line) {
            var Tdname = "Z" + this.formatDate(line.InizioVal) + this.formatDate(line.FineVal) + line.Divisione + line.Sistema + line.Progres.padStart(5, "0") + line.Classe + line.Uzeit.replaceAll(":", "");
            var sTestoAzioni = {
                "Tdname": Tdname,
                "Tdid": "ST",
                "Tdspras": "I",
                "Tdobject": "TEXT",
                "Overwrite": "X",
                "Testo": line.DesEstesa
            };
            var result = await this._saveHanaNoError("/TestiEstesi", sTestoAzioni);
            if (result === []) {
                var sUrl = "/TestiEstesi(Testo='" + line.DesEstesa + "')";
                delete sTestoAzioni.Testo;
                await this._updateHanaNoError(sUrl, sTestoAzioni);
            }
        },
        componiURL: function (line) {
            var sURL = "/T_ACT_TYPE(Divisione='" + line.Divisione + "',Progres='" + line.Progres + "',Classe='" + line.Classe + "',Sistema='" + line.Sistema + "')";
            return sURL;
        },
        componiFilter: function (line) {
            var aFilter = [];
            aFilter.push(new Filter("Divisione", FilterOperator.EQ, line.Divisione));
            aFilter.push(new Filter("Progres", FilterOperator.EQ, line.Progres));
            aFilter.push(new Filter("Classe", FilterOperator.EQ, line.Classe));
            aFilter.push(new Filter("Sistema", FilterOperator.EQ, line.Sistema));
            return aFilter;
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
        ControlIndex: async function (sData) {
            if (sData.InizioVal === "" || sData.InizioVal === undefined || sData.InizioVal === null) {
                return "Inserire Inizio Val";
            }
            if (sData.FineVal === "" || sData.FineVal === undefined || sData.FineVal === null) {
                return "Inserire Fine Val";
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
            if (sData.ProgAggr === "" || sData.ProgAggr === undefined || sData.ProgAggr === null) {
                return "Inserire Aggregativo";
            }

            var aFilters = [];
            aFilters.push(new Filter("Sistema", FilterOperator.EQ, sData.Sistema));
            aFilters.push(new Filter("Progres", FilterOperator.EQ, sData.Progres));
            var result = await this._getTableNoError("/T_ACT_PROG", aFilters);
            if (result === []) {
                return "Combinazione Sistema Classe inesistente"
            }
            return "";
        }

    });
});
