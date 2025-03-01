import Script from 'next/script'

interface HotjarProps {
    hjid: string  // Hotjar ID
    hjsv: string  // Hotjar Snippet Version
}

export default function Hotjar({ hjid, hjsv }: HotjarProps) {
    return (
        <Script
            id="hotjar"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
                    (function(h,o,t,j,a,r){
                        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                        h._hjSettings={hjid:${hjid},hjsv:${hjsv}};
                        a=o.getElementsByTagName('head')[0];
                        r=o.createElement('script');r.async=1;
                        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                        a.appendChild(r);
                    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                `
            }}
        />
    )
} 