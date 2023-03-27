import React from "react";

const CallButton = (props) => {
  const { text, onClick, floor, style } = props;

  return (
    <button style={style} onClick={onClick} floor={floor}>
      {text}
    </button>
  );
};

export default CallButton;
