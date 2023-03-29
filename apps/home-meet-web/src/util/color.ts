export const generateRandomColor = () => {
  let color;
  while (true) {
    color = Math.floor(Math.random() * 16777215).toString(16);
    if (color.toLowerCase() !== 'ffffff') break;
  }

  return `#${color}`;
};
