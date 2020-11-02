export default function createCanvasClicker(canvas, mouseActions) {
  const startXY = { x: 0, y: 0 };
  const endXY = { x: 0, y: 0 };
  const distanceXY = { x: 0, y: 0 };
  let isDown = false;
  let isDragged = false;
  let isWaiting = false;
  let clickCount = 0;
  const rect = canvas.getBoundingClientRect();
  let { onClick, onDrag, onPressed, onRelease, onDoubleClick } = mouseActions;
  if (!onClick) {
    onClick = (ar) => console.log(`Method 'onClick' is not defined.`);
  }
  if (!onDrag) {
    onDrag = (ar) => console.log(`Method 'onDrag' is not defined.`);
  }
  if (!onPressed) {
    onPressed = (ar) => console.log(`Method 'onPressed' is not defined.`);
  }
  if (!onRelease) {
    onRelease = (ar) => console.log(`Method 'onRelease' is not defined.`);
  }
  if (!onDoubleClick) {
    onDoubleClick = (ar) =>
      console.log(`Method 'onDoubleClick' is not defined.`);
  }

  const mouseEvent = (e) => {
    if (e.type === 'mousedown') {
      startXY.x = e.pageX - rect.left;
      startXY.y = e.pageY - rect.top;
      isDown = true;
    }
    if (e.type === 'mousemove') {
      const currentXY = { x: e.pageX - rect.left, y: e.pageY - rect.top };
      if (
        currentXY.x <= 1 ||
        currentXY.x >= canvas.width - 15 ||
        currentXY.y >= canvas.height - 15 ||
        currentXY.y <= 1
      ) {
        isDragged = false;
        isDown = false;
        onRelease();
      } else {
        if (
          (isDown && currentXY.x !== startXY.x) ||
          (isDown && currentXY.y !== startXY.y)
        ) {
          distanceXY.x = currentXY.x - startXY.x;
          distanceXY.y = currentXY.y - startXY.y;
          if (Math.abs(distanceXY.x) > 1 || Math.abs(distanceXY.y) > 1) {
            isDragged = true;
            onDrag(distanceXY);
          } else if (!isDown) {
            onClick(currentXY);
          }
        }
      }
    }
    if (e.type === 'mouseup') {
      endXY.x = e.pageX - rect.left;
      endXY.y = e.pageY - rect.top;
      if (isDragged) {
        isDragged = false;
        onRelease();
      } else {
        clickCount += 1;
        function debouncer() {
          clickCount = 0;
          if (isWaiting) {
            isWaiting = false;
            onClick(endXY);
          }
        }
        if (clickCount === 1) {
          setTimeout(debouncer, 250);
          isWaiting = true;
        }
        if (clickCount === 2) {
          clickCount = 0;
          isWaiting = false;
          onDoubleClick(endXY);
        }
      }
      isDown = false;
    }
  };
  return Object.freeze({
    mouseEvent,
  });
}
