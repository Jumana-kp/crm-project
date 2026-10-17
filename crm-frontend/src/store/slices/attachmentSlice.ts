import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/api/axios";
export interface Attachment {
  id: number;
  file: string;
  file_name: string;
  file_size: number | null;
  created_by: number | null;
  lead: number | null;
  deal: number | null;
  company: number | null;
  ticket: number | null;
  created_at: string;
  updated_at: string;
}

interface AttachmentState {
  attachments: Attachment[];
  loading: boolean;
  error: string | null;
}

const initialState: AttachmentState = {
  attachments: [],
  loading: false,
  error: null,
};
/*=========================================
create 
*/
export const fetchAttachments = createAsyncThunk(
  "attachments/fetchAttachments",
  async (
    {
      type,
      id,
    }: {
      type: "lead" | "deal" | "company" | "ticket";
      id: number;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("Fetching attachments:");
      console.log("Type:", type);
      console.log("ID:", id);

      const response = await api.get("/attachments/", {
        params: {
          [type]: id,
        },
      });

      console.log("Attachment API response:", response.data);

      return response.data.results ?? response.data;
    } catch (error: any) {
      console.error("Attachment API error:", error.response?.data);

      return rejectWithValue(
        error.response?.data || "Failed to fetch attachments"
      );
    }
   
  }
);

export const uploadAttachment = createAsyncThunk(
  "attachments/uploadAttachment",
  async (
    {
      file,
      type,
      id,
    }: {
      file: File;
      type: "lead" | "deal" | "company" | "ticket";
      id: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append(type, String(id));

      console.log("========== ATTACHMENT UPLOAD ==========");
      console.log("file:", file);
      console.log("type:", type);
      console.log("id:", id);

      for (const [key, value] of formData.entries()) {
        console.log("FormData:", key, value);
      }

      const response = await api.post(
        "/attachments/",
        formData
      );

      console.log("========== UPLOAD SUCCESS ==========");
      console.log("Response:", response.data);

      return response.data;

    } catch (error: any) {
      console.log("========== ATTACHMENT UPLOAD FAILED ==========");

      console.log("ERROR OBJECT:", error);
      console.log("ERROR MESSAGE:", error?.message);
      console.log("ERROR CODE:", error?.code);
      console.log("HTTP STATUS:", error?.response?.status);
      console.log("SERVER RESPONSE:", error?.response?.data);
      console.log("SERVER HEADERS:", error?.response?.headers);

      return rejectWithValue(
        error?.response?.data || "Attachment upload failed"
      );
    }
  }
);
// ===========Slice==============
const attachmentSlice = createSlice({
  name: "attachments",
  initialState,
  reducers: {
    clearAttachments: (state) => {
      state.attachments = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // GET
      .addCase(fetchAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAttachments.fulfilled, (state, action) => {
        state.loading = false;
        state.attachments = action.payload;
      })

      .addCase(fetchAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // POST
      .addCase(uploadAttachment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(uploadAttachment.fulfilled, (state, action) => {
        state.loading = false;

        state.attachments.unshift(action.payload);
      })

      .addCase(uploadAttachment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAttachments } = attachmentSlice.actions;

export default attachmentSlice.reducer;