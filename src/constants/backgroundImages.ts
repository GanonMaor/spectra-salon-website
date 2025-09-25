export const BACKGROUND_IMAGES = {
  // התמונה החדשה שלך לדף הראשי
  yourCustomSalon:
    "https://static.showit.co/800/urJrB1F2QqWXp97Gk9z2WA/75110/bm_12.jpg",

  // סלונים מרשימים
  modernSalon:
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop",
  luxurySalon:
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2940&auto=format&fit=crop",
  elegantSalon:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2940&auto=format&fit=crop",

  // חדרי צבע וסלונים מקצועיים
  professionalSalon:
    "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2940&auto=format&fit=crop", // סלון מקצועי עם כיסאות
  colorStation:
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2940&auto=format&fit=crop", // תחנת צבע מקצועית

  // עולם צבעי השיער
  hairColorPalette:
    "https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=2940&auto=format&fit=crop",
  colorTubes:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2940&auto=format&fit=crop", // צבעי שיער מקצועיים

  // סלונים בוטיק
  boutiqueSalon:
    "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=2940&auto=format&fit=crop",
  minimalistSalon:
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=2940&auto=format&fit=crop", // סלון מינימליסטי
};

export const getRandomBackgroundImage = (): string => {
  const images = Object.values(BACKGROUND_IMAGES);
  return images[Math.floor(Math.random() * images.length)];
};
