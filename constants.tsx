
import { Category, Project, Service, ArchiveItem } from './types';

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
  },
  {
    id: 'ODM-PRJ-2004-003',
    title: 'CINEMATIC FILM CAMPAIGN',
    category: Category.FILM,
    date: '2004-04-01',
    description: 'Atmospheric high-speed film production for luxury automotive brand.',
    imageUrls: ['https://picsum.photos/seed/odemind3/800/600'],
    client: 'ZENITH MOTORS',
    status: 'IN_PROGRESS'
  },
  {
    id: 'ODM-PRJ-2003-098',
    title: 'DIGITAL CONTENT STRATEGY',
    category: Category.CONTENT,
    date: '2003-11-20',
    description: 'Social media storytelling and content architecture for fashion label.',
    imageUrls: ['https://picsum.photos/seed/odemind4/800/600'],
    client: 'MONO LABEL',
    status: 'COMPLETED'
  }
];

export const INITIAL_ARCHIVE: ArchiveItem[] = [
  { id: '1', year: '2015 - Present', company: 'Le Labo', category: 'Retail, Beauty', project: 'Ecommerce & Photography', imageUrl: 'https://picsum.photos/seed/lelabo/400/600' },
  { id: '2', year: '2019 - Present', company: 'Huckberry', category: 'Retail, Apparel', project: 'Headless Ecommerce Launch', imageUrl: 'https://picsum.photos/seed/huckberry/400/600' },
  { id: '3', year: '2024 - Present', company: 'Filson', category: 'Retail, Apparel', project: 'Ecommerce Relaunch', imageUrl: 'https://picsum.photos/seed/filson/400/600' },
  { id: '4', year: '2024 - Present', company: 'Shinola', category: 'Retail, Accessories', project: 'Ecommerce Relaunch', imageUrl: 'https://picsum.photos/seed/shinola/400/600' },
  { id: '5', year: '2025 - Present', company: 'Heath Ceramics', category: 'Retail, Home', project: 'Ecommerce Redesign', imageUrl: 'https://picsum.photos/seed/heath/400/600' },
  { id: '6', year: '2018', company: 'Moscot', category: 'Retail, Apparel', project: 'Art Direction & Photography', imageUrl: 'https://images.unsplash.com/photo-1503910397258-41d3e21aa51e?q=80&w=400&h=600&auto=format&fit=crop' },
  { id: '7', year: '2023 - 2024', company: 'Rishi Tea', category: 'Retail, Food & Beverage', project: 'Shopify Replatform', imageUrl: 'https://picsum.photos/seed/rishi/400/600' },
  { id: '8', year: '2024', company: 'Raaka Chocolate', category: 'Retail, Food & Beverage', project: 'Ecommerce Relaunch', imageUrl: 'https://picsum.photos/seed/raaka/400/600' },
  { id: '9', year: '2021 - 2023', company: 'East Fork', category: 'Retail, Home', project: 'Headless Ecommerce', imageUrl: 'https://picsum.photos/seed/eastfork/400/600' },
  { id: '10', year: '2023 - Present', company: 'Jacobsen Salt Co.', category: 'Retail, Food', project: 'Art Direction', imageUrl: 'https://picsum.photos/seed/jacobsen/400/600' }
];

export const INITIAL_SERVICES: Service[] = [
  { id: 'S-01', number: '01', title: 'CONTENT ARCHITECTURE', description: 'Optimizing brand positioning through strategic planning that evolves with the times.' },
  { id: 'S-02', number: '02', title: 'BRANDING SYSTEMS', description: 'Mastering brand positioning through strategic planning and evolved visual identity' },
  { id: 'S-03', number: '03', title: 'SPATIAL EXPERIENCE', description: 'Crafting experiences through branding, space planning, and design.' },
  { id: 'S-04', number: '04', title: 'FILM PRODUCTION', description: 'Optimized for film production, including AI and short-form content creation.' }
];
