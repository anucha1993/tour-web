import {
  Plane, Globe, Crown, BookOpen, Users, Ticket,
  Building2, Landmark, HardHat, GraduationCap, Heart, Handshake,
  MapPin, Star, Shield, Briefcase, Camera, Ship,
  Bus, Train, Mountain, Palmtree, Sun, Umbrella,
  Hotel, Utensils, Compass, Map, Flag, Award,
  Calendar, Clock, Phone, Mail, CreditCard, DollarSign,
  TrendingUp, Target, Zap, Gift, Gem, Sparkles,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Plane, Globe, Crown, BookOpen, Users, Ticket,
  Building2, Landmark, HardHat, GraduationCap, Heart, Handshake,
  MapPin, Star, Shield, Briefcase, Camera, Ship,
  Bus, Train, Mountain, Palmtree, Sun, Umbrella,
  Hotel, Utensils, Compass, Map, Flag, Award,
  Calendar, Clock, Phone, Mail, CreditCard, DollarSign,
  TrendingUp, Target, Zap, Gift, Gem, Sparkles,
};

export default function RenderIcon({ name, className }: { name: string; className?: string }) {
  const IconComp = ICON_MAP[name];
  if (!IconComp) return <span className={className}>{name}</span>;
  return <IconComp className={className} />;
}
