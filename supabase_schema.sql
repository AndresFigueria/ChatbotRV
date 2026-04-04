-- Archivo Maestro para la Base de Datos del Restaurante en Supabase

-- 1. Tabla de Clientes (CRM)
CREATE TABLE public.customers (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    customer_code TEXT UNIQUE NOT NULL, -- ej. USR-8492
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    ltv NUMERIC DEFAULT 0.00,
    orders_count INTEGER DEFAULT 0,
    aov NUMERIC DEFAULT 0.00,
    favorite_dish TEXT DEFAULT 'Ninguno',
    dietary_notes TEXT DEFAULT 'Ninguna',
    last_order TIMESTAMP WITH TIME ZONE,
    last_rating INTEGER CHECK (last_rating >= 1 AND last_rating <= 5),
    status TEXT DEFAULT 'Nuevo', -- VIP, Regular, Nuevo, En Riesgo
    whatsapp_opt_in BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla del Menú (Inventario y Bot)
CREATE TABLE public.menu_items (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    item_code TEXT UNIQUE NOT NULL, -- ej. P-101
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    stock_status TEXT DEFAULT 'Disponible',
    keywords TEXT[] DEFAULT '{}', -- Array de palabras clave para WhatsApp
    sales_30d INTEGER DEFAULT 0,
    img_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Órdenes (Logística en vivo)
CREATE TABLE public.orders (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    order_code TEXT UNIQUE NOT NULL, -- ej. #9832
    customer_id UUID REFERENCES public.customers(id),
    items_count INTEGER NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pendiente', -- Pendiente, Preparando, Listo, Despachado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INSERCIÓN DE DATOS DE PRUEBA (Para ver todo lleno en tu frontend)

-- Insertar Clientes de Ejemplo
INSERT INTO public.customers (customer_code, name, phone, ltv, orders_count, aov, favorite_dish, dietary_notes, last_rating, status)
VALUES 
('USR-8492', 'Elena Rodríguez', '+593991234567', 1245.50, 42, 29.65, 'Tacos Al Pastor (x3)', 'Sin Cebolla', 5, 'VIP'),
('USR-8493', 'Carlos Mendoza', '+593987654321', 312.00, 8, 39.00, 'Ribeye 300g', 'Ninguna', 4, 'En Riesgo'),
('USR-8494', 'Ana Belén', '+593971112222', 18.50, 1, 18.50, 'Bowl Vegetariano', 'Vegano, Celiaco', NULL, 'Nuevo');

-- Insertar Menú de Ejemplo
INSERT INTO public.menu_items (item_code, name, category, price, stock_status, keywords, sales_30d, img_url, is_available)
VALUES 
('P-101', 'Hamburguesa Doble Smash', 'Principales', 8.50, 'Disponible', ARRAY['hamburguesa', 'promo burger', 'doble'], 342, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&h=200&fit=crop', true),
('P-103', 'Limonada de Coco', 'Bebidas', 3.00, 'Agotado', ARRAY['limonada', 'bebida', 'jugo coco'], 512, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=200&h=200&fit=crop', false);
