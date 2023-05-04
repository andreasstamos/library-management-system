import { Container, TextField } from "@mui/material";

export default function SearchBar() {
  return (
    <>
        <TextField
          id="standard-search"
          label="Search field"
          type="search"
          variant="standard"
          sx={{ width: 250 }}
        />
    </>
  );
}
