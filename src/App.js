import { useState } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import elevatorBlack from './resources/elevatorBlack.png';

function App() {


  const [numOfFloors, setNumOfFloors] = useState(10);
  const [numOfElevators, setNumOfElevators] = useState(5);
  const [showCanvas, setShowCanvas] = useState(false);
  const size = 800;

  // button start style
  const buttonCall = {
    color: "white",
    backgroundColor: "#4CAF50",
    padding: `${size/(numOfFloors*10)}px 32px`,    
    border: "none",
    marginBottom: `${(size/numOfFloors)}px`,
    marginLeft: "30px",
    transitionDuration: "0.4s"
  };

  //initial elevators array
  const elevators = Array.from({ length: numOfElevators }, (_, i) => {
    return { src: elevatorBlack, row: i, height:size,floor :numOfFloors-1,move:false}
  });

  //initial buttons array
  const buttons = Array.from({ length: numOfFloors }, (_, i) => {
    return { text: "Call", floor: numOfFloors-i-1, style:buttonCall }
  });

    //initial floors string array
  const floors = Array.from({ length: numOfFloors }, (_, i) => {
    if (i === numOfFloors - 1) {
      return "Ground Floor";
    }
    if (i === numOfFloors - 2) {
        return "2nd";
    }
    if (i === numOfFloors - 3) {
          return "3rd";
    } else {
      return `${numOfFloors - i}th`;
    }
  });

  const handleNumOfFloorsChange = (event) => {
    const newNumOfFloors = parseInt(event.target.value);
    if (newNumOfFloors >= 1) {
      setNumOfFloors(newNumOfFloors);
    }
  }

  const handleNumOfElevatorsChange = (event) => {
    const newNumOfElevators = parseInt(event.target.value);
    if (newNumOfElevators >= 1) {
      setNumOfElevators(newNumOfElevators);
    }
  }

  const handleStartClick = () => {
    setShowCanvas(true);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h4>Elevator Exercise</h4>
        
        {!showCanvas && (
        <><div>
            <label htmlFor="numOfFloors" style={{ color: 'black' }}>Number of floors:</label>
            <input type="number" id="numOfFloors" name="numOfFloors" value={numOfFloors} onChange={handleNumOfFloorsChange} />
          </div><div>
              <label htmlFor="numOfElevators" style={{ color: 'black' }}>Number of elevators:</label>
              <input type="number" id="numOfElevators" name="numOfElevators" value={numOfElevators} onChange={handleNumOfElevatorsChange} />
            </div><button onClick={handleStartClick}>Start</button></>
        )}
      {showCanvas && (
        <Canvas
          numOfFloors={numOfFloors}
          numOfElevators={numOfElevators}
          size={size}
          elevators={elevators}
          floors={floors}
          buttons={buttons}
        />
      )}
      </header>
    </div>
  );
}

export default App;