import {
  accounts,
  applications,
  auditLogs,
  cardProducts,
  cards,
  creditScores,
  customerProfiles,
  feeConfigs,
  payments,
  statements,
  transactions,
  underwritingHistory,
  users
} from "../data/mockData";
import { clearSession, getStoredSession, getToken, isMockSession } from "../utils/auth";

const API_BASE_URL = "http://localhost:8082";

export const mockRoleCredentials = [
  {
    role: "CUSTOMER",
    name: "Demo Customer",
    email: "customer@mock.com",
    password: "Customer@123"
  },
  {
    role: "UNDERWRITER",
    name: "Demo Underwriter",
    email: "underwriter@mock.com",
    password: "Underwriter@123"
  },
  {
    role: "OFFICER",
    name: "Demo Operations",
    email: "officer@mock.com",
    password: "Officer@123"
  },
  {
    role: "RISK",
    name: "Demo Risk Analyst",
    email: "risk@mock.com",
    password: "Risk@1234"
  },
  {
    role: "ADMIN",
    name: "Demo Admin",
    email: "admin@mock.com",
    password: "Admin@123"
  }
];

function getSessionEmail() {
  return getStoredSession()?.email || "";
}

function getMockCustomerProfile() {
  const session = getStoredSession();
  const email = session?.email || customerProfiles[0]?.email || "";
  const existingCustomer = customerProfiles.find(
    (item) => (item.email || item.contactInfo?.email) === email
  );

  if (existingCustomer) {
    return existingCustomer;
  }

  return {
    customerId: 9001,
    name: session?.name || "Demo Customer",
    dob: "1995-01-01",
    contactInfo: {
      address: "Demo Address",
      email,
      phone: "9876543210"
    },
    income: 500000,
    employmentType: "Salaried",
    status: "Active"
  };
}

function unwrapResponse(payload, fallback) {
  if (payload?.data) {
    return payload.data;
  }

  return payload ?? fallback;
}

