describe("Tetst Waluty Node", () => {
  var lWalutyService = undefined;
  beforeAll(() => {
    var WalutyService = require("./WalutyService/waluty.service.js");
    lWalutyService = new WalutyService();
  });
  afterAll(() => {
    const DisableMockFetch = require("./WalutyService/fetchmodulewraper.js")
      .EnableMockFetch;
    DisableMockFetch();
  });
  it("Test GettabelaWalutAB", (done) => {
    const EnableMockFetch = require("./WalutyService/fetchmodulewraper.js")
      .EnableMockFetch;
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
});
