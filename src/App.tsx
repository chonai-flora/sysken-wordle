import { useEffect } from 'react';

import P5Instance, { getWindowData } from './types/p5-instance';

// eslint-disable-next-line
const get2dArray = <T, _>(w: number, h: number, value: T) => {
  return Array.from(new Array(h), () => new Array(w).fill(value));
}

const sketch = (p5: P5Instance): void => {
  const windowData = getWindowData();
  const screen = windowData.screenSize;
  const block = screen / 7;
  const marginTop = windowData.marginTop;
  const marginSide = windowData.marginSide;
  const halfHeight = screen / 2 + marginTop;

  const keys = [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'
  ];

  let answer = "";
  let enWords: string[] = [];

  const keyboard: any[] = [];
  const keyColors: string[] = new Array(keys.length);
  const responceColors: string[] = new Array(keys.length);

  const game = {
    score: 0,
    ends: false,
    flipAngle: 0
  };

  const words = {
    count: 0,
    currentIndex: 0,
    cards: get2dArray(5, 6, ''),
    colors: get2dArray(5, 6, '#000000'),
    isFlipping: false,
  };

  const alert = {
    mod: 60,
    delta: 60
  };

  const setKeyboard = (): void => {
    const size = screen / 12;
    for (let i = 0; i < 3; i++) {
      const diff = i === 0 ? 1 : 0;
      for (let j = 0; j < 9 + diff; j++) {
        const key = keys[j % 10 + i * 10 - p5.int(i === 2)];
        const button = p5.createButton(key);
        let x = (j + 1.5) * size - diff * size / 2 + 4 + marginSide;
        let y = (i - 1.25) * size + screen + marginTop;
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
    if (words.isFlipping || game.ends) return;
    if (key === '⌫') {
      if (words.currentIndex > 0) {
        words.currentIndex--;
        words.cards[words.count][words.currentIndex] = '';
      }
    } else if (key === 'ENTER') {
      const word = words.cards[words.count].join('');
      if (words.currentIndex >= 5) {
        if (word === answer ||
          enWords.includes(word.toLowerCase())) {
          words.isFlipping = true;
          game.score = 0;
          words.currentIndex = 0;
          checkAnswer();
        }
        else {
          alert.mod = p5.frameCount % 60;
          alert.delta = 8;
        }
      }
    } else if (words.currentIndex < 5) {
      words.cards[words.count][words.currentIndex] = key;
      words.currentIndex++;
    }
  }

  const setKeyColors = (): void => {
    for (let i = 0; i < keyboard.length; i++) {
      keyboard[i].style('background-color', keyColors[i]);
    }

    if (words.count > 5 || game.score > 4) {
      showResult();
    }
  }

  const updateAnswer = (): void => {
    const message = "答えとなる5文字の英単語を入力してください\n未入力の場合はランダムに設定されます";

    while (!answer.length || answer.length !== 5
      || answer.split('').some((e) => !keys.includes(e) || e === '⌫')) {
      const index = p5.int(p5.random(enWords.length));
      answer = (window.prompt(message, '') || enWords[index]).toUpperCase();
    }
  }

  const checkAnswer = (): void => {
    responceColors.splice(0);
    const mismatches = answer.split('');
    for (let i = 0; i < 5; i++) {
      const c = words.cards[words.count][i];
      const index = keys.indexOf(c);
      if (c === answer[i]) {
        game.score++;
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
      const c = words.cards[words.count][i];
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
    words.colors[words.count][words.currentIndex] = responceColors[words.currentIndex];
  }

  const setGame = (): void => {
    p5.textStyle(p5.BOLD);

    game.score = 0;
    game.ends = false;
    words.isFlipping = false;
    game.flipAngle = 0;
    words.count = 0;
    words.currentIndex = 0;
    alert.mod = 60;
    alert.delta = 60;
    words.cards = get2dArray(5, 6, '');
    words.colors = get2dArray(5, 6, '#000000');
    keyColors.fill('#818384', 0, keyboard.length);
    setKeyColors();
    answer = "";
    // setAnswer("");
  }

  const showResult = (): void => {
    game.ends = true;
    const initButton = p5.createButton("PLAY AGAIN");
    initButton.size(block, block / 3);
    initButton.style('font-size', `${block / 8}px`);
    initButton.position((p5.windowWidth - block) / 2, halfHeight - block / 4);
    initButton.mousePressed(() => {
      setGame();
      initButton.remove();
    });

    p5.noStroke();
    p5.fill('#FFFFFF');
    p5.rect(screen / 2, halfHeight - block, screen / 2, screen / 4);
    p5.fill('#000000');
    p5.textSize(block / 3);
    p5.textStyle(p5.NORMAL);
    p5.text(game.score > 4 ? "Congrats! 🎉" : "Oops!", screen / 2, halfHeight - block * 1.5);
    p5.textSize(block / 6);
    p5.text("The word was　　　　", screen / 2, halfHeight - block);
    p5.textStyle(p5.BOLD);
    p5.text(answer, (screen + p5.textWidth("The word was")) / 2, halfHeight - block);
  }

  p5.preload = (): void => {
    const path =
      "https://gist.githubusercontent.com/" +
      "cfreshman/a03ef2cba789d8cf00c08f767e0fad7b/" +
      "raw/28804271b5a226628d36ee831b0e36adef9cf449/" +
      "wordle-answers-alphabetical.txt";
    enWords = p5.loadStrings(path);
  }

  p5.setup = (): void => {
    p5.createCanvas(screen, screen + marginTop).parent('main');
    p5.strokeWeight(block / 40);
    p5.rectMode(p5.CENTER);
    p5.textAlign(p5.CENTER, p5.CENTER);

    setKeyboard();
    setGame();
  }

  p5.draw = (): void => {
    if (game.ends) return;
    if (!answer.length) updateAnswer();

    (p5 as any).clear();
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        p5.push();
        p5.translate((row + 1.5) * block, col * block + marginTop);
        if (words.currentIndex === row && words.count === col) {
          const ratio = p5.abs(p5.cos(p5.PI / 180 * game.flipAngle));
          p5.scale(1, ratio);
        }
        if (alert.mod !== 60 && words.count === col) {
          const theta = p5.PI / 6 * (p5.frameCount % 60 - alert.mod);
          p5.translate(p5.max(alert.delta, 0) * p5.sin(theta), 0);
        }

        p5.fill(words.colors[col][row]);
        p5.stroke('#3A3A3C');
        p5.square(0, 0, block - 10, block / 10);
        p5.fill('#FFFFFF');
        p5.noStroke();
        p5.textSize(block / 2);
        p5.text(words.cards[col][row], 0, 0);
        p5.pop();
      }
    }

    if (words.isFlipping) {
      game.flipAngle += 10;
      if (game.flipAngle === 90) {
        setCardColor();
      } else if (game.flipAngle === 180) {
        words.currentIndex++;
        game.flipAngle = 0;
      }

      if (words.currentIndex > 4) {
        game.flipAngle = 0;
        words.isFlipping = false;
        words.count++;
        words.currentIndex = 0;
        setKeyColors();
      }
    }

    if (alert.mod !== 60) {
      alert.delta -= 0.2;

      p5.noStroke();
      p5.fill('#FFFFFF');
      p5.rect(screen / 2, halfHeight - block,
        screen / 3, screen / 8);
      p5.fill('#000000');
      p5.textSize(block / 5);
      p5.text("Not in word list", screen / 2, halfHeight - block);

      if (p5.frameCount % 60 === alert.mod) {
        alert.mod = 60;
      }
    }
  }

  p5.keyPressed = (): void => {
    const c = p5.key.toUpperCase().replace('BACKSPACE', '⌫');
    if (keys.includes(c)) {
      keyboardPressed(c);
    }
  }
}

const App = () => {
  useEffect(() => {
    new P5Instance(sketch);
  }, []);

  return (
    <div style={{
      textAlign: 'center',
      marginTop: getWindowData().marginTop,
    }}
      id='main'
    />
  );
}

export default App;