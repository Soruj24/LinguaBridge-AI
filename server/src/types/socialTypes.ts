export interface SocialUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface SocialLoginBody {
  provider: "google" | "github" | "facebook";
  providerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  username?: string;
}

export interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  children: CategoryTreeNode[] | undefined
}
