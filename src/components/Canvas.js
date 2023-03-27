import React, { useRef, useEffect,useState } from 'react';
import elevatorBlack from '../resources/elevatorBlack.png'
import elevatorRed from '../resources/elevatorRed.png'
import elevatorGreen from '../resources/elevatorGreen.png'
import CallButton from './callButton';
import Elevator from "./Elevator";
import audio from '../resources/ping.mp3'
import ReactDOM from 'react-dom';


var sound = new Audio(audio);



function Canvas(props) {
  

  //initial variables and states
  const [buttons, setButtons] = useState(props.buttons);
  const [elevatorsImages, setElevators] = useState(props.elevators);
  const [waitingFloors, setWaitingFloors] = useState([]);
  const { size, numOfFloors, numOfElevators, elevators } = props;
  const canvasRef = useRef(null);
  const imgHeight=size*0.625/numOfFloors;
  const imgWidth=size*0.625/numOfElevators;
  const elevatorSpeed=50/numOfFloors;


  //buttons styles
  const buttonCall = {
    color: "white",
    backgroundColor: "#4CAF50",
    padding: `${size/(numOfFloors*10)}px 32px`,    
    border: "none",
    marginBottom: `${(size/numOfFloors)}px`,
    marginLeft: "30px",
    transitionDuration: "0.4s"
  };

  const buttonWait = {
    color: "white",
    backgroundColor: "red",
    padding: `${size/(numOfFloors*10)}px 32px`,    
    border: "none",
    marginBottom: `${(size/numOfFloors)}px`,
    marginLeft: "30px",
    transitionDuration: "0.4s"
  };

  const buttonArrived = {
    color: "#4CAF50",
    backgroundColor: "rgb(232,232,232)",
    padding: `${size/(numOfFloors*10)}px 32px`,    
    border: "2px solid #4CAF50",
    marginBottom: `${(size/numOfFloors)}px`,
    marginLeft: "30px",
    transitionDuration: "0.4s"
  };

  //use effect draw canvas in the first time
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = size;
    canvas.height = size;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / numOfElevators;
    const cellHeight = canvas.height / numOfFloors;

    canvasDraw(elevators.map((elevator) => ({
      ...elevator,
      src:
        elevator.height === 0
          ? elevatorRed
          : elevator.height === numOfFloors - 1
          ? elevatorGreen
          : elevatorBlack,
    })),cellWidth,cellHeight,canvas,context);
  }, [size, numOfFloors, numOfElevators, elevators]);


  useEffect(() => {
    setButtons(buttons);
  }, [buttons]);

  useEffect(() => {
    setElevators(elevatorsImages);
  }, [elevatorsImages]);


  //use effect checking the array of waiting floors.
  useEffect(() => {
    var loop=0;
    const intervalId = setInterval(() => {
      loop+=1;
      if(waitingFloors.length!=0){
        const canvas = canvasRef.current;
        const cellHeight = canvas.height / numOfFloors;
        let endY = canvas.height - (waitingFloors[waitingFloors.length-1][0] * cellHeight)-size/cellHeight;
        const idleElevatorIndex = checkNearImage(elevators,endY);
        if (idleElevatorIndex !== -1) {
          const nextFloor = waitingFloors.shift();
          handleButtonClick(nextFloor[0], numOfFloors-nextFloor[0]-1,nextFloor[1]);
        }
      }
      if(loop==2){
        for(var i = 0; i<waitingFloors.length;i++){
          waitingFloors[i][1]+=1;
        }
        loop=0;
      }
      
    }, 800);
    return () => clearInterval(intervalId);
  }, [waitingFloors]);


  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  //function that draw the canvas the timer if needed and the canvas strokes
  function canvasDraw(elevators, cellWidth, cellHeight, canvas, context, seconds, minutes, xTimer, yTimer) {
    storkesDraw(context, canvas, cellWidth, cellHeight);
    timerDraw(context, seconds, minutes, xTimer, yTimer);
  
    elevators.forEach((image, index) => {

      const img = new Image();
      img.src = image.src;
      img.height = imgHeight*(cellHeight/80);
      img.width = imgWidth*(cellWidth/80);
      const x = (((image.row*2)+1)*cellWidth - imgWidth/2)/2 ;
      const y = image.height - imgHeight;
      img.onload = () => {

        ReactDOM.render(<Elevator src={image.src} height={img.height} width={img.width} />, canvas);
        const elevatorImg = canvas.querySelector('img');
        context.drawImage(elevatorImg, x, y,(cellWidth - imgWidth/2)/2,imgHeight);
      };
    });
  };

  //function that draw the time as presented in the design
  const timerDraw = (context,seconds,minutes,xTimer,yTimer) =>{
    context.fillStyle = "black";
    context.font = "16px Arial";
    var text;
    if(minutes>0){
      text=minutes + " min. " + seconds + " sec."
      context.fillText(text, xTimer, yTimer-(size/numOfFloors)/(numOfFloors/2.5));

    }
    else{
      text= seconds +" Sec."
      context.fillText(text, xTimer, yTimer-(size/numOfFloors)/(numOfFloors/2.5));
    }
  }


  //function that draw the strokes as presented in the design
  const storkesDraw = (context,canvas,cellWidth,cellHeight) =>{
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgb(232,232,232)";

    for (let i = 0; i <= numOfElevators; i++) {
      context.beginPath();
      context.moveTo(i * cellWidth, 0);
      context.lineTo(i * cellWidth, canvas.height);
      context.stroke();
    }

    for (let j = 0; j <= numOfFloors; j++) {
      context.beginPath();
      context.moveTo(0, j * cellHeight);
      context.lineTo(canvas.width, j * cellHeight);
      context.stroke();
    }
  }

  //function that check what is the nearest elevator to the floor
  const checkNearImage = (elevators,endY) =>{
    var near=size;
    var imageIndex=-1;
    elevators.forEach((image, index) => {
      let a=Math.abs(endY - image.height)
      if(a < near && image.move==false){
        near=a
        imageIndex=index;
      }

    })

    return imageIndex;

  }


  //function that update the elevators location in interval and call to the canvas draw function
  async function elevatorMoving(elevators,currentY,endY,cellWidth,cellHeight,canvas,context,elevatorSpeed,key,imageIndex,seconds,minutes,x,loop){
    const intervalId = setInterval(async () => {   
    if (Math.abs(currentY-endY) < Math.abs(elevatorSpeed)) { //check if the elevator got to the currect floor
      clearInterval(intervalId);
      setElevators((prevState) => { //change the elevator to green 
        const updatedElevators = [...prevState];
        elevators[imageIndex].src=elevatorGreen;
        return updatedElevators;
      });

      canvasDraw(elevators,cellWidth,cellHeight,canvas,context); 
      sound.load();//make sound
      sound.play();
      setButtons((prevState) => {//change the button to arrived style 
        const updatedButtons = [...prevState];
        updatedButtons[key].text = 'Arrived';
        updatedButtons[key].style = buttonArrived;
        return updatedButtons;
      });
      await timeout(2000); //wait 2 seconds on the floor
      setElevators((prevState) => { //change the elevator to black
        const updatedElevators = [...prevState];
        updatedElevators[imageIndex].src=elevatorBlack;
        updatedElevators[imageIndex].move=false;
        return updatedElevators;
      });

      setButtons((prevState) => {//change the button to call style 
        const updatedButtons = [...prevState];
        updatedButtons[key].text = 'Call';
        updatedButtons[key].style = buttonCall;
        return updatedButtons;
      });
      canvasDraw(elevators,cellWidth,cellHeight,canvas,context);



    }
    else{//elevator moving
      setElevators((prevState) => {//change elevator height
        const updatedElevators = [...prevState];
        updatedElevators[imageIndex].height=currentY;
        return updatedElevators;
      });

      canvasDraw(elevators,cellWidth,cellHeight,canvas,context,seconds,minutes,x,endY);
      currentY += elevatorSpeed;
      loop+=1;
    }
    if(loop==20){
      loop=0;
      seconds+=1;
    }
  }, 50);
  }



  //function that handle the call button click of a floor.
  const handleButtonClick = (floorNumber,key,seconds) => {
    setButtons((prevState) => {//change the button waiting style
      const updatedButtons = [...prevState];
      updatedButtons[key].text = 'Waiting';
      updatedButtons[key].style = buttonWait;
      return updatedButtons;
    });
 
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const cellWidth = canvas.width / numOfElevators;
    const cellHeight = canvas.height / numOfFloors;
    let endY = canvas.height - (floorNumber * cellHeight);
    var imageIndex=checkNearImage(elevators,endY,floorNumber)
    seconds+=seconds;
    let loop=0;
    var minutes=Math.floor(seconds/60);
    seconds%=60;
    if(imageIndex!=-1){
    let x=(((elevators[imageIndex].row*2)+1)*cellWidth - imgWidth)/2

    props.buttons[elevators[imageIndex].floor].style=buttonCall;
    props.buttons[elevators[imageIndex].floor].text="Call";



    setElevators((prevState) => {//elevator start to move, change to red
      const updatedElevators = [...prevState];
      updatedElevators[imageIndex].src = elevatorRed;
      updatedElevators[imageIndex].floor = key;
      updatedElevators[imageIndex].move = true;
      return updatedElevators;
    });

    let startY = elevators[imageIndex].height;
    let currentY = startY;


  if(currentY>endY){
    elevatorMoving(elevators,currentY,endY,cellWidth,cellHeight,canvas,context,elevatorSpeed*-1,key,imageIndex,seconds,minutes,x,loop)

    

}

else{
    elevatorMoving(elevators,currentY,endY,cellWidth,cellHeight,canvas,context,elevatorSpeed,key,imageIndex,seconds,minutes,x,loop)
}

    }
    else{
      setWaitingFloors((prevState) => [...prevState, [floorNumber,0]]);

    }

  };
  


  return (

    <div style={{ display: 'flex' }}> 
      <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px',marginTop:`${size/(numOfFloors*2)}px` }}>
        {props.floors.map((floorNumber) => (
          <div key={floorNumber} style={{ fontSize: '12px', marginBottom: `${(size/numOfFloors)+(size/(5.5*numOfFloors))}px`, color: 'black' }}>
            <b>{floorNumber}</b>
          </div>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ marginBottom: '40px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' ,marginTop:`${size/(numOfFloors*2)}px` }}>
      {buttons.map((button, index) => (
    <CallButton
      style={{...button.style}}
      onClick={() => handleButtonClick(button.floor, index,0)}
      text={button.text}
    />
))}
      </div>
    </div>
  );
}

export default Canvas;