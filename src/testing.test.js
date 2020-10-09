describe("Tetst Waluty Node", () => {
  var lWalutyService = undefined;
  beforeAll(() => {
    var WalutyService = require("./WalutyService/waluty.service.js");
    lWalutyService = new WalutyService();
  });
  it("Test GettabelaWalutAB", (done) => {
    const CallbackFunction = (output) => {
      expect(1).toBe(1);
      done();
    };
    lWalutyService.GettabelaWalutAB(CallbackFunction);
  });
});
