var coinPair="SANDUSDT";
var UTCTime =3 *(3600);
var markersArray=[];
var FuturesChartTempTicker;
var priceLine;
var priceLine2;
var pricePrecision;
const cmcAmountPosition = 1;
const cmcPricePosition = 0;

function calculateAbsoluteVolume(inputArray){
	let volume = inputArray[0][0]*inputArray[0][1];
	for(i=1;i<inputArray.length;i++){
		volume=(volume+(inputArray[i][0]*inputArray[i][1]))/2;
	}
	return volume;
}

const MarkerType= {
	UP : 'arrowUp',
	DOWN : 'arrowDown',
}
 



function addMarkerToArray(time,shape){
	// TODO change below/above positions 
	markersArray.push({
			time: time,
			position: 'aboveBar',
			color: 'black',
			shape: shape,
		//id: coinTime
		});
}

function playSound(url) {
  const audio = new Audio(url);
  audio.muted = false;
  audio.play();
}

function selectCoinButtonPress(){
	coinPair = document.getElementById('futuresList').value
	lineSeries.setData([]);
	futuresPercentage.setData([]);
	markersArray=[];
	document.getElementById('priceText').innerHTML=(coinPair);
}



async function loadAvailableCoinList(){
	let list = await getLink('https://fapi.binance.com/fapi/v1/exchangeInfo');
	let select = document.getElementById('futuresList');
	for(i=0;i<list['symbols'].length;i++){
		//console.log(list['symbols'][i]['symbol'])
		if(list['symbols'][i]['contractType']=="PERPETUAL"){
			let symbol=list['symbols'][i]['pair']
			let opt = document.createElement('option');
			opt.value=symbol;
			opt.innerHTML=symbol;
			select.appendChild(opt);
		}
		}
}

async function getLink(link){
	// Check fo response.status
	let res = await fetch(link);
	return res.json();
	}

function getMaximumAmount(pairValue){
//Finds maximun amount in 2-dimention array [price,amount]

//Positions in the incoming array
	const amount =1;
	const price = 0;

	let maxAmount=0;
	let maxPrice=0;


	for(i=0;i<pairValue.length;i++){
		if((pairValue[i][amount]*1) > maxAmount){
			maxAmount=(pairValue[i][amount]*1);
			maxPrice=pairValue[i][price];
		}
	}
return [maxPrice,maxAmount];
}

function calculatePercentageDifference(oldValue,newValue, percent){
	//Check if difference is more that %percent%
	//TODO make direction pointer
	//let percent = this.percent;
	let difference=Math.abs(oldValue*1-newValue*1);
	
	if (difference>(oldValue*(percent/100)))		
		return true
	else return false
}

function fadeActivity(elementID){
	//Show activity/change of element
	document.getElementById(elementID).setAttribute("style","color:maroon");
	setTimeout(function(){
    document.getElementById(elementID).setAttribute("style","color:black");
}, 680);
}


function sorAbsoluteDesc(a,b){
	//For Arr.sort() - DESC

	if((a[cmcAmountPosition]*1*a[cmcPricePosition])>(b[cmcAmountPosition]*1*b[cmcPricePosition])) return -1;
	if((a[cmcAmountPosition]*1*a[cmcPricePosition])<(b[cmcAmountPosition]*1*b[cmcPricePosition])) return 1;
	return 0;
}	
function sortAmountDesc(a,b){
	//For Arr.sort() - DESC

	if((a[cmcAmountPosition]*1)<b[cmcAmountPosition]) return 1;
	if((a[cmcAmountPosition]*1)>b[cmcAmountPosition]) return -1;
	return 0;
}	
function sortPriceDesc(a,b){
	//For Arr.sort() - DESC

	if((a[cmcPricePosition]*1)>b[cmcPricePosition]) return 1;
	if((a[cmcPricePosition]*1)<b[cmcPricePosition]) return -1;
	return 0;
}	
function sortPriceAsc(a,b){
	//For Arr.sort() - Asc
	//

	if((a[cmcPricePosition]*1)>b[cmcPricePosition]) return -1;
	if((a[cmcPricePosition]*1)<b[cmcPricePosition]) return 1;
	return 0;
}	

function createPriceLines(topAsksArr,topBidsArr){
	//lineSeries.removePriceline(priceLine)

	if(priceLine){
		lineSeries.removePriceLine(priceLine);
		lineSeries.removePriceLine(priceLine2);
	}
	 priceLine = lineSeries.createPriceLine({
		price: topAsksArr[0][0],
		color: 'green',
		lineWidth: 2,
		lineStyle: LightweightCharts.LineStyle.Dotted,
		axisLabelVisible: true,
		title: topAsksArr[0][1],
		}
	);
	 priceLine2 = lineSeries.createPriceLine({
		price: topBidsArr[0][0],
		color: 'red',
		lineWidth: 2,
		lineStyle: LightweightCharts.LineStyle.Dotted,
		axisLabelVisible: true,
		title: topBidsArr[0][1],
		}
	);
}

