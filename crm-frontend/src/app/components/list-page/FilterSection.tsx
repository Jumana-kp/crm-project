// "use client";

// import { useState } from "react";

// import {
//   Box,
//   IconButton,
//   MenuItem,
//   Select,
// } from "@mui/material";

// import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

// import {
//   DatePicker,
//   LocalizationProvider,
// } from "@mui/x-date-pickers";

// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// import dayjs, { Dayjs } from "dayjs";

// // =====================================================
// // TYPES
// // =====================================================

// export type FilterOption = {
//   label: string;
//   value: string;
// };

// export type Filter = {
//   field: string;
//   label: string;
//   options?: FilterOption[];
//   type: "select" | "date";
// };

// type FilterSectionProps = {
//   filters: Filter[];
//   values: Record<string, string>;
//   onChange: (field: string, value: string) => void;
// };

// // =====================================================
// // COMPONENT
// // =====================================================

// export default function FilterSection({
//   filters = [],
//   values = {},
//   onChange,
// }: FilterSectionProps) {
//   const [mobileDateOpen, setMobileDateOpen] =
//     useState(false);

//   const [mobileDateField, setMobileDateField] =
//     useState("");

//   // ===================================================
//   // STYLES
//   // ===================================================

//   const textStyle = {
//     fontFamily: "Inter",
//     fontWeight: 500,
//     fontSize: "16px",
//     lineHeight: "24px",
//     color: "#767676",
//   };

//   const selectStyle = {
//     width: 180,
//     height: 40,
//     bgcolor: "background.paper",

//     "& .MuiOutlinedInput-notchedOutline": {
//       borderColor: "divider",
//     },

//     "&:hover .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#5B4DDE !important",
//     },

//     "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#5B4DDE !important",
//       borderWidth: 1,
//     },

//     "& .MuiSelect-select": {
//       ...textStyle,
//       display: "flex",
//       alignItems: "center",
//       boxSizing: "border-box",
//       height: "40px",
//     },

//     "& .MuiSvgIcon-root": {
//       color: "#767676",
//     },
//   };

//   const datePickerStyle = {
//     width: 180,

//     "& .MuiInputLabel-root": {
//       fontFamily: "Inter",
//       fontWeight: 500,
//       fontSize: "16px",
//       lineHeight: "24px",
//       color: "#767676",
//     },

//     "& .MuiInputLabel-root.Mui-focused": {
//       color: "#5B4DDE",
//     },

//     "& .MuiOutlinedInput-root": {
//       height: 40,
//       bgcolor: "background.paper",

//       "& .MuiOutlinedInput-notchedOutline": {
//         borderColor: "divider",
//       },

//       "&:hover .MuiOutlinedInput-notchedOutline": {
//         borderColor: "#5B4DDE !important",
//       },

//       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//         borderColor: "#5B4DDE !important",
//         borderWidth: 1,
//       },
//     },

//     "& .MuiInputBase-input": {
//       ...textStyle,
//     },

//     "& .MuiSvgIcon-root": {
//       color: "#767676",
//     },
//   };

//   // ===================================================
//   // DATE CHANGE
//   // ===================================================

//   const handleDateChange = (
//     field: string,
//     date: Dayjs | null,
//   ) => {
//     if (!date || !date.isValid()) {
//       onChange(field, "");
//       return;
//     }

//     onChange(
//       field,
//       date.format("YYYY-MM-DD"),
//     );
//   };

//   // ===================================================
//   // MOBILE DATE
//   // ===================================================

//   const openMobileDate = (
//     field: string,
//   ) => {
//     setMobileDateField(field);
//     setMobileDateOpen(true);
//   };

//   const closeMobileDate = () => {
//     setMobileDateOpen(false);
//     setMobileDateField("");
//   };

//   // ===================================================
//   // CLEAR SELECT FILTER
//   // ===================================================

//   const handleSelectChange = (
//     field: string,
//     value: string,
//   ) => {
//     onChange(field, value);
//   };

//   // ===================================================
//   // RENDER
//   // ===================================================

//   return (
//     <LocalizationProvider
//       dateAdapter={AdapterDayjs}
//     >
//       <Box
//         sx={{
//           width: "100%",
//           display: "flex",
//           flexDirection: "row",
//           alignItems: "center",
//           gap: 2,

//           overflowX: {
//             xs: "auto",
//             sm: "visible",
//           },

//           flexWrap: {
//             xs: "nowrap",
//             sm: "wrap",
//           },

//           pb: {
//             xs: 1,
//             sm: 0,
//           },

//           "&::-webkit-scrollbar": {
//             display: "none",
//           },
//         }}
//       >
//         {filters.map((filter, filterIndex) => {
//           // =================================================
//           // DATE FILTER
//           // =================================================

