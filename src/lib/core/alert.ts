import { Cached } from "./cache";

// this types and interfaces
export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number; // ms
  position?: "top" | "bottom";
}

export class Alert {
  private static container: HTMLElement | null = null;
  private static queue: ToastOptions[] = [];
  private static showing = false;

  static show(options: ToastOptions) {
    if (!Alert.container) {
      Alert.container = document.createElement("div");
      Alert.container.className = "fixed z-50 inset-0 w-full flex flex-col items-center pointer-events-none ";
      document.body.appendChild(Alert.container);
    }

    Alert.queue.push(options);
    if (!Alert.showing) {
      console.log(Alert.container);
      Alert.displayNext();
    }
  }

  private static displayNext() {
    if (!Alert.container) return;
    if (Alert.queue.length === 0) {
      Alert.showing = false;
      return;
    }

    Alert.showing = true;
    const opts = Alert.queue.shift()!;
    const toast = document.createElement("div");
    toast.className =
      Alert.getClass(opts.type || "info") +
      " m-2 px-4 py-2 rounded shadow-lg text-white text-center pointer-events-auto inline-block overflow-auto max-h-[40vh] max-width-[90vw]";
    // Create message span
    const messageSpan = document.createElement("span");
    messageSpan.textContent = opts.message;
    toast.appendChild(messageSpan);

    // Create OK button
    const okButton = document.createElement("button");
    okButton.textContent = Alert.getOKWord();
    okButton.className = "ml-4 px-3 py-1 bg-white text-black rounded shadow pointer-events-auto";
    okButton.onclick = () => {
      toast.remove();
      Alert.displayNext();
    };
    toast.appendChild(okButton);

    // Position
    Alert.container.style.top = opts.position === "top" ? "1rem" : "";
    Alert.container.style.bottom = opts.position === "bottom" ? "1rem" : "";
    Alert.container.appendChild(toast);
  }

  private static getClass(type: ToastType): string {
    switch (type) {
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      default:
        return "bg-gray-800";
    }
  }

  private static getOKWord() {
    return Cached.language.value === "af" ? "Reg" : "OK";
  }

  static success(message: string, duration?: number, position?: "top" | "bottom") {
    Alert.show({ message, type: "success", duration, position });
  }

  static error(message: string, duration?: number, position?: "top" | "bottom") {
    Alert.show({ message, type: "error", duration, position });
  }
}
