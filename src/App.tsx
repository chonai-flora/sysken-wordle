import p5 from 'p5';
import React, { useEffect } from 'react';

const App = () => {
  return (<Main />);
}

const width = window.innerWidth;
const height = window.innerHeight;
const device = navigator.userAgent;
const isPhone = (
  (device.indexOf('iPhone') > 0 &&
    device.indexOf('iPad') === -1) ||
  device.indexOf('iPod') > 0 ||
  device.indexOf('Android') > 0
);

const screen = Math.min(
  width, height,
  isPhone ? width * height : 720
);
const block = screen / 7;
const marginSide = (width - screen) / 2;
const marginTop = (height - 7 * block) / 2;
const halfHeight = screen / 2 + marginTop;
const keys = [
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
  'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'
];

let answer: string;
let enWords: string[];
let keyboard: any[];
let keyColors: string[];
let responceColors: string[];

let score: number;
let gameEnds: boolean;
let isFlipping: boolean;
let flipAngle: number;
let wordCount: number;
let wordIndex: number;
let wordCards: string[][];
let wordColors: string[][];
let alertMod: number;
let alertDelta: number;

const sketch = (p: p5): void => {
  const setKeyboard = (): void => {
    keyboard = [];
    const size = screen / 12;
    for (let i = 0; i < 3; i++) {
      const diff = p.int(i === 0);
      for (let j = 0; j < diff + 9; j++) {
        const key = keys[j % 10 + i * 10 - p.int(i === 2)];
        const button = p.createButton(key);
        let x = (j + 1.5) * size - diff * size / 2 + 4 + marginSide;
        let y = (i - 2) * size + screen + marginTop;
        let side = size - 8;
        if (key === 'ENTER') {
          x -= size / 2;
          side += size / 2;
        } else if (key === '⌫') {
          side += size / 2;
        }

        button.position(x, y);
        button.size(side, size - 8);
        button.style('color', '#FFFFFF');
        button.style('font-weight', 'bold');
        button.mousePressed(() => keyboardPressed(key));
        keyboard.push(button);
      }
    }
  }

  const keyboardPressed = (key: string): void => {
    if (isFlipping || gameEnds) return;
    if (key === '⌫') {
      if (wordIndex > 0) {
        wordIndex--;
        wordCards[wordCount][wordIndex] = '';
      }
    } else if (key === 'ENTER') {
      const word = wordCards[wordCount].join('');
      if (wordIndex >= 5) {
        if (word === answer ||
          enWords.includes(word.toLowerCase())) {
          isFlipping = true;
          score = 0;
          wordIndex = 0;
          checkAnswer();
        }
        else {
          alertMod = p.frameCount % 60;
          alertDelta = 8;
        }
      }
    } else if (wordIndex < 5) {
      wordCards[wordCount][wordIndex] = key;
      wordIndex++;
    }
  }

  const setKeyColors = (): void => {
    for (let i = 0; i < keyboard.length; i++) {
      keyboard[i].style(
        'background-color', keyColors[i]);
    }

    if (wordCount > 5 || score > 4) {
      showResult();
    }
  }

  const setAnswer = (): void => {
    while (!answer.split('').every(
      (e) => keys.includes(e) && e !== '⌫') ||
      !answer.length || answer.length !== 5) {
      answer = ((window as any).prompt(
        "答えとなる5文字の英単語を入力してください\n" +
        "未入力の場合はランダムに設定されます", '') ||
        p.shuffle(enWords)[0])
        .toUpperCase();
    }
  }

  const checkAnswer = (): void => {
    responceColors = [];
    const mismatches = answer.split('');
    for (let i = 0; i < 5; i++) {
      const c = wordCards[wordCount][i];
      const index = keys.indexOf(c);
      if (c === answer[i]) {
        score++;
        mismatches[i] = ' ';
        keyColors[index] =
          responceColors[i] = '#538D4E';
      } else {
        responceColors[i] = '#3A3A3C';
        if (keyColors[index] !== '#538D4E') {
          keyColors[index] = '#3A3A3C';
        }
      }
    }

    for (let i = 0; i < 5; i++) {
      const c = wordCards[wordCount][i];
      const index = keys.indexOf(c);
      if (mismatches.includes(c)) {
        mismatches[mismatches.indexOf(c)] = ' ';
        responceColors[i] = '#B59F3B';
        if (keyColors[index] !== '#538D4E') {
          keyColors[index] = '#B59F3B';
        }
      }
    }
  }

  const setCardColor = (): void => {
    wordColors[wordCount][wordIndex] = responceColors[wordIndex];
  }

  const setGame = (): void => {
    score = 0;
    gameEnds = isFlipping = false;
    flipAngle = wordCount = wordIndex = 0;
    alertMod = alertDelta = 60;
    wordCards = Array(6).fill('').map(
      () => Array(5).fill(''));
    wordColors = Array(6).fill('#000000').map(
      () => Array(5).fill('#000000'));
    answer = "";
    keyColors = Array(keyboard.length).fill('#818384');
    setKeyColors();
    p.textStyle(p.BOLD);
  }

  const showResult = (): void => {
    gameEnds = true;
    const initButton = p.createButton("PLAY AGAIN");
    initButton.size(block, block / 3);
    initButton.style('font-size', `${block / 8}px`);
    initButton.position((width - block) / 2, halfHeight - block / 1.5);
    initButton.mousePressed(() => {
      setGame();
      initButton.remove();
    });

    p.noStroke();
    p.fill('#FFFFFF');
    p.rect(screen / 2, halfHeight - block, screen / 2, screen / 4);
    p.fill('#000000');
    p.textSize(block / 3);
    p.textStyle(p.NORMAL);
    p.text(
      score > 4 ? "Congrats! 🎉" : "Oops!",
      screen / 2, halfHeight - block * 1.5
    );
    p.textSize(block / 6);
    p.text("The word was　　　　", screen / 2, halfHeight - block);
    p.textStyle(p.BOLD);
    p.text(answer, (screen +
      p.textWidth("The word was")) / 2, halfHeight - block);
  }

  p.preload = (): void => {
    enWords = p.loadStrings(
      "https://gist.githubusercontent.com/" +
      "cfreshman/a03ef2cba789d8cf00c08f767e0fad7b/" +
      "raw/28804271b5a226628d36ee831b0e36adef9cf449/" +
      "wordle-answers-alphabetical.txt"
    );
  }

  p.setup = (): void => {
    p.createCanvas(screen, screen + marginTop).parent('main');
    p.strokeWeight(block / 40);
    p.rectMode(p.CENTER);
    p.textAlign(p.CENTER, p.CENTER);

    setKeyboard();
    setGame();
  }

  p.draw = (): void => {
    if (gameEnds) return;
    if (!answer.length) setAnswer();

    (p as any).clear();
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 6; j++) {
        p.push();
        p.translate((i + 1.5) * block, j * block + marginTop);
        if (wordIndex === i && wordCount === j) {
          const ratio = p.abs(p.cos(p.PI / 180 * flipAngle));
          p.scale(1, ratio);
        }
        if (alertMod !== 60 && wordCount === j) {
          const theta = p.PI / 6 * (p.frameCount % 60 - alertMod);
          p.translate(p.max(alertDelta, 0) * p.sin(theta), 0);
        }
        p.fill(wordColors[j][i]);
        p.stroke('#3A3A3C');
        p.square(0, 0, block - 10, block / 10);
        p.fill('#FFFFFF');
        p.noStroke();
        p.textSize(block / 2);
        p.text(wordCards[j][i], 0, 0);
        p.pop();
      }
    }

    if (isFlipping) {
      flipAngle += 10;
      if (flipAngle === 90) {
        setCardColor();
      } else if (flipAngle === 180) {
        wordIndex++;
        flipAngle = 0;
      }
      if (wordIndex > 4) {
        flipAngle = 0;
        isFlipping = false;
        wordCount++;
        wordIndex = 0;
        setKeyColors();
      }
    }

    if (alertMod !== 60) {
      alertDelta -= 0.2;

      p.noStroke();
      p.fill('#FFFFFF');
      p.rect(screen / 2, halfHeight - block,
        screen / 3, screen / 8);
      p.fill('#000000');
      p.textSize(block / 5);
      p.text("Not in word list",
        screen / 2, halfHeight - block);

      if (p.frameCount % 60 === alertMod) {
        alertMod = 60;
      }
    }
  }

  p.keyPressed = (): void => {
    const c = p.key.toUpperCase().replace('BACKSPACE', '⌫');
    if (keys.includes(c)) {
      keyboardPressed(c);
    }
  }
}

const Main: React.FC = () => {
  useEffect(() => { new p5(sketch) }, []);
  return (<div style={{ textAlign: 'center' }} id='main' />);
}

export default App;