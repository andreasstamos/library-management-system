import { Container, TextField } from "@mui/material";

export default function SearchBar() {
  return (
    <>
      <Container>
        <TextField
          id="standard-search"
          label="Search field"
          type="search"
          variant="standard"
          sx={{ width: 400 }}
        />
      </Container>
    </>
  );
}
