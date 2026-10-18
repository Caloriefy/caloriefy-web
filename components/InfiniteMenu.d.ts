import type { ComponentType, CSSProperties, ReactNode } from "react";

export type InfiniteMenuItem = {
  image: string;
  title?: string;
  description?: string;
  link?: string;
};

export type InfiniteMenuProps = {
  items?: InfiniteMenuItem[];
  count?: number;
  tileSize?: number;
  roundness?: number;
  zoom?: number;
  pullBack?: number;
  stretch?: number;
  inertia?: number;
  autoplay?: number;
  grayscale?: boolean;
  dim?: number;
  intro?: boolean;
  showInfo?: boolean;
  renderInfo?: (item: InfiniteMenuItem, index: number, moving: boolean) => ReactNode;
  theme?: "dark" | "light";
  accentColor?: string;
  backgroundColor?: string;
  onActiveChange?: (item: InfiniteMenuItem, index: number) => void;
  onItemClick?: (item: InfiniteMenuItem, index: number) => void;
  className?: string;
  style?: CSSProperties;
};

/** React Bits component (see ./InfiniteMenu.jsx). */
declare const InfiniteMenu: ComponentType<InfiniteMenuProps>;
export default InfiniteMenu;
