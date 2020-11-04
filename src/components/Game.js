import React, {
  useEffect,
  useRef,
  // useState
} from 'react';
import styled from 'styled-components';
import createGame from '../game/game';

export default function App() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const renderer = createGame(context, canvas);
    // window.addEventListener('touchmove', (e) => e.preventDefault());
    canvas.addEventListener('touchstart', renderer.click.mouseEvent);
    canvas.addEventListener('touchend', renderer.click.mouseEvent);
    canvas.addEventListener('touchmove', renderer.click.mouseEvent);
    canvas.addEventListener('mousedown', renderer.click.mouseEvent);
    canvas.addEventListener('mouseup', renderer.click.mouseEvent);
    canvas.addEventListener('mousemove', renderer.click.mouseEvent);

    window.addEventListener('resize', renderer.resize);
    renderer.start();
  }, []);
  return (
    <div className='App'>
      <StyledContainer>
        <canvas ref={canvasRef} />
        <div className='controls'>
          <button className='primary'>END TURN</button>
        </div>
      </StyledContainer>
    </div>
  );
}

const StyledContainer = styled.div`
  width: 100%;
  height: 100vh;
  user-select: none;
  canvas {
    border: 1px solid #ccc;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(0, 0, 0, 0.9) 10%,
      rgba(0, 0, 0, 1) 95%
    );
  }
  .controls {
    display: flex;
    position: fixed;
    height: 96px;
    width: 100%;
    background: radial-gradient(
      circle,
      rgba(205, 200, 200, 0.8) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
    bottom: 0;
    box-shadow: 0px -1px 5px 0px rgba(0, 0, 0, 0.75);
    justify-content: center;
    align-items: center;
  }
  button.primary {
    background: #fafafa;
    height: 32px;
    border: none;
    border-radius: 4px;
    font-family: Courier;
    font-weight: bold;
    font-size: 20px;
    box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.15);
    outline: none;
    &:active {
      box-shadow: none;
    }
    &:hover {
      border: 2px solid #000;
    }
  }
`;
