import sigiriyaImg from '../assets/destinations/sigiriya.png';
import ellaImg from '../assets/destinations/ella.png';
import mirissaImg from '../assets/destinations/mirissa.png';
import kandyImg from '../assets/destinations/kandy.png';
import galleImg from '../assets/destinations/galle.png';
import yalaImg from '../assets/destinations/yala.png';
import nuwaraEliyaImg from '../assets/destinations/nuwara-eliya.png';
import arugamBayImg from '../assets/destinations/arugam-bay.jpg';
import bentotaImg from '../assets/destinations/bentota.png';
import hikkaduwaImg from '../assets/destinations/hikkaduwa.png';
import anuradhapuraImg from '../assets/destinations/anuradhapura.png';
import polonnaruwaImg from '../assets/destinations/polonnaruwa.png';
import hortonPlainsImg from '../assets/destinations/horton-plains.png';
import udawalaweImg from '../assets/destinations/udawalawe.png';
import adamsPeakImg from '../assets/destinations/adams-peak.png';

const imageLookup: Record<string, string> = {
  'sigiriya': sigiriyaImg,
  'ella': ellaImg,
  'mirissa': mirissaImg,
  'kandy': kandyImg,
  'galle': galleImg,
  'yala': yalaImg,
  'nuwara-eliya': nuwaraEliyaImg,
  'arugam-bay': arugamBayImg,
  'bentota': bentotaImg,
  'hikkaduwa': hikkaduwaImg,
  'anuradhapura': anuradhapuraImg,
  'polonnaruwa': polonnaruwaImg,
  'horton-plains': hortonPlainsImg,
  'udawalawe': udawalaweImg,
  'adams-peak': adamsPeakImg,
};

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

export const resolveImageUrl = (urlOrPath: string): string => {
  if (!urlOrPath) return '';
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://') || urlOrPath.startsWith('data:')) {
    return urlOrPath;
  }
  if (urlOrPath.startsWith('/uploads/')) {
    return `${API_URL}${urlOrPath}`;
  }
  return urlOrPath;
};

export const getDestinationImage = (pathOrKey: string): string => {
  if (!pathOrKey) return sigiriyaImg;
  
  if (pathOrKey.startsWith('/') || pathOrKey.startsWith('http://') || pathOrKey.startsWith('https://')) {
    return resolveImageUrl(pathOrKey);
  }

  const normalized = pathOrKey.toLowerCase();
  for (const key of Object.keys(imageLookup)) {
    if (normalized.includes(key)) {
      return imageLookup[key];
    }
  }
  // If it's a relative/absolute path from destinations but doesn't match above, default fallback
  return sigiriyaImg;
};
