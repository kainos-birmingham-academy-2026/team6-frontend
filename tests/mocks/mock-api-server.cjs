const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

const capabilities = [
  { capabilityId: 1, capabilityName: "Engineering" },
  { capabilityId: 2, capabilityName: "Data & AI" }
];

const bands = [
  { bandId: 1, bandName: "Associate" },
  { bandId: 2, bandName: "Senior" }
];

const loginUsers = {
  "candidate@kainos.com": { password: "Password123!", token: "candidate-many-token", role: "candidate" },
  "emptyroles@kainos.com": { password: "Password123!", token: "candidate-empty-token", role: "candidate" },
  "onerole@kainos.com": { password: "Password123!", token: "candidate-one-token", role: "candidate" },
  "admin@kainos.com": { password: "AdminPass123!", token: "admin-token", role: "admin" }
};

const baseSharedRoles = [
  {
    jobRoleId: 1,
    roleName: "Backend Engineer",
    description: "Build resilient APIs.",
    responsibilities: "Own backend services",
    sharepointUrl: "https://example.com/roles/1",
    location: "Belfast",
    capabilityName: "Engineering",
    capabilityId: 1,
    bandName: "Senior",
    bandId: 2,
    closingDate: "2026-12-31T00:00:00.000Z",
    statusName: "open",
    numberOfOpenPositions: 2
  },
  {
    jobRoleId: 2,
    roleName: "Data Engineer",
    description: "Create data platforms.",
    responsibilities: "Design pipelines",
    sharepointUrl: "https://example.com/roles/2",
    location: "Dublin",
    capabilityName: "Data & AI",
    capabilityId: 2,
    bandName: "Associate",
    bandId: 1,
    closingDate: "2026-11-30T00:00:00.000Z",
    statusName: "open",
    numberOfOpenPositions: 1
  },
  {
    jobRoleId: 3,
    roleName: "Platform Engineer",
    description: "Build cloud platforms.",
    responsibilities: "Automation and reliability",
    sharepointUrl: "https://example.com/roles/3",
    location: "London",
    capabilityName: "Engineering",
    capabilityId: 1,
    bandName: "Senior",
    bandId: 2,
    closingDate: "2026-10-15T00:00:00.000Z",
    statusName: "open",
    numberOfOpenPositions: 3
  }
];

const oneRoleSet = [
  {
    jobRoleId: 10,
    roleName: "Single Role Tester",
    description: "Only one role result.",
    responsibilities: "Validate list state",
    sharepointUrl: "https://example.com/roles/10",
    location: "Remote",
    capabilityName: "Engineering",
    capabilityId: 1,
    bandName: "Associate",
    bandId: 1,
    closingDate: "2026-12-20T00:00:00.000Z",
    statusName: "open",
    numberOfOpenPositions: 1
  }
];

let sharedRoles = [];
let applications = [];

const clone = (data) => JSON.parse(JSON.stringify(data));

function resetData() {
  sharedRoles = clone(baseSharedRoles);
  applications = [];
}

resetData();

function getToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return "";
  return auth.slice("Bearer ".length);
}

function rolesForToken(token) {
  if (token === "candidate-empty-token") return [];
  if (token === "candidate-one-token") return clone(oneRoleSet);
  return sharedRoles;
}

function requireAuth(req, res, next) {
  if (!getToken(req)) {
    res.status(401).json({ message: "Authentication token required" });
    return;
  }
  next();
}

function requireAdmin(req, res, next) {
  if (getToken(req) !== "admin-token") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({ status: "UP" });
});

app.post("/__test__/reset", (_req, res) => {
  resetData();
  res.json({ ok: true });
});

app.get("/__test__/roles", (_req, res) => {
  res.json({ roles: sharedRoles });
});

app.get("/__test__/applications", (_req, res) => {
  res.json({ applications });
});

app.post("/auth/login", (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(401).json({ message: "Email and password are required." });
    return;
  }

  const looksLikeEmail = /.+@.+\..+/.test(email);
  if (!looksLikeEmail) {
    res.status(401).json({ message: "Email or password is invalid." });
    return;
  }

  const user = loginUsers[email];
  if (!user || user.password !== password) {
    res.status(401).json({ message: "Email or password is invalid." });
    return;
  }

  res.json({
    token: user.token,
    user: {
      userid: user.role === "admin" ? 999 : 100,
      email,
      role: user.role
    }
  });
});

app.post("/auth/register", (_req, res) => {
  res.json({
    token: "register-token",
    user: {
      userid: 101,
      email: "new.user@kainos.com",
      role: "candidate"
    }
  });
});

app.get("/capabilities", (_req, res) => {
  res.json(capabilities);
});

app.get("/bands", (_req, res) => {
  res.json(bands);
});

