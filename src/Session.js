const OperationsSLifeTime = 120;

class SessionInfoManager {
  constructor(app) {}

  SaveSessionData() {
    this.req.session.OperationsInfo = this.OperationsInfo;
    //console.log('after safesession '+JSON.stringify( this.req.session.OperationsInfo ));
    this.req.session.save();
  }
  SetProgress(pOperationKEy, pProgress) {
    if (this.OperationsInfo == undefined) this.OperationsInfo = {};

    this.ClearOldOperationProfress();

    if (this.OperationsInfo[pOperationKEy] == undefined) {
      this.OperationsInfo[pOperationKEy] = {
        Progress: pProgress,
        Date: new Date()
      };
    } else {
      this.OperationsInfo[pOperationKEy].Progress = pProgress;
      this.OperationsInfo[pOperationKEy].Date = new Date();
    }
    //this.SaveSessionData();
    // console.log(this.OperationsInfo);
  }
  GetProgress(pOperationKEy) {
    if (this.OperationsInfo == undefined) this.OperationsInfo = {};
    if (this.OperationsInfo[pOperationKEy] == undefined) return -1;
    else return this.OperationsInfo[pOperationKEy].Progress;
  }
  getAllProgresses() {
    return JSON.stringify(this.OperationsInfo);
  }
  ClearOldOperationProfress() {
    //console.log('ClearOldOperationProfress');

    var currDate = new Date();
    for (var key in this.OperationsInfo) {
      var OldDate = new Date(this.OperationsInfo[key].Date);
      var diff = Math.abs(currDate.getTime() - OldDate.getTime());
      // console.log(key+' diff :'+diff/1000+ ' '+OperationsSLifeTime);
      if (diff / 1000 > OperationsSLifeTime) {
        this.OperationsInfo[key] = undefined;
        delete this.OperationsInfo[key];
      }
    }
  }
}

module.exports = SessionInfoManager;
