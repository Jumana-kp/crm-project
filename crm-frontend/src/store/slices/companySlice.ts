import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axiosInstance from "../../api/axios";

// TYPES

export type CompanyOwner = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

export type Company = {
  id: number;

  domain_name: string;
  company_name: string;

  company_owners: CompanyOwner[];

  industry: string;
  company_type: string;

  city: string;
  country: string;

  no_of_employees: number | null;
  annual_revenue: string | null;

  phone_number: string;
  email: string;

  created_at: string;
  updated_at: string;
};

// CREATE / UPDATE PAYLOAD

export type CompanyPayload = {
  domain_name?: string;
  company_name?: string;
  company_owner_ids?: number[];

  industry?: string;
  company_type?: string;

  city?: string;
  country?: string;

  no_of_employees?: number | null;
  annual_revenue?: string | null;

  phone_number?: string;
  email?: string;
};

// FILTERS

export type CompanyFilters = {
  search?: string;
  industry?: string;
  country?: string;
  city?: string;
  created_date?: string;
  lead_status?: string;
  page?: number;
};

// IMPORT RESPONSE

export type CompanyImportResponse = {
  success: boolean;
  message: string;
  created: number;
  failed: number;
  total_rows: number;
  errors: Array<{
    row: number;
    company_name?: string;
    errors: string[];
  }>;
};

// LIST RESPONSE

type CompanyListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Company[];
};

// STATE

type CompanyState = {
  companies: Company[];

  selectedCompany: Company | null;

  totalCompanies: number;
  currentPage: number;
  totalPages: number;

  nextPage: string | null;
  previousPage: string | null;

  loading: boolean;
  detailLoading: boolean;
  saving: boolean;
  deleting: boolean;
  importing: boolean;

  error: any;
  detailError: any;
  saveError: any;
  deleteError: any;
  importError: any;
};

// INITIAL STATE

const initialState: CompanyState = {
  companies: [],

  selectedCompany: null,

  totalCompanies: 0,
  currentPage: 1,
  totalPages: 1,

  nextPage: null,
  previousPage: null,

  loading: false,
  detailLoading: false,
  saving: false,
  deleting: false,
  importing: false,

  error: null,
  detailError: null,
  saveError: null,
  deleteError: null,
  importError: null,
};

// FETCH COMPANIES

export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",

  async (filters: CompanyFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Search
      if (filters.search?.trim()) {
        params.append("search", filters.search.trim());
      }

      // Industry
      if (filters.industry?.trim()) {
        params.append("industry", filters.industry.trim());
      }

      // Country
      if (filters.country?.trim()) {
        params.append("country", filters.country.trim());
      }

      // City
      if (filters.city?.trim()) {
        params.append("city", filters.city.trim());
      }

      // Created date
      if (filters.created_date?.trim()) {
        params.append("created_date", filters.created_date.trim());
      }

      // Lead status
      if (filters.lead_status?.trim()) {
        params.append("lead_status", filters.lead_status.trim());
      }

      // Pagination
      const currentPage = filters.page && filters.page > 0 ? filters.page : 1;

      params.append("page", String(currentPage));

      const response = await axiosInstance.get(
        `/companies/?${params.toString()}`,
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to fetch companies",
      );
    }
  },
);

// FETCH COMPANY BY ID

export const fetchCompanyById = createAsyncThunk(
  "companies/fetchCompanyById",

  async (companyId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/companies/${companyId}/`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to fetch company",
      );
    }
  },
);

// CREATE COMPANY

export const createCompany = createAsyncThunk(
  "companies/createCompany",

  async (companyData: CompanyPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/companies/", companyData);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to create company",
      );
    }
  },
);

// UPDATE COMPANY

export const updateCompany = createAsyncThunk(
  "companies/updateCompany",

  async (
    {
      id,
      data,
    }: {
      id: number;
      data: CompanyPayload;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.patch(`/companies/${id}/`, data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to update company",
      );
    }
  },
);

// DELETE COMPANY

export const deleteCompany = createAsyncThunk(
  "companies/deleteCompany",

  async (companyId: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/companies/${companyId}/`);

      return companyId;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to delete company",
      );
    }
  },
);

// IMPORT COMPANIES FROM CSV

export const importCompanies = createAsyncThunk<
  CompanyImportResponse,
  File,
  {
    rejectValue: any;
  }
>(
  "companies/importCompanies",

  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await axiosInstance.post("/companies/import/", formData);

      return response.data;
    } catch (error: any) {
      console.error("Company import error:", error);

      return rejectWithValue(
        error?.response?.data || error?.message || "Failed to import companies",
      );
    }
  },
);

