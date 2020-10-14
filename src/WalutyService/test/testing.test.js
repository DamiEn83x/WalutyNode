describe("Tetst Waluty Node", () => {
  var lWalutyService = undefined;
  var EnableMockFetch = undefined;
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
  beforeAll(() => {
    const WalutyService = require("../waluty.service.js");
    lWalutyService = new WalutyService();
    EnableMockFetch = require("../fetchmodulewraper.js").EnableMockFetch;
  });
  afterEach(() => {
    const DisableMockFetch = require("../fetchmodulewraper.js")
      .DisableMockFetch;
    DisableMockFetch();
  });

  it("Test GettabelaWalutAB", (done) => {
    var realFetch = require("isomorphic-fetch");
    const MockedFetchFuncion = jest
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(
            new Response(
              JSON.stringify([
                {
                  table: "A",
                  no: "198/A/NBP/2020",
                  effectiveDate: "2020-10-09",
                  rates: [
                    { currency: "bat (Tajlandia)", code: "THB", mid: 0.1221 },
                    { currency: "dolar amerykański", code: "USD", mid: 3.7913 }
                  ]
                }
              ])
            )
          );
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(
            new Response(
              JSON.stringify([
                {
                  table: "B",
                  no: "198/B/NBP/2020",
                  effectiveDate: "2020-10-09",
                  rates: [
                    { currency: "dinar kuwejcki", code: "KWD", mid: 12.4361 },
                    { currency: "dinar libijski", code: "LYD", mid: 2.7843 },
                    { currency: "dinar serbski", code: "RSD", mid: 0.0381 }
                  ]
                }
              ])
            )
          );
        })
      );
    EnableMockFetch(MockedFetchFuncion);
    const CallbackFunction = (output) => {
      expect(output).toEqual([
        {
          effectiveDate: "2020-10-09",
          no: "198/A/NBP/2020",
          rates: [
            { code: "THB", currency: "bat (Tajlandia)", mid: 0.1221 },
            { code: "USD", currency: "dolar amerykański", mid: 3.7913 }
          ],
          table: "A"
        },
        {
          effectiveDate: "2020-10-09",
          no: "198/B/NBP/2020",
          rates: [
            { code: "KWD", currency: "dinar kuwejcki", mid: 12.4361 },
            { code: "LYD", currency: "dinar libijski", mid: 2.7843 },
            { code: "RSD", currency: "dinar serbski", mid: 0.0381 }
          ],
          table: "B"
        }
      ]);
      done();
    };
    lWalutyService.GettabelaWalutAB(CallbackFunction);
  });

  test("test GetCurrencyRate  table A", async () => {
    const mocketfetch1 = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: []
    };
    const mocketfetrates1 = {};
    let lDay = new Date("2019-02-01");
    let tDayTo = new Date("2019-12-31");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetrates1[DayString] = { Date: DayString, rate: Math.random() * 4 };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetch1.rates = Object.keys(mocketfetrates1).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetrates1[key].rate
      };
    });
    const mocketfetch2 = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: []
    };
    const mocketfetrates2 = {};
    lDay = new Date("2020-01-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetrates2[DayString] = { Date: DayString, rate: Math.random() * 4 };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());

    mocketfetch2.rates = Object.keys(mocketfetrates2).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetrates2[key].rate
      };
    });

    const MockedFetchFuncion = jest
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetch1)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetch2)));
        })
      );
    EnableMockFetch(MockedFetchFuncion);
    const expectedoutput = Object.values({
      ...mocketfetrates1,
      ...mocketfetrates2
    }).sort((a, b) => {
      if (a.Date > b.Date) return 1;
      else return -1;
    });
    const output = await lWalutyService.GetCurrencyRate(
      "2019-02-01",
      "2020-08-02",
      "USD",
      "A"
    );
    expect(output).toEqual(expectedoutput);
  });

  test("GetCurrencyPowerChanges for PLN", (done) => {
    const expectedValue = [];
    let lDay = new Date("2019-02-01");
    let tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      expectedValue.push({
        CenaIlosciBazowej: 2,
        Wskaznik: 1,
        date: DayString
      });
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());

    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      expectedValue.push({
        CenaIlosciBazowej: 3,
        Wskaznik: 0.6666666666666666,
        date: DayString
      });
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());

    const CallbackFunction = (output) => {
      expect(output).toEqual(expectedValue);
      done();
    };

    const mocketfetchUSD2019 = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: []
    };
    const mocketfetchUSD2020 = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: []
    };
    const mocketfetchEUR2019 = {
      table: "A",
      currency: "Euro",
      code: "EUR",
      rates: []
    };
    const mocketfetchEUR2020 = {
      table: "A",
      currency: "Euro",
      code: "EUR",
      rates: []
    };

    const mocketfetratesUSD2019 = {};
    lDay = new Date("2019-02-01");
    tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesUSD2019[DayString] = {
        Date: DayString,
        rate: 3
      };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchUSD2019.rates = Object.keys(mocketfetratesUSD2019).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesUSD2019[key].rate
      };
    });

    const mocketfetratesUSD2020 = {};
    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesUSD2020[DayString] = {
        Date: DayString,
        rate: 4
      };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchUSD2020.rates = Object.keys(mocketfetratesUSD2020).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesUSD2020[key].rate
      };
    });

    const mocketfetratesEUR2019 = {};
    lDay = new Date("2019-02-01");
    tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesEUR2019[DayString] = {
        Date: DayString,
        rate: 3
      };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchEUR2019.rates = Object.keys(mocketfetratesEUR2019).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesEUR2019[key].rate
      };
    });

    const mocketfetratesEUR2020 = {};
    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesEUR2020[DayString] = {
        Date: DayString,
        rate: 5
      };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchEUR2020.rates = Object.keys(mocketfetratesEUR2020).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesEUR2020[key].rate
      };
    });

    const MockedFetchFuncion = jest
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchUSD2019)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchUSD2020)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchEUR2019)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchEUR2020)));
        })
      );
    EnableMockFetch(MockedFetchFuncion);
    lWalutyService.GetCurrencyPowerChanges(
      (data) => {
        if (data.datatype == "dataoutput") {
          CallbackFunction(data.data);
        }
      },
      "2019-02-01",
      "2020-08-02",
      "PLN",
      "A",
      ["USD", "EUR"],
      232345
    );
  });

  test("GetCurrencyPowerChanges for USD", (done) => {
    const expectedValue = [];
    let lDay = new Date("2019-02-01");
    let tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      expectedValue.push({
        CenaIlosciBazowej: 2,
        Wskaznik: 1,
        date: DayString
      });
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());

    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      expectedValue.push({
        CenaIlosciBazowej: 2,
        Wskaznik: 1,
        date: DayString
      });
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());

    const CallbackFunction = (output) => {
      expect(output).toEqual(expectedValue);
      done();
    };

    const mocketfetchUSD2019 = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: []
    };
    const mocketfetchUSD2020 = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: []
    };
    const mocketfetchEUR2019 = {
      table: "A",
      currency: "Euro",
      code: "EUR",
      rates: []
    };
    const mocketfetchEUR2020 = {
      table: "A",
      currency: "Euro",
      code: "EUR",
      rates: []
    };

    const mocketfetratesUSD2019 = {};
    lDay = new Date("2019-02-01");
    tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesUSD2019[DayString] = {
        Date: DayString,
        rate: 3
      };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchUSD2019.rates = Object.keys(mocketfetratesUSD2019).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesUSD2019[key].rate
      };
    });

    const mocketfetratesUSD2020 = {};
    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesUSD2020[DayString] = {
        Date: DayString,
        rate: 4
      };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchUSD2020.rates = Object.keys(mocketfetratesUSD2020).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesUSD2020[key].rate
      };
    });

    const mocketfetratesEUR2019 = {};
    lDay = new Date("2019-02-01");
    tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesEUR2019[DayString] = {
        Date: DayString,
        rate: 3
      };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchEUR2019.rates = Object.keys(mocketfetratesEUR2019).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesEUR2019[key].rate
      };
    });

    const mocketfetratesEUR2020 = {};
    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesEUR2020[DayString] = {
        Date: DayString,
        rate: 5
      };
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchEUR2020.rates = Object.keys(mocketfetratesEUR2020).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesEUR2020[key].rate
      };
    });

    const MockedFetchFuncion = jest
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchUSD2019)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchUSD2020)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchEUR2019)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchEUR2020)));
        })
      );
    EnableMockFetch(MockedFetchFuncion);
    lWalutyService.GetCurrencyPowerChanges(
      (data) => {
        if (data.datatype == "dataoutput") {
          CallbackFunction(data.data);
        }
      },
      "2019-02-01",
      "2020-08-02",
      "USD",
      "A",
      ["PLN", "EUR"],
      232345
    );
  });

  test("GetCurrencyPowerChanges for TZS", (done) => {
    const expectedValue = [];
    let lDay = new Date("2019-02-01");
    let tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      expectedValue.push({
        CenaIlosciBazowej: 3,
        Wskaznik: 1,
        date: DayString
      });
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());

    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      expectedValue.push({
        CenaIlosciBazowej: 2.4,
        Wskaznik: 1.25,
        date: DayString
      });
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());

    const CallbackFunction = (output) => {
      expect(output).toEqual(expectedValue);
      done();
    };

    const mocketfetchTZS2019 = {
      table: "A",
      currency: "szyling tanzański",
      code: "TZS",
      rates: []
    };
    const mocketfetchTZS2020 = {
      table: "A",
      currency: "szyling tanzański",
      code: "TZS",
      rates: []
    };

    const mocketfetchUSD2019 = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: []
    };
    const mocketfetchUSD2020 = {
      table: "A",
      currency: "dolar amerykański",
      code: "USD",
      rates: []
    };
    const mocketfetchEUR2019 = {
      table: "A",
      currency: "Euro",
      code: "EUR",
      rates: []
    };
    const mocketfetchEUR2020 = {
      table: "A",
      currency: "Euro",
      code: "EUR",
      rates: []
    };

    const mocketfetratesTZS2019 = {};
    lDay = new Date("2019-02-08");
    tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesTZS2019[DayString] = {
        Date: DayString,
        rate: 3
      };
      lDay.setTime(lDay.getTime() + 7 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchTZS2019.rates = Object.keys(mocketfetratesTZS2019).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesTZS2019[key].rate
      };
    });

    const mocketfetratesTZS2020 = {};
    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesTZS2020[DayString] = {
        Date: DayString,
        rate: 5
      };
      lDay.setTime(lDay.getTime() + 7 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchTZS2020.rates = Object.keys(mocketfetratesTZS2020).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesTZS2020[key].rate
      };
    });

    const mocketfetratesUSD2019 = {};
    lDay = new Date("2019-02-01");
    tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesUSD2019[DayString] = {
        Date: DayString,
        rate: 3
      };
      if (lDay.getDay() == 5)
        lDay.setTime(lDay.getTime() + 3 * (1000 * 60 * 60 * 24));
      else lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchUSD2019.rates = Object.keys(mocketfetratesUSD2019).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesUSD2019[key].rate
      };
    });

    const mocketfetratesUSD2020 = {};
    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesUSD2020[DayString] = {
        Date: DayString,
        rate: 4
      };
      if (lDay.getDay() == 5)
        lDay.setTime(lDay.getTime() + 3 * (1000 * 60 * 60 * 24));
      else lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchUSD2020.rates = Object.keys(mocketfetratesUSD2020).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesUSD2020[key].rate
      };
    });

    const mocketfetratesEUR2019 = {};
    lDay = new Date("2019-02-01");
    tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesEUR2019[DayString] = {
        Date: DayString,
        rate: 3
      };
      if (lDay.getDay() == 5)
        lDay.setTime(lDay.getTime() + 3 * (1000 * 60 * 60 * 24));
      else lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchEUR2019.rates = Object.keys(mocketfetratesEUR2019).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesEUR2019[key].rate
      };
    });

    const mocketfetratesEUR2020 = {};
    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesEUR2020[DayString] = {
        Date: DayString,
        rate: 5
      };
      if (lDay.getDay() == 5)
        lDay.setTime(lDay.getTime() + 3 * (1000 * 60 * 60 * 24));
      else lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchEUR2020.rates = Object.keys(mocketfetratesEUR2020).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesEUR2020[key].rate
      };
    });

    const MockedFetchFuncion = jest
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchTZS2019)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchTZS2020)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchUSD2019)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchUSD2020)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchEUR2019)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchEUR2020)));
        })
      );
    EnableMockFetch(MockedFetchFuncion);
    lWalutyService.GetCurrencyPowerChanges(
      (data) => {
        if (data.datatype == "dataoutput") {
          CallbackFunction(data.data);
        }
      },
      "2019-02-01",
      "2020-08-02",
      "TZS",
      "B",
      ["USD", "PLN", "EUR"],
      232345
    );
  });

  test("GetCurrencyPowerChanges for TZS onlu by PLN", (done) => {
    const expectedValue = [];
    let lDay = new Date("2019-02-01");
    let tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      expectedValue.push({
        CenaIlosciBazowej: 1,
        Wskaznik: 1,
        date: DayString
      });
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());

    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      expectedValue.push({
        CenaIlosciBazowej: 0.5,
        Wskaznik: 2,
        date: DayString
      });
      lDay.setTime(lDay.getTime() + 1 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());

    const CallbackFunction = (output) => {
      expect(output).toEqual(expectedValue);
      done();
    };

    const mocketfetchTZS2019 = {
      table: "A",
      currency: "szyling tanzański",
      code: "TZS",
      rates: []
    };
    const mocketfetchTZS2020 = {
      table: "A",
      currency: "szyling tanzański",
      code: "TZS",
      rates: []
    };

    const mocketfetratesTZS2019 = {};
    lDay = new Date("2019-02-08");
    tDayTo = new Date("2020-01-31");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesTZS2019[DayString] = {
        Date: DayString,
        rate: 3
      };
      lDay.setTime(lDay.getTime() + 7 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchTZS2019.rates = Object.keys(mocketfetratesTZS2019).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesTZS2019[key].rate
      };
    });

    const mocketfetratesTZS2020 = {};
    lDay = new Date("2020-02-01");
    tDayTo = new Date("2020-08-02");
    do {
      const DayString = yyyymmdd(lDay);
      mocketfetratesTZS2020[DayString] = {
        Date: DayString,
        rate: 6
      };
      lDay.setTime(lDay.getTime() + 7 * (1000 * 60 * 60 * 24));
    } while (lDay.getTime() <= tDayTo.getTime());
    mocketfetchTZS2020.rates = Object.keys(mocketfetratesTZS2020).map((key) => {
      return {
        no: "001/A/NBP/2020",
        effectiveDate: key,
        mid: mocketfetratesTZS2020[key].rate
      };
    });

    const MockedFetchFuncion = jest
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchTZS2019)));
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify(mocketfetchTZS2020)));
        })
      );

    EnableMockFetch(MockedFetchFuncion);
    lWalutyService.GetCurrencyPowerChanges(
      (data) => {
        if (data.datatype == "dataoutput") {
          CallbackFunction(data.data);
        }
      },
      "2019-02-01",
      "2020-08-02",
      "TZS",
      "B",
      ["PLN"],
      232345
    );
  });
});
