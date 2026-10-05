import type { ReactNode } from "react";
import Icon from "./Icon";
import type { IconName } from "../../types";

export default function Button({
  children,
  variant = "secondary",
  icon,
  onClick,
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  icon?: IconName;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button className={`button ${variant} ${className}`} onClick={onClick}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
