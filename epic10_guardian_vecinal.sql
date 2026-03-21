-- 1. Actualizar tabla profiles con banderas de seguridad reales (no dependientes de localStorage)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT false;

-- 2. Crear tabla de Aprobaciones Vecinales (El Guardián)
CREATE TABLE IF NOT EXISTS public.neighbor_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(applicant_id, approver_id) -- Un mismo vecino solo puede votar una vez por solicitud
);

-- Habilitar RLS en neighbor_approvals
ALTER TABLE public.neighbor_approvals ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para neighbor_approvals
-- Un vecino puede ver las solicitudes donde él es el 'approver' o el 'applicant'
CREATE POLICY "Users can view their own approvals" 
ON public.neighbor_approvals FOR SELECT 
USING (auth.uid() = applicant_id OR auth.uid() = approver_id);

-- Solo el sistema (Service Role) o el mismo aplicante puede insertar peticiones
CREATE POLICY "Users can create approvals" 
ON public.neighbor_approvals FOR INSERT 
WITH CHECK (auth.uid() = applicant_id);

-- Solo el approver puede actualizar el status de su voto
CREATE POLICY "Approvers can update their votes" 
ON public.neighbor_approvals FOR UPDATE 
USING (auth.uid() = approver_id)
WITH CHECK (auth.uid() = approver_id);

-- 3. Crear tabla del Centro de Notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('APPROVAL_REQUEST', 'APPROVAL_GRANTED', 'CHAT_MESSAGE', 'OFFICIAL_ALERT')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    reference_id UUID, -- Puede apuntar a un chat, un item_id o una solicitud
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para Notificaciones
-- Solo puedes leer tus propias notificaciones
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Solo el sistema o triggers pueden insertar notificaciones, pero dejaremos abierto para que la app las escupa si es necesario
CREATE POLICY "Users can insert notifications for others" 
ON public.notifications FOR INSERT 
WITH CHECK (true); -- Permitimos insertar notificaciones desde el front para simplificar la beta, en prod debería ser vía API/Edge Functions

-- Puedes marcar tus notificaciones como leídas
CREATE POLICY "Users can update their notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Habilitar Realtime explícitamente para Notificaciones y Aprobaciones
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.neighbor_approvals;

-- Indexaciones para velocidad (Los vecinos verán rápido sus campanitas)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_applicant ON public.neighbor_approvals(applicant_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON public.neighbor_approvals(approver_id);