//           if (filter.type === "date") {
//             const selectedDate =
//               values[filter.field]
//                 ? dayjs(
//                     values[filter.field],
//                   )
//                 : null;

//             return (
//               <Box
//                 key={`date-filter-${filter.field}-${filterIndex}`}
//               >
//                 {/* DESKTOP DATE PICKER */}

//                 <Box
//                   sx={{
//                     display: {
//                       xs: "none",
//                       sm: "block",
//                     },
//                   }}
//                 >
//                   <DatePicker
//                     value={selectedDate}
//                     onChange={(newDate) =>
//                       handleDateChange(
//                         filter.field,
//                         newDate,
//                       )
//                     }
//                     format="DD/MM/YYYY"
//                     slots={{
//                       openPickerIcon:
//                         CalendarMonthOutlinedIcon,
//                     }}
//                     slotProps={{
//                       textField: {
//                         label: filter.label,
//                         size: "small",
//                         sx: datePickerStyle,
//                       },
//                     }}
//                   />
//                 </Box>

//                 {/* MOBILE DATE BUTTON */}

//                 <Box
//                   sx={{
//                     display: {
//                       xs: "flex",
//                       sm: "none",
//                     },

//                     width: 40,
//                     height: 40,

//                     border:
//                       "1px solid",

//                     borderColor:
//                       "divider",

//                     borderRadius:
//                       "8px",

//                     alignItems:
//                       "center",

//                     justifyContent:
//                       "center",
//                   }}
//                 >
//                   <IconButton
//                     onClick={() =>
//                       openMobileDate(
//                         filter.field,
//                       )
//                     }
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       borderRadius:
//                         "8px",
//                     }}
//                   >
//                     <CalendarMonthOutlinedIcon
//                       sx={{
//                         color:
//                           "#767676",
//                         fontSize: 22,
//                       }}
//                     />
//                   </IconButton>
//                 </Box>

//                 {/* MOBILE DATE PICKER */}

//                 <DatePicker
//                   open={
//                     mobileDateOpen &&
//                     mobileDateField ===
//                       filter.field
//                   }
//                   onClose={
//                     closeMobileDate
//                   }
//                   value={
//                     selectedDate
//                   }
//                   onChange={(
//                     newDate,
//                   ) => {
//                     handleDateChange(
//                       filter.field,
//                       newDate,
//                     );

//                     closeMobileDate();
//                   }}
//                   format="DD/MM/YYYY"
//                   slotProps={{
//                     textField: {
//                       sx: {
//                         display:
//                           "none",
//                       },
//                     },

//                     popper: {
//                       sx: {
//                         zIndex: 3000,
//                       },
//                     },
//                   }}
//                 />
//               </Box>
//             );
//           }

//           // =================================================
//           // SELECT FILTER
//           // =================================================

//           return (
//             <Select
//               key={`select-filter-${filter.field}-${filterIndex}`}
//               value={
//                 values[
//                   filter.field
//                 ] || ""
//               }
//               displayEmpty
//               size="small"
//               sx={selectStyle}
//               onChange={(event) => {
//                 handleSelectChange(
//                   filter.field,
//                   event.target.value,
//                 );
//               }}
//             >
//               {/* DEFAULT */}

//               <MenuItem
//                 value=""
//                 key={`default-${filter.field}-${filterIndex}`}
//               >
//                 {filter.label}
//               </MenuItem>

//               {/* OPTIONS */}

//               {(filter.options || []).map(
//                 (
//                   option,
//                   optionIndex,
//                 ) => (
//                   <MenuItem
//                     key={`${filter.field}-${option.value}-${optionIndex}`}
//                     value={
//                       option.value
//                     }
//                   >
//                     {
//                       option.label
//                     }
//                   </MenuItem>
//                 ),
//               )}
//             </Select>
//           );
//         })}
//       </Box>
//     </LocalizationProvider>
//   );
// }
"use client";

import { useState } from "react";

import { Box, IconButton, MenuItem, Select } from "@mui/material";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs, { Dayjs } from "dayjs";

// =====================================================
// TYPES
// =====================================================

export type FilterOption = {
  label: string;
  value: string;
};

export type Filter = {
  field: string;
  label: string;
  options?: FilterOption[];
  type: "select" | "date";
};

type FilterSectionProps = {
  filters: Filter[];
  values: Record<string, string>;
  onChange: (field: string, value: string) => void;
};

// =====================================================
// COMPONENT
// =====================================================

