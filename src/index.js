var express = require("express");
var app = express();

var WalutyService = require("./WalutyService/waluty.service.js");
var SessionInfoManager = require("./Session.js");
var lWalutyService = new WalutyService();
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.append("Access-Control-Allow-Origin", origin);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "X-Requested-With,content-type");
  res.append("Access-Control-Allow-Credentials", "true");
  next();
});
let lSessionManager = new SessionInfoManager(app);

function ObslozRequest(query, PostData, pcallback) {
  let lWalutyService = new WalutyService();
  if (query == "GettabelaWalutA") {
    lWalutyService.GettabelaWalutA((data) => {
      //lSessionManager.SaveSessionData();
      pcallback(data);
    });
  } else if (query == "GettabelaWalutAB") {
    lWalutyService.GettabelaWalutAB((data) => {
      //lSessionManager.SaveSessionData();
      pcallback(data);
    });
  } else if (query == "GetCurrencyPowerChanges") {
    lSessionManager.SetProgress(PostData.Token, 0);
    console.log("GetCurrencyPowerChanges Token", PostData.Token);
    lWalutyService.GetCurrencyPowerChanges(
      (data) => {
        if (data.datatype == "dataoutput") {
          pcallback(JSON.stringify(data.data));
        } else if (data.datatype == "progress") {
          lSessionManager.SetProgress(data.reqKEY, data.data);
        }
        else
         pcallback(JSON.stringify(data));
      },
      PostData.DayFrom,
      PostData.DayTo,
      PostData.Curr,
      PostData.Table,
      JSON.parse(PostData.tabelaWalut),
      PostData.Token
    );
  } else if (query == "GetDataProgress") {
    let Progress = lSessionManager.GetProgress(PostData.Token);
    // console.log('getProgress',Progress,PostData.Token);

    let data = {
      datatype: "progress",
      data: Progress
    };
    pcallback(JSON.stringify(data));
  }
 else 
  {
     pcallback(JSON.stringify({msg:"Node is working"}));
  }
}
app.get("/", function (req, res) {
  //tCounter=tCounter+1;
  //console.log('tCounter',tCounter);
  let query = req.query.query;
  ObslozRequest(query, null, (data) => {
    //console.log('response',data);
    res.send(data);
  });
});

app.post("/", function (req, res) {
  // tCounter=tCounter+1;
  // console.log('tCounter',tCounter);
  let query = req.body.Query;
  ObslozRequest(query, req.body, (data) => {
    //console.log('response',data);
    res.send(data);
  });
});

app.listen(8080, function () {
  console.log("Example app listening on port 8080!");
});
