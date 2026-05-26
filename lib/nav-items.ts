import {
  BookOpen,
  Bot,
  FileWarning,
  Gauge,
  Info,
  Medal,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { NavItem } from "@/lib/types";

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: Gauge },
  { title: "Arc Primitives", href: "/arc-primitives", icon: Sparkles },
  { title: "Agents", href: "/agents", icon: Bot },
  { title: "Register Agent", href: "/register", icon: UserPlus },
  { title: "Violations", href: "/violations", icon: FileWarning },
  { title: "Leaderboards", href: "/leaderboards", icon: Medal },
  { title: "About", href: "/about", icon: Info },
  { title: "Docs", href: "/docs", icon: BookOpen },
];
