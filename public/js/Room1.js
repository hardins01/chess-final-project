var TimeDisplay = document.getElementById('ClockWhite')

var GameTime = 0 // we can duplicate so there's a time for player 1 and player 2.

var TimeHasStarted = false;

function GameClock(Time) 
{
	const total = Time
	const seconds = Math.floor( (total) % 60 );
	const minutes = Math.floor( (total/60) % 60 );
	const hour = Math.floor((total/3600) % 60 );
	if (Time > 3599) 
	{

		TimeDisplay.innerHTML = hour + ': h ' + minutes + ': '
		return
	}
	else if (Time >= 60) 
	{
		TimeDisplay.innerHTML = minutes + ':  ' + seconds
		return
	}
	else if (Time == 0)
	{
		TimeDisplay.innerHTML = 'Game Clock'
		return
	}
	else if(60 > Time > 0)
	{
		TimeDisplay.innerHTML = seconds + ':'
		return
	}
}

GameClock(GameTime)

var myTimer;

function StartClock() 
{	
	if(TimeHasStarted == true)
	{
		console.log("timer started already")
		return
	}
	var TheGameTime = GameTime
	console.log("timer started")
	TimeHasStarted = true
 	if ((TheGameTime == 0) || TheGameTime < 0) 
 	{
 		console.log("clock has stopped because of zero or negative time")
 		clearInterval(myTimer)
 		GameClock(0)
 		TimeHasStarted = false
 		SetTime(0)
 		return
 	}
 	myTimer = setInterval(TheClock, 1000);

 	function TheClock() 
 	{
 		--TheGameTime;
 	 	
 		if ((TheGameTime == 0) || TheGameTime < 0) 
 		{
 			console.log("clock has stopped because of zero or negative time")
 			clearInterval(myTimer)
 			GameClock(TheGameTime)
 			SetTime(0)
 			return
 		}
 		GameClock(TheGameTime)
 	}
}

function StopClock()
{
	TimeHasStarted = false
	console.log("timer stopped")
	clearInterval(myTimer)
}

function SetTime (SetTime)
{
	if (SetTime < 0) 
	{
		console.log("invalid time")
		return
	}
	GameTime = SetTime
	GameClock(GameTime)
}


function AddMinute (NumberOfMinutes)
{
	GameTime= GameTime + 60*NumberOfMinutes 
	GameClock(GameTime)
}

function AddSecond (NumberOfSeconds)
{
	GameTime = GameTime + NumberOfSeconds
	GameClock(GameTime)
}

