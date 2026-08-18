export const users = {
  invalid: {
    email: "unknown.user@kainos.com",
    password: "WrongPassword123!"
  },
  candidateMany: {
    email: process.env.E2E_CANDIDATE_EMAIL || "candidate@kainos.com",
    password: process.env.E2E_CANDIDATE_PASSWORD || "Password123!"
  },
  candidateOne: {
    email: "onerole@kainos.com",
    password: "Password123!"
  },
  candidateEmpty: {
    email: "emptyroles@kainos.com",
    password: "Password123!"
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || "admin@kainos.com",
    password: process.env.E2E_ADMIN_PASSWORD || "AdminPass123!"
  }
};
