export default function EvuiResolver(options = {}) {
  const { importStyle = true, exclude } = options;

  return {
    type: 'component',
    resolve: (name) => {
      if (!name.match(/^Ev[A-Z]/)) {
        return undefined;
      }
      if (exclude && name.match(exclude)) {
        return undefined;
      }
      return {
        name,
        from: 'evui',
        sideEffects: importStyle ? 'evui/style' : undefined,
      };
    },
  };
}
