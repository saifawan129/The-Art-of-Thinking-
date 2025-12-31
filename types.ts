
export interface SkateboardState {
  exploded: boolean;
  hoveredPart: string | null;
  rotating: boolean;
  activeSection: string | null;
}

export interface MenuItem {
  id: string;
  label: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: '01', label: 'STRUCTURAL SHIFT' },
  { id: '02', label: 'DECONSTRUCTION' },
  { id: '03', label: 'DESIGN & COLOR' },
  { id: '04', label: 'GRAFFITI & STYLE' },
];
