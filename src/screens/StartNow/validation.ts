import type {
  AccountDetails,
  DeviceChoice,
  EquipmentId,
  FieldErrors,
  PasswordFieldErrors,
  PaymentMethod,
  ShippingAddress,
} from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trim = (value: string): string => value.trim();

export function validateAccount(details: AccountDetails): FieldErrors {
  const errors: FieldErrors = {};
  const salonName = trim(details.salonName);
  const contactName = trim(details.contactName);
  const workEmail = trim(details.workEmail);

  if (salonName.length < 2) {
    errors.salonName = "Enter your salon name.";
  }
  if (contactName.length < 2) {
    errors.contactName = "Enter the owner or contact name.";
  }
  if (!workEmail) {
    errors.workEmail = "Enter your work email.";
  } else if (!EMAIL_PATTERN.test(workEmail)) {
    errors.workEmail = "Enter a valid work email.";
  }
  if (!details.country) {
    errors.country = "Select a country.";
  }
  if (!details.stylistCount) {
    errors.stylistCount = "Select how many stylists you have.";
  }

  return errors;
}

export function validateEquipment(equipment: EquipmentId[]): FieldErrors {
  if (equipment.length === 0) {
    return { equipment: "Select at least one item for your setup." };
  }
  return {};
}

export function validateDevice(device: DeviceChoice | ""): FieldErrors {
  if (!device) {
    return { device: "Choose a tablet option." };
  }
  return {};
}

export function validateShipping(shipping: ShippingAddress): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = trim(shipping.fullName);
  const address1 = trim(shipping.address1);
  const city = trim(shipping.city);
  const postalCode = trim(shipping.postalCode);
  const phoneDigits = shipping.phone.replace(/\D/g, "");

  if (fullName.length < 2) {
    errors.fullName = "Enter the recipient’s full name.";
  }
  if (address1.length < 3) {
    errors.address1 = "Enter a street address.";
  }
  if (city.length < 2) {
    errors.city = "Enter a city.";
  }
  if (postalCode.length < 3) {
    errors.postalCode = "Enter a postal code.";
  }
  if (!shipping.country) {
    errors.shippingCountry = "Select a country.";
  }
  if (phoneDigits.length < 8) {
    errors.phone = "Enter a phone number we can reach.";
  }

  return errors;
}

export function validatePayment(method: PaymentMethod | ""): FieldErrors {
  if (!method) {
    return { paymentMethod: "Choose a checkout option to continue." };
  }
  return {};
}

export function validatePasswordForm(input: {
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  email?: string;
}): PasswordFieldErrors {
  const errors: PasswordFieldErrors = {};
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = "Include at least one letter and one number.";
  } else if (input.email && password.toLowerCase() === input.email.trim().toLowerCase()) {
    errors.password = "Choose a password that is not your email.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!input.acceptedTerms) {
    errors.acceptedTerms = "Agree to the terms to continue.";
  }

  return errors;
}

export function passwordStrengthLabel(password: string): "Empty" | "Weak" | "Fair" | "Strong" {
  if (!password) return "Empty";
  const long = password.length >= 12;
  const mixed = /[A-Za-z]/.test(password) && /\d/.test(password);
  const symbol = /[^A-Za-z0-9]/.test(password);
  if (long && mixed && symbol) return "Strong";
  if (password.length >= 8 && mixed) return "Fair";
  return "Weak";
}

export function hasErrors(errors: FieldErrors | PasswordFieldErrors): boolean {
  return Object.values(errors).some((value) => Boolean(value));
}

export function firstErrorKey(errors: FieldErrors): keyof FieldErrors | null {
  const keys: Array<keyof FieldErrors> = [
    "salonName",
    "contactName",
    "workEmail",
    "country",
    "stylistCount",
    "equipment",
    "device",
    "fullName",
    "address1",
    "address2",
    "city",
    "postalCode",
    "shippingCountry",
    "phone",
    "paymentMethod",
    "form",
  ];
  return keys.find((key) => errors[key]) ?? null;
}

export function firstPasswordErrorKey(errors: PasswordFieldErrors): keyof PasswordFieldErrors | null {
  const keys: Array<keyof PasswordFieldErrors> = ["password", "confirmPassword", "acceptedTerms"];
  return keys.find((key) => errors[key]) ?? null;
}

export function sanitizeAccount(details: AccountDetails): AccountDetails {
  return {
    salonName: trim(details.salonName),
    contactName: trim(details.contactName),
    workEmail: trim(details.workEmail).toLowerCase(),
    country: details.country,
    stylistCount: details.stylistCount,
  };
}

export function sanitizeShipping(shipping: ShippingAddress): ShippingAddress {
  return {
    fullName: trim(shipping.fullName),
    address1: trim(shipping.address1),
    address2: trim(shipping.address2),
    city: trim(shipping.city),
    postalCode: trim(shipping.postalCode),
    country: shipping.country,
    phone: trim(shipping.phone),
  };
}
