import React, { useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from "@apollo/client";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  TextField
} from "@mui/material";

const client = new ApolloClient({
  uri: "https://rickandmortyapi.com/graphql",
  cache: new InMemoryCache(),
});

const GET_CHARACTERS = gql`
  query GetCharacters($page: Int, $filter: FilterCharacter) {
    characters(page: $page, filter: $filter) {
      info {
        count
        pages
        next
        prev
      }
      results {
        id
        name
        status
        species
        gender
        origin {
          name
        }
      }
    }
  }
`;

const translations = {
  en: {
    name: "Name",
    status: "Status",
    species: "Species",
    gender: "Gender",
    origin: "Origin",
    filters: "Filters",
    sortBy: "Sort By",
    language: "Language",
  },
  de: {
    name: "Name",
    status: "Status",
    species: "Spezies",
    gender: "Geschlecht",
    origin: "Herkunft",
    filters: "Filter",
    sortBy: "Sortieren nach",
    language: "Sprache",
  },
};

function CharacterList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [species, setSpecies] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [language, setLanguage] = useState("en");
  const t = translations[language];

  const { loading, error, data } = useQuery(GET_CHARACTERS, {
    variables: {
      page,
      filter: {
        status: status || undefined,
        species: species || undefined,
      },
    },
  });

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const sortedResults = data?.characters?.results.slice().sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "origin") return a.origin.name.localeCompare(b.origin.name);
    return 0;
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error fetching data.</Typography>;

  return (
    <Box p={4}>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={2}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{t.status}</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} label={t.status}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Alive">Alive</MenuItem>
            <MenuItem value="Dead">Dead</MenuItem>
            <MenuItem value="unknown">Unknown</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          {/* <InputLabel htmlFor="species-input">{t.species}</InputLabel> */}
          {/* <input
            id="species-input"
            type="text"
            onChange={(e) => setSpecies(e.target.value)}
            style={{ padding: "8.5px 14px", border: "1px solid #ccc", borderRadius: 4 }}
          /> */}
          <TextField
            label={t.species}
            variant="outlined"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          />
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{t.sortBy}</InputLabel>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label={t.sortBy}>
            <MenuItem value="name">{t.name}</MenuItem>
            <MenuItem value="origin">{t.origin}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={2}>
        {sortedResults?.map((char) => (
          <Card key={char.id}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {char.name}
              </Typography>
              <Typography><strong>{t.status}:</strong> {formatStatus(char.status)}</Typography>
              <Typography><strong>{t.species}:</strong> {char.species}</Typography>
              <Typography><strong>{t.gender}:</strong> {char.gender}</Typography>
              <Typography><strong>{t.origin}:</strong> {char.origin.name}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="contained" disabled={!data.characters.info.prev} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button variant="contained" disabled={!data.characters.info.next} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </Box>

      <Box mt={6} textAlign="center">
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{t.language}</InputLabel>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)} label={t.language}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="de">Deutsch</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <CharacterList />
    </ApolloProvider>
  );
}
