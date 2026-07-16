import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { COVER_CATEGORIES } from "../../data/coverCategories";
import { CategoryIcon } from "../../components/common/CategoryIcon";

const STEPS = [
  "Choose your plan",
  "Get AI guidance & documents",
  "Consult a lawyer (Premium & Ultimate)",
  "File a legal expense claim (Ultimate)",
];

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 2 }}>
          How It Works
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mx: "auto" }}>
          From your first question to full legal representation , here's how
          LegalInsure supports you at every stage of a dispute.
        </Typography>
      </Box>

      <Stepper activeStep={-1} alternativeLabel sx={{ mb: 8 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Typography variant="h4" align="center" sx={{ mb: 5 }}>
        What's covered, in detail
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center", mb: 8 }}>
        {COVER_CATEGORIES.map((category) => (
          <Card key={category.id} variant="outlined" sx={{ flex: "1 1 300px", maxWidth: 340 }}>
            <CardContent sx={{ display: "flex", gap: 2 }}>
              <CategoryIcon name={category.icon} color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {category.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ textAlign: "center" }}>
        <Button variant="contained" color="secondary" size="large" onClick={() => navigate("/signup")}>
          Get Covered
        </Button>
      </Box>
    </Container>
  );
}
