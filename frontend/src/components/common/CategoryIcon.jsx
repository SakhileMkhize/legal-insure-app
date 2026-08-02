import GroupsIcon from "@mui/icons-material/Groups";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BalanceIcon from "@mui/icons-material/Balance";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import DescriptionIcon from "@mui/icons-material/Description";
import GavelIcon from "@mui/icons-material/Gavel";

const ICONS = {
    GroupsIcon,
    ShoppingCartIcon,
    BalanceIcon,
    HomeWorkIcon,
    DescriptionIcon,
    GavelIcon,
};

export function CategoryIcon({ name, ...props }) {
    const Icon = ICONS[name] ?? GavelIcon;
    return <Icon {...props} />;
}
