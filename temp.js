var Arr= [
	[35,1001],
	[41,6000],
	[22,2109],
	[51,2241]
];   //[price,bids]

function sor(a,b){
	//For Arr.sort() - DESC
	if(a[1]>b[1]) return -1;
	if(a[1]<b[1]) return 1;
	return 0;
}	

Arr.sort(sor);
console.log(Arr)