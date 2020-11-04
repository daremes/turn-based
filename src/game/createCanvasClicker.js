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
    e.preventDefault();
    if (e.type === 'mousedown' || e.type === 'touchstart') {
      const pX = e.type === 'touchstart' ? e.changedTouches[0].pageX : e.pageX;
      const pY = e.type === 'touchstart' ? e.changedTouches[0].pageY : e.pageY;

      startXY.x = Math.round(pX - rect.left);
      startXY.y = Math.round(pY - rect.top);
      isDown = true;
    }

    if (e.type === 'mousemove' || e.type === 'touchmove') {
      const pX = e.type === 'touchmove' ? e.changedTouches[0].pageX : e.pageX;
      const pY = e.type === 'touchmove' ? e.changedTouches[0].pageY : e.pageY;
      const currentXY = { x: pX - rect.left, y: pY - rect.top };
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
    if (e.type === 'mouseup' || e.type === 'touchend') {
      const pX = e.type === 'touchend' ? e.changedTouches[0].pageX : e.pageX;
      const pY = e.type === 'touchend' ? e.changedTouches[0].pageY : e.pageY;
      endXY.x = Math.round(pX - rect.left);
      endXY.y = Math.round(pY - rect.top);
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
