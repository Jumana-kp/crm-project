export function formatCreatedDate(date: string | null | undefined): string {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return `${parsedDate.toLocaleDateString(
    "en-GB",
  )} ${parsedDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })} GMT+04:00`;
}
