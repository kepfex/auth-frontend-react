
export interface SubMenuItem {
  id: string;
  label: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  items?: SubMenuItem[];
}

export interface MenuGroup {
  groupTitle: string;
  items: MenuItem[];
}