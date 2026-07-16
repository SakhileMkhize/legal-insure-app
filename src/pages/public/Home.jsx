import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import GavelIcon from "@mui/icons-material/Gavel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { COVER_CATEGORIES } from "../../data/coverCategories";
import { CategoryIcon } from "../../components/common/CategoryIcon";
import { PlanCard } from "../../components/common/PlanCard";
import * as policyService from "../../services/policyService";
import "../../App.css";

const VALUE_PROPS = [
  { icon: <GavelIcon />, title: "Real Legal Cover", body: "Legal expense cover for labour, consumer, civil, and property disputes." },
  { icon: <AccessTimeIcon />, title: "Always Available", body: "24/7 AI legal guidance, so you know your rights before you act." },
  { icon: <SupportAgentIcon />, title: "Human Lawyers", body: "Escalate to a qualified attorney whenever you need one." },
  { icon: <VerifiedUserIcon />, title: "Trusted Protection", body: "Transparent plans with no hidden exclusions or surprise costs." },
];

const TESTIMONIALS = [
  { name: "Thandeka M.", quote: "I got advice on an unfair dismissal within minutes instead of waiting weeks for an attorney." },
  { name: "Johan v.d.M.", quote: "The document templates alone are worth the monthly premium." },
  { name: "Naledi K.", quote: "My Ultimate plan covered a property dispute that would have cost me a fortune privately." },
];

export function Home() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    policyService
      .listPlans()
      .then(setPlans)
      .catch(() => setError("We couldn't load our plans right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Box className="hero-band" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 640 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, mb: 2 }}>
              Legal protection for life's disputes
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, color: "rgba(255,255,255,0.85)" }}>
              AI-powered legal guidance, document automation, and lawyer access
              , plus legal expense cover when things escalate.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="contained" color="secondary" size="large" onClick={() => navigate("/signup")}>
                Get Covered
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
                onClick={() => navigate("/plans")}
              >
                See Plans
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" sx={{ mb: 1 }}>
          Why legal cover matters
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 5, maxWidth: 640, mx: "auto" }}>
          A single consultation with an attorney can cost more than months of
          legal cover premiums.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
          {VALUE_PROPS.map((item) => (
            <Card key={item.title} variant="outlined" sx={{ flex: "1 1 220px", maxWidth: 260 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar sx={{ bgcolor: "primary.main", color: "secondary.main", mx: "auto", mb: 1.5 }}>
                  {item.icon}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.body}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: "background.paper", py: 8, borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ mb: 5 }}>
            Cover across every dispute category
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
            {COVER_CATEGORIES.map((category) => (
              <Card key={category.id} variant="outlined" sx={{ flex: "1 1 260px", maxWidth: 300 }}>
                <CardContent sx={{ display: "flex", gap: 2 }}>
                  <CategoryIcon name={category.icon} color="primary" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
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
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center" sx={{ mb: 5 }}>
          Choose your plan
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} compact />
            ))}
          </Box>
        )}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button variant="text" onClick={() => navigate("/plans")}>
            Compare all plan features
          </Button>
        </Box>
      </Container>

      <Box sx={{ bgcolor: "background.paper", py: 8, borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ mb: 5 }}>
            Trusted by our members
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
            {TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.name} variant="outlined" sx={{ flex: "1 1 280px", maxWidth: 340 }}>
                <CardContent>
                  <FormatQuoteIcon color="secondary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {testimonial.quote}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {testimonial.name}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      <Box className="cta-band" sx={{ py: 8 }}>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Before you sign anything, consult your legal cover.
          </Typography>
          <Button variant="contained" size="large" sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }} onClick={() => navigate("/signup")}>
            Get Covered Today
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