// SLICE

const companySlice = createSlice({
  name: "companies",

  initialState,

  reducers: {
    // CLEAR SELECTED COMPANY

    clearSelectedCompany: (state) => {
      state.selectedCompany = null;
      state.detailError = null;
    },

    // CLEAR ERRORS

    clearCompanyErrors: (state) => {
      state.error = null;
      state.detailError = null;
      state.saveError = null;
      state.deleteError = null;
      state.importError = null;
    },
  },

  extraReducers: (builder) => {
    // FETCH COMPANIES

    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const data = action.payload as CompanyListResponse | Company[];

        // PAGINATED RESPONSE

        if (!Array.isArray(data) && Array.isArray(data.results)) {
          state.companies = data.results;

          state.totalCompanies = Number(data.count) || 0;

          state.nextPage = data.next;

          state.previousPage = data.previous;

          const pageSize = data.results.length > 0 ? data.results.length : 10;

          state.totalPages = Math.max(1, Math.ceil(data.count / pageSize));

          if (data.previous) {
            const match = data.previous.match(/[?&]page=(\d+)/);

            state.currentPage = match ? Number(match[1]) + 1 : 1;
          } else {
            state.currentPage = 1;
          }

          return;
        }

        // NON-PAGINATED RESPONSE

        if (Array.isArray(data)) {
          state.companies = data;

          state.totalCompanies = data.length;

          state.totalPages = 1;

          state.currentPage = 1;

          state.nextPage = null;

          state.previousPage = null;

          return;
        }

        // INVALID RESPONSE

        state.companies = [];
        state.totalCompanies = 0;
        state.totalPages = 1;
        state.currentPage = 1;
        state.nextPage = null;
        state.previousPage = null;
      })

      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch companies";

        state.companies = [];
        state.totalCompanies = 0;
      });

    // FETCH COMPANY BY ID

    builder
      .addCase(fetchCompanyById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })

      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detailError = null;

        const company = action.payload as Company;

        state.selectedCompany = company;

        const index = state.companies.findIndex(
          (item) => item.id === company.id,
        );

        if (index !== -1) {
          state.companies[index] = company;
        }
      })

      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.detailLoading = false;

        state.detailError = action.payload || "Failed to fetch company";
      });

    // CREATE COMPANY

    builder
      .addCase(createCompany.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })

      .addCase(createCompany.fulfilled, (state, action) => {
        state.saving = false;
        state.saveError = null;

        const company = action.payload as Company;

        if (company) {
          state.companies.unshift(company);

          state.totalCompanies += 1;
        }
      })

      .addCase(createCompany.rejected, (state, action) => {
        state.saving = false;

        state.saveError = action.payload || "Failed to create company";
      });

    // UPDATE COMPANY

    builder
      .addCase(updateCompany.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })

      .addCase(updateCompany.fulfilled, (state, action) => {
        state.saving = false;
        state.saveError = null;

        const updatedCompany = action.payload as Company;

        if (!updatedCompany) {
          return;
        }

        const index = state.companies.findIndex(
          (company) => company.id === updatedCompany.id,
        );

        if (index !== -1) {
          state.companies[index] = updatedCompany;
        }

        if (state.selectedCompany?.id === updatedCompany.id) {
          state.selectedCompany = updatedCompany;
        }
      })

      .addCase(updateCompany.rejected, (state, action) => {
        state.saving = false;

        state.saveError = action.payload || "Failed to update company";
      });

    // DELETE COMPANY

    builder
      .addCase(deleteCompany.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })

      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.deleting = false;
        state.deleteError = null;

        const deletedId = action.payload;

        state.companies = state.companies.filter(
          (company) => company.id !== deletedId,
        );

        state.totalCompanies = Math.max(0, state.totalCompanies - 1);

        if (state.selectedCompany?.id === deletedId) {
          state.selectedCompany = null;
        }
      })

      .addCase(deleteCompany.rejected, (state, action) => {
        state.deleting = false;

        state.deleteError = action.payload || "Failed to delete company";
      });

    // IMPORT COMPANIES

    builder
      .addCase(importCompanies.pending, (state) => {
        state.importing = true;
        state.importError = null;
      })

      .addCase(importCompanies.fulfilled, (state) => {
        state.importing = false;
        state.importError = null;
      })

      .addCase(importCompanies.rejected, (state, action) => {
        state.importing = false;

        state.importError = action.payload || "Failed to import companies";
      });
  },
});

// ACTIONS

export const { clearSelectedCompany, clearCompanyErrors } =
  companySlice.actions;

// REDUCER

export default companySlice.reducer;
