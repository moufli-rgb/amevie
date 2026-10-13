import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserProfile,
  Prayer,
  ResourceArticle,
  ResourceVideo,
  ResourceAudio,
  CommunityPost,
  SubscriptionPlan,
  UserSubscription,
  PaymentTransaction,
  NotificationItem,
  AdminLog,
  EmailCampaign,
  WhatsAppSubscription,
  EmailSubscription,
  ContactMessage,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_USER_PROFILE,
  INITIAL_PRAYERS,
  INITIAL_ARTICLES,
  INITIAL_VIDEOS,
  INITIAL_AUDIOS,
  INITIAL_COMMUNITY_POSTS,
  SUBSCRIPTION_PLANS,
  INITIAL_USER_SUBSCRIPTION,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADMIN_LOGS,
  INITIAL_EMAIL_CAMPAIGNS,
} from '../data/mockData';

export type PageRoute =
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'prayers'
  | 'resources'
  | 'community'
  | 'pricing'
  | 'connect'
  | 'profile'
  | 'settings'
  | 'about'
  | 'contact'
  | 'admin';

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface AppContextType {
  // Navigation & User
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  switchUserRole: (role: 'member' | 'admin') => void;
  users: User[];
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;

  // Prayers
  prayers: Prayer[];
  savedPrayerIds: string[];
  activePrayerModal: Prayer | null;
  setActivePrayerModal: (prayer: Prayer | null) => void;
  toggleSavePrayer: (prayerId: string) => void;
  toggleLikePrayer: (prayerId: string) => void;
  createPrayer: (prayer: Omit<Prayer, 'id' | 'likesCount'>) => void;
  updatePrayer: (id: string, prayer: Partial<Prayer>) => void;
  deletePrayer: (id: string) => void;

  // Resources
  articles: ResourceArticle[];
  createArticle: (article: Omit<ResourceArticle, 'id'>) => void;
  deleteArticle: (id: string) => void;
  videos: ResourceVideo[];
  createVideo: (video: Omit<ResourceVideo, 'id'>) => void;
  deleteVideo: (id: string) => void;
  audios: ResourceAudio[];
  createAudio: (audio: Omit<ResourceAudio, 'id'>) => void;
  deleteAudio: (id: string) => void;

  // Community
  communityPosts: CommunityPost[];
  createCommunityPost: (content: string, category: 'Témoignages' | 'Questions' | 'Sujets de prière') => void;
  toggleLikePost: (postId: string) => void;
  addCommentToPost: (postId: string, content: string) => void;
  reportPost: (postId: string) => void;
  moderatePost: (postId: string, status: 'published' | 'hidden' | 'flagged') => void;
  deletePost: (postId: string) => void;

  // Subscriptions & Payments
  plans: SubscriptionPlan[];
  userSubscription: UserSubscription;
  payments: PaymentTransaction[];
  paymentModal: { isOpen: boolean; plan: SubscriptionPlan | null };
  openPaymentModal: (plan: SubscriptionPlan) => void;
  closePaymentModal: () => void;
  processSubscription: (planId: 'free' | 'monthly' | 'annual', method: 'Carte bancaire' | 'PayPal' | 'Orange Money / Wave') => void;

  // Connect (WhatsApp & Email)
  whatsappSubscriptions: WhatsAppSubscription[];
  emailSubscriptions: EmailSubscription[];
  subscribeWhatsApp: (phone: string, name: string) => boolean;
  subscribeEmail: (email: string) => boolean;

  // Contact
  contactMessages: ContactMessage[];
  sendContactMessage: (fullName: string, email: string, subject: string, message: string) => void;
  markContactMessageRead: (id: string) => void;

  // Notifications & Admin Logs
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  adminLogs: AdminLog[];
  emailCampaigns: EmailCampaign[];
  createEmailCampaign: (title: string, subject: string) => void;

  // UI Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'ame_et_vie_data_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Page routing
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');

  // Users & profile
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return users.find((u) => u.id === 'u-1') || users[0];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  // Prayers
  const [prayers, setPrayers] = useState<Prayer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prayers`);
    return saved ? JSON.parse(saved) : INITIAL_PRAYERS;
  });

  const [savedPrayerIds, setSavedPrayerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_saved_prayers`);
    return saved ? JSON.parse(saved) : ['p-1', 'p-5'];
  });

  const [activePrayerModal, setActivePrayerModal] = useState<Prayer | null>(null);

  // Resources
  const [articles, setArticles] = useState<ResourceArticle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_articles`);
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const [videos, setVideos] = useState<ResourceVideo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_videos`);
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });

  const [audios, setAudios] = useState<ResourceAudio[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audios`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIOS;
  });

  // Community
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_posts`);
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
  });

  // Subscriptions & payments
  const [plans] = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS);

  const [userSubscription, setUserSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sub`);
    return saved ? JSON.parse(saved) : INITIAL_USER_SUBSCRIPTION;
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    plan: SubscriptionPlan | null;
  }>({
    isOpen: false,
    plan: null,
  });

  // Connect
  const [whatsappSubscriptions, setWhatsappSubscriptions] = useState<WhatsAppSubscription[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_wa`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'wa-1',
            userId: 'u-1',
            phone: '+229 01 23 45 67',
            name: 'Marie Dupont',
            dailyPrayerOptIn: true,
            subscribedAt: '2026-09-14',
            status: 'active',
          },
        ];
  });

  const [emailSubscriptions, setEmailSubscriptions] = useState<EmailSubscription[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_email_sub`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'es-1',
            email: 'marie@ameetvie.com',
            name: 'Marie Dupont',
            subscribedAt: '2026-09-14',
            status: 'active',
            frequency: 'daily',
          },
        ];
  });

  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_campaigns`);
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_CAMPAIGNS;
  });

  // Contact messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contacts`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'cm-1',
            fullName: 'Emmanuel Kouassi',
            email: 'emmanuel@gmail.com',
            subject: 'Demande de prière pour ma famille',
            message: 'Bonjour, je vous écris pour solliciter un accompagnement spirituel et une prière pour la réconciliation dans mon foyer.',
            createdAt: '2026-10-11 14:30',
            isRead: false,
            replied: false,
          },
        ];
  });

  // Notifications & logs
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_LOGS;
  });

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(userProfile));
      localStorage.setItem(`${STORAGE_KEY}_prayers`, JSON.stringify(prayers));
      localStorage.setItem(`${STORAGE_KEY}_saved_prayers`, JSON.stringify(savedPrayerIds));
      localStorage.setItem(`${STORAGE_KEY}_articles`, JSON.stringify(articles));
      localStorage.setItem(`${STORAGE_KEY}_videos`, JSON.stringify(videos));
      localStorage.setItem(`${STORAGE_KEY}_audios`, JSON.stringify(audios));
      localStorage.setItem(`${STORAGE_KEY}_posts`, JSON.stringify(communityPosts));
      localStorage.setItem(`${STORAGE_KEY}_sub`, JSON.stringify(userSubscription));
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${STORAGE_KEY}_wa`, JSON.stringify(whatsappSubscriptions));
      localStorage.setItem(`${STORAGE_KEY}_email_sub`, JSON.stringify(emailSubscriptions));
      localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(emailCampaigns));
      localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(contactMessages));
      localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(adminLogs));
    } catch {
      // ignore
    }
  }, [
    users,
    userProfile,
    prayers,
    savedPrayerIds,
    articles,
    videos,
    audios,
    communityPosts,
    userSubscription,
    payments,
    whatsappSubscriptions,
    emailSubscriptions,
    emailCampaigns,
    contactMessages,
    notifications,
    adminLogs,
  ]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAdminAction = (action: string, target: string, details: string) => {
    const newLog: AdminLog = {
      id: `log-${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.name || 'Administrateur',
      action,
      target,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setAdminLogs((prev) => [newLog, ...prev]);
  };

  // Switch between member Marie Dupont and Guide Jean (Fondateur & Responsable de la communauté)
  const switchUserRole = (role: 'member' | 'admin') => {
    if (role === 'admin') {
      const admin = users.find((u) => u.role === 'admin') || users[1];
      setCurrentUser(admin);
      showToast(`Connecté en tant que Guide Jean · Fondateur & Responsable de la communauté`, 'info');
    } else {
      const member = users.find((u) => u.role === 'member') || users[0];
      setCurrentUser(member);
      showToast(`Connecté en tant que membre (${member.name})`, 'info');
    }
  };

  const updateUserProfile = (newProfile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...newProfile }));
    showToast('Profil mis à jour avec succès');
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    logAdminAction('UPDATE_USER_STATUS', `User ${userId}`, `Statut changé à ${status}`);
    showToast(`Statut utilisateur mis à jour (${status})`);
  };

  // Prayer actions
  const toggleSavePrayer = (prayerId: string) => {
    setSavedPrayerIds((prev) => {
      const isSaved = prev.includes(prayerId);
      const next = isSaved ? prev.filter((id) => id !== prayerId) : [...prev, prayerId];
      showToast(isSaved ? 'Prière retirée des enregistrements' : 'Prière enregistrée dans votre profil');
      return next;
    });
  };

  const toggleLikePrayer = (prayerId: string) => {
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === prayerId ? { ...p, likesCount: p.likesCount + 1 } : p
      )
    );
    showToast('Votre coeur d\'encouragement a été ajouté');
  };

  const createPrayer = (newPrayerData: Omit<Prayer, 'id' | 'likesCount'>) => {
    const newPrayer: Prayer = {
      ...newPrayerData,
      id: `p-${Date.now()}`,
      likesCount: 0,
    };
    setPrayers((prev) => [newPrayer, ...prev]);
    logAdminAction('CREATE_PRAYER', newPrayer.title, `Catégorie: ${newPrayer.category}`);
    showToast('Prière publiée avec succès !');
  };

  const updatePrayer = (id: string, updated: Partial<Prayer>) => {
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    logAdminAction('UPDATE_PRAYER', `Prière #${id}`, 'Mise à jour des informations de prière');
    showToast('Prière modifiée avec succès');
  };

  const deletePrayer = (id: string) => {
    setPrayers((prev) => prev.filter((p) => p.id !== id));
    logAdminAction('DELETE_PRAYER', `Prière #${id}`, 'Suppression définitive');
    showToast('Prière supprimée');
  };

  // Resources actions
  const createArticle = (articleData: Omit<ResourceArticle, 'id'>) => {
    const article: ResourceArticle = {
      ...articleData,
      id: `art-${Date.now()}`,
    };
    setArticles((prev) => [article, ...prev]);
    logAdminAction('CREATE_ARTICLE', article.title, 'Nouvel article spirituel');
    showToast('Article spirituel créé avec succès');
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    logAdminAction('DELETE_ARTICLE', `Article #${id}`, 'Suppression de l\'article');
    showToast('Article supprimé');
  };

  const createVideo = (videoData: Omit<ResourceVideo, 'id'>) => {
    const video: ResourceVideo = {
      ...videoData,
      id: `vid-${Date.now()}`,
    };
    setVideos((prev) => [video, ...prev]);
    logAdminAction('CREATE_VIDEO', video.title, 'Nouvelle vidéo');
    showToast('Vidéo ajoutée');
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    logAdminAction('DELETE_VIDEO', `Vidéo #${id}`, 'Suppression de la vidéo');
    showToast('Vidéo supprimée');
  };

  const createAudio = (audioData: Omit<ResourceAudio, 'id'>) => {
    const audio: ResourceAudio = {
      ...audioData,
      id: `aud-${Date.now()}`,
    };
    setAudios((prev) => [audio, ...prev]);
    logAdminAction('CREATE_AUDIO', audio.title, 'Nouvel enregistrement audio');
    showToast('Audio ajouté');
  };

  const deleteAudio = (id: string) => {
    setAudios((prev) => prev.filter((a) => a.id !== id));
    logAdminAction('DELETE_AUDIO', `Audio #${id}`, 'Suppression de l\'audio');
    showToast('Audio supprimé');
  };

  // Community actions
  const createCommunityPost = (
    content: string,
    category: 'Témoignages' | 'Questions' | 'Sujets de prière'
  ) => {
    if (!currentUser) {
      showToast('Veuillez vous connecter pour publier', 'error');
      return;
    }
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      category,
      content,
      likesCount: 1,
      likedByCurrentUser: true,
      commentsCount: 0,
      comments: [],
      createdAt: 'À l\'instant',
      status: 'published',
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
    showToast('Votre message a été partagé avec la communauté !');
  };

  const toggleLikePost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !!post.likedByCurrentUser;
          return {
            ...post,
            likedByCurrentUser: !isLiked,
            likesCount: isLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1,
          };
        }
        return post;
      })
    );
  };

  const addCommentToPost = (postId: string, content: string) => {
    if (!currentUser) {
      showToast('Veuillez vous connecter pour commenter', 'error');
      return;
    }
    const comment = {
      id: `c-${Date.now()}`,
      postId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      content,
      createdAt: 'À l\'instant',
    };
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              commentsCount: p.commentsCount + 1,
              comments: [...p.comments, comment],
            }
          : p
      )
    );
    showToast('Votre commentaire a été publié');
  };

  const reportPost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isReported: true } : p))
    );
    showToast('Signalement transmis aux modérateurs. Merci de veiller sur la communauté.', 'info');
  };

  const moderatePost = (postId: string, status: 'published' | 'hidden' | 'flagged') => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status, isReported: false } : p))
    );
    logAdminAction('MODERATE_POST', `Post #${postId}`, `Statut défini sur ${status}`);
    showToast(`Publication ${status === 'published' ? 'approuvée' : 'masquée'}`);
  };

  const deletePost = (postId: string) => {
    setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
    logAdminAction('DELETE_POST', `Post #${postId}`, 'Suppression définitive par admin');
    showToast('Publication supprimée');
  };

  // Payment & subscription
  const openPaymentModal = (plan: SubscriptionPlan) => {
    setPaymentModal({ isOpen: true, plan });
  };

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, plan: null });
  };

  const processSubscription = (
    planId: 'free' | 'monthly' | 'annual',
    method: 'Carte bancaire' | 'PayPal' | 'Orange Money / Wave'
  ) => {
    const plan = plans.find((p) => p.id === planId) || plans[1];
    const newSub: UserSubscription = {
      id: `sub-${Date.now()}`,
      userId: currentUser?.id || 'u-1',
      planId,
      planName: plan.name,
      status: 'active',
      startDate: new Date().toLocaleDateString('fr-FR'),
      nextRenewalDate:
        planId === 'annual'
          ? '12/10/2027'
          : planId === 'monthly'
          ? '12/11/2026'
          : 'Permanent',
      amount: plan.price,
      paymentMethod: method,
    };
    setUserSubscription(newSub);

    if (plan.price > 0) {
      const transaction: PaymentTransaction = {
        id: `pay-${Date.now()}`,
        userId: currentUser?.id || 'u-1',
        userName: currentUser?.name || 'Marie Dupont',
        amount: plan.price,
        currency: 'EUR',
        status: 'success',
        paymentMethod: method,
        date: new Date().toLocaleDateString('fr-FR'),
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      };
      setPayments((prev) => [transaction, ...prev]);
    }

    closePaymentModal();
    showToast(`Félicitations ! Vous êtes désormais abonné au plan ${plan.name} 🎉`);
  };

  // WhatsApp & Email subscriptions
  const subscribeWhatsApp = (phone: string, name: string): boolean => {
    if (!phone || phone.length < 6) {
      showToast('Veuillez saisir un numéro de téléphone valide', 'error');
      return false;
    }
    const newWa: WhatsAppSubscription = {
      id: `wa-${Date.now()}`,
      userId: currentUser?.id,
      phone,
      name: name || currentUser?.name || 'Membre Âme & Vie',
      dailyPrayerOptIn: true,
      subscribedAt: new Date().toISOString().slice(0, 10),
      status: 'active',
    };
    setWhatsappSubscriptions((prev) => [newWa, ...prev]);
    showToast('Votre inscription à la communauté WhatsApp est confirmée ! Vous recevrez la prière de demain matin.');
    return true;
  };

  const subscribeEmail = (email: string): boolean => {
    if (!email || !email.includes('@')) {
      showToast('Veuillez entrer une adresse email valide', 'error');
      return false;
    }
    const newSub: EmailSubscription = {
      id: `es-${Date.now()}`,
      email,
      name: currentUser?.name,
      subscribedAt: new Date().toISOString().slice(0, 10),
      status: 'active',
      frequency: 'daily',
    };
    setEmailSubscriptions((prev) => [newSub, ...prev]);
    showToast('Bienvenue ! Vous êtes bien inscrit(e) à notre newsletter quotidienne.');
    return true;
  };

  // Contact
  const sendContactMessage = (
    fullName: string,
    email: string,
    subject: string,
    message: string
  ) => {
    const newMessage: ContactMessage = {
      id: `cm-${Date.now()}`,
      fullName,
      email,
      subject,
      message,
      createdAt: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      replied: false,
    };
    setContactMessages((prev) => [newMessage, ...prev]);
    showToast('Votre message a bien été envoyé. Notre équipe vous répondra très rapidement.');
  };

  const markContactMessageRead = (id: string) => {
    setContactMessages((prev) =>
      prev.map((cm) => (cm.id === id ? { ...cm, isRead: true } : cm))
    );
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Toutes les notifications sont marquées comme lues');
  };

  const createEmailCampaign = (title: string, subject: string) => {
    const campaign: EmailCampaign = {
      id: `camp-${Date.now()}`,
      title,
      subject,
      recipientCount: emailSubscriptions.length + 2400,
      sentAt: new Date().toISOString().slice(0, 10),
      status: 'sent',
      openRate: '71.5%',
    };
    setEmailCampaigns((prev) => [campaign, ...prev]);
    logAdminAction('SEND_EMAIL_CAMPAIGN', title, `Sujet: "${subject}" envoyé à ${campaign.recipientCount} destinataires`);
    showToast('Campagne email envoyée avec succès !');
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        currentUser,
        setCurrentUser,
        userProfile,
        updateUserProfile,
        switchUserRole,
        users,
        updateUserStatus,

        prayers,
        savedPrayerIds,
        activePrayerModal,
        setActivePrayerModal,
        toggleSavePrayer,
        toggleLikePrayer,
        createPrayer,
        updatePrayer,
        deletePrayer,

        articles,
        createArticle,
        deleteArticle,
        videos,
        createVideo,
        deleteVideo,
        audios,
        createAudio,
        deleteAudio,

        communityPosts,
        createCommunityPost,
        toggleLikePost,
        addCommentToPost,
        reportPost,
        moderatePost,
        deletePost,

        plans,
        userSubscription,
        payments,
        paymentModal,
        openPaymentModal,
        closePaymentModal,
        processSubscription,

        whatsappSubscriptions,
        emailSubscriptions,
        subscribeWhatsApp,
        subscribeEmail,

        contactMessages,
        sendContactMessage,
        markContactMessageRead,

        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        adminLogs,
        emailCampaigns,
        createEmailCampaign,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
