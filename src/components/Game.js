import React, {
  useEffect,
  useRef,
  // useState
} from 'react';
import createGame from '../game/game';

export default function App() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const renderer = createGame(context, canvas);
    canvas.addEventListener('mousedown', renderer.click.mouseEvent);
    canvas.addEventListener('mouseup', renderer.click.mouseEvent);
    canvas.addEventListener('mousemove', renderer.click.mouseEvent);
    window.addEventListener('resize', renderer.resize);
    window.addEventListener('touchmove', (e) => e.preventDefault());
    renderer.start();
  }, []);
  return (
    <div className='App'>
      <div style={{ width: '100%', height: '100vh', userSelect: 'none' }}>
        <canvas
          ref={canvasRef}
          style={{
            border: '1px solid #ccc',
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(circle, rgba(0,0,0,0.9) 10%, rgba(0,0,0,1) 95%)',
          }}
        />
        <div
          style={{
            position: 'fixed',
            height: '40px',
            width: '100%',
            background:
              'radial-gradient(circle, rgba(205,200,200,0.8) 0%, rgba(0,0,0,0.8) 100%)',
            bottom: '0',
            padding: '24px',
            boxShadow: '0px -1px 5px 0px rgba(0,0,0,0.75)',
            textAlign: 'center',
          }}
        >
          <button
            style={{
              background: '#fafafa',
              height: '32px',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'Courier',
              fontWeight: 'bold',
              fontSize: '20px',
              boxShadow: '1px 1px 2px 2px rgba(0,0,0,0.15)',
            }}
          >
            END TURN
          </button>
        </div>
      </div>
    </div>
  );
}
