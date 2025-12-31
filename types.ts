
/**
 * Represents the global state of the 3D experience.
 */
export interface AppState {
  exploded: boolean;
  hoveredPart: string | null;
  rotating: boolean;
  activeSection: string | null;
}

/**
 * Navigation item structure for the bottom menu.
 */
export interface MenuItem {
  id: string;
  label: string;
  description: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { 
    id: '01', 
    label: 'STRUCTURAL SHIFT',
    description: 'Reconfiguring vertex coordinates. Transitioning from Icosahedron to Dodecahedron architecture.'
  },
  { 
    id: '02', 
    label: 'DECONSTRUCTION',
    description: 'Core disassembly protocol. Decoupling polygon faces to visualize internal logic flow.'
  },
  { 
    id: '03', 
    label: 'DESIGN & COLOR',
    description: 'Material update. Iridescent metallic shift complete. Focus optimized for charcoal spectrum.'
  },
  { 
    id: '04', 
    label: 'GRAFFITI & STYLE',
    description: 'Heuristic override. Digital tagging applied to central core. High-energy rotation enabled.'
  },
];
