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
    const WalutyService = require("./WalutyService/waluty.service.js");
    lWalutyService = new WalutyService();
    EnableMockFetch = require("./WalutyService/fetchmodulewraper.js")
      .EnableMockFetch;
  });
  afterEach(() => {
    const DisableMockFetch = require("./WalutyService/fetchmodulewraper.js")
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
    const expectedoutput = { ...mocketfetrates1, ...mocketfetrates2 };
    const output = await lWalutyService.GetCurrencyRate(
      "2019-02-01",
      "2020-08-02",
      "USD",
      "A"
    );
    expect(output).toEqual(expectedoutput);
  });
});
