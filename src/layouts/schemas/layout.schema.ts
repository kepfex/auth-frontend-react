
export interface SubMenuItem {
  id: string;
  label: string;
  path?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  items?: SubMenuItem[];
}

export interface MenuGroup {
  groupTitle: string;
  items: MenuItem[];
}