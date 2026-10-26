export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en").format(value);
