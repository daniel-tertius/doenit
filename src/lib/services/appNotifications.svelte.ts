interface Options {
  duration?: number;
  type?: "success" | "error";
}
export class AppNotification {
  static showSimple(message: string, options?: Options) {
    const { duration = 3000, type = "success" } = options ?? {};

    // Show success message briefly
    const successDiv = document.createElement("div");
    successDiv.className = "fixed left-4 top-4 right-4 text-alt p-4 rounded-lg shadow-lg z-50";
    if (type === "success") {
      successDiv.classList.add("bg-success");
    } else if (type === "error") {
      successDiv.classList.add("bg-error");
    }
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, duration);
  }

  static showError(message: string, { duration = 5000 } = { duration: 5000 }) {
    AppNotification.showSimple(message, { duration, type: "error" });
  }
}
