import validator from "validator";
import { validateTimezone } from "../../utils/UserUtils";

export const connectionFields = {
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },

  lastLoginDevice: String,

  userLanguage: {
    type: String,
    required: true,
    enum: ["en", "bn", "hi", "ur", "ne", "si", "dz", "dv", "ps", "fa", "ar", "he",
      "tr", "th", "vi", "km", "lo", "my", "ms", "id", "tl", "zh", "ja", "ko",
      "mn", "de", "fr", "it", "es", "ca", "eu", "gl", "pt", "nl", "sv", "da",
      "no", "fi", "is", "et", "lv", "lt", "pl", "cs", "sk", "hu", "ro", "bg",
      "el", "sr", "hr", "bs", "mk", "sq", "sl", "mt", "uk", "be", "ru", "kk",
      "uz", "tg", "tk", "ky", "ka", "hy", "az", "so", "am", "ti", "sw", "rw",
      "rn", "mg", "zu", "xh", "st", "ss", "tn", "ny", "sn", "af", "yo", "ig",
      "ha", "ak", "wo", "bm", "dy", "ht", "fj", "sm", "to", "ch", "tpi", "bi",
      "mi", "kl", "fo", "ga", "gd", "cy", "lb", "fy", "gv", "kw", "co", "sc",
      "rm", "wa", "oc", "an", "ast", "ext", "lad", "mwl", "pap", "tzl", "vo"],
    default: 'en'
  },

  timezone: {
    type: String,
    required: true,
    default: 'UTC',
    validate: {
      validator: validateTimezone,
      message: 'Invalid timezone'
    }
  },

  registrationIP: {
    type: String,
    validate: {
      validator: (value: string) => validator.isIP(value),
      message: 'Invalid registration IP address'
    }
  },

  detectedCountry: {
    type: String,
    maxlength: 2,
    uppercase: true
  },

  currentIP: {
    type: String,
    validate: {
      validator: (value: string) => validator.isIP(value),
      message: 'Invalid current IP address'
    }
  }
};
