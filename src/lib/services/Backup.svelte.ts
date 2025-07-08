import { cached_email_address, cached_is_backup_enabled } from "$lib/cached";
import { FUNCTIONS_URLS } from "../firebase";
import { AuthService } from "./auth";

class Backup {
  #email_address: string | null = $state(null);
  auto_enabled: boolean = $state(false);

  constructor() {
    this.init();
  }

  async init() {
    this.#email_address = await cached_email_address.get();
    const is_enabled = await cached_is_backup_enabled.get();
    if (!is_enabled) {
      cached_is_backup_enabled.set(false);
      this.auto_enabled = false;
      return;
    }

    this.auto_enabled = is_enabled;
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
    const token = await AuthService.getAuthToken();

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
    const result = await AuthService.verifyEmailWithGoogle();

    if (result && result.email) {
      alert("E-posadres verifieer suksesvol as " + result.email);
      this.email_address = result.email;
    }

    // Automatically sign out after verification
    setTimeout(async () => {
      await AuthService.signOut();
    }, 2000);
  }

  // Backup operations
  async createBackup() {
    return this.makeRequest("createBackup", {
      method: "POST",
    });
  }

  async restoreBackup(backupId: string) {
    return this.makeRequest("restoreBackup", {
      method: "POST",
      body: JSON.stringify({ backupId }),
    });
  }
}
export const backup = new Backup();