function bidsMoreThanPercent(scanArrayPair,maxValue){
	//Return an Array with values more that %percent%) of maxValue
	let moreThanArray = [];
	let percent = 20;
	let minimumBidCompare=Math.trunc(maxValue*(percent/100));
	for(i=0;i<scanArrayPair.length;i++){
		if((scanArrayPair[i][1])*1>=minimumBidCompare){
			moreThanArray.push(scanArrayPair[i])
			
		}
		else{
			return moreThanArray;
		}
	}
	return moreThanArray
}
async function goForFutures(coinTicker){
	let response = await getLink('https://fapi.binance.com/fapi/v1/depth?symbol='+coinTicker+'&limit=1000');

	//TODO decide which arrays are excess

	let sortedAsks = (response.asks); //[[price, amount],...[price, amount]]
	sortedAsks.sort(sortAmountDesc);  //[[price, BIGamount],...[price, SMALLamount]]

	let sortedBids = (response.bids);
	sortedBids.sort(sortAmountDesc);


	let maxAsk = (sortedAsks[0]); // BiggestAmount pair [price,amount]
	let maxBid = (sortedBids[0]);


	let absoluteAsk = sortedAsks;
	let absoluteBid = sortedBids;
	absoluteAsk.sort(sorAbsoluteDesc) ;//[BIGGEST[price, amount],...SMALLEST[price, amount]]
	absoluteBid.sort(sorAbsoluteDesc) ;


	let topAsks=(bidsMoreThanPercent(sortedAsks,maxAsk[cmcAmountPosition]))
	topAsks.sort(sortPriceDesc)

	let askBidRatio = (Math.trunc((maxAsk[cmcAmountPosition]*1)/((maxAsk[cmcAmountPosition]*1)+(maxBid[cmcAmountPosition]*1))*100));
	let topBids=(bidsMoreThanPercent(sortedBids,maxBid[cmcAmountPosition]))
	topBids.sort(sortPriceAsc)
	
	
	if(topBids.length!=0){
		createPriceLines(topAsks,topBids)
	}

	let coinPrice = await getLink("https://fapi.binance.com/fapi/v1/ticker/price?symbol="+coinTicker);
	let coinTime = Math.trunc(coinPrice['time']/1000)+UTCTime;

	let oldFuturesMaxBidPrice = (document.getElementById('futuresMaxBidPrice').innerHTML)*1
	
	if(calculatePercentageDifference(oldFuturesMaxBidPrice,(maxBid[cmcPricePosition])*1),10)
		{
			playSound('src/audio/sci-fi-click.wav');
			addMarkerToArray(coinTime,MarkerType.DOWN);
			lineSeries.setMarkers(markersArray);
		}

	if(calculatePercentageDifference((document.getElementById('futuresMaxAskPrice').innerHTML)*1,(maxAsk[cmcPricePosition])*1,10))
		{
			playSound('src/audio/sci-fi-click.wav');
			addMarkerToArray(coinTime,MarkerType.UP);
			lineSeries.setMarkers(markersArray);
		}

	document.getElementById('futuresPrice').innerHTML=(coinPrice['price']);
	document.getElementById('futuresMaxBidPrice').innerHTML=(maxBid[cmcPricePosition]);
	document.getElementById('futuresMaxAskPrice').innerHTML=(maxAsk[cmcPricePosition]);

	document.getElementById('futuresMaxBidAmount').innerHTML=(maxBid[cmcAmountPosition]);
	document.getElementById('futuresMaxAskAmount').innerHTML=(maxAsk[cmcAmountPosition]);

	document.getElementById('futuresMaxBidPercentage').innerHTML=askBidRatio+"%";
	document.getElementById('futuresAbsoluteRatio').innerHTML=Math.trunc(((absoluteAsk[0][cmcPricePosition]*1*absoluteAsk[0][cmcAmountPosition])/((absoluteAsk[0][cmcPricePosition]*1*absoluteAsk[0][cmcAmountPosition])+(absoluteBid[0][cmcPricePosition]*1*absoluteBid[0][cmcAmountPosition])))*100)+"%";

	
	document.getElementById('futuresMaxAskAbsolute').innerHTML=absoluteAsk[0][cmcAmountPosition]+"<br>"+absoluteAsk[0][cmcPricePosition];
	document.getElementById('futuresMaxBidAbsolute').innerHTML=absoluteBid[0][cmcAmountPosition]+"<br>"+absoluteBid[0][cmcPricePosition];

	

	fadeActivity('futuresMaxBidPrice');
	fadeActivity('futuresMaxAskPrice');
	fadeActivity('futuresPrice');


	//to avoid the same timestamp visualisation - cause problems with chart
	if(FuturesChartTempTicker < coinTime)
		{
			addGraph(coinTime,(coinPrice['price'])*1);
			futuresPercentage.update({time:coinTime,value:askBidRatio})
		}
	FuturesChartTempTicker=coinTime;


}

