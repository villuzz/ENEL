sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/TablePersoController",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library",
], function (Controller, JSONModel, MessageBox, manutenzioneTable, Spreadsheet, exportLibrary, ) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP5.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.ViewPage", {
    onInit: function () {
      // leggere i modelli che ci servono
      var tabs = [
        {
          Nome: "MATERIALI",
          Descrizione: "Tabella Materiali",
          Tipo: "PMO",
        },
        {
          Nome: "SERVIZI",
          Descrizione: "Tabella Servizi",
          Tipo: "PMO",
        },
        {
          Nome: "STRATEGIA",
          Descrizione: "Tabella Strategia",
          Tipo: "PMO",
        },
        {
          Nome: "SEDE TECNICA TIPO",
          Descrizione: "Tabella Sede Tecnica Tipo",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_TP_PROGRES",
          Descrizione: "Tabella progressivo azioni tipo",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_RAGGR",
          Descrizione: "Tabella raggruppamento",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_DEST",
          Descrizione: "Tabella destinatari e Cdl",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_DEST_USR",
          Descrizione: "Tabella destinatari utenti",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_TIPO_CLAS",
          Descrizione: "Tabella classe azione tipo",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_TIPO_SIST",
          Descrizione: "Tabella sistema azione tipo",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_TIPO",
          Descrizione: "Gestione azione tipo",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_AGGR",
          Descrizione: "Tabella aggregazioni azioni tipo",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_CRE",
          Descrizione: "Tabella tipo di gestione",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_CRE_1",
          Descrizione: "Tabella finalità",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_CRE_2",
          Descrizione: "Tabella gruppo di controllo",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_APP_ODM",
          Descrizione: "Visualizzazione attribuzione Odm/App",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_PMO_ATTPM",
          Descrizione: "Definizione attività di manutenzione",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_CAR_PMO_M",
          Descrizione: "Carica tabella ZPM4R_T_PMO_M",
          Tipo: "PMO",
        },
        {
          Nome: "ZPM4R_CAR_PMO_S",
          Descrizione: "Carica tabella ZPM4R_T_PMO_S",
          Tipo: "PMO",
        }
      ];
      var oManutenzione = new sap.ui.model.json.JSONModel();
      oManutenzione.setData(tabs);
      this.getView().setModel(oManutenzione, "mTabelle");

      this.getOwnerComponent().getRouter().getRoute("ViewPage").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: function () {
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({
        DataEsecuzione: new Date()
      });
      this.getView().setModel(oModel, "FilterModel");
    },

    onPressLine: function (oEvent) {
      switch (oEvent.getSource().getBindingContext("mTabelle").getObject("Nome")) {
        case "ZPM4R_PMO_TP_PROGRES":
          this.navTo("TabellaProgressivoAzioniTipo");
          break;
        case "ZPM4R_PMO_RAGGR":
          this.navTo("TabellaRaggruppamento");
          break;
        case "ZPM4R_PMO_DEST":
          this.navTo("TabellaDestinatariCdl");
          break;
        case "ZPM4R_PMO_DEST_USR":
          this.navTo("TabellaDestinatariUtenti");
          break;
        case "ZPM4R_PMO_TIPO_CLAS":
          this.navTo("TabellaClasseAzioneTipo");
          break;
        case "ZPM4R_PMO_TIPO_SIST":
          this.navTo("TabellaSistemaAzioneTipo");
          break;
        case "ZPM4R_PMO_TIPO":
          this.navTo("GestioneAzioneTipo");
          break;
        case "ZPM4R_PMO_AGGR":
          this.navTo("TabellaAggregazioniAzioniTipo");
          break;
        case "ZPM4R_PMO_CRE":
          this.navTo("TabellaTipoDiGestione");
          break;
        case "ZPM4R_PMO_CRE_1":
          this.navTo("TabellaFinalita");
          break;
        case "ZPM4R_PMO_CRE_2":
          this.navTo("TabellaGruppoDiControllo");
          break;
        case "ZPM4R_PMO_APP_ODM":
          this.navTo("VisualizzazioneAttribuzioneOdmApp");
          break;
        case "ZPM4R_PMO_ATTPM":
          this.navTo("DefinizioneAttivitaDiManutenzione");
          break;
        case "ZPM4R_CAR_PMO_M":
          this.navTo("CaricaTabellaM");
          break;
        case "ZPM4R_CAR_PMO_S":
          this.navTo("CaricaTabellaS");
          break;
        case "MATERIALI":
          this.navTo("Materiali");
          break;
        case "SERVIZI":
          this.navTo("Servizi");
          break;
        case "STRATEGIA":
          this.navTo("Strategia");
          break;
        case "SEDE TECNICA TIPO":
          this.navTo("SedeTecnica");
          break;
        default:
          break;
      }
    },

    onPersoButtonPressed: function () {
      this._oTPC.openDialog();
    },

  });
});