function decodeJwtPayload(token) {
  try {
    const encoded = token.split(".")[1];
    if (!encoded) {
      return {};
    }

    return JSON.parse(atob(encoded));
  } catch (error) {
    return {};
  }
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: getToken() } : {}),
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    let errorMessage = `Request failed for ${path}`;

    try {
      const errorPayload = await response.json();
      errorMessage = errorPayload?.msg || errorPayload?.message || errorMessage;
    } catch (error) {
      errorMessage = `${errorMessage} (${response.status})`;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

async function safeFetch(path, fallback, options = {}) {
  try {
    return await fetchJson(path, options);
  } catch (error) {
    return fallback;
  }
}

export const customerApi = {
  getCustomers: async () => unwrapResponse(await safeFetch("/customers", { data: customerProfiles }), customerProfiles),
  createCustomer: (payload) =>
    fetchJson("/customers", { method: "POST", body: JSON.stringify(payload) }),
  getMyCustomer: async () =>
    isMockSession()
      ? getMockCustomerProfile()
      : unwrapResponse(await safeFetch("/customers/my", { data: customerProfiles[0] }), customerProfiles[0]),
  getApplications: async () => unwrapResponse(await safeFetch("/applications", { data: applications }), applications),
  getApplicationsByCustomer: async (customerId) =>
    unwrapResponse(
      await safeFetch(`/applications/customer/${customerId}`, { data: applications.filter((item) => item.customerId === customerId) }),
      applications.filter((item) => item.customerId === customerId)
    ),
  createApplication: async (payload) =>
    isMockSession()
      ? {
          applicationId: Date.now(),
          ...payload
        }
      : fetchJson("/applications", { method: "POST", body: JSON.stringify(payload) }),
  uploadDocument: async (payload) =>
    isMockSession()
      ? {
          documentId: Date.now(),
          ...payload
        }
      : fetchJson("/documents", { method: "POST", body: JSON.stringify(payload) }),
  getProducts: async () => unwrapResponse(await safeFetch("/api/products", cardProducts), cardProducts),
  getProductsStrict: async () =>
    isMockSession()
      ? cardProducts.map((product) => ({
          productId: product.id,
          name: product.name,
          category: product.category,
          status: "ACTIVE"
        }))
      : unwrapResponse(await fetchJson("/api/products"), []),
  getMyCards: async () =>
    unwrapResponse(
      await safeFetch("/api/cards/my", cards.filter((item) => item.customerEmail === getSessionEmail())),
      cards.filter((item) => item.customerEmail === getSessionEmail())
    ),
  getMyAccount: async () =>
    unwrapResponse(
      await safeFetch("/api/accounts/my", accounts.find((item) => item.customerEmail === getSessionEmail()) || accounts[0]),
      accounts.find((item) => item.customerEmail === getSessionEmail()) || accounts[0]
    ),
  getMyTransactions: async () => {
    const account = accounts.find((item) => item.customerEmail === getSessionEmail());
    const fallbackRows = account
      ? transactions.filter((item) => item.accountId === account.accountId)
      : [];
    return unwrapResponse(await safeFetch("/transactions/my", fallbackRows), fallbackRows);
  },
  getMyStatements: async () => {
    const account = accounts.find((item) => item.customerEmail === getSessionEmail());
    const fallbackRows = account
      ? statements.filter((item) => item.accountId === account.accountId)
      : [];
    return unwrapResponse(await safeFetch("/billing/statements/my", fallbackRows), fallbackRows);
  },
  getMyPayments: async () => {
    const account = accounts.find((item) => item.customerEmail === getSessionEmail());
    const fallbackRows = account
      ? payments.filter((item) => item.accountId === account.accountId)
      : [];
    return unwrapResponse(await safeFetch("/billing/payments/my", fallbackRows), fallbackRows);
  }
};

export const underwriterApi = {
  getApplications: async () => unwrapResponse(await safeFetch("/applications", { data: applications }), applications),
  getCreditScores: () => Promise.resolve(creditScores),
  getUnderwritingHistory: () => Promise.resolve(underwritingHistory),
  createDecision: (applicationId, payload) =>
    fetchJson(`/applications/${applicationId}/decisions`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
};

export const operationsApi = {
  getCards: () => safeFetch("/api/cards/my", cards),
  createCard: (payload) =>
    fetchJson("/api/cards", { method: "POST", body: JSON.stringify(payload) }),
  getAccounts: () => safeFetch("/api/accounts/my", accounts),
  createAccount: (payload) =>
    fetchJson("/api/accounts", { method: "POST", body: JSON.stringify(payload) }),
  getTransactions: () => safeFetch("/transactions", transactions),
  authorizeTransaction: (payload) =>
    fetchJson("/transactions/authorize", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  postTransaction: (transactionId) =>
    fetchJson(`/transactions/post/${transactionId}`, {
      method: "POST"
    }),
  reverseTransaction: (transactionId) =>
    fetchJson(`/transactions/reverse/${transactionId}`, {
      method: "POST"
    }),
  getStatements: () => safeFetch("/billing/statements", statements),
  createStatement: (payload) =>
    fetchJson("/billing/statements/generate", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  closeStatement: (statementId) =>
    fetchJson(`/billing/statements/close/${statementId}`, {
      method: "POST"
    }),
  getPayments: () => safeFetch("/billing/payments", payments),
  createPayment: (payload) =>
    fetchJson("/billing/payments/capture", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};

export const adminApi = {
  getUsers: async () => unwrapResponse(await safeFetch("/users", { data: users }), users),
  registerUser: (payload) =>
    fetchJson("/users/register", { method: "POST", body: JSON.stringify(payload) }),
  getProducts: () => safeFetch("/api/products", cardProducts),
  createProduct: (payload) =>
    fetchJson("/api/products", { method: "POST", body: JSON.stringify(payload) }),
  getFees: () => Promise.resolve(feeConfigs),
  createFee: (payload) =>
    fetchJson("/api/fees", { method: "POST", body: JSON.stringify(payload) }),
  getAuditLogs: async () => unwrapResponse(await safeFetch("/auditlogs", { data: auditLogs }), auditLogs)
};

export const authApi = {
  async login(payload) {
    try {
      const response = await fetchJson("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const token = response?.data || "";
      const tokenPayload = decodeJwtPayload(token.replace("Bearer ", ""));
      const currentSession = getStoredSession();

      return {
        token,
        email: payload.email,
        role: tokenPayload?.role || currentSession?.role || "",
        name: tokenPayload?.sub || currentSession?.name || payload.email,
        isMockLogin: false
      };
    } catch (error) {
      const mockUser = mockRoleCredentials.find(
        (item) =>
          item.email.toLowerCase() === String(payload.email).toLowerCase() &&
          item.password === payload.password
      );

      if (!mockUser) {
        throw error;
      }

      return {
        token: `Bearer mock-${mockUser.role.toLowerCase()}-token`,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
        isMockLogin: true
      };
    }
  },
  register: (payload) =>
    fetchJson("/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }),
  async logout() {
    try {
      const response = await fetchJson("/users/logout", {
        method: "POST"
      });
      return response?.data || response?.msg || "Logout successful.";
    } finally {
      clearSession();
    }
  }
};
