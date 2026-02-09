-- 1. MUNICIPAL_SUBSCRIPTIONS (The Client)
CREATE TABLE public.municipal_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    muni_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    license_tier TEXT DEFAULT 'LITE' CHECK (license_tier IN ('LITE', 'PRO', 'ENTERPRISE')),
    active_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. GOVERNMENT_ADMINS (The Users of the Dashboard)
-- Linked to auth.users but strictly isolated from neighbor-neighbor content
CREATE TABLE public.government_admins (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    muni_id UUID REFERENCES public.municipal_subscriptions(id) NOT NULL,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'MUNICIPAL_OFFICIAL' CHECK (role IN ('ADMIN', 'MUNICIPAL_OFFICIAL', 'VIEWER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. OFFICIAL_ALERTS (The Megáfono)
-- Geofenced messages sent to neighbor feeds
CREATE TABLE public.official_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    muni_id UUID REFERENCES public.municipal_subscriptions(id) NOT NULL,
    issuer_id UUID REFERENCES public.government_admins(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_type TEXT DEFAULT 'INFO' CHECK (alert_type IN ('EMERGENCY', 'INFO', 'PUBLIC_SERVICE', 'EVENT')),
    -- Geography column for targeted geofencing (polygon or point + radius)
    zone_geometry JSONB, -- Or GEOMETRY if PostGIS is enabled
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. ACTIVITY_METADATA (For Heatmaps)
-- Strictly metadata: type and coordinates only, NO user_id or content linked
CREATE TABLE public.activity_heatmap (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) NOT NULL,
    activity_type TEXT NOT NULL, -- 'TRANS', 'ALRT', 'MSG'
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Privacy Protection: RLS Policy for Municipal Admins
-- Deny all access to items and chats by default for Muni roles
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Government admins can see reports but not private items" 
    ON public.items 
    FOR SELECT 
    USING (
        (type = 'CIVIC_REPORT')
        OR 
        (NOT EXISTS (SELECT 1 FROM public.government_admins WHERE id = auth.uid()))
    );

-- Official Alerts visibility for neighbors
ALTER TABLE public.official_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Neighbors can see official alerts" 
    ON public.official_alerts 
    FOR SELECT 
    USING (true); -- Filtered in-app by neighborhood bounding box or zone overlap
