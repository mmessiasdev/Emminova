export interface HomeData {
  id: number;
  title: string;
  desc: string;
  extradesc: string;
  wallpaper: Array<{
    url: string;
    formats: {
      large?: { url: string };
      medium?: { url: string };
      small?: { url: string };
      thumbnail?: { url: string };
    };
  }>;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  thumb: Array<{
    url: string;
    formats: {
      large?: { url: string };
      medium?: { url: string };
      small?: { url: string };
      thumbnail?: { url: string };
    };
  }>;
}

export interface Testimonial {
  id: number;
  name: string;
  company: string;
  comment: string;
  rating: number;
}

export interface LeadData {
  email: string;
  nomeCompleto: string;
  celular: string;
}

export interface Step {
  id: number;
  step_number: number;
  title: string;
  description: string;
  created_by: any;
  updated_by: any;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  link?: string | null;
  order: number;
  image: Array<{
    url: string;
    formats: {
      large?: { url: string };
      medium?: { url: string };
      small?: { url: string };
      thumbnail?: { url: string };
    };
  }>;
  logo?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
    };
  };
}



class ApiService {
  private baseURL = import.meta.env.VITE_APP_APIURL || "http://localhost:1337";

  // Função para construir a URL completa da imagem
  private getImageUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.baseURL}${url}`;
  }

  // Função para processar os dados da home e garantir URLs completas
  private processHomeData(data: any[]): HomeData[] {
    return data.map(item => ({
      ...item,
      wallpaper: item.wallpaper?.map((img: any) => ({
        ...img,
        url: this.getImageUrl(img.url),
        formats: img.formats ? {
          large: img.formats.large ? { ...img.formats.large, url: this.getImageUrl(img.formats.large.url) } : undefined,
          medium: img.formats.medium ? { ...img.formats.medium, url: this.getImageUrl(img.formats.medium.url) } : undefined,
          small: img.formats.small ? { ...img.formats.small, url: this.getImageUrl(img.formats.small.url) } : undefined,
          thumbnail: img.formats.thumbnail ? { ...img.formats.thumbnail, url: this.getImageUrl(img.formats.thumbnail.url) } : undefined,
        } : {}
      })) || []
    }));
  }

  // Função para processar os serviços e garantir URLs completas
  private processServices(data: any[]): Service[] {
    return data.map(item => ({
      ...item,
      thumb: item.thumb?.map((img: any) => ({
        ...img,
        url: this.getImageUrl(img.url),
        formats: img.formats ? {
          large: img.formats.large ? { ...img.formats.large, url: this.getImageUrl(img.formats.large.url) } : undefined,
          medium: img.formats.medium ? { ...img.formats.medium, url: this.getImageUrl(img.formats.medium.url) } : undefined,
          small: img.formats.small ? { ...img.formats.small, url: this.getImageUrl(img.formats.small.url) } : undefined,
          thumbnail: img.formats.thumbnail ? { ...img.formats.thumbnail, url: this.getImageUrl(img.formats.thumbnail.url) } : undefined,
        } : {}
      })) || []
    }));
  }


  async getSteps(): Promise<Step[]> {
    const response = await fetch(`${this.baseURL}/steps`);
    if (!response.ok) {
      throw new Error('Erro ao carregar passos');
    }
    return response.json();
  }

  async getHomeData(): Promise<HomeData[]> {
    const response = await fetch(`${this.baseURL}/homes`);
    if (!response.ok) {
      throw new Error('Erro ao carregar dados da home');
    }
    const data = await response.json();
    return this.processHomeData(data);
  }

  async getServices(): Promise<Service[]> {
    const response = await fetch(`${this.baseURL}/services`);
    if (!response.ok) {
      throw new Error('Erro ao carregar serviços');
    }
    const data = await response.json();
    return this.processServices(data);
  }

  async getTestimonials(): Promise<Testimonial[]> {
    const response = await fetch(`${this.baseURL}/testimonials`);
    if (!response.ok) {
      throw new Error('Erro ao carregar depoimentos');
    }
    return response.json();
  }

  async submitLead(leadData: LeadData): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/lead-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar dados');
    }

    return response.json();
  }


  private processProjects(data: any[]): Project[] {
    return data.map(item => ({
      ...item,
      image: item.image?.map((img: any) => ({
        ...img,
        url: this.getImageUrl(img.url),
        formats: img.formats ? {
          large: img.formats.large ? { ...img.formats.large, url: this.getImageUrl(img.formats.large.url) } : undefined,
          medium: img.formats.medium ? { ...img.formats.medium, url: this.getImageUrl(img.formats.medium.url) } : undefined,
          small: img.formats.small ? { ...img.formats.small, url: this.getImageUrl(img.formats.small.url) } : undefined,
          thumbnail: img.formats.thumbnail ? { ...img.formats.thumbnail, url: this.getImageUrl(img.formats.thumbnail.url) } : undefined,
        } : {}
      })) || [],
      logo: item.logo ? {
        ...item.logo,
        url: this.getImageUrl(item.logo.url),
        formats: item.logo.formats ? {
          thumbnail: item.logo.formats.thumbnail ? { ...item.logo.formats.thumbnail, url: this.getImageUrl(item.logo.formats.thumbnail.url) } : undefined,
        } : {}
      } : undefined
    }));
  }

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${this.baseURL}/projects`);
    if (!response.ok) throw new Error('Erro ao carregar projetos');
    const data = await response.json();
    return this.processProjects(data);
  }
}

export const apiService = new ApiService();