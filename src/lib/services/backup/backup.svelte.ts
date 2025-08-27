import { cached_backup_token, cached_email_address } from "$lib/cached";
import { getAuthToken, signInWithGoogle } from "./auth";
import { auth, FUNCTIONS_URLS } from "./firebase";
import { t } from "$lib/services";
import { DB } from "$lib/DB";

class Backup {
  #email_address: string | null = $state(null);

  constructor() {
    this.init();
  }

  async init() {
    this.#email_address = await cached_email_address.get();
  }

  get email_address() {
    return this.#email_address;
  }

  set email_address(email_address: string | null) {
    if (typeof email_address !== "string") return;

    cached_email_address.set(email_address);
    this.#email_address = email_address;
  }

  private async makeRequest(functionName: keyof typeof FUNCTIONS_URLS, options: RequestInit = {}) {
    const token = await getAuthToken();

    const config: RequestInit = {
      ...options,
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(FUNCTIONS_URLS[functionName], config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async verifyEmail() {
    const result = await signInWithGoogle();

    if (result && result.email) {
      alert(t("email_verification_success") + " " + result.email);
      this.email_address = result.email;
    }
    let currentUser = auth.currentUser;
    const token = await currentUser?.getIdToken();
    if (token) cached_backup_token.set(token);
  }

  // Backup operations
  async createBackup() {
    const tasks = await DB.Task.getAll({ selector: { archived: { $ne: true } } });
    const categories = await DB.Category.getAll({ selector: { archived: { $ne: true } } });
    return this.makeRequest("createBackup", {
      method: "POST",
      body: JSON.stringify({ tasks, categories }),
    });
  }

  async restoreBackup() {
    return this.makeRequest("restoreBackup", {
      method: "POST",
    });
  }
}
export const backup = new Backup();