async function goForSpot(coinTicker){


	let response = await getLink('https://api.binance.com/api/v3/depth?symbol='+coinTicker+'&limit=500');


	let spotAbsoluteMaxAsk = response.asks;
	let spotAbsoluteMaxBid = response.bids;
	spotAbsoluteMaxAsk.sort(sorAbsoluteDesc);
	spotAbsoluteMaxBid.sort(sorAbsoluteDesc);

	spotAbsoluteMaxAsk = spotAbsoluteMaxAsk[0];
	spotAbsoluteMaxBid = spotAbsoluteMaxBid[0]

	let maxAsk = getMaximumAmount(response.asks);
	let maxBid = getMaximumAmount(response.bids);



	let coinPrice = await getLink("https://api.binance.com/api/v3/ticker/price?symbol="+coinTicker);
	coinPrice = ((coinPrice['price'])*1);

	document.getElementById('spotPrice').innerHTML=coinPrice.toFixed(4);
	document.getElementById('spotMaxBidPrice').innerHTML=((maxBid[cmcPricePosition])*1).toFixed(4);
	document.getElementById('spotMaxAskPrice').innerHTML=((maxAsk[cmcPricePosition])*1).toFixed(4);

	document.getElementById('spotAbsoluteMaxAsk').innerHTML=(spotAbsoluteMaxAsk[cmcAmountPosition]*1).toFixed(4)+"<br>"+(spotAbsoluteMaxAsk[cmcPricePosition]*1).toFixed(4);
	document.getElementById('spotAbsoluteMaxBid').innerHTML=(spotAbsoluteMaxBid[cmcAmountPosition]*1).toFixed(4)+"<br>"+(spotAbsoluteMaxBid[cmcPricePosition]*1).toFixed(4);



	fadeActivity('spotMaxAskPrice');
	fadeActivity('spotMaxBidPrice');
	fadeActivity('spotPrice');

	if(coinPrice==(maxBid[cmcPricePosition])*1){
		playSound('src/audio/confirmation.wav');
	}


}

function initialize(){
let timerFutures = setInterval(() => goForFutures(coinPair), 2000);
let timerSpot = setInterval(() => goForSpot(coinPair), 2000);


document.getElementById('priceText').innerHTML=(coinPair);	
}

window.addEventListener("DOMContentLoaded", ()=> {
	loadAvailableCoinList();
	initialize()
});









var chart = LightweightCharts.createChart(document.body, {
	width: 600,
  height: 300,
  	leftPriceScale: {
		visible: true,
		borderColor: 'rgba(197, 203, 206, 1)',
		priceRange: {
            minValue: 0,
            maxValue: 100,
        },

	},

	rightPriceScale: {
		visible: true,
		borderColor: 'rgba(197, 203, 206, 1)',
	},
	//mode: LightweightCharts.PriceScaleMode.Normal,

	layout: {
		backgroundColor: '#ffffff',
		textColor: 'rgba(33, 56, 77, 1)',
	},
	grid: {
		vertLines: {
			color: 'rgba(197, 203, 206, 0.7)',
		},
		horzLines: {
			color: 'rgba(197, 203, 206, 0.7)',
		},
	},
	timeScale: {
		timeVisible: true,
    secondsVisible: true,
	},
});



function addGraph(time,price){
	lineSeries.update({time:time,value:price})	
}

var futuresPercentage = chart.addLineSeries({

		priceScaleId: 'left',
		priceFormat: {
			type: 'price',
			precision: 1,
			minMove: 1,
		},
			priceRange: {
            minValue: 0,
            maxValue: 100,
        },
	lineWidth: 1,
	autoScale:false,
	color:"#E23F1C",
})

var lineSeries = chart.addLineSeries({

	priceFormat: {
        type: 'price',
        precision: 4,
        minMove: 0.0001,
    },
	
	//color: '#f48fb1',
    lineStyle: 0,
    lineWidth: 1,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 3,
    crosshairMarkerBorderColor: '#ffffff',
    crosshairMarkerBackgroundColor: '#2296f3',
    lineType: 2,
    lastPriceAnimation: LightweightCharts.LastPriceAnimationMode.OnDataUpdate ,
});





chart.subscribeClick(param => {
    console.log(param.hoveredMarkerId);
});