export default function FilterSection({
  filters = [],
  values = {},
  onChange,
}: FilterSectionProps) {
  const [mobileDateOpen, setMobileDateOpen] = useState(false);

  const [mobileDateField, setMobileDateField] = useState("");

  // ===================================================
  // STYLES
  // ===================================================

  const textStyle = {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "24px",
    color: "#767676",
  };

  const selectStyle = {
    width: 180,
    height: 40,
    bgcolor: "background.paper",

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "divider",
    },

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#5B4DDE !important",
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#5B4DDE !important",
      borderWidth: 1,
    },

    "& .MuiSelect-select": {
      ...textStyle,
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box",
      height: "40px",
    },

    "& .MuiSvgIcon-root": {
      color: "#767676",
    },
  };

  const datePickerStyle = {
    width: 180,

    "& .MuiInputLabel-root": {
      fontFamily: "Inter",
      fontWeight: 500,
      fontSize: "16px",
      lineHeight: "24px",
      color: "#767676",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "#5B4DDE",
    },

    "& .MuiOutlinedInput-root": {
      height: 40,
      bgcolor: "background.paper",

      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "divider",
      },

      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#5B4DDE !important",
      },

      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#5B4DDE !important",
        borderWidth: 1,
      },
    },

    "& .MuiInputBase-input": {
      ...textStyle,
    },

    "& .MuiSvgIcon-root": {
      color: "#767676",
    },
  };

  // ===================================================
  // DATE CHANGE
  // ===================================================

  const handleDateChange = (field: string, date: Dayjs | null) => {
    if (!date || !date.isValid()) {
      onChange(field, "");
      return;
    }

    onChange(field, date.format("YYYY-MM-DD"));
  };

  // ===================================================
  // MOBILE DATE
  // ===================================================

  const openMobileDate = (field: string) => {
    setMobileDateField(field);
    setMobileDateOpen(true);
  };

  const closeMobileDate = () => {
    setMobileDateOpen(false);
    setMobileDateField("");
  };

  // ===================================================
  // SELECT CHANGE
  // ===================================================

  const handleSelectChange = (field: string, value: string) => {
    onChange(field, value);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 2,

          overflowX: {
            xs: "auto",
            sm: "visible",
          },

          flexWrap: {
            xs: "nowrap",
            sm: "wrap",
          },

          pb: {
            xs: 1,
            sm: 0,
          },

          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {filters.map((filter, filterIndex) => {
          // =================================================
          // DATE FILTER
          // =================================================

          if (filter.type === "date") {
            const selectedDate = values[filter.field]
              ? dayjs(values[filter.field])
              : null;

            return (
              <Box key={`date-filter-${filter.field}-${filterIndex}`}>
                {/* DESKTOP DATE PICKER */}

                <Box
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                  }}
                >
                  <DatePicker
                    value={selectedDate}
                    onChange={(newDate) =>
                      handleDateChange(filter.field, newDate)
                    }
                    format="DD/MM/YYYY"
                    slots={{
                      openPickerIcon: CalendarMonthOutlinedIcon,
                    }}
                    slotProps={{
                      textField: {
                        label: filter.label,
                        size: "small",
                        sx: datePickerStyle,
                      },
                    }}
                  />
                </Box>

                {/* MOBILE DATE BUTTON */}

                <Box
                  sx={{
                    display: {
                      xs: "flex",
                      sm: "none",
                    },

                    width: 40,
                    height: 40,

                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",

                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    onClick={() => openMobileDate(filter.field)}
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                    }}
                  >
                    <CalendarMonthOutlinedIcon
                      sx={{
                        color: "#767676",
                        fontSize: 22,
                      }}
                    />
                  </IconButton>
                </Box>

                {/* MOBILE DATE PICKER */}

                <DatePicker
                  open={mobileDateOpen && mobileDateField === filter.field}
                  onClose={closeMobileDate}
                  value={selectedDate}
                  onChange={(newDate) => {
                    handleDateChange(filter.field, newDate);

                    closeMobileDate();
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      sx: {
                        display: "none",
                      },
                    },

                    popper: {
                      sx: {
                        zIndex: 3000,
                      },
                    },
                  }}
                />
              </Box>
            );
          }

          // =================================================
          // SELECT FILTER
          // =================================================

          return (
            <Select
              key={`select-filter-${filter.field}-${filterIndex}`}
              value={values[filter.field] || ""}
              displayEmpty
              size="small"
              sx={selectStyle}
              onChange={(event) => {
                handleSelectChange(filter.field, event.target.value);
              }}
            >
              {/* DEFAULT */}

              <MenuItem value="">{filter.label}</MenuItem>

              {/* OPTIONS */}

              {(filter.options || []).map((option) => (
                <MenuItem
                  key={`${filter.field}-${option.value}`}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          );
        })}
      </Box>
    </LocalizationProvider>
  );
}
