import p5 from 'p5';

import P5Instance = p5;

export const getWindowData = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const device = navigator.userAgent;
    const isPhone = (device.indexOf('iPhone') > 0
      && device.indexOf('iPad') === -1)
      || device.indexOf('iPod') > 0
      || device.indexOf('Android') > 0;
    const screen = Math.min(width, height, isPhone ? width * height : 720);
  
    return {
        screenSize: screen,
        marginTop: (height - screen / 7 * 8) / 2,
        marginSide: (width - screen) / 2
    };
}
  
export default P5Instance;