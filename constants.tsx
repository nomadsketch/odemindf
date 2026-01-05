
import { Category, Project, Service, ArchiveItem } from './types.ts';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'ODM-PRJ-2004-001',
    title: 'CYBER-PUNK BRANDING',
    category: Category.BRANDING,
    date: '2004-03-12',
    description: 'Visual identity system for a futuristic tech startup based in Seoul.',
    imageUrls: ['https://picsum.photos/seed/odemind1/800/600'],
    client: 'NEO-SEOUL CO.',
    status: 'COMPLETED'
  },
  {
    id: 'ODM-PRJ-2004-002',
    title: 'URBAN SPACE DESIGN',
    category: Category.SPACE,
    date: '2004-02-15',
    description: 'Minimalist industrial interior design for a flagship concept store.',
    imageUrls: ['https://picsum.photos/seed/odemind2/800/600'],
    client: 'VOID ATELIER',
    status: 'COMPLETED'
  }
];

export const INITIAL_ARCHIVE: ArchiveItem[] = [
  { id: '1', year: '2015 - Present', company: 'Le Labo', category: 'Retail, Beauty', project: 'Ecommerce & Photography', imageUrl: 'https://picsum.photos/seed/lelabo/400/600' },
  { id: '2', year: '2019 - Present', company: 'Huckberry', category: 'Retail, Apparel', project: 'Headless Ecommerce Launch', imageUrl: 'https://picsum.photos/seed/huckberry/400/600' }
];

export const INITIAL_SERVICES: Service[] = [
  { id: 'S-01', number: '01', title: 'CONTENT ARCHITECTURE', description: 'Optimizing brand positioning through strategic planning that evolves with the times.' },
  { id: 'S-02', number: '02', title: 'BRANDING SYSTEMS', description: 'Mastering brand positioning through strategic planning and evolved visual identity' }
];
