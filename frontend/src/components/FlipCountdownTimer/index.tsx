import React, { useState, useEffect } from 'react';
import './styles.css';

interface FlipCountdownTimerProps {
  time: number; // tiempo en segundos
  play: boolean;
  size?: number;
}

interface NumElProps {
  type: string;
  num: number;
  value: number;
}

class NumEl extends React.Component<NumElProps, { value: number; prevValue: number }> {
  constructor(props: NumElProps) {
    super(props);
    this.state = {
      prevValue: props.value,
      value: props.value
    };
  }

  static getDerivedStateFromProps(props: NumElProps, state: { value: number; prevValue: number }) {
    if (props.value !== state.value) {
      return {
        prevValue: state.value,
        value: props.value
      };
    }
    return null;
  }

  render() {
    const { type, num } = this.props;
    const { value, prevValue } = this.state;
    const li = [];

    for (let i = 0; i < num; ++i) {
      let className = '';
      if (i === value) {
        className = 'flip-clock-active';
      } else if (i === prevValue && value !== prevValue) {
        className = 'flip-clock-before';
      }

      li.push(
        <li key={i} className={className}>
          <a href="#">
            <div className="up">
              <div className="shadow"></div>
              <div className="inn">{i}</div>
            </div>
            <div className="down">
              <div className="shadow"></div>
              <div className="inn">{i}</div>
            </div>
          </a>
        </li>
      );
    }

    return <ul className={type}>{li}</ul>;
  }
}

const formatNumberToTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return { hrs, mins, secs };
};

const FlipCountdownTimer: React.FC<FlipCountdownTimerProps> = ({ time, play }) => {
  const [currentTime, setCurrentTime] = useState(time);

  useEffect(() => {
    setCurrentTime(time);
  }, [time]);

  useEffect(() => {
    if (!play || currentTime <= 0) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [play, currentTime]);

  const { hrs, mins, secs } = formatNumberToTime(currentTime);

  // Separar dígitos
  const hrsTens = Math.floor(hrs / 10);
  const hrsOnes = hrs % 10;
  const minsTens = Math.floor(mins / 10);
  const minsOnes = mins % 10;
  const secsTens = Math.floor(secs / 10);
  const secsOnes = secs % 10;

  return (
    <div className="flip-clock-wrapper">
      <div>
        <NumEl type="hours-pre" num={10} value={hrsTens} />
        <NumEl type="hours-last" num={10} value={hrsOnes} />
        <div className="semicolon">
          <span></span>
          <span></span>
        </div>
      </div>
      <div>
        <NumEl type="minutes-pre" num={6} value={minsTens} />
        <NumEl type="minutes-last" num={10} value={minsOnes} />
        <div className="semicolon">
          <span></span>
          <span></span>
        </div>
      </div>
      <div>
        <NumEl type="seconds-pre" num={6} value={secsTens} />
        <NumEl type="seconds-last" num={10} value={secsOnes} />
      </div>
    </div>
  );
};

export default FlipCountdownTimer;
