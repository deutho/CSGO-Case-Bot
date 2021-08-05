const express = require('express')
const app = express()
const port = 3000
const http = require('http')

const GlobalOffensive = require('globaloffensive');

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const SteamUser = require('steam-user');
const { resolve } = require('path');
var user = new SteamUser();
let csgo = new GlobalOffensive(user);
var allItems = [];
var detectChangesTimeout;
var casePriceAmount = {};
var dontLoadForTheseIDs = [];
// 22808623015
// 22808624409
// 22808626001
var casketIdToFill = 22808626001;
var methodCall = ""

var contextid = 2;
var appid = 730;
var sessionid;

user.logOn({
	"accountName": "deutho",
	"password": "Floke124",
  "rememberPassword": true
});

// var SteamCommunity = require('steamcommunity');
// var SteamID = SteamCommunity.SteamID;

// am as [U:1:120236398]
// s [U:1:120236398]
// var sid = new SteamID('[U:1:46143802]');
// console.log(sid.toString()); // 76561198006409530

// go online in steam
user.on('loggedOn', function(details) {
	console.log("Logged into Steam as " + user.steamID.getSteam3RenderedID());
	user.setPersona(SteamUser.EPersonaState.Online);
  user.gamesPlayed([730]);
});

user.on('error', function(e) {
	// Some error occurred during logon
	console.log(e);
});

user.on('webSession', function(sessionID, cookies) {
	console.log("Got web session");
	// Do something with these cookies if you wish
  sessionid = sessionID;
});


// when connected to GameCoordinator get all storage units and call a function which adds up all cases
csgo.on('connectedToGC', function(e) {
  var AllStorageUnits = [];
  csgo.inventory.forEach((inventoryItem) => {
      if(inventoryItem.casket_contained_item_count != undefined) {
        AllStorageUnits.push(inventoryItem)
        console.log("custom_name: "+ inventoryItem.custom_name + " id: " + inventoryItem.id + "\n")
      }
  })


  // call method with id of casket
  putAllCasesInStorageUnit(casketIdToFill)


  // getAllCases(AllStorageUnits)

});


// StorageUnitId 
function putAllCasesInStorageUnit(StorageUnitId){
  methodCall = "putAllCasesInStorageUnit"
  i = 0
  curr = csgo.inventory[i]
  while(curr.tradable_after == undefined && i < csgo.inventory.length-1) {
    i++;
    curr = csgo.inventory[i]
  }

  
  if(curr != undefined) {
    console.log("adding: " + curr.id)
    csgo.addToCasket(StorageUnitId, curr.id)    
  }
}

csgo.on('itemRemoved', item => {
  if(methodCall == "putAllCasesInStorageUnit") {
    console.log("added case " + item.id + " to container " + casketIdToFill)
    putAllCasesInStorageUnit(casketIdToFill)
  };
})





// adds up all cases from storage unit ids in list provided
function getAllCases(AllStorageUnits) {
  methodCall = "getAllCases"
  if(AllStorageUnits.length == 0) {
    return
  }

  csgo.getCasketContents(AllStorageUnits[AllStorageUnits.length-1].id, (error, items) => {
    if(error) console.log(error);    
    AllStorageUnits.pop()
    return getAllCases(AllStorageUnits)
  })
};

// every time a new item is detected while scanning
csgo.on('itemAcquired', item => {
  if(methodCall == "getAllCases") countingStuff(item);
})
  
function countingStuff(item){
  if(dontLoadForTheseIDs.indexOf(item.id) == -1) {
    allItems.push(item) 
    clearTimeout(detectChangesTimeout);
    

    detectChangesTimeout = setTimeout(() => { 
      console.log(item); 
      console.log("Anzahl aller Items: " + allItems.length)
      dontLoadForTheseIDs.push(item.id); 

      // working but not wanted while developing
      // csgo.removeFromCasket(item.casket_id, item.id)
    }, 5000);
  }
  else{
    console.log("bin im else von item aquired")
    dontLoadForTheseIDs.splice(dontLoadForTheseIDs.indexOf(item.id),1)
  };
}


