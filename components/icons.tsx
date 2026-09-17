import React from 'react';
import {
  Radio,
  Shield,
  Fingerprint,
  Lock,
  Unlock,
  Scan,
  Camera,
  MapPin,
  Plus,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  Copy,
  Share,
  Clock,
  Zap,
  Search,
  ArrowLeft,
  Send,
  Image as ImageIcon,
  RefreshCw,
  Wifi,
  WifiOff,
  Star,
  TrendingUp,
  type LucideProps
} from 'lucide-react';

export type IconProps = LucideProps & { size?: number; className?: string };

const createIcon = (IconComponent: React.ElementType) => {
  const WrappedIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <IconComponent size={size} className={className} {...props} />
  );
  WrappedIcon.displayName = 'WrappedIcon';
  return WrappedIcon;
};

export const RadarIcon = createIcon(Radio);
export const ActiveIcon = createIcon(Shield);
export const PassportIcon = createIcon(Fingerprint);
export const LockIcon = createIcon(Lock);
export const UnlockIcon = createIcon(Unlock);
export const ScanIcon = createIcon(Scan);
export const CameraIcon = createIcon(Camera);
export const MapPinIcon = createIcon(MapPin);
export const PlusIcon = createIcon(Plus);
export const ChevronRightIcon = createIcon(ChevronRight);
export const XIcon = createIcon(X);
export const CheckIcon = createIcon(Check);
export const AlertTriangleIcon = createIcon(AlertTriangle);
export const CopyIcon = createIcon(Copy);
export const ShareIcon = createIcon(Share);
export const ClockIcon = createIcon(Clock);
export const ZapIcon = createIcon(Zap);
export const SearchIcon = createIcon(Search);
export const ArrowLeftIcon = createIcon(ArrowLeft);
export const SendIcon = createIcon(Send);
// Name conflict with global Image
export const ImageIconComponent = createIcon(ImageIcon);
export const RefreshCwIcon = createIcon(RefreshCw);
export const WifiIcon = createIcon(Wifi);
export const WifiOffIcon = createIcon(WifiOff);
export const StarIcon = createIcon(Star);
export const TrendingUpIcon = createIcon(TrendingUp);
