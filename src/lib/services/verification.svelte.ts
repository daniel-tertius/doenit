import { cached_email_address } from "$lib/cached";

class Verification {
  #email_address: string | null = $state(null);

  get email_address() {
    return this.#email_address;
  }

  set email_address(email_address) {
    this.#email_address = email_address;
    cached_email_address.set(email_address);
  }
}

export const verification = new Verification();