app.get("/job-roles", requireAuth, (req, res) => {
  const query = req.query;
  const values = (value) => String(value || "").split(",").filter(Boolean);
  const capabilitiesFilter = values(query.capabilities).map(Number);
  const bandsFilter = values(query.bands).map(Number);
  const locationsFilter = values(query.locations).map((value) => value.trim().toLowerCase());
  const search = String(query.search || "").toLowerCase();
  const isFiltering =
    Boolean(search) || capabilitiesFilter.length > 0 || bandsFilter.length > 0 || locationsFilter.length > 0;

  const roles = rolesForToken(getToken(req)).filter((role) => {
    const matchesSearch = !search || `${role.roleName} ${role.location}`.toLowerCase().includes(search);
    const matchesCapabilities = !capabilitiesFilter.length || capabilitiesFilter.includes(Number(role.capabilityId));
    const matchesBands = !bandsFilter.length || bandsFilter.includes(Number(role.bandId));
    const matchesLocations =
      !locationsFilter.length || locationsFilter.includes(String(role.location).trim().toLowerCase());
    return matchesSearch && matchesCapabilities && matchesBands && matchesLocations;
  });

  // Mirrors the real backend: the filter path returns a bare array, the default path is paged.
  if (isFiltering) {
    res.json(roles);
    return;
  }

  const requestedLimit = Number(req.query.limit);
  const requestedOffset = Number(req.query.offset);
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 10;
  const offset = Number.isInteger(requestedOffset) && requestedOffset >= 0 ? requestedOffset : 0;

  res.json({
    items: roles.slice(offset, offset + limit),
    total: roles.length,
    limit,
    offset
  });
});

app.get("/job-roles/:id", requireAuth, (req, res) => {
  const id = String(req.params.id);
  const roles = rolesForToken(getToken(req));
  const role = roles.find((entry) => String(entry.jobRoleId) === id);
  if (!role) {
    res.status(404).json({ message: "Role not found" });
    return;
  }
  res.json(role);
});

app.post("/job-roles", requireAdmin, (req, res) => {
  const nextId = Math.max(0, ...sharedRoles.map((role) => Number(role.jobRoleId) || 0)) + 1;
  const capability = capabilities.find((item) => item.capabilityId === Number(req.body.capabilityId));
  const band = bands.find((item) => item.bandId === Number(req.body.bandId));

  const created = {
    jobRoleId: nextId,
    roleName: req.body.roleName,
    description: req.body.description || "",
    responsibilities: req.body.responsibilities || "",
    sharepointUrl: req.body.sharepointUrl || "",
    location: req.body.location,
    capabilityName: capability ? capability.capabilityName : "Engineering",
    capabilityId: Number(req.body.capabilityId) || 1,
    bandName: band ? band.bandName : "Associate",
    bandId: Number(req.body.bandId) || 1,
    closingDate: req.body.closingDate,
    statusName: "open",
    numberOfOpenPositions: Number(req.body.numberOfOpenPositions || 1)
  };

  sharedRoles.push(created);
  res.status(201).json(created);
});

app.put("/job-roles/:id", requireAdmin, (req, res) => {
  const id = String(req.params.id);
  const index = sharedRoles.findIndex((entry) => String(entry.jobRoleId) === id);
  if (index === -1) {
    res.status(404).json({ message: "Role not found" });
    return;
  }

  const capability = capabilities.find((item) => item.capabilityId === Number(req.body.capabilityId));
  const band = bands.find((item) => item.bandId === Number(req.body.bandId));

  sharedRoles[index] = {
    ...sharedRoles[index],
    roleName: req.body.roleName,
    description: req.body.description || "",
    responsibilities: req.body.responsibilities || "",
    sharepointUrl: req.body.sharepointUrl || "",
    location: req.body.location,
    capabilityName: capability ? capability.capabilityName : sharedRoles[index].capabilityName,
    capabilityId: Number(req.body.capabilityId) || sharedRoles[index].capabilityId,
    bandName: band ? band.bandName : sharedRoles[index].bandName,
    bandId: Number(req.body.bandId) || sharedRoles[index].bandId,
    closingDate: req.body.closingDate,
    numberOfOpenPositions: Number(req.body.numberOfOpenPositions || 1)
  };

  res.json(sharedRoles[index]);
});

app.delete("/job-roles/:id", requireAdmin, (req, res) => {
  const id = String(req.params.id);
  sharedRoles = sharedRoles.filter((entry) => String(entry.jobRoleId) !== id);
  res.status(204).send();
});

app.post("/job-roles/:id/apply", requireAuth, upload.single("cv"), (req, res) => {
  const id = String(req.params.id);
  const role = sharedRoles.find((entry) => String(entry.jobRoleId) === id) || oneRoleSet.find((entry) => String(entry.jobRoleId) === id);

  if (!role) {
    res.status(404).json({ message: "Role not found" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: "CV file is required" });
    return;
  }

  const isPdf = req.file.mimetype === "application/pdf";
  if (!isPdf) {
    res.status(400).json({ message: "Only PDF accepted in mock API" });
    return;
  }

  applications.push({
    jobRoleId: Number(id),
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size
  });

  res.status(201).json({ message: "Application submitted" });
});

const port = 4010;
app.listen(port, () => {
  console.log(`Mock API server running at http://127.0.0.1:${port}`);
});
