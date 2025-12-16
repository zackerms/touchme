export interface Profile {
  id: string;
  name: string;
  imageUrl: string;
  links: {
    twitter?: string;
    github?: string;
    zenn?: string;
  };
}
