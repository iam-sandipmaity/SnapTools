import { ImageResponse } from '@vercel/og';

export const config = {
    runtime: 'edge',
};

export default async function (req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // Get parameters
        const title = searchParams.get('title') || 'SnapTools';
        const description = searchParams.get('description') || 'Free Online Professional Tools Collection';
        const categoryId = searchParams.get('category') || 'miscellaneous';
        const iconName = searchParams.get('icon') || 'wrench';

        // Gradients based on category
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
        };

        const gradient = categoryGradients[categoryId] || categoryGradients.miscellaneous;

        // Fetch icon from Lucide static CDN
        const iconUrl = `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${iconName}.svg`;
        const iconSvgResponse = await fetch(iconUrl);
        let iconDataUrl = '';

        if (iconSvgResponse.ok) {
            let iconSvg = await iconSvgResponse.text();
            // Replace stroke color with white
            iconSvg = iconSvg.replace(/stroke="currentColor"/g, 'stroke="white"');
            iconDataUrl = `data:image/svg+xml;base64,${btoa(iconSvg)}`;
        }

        // Using object-based structure instead of JSX to avoid build/flag issues on Edge
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
                        fontFamily: 'Inter, sans-serif',
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
                                            style: { color: 'white', fontSize: '24px', fontWeight: 'bold', display: 'flex' },
                                            children: [
                                                'Snap',
                                                { type: 'span', props: { style: { color: '#3b82f6' }, children: 'Tools' } }
                                            ]
                                        }
                                    },
                                    {
                                        type: 'div',
                                        props: {
                                            style: { marginLeft: '12px', padding: '4px 12px', backgroundColor: '#ffffff10', borderRadius: '20px', color: '#ffffff60', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' },
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
                                    backgroundColor: '#ffffff02',
                                    border: '1px solid #ffffff08',
                                    borderRadius: '60px',
                                    padding: '80px',
                                    width: '900px',
                                    height: '450px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
                                                top: '-100px',
                                                right: '-100px',
                                                width: '400px',
                                                height: '400px',
                                                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                                                opacity: 0.1,
                                                filter: 'blur(100px)',
                                                borderRadius: '50%',
                                            }
                                        }
                                    },
                                    // Icon Container
                                    {
                                        type: 'div',
                                        props: {
                                            style: {
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '30px',
                                                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '40px',
                                                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
                                            },
                                            children: iconDataUrl ? [
                                                {
                                                    type: 'img',
                                                    props: {
                                                        src: iconDataUrl,
                                                        style: { width: '50px', height: '50px' }
                                                    }
                                                }
                                            ] : [
                                                { type: 'div', props: { style: { color: 'white', fontSize: '40px' }, children: '🛠️' } }
                                            ]
                                        }
                                    },
                                    // Content
                                    {
                                        type: 'div',
                                        props: {
                                            style: { display: 'flex', flexDirection: 'column', gap: '16px' },
                                            children: [
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { fontSize: '64px', fontWeight: '900', color: 'white', letterSpacing: '-0.05em', lineHeight: '1' },
                                                        children: title
                                                    }
                                                },
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { fontSize: '28px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '700px', lineHeight: '1.4', fontWeight: '500' },
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
                                                        style: { color: 'rgba(255, 255, 255, 0.3)', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' },
                                                        children: '100% Free • Secure • Privacy-First'
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
                                style: { position: 'absolute', bottom: '40px', color: 'rgba(255, 255, 255, 0.2)', fontSize: '18px', fontWeight: '500' },
                                children: 'snaptools.xyz'
                            }
                        }
                    ]
                }
            } as any,
            { width: 1200, height: 630 }
        );
    } catch (e: any) {
        return new Response(`Failed to generate the image`, { status: 500 });
    }
}
