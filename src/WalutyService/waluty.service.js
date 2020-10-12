const NBPAPI = "https://api.nbp.pl/api/";
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
    let lDayTo = new Date(DayTo);
    let lDayFrom = new Date(DayFrom);
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
    return Coursetable;
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
    let pDayTo = new Date(DayTo);

    var dateFormat = require("dateformat");
    let tabelaZbiorcza = new Object();
    let bError = false;
    let ProcProgres = 0;
    let iteracja = 0;
    let Currencies = null;
    if (pcurr != "PLN")
      Currencies = await this.GetCurrencyRate(DayFrom, DayTo, pcurr, pTable);
    for (const waluta of tabelaWalut) {
      if (waluta == pcurr) {
        continue;
      }
      iteracja++;
      let lDayTo = new Date(DayTo);
      let lDayFrom = new Date(DayFrom);
      let IloscBazowa = null;
      if (waluta == "PLN") {
        if (pcurr != "PLN") {
          IloscBazowa = Currencies[dateFormat(lDayFrom, "yyyy-mm-dd")].rate;
          for (var key in Currencies) {
            if (tabelaZbiorcza[key] == undefined)
              tabelaZbiorcza[key] = {
                date: key,
                CenaIlosciBazowej: IloscBazowa / Currencies[key].rate
              };
            else
              tabelaZbiorcza[key] = {
                date: key,
                CenaIlosciBazowej:
                  IloscBazowa / Currencies[key].rate +
                  tabelaZbiorcza[key].CenaIlosciBazowej
              };
          }
        }
      } else
        do {
          //   console.log(this.datepipe.transform(lDayFrom,'yyyy-MM-dd')+' '+this.datepipe.transform(lDayTo,'yyyy-MM-dd'));
          var diff = Math.abs(lDayTo.getTime() - lDayFrom.getTime());
          var diffDays = Math.ceil(diff / (1000 * 3600 * 24));
          if (diffDays > 364)
            lDayTo.setTime(lDayFrom.getTime() + 364 * (1000 * 60 * 60 * 24));
          if (lDayTo.getTime() > pDayTo.getTime())
            lDayTo.setTime(pDayTo.getTime());

          let url =
            NBPAPI +
            "/exchangerates/rates/a/" +
            waluta +
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
          }

          if (IloscBazowa == null) {
            // console.log(data['rates'][0].effectiveDate);
            //console.log(Currencies[data['rates'][0].effectiveDate]);
            if (pcurr != "PLN")
              IloscBazowa =
                Currencies[data["rates"][0].effectiveDate].rate /
                data["rates"][0].mid;
            else IloscBazowa = 1.0 / data["rates"][0].mid;
          }
          data["rates"].map((rate) => {
            let CRate = rate.mid;
            if (pcurr != "PLN") {
              CRate = CRate / Currencies[rate.effectiveDate].rate;
            }
            if (tabelaZbiorcza[rate.effectiveDate] == undefined)
              tabelaZbiorcza[rate.effectiveDate] = {
                date: rate.effectiveDate,
                CenaIlosciBazowej: IloscBazowa * CRate
              };
            else
              tabelaZbiorcza[rate.effectiveDate] = {
                date: rate.effectiveDate,
                CenaIlosciBazowej:
                  IloscBazowa * CRate +
                  tabelaZbiorcza[rate.effectiveDate].CenaIlosciBazowej
              };
          });

          // console.log('Test1 '+lDayFrom+' '+lDayTo+' '+pDayTo);
          lDayFrom.setTime(lDayTo.getTime() + 1 * (1000 * 60 * 60 * 24));
          lDayTo.setTime(lDayFrom.getTime() + 364 * (1000 * 60 * 60 * 24));
        } while (lDayFrom.getTime() <= pDayTo.getTime());

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
