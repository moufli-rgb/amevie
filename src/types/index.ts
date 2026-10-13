export type UserRole = 'member' | 'admin' | 'moderator';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'pending';
}

export interface UserProfile {
  userId: string;
  bio?: string;
  church?: string;
  spiritualCommunity?: string;
  preferredTradition?: SpiritualTradition;
  country: string;
  city: string;
  prayerStreakDays: number;
  lastPrayerDate?: string;
}

export type SpiritualTradition =
  | 'Toutes'
  | 'Chrétienne'
  | 'Méditation & Contemplation'
  | 'Sagesse Universelle & Paix'
  | 'Prière Silencieuse & Recueillement';

export type PrayerCategory = 'Matin' | 'Midi' | 'Soir' | 'Ma journée' | 'Soirée' | 'Combat spirituel' | 'Guérison' | 'Action de grâce';

export interface Prayer {
  id: string;
  title: string;
  description: string;
  content: string;
  scriptureRef: string;
  scriptureText: string;
  category: PrayerCategory;
  tradition?: SpiritualTradition;
  date: string;
  audioDuration?: string;
  likesCount: number;
  readTime: string;
  author: string;
  isDailyFeatured?: boolean;
}

export interface SavedPrayer {
  id: string;
  userId: string;
  prayerId: string;
  savedAt: string;
}

export interface ResourceArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tradition?: SpiritualTradition;
  author: string;
  readTime: string;
  date: string;
  imageUrl?: string;
}

export interface ResourceVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl?: string;
  speaker: string;
  tradition?: SpiritualTradition;
  views: number;
}

export interface ResourceAudio {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  narrator: string;
  category: 'Méditation' | 'Enseignement spirituel' | 'Prières guidées' | 'Prédication';
  tradition?: SpiritualTradition;
}

export type CommunityCategory = 'Témoignages' | 'Questions' | 'Sujets de prière';

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole?: string;
  category: CommunityCategory;
  content: string;
  likesCount: number;
  likedByCurrentUser?: boolean;
  commentsCount: number;
  comments: CommunityComment[];
  createdAt: string;
  isReported?: boolean;
  status: 'published' | 'hidden' | 'flagged';
}

export interface SubscriptionPlan {
  id: 'free' | 'monthly' | 'annual';
  name: string;
  price: number;
  interval: 'mois' | 'an' | 'gratuit';
  description: string;
  badge?: string;
  features: string[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: 'free' | 'monthly' | 'annual';
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  nextRenewalDate: string;
  amount: number;
  paymentMethod: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  paymentMethod: 'Carte bancaire' | 'PayPal' | 'Orange Money / Wave';
  date: string;
  invoiceNumber: string;
}

export interface WhatsAppSubscription {
  id: string;
  userId?: string;
  phone: string;
  name: string;
  dailyPrayerOptIn: boolean;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface EmailSubscription {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  frequency: 'daily' | 'weekly';
}

export interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  recipientCount: number;
  sentAt: string;
  status: 'sent' | 'scheduled' | 'draft';
  openRate?: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  replied: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'prayer' | 'community' | 'subscription' | 'system';
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}
