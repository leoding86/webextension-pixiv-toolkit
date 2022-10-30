import NameFormattor from "./NameFormatter";

export default (renameFormat, context, fallback) => {
  const nameFormatter = NameFormattor.getFormatter({ context });

  return nameFormatter.format(renameFormat, fallback);
};
