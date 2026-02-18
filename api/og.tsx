import { ImageResponse } from '@vercel/og';

export const config = {
    runtime: 'edge',
};

// Types for Satori/Vercel OG object structure
type OGElement = {
    type: string;
    props: {
        style?: Record<string, any>;
        children?: string | (OGElement | string | null)[];
        src?: string;
    };
};

export default async function (req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // Get parameters
        const title = searchParams.get('title') || 'SnapTools';
        const description = searchParams.get('description') || 'Free Online Professional Tools Collection';
        const categoryId = searchParams.get('category') || 'miscellaneous';
        const iconName = searchParams.get('icon') || 'wrench';

        // Comprehensive gradients based on categories in tools.ts
        const categoryGradients: Record<string, { from: string; to: string }> = {
            image: { from: '#06b6d4', to: '#3b82f6' },
            pdf: { from: '#f43f5e', to: '#fb923c' },
            calculator: { from: '#10b981', to: '#06b6d4' },
            conversion: { from: '#f59e0b', to: '#ef4444' },
            code: { from: '#8b5cf6', to: '#6366f1' },
            qr: { from: '#f59e0b', to: '#ef4444' },
            password: { from: '#ec4899', to: '#f43f5e' },
            color: { from: '#d946ef', to: '#8b5cf6' },
            unit: { from: '#3b82f6', to: '#06b6d4' },
            currency: { from: '#10b981', to: '#3b82f6' },
            social: { from: '#ef4444', to: '#f59e0b' },
            seoandweb: { from: '#6366f1', to: '#8b5cf6' },
            miscellaneous: { from: '#8b5cf6', to: '#d946ef' },
            encryption: { from: '#f59e0b', to: '#ef4444' },
            clock: { from: '#8b5cf6', to: '#d946ef' },
            file: { from: '#6366f1', to: '#8b5cf6' },
            internet: { from: '#3b82f6', to: '#06b6d4' },
            markdown: { from: '#10b981', to: '#3b82f6' },
            text: { from: '#3b82f6', to: '#06b6d4' },
            network: { from: '#8b5cf6', to: '#6366f1' },
            finance: { from: '#10b981', to: '#3b82f6' },
            datetime: { from: '#f59e0b', to: '#ef4444' },
            media: { from: '#f43f5e', to: '#fb923c' },
            data: { from: '#3b82f6', to: '#06b6d4' },
            link: { from: '#10b981', to: '#3b82f6' },
            random: { from: '#f59e0b', to: '#ef4444' },
            health: { from: '#f43f5e', to: '#fb923c' },
            business: { from: '#8b5cf6', to: '#6366f1' },
            ai: { from: '#3b82f6', to: '#06b6d4' },
            blockchain: { from: '#f59e0b', to: '#ef4444' },
            privacy: { from: '#10b981', to: '#3b82f6' }
        };

        const gradient = categoryGradients[categoryId] || categoryGradients.miscellaneous;

        // Fetch icon from Lucide static CDN
        let iconDataUrl = '';
        try {
            const iconUrl = `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${iconName}.svg`;
            const iconSvgResponse = await fetch(iconUrl);

            if (iconSvgResponse.ok) {
                let iconSvg = await iconSvgResponse.text();
                // Replace stroke color with white
                iconSvg = iconSvg.replace(/stroke="currentColor"/g, 'stroke="white"');
                // Standard base64 encoding (SVGs are usually ASCII-safe)
                // Avoid unescape/encodeURIComponent as they can be problematic in Edge
                iconDataUrl = `data:image/svg+xml;base64,${btoa(iconSvg)}`;
            }
        } catch (e) {
            console.error('Failed to fetch icon:', e);
            // Will fallback to emoji in the render
        }

        // Using object-based structure (Satori-compatible)
        return new ImageResponse(
            {
                type: 'div',
                props: {
                    style: {
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#09090b',
                        backgroundImage: 'radial-gradient(circle at 50% 10%, #18181b 0%, #09090b 100%)',
                        padding: '40px',
                    },
                    children: [
                        // Logo top left
                        {
                            type: 'div',
                            props: {
                                style: {
                                    position: 'absolute',
                                    top: '40px',
                                    left: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                },
                                children: [
                                    {
                                        type: 'div',
                                        props: {
                                            style: { color: 'white', fontSize: '28px', fontWeight: 'bold', display: 'flex' },
                                            children: [
                                                'Snap',
                                                { type: 'span', props: { style: { color: '#3b82f6' }, children: 'Tools' } }
                                            ]
                                        }
                                    },
                                    {
                                        type: 'div',
                                        props: {
                                            style: { marginLeft: '16px', padding: '4px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' },
                                            children: 'Professional Suite'
                                        }
                                    }
                                ]
                            }
                        },
                        // Main Card
                        {
                            type: 'div',
                            props: {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '40px',
                                    padding: '80px',
                                    width: '1000px',
                                    height: '480px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                },
                                children: [
                                    // Background Accent
                                    {
                                        type: 'div',
                                        props: {
                                            style: {
                                                position: 'absolute',
                                                top: '-150px',
                                                right: '-150px',
                                                width: '500px',
                                                height: '500px',
                                                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                                                opacity: 0.15,
                                                borderRadius: '50%',
                                                filter: 'blur(80px)',
                                            }
                                        }
                                    },
                                    // Icon Container
                                    {
                                        type: 'div',
                                        props: {
                                            style: {
                                                width: '110px',
                                                height: '110px',
                                                borderRadius: '28px',
                                                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '40px',
                                                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                                            },
                                            children: iconDataUrl ? [
                                                {
                                                    type: 'img',
                                                    props: {
                                                        src: iconDataUrl,
                                                        style: { width: '56px', height: '56px' }
                                                    }
                                                }
                                            ] : [
                                                { type: 'div', props: { style: { fontSize: '50px' }, children: '🛠️' } }
                                            ]
                                        }
                                    },
                                    // Content
                                    {
                                        type: 'div',
                                        props: {
                                            style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                                            children: [
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { fontSize: '72px', fontWeight: '900', color: 'white', letterSpacing: '-0.04em', lineHeight: '1.1' },
                                                        children: title
                                                    }
                                                },
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { fontSize: '32px', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '800px', lineHeight: '1.4', fontWeight: '400' },
                                                        children: description
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    // Bottom Info
                                    {
                                        type: 'div',
                                        props: {
                                            style: { position: 'absolute', bottom: '60px', right: '80px', display: 'flex' },
                                            children: [
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { color: 'rgba(255, 255, 255, 0.25)', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '3px' },
                                                        children: '100% Free • Secure • No Ads'
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        // Footer URL
                        {
                            type: 'div',
                            props: {
                                style: { position: 'absolute', bottom: '40px', color: 'rgba(255, 255, 255, 0.2)', fontSize: '20px', fontWeight: '500', letterSpacing: '1px' },
                                children: 'snaptools.xyz'
                            }
                        }
                    ]
                }
            } as any,
            { width: 1200, height: 630 }
        );
    } catch (e: any) {
        console.error('OG Image Generation Error:', e);
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}

