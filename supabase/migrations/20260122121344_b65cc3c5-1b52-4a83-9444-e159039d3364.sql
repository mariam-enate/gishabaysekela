-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'member',
    UNIQUE (user_id, role)
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    screenshot_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'member');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" 
    ON public.profiles FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id);

-- User roles RLS policies (users can view their own roles, admins can view all)
CREATE POLICY "Users can view their own roles" 
    ON public.user_roles FOR SELECT 
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

-- Payments RLS policies
CREATE POLICY "Users can view their own payments" 
    ON public.payments FOR SELECT 
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert their own payments" 
    ON public.payments FOR INSERT 
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending payments" 
    ON public.payments FOR UPDATE 
    TO authenticated
    USING (
        (user_id = auth.uid() AND status = 'pending') 
        OR public.is_admin()
    );

-- Chat messages RLS policies
CREATE POLICY "Authenticated users can view all messages" 
    ON public.chat_messages FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert messages" 
    ON public.chat_messages FOR INSERT 
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Storage policies for receipts
CREATE POLICY "Users can upload their own receipts"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own receipts"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'receipts' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));

-- Create index for better query performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);