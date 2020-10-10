let DoFakeFetch = false;
let Response = {};
let Succes = true;
let MockedFuncion = undefined;
const FetchWraper = (url, params) => {
  //console.log('Fetching ',url);
  if (!DoFakeFetch) {
    fetch = require("node-fetch");
    return fetch(url, params);
  } else return MockedFuncion(url, params);
};

const EnableMockFetch = (MockedFetchFuncion) => {
  DoFakeFetch = true;
  MockedFuncion = MockedFetchFuncion;
};
const DisableMockFetch = () => {
  DoFakeFetch = false;
};
exports.EnableMockFetch = EnableMockFetch;
exports.DisableMockFetch = DisableMockFetch;
exports.FetchWraper = FetchWraper;
