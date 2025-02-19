import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type Props = {
  slot: string;  // 広告ユニットID
  style?: React.CSSProperties;
  className?: string;
};

const GoogleAdsense: React.FC<Props> = ({ slot, style, className }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Adsense error:', err);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={style || { display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default GoogleAdsense; 