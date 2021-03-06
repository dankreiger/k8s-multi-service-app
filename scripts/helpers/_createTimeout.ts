type Callback = (...args: any[]) => any;

export default (cb: Callback, duration: number): (() => void) => {
  const id = setTimeout(cb, duration);
  return (): void => {
    clearTimeout(id);
  };
};
