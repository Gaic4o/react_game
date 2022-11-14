import { useKeyboardControls } from "@react-three/drei";
import { addEffect } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import useGame from "../hooks/useGame";

export default function Interface() {
  // 타이머.
  // 다시 시작 버튼.
  // WASD 키와 space 바를 보여주는 키보드 인터페이스.
  const time = useRef<any>();
  const restart = useGame((state: any) => state.restart);
  const phase = useGame((state: any) => state.phase);

  const forward = useKeyboardControls((state) => state.forward);
  const backward = useKeyboardControls((state) => state.backward);
  const leftward = useKeyboardControls((state) => state.leftward);
  const rightward = useKeyboardControls((state) => state.rightward);
  const jump = useKeyboardControls((state) => state.jump);

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state: any = useGame.getState();

      let elapsedTime = 0;

      if (state.phase === "playing") {
        elapsedTime = Date.now() - state.startTime;
      } else if (state.phase === "ended") {
        elapsedTime = state.endTime - state.startTime;
      }

      if (time.current) {
        time.current.textContent = elapsedTime;
      }

      console.log(state);
    });

    return () => {
      unsubscribeEffect();
    };
  }, []);

  return (
    <div className="interface">
      {/* Time */}
      <div ref={time} className="time">
        0.00
      </div>

      {/* Restart */}
      {phase === "ended" && (
        <div className="restart" onClick={restart}>
          Restart
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <div className="raw">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '25px'  }} className={`key ${forward ? "active" : ""}`}>↑</div>
        </div>
        <div className="raw">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '25px'  }} className={`key ${leftward ? "active" : ""}`}>←</div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '25px'  }} className={`key ${backward ? "active" : ""}`}>↓</div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '25px'  }} className={`key ${rightward ? "active" : ""}`}>→</div>
        </div>
        <div className="raw">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'  }} className={`key large ${jump ? "active" : ""}`}>Space bar</div>
        </div>
      </div>
    </div>
  );
}
