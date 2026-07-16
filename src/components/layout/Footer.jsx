import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import { NavLink } from "react-router";
import GavelIcon from "@mui/icons-material/Gavel";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";

const COLUMNS = [
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Product",
    links: [
      { label: "Plans & Pricing", to: "/plans" },
      { label: "Get Covered", to: "/signup" },
      { label: "Client Login", to: "/login" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", to: "/contact" },
      { label: "Privacy Policy", to: "/contact" },
      { label: "Policy Wording", to: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "primary.main", color: "primary.contrastText", mt: "auto" }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ maxWidth: 320 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
              <GavelIcon sx={{ color: "secondary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                LegalInsure
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
              Affordable legal guidance, document automation, and legal expense
              cover for everyday South Africans.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton size="small" aria-label="Facebook" sx={{ color: "rgba(255,255,255,0.8)" }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="Twitter" sx={{ color: "rgba(255,255,255,0.8)" }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="LinkedIn" sx={{ color: "rgba(255,255,255,0.8)" }}>
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="Instagram" sx={{ color: "rgba(255,255,255,0.8)" }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {COLUMNS.map((column) => (
              <Box key={column.heading}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {column.heading}
                </Typography>
                <Stack spacing={1}>
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      component={NavLink}
                      to={link.to}
                      underline="hover"
                      sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Box>
            ))}

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Contact
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                  0800 123 456
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                  support@legalinsure.co.za
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                  Cape Town, South Africa
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.15)" }} />

        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
          © {new Date().getFullYear()} LegalInsure. All rights reserved. Legal
          insurance products are subject to policy terms and conditions.
        </Typography>
      </Container>
    </Box>
  );
}
