


const NBPAPI = 'https://api.nbp.pl/api/';
class WalutyService {

  
  async GettabelaWalutA(callback)
  {   

    let data =await  this.GettabelaWalut('A')
    callback(data);
  }; 
    
   
  async  GettabelaWalut(tabela)
  {   
    
    
    
    //console.log('GettabelaWalutA');
    var  NBPAPI= 'https://api.nbp.pl/api/';
      const http      = require('http'),
            https     = require('https');

        let client = http;
        let url =NBPAPI+'/exchangerates/tables/'+tabela+'?format=json';
        if (url.toString().indexOf("https") === 0) {
            client = https;
        }

        const fetch = require("./fetchmodulewraper.js");
        let data = '';
        try {
            const response = await fetch(url);
            data = await response.json();
            //console.log(json);
           // return json;
        } catch (error) {
            console.log(error);
        }  
        return data;

         
  }

  async GettabelaWalutAB(callback)
  {  
    let dataA = await this.GettabelaWalut('A');
    let dataB = await this.GettabelaWalut('B');  
    callback( [].concat(dataA, dataB));
  }

 sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

  async GetCurrencyRate(DayFrom,DayTo,pcurr,pTable)
  {
    var dateFormat = require('dateformat');
    let pDayTo=new Date(DayTo); 
    let lDayTo= new Date(DayTo);
    let lDayFrom= new Date(DayFrom);  
    let Coursetable=new Object();
    do{  
        var diff = Math.abs(lDayTo.getTime() - lDayFrom.getTime());
        var diffDays = Math.ceil(diff / (1000 * 3600 * 24));
        if(diffDays>364) 
            lDayTo.setTime(lDayFrom.getTime()+364*(1000*60*60*24));
        if(lDayTo.getTime()>pDayTo.getTime()) 
            lDayTo.setTime(pDayTo.getTime());
      let url=NBPAPI+'/exchangerates/rates/'+pTable+'/'+pcurr+'/'+dateFormat(lDayFrom,'yyyy-mm-dd')+'/'+dateFormat(lDayTo,'yyyy-mm-dd')+'?format=json';
        console.log(url);
        const http      = require('http'),
        https     = require('https');

        let client = http;
        if (url.toString().indexOf("https") === 0) {
            client = https;
        }
        const fetch =  require("./fetchmodulewraper.js");

        let data = '';
        try {
            const response = await fetch(url);
            data = await response.json();
            //console.log(json);
           // return json;
        } catch (error) {
            console.log(error);
        }
        
        data['rates'].map((rate)=>{
            Coursetable[rate.effectiveDate]={
              Date:rate.effectiveDate,
              rate:rate.mid}               
        })
           // console.log('Test1 '+lDayFrom+' '+lDayTo+' '+pDayTo);
      lDayFrom.setTime(lDayTo.getTime()+1*(1000*60*60*24));
      lDayTo.setTime(lDayFrom.getTime()+364*(1000*60*60*24));
          //console.log('Test2 '+lDayFrom+' '+lDayTo+' '+pDayTo);
             
    }  while ((lDayFrom.getTime()<=pDayTo.getTime()));
    return Coursetable;

  }
  async GetCurrencyPowerChangesAsync(callback,DayFrom,DayTo,pcurr,pTable,tabelaWalut,reqXKEY)
  { 
    let pDayTo=new Date(DayTo); 
  console.log('GetCurrencyPowerChangesAsync'); 
       console.log(DayFrom);
   console.log(DayTo);
      console.log(pcurr);
    console.log(tabelaWalut);
   console.log(callback);
    
      var dateFormat = require('dateformat');
      let tabelaZbiorcza=new Object();
      let bError=false;
      let ProcProgres=0;
      let iteracja = 0;
      let Currencies=null;
      if(pcurr!='PLN')
        Currencies = await this.GetCurrencyRate(DayFrom,DayTo,pcurr,pTable);
      for (const waluta of tabelaWalut) {
        if(waluta==pcurr)
        {
          continue;
        }
        iteracja++;
        let lDayTo= new Date(DayTo);
        let lDayFrom= new Date(DayFrom);
        let IloscBazowa= null;
        if(waluta=='PLN') {
          if(pcurr!='PLN')
          {// console.log(DayFrom);   
           // console.log(lDayFrom);
            // console.log(dateFormat(lDayFrom,'yyyy-mm-dd'));
            IloscBazowa = Currencies[dateFormat(lDayFrom,'yyyy-mm-dd')].rate; 
            for (var key in Currencies){   
              if (tabelaZbiorcza[key]==undefined) 
                  tabelaZbiorcza[key]={
                    date:key,
                    CenaIlosciBazowej:IloscBazowa/Currencies[key].rate
              }
              else 
                    tabelaZbiorcza[key]={
                      date:key,
                      CenaIlosciBazowej:IloscBazowa/Currencies[key].rate+tabelaZbiorcza[key].CenaIlosciBazowej
                    } 
            }
          }
        }
        else
        do{   
          //   console.log(this.datepipe.transform(lDayFrom,'yyyy-MM-dd')+' '+this.datepipe.transform(lDayTo,'yyyy-MM-dd'));
          var diff = Math.abs(lDayTo.getTime() - lDayFrom.getTime());
          var diffDays = Math.ceil(diff / (1000 * 3600 * 24));
          if(diffDays>364) 
            lDayTo.setTime(lDayFrom.getTime()+364*(1000*60*60*24));
          if(lDayTo.getTime()>pDayTo.getTime()) 
            lDayTo.setTime(pDayTo.getTime());

          let url=NBPAPI+'/exchangerates/rates/a/'+waluta+'/'+dateFormat(lDayFrom,'yyyy-mm-dd')+'/'+dateFormat(lDayTo,'yyyy-mm-dd')+'?format=json';

          const http      = require('http'),
          https     = require('https');

          let client = http;
          if (url.toString().indexOf("https") === 0) {
            client = https;
        }
        const fetch =  require("./fetchmodulewraper.js");

        let data = '';
        try {
            const response = await fetch(url);
            data = await response.json();
            //console.log(json);
           // return json;
        } catch (error) {
            console.log(error);
        }



        {
               // console.log('client.get(url, (resp)  end');
               // console.log(data);
        
                if(IloscBazowa==null)
                {// console.log(data['rates'][0].effectiveDate);
                //console.log(Currencies[data['rates'][0].effectiveDate]);
                  if(pcurr!='PLN')
                    IloscBazowa=Currencies[data['rates'][0].effectiveDate].rate/data['rates'][0].mid
                  else
                    IloscBazowa=1.00/data['rates'][0].mid;
                }
                data['rates'].map((rate)=>{
                   let CRate = rate.mid; 
                   if(pcurr!='PLN')
                   {
                     CRate = CRate/Currencies[rate.effectiveDate].rate;
                   }
                  if (tabelaZbiorcza[rate.effectiveDate]==undefined) 
                    tabelaZbiorcza[rate.effectiveDate]={
                      date:rate.effectiveDate,
                      CenaIlosciBazowej:IloscBazowa*CRate
                    }
                  else 
                    tabelaZbiorcza[rate.effectiveDate]={
                      date:rate.effectiveDate,
                      CenaIlosciBazowej:IloscBazowa*CRate+tabelaZbiorcza[rate.effectiveDate].CenaIlosciBazowej
                    }                     
                })
        }
              // console.log('Test1 '+lDayFrom+' '+lDayTo+' '+pDayTo);
          lDayFrom.setTime(lDayTo.getTime()+1*(1000*60*60*24));
          lDayTo.setTime(lDayFrom.getTime()+364*(1000*60*60*24));
          //console.log('Test2 '+lDayFrom+' '+lDayTo+' '+pDayTo);
             //    console.log(tabelaZbiorcza);   
        } while ((lDayFrom.getTime()<=pDayTo.getTime())) ;

        ProcProgres = iteracja*100/tabelaWalut.length;
        //console.log(ProcProgres);
        callback({
                  datatype:'progress',
                  reqKEY:reqXKEY,
                  data:ProcProgres
                });
      }
      if(bError){
        alert('The unknown error has occurred');
          // return;
      }

      for (var key in tabelaZbiorcza){   
        
        tabelaZbiorcza[key].Wskaznik=1/(tabelaZbiorcza[key].CenaIlosciBazowej/ (iteracja));
      }
      //console.log(tabelaZbiorcza);
     //  await new Promise(r => setTimeout(r, 4000));
      callback({ 
                  datatype:'dataoutput',
                  data:Object.values(tabelaZbiorcza)//tabelaZbiorcza.Object.entries(data).map((data)=>{date:data.date;mid:data.mid})
                });
  }


  GetCurrencyPowerChanges(callback,DayFrom,DayTo,curr,table,tabelaWalut,reqXKEY){   

      this.GetCurrencyPowerChangesAsync((data)=>{
        callback(data);
      },DayFrom,DayTo,curr,table,tabelaWalut,reqXKEY);

  } 
}

module.exports = WalutyService;
