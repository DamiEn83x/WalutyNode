const NBPAPI = "https://api.nbp.pl/api/";

const yyyymmdd = (pDate) => {
  // console.log("yyyymmdd", pDate);
  try {
    var mm = pDate.getMonth() + 1; // getMonth() is zero-based
    var dd = pDate.getDate();
    return [
      pDate.getFullYear(),
      (mm > 9 ? "" : "0") + mm,
      (dd > 9 ? "" : "0") + dd
    ].join("-");
  } catch (error) {
    console.log("yyyymmdd", "pDate", pDate, error);
    throw error;
  }
};

class WalutyService {
  async GettabelaWalutA(callback) {
    let data = await this.GettabelaWalut("A");
    callback(data);
  }

  async GettabelaWalut(tabela) {
    let url = NBPAPI + "/exchangerates/tables/" + tabela + "?format=json";

    const fetch = require("./fetchmodulewraper.js").FetchWraper;
    let data = "";
    try {
      const response = await fetch(url);
      data = await response.json();
    } catch (error) {
      console.log(error);
    }
    return data;
  }

  async GettabelaWalutAB(callback) {
    let dataA = await this.GettabelaWalut("A");
    let dataB = await this.GettabelaWalut("B");
    callback([].concat(dataA, dataB));
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async GetCurrencyRate(DayFrom, DayTo, pcurr, pTable) {
    var dateFormat = require("dateformat");
    let pDayTo = new Date(DayTo);
    let lDayFrom = new Date(DayFrom);
    let lDayTo = new Date(DayTo);
    let Coursetable = new Object();
    do {
      var diff = Math.abs(lDayTo.getTime() - lDayFrom.getTime());
      var diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      if (diffDays > 364)
        lDayTo.setTime(lDayFrom.getTime() + 364 * (1000 * 60 * 60 * 24));
      if (lDayTo.getTime() > pDayTo.getTime()) lDayTo.setTime(pDayTo.getTime());
      let url =
        NBPAPI +
        "/exchangerates/rates/" +
        pTable +
        "/" +
        pcurr +
        "/" +
        dateFormat(lDayFrom, "yyyy-mm-dd") +
        "/" +
        dateFormat(lDayTo, "yyyy-mm-dd") +
        "?format=json";

      const fetch = require("./fetchmodulewraper.js").FetchWraper;
      let data = "";
      try {
        const response = await fetch(url);
        data = await response.json();
      } catch (error) {
        console.log(error);
        throw error;
      }

      data["rates"].map((rate) => {
        Coursetable[rate.effectiveDate] = {
          Date: rate.effectiveDate,
          rate: rate.mid
        };
      });

      lDayFrom.setTime(lDayTo.getTime() + 1 * (1000 * 60 * 60 * 24));
      lDayTo.setTime(lDayFrom.getTime() + 364 * (1000 * 60 * 60 * 24));
    } while (lDayFrom.getTime() <= pDayTo.getTime());

    let lDay = new Date(Coursetable[Object.keys(Coursetable)[0]].Date);
    lDayTo = new Date(Coursetable[Object.keys(Coursetable)[Object.keys(Coursetable).length - 1]].Date);
    let LastRate = undefined;

    do {
      const DayString = yyyymmdd(lDay);
      if ((Coursetable[DayString] == undefined) && (LastRate != undefined))
        Coursetable[DayString] = { Date: DayString, rate: LastRate.rate };
      LastRate = Coursetable[DayString];
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= lDayTo.getTime());

    return Object.values(Coursetable).sort((a, b) => {
      if (a.Date > b.Date) return 1;
      else return -1;
    });
  }
  async GetCurrencyPowerChangesAsync(
    callback,
    DayFrom,
    DayTo,
    pcurr,
    pTable,
    tabelaWalut,
    reqXKEY
  ) {
    try {
      let pDayTo = new Date(DayTo);
      let pDayFrom = new Date(DayFrom);
      if (pDayTo.getTime() > new Date().getTime()) pDayTo = new Date();
      var dateFormat = require("dateformat");
      let tabelaZbiorcza = new Object();
      let bError = false;
      let ProcProgres = 0;
      let iteracja = 0;
      let Currencies = [];
      const CurrenciesObj = {};
      if (pcurr != "PLN") {
        Currencies = await this.GetCurrencyRate( yyyymmdd(pDaFrom), yyyymmdd(pDayTo), pcurr, pTable);
        pDayFrom = new Date(Currencies[0].Date);
        pDayTo = new Date(Currencies[Currencies.length-1].Date);
      }
      Currencies.forEach((value) => {
        CurrenciesObj[value.Date] = value;
      });
      for (const waluta of tabelaWalut) {
        if (waluta == pcurr) {
          continue;
        }
        iteracja++;
        let lDayTo = new Date(yyyymmdd(pDayTo));
        let lDayFrom = new Date( yyyymmdd(pDaFrom));
        let IloscBazowa = null;
        if (waluta == "PLN") {
          if (pcurr != "PLN") {
            IloscBazowa = Currencies[0].rate;
            Currencies.forEach((value) => {
              if (tabelaZbiorcza[value.Date] == undefined)
                tabelaZbiorcza[value.Date] = {
                  date: value.Date,
                  CenaIlosciBazowej: IloscBazowa / value.rate
                };
              else
                tabelaZbiorcza[value.Date] = {
                  date: value.Date,
                  CenaIlosciBazowej:
                    IloscBazowa / value.rate +
                    tabelaZbiorcza[value.Date].CenaIlosciBazowej
                };
            });
          }
        } else {
          let data = await this.GetCurrencyRate( yyyymmdd(pDaFrom), yyyymmdd(pDayTo), waluta, "A");

          if (IloscBazowa == null) {
            if (pcurr != "PLN") {
              IloscBazowa = Currencies[0].rate / data[0].rate;
            } else IloscBazowa = 1.0 / data[0].rate;
          }
          data.map((value) => {
            let CRate = value.rate;
            if (pcurr != "PLN") {
              CRate = CRate / CurrenciesObj[value.Date].rate;
            }
            if (tabelaZbiorcza[value.Date] == undefined)
              tabelaZbiorcza[value.Date] = {
                date: value.Date,
                CenaIlosciBazowej: IloscBazowa * CRate
              };
            else
              tabelaZbiorcza[value.Date] = {
                date: value.Date,
                CenaIlosciBazowej:
                  IloscBazowa * CRate +
                  tabelaZbiorcza[value.Date].CenaIlosciBazowej
              };
          });
        }

        ProcProgres = (iteracja * 100) / tabelaWalut.length;
        //console.log(ProcProgres);
        callback({
          datatype: "progress",
          reqKEY: reqXKEY,
          data: ProcProgres
        });
      }
      if (bError) {
        alert("The unknown error has occurred");
      }

      for (var key in tabelaZbiorcza) {
        tabelaZbiorcza[key].Wskaznik =
          1 / (tabelaZbiorcza[key].CenaIlosciBazowej / iteracja);
      }

      callback({
        datatype: "dataoutput",
        data: Object.values(tabelaZbiorcza) //tabelaZbiorcza.Object.entries(data).map((data)=>{date:data.date;mid:data.mid})
      });
    } catch (error) {
      callback({
        datatype: "error",
        data: error
      });
    }
  }

  GetCurrencyPowerChanges(
    callback,
    DayFrom,
    DayTo,
    curr,
    table,
    tabelaWalut,
    reqXKEY
  ) {
    this.GetCurrencyPowerChangesAsync(
      (data) => {
        callback(data);
      },
      DayFrom,
      DayTo,
      curr,
      table,
      tabelaWalut,
      reqXKEY
    );
  }
}

module.exports = WalutyService;
