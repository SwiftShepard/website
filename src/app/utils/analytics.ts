"use client";

// Types pour les événements d'analyse
export interface AnalyticsEvent {
  type: string;
  page: string;
  timestamp: number;
  data?: Record<string, any>;
}

// Classe de base pour le suivi analytique
export class Analytics {
  private static instance: Analytics;
  private events: AnalyticsEvent[] = [];
  private isInitialized = false;
  
  // Singleton pour assurer une seule instance
  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }
  
  // Initialisation du système d'analyse
  public init() {
    if (this.isInitialized) return;
    
    // Charger les événements depuis localStorage si disponibles
    try {
      const savedEvents = localStorage.getItem('site_analytics');
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
    
    // Ajouter des événements standards
    window.addEventListener('pageshow', () => this.trackPageView());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackEvent('page_exit', { timeSpent: this.getTimeOnPage() });
      } else {
        this.trackPageView();
      }
    });
    
    // Suivre les clics sur les éléments importants
    document.body.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Suivre les clics sur les liens
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a');
        if (link) {
          const href = (link as HTMLAnchorElement).getAttribute('href');
          this.trackEvent('link_click', { href });
        }
      }
      
      // Suivre les clics sur les boutons
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        if (button) {
          const id = button.id || 'unknown_button';
          const text = button.textContent || 'empty_text';
          this.trackEvent('button_click', { id, text });
        }
      }
    });
    
    this.isInitialized = true;
    console.log('Analytics initialized');
  }
  
  // Suivre un événement personnalisé
  public trackEvent(type: string, data: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      type,
      page: window.location.pathname,
      timestamp: Date.now(),
      data
    };
    
    this.events.push(event);
    this.saveEvents();
    
    console.log('Event tracked:', event);
  }
  
  // Suivre une vue de page
  private trackPageView() {
    this.trackEvent('page_view', {
      referrer: document.referrer,
      title: document.title
    });
  }
  
  // Calculer le temps passé sur la page
  private getTimeOnPage(): number {
    const pageViewEvents = this.events
      .filter(e => e.type === 'page_view' && e.page === window.location.pathname)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (pageViewEvents.length > 0) {
      return Date.now() - pageViewEvents[0].timestamp;
    }
    
    return 0;
  }
  
  // Sauvegarder les événements dans localStorage
  private saveEvents() {
    // Limiter à 1000 événements maximum pour ne pas surcharger localStorage
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    try {
      localStorage.setItem('site_analytics', JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }
  
  // Obtenir tous les événements (pour la page d'administration)
  public getAllEvents(): AnalyticsEvent[] {
    return [...this.events];
  }
  
  // Effacer tous les événements (pour la page d'administration)
  public clearEvents() {
    this.events = [];
    localStorage.removeItem('site_analytics');
  }
  
  // Obtenir des statistiques globales
  public getStats() {
    const pageViews = this.events.filter(e => e.type === 'page_view').length;
    const uniquePages = new Set(this.events.map(e => e.page)).size;
    const buttonClicks = this.events.filter(e => e.type === 'button_click').length;
    const linkClicks = this.events.filter(e => e.type === 'link_click').length;
    
    // Obtenir les 5 pages les plus visitées
    const pageViewCounts: Record<string, number> = {};
    this.events
      .filter(e => e.type === 'page_view')
      .forEach(e => {
        pageViewCounts[e.page] = (pageViewCounts[e.page] || 0) + 1;
      });
    
    const topPages = Object.entries(pageViewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      totalEvents: this.events.length,
      pageViews,
      uniquePages,
      buttonClicks,
      linkClicks,
      topPages
    };
  }
}

// Exporter une instance singleton
export const analytics = Analytics.getInstance();

// Initialiser au chargement de la page côté client uniquement
if (typeof window !== 'undefined') {
  analytics.init();
} 