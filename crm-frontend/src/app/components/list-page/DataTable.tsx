"use client";

import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { useRouter } from "next/navigation";

interface DataTableProps {
  rows: any[];
  columns: any[];
  rowLink?: string;
}

export default function DataTable({ rows, columns, rowLink }: DataTableProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        overflowX: "auto",
        pt: 1,
        px: 0,
        pb: 0,
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        hideFooterPagination
        rowHeight={52}
        columnHeaderHeight={56}
        onRowClick={(params) => {
          if (rowLink) {
            router.push(`${rowLink}/${params.row.id}`);
          }
        }}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,

          "& .MuiDataGrid-row": {
            cursor: "pointer",
          },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "primary.main",
          },

          "& .MuiDataGrid-columnHeader": {
            bgcolor: "primary.main",
            color: "primary.contrastText",
          },

          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
          },

          "& .MuiDataGrid-cell": {
            color: "text.primary",
            borderColor: "divider",
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: "grey.50",
          },

          "& .MuiCheckbox-root": {
            color: "grey.500",
          },

          "& .Mui-checked": {
            color: "primary.main !important",
          },
        }}
      />
    </Box>
  );
}
