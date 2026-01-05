
export enum Category {
  CONTENT = 'CONTENT',
  BRANDING = 'BRANDING',
  SPACE = 'SPACE',
  FILM = 'FILM',
  PERFORMING_ARTS = 'PERFORMING_ARTS'
}

export interface Project {
  id: string;
  title: string;
  category: Category;
  date: string;
  description: string;
  imageUrls: string[];
  client: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ARCHIVED';
}

export interface ArchiveItem {
  id: string;
  year: string;
  company: string;
  category: string;
  project: string;
  imageUrl?: string;
}

export interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface AppState {
  projects: Project[];
  archiveItems: ArchiveItem[];
  services: Service[];
  siteTitle: string;
  tagline: string;
}
