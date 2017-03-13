export default class PhantomError extends Error {
  constructor(message, trace = []) {
    super(message);

    this.trace = trace
      .map((t) => {
        let src = t.file || t.sourceURL;
        let line = t.line;
        let fn = t.function;

        return `  at ${src || t.sourceURL}:${line} (in function ${fn})`;
      })
      .join('\n');
  }
}
