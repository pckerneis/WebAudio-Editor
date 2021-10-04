export default function debounce(func: Function, wait: number) {
  let timeout: any;

  return (...args: any[]) => {
    const handler = () => {
      timeout = null;
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(handler, wait);
  };
};
