import axios from "axios";

const api = axios.create({
  baseURL: "https://bisho-backend-1.onrender.com/api",
    withCredentials: true, 
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    // console.log("[API Request]", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // console.log("[API Response]", response.status, response.config.url);
    return response;
  },
  (error) => {
    const isAuthError = error.response?.status === 401;
    const isBrowser = typeof window !== "undefined";
    const pathname = isBrowser ? window.location.pathname : "";

    const isSafeToRedirect =
      pathname !== "/login" &&
      !pathname.startsWith("/.well-known") &&
      !pathname.match(/\.(js|json|css|map|ico|png|jpg|jpeg)$/);

    console.error("[API Error]", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    if (isAuthError && isBrowser && isSafeToRedirect) {
      console.warn("[API] Unauthorized - redirecting to login");
      window.location.href = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (identifier: string, password: string) => {
    const response = await api.post("/auth/login", { identifier, password });
    // console.log("[authAPI.login] Raw response data:", response.data);
    return { user: response.data.user }; 
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
  session : async () => {
    const response = await api.get("/auth/session");
    return response.data;

  }
};

export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },
};

export const membersAPI = {
  getMember: async (etNumber: string) => {
    const response = await api.get(`/members/${etNumber}`);
    return response.data;
  },
   getMembers: async () => {
    const response = await api.get(`/members`);
    return response.data;
  },
 uploadKYC: async (formData: FormData) => {
  const response = await api.post("/member/kyc-upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
},

getWillingDeposits: async (
  userId: number | undefined
) => {
  const response = await api.get(`/willing-deposit/requests?memberId=${userId}`);
  return response.data;
},

willingDepositRequest: async (
  data: {
    amount: number;
    reason: string;
    paymentMethod: string;
    memberId: number | undefined;
  }
)=> {
  const response = await api.post('/willing-deposit/request', data);
  return response.data;
}

};

export const membersLoanAPI = {
  apply: async (formData: {
    amount: number;
    interestRate: number;
    tenureMonths: number;
    purpose: string;
    coSigner1?: string;
    coSigner2?: string;
    agreement: File;
  }) => {
    const data = new FormData();
    data.append("amount", String(formData.amount));
    data.append("interestRate", String(formData.interestRate));
    data.append("tenureMonths", String(formData.tenureMonths));
    data.append("purpose", formData.purpose);
    if (formData.coSigner1) data.append("coSigner1", formData.coSigner1);
    if (formData.coSigner2) data.append("coSigner2", formData.coSigner2);
    data.append("agreement", formData.agreement);

    const response = await api.post(`/loans/apply`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
   loanEligibilityReq: async () => {
    const response = await api.get('/members/loan-eligibility')
    return response.data;
  },

  getLoans: async () => {
    const response = await api.get('/members/loans');
    return response.data;
  }, 

  getLoansById: async(
    Id: string[] | string
  ) => {
    const response = await api.get(`/api/members/loans/${Id}`);
    return response.data;
  },

  calculateLoan: async (data: {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  repaymentFrequency: "monthly" | "quarterly" | "annually";
}) => {
  const response = await api.post("/members/loans/calculate", data);
  return response.data;
},

payLoanRepayment: async (
  loanId: string | string[],
  repaymentId: string | number,
  data: {
    amount: number;
    reference?: string;
    sourceType: string;
  }
) => {
  const response = await api.post(
    `/members/loans/${loanId}/repayments/${repaymentId}/pay`,
    data
  );
  return response.data;
}
};

export const membersSavingsAPI = {
    getSavingsAndTransactions: async (
      etNumber: string,
      period: string,
      type: string
    ) => {
      const response = await api.get(
        `/members/${etNumber}/savings-and-transactions`,
        { params: { period, type } } // axios handles query strings automatically
      );
      return response.data;
    },
};

export const loanCalculator = {
  getCalculated: async( loanAmount:number, interestRate:number, loanTerm:number, repaymentFrequency: "monthly" | "quarterly" | "annually") => {
    const result = await api.post('loans/calculate', {loanAmount, interestRate, loanTerm, repaymentFrequency});
    return result.data;
       
  }
}

export const loanAgreement = {
  getLoanAgreement: async()=>{
    const response = await api.get('/loans/agreement-template');
    return response.data;
  }
}

export const loanDocument = {
  getLoanDocumentById: async(
    documentId: number
  )=>{
    const response = await api.get(`/member/loans/documents/${documentId}`);
    return response.data;
  },

  getLoanDocumentByUrl: async(
    URL: string
  )=>{
    const response = await api.get(`/members/documents/view?url=${encodeURIComponent(URL)}`);
    return response.data;
  },

  getLoanDocument: async()=>{
    const response = await api.get('/members/loans/documents');
    return response.data;
  }
}

export default api;