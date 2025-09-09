export default class DateUtil {
  static format(date: Date, format: string) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }

    const tokens: Record<string, string> = {
      YY: String(date.getFullYear()).slice(-2),
      YYYY: date.getFullYear().toString(),
      M: "" + (date.getMonth() + 1),
      MM: String(date.getMonth() + 1).padStart(2, "0"),
      MMM: date.toLocaleDateString("en", { month: "short" }),
      MMMM: date.toLocaleDateString("en", { month: "long" }),
      D: "" + date.getDate(),
      DD: String(date.getDate()).padStart(2, "0"),
      ddd: date.toLocaleDateString("en", { weekday: "short" }),
      dddd: date.toLocaleDateString("en", { weekday: "long" }),
      H: "" + date.getHours(),
      HH: String(date.getHours()).padStart(2, "0"),
      m: "" + date.getMinutes(),
      mm: String(date.getMinutes()).padStart(2, "0"),
      s: "" + date.getSeconds(),
      ss: String(date.getSeconds()).padStart(2, "0"),
    };

    return format.replace(/YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|D|HH|H|mm|m|ss|s/g, (match) => tokens[match]);
  }
}
