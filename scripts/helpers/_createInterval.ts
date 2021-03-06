type Callback = (...args: any[]) => any;

export default (cb: Callback, duration: number): (() => void) => {
  const id = setInterval(cb, duration);
  return (): void => {
    clearInterval(id);
  };
};
