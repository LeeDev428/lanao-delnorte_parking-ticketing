import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ alt = 'Dakiri Logo', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/assets/img/dakiri-logo.png" alt={alt} {...props} />;
}
